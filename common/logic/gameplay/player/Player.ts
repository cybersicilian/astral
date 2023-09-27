import Card from "../cards/Card";
import Deck from "../deck/Deck";
import {CardArgs} from "../cards/CardArgs";
import DeckList from "../deck/DeckList";
import {Rarity} from "../../structure/utils/CardEnums";
import Upgrade from "./systems/Upgrade";
import {IIdentifiable} from "../../structure/interfaces/IIdentifiable";
import {ChoiceType} from "../cards/choices/ChoiceType";
import {IProppable, Properties} from "../../structure/interfaces/IProppable";
import {EventCluster, IEventable} from "../../structure/interfaces/IEventable";
import {AbilityChoices} from "../cards/choices/AbilityChoices";
import Bot from "./bots/Bot";
import BotType from "./bots/BehaviorProfile";
import {Zone} from "../cards/Zone";
import {TurnInterrupt} from "../../structure/utils/TurnInterrupt";

//these shouldn't be here, but I'm too lazy to move them
export type CardState = {
    name: string,
    text: string,
    props: { [key: string]: string | number | boolean | object },
    power: number,
    rarity: Rarity,
    formula?: string[]
    playable?: boolean,
}
export type PlayerState = {
    name: string,
    cards: number,
    handsize: number,
    skipped: number,
    props: { [key: string]: string | number | boolean | object },
    turnsRemaining: number,
    canWin: boolean,
    you: boolean,
    host: boolean,
    order: number,
    winReason: string,
    interrupts: TurnInterrupt[]
}

export default class Player implements IIdentifiable, IProppable, IEventable {
    private name: string;
    private cards: Card[] = [];

    private skipped: number = 0;

    private props: Properties = {}
    private events: EventCluster = {}
    private turnPlacement: number = 0

    private turnsRemaining: number = 25
    private canWin: boolean = false
    private winReason: string = "cards in hand"

    private handSize: number = 10

    //server commands
    private bot: boolean = false
    private host: boolean = false

    private botProfile?: Bot = undefined

    private resolveBeforeTurn: TurnInterrupt[] = []


    private eventList: {
        [key: string]: {
            drawn: number,
            played: number,
            discarded: number,
            given: number,
            text: string
        }
    } = {}

    constructor(cards: number, deck: Deck) {
        this.name = Math.random().toString(36).substring(7);
        this.draw(deck, cards)

        this.setProp("meta_upgrade", [])
        this.addUpgrade(new Upgrade({
            name: "Take a Crap",
            description: "Take a bathroom break to draw a card.",
            cost: [{
                amt: 1,
                resource: "turns"
            }],
            locked: false
        }, (cardArgs) => {
            cardArgs.owner.draw(cardArgs.deck!, 1)
            cardArgs.deck.addCards(Deck.fromCardList(1, "poop_deck"))
        }, true, 1.5))


        this.addEvent("draw", (cardArgs) => {
            if (!cardArgs.card!) return
            if (!this.eventList[cardArgs.card!.getName()]) this.eventList[cardArgs.card!.getName()] = {
                drawn: 0,
                played: 0,
                discarded: 0,
                given: 0,
                text: ""
            }
            this.eventList[cardArgs.card!.getName()].drawn++
            this.eventList[cardArgs.card!.getName()].text = cardArgs.card!.getText()
        })
        this.addEvent("play", (cardArgs) => {
            if (!this.eventList[cardArgs.card!.getName()]) this.eventList[cardArgs.card!.getName()] = {
                drawn: 0,
                played: 0,
                discarded: 0,
                given: 0,
                text: ""
            }
            this.eventList[cardArgs.card!.getName()].played++
            this.eventList[cardArgs.card!.getName()].text = cardArgs.card!.getText()
            cardArgs.owner.addTurns(-1)
        })
        this.addEvent("discard", (cardArgs) => {
            if (!cardArgs.card!) return
            if (!this.eventList[cardArgs.card!.getName()]) this.eventList[cardArgs.card!.getName()] = {
                drawn: 0,
                played: 0,
                discarded: 0,
                given: 0,
                text: ""
            }
            this.eventList[cardArgs.card!.getName()].discarded++
            this.eventList[cardArgs.card!.getName()].text = cardArgs.card!.getText()
        })
        this.addEvent("give", (cardArgs) => {
            if (!this.eventList[cardArgs.card!.getName()]) this.eventList[cardArgs.card!.getName()] = {
                drawn: 0,
                played: 0,
                discarded: 0,
                given: 0,
                text: ""
            }
            this.eventList[cardArgs.card!.getName()].given++
            this.eventList[cardArgs.card!.getName()].text = cardArgs.card!.getText()
        })

        //add the life_change event at player creation to ensure zombie deck works right
        this.addEvent("res_life_change", (cardArgs) => {
            if (this.getProp("res_life") <= 0) {
                if (!cardArgs.deck) return
                if (!cardArgs.deck.props["added_zombie_deck"]) {
                    cardArgs.deck.addCards(Deck.fromCardList(45, "zombie_deck"))
                    cardArgs.deck.shuffle()
                    cardArgs.deck.props["added_zombie_deck"] = true
                }
            }
        })
    }

    addResource(key: string, amt: number) {
        if (key.startsWith("res_")) key = key.substring(4)
        if (!this.getProp(`res_${key}`)) this.setProp(`res_${key}`, 0)
        this.setProp(`res_${key}`, this.getProp(`res_${key}`) + amt)
    }

    upgrades() {
        return this.props["meta_upgrade"] as Upgrade[] || []
    }

    addUpgrade(u: Upgrade) {
        if (!this.props["meta_upgrade"]) this.props["meta_upgrade"] = []
        this.props["meta_upgrade"].push(u)
        this.fireEvents("new_upgrade", {owner: this, opps: [], deck: undefined, card: undefined})
    }

    setHost(host: boolean = true) {
        this.host = host
        return this
    }

    isHost() {
        return this.host
    }

    getResources() {
        //return all props that start with res, and their values
        let props: { [key: string]: any } = {}
        for (let key in this.props) {
            if (key.startsWith("res_")) {
                props[key.substring(4)] = this.props[key]
            }
        }
        props["turns"] = Infinity
        return props
    }

    getUIs() {
        return {
            marketplace: this.props["marketplace"] || false,
            gene_bank: this.props["gene_bank"] || false,
            casino: this.props["casino"] || false,
            upgrade: true, //this.props["upgrade"] || false,
        }
    }

    getRelevantProps() {
        //return all props that don't start with meta_
        let props: { [key: string]: any } = {}
        for (let key in this.props) {
            if (!key.startsWith("meta_")) {
                props[key] = this.props[key]
            }
        }
        return props
    }


    getPrivate(you: boolean = false): PlayerState {
        return {
            name: this.name,
            cards: this.cards.length,
            handsize: this.handSize,
            skipped: this.skipped,
            props: this.getRelevantProps(),
            turnsRemaining: this.turnsRemaining,
            canWin: this.canWin,
            winReason: this.winReason,
            host: this.host,
            you: you,
            order: this.turnPlacement,
            interrupts: this.resolveBeforeTurn
        }
    }

    getCards(opps: Player[], deck: Deck): CardState[] {
        return this.cards.map(x => ({
            name: x.getDisplayName(),
            text: x.getFormulatedText({
                owner: this,
                opps: opps,
                deck: deck,
                card: x
            }),
            rarity: x.getRarity(),
            power: x.pow(),
            formula: x.getFormulas(),
            props: x.getProps(),
            playable: x.canBePlayed({
                owner: this,
                opps: opps,
                deck: deck,
                card: x
            }),
        }))
    }

    setBot() {
        this.bot = true
        this.botProfile = new Bot(Object.keys(BotType)[Math.floor(Math.random() * Object.keys(BotType).length)])
        return this
    }

    isBot() {
        return this.bot
    }

    setName(name: string) {
        this.name = name
        return this
    }

    getCardStats() {
        return this.eventList
    }

    setTurnPlacement(turnPlacement: number) {
        this.turnPlacement = turnPlacement
        return this
    }

    getTurnPlacement() {
        return this.turnPlacement
    }

    getHandsize() {
        return this.handSize
    }

    getBotProfile() {
        return this.botProfile
    }

    addHandsize(mod: number) {
        this.handSize += mod
        return this
    }

    setHandsize(mod: number) {
        this.handSize = mod
        return this
    }

    propList() {
        return this.props
    }

    on(name: string, func: (VosEvent) => void) {
        this.addEvent(name, func)
        return this
    }

    addEvent(name: string, func: (cardArgs: CardArgs) => void) {
        if (!this.events[name]) this.events[name] = []
        this.events[name].push(func)
    }

    getWinReason() {
        return this.winReason
    }

    fireEvents(name: string, cardArgs: CardArgs) {
        if (this.events[name]) {
            for (let func of this.events[name]) {
                func(cardArgs)
            }
        }
        if (this.events[`temp_${name}`]) {
            for (let func of this.events[`temp_${name}`]) {
                func(cardArgs)
            }
            delete this.events[`temp_${name}`]
        }
    }

    addTurns(mod: number) {
        this.turnsRemaining += mod
        if (this.turnsRemaining <= 0) {
            this.setCanWin(true, "plodded across the finish line")
        }
        return this;
    }

    setTurns(mod: number) {
        this.turnsRemaining = mod
        return this
    }

    getTurns() {
        return this.turnsRemaining
    }

    rollDice() {
        //if you have the dice property, roll it
        if (this.getProp("dice")) {
            //choose a random value from it
            let dice = this.getProp("dice")
            let roll = dice[Math.floor(Math.random() * dice.length)]
            return roll;
        }
        return -1;
    }

    setCanWin(check: boolean, reason: string = "cards in hand") {
        this.canWin = check
        this.winReason = reason
        if (this.canWin) {
            this.fireEvents("can_win", {owner: this, opps: [], card: undefined, deck: undefined})
        }
        return this;
    }

    winCheck() {
        return this.canWin
    }

    setProp(key: string, value: any, cardArgs?: CardArgs) {
        this.props[key] = value
        if (cardArgs) {
            this.fireEvents(`${key}_change`, cardArgs)
        }
        return this
    }

    getProps() {
        return this.props
    }

    getProp(key: string) {
        return this.props[key] || 0
    }

    skip() {
        this.skipped++;
    }

    skipCheck() {
        if (this.skipped > 0) {
            this.skipped--;
            return true;
        }
        return false;
    }

    toPlayerState(): PlayerState {
        return {
            name: this.name,
            cards: this.cards.length,
            handsize: this.handSize,
            skipped: this.skipped,
            props: this.props,
            turnsRemaining: this.turnsRemaining,
            canWin: this.canWin,
            winReason: this.winReason,
            host: this.host,
            you: false,
            order: this.turnPlacement,
            interrupts: this.resolveBeforeTurn
        }
    }

    getLogText() {
        //todo: format this better
        return `§§${this.bot ? `<b>[${this.botProfile.getProfileName()}]</b> ` : ``}${this.host ? `<b>[HOST]</b> ` : ``}${this.name}§player§${JSON.stringify(this.toPlayerState())}§§`
    }

    getName() {
        return this.name
    }

    cih() {
        return this.cards
    }

    setCiH(cards: Card[]) {
        this.cards = cards
        return this
    }

    inHand() {
        return this.cards.length
    }

    turnStart(cardArgs: CardArgs) {
        //go over every card in your hand
        for (let card of this.cards) {
            //if it has a turn start ability, execute it
            card.fireEvents("turn_start", {...cardArgs, card: card})
        }
    }

    draw(deck: Deck, qty: number = 1) {
        let cards = deck.draw(qty)
        for (let c of cards) {
            if (!c) {
                continue;
            }
            c!.draw(this, [], deck!)
            this.fireEvents("draw", {
                owner: this,
                opps: [],
                deck: deck,
                card: c
            })
            if (qty >= 1) {
                this.cards = this.cards.concat(c!)
            }
        }
    }

    play(card: Card, opps: Player[], deck: Deck, choices?: (ChoiceType)[][]) {
        //remove it from the hand
        this.cards.splice(this.cards.indexOf(card), 1)
        if (!card.doSkipDiscard()) {
            deck.discardPile.push(card.setZone(Zone.DISCARD))
        } else {
            card.remove({
                card: card,
                deck: deck,
                owner: this,
                opps: opps
            })
        }
        card.play(this, opps, deck, choices)
        this.fireEvents("play", {
            owner: this,
            opps: opps,
            deck: deck,
            card: card
        })
    }

    give(card: Card, player: Player) {
        card.give(this, [player], undefined)
        this.fireEvents("give", {
            owner: this,
            opps: [],
            deck: undefined,
            card: card
        })
        player.cards.push(card)
        this.cards.splice(this.cards.indexOf(card), 1)
    }

    discard(card: Card, deck: Deck) {
        card.discard(this, [], deck)
        this.fireEvents("discard", {
            owner: this,
            opps: [],
            deck: deck,
            card: card
        })
        deck.discardPile.push(card.setZone(Zone.DISCARD))
        this.cards.splice(this.cards.indexOf(card), 1)
    }

    discardRandom(cardArgs: CardArgs) {
        let card = this.cih()[Math.floor(Math.random() * this.cih().length)]
        if (card) {
            this.discard(card, cardArgs.deck!)
        }
    }

    discardHand(cardArgs: CardArgs) {
        while (this.cih().length > 0) {
            this.discardRandom(cardArgs)
        }
    }

    discardChoose(cardArgs: CardArgs) {
        //TODO: allow player choice
        if (this.isBot()) {
            let card = this.weightedDiscard(cardArgs)
            if (card) {
                this.discard(card, cardArgs.deck!)
            } else {
                this.discardRandom(cardArgs)
            }
        } else {
            this.resolveBeforeTurn.push(TurnInterrupt.DISCARD_FROM_HAND)
        }
    }

    hasInterrupts() {
        return this.resolveBeforeTurn.length > 0
    }

    getInterrupts() {
        return this.resolveBeforeTurn
    }

    clearInterrupts() {
        this.resolveBeforeTurn = []
        return this
    }

    randomCard() {
        return this.cards[Math.floor(Math.random() * this.cards.length)]
    }

    weightedDiscard(cardArgs: CardArgs) {
        //return the highest weight card that can be discarded
        let max = Infinity;
        let maxCard = null;
        for (let card of this.cards) {
            if (card && this.isBot()) {
                let evaluation = this.botProfile.evaluate(card, cardArgs)
                if (evaluation < max * (0.8 + Math.random() * 0.4)) {
                    max = evaluation
                    maxCard = card
                }
            }
        }
        return maxCard
    }

    weightedDiscardToHand(cardArgs: CardArgs) {
        if (this.cih().length > this.getHandsize()) {
            while (this.cih().length > this.getHandsize()) {
                let discardable = this.weightedDiscard(cardArgs)
                if (discardable || !cardArgs.deck) {
                    this.discard(discardable, cardArgs.deck!)
                } else {
                    return;
                }
            }
        }
    }

    weightedGive(cardArgs: CardArgs) {
        //return the highest weight card that can be given
        let max = Infinity;
        let maxCard = null;
        for (let card of this.cards) {
            if (card && this.isBot()) {
                let evaluation = this.botProfile.evaluate(card, cardArgs)
                if (evaluation < max * (0.8 + Math.random() * 0.4)) {
                    max = evaluation
                    maxCard = card
                }
            }
        }

        return maxCard
    }

    weightedPlay(cardArgs: CardArgs) {
        //return the highest weight card that can be played
        let max = -Infinity;
        let maxCard = null;
        for (let card of this.cards) {
            if (card && this.botProfile) {
                let evaluation = this.botProfile.evaluate(card, cardArgs)
                if (evaluation > max * (0.8 + Math.random() * 0.4) && card.canBePlayed(cardArgs)) {
                    max = evaluation
                    maxCard = card
                }
            } else {
                console.log("not a bot")
            }
        }

        return maxCard
    }

    getEvent(name: string) {
        return this.events[name]
    }

    removeEvent(name: string): this {
        delete this.events[name]
        return this
    }

    selectChoices(choices: AbilityChoices[], cardArgs: CardArgs): ChoiceType[] {
        return []; //this is the player, we don't need to evaluate here
    }

    evaluate(card: Card, args: CardArgs) {
        return 0; //this is the player, we don't need to evaluate here
    }
}
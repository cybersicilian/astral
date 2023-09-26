import Player from "../logic/gameplay/player/Player";
import Deck from "../logic/gameplay/deck/Deck";
import DeckList from "../logic/gameplay/deck/DeckList";
import {CommEnum} from "../logic/structure/utils/CommEnum";
import {Choices} from "../logic/structure/utils/CardEnums";
import Upgrade from "../logic/gameplay/player/systems/Upgrade";
import {CardArgs} from "../logic/gameplay/cards/CardArgs";
import {ChoiceType} from "../logic/gameplay/cards/choices/ChoiceType";


// import {ServerWebSocket, Server, serve} from "bun";
import { WebSocketServer } from "ws";
import BotType from "../logic/gameplay/player/bots/BehaviorProfile";
import {adjustAIWeights} from "./dummies/ai_heuristics";
import {TurnInterrupt} from "../logic/structure/utils/TurnInterrupt";
import Card from "../logic/gameplay/cards/Card";

export type ServerConfig = {
    startingHand: number, //4
    maxPlayers: number,
    minPlayers: number,

    fairness: boolean //true
}

export default class GameServer {

    private players: { [key: string]: Player } = {}
    private sockets: { [key: string]: any } = {}
    private deck: Deck

    private turnPhase: number = 0
    //0 - draw
    //1 - play
    //2 - give

    private activeTurn: string = ""

    private logEntries: string[] = []
    private sendableLogs: string[] = []

    private serverObj: WebSocketServer | undefined = undefined
    private serverPort: number = 15912

    private serverConfig: ServerConfig = {
        startingHand: 4,
        maxPlayers: 6,
        minPlayers: 1,
        fairness: true
    }

    private booted: boolean = false

    constructor() {
        this.deck = Deck.fromCardList(60, DeckList.basic)
        this.deck.shuffle()
    }


    reset() {
        if (this.serverObj) {
            this.serverObj.close()
        }
        this.deck = Deck.fromCardList(60, DeckList.basic)
        this.deck.shuffle()
        this.sockets = {}
        this.players = {}
        this.turnPhase = 0
        this.activeTurn = ""
        this.sendableLogs = []
        this.log("Server reset!")
        this.init(this.serverPort)
    }

    static createName() {
        let name = [
            ["Cheddar", "Swiss", "Sewer", "Moist", "Crusty", "Crunchy", "Crispy", "Bam", "Bang", "Slam", "Meow", "Bark", "Grand", "Del", "Dip", "Rich", "Povert", "Rogue", "Joleto", "Tad", "Italian", "Spicy", "Salty", "Sweet", "Sour", "Bitter", "Stinky", "Irritating", "Meaty", "Cool", "Neato", "Awesome", "Sassy"],
            ["amole", "lotion", "bacon", "slice", "sliver", "fluid", "ian", "jess", "tad", "Loaf", "Crust", "Crunch", "Crisp", "Ioli", "Head", "Ino", "Pants", "Zilla", "Shirt", "Shoes", "Hat", "Glove", "Sock", "Spaghetti", "Oritto", "Ravioli", "Gnocchi", "Chilada", "Pierogi", "Burrito", "Taco", "Enchilada", "Tamale", "Changa", "Dilla", "Nachos", "Tilla", "Chip", "Salsa", "Guacamole", "Asaurus", "Eratops"],
            [" Mc", " ", " ", " ", " ", " ", " ", " ", " Mac", " O'"],
            ["Pan", "Tad", "Crap", "Gene", "Friendly", "Spicy", "Hate", "Spinach", "Slam", "Magic", "Eraser", "Bougie", "Ball", "Supremo", "Bean", "Burger", "Bread", "Biscuit", "Bacon", "Bun", "Biscuit", "Burger", "Bread", "Kitty", "Wood", "Morning", "Soft", "Hard", "Raging", "", ""],
            ["Plumbing", "Orama", "Adic", "Tastic", "Full", "Loaf", "Fruit", "Table", "Chair", "Brian", "Brain", "Atomy", "Acist", "Ologist", "Doofus", "Dorkus", "Itis", "Person", "Biden", "Trump", "Obama", "Bush", "Clinton", "Reagan", "Carter", "Folk", "Ford", "Sandal", "Muncher", "Potato", "Whiskey", "Bourbon"]
        ].map((name, index) => {
            let select = name[Math.floor(Math.random() * name.length)]
            if (index > 0 && !select.startsWith(" ")) {
                select = select.toLowerCase()
            }
            return select
        }).join("")
        return name.split(" ").map((s) => s[0].toUpperCase() + s.substring(1).toLowerCase()).join(" ")
    }

    log(content: string) {
        console.log(content)
        this.logEntries.push(content.toString())
    }

    gameLog(content: string) {
        this.sendableLogs.push(content)
    }

    getDeck() {
        return this.deck
    }

    addPlayer() {
        //add one turn to each other player
        if (this.serverConfig.fairness) {
            Object.values(this.players).forEach(player => player.addTurns(1))
        }
        let id = Math.random().toString(36).substring(7);
        this.players[id] = new Player(this.serverConfig.startingHand, this.deck).setTurnPlacement(Object.keys(this.players).length)
        this.players[id].addEvent("new_upgrade", (cardArgs) => {
            this.updateUpgradeShop(id)
        })
        if (this.activeTurn === "") {
            this.activeTurn = id
            this.players[id].setHost()
        }
        return {id: id, index: Object.keys(this.players).length - 1}
    }

    addBot() {

        //add one turn to each other player
        if (this.serverConfig.fairness) {
            Object.values(this.players).forEach(player => player.addTurns(1))
        }

        let id = Math.random().toString(36).substring(7);
        this.players[id] = new Player(this.serverConfig.startingHand, this.deck).setTurnPlacement(Object.keys(this.players).length).setName(GameServer.createName()).setBot()
        this.gameLog(`${this.players[id].getLogText()} joined the game as a bot.`)
        return id
    }

    incrementPhase() {
        //we iterate over every player and see if they have any interrupts
        //if they do, we send them a message with their interrupts to resolve using the SEND_INTERRUPTS signal
        //they need to return an array of valid indices using the RESOLVE_INTERRUPTS signal
        //we process it, clear their interrupts, and repeat this process
        let increment = true
        for (let id of Object.keys(this.players)) {
            //bots resolve interrupts automatically
            if (this.players[id].hasInterrupts() && !this.players[id].isBot()) {
                this.sockets[id].send(JSON.stringify({
                    type: CommEnum.SEND_INTERRUPTS,
                    interrupts: this.players[id].getInterrupts()
                }))
                console.log(`Waiting on ${this.players[id].getName()} to resolve interrupts...`)
                increment = false
            }
        }

        if (!increment) {
            this.updateAllStates()
            return false
        }

        let cardArgs: CardArgs = {
            owner: this.getActive(),
            opps: Object.values(this.players).filter(x => x !== this.getActive()),
            deck: this.deck
        }
        let CAN_GIVE = Object.keys(this.players).length >= 2 && this.getActive().cih().length >= 2 && this.getActive().cih().some(x => x.canBeGiven(this.getActive(), {
            ...cardArgs,
            card: x
        }))
        let CAN_PLAY = this.getActive().cih().some(x => x.canBePlayed({
            owner: this.getActive(),
            opps: Object.values(this.players).filter(x => x !== this.getActive()),
            deck: this.deck,
            card: x
        })) || this.getActive().getProp(`meta_upgrade`).some((upgrade: Upgrade) => {
            return upgrade.getData(cardArgs)
        })
        let CAN_DISCARD = this.getActive().cih().length > this.getActive().getHandsize()
        if (this.turnPhase === 0) {
            if (CAN_GIVE) { this.turnPhase = 1 }
            else if (CAN_PLAY) { this.turnPhase = 2 }
            else if (CAN_DISCARD) { this.turnPhase = 3 }
            else { this.incrementTurn() }
        } else if (this.turnPhase === 1) {
            if (CAN_PLAY) { this.turnPhase = 2 }
            else if (CAN_DISCARD) { this.turnPhase = 3 }
            else { this.incrementTurn() }
        } else if (this.turnPhase === 2) {
            if (CAN_DISCARD) { this.turnPhase = 3 }
            else { this.incrementTurn() }
        }
        this.updateAllStates()
    }

    incrementTurn() {
        this.gameLog(`${this.getActive().getLogText()} ended their turn.`)
        this.gameLog(`===NEW TURN===`)
        this.turnPhase = 0
        if (Object.values(this.players).length == 0) {
            this.activeTurn = ""
            //don't need to update states if nobody's connected
            this.updateAllStates()
        } else {
            this.activeTurn = Object.keys(this.players)[(Object.keys(this.players).indexOf(this.activeTurn) + 1) % Object.keys(this.players).length]
            this.gameLog(`${this.getActive().getLogText()} begins their turn.`)
            this.updateAllStates()
            if (this.getActive().skipCheck()) {
                this.gameLog(`${this.getActive().getLogText()} is skipped.`)
                this.incrementTurn()
            } else if (this.getActive().isBot()) {
                this.playBotTurn()
            }
        }
    }

    playBotTurn() {
        let opps = Object.keys(this.players).filter(key => key !== this.activeTurn).map(key => this.players[key])
        let baseArgs = {
            owner: this.getActive(),
            opps: opps,
            deck: this.deck
        }

        this.getActive().draw(this.deck, 1)
        this.gameLog(`${this.getActive().getLogText()} draws a card.`)
        let playable = null;
        try {
            playable = this.getActive().cih().filter(x => x.canBePlayed({...baseArgs, card: x}))
        } catch (e) {
            this.gameLog(`${this.getActive().getLogText()} has an error in their hand: ${e}`)
        }
        this.turnPhase = 1
        this.updateAllStates()

        if (this.getActive().cih().length >= 2) {
            let weighted = this.getActive().weightedGive(baseArgs)
            if (weighted) {
                let target = opps[Math.floor(Math.random() * opps.length)]
                this.gameLog(`${this.getActive().getLogText()} gives ${weighted.getLogText()} to ${target.getLogText()}.`)
                this.getActive().give(weighted, target)
            }
        } else {
            this.gameLog(`${this.getActive().getLogText()} doesn't have enough cards to be generous.`)
        }

        let played = playable.length > 0
        if (played) {
            this.turnPhase = 2
        } else {
            this.turnPhase = 3
        }
        this.updateAllStates()

        if (played) {
            //get weighted playable
            let weighted = this.getActive().weightedPlay(baseArgs)
            if (weighted) {
                this.gameLog(`${this.getActive().getLogText()} plays ${weighted.getLogText()}.`)
                this.getActive().play(weighted, opps, this.deck)
            }
            this.turnPhase = 3
            this.updateAllStates()
        }

        //discard cards now
        this.getActive().weightedDiscardToHand(baseArgs)

        this.incrementTurn()
    }

    updateUpgradeShop(id: string) {
        let ws = this.sockets[id]
        ws.send(JSON.stringify({
            type: CommEnum.TRANSFER_UPGRADE_SHOP,
            shop: this.getActive().getProp(`meta_upgrade`)
                .map((upgrade: Upgrade) => {
                    return upgrade.getData({
                        owner: this.players[id],
                        opps: [],
                        deck: this.deck
                    })
                })
        }))
    }

    disconnect(id: string, msg:string = "") {
        //discard the players hand
        for (let card of this.players[id].cih()) {
            this.deck.discardPile.push(card)
        }
        if (id === this.activeTurn) {
            this.incrementTurn()
        }
        this.log(`Player ${id} disconnected (${this.players[id].getLogText()}) - ${msg}`)
        this.gameLog(`${this.players[id]} disconnected.`)
        if (this.sockets[id]) {
            this.sockets[id].send(JSON.stringify({
                type: CommEnum.SERVER_MSG,
                message: msg
            }))
            this.sockets[id].send(JSON.stringify({
                type: CommEnum.DISCONNECTED
            }))
        }
        delete this.players[id]
        delete this.sockets[id]

        //remove one turn from each other player
        if (this.serverConfig.fairness) {
            Object.values(this.players).forEach(player => player.addTurns(-1))
        }
        //set the host role to the first player that isn't a bot
        if (Object.keys(this.players).length > 0) {
            let newHost = Object.keys(this.players).find(key => !this.players[key].isBot())!
            if (newHost) {
                this.players[newHost].setHost()
                this.gameLog(`${this.players[newHost]} is now the host.`)
            } else {
                //if there are no non-bots, shut down the server
                this.log("No non-bots left, server entering reset mode")
                this.reset()
            }
        }

        if (Object.keys(this.players).length === 0) {
            this.activeTurn = ""
            //if there are no non-bots, shut down the server
            this.log("No non-bots left, server entering reset mode")
            this.reset()
        }
        this.updateAllStates()
    }

    getActive() {
        if (this.activeTurn === "") throw new Error("No active turn")
        return this.players[this.activeTurn]
    }

    sendState(id: string) {
        //get opponents
        let opps = Object.keys(this.players).filter(key => key !== id).map(key => this.players[key])
        let index = Object.keys(this.players).indexOf(this.activeTurn)
        let your_index = Object.keys(this.players).indexOf(id)
        if (this.players[id].isBot()) {
            //don't send state to a bot
            return;
        }
        this.sockets[id].send(JSON.stringify({
            type: CommEnum.UPDATE_PLAYER_STATE,
            state: {
                game: {
                    players: Object.values(this.players).map((p, i) => p.getPrivate(i === your_index)),
                    turnPhase: this.turnPhase,
                    uis: this.players[id].getUIs(),
                    activeTurn: index,
                    deck: this.deck.length,
                    config: this.serverConfig,
                    logs: this.sendableLogs.map(x => x.toString()),
                    discard: this.deck.discardPile.map(x => ({
                        name: x.getDisplayName(),
                        text: x.getFormulatedText({
                            owner: this.players[id],
                            opps: opps,
                            deck: this.deck,
                            card: x
                        }),
                        rarity: x.getRarity(),
                        props: x.getProps()
                    }))
                },
                personal: this.players[id].getCards(opps, this.deck),
            }
        }))
    }

    updateAllStates() {
        Object.keys(this.players).forEach(key => this.sendState(key))
    }

    adjustAIHeuristics(num_sims: number = 250) {
        console.log(`Adjusting AI heuristics...`)
        let mods = adjustAIWeights(num_sims, false)
        for (let botName of Object.keys(BotType)) {
            console.log(`\n=== ${botName} ===`)
            for (let mod of Object.keys(mods)) {
                if (BotType[botName][mod]) {
                    let newMod = Math.round(BotType[botName][mod] * mods[mod] * 100) / 100
                    console.log(`${mod}: ${BotType[botName][mod]} -> ${newMod}`);
                    BotType[botName][mod] = newMod
                }
            }
        }
    }

    init(port: number = 15912) {
        let server = this
        server.log(`Server initialized on port ${port}`)
        this.serverPort = port

        if (!this.booted) {
            //one-time only stuff
            this.adjustAIHeuristics()
        }

        this.booted = true

        this.serverObj = new WebSocketServer({
            port: port
        })

        this.serverObj.on('connection', function connection(ws) {
            //@ts-ignore
            ws.on("message", function input(message)  {
                let result = JSON.parse(message as string)
                let id = result.id
                let opps = Object.keys(server.players).filter(key => key !== id).map(key => server.players[key])
                switch (result.type) {
                    case CommEnum.SET_NAME:
                        if (result.name.length < 1) {
                            result.name = GameServer.createName()
                        }
                        server.players[id].setName(result.name)
                        server.gameLog(`${server.players[id].getLogText()} joined the game`)
                        server.updateAllStates()
                        break
                    case CommEnum.DRAW_CARD:
                        if (server.activeTurn == id && server.turnPhase == 0) {
                            server.players[id].draw(server.deck, 1)
                            server.gameLog(`${server.players[id].getLogText()} drew a card.`)
                            server.incrementPhase()
                        } else if (server.activeTurn !== id) {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "This card can't be played - not your turn."
                            }))
                        } else {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "This card can't be played - not the draw phase."
                            }))
                        }
                        server.updateAllStates()
                        break;
                    case CommEnum.GIVE_CARD:
                        //idInHand for card, targetOpp for opp
                        let giveId = result.idInHand
                        let targetOpp = Object.keys(server.players)[result.target]
                        if (server.activeTurn == id && server.turnPhase == 1 && targetOpp !== id
                            && server.players[id].cih().length >= 2 && server.players[id].cih()[giveId].canBeGiven(server.players[targetOpp], {
                                card: server.players[id].cih()[giveId],
                                owner: server.players[id],
                                opps: opps,
                                deck: server.deck
                            })) {
                            server.gameLog(`${server.players[id].getLogText()} gives ${server.players[id].cih()[giveId].getLogText()} to ${server.players[targetOpp].getLogText()}.`)
                            server.players[id].give(server.players[id].cih()[giveId], server.players[targetOpp])
                            server.incrementPhase()
                        } else if (server.activeTurn === id) {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "This card can't be gifted - not your turn."
                            }))
                        } else if (server.turnPhase !== 1) {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "This card can't be gifted - not the give phase."
                            }))
                        } else if (server.players[id].cih().length < 2) {
                            server.gameLog(`${server.players[id].getLogText()} doesn't have enough cards to be generous.`)
                            server.incrementPhase()
                        } else {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "This card can't be gifted - not giveable to this player."
                            }))
                        }
                        break;
                    case CommEnum.GET_CHOICES:
                        //idInHand is the index of the card in the player's hand
                        let choiceToGet = result.idInHand
                        let choiceCard = server.players[id].cih()[choiceToGet]
                        if (choiceCard.canBePlayed({
                            owner: server.players[id],
                            opps: opps,
                            deck: server.deck,
                            card: choiceCard
                        }) && server.activeTurn === id && server.turnPhase == 2) {
                            let result = (JSON.stringify({
                                type: CommEnum.CHOICE_LIST,
                                card: choiceToGet,
                                splits: choiceCard.getAbilities().map(ability => ability.getChoices().length),
                                choices: choiceCard.getChoices({
                                    owner: server.players[id],
                                    opps: opps,
                                    deck: server.deck,
                                    card: choiceCard
                                }),
                            }))
                            ws.send(result)
                        } else if (server.activeTurn === id) {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "This card can't have choices selected - not your turn."
                            }))
                        } else if (server.turnPhase !== 2) {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "This card can't be played - not the play phase."
                            }))
                        } else {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "This card can't be played"
                            }))
                        }
                        break;
                    case CommEnum.PLAY_CARD:
                        //idInHand is the index of the card in the player's hand
                        let idInHand = result.idInHand
                        let card = server.players[id].cih()[idInHand]
                        let choices: (string|number)[][] = result.choices
                        //translate those choices into objects
                        let choiceObjs: (ChoiceType)[][] = choices.map((selections, abilityId) => {
                            let ability = card.orderAbilities()[abilityId]
                            return selections.map((selection, choiceId) => {
                                let type = ability.informChoices({
                                    owner: server.players[id],
                                    opps: opps,
                                    deck: server.deck,
                                    card: card
                                })[choiceId]
                                switch (type.choice) {
                                    case Choices.OPPONENT:
                                    case Choices.PLAYER:
                                        return server.players[Object.keys(server.players)[selection as number]]
                                    case Choices.CARD_IN_HAND:
                                        return server.players[id].cih()[selection as number]
                                    case Choices.CARD_IN_DISCARD:
                                        return server.deck.discardPile[selection as number]
                                }
                            })
                        })
                        //check if the player has any playable cards
                        if (server.activeTurn === id && server.turnPhase == 2 && card.canBePlayed({
                            owner: server.players[id],
                            opps: opps,
                            deck: server.deck,
                            card: card
                        })) {
                            let cardArgs = {
                                owner: server.players[id],
                                opps: opps,
                                deck: server.deck,
                                card: card
                            }
                            if (card.getChoices(cardArgs).length > 0) {
                                server.gameLog(`${server.players[id].getLogText()} plays ${card.getLogText()} with the following choices:\n${choices.map((choice, index) => `${card.orderAbilities()[index].getFormulatedText(cardArgs)}: ${choiceObjs[index].map(x => x.getLogText()).join(", ")}`).join("\n")}`)
                            } else {
                                server.gameLog(`${server.players[id].getLogText()} plays ${card.getLogText()}.`)
                            }
                            server.players[id].play(card, opps, server.deck, choiceObjs)
                            server.incrementPhase()
                        } else if (server.activeTurn === id) {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "This card can't be played - not your turn."
                            }))
                        } else if (server.turnPhase !== 2) {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "This card can't be played - not the play phase."
                            }))
                        } else {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "This card can't be played - not playable."
                            }))
                        }
                        break;
                    case CommEnum.DISCARD_TO_HAND:
                        let toDiscard: number[] = result.idInHand
                        if (server.activeTurn !== id) {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "This card can't be discarded - not your turn."
                            }))
                        } else if (server.turnPhase !== 3) {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "This card can't be discarded - not the discard phase."
                            }))
                        } else if (server.players[id].cih().length <= server.players[id].getHandsize()) {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "This card can't be discarded - you don't have enough cards in hand."
                            }))
                            server.updateAllStates()
                            server.incrementTurn()
                        } else {
                            //discard the cards
                            for (let card of toDiscard) {
                                if (server.players[id].cih().length >= card + 1) {
                                    let toDiscardCards = [server.players[id].cih()[card]]
                                    server.players[id].setCiH(server.players[id].cih().filter(x => !toDiscardCards.includes(x)))
                                    for (let card of toDiscardCards) {
                                        server.deck.discardPile.push(card)
                                    }
                                    server.updateAllStates()
                                    if (server.players[id].cih().length <= server.players[id].getHandsize()) {
                                        break;
                                        server.incrementTurn()
                                    }
                                }
                            }
                        }
                        break;
                    case CommEnum.ADD_BOT:
                        if (server.players[id].isHost()) {
                            server.addBot()
                            server.updateAllStates()
                        } else {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "You can't add a bot - you aren't the host."
                            }))
                        }
                        break;
                    case CommEnum.KICK_PLAYER:
                        if (server.players[id].isHost()) {
                            let targetToKick = result.target
                            let stringId = Object.keys(server.players)[targetToKick]
                            if (stringId === id) {
                                ws.send(JSON.stringify({
                                    type: CommEnum.ERROR,
                                    message: "You can't kick yourself."
                                }))
                            } else {
                                server.gameLog(`${server.players[id]} kicked ${server.players[stringId]}.`)
                                server.disconnect(stringId, result.message ?? "The host hated your guts.")
                            }
                        } else {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "You can't kick a player - you aren't the host."
                            }))
                        }
                        break;
                    case CommEnum.TRANSFER_UPGRADE_SHOP:
                        if (server.getActive().getUIs().upgrade) {
                            server.updateUpgradeShop(id)
                        } else {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "You haven't unlocked the upgrade shop."
                            }))
                        }
                        break;
                    case CommEnum.RESOLVE_INTERRUPT:
                        let playerInterrupts: TurnInterrupt[] = server.players[id].getInterrupts()
                        let targets: (string|number)[] = result.interrupts
                        if (targets.length !== playerInterrupts.length) {
                            ws.send(JSON.stringify({
                               type: CommEnum.ERROR,
                                 message: "You can't resolve these interrupts - invalid number of interrupts."
                            }))
                        } else {
                            let cardsToDiscard: Card[] = []
                            //resolve the interrupts
                            for (let i = 0; i < targets.length; i++) {
                                // let valid = true;
                                switch (playerInterrupts[i]) {
                                    case TurnInterrupt.DISCARD_FROM_HAND:
                                        if (server.players[id].cih().length > 0) {
                                            cardsToDiscard.push(server.players[id].cih()[targets[i] as number])
                                        }
                                        break;
                                }
                            }
                            cardsToDiscard.forEach(card => {
                                server.players[id].discard(card, server.deck)
                            })
                            //clear interrupts
                            server.players[id].clearInterrupts()
                        }
                        server.incrementPhase()
                        break;
                    case CommEnum.BUY_UPGRADE:
                        let upgradeIndex: number = result.upgrade
                        let shop: Upgrade[] = server.getActive().getProp(`meta_upgrade`)
                        if (server.activeTurn !== id) {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "You can't buy an upgrade - not your turn."
                            }))
                        } else if (!server.getActive().getUIs().upgrade) {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "You can't buy an upgrade - you haven't unlocked the upgrade shop."
                            }))
                        } else if (server.turnPhase !== 2) {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "You can't buy an upgrade - not the play phase."
                            }))
                        } else if (shop.length <= upgradeIndex || upgradeIndex < 0 ||
                            shop[upgradeIndex].locked() || !shop[upgradeIndex].canPayCost({
                                owner: server.getActive(),
                                opps: opps,
                                deck: server.deck
                            })) {
                            ws.send(JSON.stringify({
                                type: CommEnum.ERROR,
                                message: "You can't buy an upgrade - invalid upgrade."
                            }))
                        } else {
                            shop[upgradeIndex].unlock({
                                owner: server.getActive(),
                                opps: opps,
                                deck: server.deck
                            })
                            server.gameLog(`${server.getActive().getLogText()} bought ${shop[upgradeIndex].getData({
                                owner: server.getActive(),
                                opps: opps,
                                deck: server.deck
                            }).name}.`)
                            //increment the play phase
                            server.incrementPhase()
                            server.updateAllStates()
                            server.updateUpgradeShop(id)
                        }
                        //update the upgrade shop
                        break;
                }
            })

            //@ts-ignore
            ws.on("close", function close(code, message) {
                //delete the player that matches the socket
                let id = Object.keys(server.sockets).find(key => server.sockets[key] === ws)!
                server.disconnect(id)
            })

            let id = server.addPlayer()
            server.sockets[id.id] = ws
            ws.send(JSON.stringify({
                type: CommEnum.CONNECTED,
                connected: id.id,
                host: Object.keys(server.players)[0] == id.id,
                turn: id.index
            }))
        })
    }
}
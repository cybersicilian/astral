import Player, {CardState} from "../player/Player";
import Deck from "../deck/Deck";
import {CardArgs} from "./CardArgs";
import BaseAbility from "../../abilities/core/BaseAbility";
import {Rarity} from "../../structure/utils/CardEnums";
import {IIdentifiable} from "../../structure/interfaces/IIdentifiable";
import {ChoiceType} from "./choices/ChoiceType";
import {IProppable, Properties} from "../../structure/interfaces/IProppable";
import {ITriggerable} from "../../structure/interfaces/ITriggerable";
import {IPlayable} from "../../structure/interfaces/IPlayable";
import {Resolver, ResolverCallback} from "../../structure/utils/Resolver";
import {AIMeta, AIProfile, AIWeights} from "../ai/AIProfile";

export default class Card implements IIdentifiable, IProppable, ITriggerable, IPlayable {
    private name: string;
    private abilities: BaseAbility[] = [];

    private power: number = 1;
    private rarity: Rarity = Rarity.COMMON

    canPlay: ResolverCallback<(c: CardArgs) => boolean> = new ResolverCallback(true)
    canGive: ResolverCallback<(p: Player, c: CardArgs) => boolean> = new ResolverCallback(true)

    private discardable: boolean = true

    protected props: Properties = {}

    constructor(name: string, abilities: BaseAbility[]) {
        this.name = name;
        this.abilities = abilities;
    }

    setCanPlay(canPlay: Resolver<boolean>) {
        this.canPlay = new ResolverCallback(canPlay);
        return this;
    }

    setCanGive(canGive: Resolver<boolean>) {
        this.canGive = new ResolverCallback(canGive);
        return this
    }

    setProps(props: { [key: string]: any }) {
        this.props = props
        return this
    }

    setProp(prop: string, value: any, args?: CardArgs) {
        this.props[prop] = value
        return this
    }

    addAbility(ability: BaseAbility) {
        this.abilities.push(ability)
        return this
    }

    getChoices(cardArgs: CardArgs) {
        return this.orderAbilities().map((a => {
            return a.informChoices({...cardArgs, card: this})
        })).flat()
    }

    skipDiscard() {
        this.discardable = false;
        return this;
    }

    doSkipDiscard() {
        return !this.discardable;
    }

    getProps() {
        return this.props
    }

    getProp(prop: string) {
        return this.getProps()[prop]
    }

    clone() {
        let card = new Card(this.name, this.abilities.map((ability) => ability.clone()))
        card.setPow(this.power)
        card.setRarity(this.rarity)
        card.setCanPlay(this.canPlay.getCallback())
        card.setCanGive(this.canGive.getCallback())
        card.setProps({...this.props})
        return card
    }

    canBePlayed(cardArgs: CardArgs) {
        let abilityChecks = this.abilities.map((ability) => ability.canBePlayed(cardArgs))
        if (abilityChecks.includes(false)) return false
        return this.canPlay.resolve(cardArgs)
    }

    canBeGiven(opp: Player, cardArgs: CardArgs) {
        let abilityChecks = this.abilities.map((ability) => ability.canBeGiven(opp, cardArgs))
        if (abilityChecks.includes(false)) return false
        return this.canGive.resolve(opp, cardArgs)
    }

    setRarity(rarity: Rarity) {
        this.rarity = rarity;
        return this;
    }

    getRarity() {
        return this.rarity;
    }

    getAbilities() {
        return this.abilities;
    }

    getWeights(cardArgs: CardArgs) {
        let weightComp = this.abilities.map((ability) => ability.getWeights())
        let newWeight = {
            play: 0,
            give: 0,
            discard: 0
        }
        for (let weight of weightComp) {
            if (typeof weight.play === "function") {
                newWeight.play += weight.play(cardArgs)
            } else {
                newWeight.play += weight.play
            }

            if (typeof weight.give === "function") {
                newWeight.give += weight.give(cardArgs)
            } else {
                newWeight.give += weight.give
            }

            if (typeof weight.discard === "function") {
                newWeight.discard += weight.discard(cardArgs)
            } else {
                newWeight.discard += weight.discard
            }
        }
        return newWeight
    }

    getName() {
        return this.name;
    }

    setName(name: string) {
        this.name = name;
        return this;
    }

    toCardState(): CardState {
        return {
            name: this.name,
            power: this.power,
            rarity: this.rarity,
            text: this.getText(),
            props: this.props
        }
    }

    //format this into a hyperlink later on
    getLogText() {
        return `§§${this.name}§card§${JSON.stringify(this.toCardState())}§§`;
    }

    pow() {
        return Math.min(this.power, 999);
    }

    setPow(pow: number) {
        this.power = pow;
        if (this.power > 999) {
            this.power = 999;
        }
        return this;
    }

    explode() {
        let cards: Card[] = []
        if (this.getProp(`fragment`)) {
            //obliterated
            return cards
        } else {
            let ctr = 1
            for (let ability of this.orderAbilities()) {
                let newCard = new Card(`${this.getName()} Fragment #${ctr}`, [
                    ability.clone()
                ]).setPow(this.pow()).setRarity(this.getRarity()).setProps({...this.props})
                newCard.setProp(`fragment`, true)
                ctr++
                cards.push(newCard)
            }
            return cards
        }
    }

    orderAbilities() {
        return this.abilities.sort((a, b) => {
            //sort playerrestriction and playerrestrictionabilitynegs after cost abilities
            if (a.constructor.name === "CostAbility" && b.constructor.name !== "CostAbility") {
                return -1
            } else if (a.constructor.name !== "CostAbility" && b.constructor.name === "CostAbility") {
                return 1
            } else if (a.constructor.name === "PlayerRestrictionAbility" && b.constructor.name !== "PlayerRestrictionAbility") {
                return -1
            } else if (a.constructor.name !== "PlayerRestrictionAbility" && b.constructor.name === "PlayerRestrictionAbility") {
                return 1
            } else if (a.constructor.name === "PlayerRestrictionAbilityNeg" && b.constructor.name !== "PlayerRestrictionAbilityNeg") {
                return -1
            } else if (a.constructor.name !== "PlayerRestrictionAbilityNeg" && b.constructor.name === "PlayerRestrictionAbilityNeg") {
                return 1
            } else if (a.constructor.name === "PlayerPredicateRestrictionAbility" && b.constructor.name !== "PlayerPredicateRestrictionAbility") {
                return -1
            } else if (a.constructor.name !== "PlayerPredicateRestrictionAbility" && b.constructor.name === "PlayerPredicateRestrictionAbility") {
                return 1
            } else if (a.hasRestriction() && !b.hasRestriction()) {
                return -1
            } else if (!a.hasRestriction() && b.hasRestriction()) {
                return 1
            }
            return 0
        })
    }

    fireEvents(event: string, cardArgs: CardArgs) {
        for (let ability of this.orderAbilities()) {
            ability.fireEvents(event, cardArgs)
        }
    }

    play(owner: Player, opps: Player[], deck: Deck, choices?: (ChoiceType)[][]) {
        let ctr = 0;
        if (this.canBePlayed({owner: owner, opps: opps, deck: deck, card: this})) {
            for (let ability of this.orderAbilities()) {
                let c = choices ? choices[ctr] : undefined
                ability.fireEvents("play", {owner: owner, opps: opps, deck: deck, card: this, choices: c});
                ctr++
            }
        }
    }

    draw(owner: Player, opps: Player[], deck?: Deck) {
        for (let ability of this.orderAbilities()) {
            ability.fireEvents("draw", {owner: owner, opps: opps, deck: deck, card: this});
        }
    }

    give(owner: Player, opps: Player[], deck?: Deck) {
        for (let ability of this.orderAbilities()) {
            ability.fireEvents("give", {owner: owner, opps: opps, deck: deck, card: this});
        }
    }

    discard(owner: Player, opps: Player[], deck?: Deck) {
        for (let ability of this.orderAbilities()) {
            ability.fireEvents("discard", {owner: owner, opps: opps, deck: deck, card: this});
        }
    }

    getText() {
        //sort CostAbilities to the top, then each ability that has a can play restriction, then the rest
        let abilities = this.orderAbilities()
        return abilities.map((ability) => ability.getText()).join("\n")
    }

    getFormulatedText(cardArgs: CardArgs) {
        let abilities = this.orderAbilities()
        return abilities.map((ability) => ability.getFormulatedText(cardArgs)).join("\n")
    }

    getFormulas() {
        let abilities = this.orderAbilities()
        return abilities.map((ability) => {
            if (ability.hasFormula()) {
                return ability.getFormula()
            }
            return ""
        })
    }

    getTraits(c: CardArgs): AIProfile {
        let abilities = this.orderAbilities()
        let trait_list = abilities.map((ability) => {  return ability.ai(); })
        let traits: {
            profile: AIWeights
        } = { profile: {} }
        for (let profile of trait_list) {
            for (let key of Object.keys(profile)) {
                let value = new ResolverCallback<(c: CardArgs) => number>(profile[key]).resolve(c)
                if (traits.profile[key]) {
                    traits.profile[key] += value
                } else {
                    traits.profile[key] = value
                }
            }
        }
        //simplify the trait logic here
        // traits.meta = {
        //     pgp: trait_list.map((profile) => profile.meta.pgp).flat(),
        //     pbp: trait_list.map((profile) => profile.meta.pbp).flat()
        // }


        return traits
    }

    static combine(...cards: Card[]): Card {
        let clones = cards.map((card) => card.clone())
        let newCard = new Card(clones.map((card) => card.getName()).join(" + "), [
            ...clones.map((card) => card.getAbilities()).flat()
        ])
        //power is the average of all the cards
        newCard.setPow(Math.floor(clones.map((card) => card.pow()).reduce((a, b) => a + b, 0) / clones.length))
        //rarity is the average of all the raritys
        newCard.setRarity(Math.floor(clones.map((card) => card.getRarity()).reduce((a, b) => a + b, 0) / clones.length))
        newCard.setCanPlay((cardArgs: CardArgs) => {
            //iterate through all the clones
            for (let card of clones) {
                //if any of them can't be played, return false
                if (!card.canBePlayed(cardArgs)) {
                    return false
                }
            }
            return true
        })

        //aggregate the props
        let props: { [key: string]: any } = {}
        for (let card of clones) {
            props = {...props, ...card.getProps()}
        }
        newCard.setProps(props)

        return newCard
    }
}
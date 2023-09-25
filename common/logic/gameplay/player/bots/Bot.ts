import Player from "../Player";
import Deck from "../../deck/Deck";
import {CardArgs} from "../../cards/CardArgs";
import {AbilityChoices} from "../../cards/choices/AbilityChoices";
import {ChoiceType} from "../../cards/choices/ChoiceType";
import {AIPointer} from "../../../structure/utils/CardEnums";
import Card from "../../cards/Card";
import BotType from "./BehaviorProfile";

export default class Bot {

    private optimality: number = 1;
    private readonly profile = {}
    private readonly profileName: string = ""

    constructor(profile: string = "") {
        if (BotType[profile]) {
            this.profileName = profile
        } else {
            this.profileName = Object.keys(BotType)[Math.floor(Math.random() * Object.keys(BotType).length)]
        }
        this.profile = BotType[this.profileName]
    }

    getProfileName() {
        return this.profileName
    }

    getProfile() {
        return this.profile
    }

    static makeSpecificChoice(args: CardArgs, choice: AbilityChoices) {
        let madeChoices = [];
        if (choice.pointer instanceof Function) {
            madeChoices.push(choice.pointer(args));
        } else {
            switch (choice.pointer) {
                case AIPointer.SELF:
                    madeChoices.push(args.owner);
                    break;
                case AIPointer.OPPONENT_MOST_CARDS:
                    madeChoices.push(...args.opps.sort((a, b) => b.inHand() - a.inHand()));
                    break;
                case AIPointer.OPPONENT_LEAST_CARDS:
                    madeChoices.push(...args.opps.sort((a, b) => a.inHand() - b.inHand()));
                    break;
                case AIPointer.OPPONENT_RANDOM:
                    //sort opps randomly
                    let shuffled = args.opps.sort(() => Math.random() - 0.5);
                    madeChoices.push(...shuffled);
                    break;
                case AIPointer.CARD_IN_DISCARD_LEAST_POWER:
                    madeChoices.push(...args.deck!.discardPile.sort((a, b) => {
                        if (!a || !b) { return 0; }
                        return a.pow() - b.pow()
                    }));
                    break;
                case AIPointer.CARD_IN_DISCARD_MOST_POWER:
                    madeChoices.push(...args.deck!.discardPile.sort((a, b) => {
                        if (!a || !b) { return 0; }
                        return b.pow() - a.pow()
                    }));
                    break;
                case AIPointer.CARD_IN_DISCARD_RANDOM:
                    madeChoices.push(...args.owner.cih().sort(() => Math.random() - 0.5));
                    break;
                case AIPointer.CARD_IN_HAND_LEAST_POWER:
                    madeChoices.push(...args.owner.cih().sort((a, b) => {
                        if (!a || !b) { return 0; }
                        return a.pow() - b.pow()
                    }));
                    break;
                case AIPointer.CARD_IN_HAND_MOST_POWER:
                    madeChoices.push(...args.owner.cih().sort((a, b) => {
                        if (!a || !b) { return 0; }
                        return b.pow() - a.pow()
                    }));
                    break;
                case AIPointer.CARD_IN_HAND_RANDOM:
                    madeChoices.push(...args.owner.cih().sort(() => Math.random() - 0.5));
                    break;
                case AIPointer.PLAYER_RANDOM:
                    madeChoices.push(...[args.owner, ...args.opps].sort(() => Math.random() - 0.5));
                    break;
                case AIPointer.PLAYER_MOST_CARDS:
                    madeChoices.push(...[args.owner, ...args.opps].sort((a, b) => b.inHand() - a.inHand()));
                    break;
                case AIPointer.PLAYER_LEAST_CARDS:
                    madeChoices.push(...[args.owner, ...args.opps].sort((a, b) => a.inHand() - b.inHand()));
                    break;
                case AIPointer.PLAYER_MOST_TURNS_REMAINING:
                    madeChoices.push(...[args.owner, ...args.opps].sort((a, b) => b.getTurns() - a.getTurns()));
                    break;
                case AIPointer.PLAYER_LEAST_TURNS_REMAINING:
                    madeChoices.push(...[args.owner, ...args.opps].sort((a, b) => a.getTurns() - b.getTurns()));
                    break;
                case AIPointer.OPPONENT_MOST_TURNS_REMAINING:
                    madeChoices.push(...args.opps.sort((a, b) => b.getTurns() - a.getTurns()));
                    break;
                case AIPointer.OPPONENT_LEAST_TURNS_REMAINING:
                    madeChoices.push(...args.opps.sort((a, b) => a.getTurns() - b.getTurns()));
                    break;
            }
        }
        return madeChoices
    }

    optimalityCrux(decisions: ChoiceType[]) {
        //TODO: use this as the decision making logic in BaseAbility
        let optimus = this.optimality;
        let opts = decisions.length

        //signal function math
        let FUNC = (x: number) => {
            let COEFF = 2 * opts;
            let EXPONENT_E = -(1 - optimus) * x;
            return COEFF * (1 - (1 / (1 + Math.E ** EXPONENT_E)));
        }

        //now we generate a random number that's sufficiently large (between 0 and 100)
        let rand = Math.random() * 100;
        return decisions[Math.floor(FUNC(rand))]
    }

    selectChoices(choices: AbilityChoices[], args: CardArgs): ChoiceType[] {
        if (!args.card) {
            return []
        } else {
            let toMake = args.card.getChoices(args)
            let made = []
            for (let choice of toMake) {
                made.push(this.optimalityCrux(Bot.makeSpecificChoice(args, choice)))
            }
        }
    }

    evaluate(card: Card, c: CardArgs) {
        let weights = card.getTraits(c)
        let sum = 0;
        //now, we modify those weights based on the bot's profile multiplicatively
        for (const weight in weights.profile) {
            if (this.profile[weight]) {
                try {
                    sum +=  weights.profile[weight] * this.profile[weight]
                } catch {
                    console.log(`Error evaluating card ${card.getName()} with weight ${weight}`)
                }
            }
        }
        return sum;
    }
}
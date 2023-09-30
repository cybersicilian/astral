import BaseAbility from "./core/BaseAbility";
import {Pointer, Choices} from "../structure/utils/CardEnums";
import Player from "../gameplay/player/Player";

export default class AbilityOppAllGiveCard extends BaseAbility {

    constructor(qty: number) {
        super(`Each opponent gives {formula} cards to you`, [], (abilityArgs, madeChoices) => {
            for (let opponent of abilityArgs.opps) {
                let numCards = Math.min(opponent.cih().length, this.calcFormula(abilityArgs))
                for (let i = 0; i < numCards; i++) {
                    opponent.giveChoose(abilityArgs)
                }
            }
        })

        this.sai({
            affectsOpponents: (cardArgs) => (cardArgs.card.pow() + qty) * cardArgs.opps.length,
            discardsOpponentCards: (cardArgs) => (cardArgs.card.pow() + qty) * cardArgs.opps.length,
            drawsCards: (cardArgs) => (cardArgs.card.pow() + qty) * cardArgs.opps.length,
            affectsSelf: (cardArgs) => (cardArgs.card.pow() + qty) * cardArgs.opps.length
        })

        this.setFormula(`{pow} + ${qty}`)
    }
}
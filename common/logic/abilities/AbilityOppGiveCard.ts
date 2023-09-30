import BaseAbility from "./core/BaseAbility";
import {Pointer, Choices} from "../structure/utils/CardEnums";
import Player from "../gameplay/player/Player";

export default class AbilityOppGiveCard extends BaseAbility {

    constructor(qty: number) {
        super(`Opponent gives {formula} cards to you`, [
            { choice: Choices.OPPONENT, pointer: Pointer.OPPONENT_MOST_CARDS }
        ], (abilityArgs, madeChoices) => {
            let opponent = madeChoices[0] as Player
            let numCards = Math.min(opponent.cih().length, this.calcFormula(abilityArgs))
            for (let i = 0; i < numCards; i++) {
                opponent.giveChoose(abilityArgs)
            }
        })

        this.sai({
            affectsOpponents: (cardArgs) => (cardArgs.card.pow() + qty) / cardArgs.opps.length,
            discardsOpponentCards: (cardArgs) => cardArgs.card.pow() + qty,
            drawsCards: (cardArgs) => cardArgs.card.pow() + qty,
            affectsSelf: (cardArgs) => cardArgs.card.pow() + qty
        })

        this.setFormula(`{pow} + ${qty}`)
    }
}
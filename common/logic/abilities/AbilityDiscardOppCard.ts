import BaseAbility from "./core/BaseAbility";
import {Pointer, Choices} from "../structure/utils/CardEnums";
import Player from "../gameplay/player/Player";

export default class AbilityDiscardOppCard extends BaseAbility {

    constructor(qty: number) {
        super(`Opponent discards {formula} cards`, [
            { choice: Choices.OPPONENT, pointer: Pointer.OPPONENT_MOST_CARDS }
        ], (abilityArgs, madeChoices) => {
            let opponent = madeChoices[0] as Player
            let number = this.calcFormula(abilityArgs)
            if (opponent.cih().length <= number) {
                opponent.discardHand(abilityArgs);
            }
            for (let i = 0; i < number; i++) {
                if (opponent.inHand() === 0) {
                    break;
                }
                opponent.discardChoose(abilityArgs)
            }
        })

        this.sai({
            affectsOpponents: (cardArgs) => this.calcFormula(cardArgs) / cardArgs.opps.length,
            discardsOpponentCards: (cardArgs) => this.calcFormula(cardArgs)
        })

        this.setFormula(`{pow} + ${qty}`)
    }
}
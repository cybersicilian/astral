import BaseAbility from "./core/BaseAbility";
import {Pointer, Choices} from "../structure/utils/CardEnums";
import Player from "../gameplay/player/Player";

export default class AbilityDiscardOppCard extends BaseAbility {

    constructor(qty: number) {
        super(`Opponent discards {formula} cards`, [
            { choice: Choices.OPPONENT, pointer: Pointer.OPPONENT_MOST_CARDS }
        ], (abilityArgs, madeChoices) => {
            let opponent = madeChoices[0] as Player
            if (opponent.cih().length <= abilityArgs.card!.pow()) {
                opponent.discardHand(abilityArgs);
            }
            for (let i = 0; i < abilityArgs.card!.pow() + qty; i++) {
                if (opponent.inHand() === 0) {
                    break;
                }
                opponent.discardChoose(abilityArgs)
            }
        })

        this.sai({
            affectsOpponents: (cardArgs) => cardArgs.card.pow() + qty / cardArgs.opps.length,
            discardsOpponentCards: (cardArgs) => cardArgs.card.pow() + qty
        })

        this.setFormula(`{pow} + ${qty}`)
    }
}
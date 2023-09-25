import BaseAbility from "./core/BaseAbility";
import {AIPointer, Choices} from "../structure/utils/CardEnums";
import Player from "../gameplay/player/Player";

export default class AbilityDiscardOppCard extends BaseAbility {

    constructor(qty: number) {
        super(`Opponent discards {formula} cards at random`, [
            { choice: Choices.OPPONENT, pointer: AIPointer.OPPONENT_MOST_CARDS }
        ], (abilityArgs, madeChoices) => {
            let opponent = madeChoices[0] as Player
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

        this.setWeights({
            play: 3,
            discard: 0,
            give: -1
        })
        this.setFormula(`{pow} + ${qty}`)
    }
}
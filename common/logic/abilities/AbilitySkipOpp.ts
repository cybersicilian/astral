import BaseAbility from "./core/BaseAbility";
import {Pointer, Choices} from "../structure/utils/CardEnums";
import Player from "../gameplay/player/Player";

export default class AbilitySkipOpp extends BaseAbility {

    constructor(qty: number) {
        super(`Opponent skips {formula} turns`, [
            { choice: Choices.OPPONENT, pointer: Pointer.OPPONENT_MOST_CARDS }
        ], (abilityArgs, madeChoices) => {
            let opponent = madeChoices[0] as Player
            for (let i = 0; i < this.calcFormula(abilityArgs); i++) {
                opponent.skip()
            }
        })

        this.sai({
            affectsOpponents: qty,

        })

        this.setFormula(`{pow} + ${qty} - 1`)
    }
}
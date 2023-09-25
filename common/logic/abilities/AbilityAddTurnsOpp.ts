import BaseAbility from "./core/BaseAbility";
import {AIPointer, Choices} from "../structure/utils/CardEnums";
import Player from "../gameplay/player/Player";
import {CardArgs} from "../gameplay/cards/CardArgs";

export default class AbilityAddTurnsOpp extends BaseAbility {

    constructor(qty: number) {
        super(`Add {formula} turns to opponent.`, [
            { choice: Choices.OPPONENT, pointer: AIPointer.OPPONENT_LEAST_TURNS_REMAINING }
        ], (abilityArgs, madeChoices) => {
            let opponent = madeChoices[0] as Player
            opponent.addTurns(qty + abilityArgs.card?.pow())
        })
        this.setWeights({
            play: 3,
            discard: 0,
            give: -1
        })
        this.setFormula(`{pow} + ${qty}`)
        this.sai({
            oppWinSetback: qty,
            affectsOpponents: (c: CardArgs) => qty / c.opps.length,
            winProgress: (c: CardArgs) => (qty / c.opps.length) / 2,
        })
    }
}
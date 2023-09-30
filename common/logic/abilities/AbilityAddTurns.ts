import BaseAbility from "./core/BaseAbility";
import {Pointer, Choices} from "../structure/utils/CardEnums";
import Player from "../gameplay/player/Player";
import {CardArgs} from "../gameplay/cards/CardArgs";

export default class AbilityAddTurns extends BaseAbility {

    constructor(qty: number) {
        super(`Add {formula} turns`, [], (abilityArgs, madeChoices) => {
            abilityArgs.owner.addTurns(Math.max(0, this.calcFormula(abilityArgs)))
        })
        this.setFormula(`1 + ${qty} - {pow}`)
        this.sai({
            winProgress: (c: CardArgs) => Math.max(qty - c.card.pow(), 0),
            affectsSelf: (c: CardArgs) => Math.max(qty - c.card.pow(), 0)
        })
    }
}
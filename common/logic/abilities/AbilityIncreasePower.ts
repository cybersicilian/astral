import BaseAbility from "./core/BaseAbility";
import {Pointer, Choices} from "../structure/utils/CardEnums";
import Card from "../gameplay/cards/Card";

export default class AbilityIncreasePower extends BaseAbility {

    constructor(qty: number) {
        super(`Increase the power of a card in your hand by {formula}`, [
            { choice: Choices.CARD_IN_HAND, pointer: Pointer.CARD_IN_HAND_LEAST_POWER }
        ], (abilityArgs, madeChoices) => {
            if (abilityArgs.choices) {
                (abilityArgs.choices[0] as Card).setPow((abilityArgs.choices[0] as Card).pow() + this.calcFormula(abilityArgs))
            }
        })

        this.sai({
            improvesCard: (c) => { return (c ? (c.pow ? c.pow() : 1) : 1) + qty }
        })

        this.setFormula(`{pow} + ${qty}`)
    }
}
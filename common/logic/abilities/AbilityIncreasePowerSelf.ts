import BaseAbility from "./core/BaseAbility";

export default class AbilityIncreasePowerSelf extends BaseAbility {

    constructor(qty: number) {
        super(`Increase the power of this card by {formula}`, [],(abilityArgs, madeChoices) => {
            abilityArgs.card!.setPow(abilityArgs.card!.pow() + this.calcFormula(abilityArgs))
        })

    }
}
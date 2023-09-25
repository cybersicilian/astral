import BaseAbility from "./core/BaseAbility";

export default class AbilitySetPropSelf extends BaseAbility {
    constructor(prop: string, val: any) {
        super(`(prop set)`, [], (abilityArgs, madeChoices) => {
            abilityArgs.owner.setProp(prop, val, abilityArgs)
        })

        this.sai({
            affectsSelf: 1
        })
    }
}
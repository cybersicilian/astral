import BaseAbility from "./core/BaseAbility";

export default class AbilitySetPropAll extends BaseAbility {
    constructor(prop: string, val: any) {
        super(`(prop set)`, [], (abilityArgs, madeChoices) => {
            [abilityArgs.owner, ...abilityArgs.opps].forEach((player) => player.setProp(prop, val, abilityArgs))
        })

        this.sai({
            affectsSelf: 1,
            affectsOpponents: 1
        }, {
            pbp: [prop]
        })
    }
}
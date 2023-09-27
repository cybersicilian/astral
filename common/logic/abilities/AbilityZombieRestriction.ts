import BaseAbility from "./core/BaseAbility";

export default class AbilityZombieRestriction extends BaseAbility {
    constructor() {
        super(`Play only if you have 0 or less life`, [], (abilityArgs) => {
        })

        this.setCanPlay((abilityArgs) => {
            return abilityArgs.owner.getProp("res_life") && abilityArgs.owner.getProp("res_life") <= 0
        })

        this.sai({

        }, {
            pbp: ["res_life"]
        })
    }
}
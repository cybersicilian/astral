import BaseAbility from "./BaseAbility";

export default class PlayerRestrictionAbilityNeg extends BaseAbility {
    constructor(requiredProp: string) {
        super(`Play only if you don't have ${requiredProp}`, [], (abilityArgs) => {
        })

        this.sai({}, {
            pbp: [requiredProp]
        })

        this.setCanPlay((abilityArgs) => {
            return !abilityArgs.owner.getProp(requiredProp)
        })
    }
}
import BaseAbility from "./BaseAbility";

export default class PlayerRestrictionAbility extends BaseAbility {
    constructor(requiredProp: string) {
        super(`Play only if you have ${requiredProp}`, [], (abilityArgs) => {
        })

        this.setCanPlay((abilityArgs) => {
            return abilityArgs.owner.getProp(requiredProp)
        })

        this.sai({}, {
            pgp: [requiredProp]
        })
    }
}
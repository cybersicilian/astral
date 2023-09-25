import BaseAbility from "./core/BaseAbility";

export default class AbilityAddResource extends BaseAbility {
    constructor(qty: number, resource: string) {
        super(`Add {formula} ${resource}`, [], (abilityArgs) => {
            let amt = this.calcFormula(abilityArgs)
            let owned = abilityArgs.owner.getProp(`res_${resource}`) ?? 0
            abilityArgs.owner.setProp(`res_${resource}`, owned + amt, abilityArgs)
        })
        this.setProp("resource", true)
        if (!this.getProp("produce")) this.setProp("produce", [])
        this.setProp("produce", [...this.getProp("produce"), resource])
        this.setFormula(`{pow} + ${qty}`)

        this.sai({
            collectResource: qty
        })
    }
}
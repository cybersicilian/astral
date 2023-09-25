import BaseAbility from "./BaseAbility";
import {CardArgs} from "../../gameplay/cards/CardArgs";

export default class CostAbility extends BaseAbility {
    constructor(resource: string, amt: number) {
        super(`Pay {formula} ${resource}`, [], (abilityArgs, madeChoices) => {
            abilityArgs.owner.setProp("res_" + resource, abilityArgs.owner.getProp("res_" + resource) - Math.max(amt, 0), abilityArgs)
        })
        this.setProp("cost_ability", true)
        this.setCanPlay((cardArgs) => {
            if (!cardArgs.owner) return false
            return cardArgs.owner.getProp("res_" + resource) >= amt
        })
        this.setFormula(`${amt} - {pow}`)

        this.sai({
            spendResource: (c: CardArgs) => this.calcFormula(c) as number
        })
    }
}
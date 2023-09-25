import BaseAbility from "./core/BaseAbility";

export default class AbilityWin extends BaseAbility {
    constructor(reason: string) {
        super(`You win.`, [], (abilityArgs, madeChoices) => {
            abilityArgs.owner.setCanWin(true, reason)
        })

        this.sai({
            winProgress: 100
        })
    }
}
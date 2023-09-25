import BaseAbility from "./core/BaseAbility";
import Upgrade from "../gameplay/player/systems/Upgrade";
import {CardArgs} from "../gameplay/cards/CardArgs";

export default class AbilityUnlockUpgrade extends BaseAbility {
    constructor(upgrade: Upgrade, restrict: boolean = true) {
        super(`Unlock ${upgrade.getName()} for purchase${restrict ? `. Play only if you haven't unlocked it yet.` : `.`}`, [], (abilityArgs) => {
            if (abilityArgs.owner.upgrades().filter((check) => check.getName() === upgrade.getName()).length == 0) {
                abilityArgs.owner.addUpgrade(upgrade)
            }
        })

        if (restrict) {
            this.setCanPlay((abilityArgs) => {
                return abilityArgs.owner.upgrades().filter((check) => check.getName() === upgrade.getName()).length == 0
            })
        }

        this.sai({
            changesGame: 1,
            affectsSelf: 1,
            unlockUpgrades: (c: CardArgs) => {
                return c.owner.upgrades().filter((check) => check.getName() === upgrade.getName()).length == 0 ? 1 : 0
            }
        })
    }
}
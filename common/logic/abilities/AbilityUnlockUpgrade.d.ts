import BaseAbility from "./core/BaseAbility";
import Upgrade from "../gameplay/player/systems/Upgrade";
export default class AbilityUnlockUpgrade extends BaseAbility {
    constructor(upgrade: Upgrade, restrict?: boolean);
}

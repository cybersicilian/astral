import BaseAbility from "./BaseAbility";
import Player from "../Player";

export default class HarvestAbility extends BaseAbility {
    args: any[];

    validArgs(): boolean {
        return typeof this.args[0] == "number"
    }

    callback(): (player: Player) => void {
        return function (p1: Player) {
            p1.getEmpire()
        };
    }

    description(): string {
        return "";
    }

    name(): string {
        return "";
    }

}
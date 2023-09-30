import BaseAbility from "./core/BaseAbility";
import {CardArgs} from "../gameplay/cards/CardArgs";

export default class AbilityAntivaxxer extends BaseAbility {
    constructor() {
        super(`You become innudated with propaganda - you're an antivaxxer now`, [], (a, m) => {
            a.owner.setProp("antivaxxer", true)
        })

        this.sai({
                meme: 100,
                changesGame: 1,
                affectsSelf: (c: CardArgs) => c.owner.getProp("antivaxxer") ? 0 : -10,
            }, {
            pbp: ["antivaxxer", "zombie", "res_life"]
        })
    }
}
import BaseAbility from "./core/BaseAbility";
import {CardArgs} from "../gameplay/cards/CardArgs";

export default class AbilityAddEventToSelf extends BaseAbility {
    constructor(events: string[], callback: (cbArgs: CardArgs) => void) {
        super(`(event stuff)`, [], (abilityArgs, madeChoices) => {
            for (let event of events) {
                abilityArgs.owner.addEvent(event, callback)
            }
        })

        this.sai({
            affectsSelf: events.length,
            addEvents: events.length
        })
    }
}
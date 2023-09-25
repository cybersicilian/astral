import BaseAbility from "./core/BaseAbility";
import {CardArgs} from "../gameplay/cards/CardArgs";
import {Pointer, Choices} from "../structure/utils/CardEnums";
import Player from "../gameplay/player/Player";
import {VosEvent} from "../structure/utils/Generics";

export default class AbilityAddEventToAll extends BaseAbility {
    constructor(events: string[], callback: VosEvent) {
        super(`(event stuff)`, [], (abilityArgs, madeChoices) => {
            for (let player of [abilityArgs.owner, ...abilityArgs.opps]) {
                for (let event of events) {
                    player.addEvent(event, callback)
                }
            }
        })

        this.sai({
            addEvents: events.length,
            affectsSelf: events.length,
            affectsOpponents: (c: CardArgs) => c.opps.length * events.length
        })
    }
}
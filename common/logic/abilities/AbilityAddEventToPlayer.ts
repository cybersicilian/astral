import BaseAbility from "./core/BaseAbility";
import {CardArgs} from "../gameplay/cards/CardArgs";
import {AIPointer, Choices} from "../structure/utils/CardEnums";
import Player from "../gameplay/player/Player";
import {VosEvent} from "../structure/utils/Generics";

export default class AbilityAddEventToPlayer extends BaseAbility {
    constructor(events: string[], callback: VosEvent) {
        super(`(event stuff)`, [
            { choice: Choices.PLAYER, pointer: AIPointer.PLAYER_LEAST_CARDS }
        ], (abilityArgs, madeChoices) => {
            let target = madeChoices[0] as Player
            for (let event of events) {
                target.addEvent(event, callback)
            }
        })
        this.sai({
            addEvents: events.length,
            affectsSelf: 0.5 * events.length,
            affectsOpponents: (c:CardArgs) => 0.5 * events.length * c.opps.length,
        })
    }
}
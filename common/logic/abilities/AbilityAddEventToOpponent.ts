import BaseAbility from "./core/BaseAbility";
import {CardArgs} from "../gameplay/cards/CardArgs";
import {Pointer, Choices} from "../structure/utils/CardEnums";
import Player from "../gameplay/player/Player";
import {VosEvent} from "../structure/utils/Generics";

export default class AbilityAddEventToOpponent extends BaseAbility {
    constructor(events: string[], callback: VosEvent) {
        super(`(event stuff)`, [
            { choice: Choices.OPPONENT, pointer: Pointer.OPPONENT_MOST_CARDS }
        ], (abilityArgs, madeChoices) => {
            let target = madeChoices[0] as Player
            for (let event of events) {
                target.addEvent(event, callback)
            }
        })
        this.sai({
            addEvents: events.length,
            affectsOpponents: events.length
        })
    }
}
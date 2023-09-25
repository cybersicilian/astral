import {VosEvent} from "../utils/Generics";
import {ITriggerable} from "./ITriggerable";

export type EventCluster = { [key: string]: VosEvent[] }

export interface IEventable extends ITriggerable {
    removeEvent(name: string)
    getEvent(name: string): VosEvent|VosEvent[]|undefined
    on(name: string, callback: VosEvent)
}
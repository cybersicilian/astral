import BaseAbility from "./core/BaseAbility";
import { VosEvent } from "../structure/utils/Generics";
export default class AbilityAddEventToAll extends BaseAbility {
    constructor(events: string[], callback: VosEvent);
}

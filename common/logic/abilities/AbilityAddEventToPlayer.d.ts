import BaseAbility from "./core/BaseAbility";
import { VosEvent } from "../structure/utils/Generics";
export default class AbilityAddEventToPlayer extends BaseAbility {
    constructor(events: string[], callback: VosEvent);
}

import BaseAbility from "./core/BaseAbility";
import { VosEvent } from "../structure/utils/Generics";
export default class AbilityAddEventToOpponent extends BaseAbility {
    constructor(events: string[], callback: VosEvent);
}

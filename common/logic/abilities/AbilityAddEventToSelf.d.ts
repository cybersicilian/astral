import BaseAbility from "./core/BaseAbility";
import { CardArgs } from "../gameplay/cards/CardArgs";
export default class AbilityAddEventToSelf extends BaseAbility {
    constructor(events: string[], callback: (cbArgs: CardArgs) => void);
}

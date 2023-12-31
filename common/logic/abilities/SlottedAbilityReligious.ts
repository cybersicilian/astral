import SlottedAbility, {SlottedCallbacks} from "./core/SlottedAbility";
import Card from "../gameplay/cards/Card";

export default class SlottedAbilityReligious extends SlottedAbility {
    constructor(text: string, slotted: SlottedCallbacks, card: Card) {
        super(`While this is part of your religion, ${text[0].toLowerCase() + text.substring(1)}`, slotted)
    }
}
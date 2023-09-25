import BaseAbility from "./BaseAbility";
import {CardArgs} from "../../gameplay/cards/CardArgs";

export default class PlayerPredicateRestrictionAbility extends BaseAbility {
    constructor(text: string, predicate: (cardArgs: CardArgs) => boolean) {
        super(`${text}`, [], (abilityArgs) => {
        })

        this.setCanPlay((abilityArgs) => {
            return predicate(abilityArgs)
        })
    }
}
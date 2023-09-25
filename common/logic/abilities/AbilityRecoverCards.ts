import BaseAbility from "./core/BaseAbility";
import {AIPointer, Choices} from "../structure/utils/CardEnums";
import Player from "../gameplay/player/Player";
import Card from "../gameplay/cards/Card";

export default class AbilityRecoverCards extends BaseAbility {

    constructor(qty: number) {
        super(`Recover {formula} cards`, (abilityArgs) => {
            return new Array(qty).fill({ choice: Choices.CARD_IN_DISCARD, pointer: AIPointer.CARD_IN_DISCARD_MOST_POWER, distinct: true })
        }, (abilityArgs, madeChoices) => {
            while (madeChoices.length > 0) {
                if (abilityArgs.deck!.discardPile.length == 0) {
                    break;
                }
                let choice = madeChoices.pop() as Card
                abilityArgs.deck!.discardPile.splice(abilityArgs.deck.discardPile!.indexOf(choice), 1)
                abilityArgs.owner.cih().push(choice)
            }
        })
        this.setCanPlay((abilityArgs) => {
            if (!abilityArgs.deck) { return false }
            return abilityArgs.deck.discardPile.length >= qty
        })

        this.sai({
            drawsCards: qty
        })

        this.setFormula(`${qty}`)
    }
}
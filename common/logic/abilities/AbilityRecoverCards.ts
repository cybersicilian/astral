import BaseAbility from "./core/BaseAbility";
import {Pointer, Choices} from "../structure/utils/CardEnums";
import Player from "../gameplay/player/Player";
import Card from "../gameplay/cards/Card";
import {Zone} from "../gameplay/cards/Zone";

export default class AbilityRecoverCards extends BaseAbility {

    constructor(qty: number) {
        super(`Recover {formula} cards`, (abilityArgs) => {
            return new Array(qty).fill({ choice: Choices.CARD_IN_DISCARD, pointer: Pointer.CARD_IN_DISCARD_MOST_POWER, distinct: true })
        }, (abilityArgs, madeChoices) => {
            while (madeChoices.length > 0) {
                if (abilityArgs.deck!.discardPile.length == 0) {
                    break;
                }
                let choice = madeChoices.pop() as Card
                choice.move(Zone.HAND, abilityArgs)
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
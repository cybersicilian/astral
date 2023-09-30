import BaseAbility from "./core/BaseAbility";
import {Pointer, Choices} from "../structure/utils/CardEnums";
import Card from "../gameplay/cards/Card";
import {Zone} from "../gameplay/cards/Zone";

export default class AbilityExplodeCard extends BaseAbility {
    constructor() {
        super(`Explode a card in your hand. The new cards each have power {formula}.`, [
            {
                choice: Choices.CARD_IN_HAND,
                distinct: true,
                pointer: Pointer.CARD_IN_HAND_MOST_POWER,
                restriction: (card) => {
                    //choose a card that isn't a fragment
                    return !card.card.getProp("fragment")
                }
            }
        ], (abilityArgs, madeChoices) => {
            //to explode a card, remove it from the game, then for each ability on it, create a new card with only that ability.
            let card = madeChoices[0] as Card
            let new_cards = card.explode(abilityArgs)
            new_cards.forEach((card) => {
                card.setPow(this.calcFormula(abilityArgs))
                card.move(Zone.HAND, abilityArgs)
            })
        })

        this.sai({
                drawsCards: (cardArgs) => {
                    return this.calcFormula(cardArgs)
                },
                improvesCard: (cardArgs) => this.calcFormula(cardArgs)
            })

    }
}
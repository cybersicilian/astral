import BaseAbility from "./core/BaseAbility";
import {AIPointer, Choices} from "../structure/utils/CardEnums";
import Card from "../gameplay/cards/Card";

export default class AbilityExplodeCard extends BaseAbility {
    constructor() {
        super(`Explode a card in your hand. The new cards each have power {formula}.`, [
            {
                choice: Choices.CARD_IN_HAND,
                distinct: true,
                pointer: AIPointer.CARD_IN_HAND_MOST_POWER,
                restriction: (card) => {
                    //choose a card that isn't a fragment
                    return !card.card.getProp("fragment")
                }
            }
        ], (abilityArgs, madeChoices) => {
            //to explode a card, remove it from the game, then for each ability on it, create a new card with only that ability.
            let card = madeChoices[0] as Card
            abilityArgs.owner.setCiH(abilityArgs.owner.cih().filter((c) => c !== card))
            let new_cards = card.explode()
            abilityArgs.owner.cih().push(...new_cards)
        })

        this.sai({
                drawsCards: (cardArgs) => {
                    return this.calcFormula(cardArgs)
                },
                improvesCard: (cardArgs) => this.calcFormula(cardArgs)
            })

    }
}
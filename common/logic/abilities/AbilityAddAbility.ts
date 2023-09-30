import BaseAbility from "./core/BaseAbility";
import {Choices, Pointer} from "../structure/utils/CardEnums";
import Card from "../gameplay/cards/Card";

export default class AbilityAddAbility extends BaseAbility {
    constructor(ability: BaseAbility, newName: string = `{name}`, cardChoice: Choices.CARD_IN_HAND | Choices.CARD_IN_DISCARD = Choices.CARD_IN_HAND) {
        super(
            `Add "${ability.getRawText()}" to a card in ${cardChoice === Choices.CARD_IN_HAND ? "your hand" : "the discard pile"}`,
            [{
                choice: cardChoice,
                pointer: cardChoice === Choices.CARD_IN_HAND ? Pointer.CARD_IN_HAND_RANDOM : Pointer.CARD_IN_DISCARD_RANDOM,
            }], (args, madeChoices) => {
                let card = madeChoices[0] as Card
                let formatting = newName.replace(`{name}`, card.getName())
                card.setName(formatting)
                card.addAbility(ability.clone().setFormula(`${ability.getFormula()} - ${card.pow()}`))
            })
        this.setFormula(`${ability.getFormula()} - 1`)
        this.sai(ability.ai())
    }
}
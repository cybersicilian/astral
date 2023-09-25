import BaseAbility from "./core/BaseAbility";
import {Pointer, Choices} from "../structure/utils/CardEnums";
import Player from "../gameplay/player/Player";
import Card from "../gameplay/cards/Card";

export default class AbilityDiscardSelfCard extends BaseAbility {

    constructor(qty: number) {
        super(`Discard {formula} cards at random`, [], (abilityArgs, madeChoices) => {
                abilityArgs.owner.discardRandom(abilityArgs)
            })

        this.sai({
            affectsSelf: (cardArgs) => cardArgs.card.pow() + qty,
            discardsCards: (cardArgs) => cardArgs.card.pow() + qty
        })
        this.setFormula(`${qty} - {pow}`)
    }
}
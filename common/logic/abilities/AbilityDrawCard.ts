import BaseAbility from "./core/BaseAbility";

export default class AbilityDrawCard extends BaseAbility {

    constructor(qty: number) {
        super(`Draw {formula} cards`, [], (abilityArgs, madeChoices) => {
            abilityArgs.owner.draw(abilityArgs.deck!, this.calcFormula(abilityArgs))
        })

        this.sai({
            drawsCards: (cardArgs) => cardArgs.card.pow() + qty
        })

        this.setFormula(`{pow} + ${qty}`)
    }
}
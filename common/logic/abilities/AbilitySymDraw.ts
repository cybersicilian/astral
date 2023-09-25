import BaseAbility from "./core/BaseAbility";

export default class AbilitySymDraw extends BaseAbility {

    constructor(qty: number) {
        super(`Each player draws {formula} cards`, [], (abilityArgs, madeChoices) => {
            abilityArgs.owner.draw(abilityArgs.deck, abilityArgs.card.pow() + qty)
            for (let opp of abilityArgs.opps) {
                opp.draw(abilityArgs.deck, abilityArgs.card.pow() + qty)
            }
        })

        this.sai({
            drawsCards: qty,
            drawsOpponentCards: qty
        })
        this.setFormula(`{pow} + ${qty}`)
    }
}
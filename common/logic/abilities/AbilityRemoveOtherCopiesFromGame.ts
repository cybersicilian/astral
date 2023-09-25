import BaseAbility from "./core/BaseAbility";

export default class AbilityRemoveOtherCopiesFromGame extends BaseAbility {
    constructor() {
        super(`Remove all other copies of this card from the game`, [], (abilityArgs, madeChoices) => {
            let players = abilityArgs.opps.concat(abilityArgs.owner)
            for (let player of players) {
                player.setCiH(player.cih().filter((c) => {
                    if (!c || !abilityArgs.card) { return false }
                    return c.getName() !== abilityArgs.card.getName()
                }))
            }
            abilityArgs.deck!.set(abilityArgs.deck!.filter((c) => {
                if (!c || !abilityArgs.card) { return false }
                return c.getName() !== abilityArgs.card.getName()
            }))
            abilityArgs.deck!.discardPile = abilityArgs.deck!.discardPile.filter((c) => {
                if (!c || !abilityArgs.card) { return false }
                return c.getName() !== abilityArgs.card.getName()
            })
            abilityArgs.card!.skipDiscard()
            abilityArgs.deck!.shuffle()
        })

        this.sai({
            changesGame: 1
        })
    }
}
import BaseAbility from "./core/BaseAbility";
import Card from "../gameplay/cards/Card";

export default class AbilityRemoveOtherCopiesFromGame extends BaseAbility {
    constructor() {
        super(`Remove all other copies of this card from the game`, [], (abilityArgs, madeChoices) => {
            let players = abilityArgs.opps.concat(abilityArgs.owner)
            let toRemove = []
            for (let player of players) {
                toRemove.push(...player.cih().filter((c) => {
                    if (!c || !abilityArgs.card) { return false }
                    return c.getName() === abilityArgs.card.getName()
                }))
            }
            toRemove.push(...abilityArgs.deck!.discardPile.filter((c) => {
                if (!c || !abilityArgs.card) { return false }
                return c.getName() === abilityArgs.card.getName()
            }))
            //from the deck as well
            toRemove.push(...abilityArgs.deck!.filter((c) => {
                if (!c || !abilityArgs.card) { return false }
                return c.getName() === abilityArgs.card.getName()
            }))

            toRemove.forEach((c: Card) => {
                c.remove(abilityArgs)
            })

            abilityArgs.card!.skipDiscard()
            abilityArgs.deck!.shuffle()
        })

        this.sai({
            changesGame: 1
        })
    }
}
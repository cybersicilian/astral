import BaseAbility from "./core/BaseAbility";

export default class AbilityShuffleDiscardIntoDeck extends BaseAbility {
    constructor() {
        super("Shuffle the discard pile into the deck", [], (abilityArgs, madeChoices) => {
            abilityArgs.deck!.reshuffle()
        })
    }
}
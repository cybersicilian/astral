import BaseAbility from "./core/BaseAbility";
import DeckList from "../gameplay/deck/DeckList";
import Deck from "../gameplay/deck/Deck";
import {CardArgs} from "../gameplay/cards/CardArgs";

export default class AbilityAddDeck extends BaseAbility {
    constructor(deck_name: string, size=75, unique: boolean = true, kill: boolean = false) {
        super(`Add the ${deck_name.replace("_", " ").replace(" deck", "")} deck to the game${unique ? " if it hasn't been already." : ""}`, [], (abilityArgs) => {
            if (DeckList[deck_name] && (!unique || !abilityArgs.deck!.props[`added_${deck_name}`])) {
                abilityArgs.deck!.addCards(Deck.fromCardList(size, DeckList[deck_name]))
                abilityArgs.deck!.shuffle()
            }
        })
        if (unique && kill) {
            this.setCanPlay((abilityArgs: CardArgs) => {
                return !abilityArgs.deck!.props[`added_${deck_name}`]
            })
        }

        this.sai({
            addCardsToDeck: size,
            changesGame: 1
        })

        this.setProp("deck", true)
    }
}
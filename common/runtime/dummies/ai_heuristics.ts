import Card from "../../logic/gameplay/cards/Card";
import DeckList from "../../logic/gameplay/deck/DeckList";
import Player from "../../logic/gameplay/player/Player";
import Deck from "../../logic/gameplay/deck/Deck";
import {ResolverCallback} from "../../logic/structure/utils/Resolver";

export function adjustAIWeights(num_sims: number = 100, console_output: boolean = true) {
    let cardList: Card[] = []
    let aggTraits = {}
    let iter = 0;
    let sims = 100;
    for (let s = sims; s > 0; s--) {
        let deck = Deck.fromCardList(300, "basic")
        let bots = [];
        for (let i = 0; i < 3 + sims % 3; i++) {
            bots.push(new Player(7, deck).setBot())
        }

        for (let deck of Object.values(DeckList)) {
            cardList.push(...deck.map((card) => card.clone()))
        }

        for (let card of cardList) {
            for (let p = 0; p < bots.length; p++) {
                let cardArgs = {
                    owner: bots[p],
                    opps: bots.filter((b, i) => i !== p),
                    card: card
                }
                let weightings = card.getTraits(cardArgs).profile
                for (let trait in weightings) {
                    if (!aggTraits[trait]) {
                        aggTraits[trait] = 0
                    }
                    aggTraits[trait] += weightings[trait]
                }
                iter++;
            }
        }
        if (console_output) {
            console.log(`${s} simulation${s > 1 ? 's' : ""} remaining... (${iter} iterations)`)
        }
    }
    //now divide each trait by iter
    for (let trait in aggTraits) {
        aggTraits[trait] /= iter
        aggTraits[trait] = 1/aggTraits[trait]
    }

    if (console_output) {
        console.log(aggTraits)
    }
    return aggTraits
}
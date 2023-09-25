import Card from "../cards/Card";
import {Rarity} from "../../structure/utils/CardEnums";
import {Zone} from "../cards/Zone";

export default class Deck extends Array<Card> {
    discardPile: Card[] = [];
    props: {[key: string]: any} = {}

    set(card: Card[]) {
        this.splice(0, this.length, ...card);
        return this
    }

    asArray() {
        return this as Card[]
    }

    addCard(card: Card, amt: number = 1) {
        for (let i = 0; i < amt; i++) {
            this.push(card.clone().setZone(Zone.DECK));
        }
        return this
    }

    addCards(cards: Card[]) {
        this.push(...cards.map((card) => card.clone().setZone(Zone.DECK)));
        return this
    }

    shuffle() {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * i);
            const temp = this[i];
            this[i] = this[j];
            this[j] = temp;
        }
    }

    reshuffle() {
        this.push(...this.discardPile.map((card) => card.setZone(Zone.DECK)));
        this.discardPile = [];
        this.shuffle();
    }

    draw(qty: number = 1) {
        let cards = [];
        for (let i = 0; i < qty; i++) {
            if (this.length === 0) {
                this.reshuffle();
            }
            cards.push(this.pop().setZone(Zone.HAND));
        }
        return cards
    }

    static fromCardList(size: number, cards: Card[]) {
        //weight by rarity
        //each rarity should be 75% as common as the previous rarity
        //each card should appear at least once
        let rarityMap = {}
        for (let card of cards) {
            if (!rarityMap[card.getRarity()]) rarityMap[card.getRarity()] = 0;
            rarityMap[card.getRarity()]++
        }

        let rarityWeights = {}
        let total = 0;
        for (let rarity of Object.keys(rarityMap)) {
            rarityWeights[rarity] = size * Math.pow(0.75, Object.keys(rarityMap).indexOf(rarity))
            total += rarityWeights[rarity]
        }
        //normalize rarity weights to the deck size
        for (let rarity of Object.keys(rarityMap)) {
            rarityWeights[rarity] = Math.round(rarityWeights[rarity] / total * size)
        }


        let deck = new Deck();
        for (let card of cards) {
            deck.addCard(card.clone(), rarityWeights[card.getRarity()])
        }
        return deck;
    }
}
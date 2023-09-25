import Card from "../cards/Card";
export default class Deck extends Array<Card> {
    discardPile: Card[];
    props: {
        [key: string]: any;
    };
    set(card: Card[]): this;
    asArray(): Card[];
    addCard(card: Card, amt?: number): this;
    addCards(cards: Card[]): this;
    shuffle(): void;
    reshuffle(): void;
    draw(qty?: number): (Card | undefined)[];
    getSerializable(): {
        cards: any[];
        discardPile: any[];
        props: {
            [key: string]: any;
        };
    };
    static fromCardList(size: number, cards: Card[]): Deck;
}

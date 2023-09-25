export enum Zone {
    DECK,

    //these all collapse into Zone.Deck, but are valid zones to move to
    TOP_DECK,
    BOTTOM_DECK,
    RANDOM_DECK,

    HAND,
    DISCARD,
    NONE
}
import Card from "../gameplay/cards/Card";
import {CardState} from "../gameplay/player/Player";

export type SlottableTier = {
    name?: string
    slots: number,
    pillars?: number,
    permanent?: boolean
}

export type CardSlottableState = {
    structure: SlottableTier[],
    slots: CardState[]
}

export abstract class CardSlottable {

    private readonly structure: SlottableTier[] = [];

    private abstract slots: Card[] = [];

    abstract isValid(card: Card): boolean
    abstract getValidTiers(card: Card): number[]

    abstract addCard(card: Card, tier: number = 0): boolean

    abstract getCards(): Card[]
    abstract getCardsOfTier(tier: number): Card[]

    abstract toState(): CardSlottableState
}
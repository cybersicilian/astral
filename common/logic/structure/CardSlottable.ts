import Card from "../gameplay/cards/Card";
import {CardState} from "../gameplay/player/Player";
import {CardArgs} from "../gameplay/cards/CardArgs";
import {IStateable} from "./interfaces/IStateable";

export type SlottableTier = {
    name?: string
    slots: number,
    pillars?: number,
    permanent?: boolean
}

export type CardSlottableState = {
    structure: SlottableTier[],
    slots: CardState[],
    validity: SlottableValidityMap
}

export type SlottableValidityMap = boolean[]

export abstract class CardSlottable implements IStateable<CardSlottableState> {

    protected structure: SlottableTier[] = [];
    protected slots: Card[] = [];

    abstract isValid(card: Card): boolean
    abstract getValidTiers(card: Card): number[]

    addCard(args: CardArgs, tier: number = 0): boolean {
        // args.card.remove(args)
        if (this.getValidTiers(args.card).includes(tier)) {
            this.slots[tier] = args.card;
            args.card.onSlottable(args)
            return true;
        } else if (this.isValid(args.card)) {
            for (let i of this.getValidTiers(args.card)) {
                if (this.slots[i] === undefined) {
                    this.slots[i] = args.card;
                    args.card.onSlottable(args)
                    return true;
                }
            }
        }
        return false;
    }

    abstract getCards(): Card[]
    abstract getCardsOfTier(tier: number): Card[]

    abstract toState(args: CardArgs): CardSlottableState
}
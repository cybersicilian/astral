import { CardArgs } from "../../gameplay/cards/CardArgs";
export type VosEvent = (cardArgs: CardArgs) => void;
export declare enum CardAction {
    PLAY = 0,
    DISCARD = 1,
    GIVE = 2,
    SELECT = 3
}

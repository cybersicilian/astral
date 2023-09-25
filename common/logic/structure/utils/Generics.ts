import {CardArgs} from "../../gameplay/cards/CardArgs";

export type VosEvent = (cardArgs: CardArgs) => void

export enum CardAction {
    PLAY,
    DISCARD,
    GIVE,
    SELECT
}
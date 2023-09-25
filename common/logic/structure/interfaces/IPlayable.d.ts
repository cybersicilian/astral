import { ResolverCallback } from "../utils/Resolver";
import { CardArgs } from "../../gameplay/cards/CardArgs";
import Player from "../../gameplay/player/Player";
export interface IPlayable {
    canPlay: ResolverCallback<(c: CardArgs) => boolean>;
    canGive: ResolverCallback<(p: Player, c: CardArgs) => boolean>;
    canBePlayed(cardArgs: CardArgs): boolean;
    canBeGiven(opp: Player, cardArgs: CardArgs): boolean;
}

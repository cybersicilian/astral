import Player from "../player/Player";
import Deck from "../deck/Deck";
import Card from "./Card";
import {ChoiceType} from "./choices/ChoiceType";

export type CardArgs = {
    owner: Player,
    opps: Player[],
    deck?: Deck,
    card?: Card,
    choices?: (ChoiceType)[]
}
import {CardArgs} from "../cards/CardArgs";

export type Weights = {
    play: number|((cardArgs: CardArgs) => number),
    give: number|((cardArgs: CardArgs) => number),
    discard: number|((cardArgs: CardArgs) => number)
}
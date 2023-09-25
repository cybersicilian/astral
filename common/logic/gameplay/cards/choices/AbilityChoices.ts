import {Pointer, Choices} from "../../../structure/utils/CardEnums";
import {CardArgs} from "../CardArgs";
import Player from "../../player/Player";
import Card from "../Card";
import {ChoiceType} from "./ChoiceType";

export type AbilityChoices = {
    pointer: Pointer|((cardArgs: CardArgs) => (ChoiceType)),
    choice: Choices,
    distinct?: boolean,
    restriction?: (cardArgs: CardArgs) => boolean
}
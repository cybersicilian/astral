import Player from "../Player";
import { CardArgs } from "../../cards/CardArgs";
import { AbilityChoices } from "../../cards/choices/AbilityChoices";
import { ChoiceType } from "../../cards/choices/ChoiceType";
import Card from "../../cards/Card";
export default class Bot {
    private optimality;
    private readonly profile;
    private readonly profileName;
    constructor(profile?: string);
    getProfileName(): string;
    getProfile(): {};
    static makeSpecificChoice(args: CardArgs, choice: AbilityChoices): (Card | Player | null)[];
    optimalityCrux(decisions: ChoiceType[]): ChoiceType;
    selectChoices(choices: AbilityChoices[], args: CardArgs): ChoiceType[];
    evaluate(card: Card, c: CardArgs): number;
}

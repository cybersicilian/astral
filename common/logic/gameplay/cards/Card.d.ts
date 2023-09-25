import Player, { CardState } from "../player/Player";
import Deck from "../deck/Deck";
import { CardArgs } from "./CardArgs";
import BaseAbility from "../../abilities/core/BaseAbility";
import { Rarity } from "../../structure/utils/CardEnums";
import { IIdentifiable } from "../../structure/interfaces/IIdentifiable";
import { ChoiceType } from "./choices/ChoiceType";
import { IProppable, Properties } from "../../structure/interfaces/IProppable";
import { ITriggerable } from "../../structure/interfaces/ITriggerable";
import { IPlayable } from "../../structure/interfaces/IPlayable";
import { Resolver } from "../../structure/utils/Resolver";
import { AIProfile } from "../ai/AIProfile";
export default class Card implements IIdentifiable, IProppable, ITriggerable, IPlayable {
    private readonly name;
    private abilities;
    private power;
    private rarity;
    private canPlay;
    private canGive;
    private discardable;
    protected props: Properties;
    constructor(name: string, abilities: BaseAbility[]);
    setCanPlay(canPlay: Resolver<boolean>): this;
    setCanGive(canGive: Resolver<boolean>): this;
    setProps(props: {
        [key: string]: any;
    }): this;
    setProp(prop: string, value: any, args?: CardArgs): this;
    addAbility(ability: BaseAbility): this;
    getChoices(cardArgs: CardArgs): import("./choices/AbilityChoices").AbilityChoices[];
    skipDiscard(): this;
    doSkipDiscard(): boolean;
    getProps(): Properties;
    getProp(prop: string): any;
    clone(): Card;
    canBePlayed(cardArgs: CardArgs): boolean;
    canBeGiven(opp: Player, cardArgs: CardArgs): any;
    setRarity(rarity: Rarity): this;
    getRarity(): Rarity;
    getAbilities(): BaseAbility[];
    getWeights(cardArgs: CardArgs): {
        play: number;
        give: number;
        discard: number;
    };
    getName(): string;
    setName(name: string): this;
    toCardState(): CardState;
    getLogText(): string;
    pow(): number;
    setPow(pow: number): this;
    explode(): Card[];
    orderAbilities(): BaseAbility[];
    fireEvents(event: string, cardArgs: CardArgs): void;
    play(owner: Player, opps: Player[], deck: Deck, choices?: (ChoiceType)[][]): void;
    draw(owner: Player, opps: Player[], deck?: Deck): void;
    give(owner: Player, opps: Player[], deck?: Deck): void;
    discard(owner: Player, opps: Player[], deck?: Deck): void;
    getText(): string;
    getFormulatedText(cardArgs: CardArgs): string;
    getFormulas(): string[];
    getTraits(c: CardArgs): AIProfile;
    static combine(...cards: Card[]): Card;
}

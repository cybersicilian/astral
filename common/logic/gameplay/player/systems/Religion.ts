import {CardSlottable, CardSlottableState, SlottableTier} from "../../../structure/CardSlottable";
import {IIdentifiable, IIdentifiableState} from "../../../structure/interfaces/IIdentifiable";
import {IProppable, IProppableState, Properties} from "../../../structure/interfaces/IProppable";
import Card from "../../cards/Card";
import {CardArgs} from "../../cards/CardArgs";
import {ResolverCallback} from "../../../structure/utils/Resolver";
import {Systems} from "../../../structure/utils/Systems";

export default class Religion extends CardSlottable implements IIdentifiable, IProppable {
    private readonly structure: SlottableTier[];

    private slots: Card[] = [];
    private name: string;
    private props: Properties;

    constructor(name: string) {
        super();

        this.structure = [
            {
                name: "Foundation",
                slots: 1
            },
            {
                name: "Pillars",
                slots: 1
            },
            {
                name: "Doctrine",
                slots: 1
            }
        ]

        this.slots.fill(undefined, 0, this.structure.length)
    }

    getValidTiers(card: Card): number[] {
        return card.getProp(Systems.RELIGION) ?? []
    }

    addCard(args: CardArgs, tier: number = 0): boolean {
        return super.addCard(args, tier)
    }

    getCards(): Card[] {
        return this.slots;
    }

    getCardsOfTier(tier: number): Card[] {
        return [this.slots[tier]];
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): Religion {
        this.name = name
        return this
    }

    getProp(prop: string): any {
        return this.props[prop];
    }

    getProps(): Properties {
        return this.props
    }

    isValid(card: Card): boolean {
        return (card.getProp(Systems.RELIGION) !== undefined) && (card.getProp(Systems.RELIGION).filter((tier: number) => {
            return this.slots[tier] === undefined
        })).length > 0
    }

    setProp(prop: string, value: any, args?: CardArgs) {
        this.props[prop] = args ? new ResolverCallback(value).resolve(args) : value
        return this
    }

    toState(args: CardArgs): CardSlottableState&IIdentifiableState&IProppableState {
        return {
            name: this.name,
            props: this.props,
            structure: this.structure,
            slots: this.slots.map((card) => {
                return card.toState(args)
            }),
            validity: args.owner.cih().map((card) => {
                return this.isValid(card)
            })
        }
    }

}
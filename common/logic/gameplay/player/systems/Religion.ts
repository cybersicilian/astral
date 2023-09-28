import {CardSlottable, CardSlottableState, SlottableTier} from "../../../structure/CardSlottable";
import {IIdentifiable} from "../../../structure/interfaces/IIdentifiable";
import {IProppable, Properties} from "../../../structure/interfaces/IProppable";
import Card from "../../cards/Card";
import {CardArgs} from "../../cards/CardArgs";
import {ResolverCallback} from "../../../structure/utils/Resolver";

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
    }

    getValidTiers(card: Card): number[] {
        return [];
    }

    addCard(card: Card, tier: number = 0): boolean {
        if (this.getValidTiers(card).includes(tier)) {
            this.slots[tier] = card;
            return true;
        }
        return false;
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
        return false;
    }

    setProp(prop: string, value: any, args?: CardArgs) {
        this.props[prop] = args ? new ResolverCallback(value).resolve(args) : value
        return this
    }

    toState(): CardSlottableState {
        return {
            structure: this.structure,
            slots: this.slots.map((card) => {
                return card.toState()
            })
        }
    }

}
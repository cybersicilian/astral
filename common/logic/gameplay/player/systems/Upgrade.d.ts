import { CardArgs } from "../../cards/CardArgs";
export type UpgradeData = {
    name: string;
    description: string;
    cost: {
        amt: number;
        resource: string;
    }[];
    locked?: boolean;
};
export default class Upgrade {
    private readonly data;
    private readonly effect;
    private infinite;
    private scale;
    private level;
    constructor(data: UpgradeData, effect: (cardArgs: CardArgs, upgrade: Upgrade) => void, infinite?: boolean, scale?: number);
    lvl(): number;
    getCost(): {
        amt: number;
        resource: string;
    }[];
    getData(cardArgs: CardArgs): {
        name: string;
        description: string;
        cost: {
            amt: number;
            resource: string;
        }[];
        locked: boolean;
    };
    getName(): string;
    getDescription(): string;
    canPayCost(cardArgs: CardArgs): boolean;
    payCost(cardArgs: CardArgs): void;
    locked(): boolean | undefined;
    unlock(cardArgs: CardArgs): void;
}

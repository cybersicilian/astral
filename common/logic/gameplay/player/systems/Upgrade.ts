import {CardArgs} from "../../cards/CardArgs";

export type UpgradeData = {
    name: string,
    description: string,
    cost: {
       amt: number,
       resource: string
    }[],
    locked?: boolean,
    level?: number
}

export default class Upgrade {
    private readonly data: UpgradeData
    private readonly effect: (cardArgs: CardArgs, upgrade: Upgrade) => void
    private readonly infinite: boolean = false
    private readonly scale: number = 1.1

    constructor(data: UpgradeData, effect: (cardArgs: CardArgs, upgrade: Upgrade) => void, infinite= false, scale = 1.1) {
        this.data = JSON.parse(JSON.stringify(data))
        if (!this.data.level) {
            this.data.level = 0
        }
        this.effect = effect
        this.infinite = infinite
        this.scale = scale
    }

    lvl() {
        return this.data.level
    }

    getCost() {
        return this.data.cost
    }

    getData(cardArgs: CardArgs) {
        return {
            name: this.getName(),
            description: this.getDescription(),
            cost: this.getCost(),
            locked: this.data.locked || !this.canPayCost(cardArgs),
            level: this.data.level
        }
    }

    getName() {
        return `${this.data.name}${this.infinite && this.data.level > 0 ? ` Lvl. ${this.data.level}` : ``}`
    }

    getDescription() {
        let text = this.data.description;
        text = text.replace(`{level}`, this.level + "")
        //regex match any text in {} and evaluate it as javascript code
        let matches = text.match(/{[^}]*}/g)
        if (matches) {
            for (let match of matches) {
                let code = match.substring(1, match.length - 1)
                text = text.replace(match, eval(code))
            }
        }
        return text;
    }

    canPayCost(cardArgs: CardArgs) {
        let available_resources = cardArgs.owner.getResources()
        for (let cost of this.data.cost) {
            if (cost.resource == "turns") continue
            if (!available_resources[cost.resource]) return false
            if (available_resources[cost.resource] < cost.amt) {
                return false
            }
        }
        return true;
    }

    payCost(cardArgs: CardArgs) {
        let available_resources = cardArgs.owner.getResources()
        for (let cost of this.data.cost) {
            if (cost.resource === "turns") {
                cardArgs.owner.addTurns(cost.amt)
                continue
            } else {
                cardArgs.owner.setProp(`res_${cost.resource}`, available_resources[cost.resource] - cost.amt, cardArgs)
            }
        }
    }

    locked() {
        return this.data.locked
    }

    unlock(cardArgs: CardArgs) {
        if (!this.data.locked) {
            this.payCost(cardArgs)
            this.effect(cardArgs, this)
            this.level++;
            if (!this.infinite) {
                this.data.locked = true
            } else {
                //increase all the costs
                for (let cost of this.data.cost) {
                    cost.amt = Math.ceil(cost.amt * this.scale)
                }
            }
        }
    }
}
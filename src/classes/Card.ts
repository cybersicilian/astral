import BaseAbility from "./abilities/BaseAbility";
import BaseCost from "./costs/BaseCost";
import {ICostable} from "../interfaces/ICostable";

export class Card implements ICostable {
    private readonly name: string
    private readonly abilities: BaseAbility[]
    private readonly cost: BaseCost|null

    private power: number = 1

    constructor(name: string, cost: BaseCost, power: number = 1) {
        this.name = name
        this.power = power

        this.abilities = []
        this.cost = cost
    }

    addAbility(ability: BaseAbility) {
        this.abilities.push(ability)
        return this
    }

    setPower(power: number) {
        this.power = power
        return this
    }

    getAbilities(): BaseAbility[] {
        return this.abilities
    }

    getCost(): BaseCost|null {
        return this.cost
    }

    getName(): string {
        return this.name
    }

    getPower() {
        return this.power
    }

    getDescription(): string {
        return this.abilities.map(ability => ability.description()).join("\n")
    }
}
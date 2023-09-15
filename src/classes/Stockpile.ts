import {EnumResource} from "../enum/EnumResource";

export default class Stockpile extends Map<EnumResource, number> {
    constructor() {
        super();
    }

    add(EnumResource: EnumResource, amount: number) {
        if (this.has(EnumResource)) {
            this.set(EnumResource, this.get(EnumResource) + amount);
        } else {
            this.set(EnumResource, amount);
        }
    }

    removeZero(EnumResource: EnumResource, amount: number): number {
        if (this.has(EnumResource)) {
            let tot = this.get(EnumResource);
            this.set(EnumResource, Math.max(0, this.get(EnumResource) - amount));
            if (tot - amount < 0) {
                return amount - tot;
            }
            return 0;
        } else {
            this.set(EnumResource, 0);
            return amount;
        }
    }

    remove(EnumResource: EnumResource, amount: number) {
        if (this.has(EnumResource)) {
            this.set(EnumResource, Math.max(0, this.get(EnumResource) - amount));
        } else {
            this.set(EnumResource, -amount);
        }
    }

    canPay(EnumResource: EnumResource, amount: number): boolean {
        if (this.has(EnumResource)) {
            return this.get(EnumResource) >= amount;
        } else {
            return false;
        }
    }

    serialize() {
        let obj: any = {};
        for (let [key, value] of this.entries()) {
            obj[key] = value;
        }
        return obj;
    }

    static deserialize(obj: any): Stockpile {
        let stock = new Stockpile();
        for (let key in obj) {
            stock.set(parseInt(key) as EnumResource, obj[key]);
        }
        return stock;
    }
}
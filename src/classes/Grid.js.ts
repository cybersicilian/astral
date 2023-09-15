import {EnumGridBase} from "../enum/EnumGridBase";
import {EnumResource} from "../enum/EnumResource";

export default class Grid {

    private readonly base: EnumGridBase;

    constructor(base: EnumGridBase) {
        this.base = base;
    }

    getBase() {
        return this.base;
    }

    getResource() {
        return EnumResource.
    }

    serialize() {
        return {
            base: this.base
        }
    }

    static deserialize(obj: any): Grid {
        return new Grid(obj);
    }
}
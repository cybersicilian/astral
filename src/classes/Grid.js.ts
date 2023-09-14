import {EnumGridBase} from "../enum/EnumGridBase";

export default class Grid {

    private readonly base: EnumGridBase;

    constructor(base: EnumGridBase) {
        this.base = base;
    }

    getBase() {
        return this.base;
    }
}
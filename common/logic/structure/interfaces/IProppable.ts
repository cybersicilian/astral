import {CardArgs} from "../../gameplay/cards/CardArgs";
import {IStateable} from "./IStateable";

export type Properties<Type = any> = {[key: string]: Type}

export type IProppableState = {
    props: Properties<IStateable>
}

export interface IProppable {
    getProp(prop: string): any
    getProps(): Properties
    setProp(prop: string, value: any, args?: CardArgs)
}
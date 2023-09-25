import { CardArgs } from "../../gameplay/cards/CardArgs";
export type Properties = {
    [key: string]: any;
};
export interface IProppable {
    getProp(prop: string): any;
    getProps(): Properties;
    setProp(prop: string, value: any, args?: CardArgs): any;
}

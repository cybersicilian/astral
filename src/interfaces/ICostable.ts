import BaseCost from "../classes/costs/BaseCost";

export interface ICostable {
    getCost(): BaseCost
}
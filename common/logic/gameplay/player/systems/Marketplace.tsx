
export type MarketplaceItem = {
    name: string,
    price: number,
    qty: number
}

export class Marketplace {
    private prices: { [key: string]: MarketplaceItem } = {}


}
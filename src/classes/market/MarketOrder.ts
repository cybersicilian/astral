import {EnumResource} from "../../enum/EnumResource";
import {v4 as uuidv4} from "uuid";

enum OrderType {
    Buy,
    Sell
}

export default class MarketOrder {
    private readonly id: string;
    private readonly owner: string;
    private readonly type: OrderType;
    private readonly resource: EnumResource;
    private readonly price: number;
    private readonly quantity: number;


    private readonly createdAt: number;
    private readonly expiresAt: number;

    constructor(owner: string, type: OrderType, resource: EnumResource, price: number, quantity: number, ttl=-1) {
        this.id = uuidv4();
        this.owner = owner;
        this.type = type;
        this.resource = resource;
        this.price = price;
        this.quantity = quantity;

        this.createdAt = Date.now();
        if (ttl === -1) {
            this.expiresAt = -1;
        } else {
            this.expiresAt = this.createdAt + ttl;
        }
    }

    getId(): string {
        return this.id;
    }

    getOwner(): string {
        return this.owner;
    }

    getType(): OrderType {
        return this.type;
    }

    getResource(): EnumResource {
        return this.resource;
    }

    getPrice(): number {
        return this.price;
    }

    getQuantity(): number {
        return this.quantity;
    }
}
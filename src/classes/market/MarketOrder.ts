import {EnumResource} from "../../enum/EnumResource";
import {v4 as uuidv4} from "uuid";
import GameServer from "../GameServer";
import Player from "../Player";

enum OrderType {
    Buy,
    Sell
}

export default class MarketOrder {
    private id: string;

    private readonly owner: string;
    private readonly type: OrderType;
    private readonly resource: EnumResource;
    private readonly price: number;
    private readonly quantity: number;


    private createdAt: number;
    private expiresAt: number;

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

    setId(id: string) {
        this.id = id;
        return this;
    }

    setTimestamps(createdAt: number, expiresAt: number) {
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        return this;
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

    static fromId(id: number, server: GameServer): MarketOrder[] {
        //retrieve from db
        let db = server.db();
        let query = db.prepare("SELECT * FROM market_orders WHERE UID = ?");
        let rows = query.all(id);
        return rows.map((result) => {
           let order = new MarketOrder(result["Owner"] as string, result["Type"] as OrderType, result["Resource"] as EnumResource, result["Price"] as number, result["Quantity"] as number);
           return order.setId(result["UID"] as string).setTimestamps(result["CreatedAt"] as number, result["ExpiresAt"] as number);
       });
    }

    static byPlayer(player: Player, server: GameServer): MarketOrder[] {
        let db = server.db();
        let query = db.prepare("SELECT * FROM market_orders WHERE Owner = ? ORDER BY ExpiresAt ASC");
        let rows = query.all(player.id());
        return rows.map((result) => {
            let order = new MarketOrder(result["Owner"] as string, result["Type"] as OrderType, result["Resource"] as EnumResource, result["Price"] as number, result["Quantity"] as number);
            return order.setId(result["UID"] as string).setTimestamps(result["CreatedAt"] as number, result["ExpiresAt"] as number);
        });
    }
}
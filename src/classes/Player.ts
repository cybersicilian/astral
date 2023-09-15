import Grid from "./Grid.js";
import { v4 as uuidv4 } from "uuid";
import {EnumGridBase} from "../enum/EnumGridBase";
import Stockpile from "./Stockpile";
import * as fs from "fs";
import {EnumResource} from "../enum/EnumResource";
import Empire from "./Empire";

export default class Player {

    private readonly name: string;

    //@ts-ignore
    private uid: string;

    private empire: Empire = new Empire(this);
    private stock: Stockpile = new Stockpile();


    constructor(name: string, scratch=true) {

        this.uid = uuidv4();
        this.name = name;

        // this.empire = new Array(Consts.MAX_EMPIRE_SIZE).fill(new Array(Consts.MAX_EMPIRE_SIZE).fill(new Grid(EnumGridBase.EMPTY)));

        this.empire.setTile(0, 0, new Grid(EnumGridBase.CITY));
        this.empire.setTile(0, 1, new Grid(EnumGridBase.PLAIN));
        this.empire.setTile(1, 0, new Grid(EnumGridBase.PLAIN));
        this.empire.setTile(1, 1, new Grid(EnumGridBase.PLAIN));
        this.empire.setTile(1, 2, new Grid(EnumGridBase.MOUNTAIN));

        this.addResource(EnumResource.WOOD, 100);
        this.addResource(EnumResource.STONE, 100);
        this.addResource(EnumResource.FOOD, 100);
        this.addResource(EnumResource.GOLD, 100);

        this.save();
    }

    getName() {
        return this.name;
    }

    id() {
        return this.uid;
    }

    hasResource(EnumResource: EnumResource, amount: number): boolean {
        return this.stock.canPay(EnumResource, amount);
    }

    addResource(EnumResource: EnumResource, amount: number) {
        this.stock.add(EnumResource, amount);
    }

    removeResource(EnumResource: EnumResource, amount: number) {
        this.stock.remove(EnumResource, amount);
    }

    save() {
        //if the players/ directory doesn't exist, create it
        //if the player's file doesn't exist, create it
        if (!fs.existsSync("./players")) {
            fs.mkdirSync("./players");
        }
        //log the path to the player's file
        fs.writeFileSync(`./players/${this.name}.json`, this.serialize());
    }


    serialize() {
        return JSON.stringify({
            uid: this.uid,
            name: this.name,
            empire: this.empire.serialize(),
            stock: this.stock.serialize()
        })
    }

    static deserialize(data: string): Player {
        let obj = JSON.parse(data);
        let player = new Player(obj.name, false);
        player.uid = obj.uid;
        player.stock = Stockpile.deserialize(obj.stock);
        player.empire = Empire.deserialize(obj.empire)

        return player;
    }

    static load(name: string): Player {
        if (!fs.existsSync(`./players/${name}.json`)) {
            return new Player(name);
        } else {
            return Player.deserialize(fs.readFileSync(`./players/${name}.json`, `utf8`))
        }
    }
}
import Grid from "./Grid.js";
import {Consts} from "../consts";
import { v4 as uuidv4 } from "uuid";
import {EnumGridBase} from "../enum/EnumGridBase";
import Stockpile from "./Stockpile";
import * as fs from "fs";
import {EnumResource} from "../enum/EnumResource";

export default class Player {

    private readonly name: string;

    //@ts-ignore
    private uid: string;

    private empire: Grid[][] = new Array(Consts.MAX_EMPIRE_SIZE).fill(new Array(Consts.MAX_EMPIRE_SIZE).fill(new Grid(EnumGridBase.EMPTY)));
    private stock: Stockpile = new Stockpile();


    constructor(name: string) {
        this.uid = uuidv4();
        this.name = name;

        // this.empire = new Array(Consts.MAX_EMPIRE_SIZE).fill(new Array(Consts.MAX_EMPIRE_SIZE).fill(new Grid(EnumGridBase.EMPTY)));

        this.addTile(0, 0, new Grid(EnumGridBase.CITY));
        this.addTile(0, 1, new Grid(EnumGridBase.PLAIN));
        this.addTile(1, 0, new Grid(EnumGridBase.PLAIN));
        this.addTile(1, 1, new Grid(EnumGridBase.PLAIN));
        this.addTile(1, 2, new Grid(EnumGridBase.MOUNTAIN));

        this.addResource(EnumResource.WOOD, 100);
        this.addResource(EnumResource.STONE, 100);
        this.addResource(EnumResource.FOOD, 100);
        this.addResource(EnumResource.GOLD, 100);

        this.save();
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

    addTile(x: number, y: number, grid: Grid) {
        if (this.empire[x][y].getBase() == EnumGridBase.EMPTY) {
            this.empire[x][y] = grid;
        }
    }

    getTile(x: number, y: number): Grid {
        return this.empire[x][y];
    }

    save() {
        //if the players/ directory doesn't exist, create it
        //if the player's file doesn't exist, create it
        if (!fs.existsSync("./players")) {
            fs.mkdirSync("./players");
        }
        //log the path to the player's file
        console.log(this.serialize())
        fs.writeFileSync(`./players/${this.name}.json`, this.serialize());
    }


    serialize() {
        return JSON.stringify(this)
    }

    static deserialize(data: string): Player {
        let obj = JSON.parse(data);
        let player = new Player(obj.name);
        player.uid = obj.uid;
        //iterate through empire
        //iterate through stockpile
        for (let key in obj.stock) {
            player.stock.add(parseInt(key) as EnumResource, obj.stock[key]);
        }

        for (let i = 0; i < obj.empire.length; i++) {
            for (let j = 0; j < obj.empire[i].length; j++) {
                let grid = obj.empire[i][j];
                player.empire[i][j] = new Grid(parseInt(grid.base) as EnumGridBase);
            }
        }

        return player;
    }
}
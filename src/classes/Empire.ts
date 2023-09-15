import Grid from "./Grid.js";
import {Consts} from "../consts";
import {EnumGridBase} from "../enum/EnumGridBase";
import Vector2 from "./util/Vector2";
import {EnumResource} from "../enum/EnumResource";
import Player from "./Player";

export default class Empire extends Map<Vector2, Grid> {

    private owner: Player

    constructor(player: Player) {
        super();
        this.owner = player
    }

    setTile(x: number, y: number, grid: Grid) {
        this.set(new Vector2(x, y), grid)
    }

    getTile(x: number, y: number): Grid {
        return this.get(new Vector2(x, y)) ?? new Grid(EnumGridBase.EMPTY);
    }

    harvest(enumResource: EnumResource) {

    }

    serialize() {
        let obj: any = {};
        for (let [key, value] of this.entries()) {
            obj[key.x + "," + key.y] = value.serialize();
        }
        return {
            tiles: obj
        };
    }

    static deserialize(obj: any): Empire {
        let empire = new Empire();
        for (let key in obj.tiles) {
            let split = key.split(",");
            empire.setTile(parseInt(split[0]), parseInt(split[1]), Grid.deserialize(obj.tiles[key]));
        }
        return empire;
    }
}
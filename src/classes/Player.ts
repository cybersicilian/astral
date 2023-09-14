import Grid from "./Grid.js";
import {Consts} from "../consts";
import { v4 as uuidv4 } from "uuid";
import {EnumGridBase} from "../enum/EnumGridBase";
import Stockpile from "./Stockpile";

export default class Player {

    private name: string;
    private uid: string;

    private empire: Grid[][] = new Grid[Consts.MAX_EMPIRE_SIZE][Consts.MAX_EMPIRE_SIZE]
    private stock: Stockpile = new Stockpile();


    constructor(name: string) {
        this.uid = uuidv4();
        this.name = name;

        this.empire = new Array(Consts.MAX_EMPIRE_SIZE).fill(new Array(Consts.MAX_EMPIRE_SIZE).fill(new Grid(EnumGridBase.EMPTY)));
    }



}
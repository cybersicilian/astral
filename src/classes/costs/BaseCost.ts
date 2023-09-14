import Player from "../Player";
import {ICostable} from "../../interfaces/ICostable";

export default abstract class BaseCost {

    abstract canPay(player: Player, source: ICostable): boolean
    abstract pay(player: Player, source: ICostable): void
    abstract display(player: Player, source: ICostable): string
}
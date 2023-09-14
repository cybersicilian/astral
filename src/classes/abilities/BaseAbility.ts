import Player from "../Player";

export default abstract class BaseAbility {

    abstract name(): string
    abstract description(): string
    abstract callback(): (player: Player) => void
    abstract toString(): string


    //this is the ability parser
    static fromString(str: string): BaseAbility {
        return null
    }
}
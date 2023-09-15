import Player from "../Player";
import {Card} from "../Card";

export default abstract class BaseAbility {

    abstract args: any[]

    protected constructor(...args: any[]) {
        this.args = args
    }

    abstract validArgs(): boolean
    abstract name(): string
    abstract description(): string
    abstract callback(): (player: Player) => void
    abstract toString(): string


    //this is the ability parser
    static fromString(str: string, player: Player, card: Card): BaseAbility {
        //abilities are in the form of "name:arg1,arg2,arg3"
        let ability = str.split(":")[0]
        let argArr: any[] = str.split(":").length > 1 ? str.split(":")[1].split(",") : []
        //iterate through and parse the arguments
        for (let arg of argArr) {
            //if the argument is a number, parse it as a number
            if (!isNaN(arg)) {
                arg = parseInt(arg)
            }
            switch (arg.toLowerCase()) {
                case "{player}":
                    arg = player
                    break
                case "{card}":
                    arg = card
            }
        }

        switch (ability.toLowerCase()) {
            case "harvest":
                return
        }
        return null
    }
}
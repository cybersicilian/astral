import BaseAbility from "./core/BaseAbility";
import {Pointer, Choices} from "../structure/utils/CardEnums";
import Card from "../gameplay/cards/Card";
import Player from "../gameplay/player/Player";
import {CardArgs} from "../gameplay/cards/CardArgs";
import {CardAction} from "../structure/utils/Generics";

export default class AbilityChangeAbilitiesAll extends BaseAbility {
    constructor(newCard: Card) {
        super(`Each card in an opponent's hand becomes ${newCard.getName()}`, [
            {choice: Choices.OPPONENT, pointer: Pointer.OPPONENT_MOST_CARDS}
        ], (abilityArgs, madeChoices) => {
            let player = madeChoices[0] as Player
            for (let i = 0; i < player.cih().length; i++) {
                player.cih()[i] = newCard
            }
        })

        this.sai({
            affectsOpponents: (c: CardArgs) => {
                //calculate how many cards on average are in opponent's hands
                let avg = 0;
                for (const opponent of c.opps) {
                    avg += opponent.cih().length
                }
                avg /= c.opps.length
                return  (-c.owner.evaluate(newCard, c)) * avg
            },
            changesGame: (c: CardArgs) => {
                //calculate how many cards on average are in opponent's hands
                let avg = 0;
                for (const opponent of c.opps) {
                    avg += opponent.cih().length
                }
                avg /= c.opps.length
                return Math.abs((-c.owner.evaluate(newCard, c)) * avg)
            }
        })
    }
}
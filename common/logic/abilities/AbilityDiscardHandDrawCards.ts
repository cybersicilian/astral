import BaseAbility from "./core/BaseAbility";
import {Choices} from "../structure/utils/CardEnums";
import Player from "../gameplay/player/Player";
import {Zone} from "../gameplay/cards/Zone";

export default class AbilityDiscardHandDrawCards extends BaseAbility {
    private readonly qty: number;

    constructor(qty: number) {
        super(`Player discards hand, then draw {formula} cards`, [
            { choice: Choices.PLAYER, pointer: (cardArgs) => {
                    //if the owner has {pow} + qty or fewer cards, its them
                    if (cardArgs.owner.inHand() <= cardArgs.card.pow() + qty) {
                        return cardArgs.owner
                    }
                    //if any opponent has more than {pow} + qty cards, its the opponent with the most cards
                    for (let opp of cardArgs.opps) {
                        if (opp.inHand() > cardArgs.card.pow() + qty) {
                            return opp
                        }
                    }

                    //otherwise, its the player with the fewest cards
                    return [cardArgs.owner, ...cardArgs.opps].sort((a, b) => a.inHand() - b.inHand())[0]
                }
            }
        ], (abilityArgs, madeChoices) => {
            let target = madeChoices.pop() as Player
            while (target.cih().length > 0) {
                target.discardRandom(abilityArgs)
            }
            target.draw(abilityArgs.deck!, qty + abilityArgs.card!.pow())
        })

        this.sai({
            discardsCards: 1,
            drawsCards: qty,
            discardsOpponentCards: 1,
            drawsOpponentCards: qty,
            affectsSelf: 1,
            affectsOpponents: 1
        })

        this.setFormula(`{pow} + ${qty}`)


    }
}
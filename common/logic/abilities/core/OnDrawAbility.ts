import BaseAbility from "./BaseAbility";

export default class OnDrawAbility extends BaseAbility {
    constructor(ability: BaseAbility) {
        super(`When this card is drawn, ${ability.getText()[0].toLowerCase() + ability.getText().substring(1)}`, ability.getChoices(), ability.getCallback)
        this.addEvent("draw", (cardArgs) => {
            this.exec(cardArgs)
        })
        this.removeEvent("play")
    }
}
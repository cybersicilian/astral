import BaseAbility from "./BaseAbility";

export default class TextAbility extends BaseAbility {
    constructor(text: string) {
        super(`${text}`, [], (abilityArgs) => {
        })

        this.sai({
            meme: 10
        })
    }
}
import BaseAbility from "./BaseAbility";
import {Resolver, ResolverCallback} from "../../structure/utils/Resolver";
import {CardArgs} from "../../gameplay/cards/CardArgs";
import {AbilityChoices} from "../../gameplay/cards/choices/AbilityChoices";
import {ChoiceType} from "../../gameplay/cards/choices/ChoiceType";
import {EventCluster} from "../../structure/interfaces/IEventable";

export type SlottedCallbacks = {
    onSlot?: (args: CardArgs) => void
    onUnslot?: (args: CardArgs) => void

    playerEvents?: EventCluster
}

export default class SlottedAbility extends BaseAbility {

    private callbacks: SlottedCallbacks = {}

    constructor(text: string, slotted: SlottedCallbacks) {
       super(text, [], () => {})

        this.callbacks = slotted
        this.setProp("slotted_ability", true)
    }

    onSlot(args: CardArgs) {
        args.owner.addSlottedAbility(this)
        if (this.callbacks.onSlot) {
            this.callbacks.onSlot(args)
        }
    }

    onUnslot(args: CardArgs) {
        args.owner.removeSlottedAbility(this)
        if (this.callbacks.onUnslot) {
            this.callbacks.onUnslot(args)
        }
    }

    playerEvents() {
        return this.callbacks.playerEvents ?? {}
    }

    clone() {
        let ability = new SlottedAbility(this.text, this.callbacks)
        ability.setFormula(this.formula)
        ability.setCanPlay(this.canPlay.getCallback())
        ability.setCanGive(this.canGive.getCallback())
        ability.sai(this.ai())
        for (let prop of Object.keys(this.props)) {
            ability.setProp(prop, this.props[prop])
        }
        return ability
    }
}
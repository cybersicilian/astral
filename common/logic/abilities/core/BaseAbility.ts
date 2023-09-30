import {CardArgs} from "../../gameplay/cards/CardArgs";
import {Choices} from "../../structure/utils/CardEnums";
import Player from "../../gameplay/player/Player";
import {AbilityChoices} from "../../gameplay/cards/choices/AbilityChoices";
import {ChoiceType} from "../../gameplay/cards/choices/ChoiceType";
import {IProppable, Properties} from "../../structure/interfaces/IProppable";
import {VosEvent} from "../../structure/utils/Generics";
import {EventCluster, IEventable} from "../../structure/interfaces/IEventable";
import {IPlayable} from "../../structure/interfaces/IPlayable";
import {Resolver, ResolverCallback} from "../../structure/utils/Resolver";
import {AIMeta, AIWeights} from "../../gameplay/ai/AIProfile";
import Bot from "../../gameplay/player/bots/Bot";

export default class BaseAbility implements IProppable, IEventable, IPlayable {
    protected text: string;
    private readonly callback: (abilityArgs: CardArgs, madeChoices: (ChoiceType)[]) => void;
    private readonly choices: ResolverCallback<(c: CardArgs) => AbilityChoices[]> = new ResolverCallback([]);
    protected formula: string = `{pow}`
    canPlay: ResolverCallback<(c: CardArgs) => boolean> = new ResolverCallback(true)
    canGive: ResolverCallback<(p: Player, c: CardArgs) => boolean> = new ResolverCallback(true)

    protected props: Properties = {}
    private events: EventCluster = {}
    private traits: any = {}

    constructor(text: string, choices: Resolver<AbilityChoices[]>,callback: (abilityArgs: CardArgs, madeChoices: (ChoiceType)[]) => void) {
        this.text = text;
        this.callback = callback;
        this.choices = new ResolverCallback<(c: CardArgs) => AbilityChoices[]>(choices)

        this.addEvent("play", (cardArgs) => {
            this.exec(cardArgs)
        })
    }

    ai() {
        return this.traits
    }

    sai(aiWeights: AIWeights, meta?: AIMeta) {
        this.traits = {...aiWeights}
        return this
    }

    isCostAbility() {
        return this.props["cost_ability"] ?? false
    }

    clone() {
        let ability = new BaseAbility(this.text, this.choices.resolve(), this.callback)
        ability.setFormula(this.formula)
        ability.setCanPlay(this.canPlay.getCallback())
        ability.setCanGive(this.canGive.getCallback())
        ability.sai(this.ai())
        for (let prop of Object.keys(this.props)) {
            ability.setProp(prop, this.props[prop])
        }
        return ability
    }

    getChoices() {
        return this.choices.resolve()
    }

    getCallback() {
        return this.callback
    }

    setCanPlay(canPlay: Resolver<boolean>) {
        this.canPlay = new ResolverCallback(canPlay);
        return this;
    }

    setCanGive(canGive: Resolver<boolean>) {
        this.canGive = new ResolverCallback(canGive);
    }

    canBePlayed(cardArgs: CardArgs) {
        //see if there are valid targets
        let choices = this.choices.resolve(cardArgs)
        if (choices.length > 0) {
            for (let choice of choices) {
                if (choice.choice === Choices.OPPONENT) {
                    if (cardArgs.opps.length === 0) {
                        return false
                    }
                } else if (choice.choice === Choices.CARD_IN_DISCARD) {
                    if (!cardArgs.deck) {
                        return false
                    }
                    if (cardArgs.deck.discardPile.length === 0) {
                        return false
                    }
                } else if (choice.choice === Choices.CARD_IN_HAND) {
                    if (cardArgs.owner.cih().length <= 1) {
                        return false;
                    }
                }
            }
        }
        return this.canPlay.resolve(cardArgs)
    }

    canBeGiven(opp: Player, cardArgs: CardArgs) {
        return this.canGive.resolve(opp, cardArgs)
    }

    setText(text: string) {
        this.text = text;
        return this;
    }

    hasRestriction() {
        return typeof this.canPlay === "function" || !this.canPlay
    }

    getRawText() {
        return this.text
    }

    getText() {
        return this.text.replace("{formula}", this.textualizeFormula());
    }

    getFormulatedText(cardArgs: CardArgs) {
        return this.text.replace("{formula}", this.calcFormula(cardArgs));
    }

    informChoices(args: CardArgs) {
        return this.choices.resolve(args)
    }

    setFormula(formula: string) {
        this.formula = formula;
        return this
    }

    textualizeFormula() {
        let formula = this.formula
        //replace from props
        for (let prop in this.props) {
            formula = formula.replace(`{${prop}}`, this.props[prop])
        }
        return formula;
    }

    calcFormula(cardArgs: CardArgs) {
        //replace tokens in formula
        let formula = this.textualizeFormula();
        try {
            formula = formula.replace("{pow}", cardArgs.card!.pow().toString())
        } catch {
            formula = formula.replace("{pow}", "1")
        }

        //resolve it to a number (operations are +, -, /, *, and ^) - parenthesis are supported
        return eval(formula)
    }

    makeChoices(args: CardArgs) {
        let madeChoices = [];

        //if it is a player, we'll make the logic cleaner, but if it is an AI:
        for (let choice of this.informChoices(args)) {

            let choiceResult = Bot.makeSpecificChoice(args, choice)
            let priority = 0;
            let restriction = choice.restriction ?? ((args) => true)
            if (restriction(args) || madeChoices.indexOf(choiceResult[priority]) !== -1 && choice.distinct) {
                //if we already made this choice, we'll try the next one
                while (madeChoices.indexOf(choiceResult[priority]) !== -1 && priority < choiceResult.length - 1) {
                    priority++;
                }
            }
            if (priority >= choiceResult.length) {
                madeChoices.push(null)
            }

            madeChoices.push(choiceResult[priority])
        }
        return madeChoices
    }

    exec(cardArgs: CardArgs) {
        this.callback(cardArgs, cardArgs.choices ?? this.makeChoices(cardArgs));
    }

    on(name: string, func: VosEvent) {
        this.addEvent(name, func)
        return this
    }

    addEvent(name: string, func: VosEvent) {
        if (!this.events[name]) this.events[name] = []
        this.events[name].push(func)
    }

    removeEvent(name: string) {
        if (this.events[name]) {
            delete this.events[name]
        }
        return this
    }

    getEvent(name: string) {
        return this.events[name]
    }

    hasFormula() {
        //it's true if there is {formula} in the text
        return this.text.indexOf("{formula}") !== -1
    }

    getFormula() {
        return this.formula
    }

    fireEvents(name: string, cardArgs: CardArgs) {
        if (this.events[name]) {
            for (let func of this.events[name]) {
                func(cardArgs)
            }
        }

        if (this.events[`temp_${name}`]) {
            for (let func of this.events[`temp_${name}`]) {
                func(cardArgs)
            }
            delete this.events[`temp_${name}`]
        }
    }

    getProps() {
        return this.props
    }

    getProp(prop: string): any {
        return this.props[prop]
    }

    setProp(prop: string, value: any): this {
        this.props[prop] = value
        return this
    }
}
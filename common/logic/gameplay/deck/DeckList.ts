import Card from "../cards/Card";
import AbilityIncreasePower from "../../abilities/AbilityIncreasePower";
import {Pointer, Choices, Rarity} from "../../structure/utils/CardEnums";
import AbilityDiscardSelfCard from "../../abilities/AbilityDiscardSelfCard";
import BaseAbility from "../../abilities/core/BaseAbility";
import Player from "../player/Player";
import AbilityRemoveOtherCopiesFromGame from "../../abilities/AbilityRemoveOtherCopiesFromGame";
import AbilityExplodeCard from "../../abilities/AbilityExplodeCard";
import AbilityAddResource from "../../abilities/AbilityAddResource";
import AbilityAddDeck from "../../abilities/AbilityAddDeck";
import AbilityZombieRestriction from "../../abilities/AbilityZombieRestriction";
import TextAbility from "../../abilities/core/TextAbility";
import {Zone} from "../cards/Zone";
import {CardArgs} from "../cards/CardArgs";
import SlottedAbility from "../../abilities/core/SlottedAbility";
import AbilityAddTurns from "../../abilities/AbilityAddTurns";
import {PropEnums} from "../../structure/utils/PropEnums";
import AbilityDrawCard from "../../abilities/AbilityDrawCard";
import AbilityRecoverCards from "../../abilities/AbilityRecoverCards";
import AbilityDiscardOppCard from "../../abilities/AbilityDiscardOppCard";
import AbilityRemoveTurns from "../../abilities/AbilityRemoveTurns";
import AbilitySkipOpp from "../../abilities/AbilitySkipOpp";
import AbilityAddAbility from "../../abilities/AbilityAddAbility";

const DeckList: { [key: string]: Card[] } = {
    zombie_deck: [
        new Card(`Chomp`, [
            new AbilityZombieRestriction(),
            new BaseAbility(`Deal {formula} damage to an opponent. They discard that many cards.`, [
                {pointer: Pointer.OPPONENT_MOST_CARDS, choice: Choices.OPPONENT}
            ], (abilityArgs, madeChoices) => {
                let opponent = madeChoices[0] as Player
                let dmg = abilityArgs.card!.pow() * 5
                if (abilityArgs.owner.getProp("res_life") <= 0) {
                    opponent.setProp("res_life", opponent.getProp("res_life") - dmg, abilityArgs)
                    for (let i = 0; i < dmg; i++) {
                        opponent.discardChoose(abilityArgs)
                    }
                }
            }).setFormula(`{pow} * 5`)
        ]).setRarity(Rarity.COMMON),
        new Card(`Brain Munchies`, [
            new AbilityZombieRestriction(),
            new BaseAbility(`Draw {formula} cards.`, [], (abilityArgs, madeChoices) => {
                if (abilityArgs.owner.getProp("res_life") <= 0) {
                    abilityArgs.owner.draw(abilityArgs.deck, abilityArgs.card!.pow())
                }
            }).setFormula(`{pow} + 2`)
        ]).setRarity(Rarity.COMMON),
        new Card(`X-49 Antigen`, [
            new BaseAbility(`Play only if you aren't an antivaxxer.`, [], (cardArgs, madeChoices) => {
            }).setCanPlay((cardArgs) => {
                return !cardArgs.owner.getProp("antivaxxer")
            }),
            new BaseAbility(`Heal all zombies. They give you their hands out of gratitude.`, [], (abilityArgs, madeChoices) => {
                if (!abilityArgs.owner.getProp("antivaxxer")) {
                    for (let player of abilityArgs.opps) {
                        player.setProp("res_life", 10, abilityArgs)
                        abilityArgs.owner.setCiH(abilityArgs.owner.cih().concat(player.cih()))
                        player.setCiH([])
                    }
                }
            })
        ]).setCanPlay((cardArgs) => {
            return !cardArgs.owner.getProp("antivaxxer")
        }).setRarity(Rarity.RARE),
        new Card(`Necromutation`, [
            new AbilityZombieRestriction(),
            new AbilityExplodeCard(),
            new AbilityIncreasePower(2)
        ]).setRarity(Rarity.RARE),
        new Card(`Rot Brains`, [
            new AbilityZombieRestriction(),
            new BaseAbility(`Zombify half the cards in an opponents hand. (They can't play them unless they are a zombie)`, [
                    {choice: Choices.OPPONENT, pointer: Pointer.OPPONENT_MOST_CARDS}
                ], (abilityArgs, madeChoices) => {
                    //add the zombie restriction to half the cards at random in an opponents hand.
                    let opponent = madeChoices[0] as Player
                    let cards = opponent.cih()
                    let half = Math.ceil(cards.length / 2)
                    //choose half the cards at random
                    let ordered = cards.map((card, index) => card.clone()).sort(() => Math.random() - 0.5)
                    for (let i = 0; i < half; i++) {
                        ordered[i] = new Card(`Zombified ${ordered[i].getName()}`, [
                            new AbilityZombieRestriction(),
                            ...ordered[i].getAbilities()
                        ]).setPow(ordered[i].pow()).setRarity(ordered[i].getRarity()).setProps({zombie: true, ...ordered[i].getProps()}).setZone(Zone.HAND)
                    }
                    //update the opponents hand
                    opponent.setCiH(ordered)
                }
            )
        ])
    ],
    faith_deck: [
        new Card(`Many-Armed One`, [
            new AbilityAddDeck("faith_evangelical_deck", 75, true, true).setText("Play only if the evangelical deck hasn't been added yet. Add the evangelical deck to the game."),
            new SlottedAbility("When you draw a card, gain 1 faith", {
                playerEvents: {
                    "draw": [(args: CardArgs) => {
                        args.owner.addResource("faith", 1)
                    }]
                }
            }).setProp(PropEnums.RELIGION, [0])
        ]).setRarity(Rarity.BASIC),
        new Card(`Thoughts and Prayers`, [
            new AbilityAddResource(0, "faith"),
            new AbilityAddTurns(3).setText(`Meditate. Add {formula} turns.`)
        ]).setRarity(Rarity.COMMON),
        new Card(`Have You Heard the Good Message?`, [
            new AbilityAddResource(1, "faith"),
            new AbilityDiscardSelfCard(2).setText(`Discard {formula} cards.`)
        ]).setRarity(Rarity.COMMON),
    ],
    poop_deck: [
        new Card(`Pile o' Crap`, [
            new TextAbility(`💩`)
        ]).setRarity(Rarity.BASIC).setProp("crap", true),
    ],
    basic: [
        new Card(`Consider`, [
            new AbilityDrawCard(1)
        ]).setRarity(Rarity.COMMON),
        new Card(`Recover`, [
            new AbilityRecoverCards(1)
        ]).setRarity(Rarity.RARE),
        new Card(`Tickle`, [
            new AbilityDiscardOppCard(1)
        ]).setRarity(Rarity.COMMON),
        new Card(`Accelerate`, [
            new AbilityRemoveTurns(2)
        ]).setRarity(Rarity.UNCOMMON),
        new Card(`Throat Punch`, [
            new AbilityDrawCard(1),
            new AbilityDiscardOppCard(1)
        ]).setRarity(Rarity.UNCOMMON),
        new Card(`Skip`, [
            new AbilitySkipOpp(1)
        ]).setRarity(Rarity.MYTHIC),
        new Card(`Innovate`, [
            new AbilityAddAbility(new AbilityDrawCard(1), `Innovative {name}`, Choices.CARD_IN_HAND)
        ]).setRarity(Rarity.COMMON),
        new Card(`You Could Make a Religion Outta This`, [
            new AbilityAddDeck("faith_deck"),
            new AbilityAddResource(1, "faith"),
            new BaseAbility(`Everyone unlocks the ability to create a religion`, [], (args: CardArgs) => {
               for (let player of [args.owner, ...args.opps]) {
                   player.setProp("religion", true, args)
               }
            }),
            new AbilityRemoveOtherCopiesFromGame()
        ]).setRarity(Rarity.LEGENDARY)
    ]
}

export default DeckList;
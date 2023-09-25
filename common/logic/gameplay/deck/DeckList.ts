import Card from "../cards/Card";
import AbilityIncreasePower from "../../abilities/AbilityIncreasePower";
import {AIPointer, Choices, Rarity} from "../../structure/utils/CardEnums";
import AbilityDrawCard from "../../abilities/AbilityDrawCard";
import AbilitySymDraw from "../../abilities/AbilitySymDraw";
import AbilityDiscardOppCard from "../../abilities/AbilityDiscardOppCard";
import AbilityDiscardSelfCard from "../../abilities/AbilityDiscardSelfCard";
import AbilityDiscardHandDrawCards from "../../abilities/AbilityDiscardHandDrawCards";
import BaseAbility from "../../abilities/core/BaseAbility";
import Player from "../player/Player";
import AbilityRemoveOtherCopiesFromGame from "../../abilities/AbilityRemoveOtherCopiesFromGame";
import AbilityExplodeCard from "../../abilities/AbilityExplodeCard";
import AbilityAddResource from "../../abilities/AbilityAddResource";
import CostAbility from "../../abilities/core/CostAbility";
import AbilityAddDeck from "../../abilities/AbilityAddDeck";
import AbilityZombieRestriction from "../../abilities/AbilityZombieRestriction";
import OnDrawAbility from "../../abilities/core/OnDrawAbility";
import AbilityAddEventToSelf from "../../abilities/AbilityAddEventToSelf";
import AbilityAddEventToOpponent from "../../abilities/AbilityAddEventToOpponent";
import AbilityWin from "../../abilities/AbilityWin";
import AbilitySetPropSelf from "../../abilities/AbilitySetPropSelf";
import AbilityRecoverCards from "../../abilities/AbilityRecoverCards";
import AbilityShuffleDiscardIntoDeck from "../../abilities/AbilityShuffleDiscardIntoDeck";
import PlayerRestrictionAbility from "../../abilities/core/PlayerRestrictionAbility";
import PlayerRestrictionAbilityNeg from "../../abilities/core/PlayerRestrictionAbilityNeg";
import AbilityAddEventToAll from "../../abilities/AbilityAddEventToAll";
import AbilitySetPropAll from "../../abilities/AbilitySetPropAll";
import PlayerPredicateRestrictionAbility from "../../abilities/core/PlayerPredicateRestrictionAbility";
import TextAbility from "../../abilities/core/TextAbility";
import AbilityUnlockUpgrade from "../../abilities/AbilityUnlockUpgrade";
import Upgrade from "../player/systems/Upgrade";
import AbilityAddTurnsOpp from "../../abilities/AbilityAddTurnsOpp";
import AbilityAntivaxxer from "../../abilities/AbilityAntivaxxer";

const DeckList: { [key: string]: Card[] } = {
    radioactivity_deck: [
        new Card(`Nuclear Observation`, [
            new AbilityAddEventToSelf(["draw"], (abilityArgs) => {
                if (abilityArgs.card!.getProp("radioactive")) {
                    abilityArgs.owner.setProp("knowledge", (abilityArgs.owner.getProp("knowledge") ?? 0) + 5, abilityArgs)
                    abilityArgs.owner.draw(abilityArgs.deck, 1)
                }
            })
                .setText("When you draw a radioactive card, gain {formula} knowledge and draw another card.")
                .setFormula("{pow} + 5")
                .sai({
                    drawsCards: 1,
                    affectsSelf: 1,
                    collectResource: 1
                }),
        ]).setRarity(Rarity.LEGENDARY),
        new Card(`Decay`, [
            new OnDrawAbility(new AbilityDiscardSelfCard(1)),
            new AbilityDiscardSelfCard(1)
        ]).setRarity(Rarity.BASIC).setProp("radioactive", true),
        new Card(`Fusion`, [
            new OnDrawAbility(new BaseAbility(`If you have other cards in your hand, combine {formula} of them at random`, [], (abilityArgs, madeChoices) => {
                let cards = abilityArgs.owner.cih()
                if (cards.length > 2) {
                    let card1 = cards.splice(Math.floor(Math.random() * cards.length), 1)[0]
                    let card2 = cards.splice(Math.floor(Math.random() * cards.length), 1)[0]
                    let newCard = Card.combine(card1, card2)
                    abilityArgs.owner.cih().push(newCard)
                }
            })),
            new AbilityDiscardSelfCard(1)
        ]).setRarity(Rarity.UNCOMMON).setProp("radioactive", true),
        new Card(`Fission`, [
            new OnDrawAbility(new AbilityAddEventToSelf(["temp_draw"], (abilityArgs) => {
                //remove the card you just drew from your hand and explode it
                let card = abilityArgs.card
                abilityArgs.owner.setCiH(abilityArgs.owner.cih().filter((c) => c !== card))
                let new_cards = card!.explode().sort((a, b) => Math.random() - 0.5)
                abilityArgs.owner.cih().push(new_cards.pop())
                abilityArgs.deck!.discardPile.push(...new_cards)
            }).setText("The next card you draw explodes. Keep one fragment at random, and discard the rest.")),
            new AbilityDiscardSelfCard(1)
        ]).setRarity(Rarity.RARE).setProp("radioactive", true)
    ],
    genetics_deck: [
        new Card(`Gene Bank`, [
            new CostAbility("metal", 20),
            new PlayerRestrictionAbility("genetics"),
            new PlayerRestrictionAbilityNeg("gene_bank"),
            new AbilitySetPropSelf("gene_bank", true)
                .sai({
                    unlockUpgrades: 1,
                    winProgress: 1,
                    changesGame: 1
                })
        ]).setRarity(Rarity.RARE).setProp("construction", true),
        new Card(`Analyze Card DNA`, [
            new PlayerRestrictionAbility("genetics"),
            new PlayerRestrictionAbility("gene_bank"),
            new AbilityAddResource(5, "knowledge"),
            new BaseAbility(`Analyze a card in the discard pile to add its DNA to the gene bank.`, [
                {choice: Choices.CARD_IN_DISCARD, pointer: AIPointer.CARD_IN_DISCARD_RANDOM}
            ], (abilityArgs, madeChoices) => {
                if (!abilityArgs.owner.getProp("dna_research")) {
                    abilityArgs.owner.setProp("dna_research", [], abilityArgs)
                }
                let card = madeChoices[0] as Card
                //add each of the cards abilities to the gene bank
                for (let ability of card.getAbilities()) {
                    abilityArgs.owner.getProp("dna_research").push(ability)
                }

                //remove that card from the discard pile
                abilityArgs.deck!.discardPile = abilityArgs.deck!.discardPile.filter((c) => c !== card)
            }).sai({
                affectsSelf: 1,
                unlockUpgrades: 1,
                changesGame: 1
            })
        ]).setRarity(Rarity.UNCOMMON),
        new Card(`Spank Bank Variety`, [
            new PlayerPredicateRestrictionAbility(`if you have {formula} or more entries in your gene bank`, (abilityArgs) => {
                return (abilityArgs.owner.getProp("dna_research") ?? []).length >= 30 - abilityArgs.card!.pow()
            }).setFormula(`30 - {pow}`),
            new BaseAbility(`If you have {formula} or more entries in your gene bank, you win the game on your next turn.`, [], (abilityArgs, madeChoices) => {
                abilityArgs.owner.setCanWin(true, "Genetic Superiority")
            })
                .setFormula(`30 - {pow}`)
        ]).setRarity(Rarity.LEGENDARY)
    ],
    explosives_deck: [
        new Card(`Grenade`, [
            new PlayerRestrictionAbility("explosives"),
            new BaseAbility("Explode a card at random in an opponents hand, then they discard half that many cards at random.", [
                {choice: Choices.OPPONENT, pointer: AIPointer.OPPONENT_LEAST_CARDS},
            ], (abilityArgs, madeChoices) => {
                let opponent = madeChoices[0] as Player
                //explode a card at random
                let card = opponent.cih()[Math.floor(Math.random() * opponent.cih().length)]
                if (card) {
                    //remove it from their cards in hand
                    opponent.setCiH(opponent.cih().filter((c) => c !== card))
                    //explode it
                    let new_cards = card.explode()
                    let toDiscard = Math.ceil(new_cards.length / 2)
                    //add new cards to the opponents hand
                    opponent.cih().push(...new_cards)
                    //discard half that many cards at random
                    for (let i = 0; i < toDiscard; i++) {
                        opponent.discardChoose(abilityArgs)
                    }
                }
            }).sai({
                affectsOpponents: 2,
                oppWinSetback: 1,
                changesGame: 1
            })
        ]),
        new Card(`Dynamite`, [
            new PlayerRestrictionAbility("explosives"),
            new BaseAbility(`Explode all cards in the discard pile`, [], (abilityArgs, madeChoices) => {
                let cards = abilityArgs.deck!.discardPile
                abilityArgs.deck!.discardPile = []
                for (let card of cards) {
                    let new_cards = card.explode()
                    abilityArgs.deck!.discardPile.push(...new_cards)
                }
            }).sai({
                changesGame: 1,
                addCardsToDeck: 1
            }),
            new BaseAbility(`Destroy half the cards in the discard pile at random`, [], (abilityArgs, madeChoices) => {
                let cards = abilityArgs.deck!.discardPile
                abilityArgs.deck!.discardPile = []
                let toDiscard = Math.ceil(cards.length / 2)
                for (let i = 0; i < toDiscard; i++) {
                    abilityArgs.deck!.discardPile.push(cards.splice(Math.floor(Math.random() * cards.length), 1)[0])
                }
            }).sai({
                changesGame: 1
            }),
            new AbilityRecoverCards(1)
        ]).setRarity(Rarity.RARE),
        new Card(`Nuclear Bomb`, [
            new PlayerRestrictionAbility("explosives"),
            new BaseAbility(`Kill everyone. They discard their hands`, [], (abilityArgs, madeChoices) => {
                //everyone's life is set to 0
                let players = [...abilityArgs.opps, abilityArgs.owner]
                for (let player of players) {
                    player.setProp("res_life", 0, abilityArgs)
                    //discard hands
                    abilityArgs.deck!.discardPile.concat(player.cih())
                    player.setCiH([])
                }
            }).sai({
                oppWinSetback: 1,
                discardsOpponentCards: 1,
                discardsCards: 1
            }),
            new BaseAbility(`Kill everyone's citizens.`, [], (abilityArgs, madeChoices) => {
                //everyone's life is set to 0
                let players = [...abilityArgs.opps, abilityArgs.owner]
                for (let player of players) {
                    player.setProp("population", 0, abilityArgs)
                }
            }).sai({
                oppWinSetback: 1,
                affectsOpponents: 1,
                affectsSelf: 1
            }),
            new BaseAbility(`Explode all cards in the discard pile`, [], (abilityArgs, madeChoices) => {
                let cards = abilityArgs.deck!.discardPile
                abilityArgs.deck!.discardPile = []
                for (let card of cards) {
                    let new_cards = card.explode()
                    abilityArgs.deck!.discardPile.push(...new_cards)
                }
            }).sai({
                changesGame: 1,
                addCardsToDeck: 1
            }),
            new AbilityShuffleDiscardIntoDeck(),
            new AbilityAddDeck("radioactivity_deck", 30, true)
        ]).setRarity(Rarity.HAXOR)
    ],
    academia_deck: [
        new Card(`The Scientific Process`, [
            new CostAbility("knowledge", 5),
            new AbilityUnlockUpgrade(new Upgrade({
                name: "Rapid Iteration",
                description: "When you draw a card, if you have more cards than your maximum hand size, randomly combine cards.",
                cost: [{
                    amt: 25,
                    resource: "knowledge"
                }],
            }, (cardArgs) => {
                cardArgs.owner.addEvent("draw", (cardArgs) => {
                    if (cardArgs.owner.cih().length > cardArgs.owner.getHandsize() && cardArgs.owner.cih().length >= 2) {
                        while (cardArgs.owner.cih().length > cardArgs.owner.getHandsize() && cardArgs.owner.cih().length >= 2) {
                            //choose 2 random cards
                            let randos = cardArgs.owner.cih().sort(() => Math.random() - 0.5).slice(0, 2)
                            let newCard = Card.combine(...randos)
                            newCard.setProp(`hybrid`, true)
                            cardArgs.owner.cih().push(newCard)
                            cardArgs.owner.cih().splice(cardArgs.owner.cih().indexOf(randos[0]), 1)
                            cardArgs.owner.cih().splice(cardArgs.owner.cih().indexOf(randos[1]), 1)
                        }
                    }
                })
            }))
        ]).setRarity(Rarity.RARE),
        new Card(`Thought that Counts`, [
            new AbilityAddResource(1, "knowledge")
        ]).setRarity(Rarity.BASIC),
        new Card(`Receive Public Education`, [
            new AbilityAddResource(1, "knowledge"),
            new AbilityDrawCard(1),
            new AbilityDiscardSelfCard(1)
        ]).setRarity(Rarity.COMMON),
        new Card(`Homeschooling`, [
            new AbilityAddResource(5, "knowledge"),
            new AbilityAntivaxxer()
        ]).setRarity(Rarity.RARE),
        new Card(`Go to University`, [
            new CostAbility("tadbucks", 10),
            new AbilityAddResource(5, "knowledge"),
            new AbilityDrawCard(1),
        ]).setRarity(Rarity.UNCOMMON),
        new Card(`Pseudo-Education`, [
            new AbilityAddResource(2, "knowledge"),
            new AbilityAntivaxxer(),
            new AbilityAddDeck("alchemy_deck", 75, true).setText(`Invent alchemy and witchcraft. Add them to the game.`)
        ]),
        new Card(`Research: Explosives`, [
            new CostAbility("knowledge", 15),
            new AbilitySetPropSelf("explosives", true).setCanPlay((cardArgs) => {
                //only if you haven't discovered explosives yet
                return !cardArgs.owner.getProp("explosives")
            }).setText("Discover explosives if you haven't already."),
            new AbilityAddDeck("explosives_deck", 35, true).setText(`Invent explosives. Add them to the game.`)
        ]).setProp("research", true),
        new Card("Research: Genetics", [
            new CostAbility("knowledge", 20),
            new AbilitySetPropSelf("genetics", true).setCanPlay((cardArgs) => {
                //only if you haven't discovered genetics yet
                return !cardArgs.owner.getProp("genetics")
            }).setText("Discover genetics if you haven't already."),
            new AbilityAddDeck("genetics_deck", 35, true).setText(`Invent genetics. You learn cards are sentient. Add it to the game.`)
        ])
    ],
    basic_resource_deck: [
        new Card(`Wood Shipment`, [
            new AbilityUnlockUpgrade(new Upgrade({
                name: `Wood Shipment`,
                description: `Order {Math.floor(10 * Math.pow(1.15, {level} + 1)} wood from the Amazon`,
                cost: [{
                    amt: 20,
                    resource: "tadbucks"
                }],
                locked: false
            }, (c,u) => {
                c.owner.addResource("wood", Math.floor(10 * Math.pow(1.15, u.lvl())))
            }, true, 1.25))
        ]),
        new Card(`Food Shipment`, [
            new AbilityUnlockUpgrade(new Upgrade({
                name: `Wood Shipment`,
                description: `Order {Math.floor(10 * Math.pow(1.15, {level} + 1)} food from the Amazon`,
                cost: [{
                    amt: 20,
                    resource: "tadbucks"
                }],
                locked: false
            }, (c,u) => {
                c.owner.addResource("food", Math.floor(10 * Math.pow(1.15, u.lvl())))
            }, true, 1.25))
        ]),
        new Card(`Metal Shipment`, [
            new AbilityUnlockUpgrade(new Upgrade({
                name: `Wood Shipment`,
                description: `Order {Math.floor(10 * Math.pow(1.15, {level} + 1)} metal from the Amazon`,
                cost: [{
                    amt: 20,
                    resource: "tadbucks"
                }],
                locked: false
            }, (c,u) => {
                c.owner.addResource("metal", Math.floor(10 * Math.pow(1.15, u.lvl())))
            }, true, 1.25))
        ]),
        new Card(`Stone Shipment`, [
            new AbilityUnlockUpgrade(new Upgrade({
                name: `Wood Shipment`,
                description: `Order {Math.floor(10 * Math.pow(1.15, {level} + 1)} stone from the Amazon`,
                cost: [{
                    amt: 20,
                    resource: "tadbucks"
                }],
                locked: false
            }, (c,u) => {
                c.owner.addResource("stone", Math.floor(10 * Math.pow(1.15, u.lvl())))
            }, true, 1.25))
        ]),
        new Card(`Gather Wood`, [
            new AbilityAddResource(0, "wood")
        ]).setRarity(Rarity.BASIC).setProp("resource", true),
        new Card(`Gather Stone`, [
            new AbilityAddResource(0, "stone")
        ]).setRarity(Rarity.BASIC).setProp("resource", true),
        new Card(`Gather Metal`, [
            new AbilityAddResource(0, "metal")
        ]).setRarity(Rarity.BASIC).setProp("resource", true),
        new Card(`Gather Food`, [
            new AbilityAddResource(0, "food")
        ]).setRarity(Rarity.BASIC).setProp("resource", true),
        new Card(`Collect Taxes`, [
            new BaseAbility(`Gain {formula} Tadbucks for each citizen you have.`, [], (abilityArgs, madeChoices) => {
                abilityArgs.owner.setProp("tadbucks", (abilityArgs.owner.getProp("tadbucks") ?? 0) + (abilityArgs.owner.getProp("population") * (abilityArgs.card!.pow() * 10)), abilityArgs)
            }).setFormula("{pow} * 10")
        ]).setRarity(Rarity.UNCOMMON),
        new Card(`Construct Cottage`, [
            new CostAbility("wood", 5),
            new CostAbility("food", 5),
            new BaseAbility(`Build a cottage. (Adds {formula} housing)`, [], (abilityArgs, madeChoices) => {
                abilityArgs.owner.setProp("housing", abilityArgs.card!.pow() + (abilityArgs.owner.getProp("housing") ?? 0), abilityArgs)
            }),
            new AbilityAddEventToSelf(["turn_start"], (abilityArgs) => {
                //gain 1 population if you have enough housing
                if (abilityArgs.owner.getProp("housing") > abilityArgs.owner.getProp("population")) {
                    abilityArgs.owner.setProp("population", (abilityArgs.owner.getProp("population") ?? 0) + 1, abilityArgs)
                }
            }).setText("At the start of your turn, if you have housing, people move in.")
        ]).setRarity(Rarity.COMMON).setProp("construction", true),
        new Card(`Marketplace Construction`, [
            new PlayerRestrictionAbilityNeg("marketplace"),
            new CostAbility("wood", 5),
            new CostAbility("stone", 5),
            new AbilitySetPropSelf("marketplace", true).setText("Unlocks the marketplace"),
            new BaseAbility(`Get a stimmy check of {formula} tadbucks`, [], (abilityArgs, madeChoices) => {
                abilityArgs.owner.setProp("tadbucks", (abilityArgs.owner.getProp("tadbucks") ?? 0) + (abilityArgs.card!.pow() * 10), abilityArgs)
            }).setFormula(`100 + (10 * {pow})`)
        ]).setRarity(Rarity.MYTHIC).setProp("construction", true),
        new Card(`Research: Improved Agricultural Practices`, [
            new CostAbility("knowledge", 8),
            new BaseAbility(`Increase the power of all cards that produce food by {formula}`, [], (abilityArgs, madeChoices) => {
                let players = [...abilityArgs.opps, abilityArgs.owner]
                //increase power of cards in their hands
                for (let player of players) {
                    for (let card of player.cih()) {
                        if (card.getProp("produce") && card.getProp("produce").includes("food")) {
                            card.setPow(card.pow() + abilityArgs.card!.pow())
                        }
                    }
                }
                //in the discard pile
                for (let card of abilityArgs.deck!.discardPile) {
                    if (card.getProp("produce") && card.getProp("produce").includes("food")) {
                        card.setPow(card.pow() + abilityArgs.card!.pow())
                    }
                }

                //in the deck
                for (let card of abilityArgs.deck!.asArray()) {
                    if (card.getProp("produce") && card.getProp("produce").includes("food")) {
                        card.setPow(card.pow() + abilityArgs.card!.pow())
                    }
                }
            })
        ]).setRarity(Rarity.RARE).setProp("research", true),
        new Card(`Research: Improved Logging Practices`, [
            new CostAbility("knowledge", 8),
            new BaseAbility(`Increase the power of all cards that produce wood by {formula}`, [], (abilityArgs, madeChoices) => {
                let players = [...abilityArgs.opps, abilityArgs.owner]
                //increase power of cards in their hands
                for (let player of players) {
                    for (let card of player.cih()) {
                        if (card.getProp("produce") && card.getProp("produce").includes("wood")) {
                            card.setPow(card.pow() + abilityArgs.card!.pow())
                        }
                    }
                }
                //in the discard pile
                for (let card of abilityArgs.deck!.discardPile) {
                    if (card.getProp("produce") && card.getProp("produce").includes("wood")) {
                        card.setPow(card.pow() + abilityArgs.card!.pow())
                    }
                }

                //in the deck
                for (let card of abilityArgs.deck!.asArray()) {
                    if (card.getProp("produce") && card.getProp("produce").includes("wood")) {
                        card.setPow(card.pow() + abilityArgs.card!.pow())
                    }
                }
            })
        ]).setRarity(Rarity.RARE).setProp("research", true),
        new Card(`Research: Improved Quarrying Practices`, [
            new CostAbility("knowledge", 8),
            new BaseAbility(`Increase the power of all cards that produce stone by {formula}`, [], (abilityArgs, madeChoices) => {
                let players = [...abilityArgs.opps, abilityArgs.owner]
                //increase power of cards in their hands
                for (let player of players) {
                    for (let card of player.cih()) {
                        if (card.getProp("produce") && card.getProp("produce").includes("stone")) {
                            card.setPow(card.pow() + abilityArgs.card!.pow())
                        }
                    }
                }
                //in the discard pile
                for (let card of abilityArgs.deck!.discardPile) {
                    if (card.getProp("produce") && card.getProp("produce").includes("stone")) {
                        card.setPow(card.pow() + abilityArgs.card!.pow())
                    }
                }

                //in the deck
                for (let card of abilityArgs.deck!.asArray()) {
                    if (card.getProp("produce") && card.getProp("produce").includes("stone")) {
                        card.setPow(card.pow() + abilityArgs.card!.pow())
                    }
                }
            })
        ]).setRarity(Rarity.RARE).setProp("research", true),
        new Card(`Research: Improved Mining Practices`, [
            new CostAbility("knowledge", 8),
            new BaseAbility(`Increase the power of all cards that produce metal by {formula}`, [], (abilityArgs, madeChoices) => {
                let players = [...abilityArgs.opps, abilityArgs.owner]
                //increase power of cards in their hands
                for (let player of players) {
                    for (let card of player.cih()) {
                        if (card.getProp("produce") && card.getProp("produce").includes("metal")) {
                            card.setPow(card.pow() + abilityArgs.card!.pow())
                        }
                    }
                }
                //in the discard pile
                for (let card of abilityArgs.deck!.discardPile) {
                    if (card.getProp("produce") && card.getProp("produce").includes("metal")) {
                        card.setPow(card.pow() + abilityArgs.card!.pow())
                    }
                }

                //in the deck
                for (let card of abilityArgs.deck!.asArray()) {
                    if (card.getProp("produce") && card.getProp("produce").includes("metal")) {
                        card.setPow(card.pow() + abilityArgs.card!.pow())
                    }
                }
            })
        ]).setRarity(Rarity.RARE).setProp("research", true)
    ],
    zombie_deck: [
        new Card(`Chomp`, [
            new AbilityZombieRestriction(),
            new BaseAbility(`Deal {formula} damage to an opponent. They discard that many cards.`, [
                {pointer: AIPointer.OPPONENT_MOST_CARDS, choice: Choices.OPPONENT}
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
        new Card(`Zombie Sutures`, [
            new AbilityZombieRestriction(),
            new BaseAbility(`Combine the top three non-sutured cards in the discard pile, then add it to your hand {formula} times`, [], (abilityArgs, madeChoices) => {
                //combine all the cards in the discard pile, and then empty it
                let cards = abilityArgs.deck!.discardPile.filter((card) => card && card !== abilityArgs.card && !card.getProp("sutured"))
                //select the top three cards from the discard
                cards = cards.slice(0, 3)
                if (cards.length > 0) {
                    let newCard = new Card(`Sutured ${cards.map((card) => card.clone().getName()).join("-")}`, [
                        ...cards.map((card) => {
                            return card.clone().getAbilities()
                        }).flat()
                    ]).setRarity(Rarity.HAXOR).setProp("sutured", true)
                    //remove the chosen cards from the discard pile
                    abilityArgs.deck!.discardPile = abilityArgs.deck!.discardPile.filter((card) => {
                        return !cards.includes(card)
                    })
                    //add it to hand {pow} times
                    for (let i = 0; i < abilityArgs.card!.pow(); i++) {
                        abilityArgs.owner.cih().push(newCard.clone())
                    }
                }
            }).setFormula(`{pow}`)
        ]),
        new Card(`Rot Brains`, [
            new AbilityZombieRestriction(),
            new BaseAbility(`Zombify half the cards in an opponents hand. (They can't play them unless they are a zombie)`, [
                    {choice: Choices.OPPONENT, pointer: AIPointer.OPPONENT_MOST_CARDS}
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
                        ]).setPow(ordered[i].pow()).setRarity(ordered[i].getRarity()).setProps({zombie: true, ...ordered[i].getProps()})
                    }
                    //update the opponents hand
                    opponent.setCiH(ordered)
                }
            )
        ])
    ],
    alchemy_deck: [
        new Card(`Curse of Cuckage`, [
            new OnDrawAbility(new AbilityDrawCard(1)),
            new AbilityAddEventToOpponent(["temp_can_win"], (abilityArgs) => {
                abilityArgs.owner.setCanWin(false, "cards in hand")
            }).setText("The next time an opponent tries to win, they don't.")
        ]).setRarity(Rarity.HAXOR).setProp("curse", true),
        new Card(`Rite of Suffering`, [
            new CostAbility("population", 3),
            new BaseAbility(`Each opponent discards {formula} cards.`, [], (abilityArgs, madeChoices) => {
                for (let player of abilityArgs.opps) {
                    for (let i = 0; i < 3; i++) {
                        player.discardChoose(abilityArgs)
                    }
                }
            }).setFormula(`3 + {pow}`)
        ]).setRarity(Rarity.MYTHIC).setProp("curse", true),
        new Card(`Curse of Apathy`, [
            new OnDrawAbility(new BaseAbility(`Increase your cards to win by {formula}`, [], (abilityArgs, madeChoices) => {
                abilityArgs.owner.addTurns(abilityArgs.card!.pow())
            })).setFormula(`{pow}`),
            new AbilityDiscardSelfCard(1)
        ]).setRarity(Rarity.COMMON).setProp("curse", true),
        new Card(`Curse of Suffering`, [
            new OnDrawAbility(new BaseAbility(`Lose {formula} life.`, [], (abilityArgs, madeChoices) => {
                //the owner should lose life
                if (!abilityArgs.owner.getProp("res_life")) {
                    abilityArgs.owner.setProp("res_life", 1, abilityArgs)
                }
                abilityArgs.owner.setProp("res_life", abilityArgs.owner.getProp("res_life") - (3 + abilityArgs.card!.pow()), abilityArgs)
            })).setFormula(`3 + {pow}`),
            new AbilityDiscardSelfCard(1)
        ]).setRarity(Rarity.COMMON).setProp("curse", true).setCanGive(false),
        new Card(`Curse of Decay`, [
            new OnDrawAbility(new AbilityDiscardSelfCard(1)),
            new AbilityAddEventToOpponent(["temp_turn_end"], (abilityArgs) => {
                abilityArgs.owner.discardChoose(abilityArgs)
                abilityArgs.owner.discardChoose(abilityArgs)
            }).setText("Choose an opponent. They discard two cards at the end of their next turn.")
        ]).setProp("curse", true),
        new Card(`Connive`, [
            new AbilityDrawCard(1),
            new BaseAbility(`Copy a curse in your hand, then put it on top of the deck.`, [
                {
                    choice: Choices.CARD_IN_HAND,
                    pointer: AIPointer.CARD_IN_HAND_MOST_POWER,
                    restriction: (abilityArgs) => {
                        return abilityArgs.owner.cih().filter((card) => card.getProp("curse")).length > 0
                    }
                }
            ], (abilityArgs, madeChoices) => {
                //put a copy on top of the deck
                let curse = madeChoices[0] as Card
                abilityArgs.deck!.push(curse.clone())
            }).setCanPlay((cardArgs) => {
                return cardArgs.owner.cih().filter((card) => card.getProp("curse")).length > 0
            })
        ]).setRarity(Rarity.RARE)
    ],
    gambling_deck: [
        new Card(`Lady Fortune's Favor`, [
            new PlayerRestrictionAbility("dice"),
            new CostAbility("tadbucks", 20),
            new AbilityDiscardSelfCard(1),
            new BaseAbility("Roll your dice. If you get a {formula} or more, you win the game.", [], (cardArgs, madeChoices) => {
                let result = cardArgs.owner.rollDice()
                if (result >= 100 - cardArgs.card!.pow()) {
                    cardArgs.owner.setCanWin(true, "had Lady Fortune's favor")
                }
            }).setFormula(`100 - {pow}`)
        ]).setRarity(Rarity.MYTHIC),
        new Card(`Street Modding`, [
            new PlayerRestrictionAbility("dice"),
            new CostAbility("tadbucks", 15),
            new BaseAbility("Add {formula} pips at random to your dice.", [], (cardArgs, madeChoices) => {
                let pips = 3 + cardArgs.card!.pow()
                let dice = [...(cardArgs.owner.getProp("dice") ?? [-1])]
                for (let i = 0; i < pips; i++) {
                    dice[Math.floor(Math.random() * dice.length)]++
                }
                cardArgs.owner.setProp("dice", dice, cardArgs)
            }).setFormula(`3 + {pow}`)
        ]).setRarity(Rarity.UNCOMMON),
        new Card(`Government Grade Fortunator`, [
            new PlayerRestrictionAbility("dice"),
            new CostAbility("tadbucks", 100),
            new BaseAbility("Add {formula} pips at random to your dice.", [], (cardArgs, madeChoices) => {
                let pips = 10 + cardArgs.card!.pow()
                let dice = [...(cardArgs.owner.getProp("dice") ?? [-1])]
                for (let i = 0; i < pips; i++) {
                    dice[Math.floor(Math.random() * dice.length)]++
                }
                cardArgs.owner.setProp("dice", dice, cardArgs)
            }).setFormula(`10 + {pow}`)
        ]).setRarity(Rarity.RARE),
        new Card(`Dimensionality Tear`, [
            new PlayerRestrictionAbility("explosives"),
            new PlayerRestrictionAbility("dice"),
            new CostAbility("tadbucks", 20),
            new CostAbility("knowledge", 10),
            new BaseAbility("Add 2 sides to your dice, each with pips equal to the total of the rest of the sides of the dice.", [], (cardArgs, madeChoices) => {
                let total = cardArgs.owner.getProp("dice").reduce((a, b) => a + b, 0)
                cardArgs.owner.setProp("dice", cardArgs.owner.getProp("dice").concat([total, total]), cardArgs)
            })
        ]).setRarity(Rarity.MYTHIC),
        new Card(`Gambling Insurance`, [
            new PlayerRestrictionAbility("casino"),
            new CostAbility("tadbucks", 50),
            new AbilityAddEventToSelf(["gamble_lose"], (abilityArgs) => {
                abilityArgs.owner.setProp("tadbucks", (abilityArgs.owner.getProp("tadbucks") ?? 0) + (abilityArgs.card!.pow() * 10), abilityArgs)
            }).setText("Whenever you lose at gambling, you gain {formula} Tadbucks.").setFormula(`{pow} * 10`)
        ]).setRarity(Rarity.LEGENDARY)
    ],
    currency_deck: [
        new Card(`Telemarketing`, [
            new CostAbility("tadbucks", 50),
            new AbilityUnlockUpgrade(new Upgrade({
                name: "Telemarketing",
                description: "Outsource cold-calling all your opponents, wasting their time.",
                cost: [{
                    amt: 15,
                    resource: "tadbucks"
                }]
            }, (c) => {
                c.opps.forEach((opponent) => {
                    opponent.addTurns(2)
                })
            }, true, 1.35)).setText("Unlocks telemarketing as a way to waste your opponents time.")
        ]).setRarity(Rarity.RARE),
        new Card(`Welfare Handouts`, [
            new BaseAbility(`Cards in your hand lose all costs`, [], (abilityArgs, madeChoices) => {
                //iterate through each card in your hand and create a copy that has no costs
                let cards = abilityArgs.owner.cih()
                for (let i = 0; i < cards.length; i++) {
                    cards[i] = new Card(cards[i].getName(), [
                        ...cards[i].getAbilities().map((ability) => {
                            return ability.clone()
                        }).filter((ability) => {
                            return !ability.isCostAbility()
                        })
                    ]).setPow(cards[i].pow()).setRarity(cards[i].getRarity()).setProps(cards[i].getProps())
                }
            })
        ]).setRarity(Rarity.LEGENDARY),
        new Card(`Moneybags $$$`, [
            new CostAbility(`tadbucks`, 2000),
            new AbilityWin("achieving wealth")
        ]).setRarity(Rarity.LEGENDARY),
        new Card(`Communism`, [
            new BaseAbility(`Collect all cards from all hands, shuffle them together, then distribute them evenly to all players`, [], (abilityArgs, madeChoices) => {
                //gather all cards from all players hands
                let allCards = []
                for (let player of [abilityArgs.owner, ...abilityArgs.opps]) {
                    while (player.inHand() > 0) {
                        allCards.push(player.cih().pop())
                    }
                }
                //evenly distribute them to all players, starting with owner
                let ctr = 0;
                while (allCards.length > 0) {
                    [abilityArgs.owner, ...abilityArgs.opps][ctr % ([abilityArgs.owner, ...abilityArgs.opps].length)].cih().push(allCards.pop())
                    ctr++;
                }
            })
        ]).setRarity(Rarity.MYTHIC),
        new Card(`The House Always Wins`, [
            new CostAbility("tadbucks", 25),
            new PlayerRestrictionAbilityNeg("casino"),
            new AbilitySetPropSelf("casino", true).setText("Unlocks membership to the casino."),
            new AbilitySetPropSelf("dice", [1, 2, 3, 4, 5, 6]).setText("Unlocks a basic 6-sided dice"),
            new AbilityAddDeck("gambling_deck", 50, true).setText(`Invent gambling. Add it to the game.`)
        ]).setRarity(Rarity.MYTHIC),
        new Card(`Payday`, [
            new BaseAbility(`Get paid. Earn {formula} Tadbucks.`, [], abilityArgs => {
                abilityArgs.owner.setProp("res_tadbucks", (abilityArgs.owner.getProp("res_tadbucks") ?? 0) + (15 * abilityArgs.card!.pow()), abilityArgs)
            }).setFormula(`15 * {pow}`)
        ]).setRarity(Rarity.BASIC),
        new Card(`Bonus Check`, [
            new BaseAbility(`Get paid. Earn {formula} Tadbucks.`, [], abilityArgs => {
                abilityArgs.owner.setProp("res_tadbucks", (abilityArgs.owner.getProp("res_tadbucks") ?? 0) + (25 * abilityArgs.card!.pow()), abilityArgs)
            }).setFormula(`25 * {pow}`)
        ]).setRarity(Rarity.COMMON),
        new Card(`Corporate Sabotage`, [
            new CostAbility("tadbucks", 20),
            new AbilityDiscardOppCard(3)
        ]).setRarity(Rarity.RARE),
        new Card(`Inflationary Hedging`, [
            new CostAbility("tadbucks", 35),
            new BaseAbility(`Increase the power of all cards in your hand and the deck that mention Tadbucks by {formula}`, [], (abilityArgs, madeChoices) => {
                for (let card of abilityArgs.owner.cih()) {
                    //skip this card
                    if (!card) {
                        continue;
                    }
                    if (card === abilityArgs.card) continue;
                    if (card.getText().toLowerCase().includes("tadbuck") || card.getName().toLowerCase().includes("tadbuck")) {
                        card.setPow(card.pow() + abilityArgs.card!.pow())
                    }
                }
                //do this for cards in deck too
                for (let card of abilityArgs.deck!.asArray()) {
                    if (!card) {
                        continue;
                    }
                    if (card.getText().toLowerCase().includes("tadbuck") || card.getName().toLowerCase().includes("tadbuck")) {
                        card.setPow(card.pow() + abilityArgs.card!.pow())
                    }
                }
            })
        ]).setRarity(Rarity.RARE),
        new Card(`Marketplace Economics`, [
            new CostAbility("tadbucks", 50),
            new AbilityAddDeck("basic_resource_deck", 75, false).setText(`Invent market economics. Add basic resources to the game.`)
        ])
    ],
    life_deck: [
        new Card(`Job Interview`, [
            new AbilityUnlockUpgrade(new Upgrade({
                name: "Get a Job",
                description: "Search for a job in Alaska.",
                cost: [{
                    amt: 3,
                    resource: "turns"
                }],
                locked: false
            }, (cardArgs) => {
                //unlock another upgrade called "work" that gives you 20 tadbucks every time you take it.
                let p = cardArgs.owner
                p.addUpgrade(new Upgrade({
                    name: "Work",
                    description: "Work for 65 Tadbucks.",
                    cost: [{
                        amt: 1,
                        resource: "turns"
                    }]
                }, (cardArgs) => {
                    cardArgs.owner.addResource("tadbucks", 65)
                }, true, 1.5))
            }))
        ]).setRarity(Rarity.UNCOMMON),
        new Card(`Phlebotomy`, [
            new AbilityUnlockUpgrade(new Upgrade({
                name: "Blood Drawing",
                description: "Take some time to do research on your blood. You get paid for it!",
                cost: [{
                    amt: 1,
                    resource: "turns"
                }, {
                    amt: 3,
                    resource: "life"
                }]
            }, (cardArgs) => {
                cardArgs.owner.addResource("tadbucks", 5)
                cardArgs.owner.addResource("knowledge", 5)
            }, true, 1.2))
        ]).setRarity(Rarity.UNCOMMON),
        new Card(`Crusader Kings III Level of Immortality`, [
            new CostAbility("life", 2500),
            new AbilityWin("achieving immortality")
        ]).setRarity(Rarity.MYTHIC),
        new Card(`Going to the Gym`, [
            new BaseAbility(`Gain {formula} life`, [], (abilityArgs, madeChoices) => {
                abilityArgs.owner.setProp("res_life", abilityArgs.owner.getProp("res_life") + (5 * abilityArgs.card!.pow()), abilityArgs)
            }).setFormula(`5 * {pow}`)
        ]).setRarity(Rarity.COMMON),
        new Card(`Assassinate`, [
            new BaseAbility(`Kill an opponent. They discard their hand.`, [
                {pointer: AIPointer.OPPONENT_MOST_CARDS, choice: Choices.OPPONENT}
            ], (abilityArgs, madeChoices) => {
                let opponent = madeChoices[0] as Player
                opponent.setProp("res_life", 0, abilityArgs)
                while (opponent.inHand() > 0) {
                    opponent.discard(opponent.cih()[0], abilityArgs.deck)
                }
            })
        ]).setRarity(Rarity.HAXOR),
        new Card(`Soul Cancer`, [
            new BaseAbility(`Whenever you play a card, lose {formula} life`, [], (abilityArgs, madeChoices) => {
                abilityArgs.owner.addEvent("play", (abilityArgs) => {
                    if (!abilityArgs.owner.getProp("res_life")) {
                        abilityArgs.owner.setProp("res_life", abilityArgs.card!.pow(), abilityArgs)
                    }
                    abilityArgs.owner.setProp("res_life", abilityArgs.owner.getProp("res_life") - abilityArgs.card!.pow(), abilityArgs)
                })
            })
        ]).setRarity(Rarity.RARE),
        new Card(`2024 Presidential Debate`, [
            new AbilityAntivaxxer(),
            new AbilityDrawCard(1)
        ]).setRarity(Rarity.UNCOMMON)
    ],
    point_deck: [
        new Card("Point of Pity", [
           new BaseAbility("If you have -{formula} or fewer points, you win the game on your next turn", [], (a, m) => {
               if (a.owner.getProp("points") <= -(100 - a.card!.pow())) {
                   a.owner.setCanWin(true, "had a point of pity")
               }
           }).setFormula(`100 - {pow}`)
        ]).setRarity(Rarity.RARE),
        new Card("Pointlessify", [
            new BaseAbility("Reduce all point values in an opponents hand to -1. Gain points equal to the difference.", [{
                pointer: AIPointer.OPPONENT_MOST_CARDS, choice: Choices.OPPONENT
            }
            ], (abilityArgs, madeChoices) => {
                let opponent = madeChoices[0] as Player
                let points = 0
                for (let card of opponent.cih()) {
                    if (card.getProp("point_value")) {
                        if (card.getProp("point_value") > -1)
                            points += card.getProp("point_value") + 1
                        card.setProp("point_value", -1)
                    }
                }

                abilityArgs.owner.setProp("points", (abilityArgs.owner.getProp("points") ?? 0) + points, abilityArgs)
            })
        ]).setRarity(Rarity.RARE),
        new Card("Pontificate", [
            new BaseAbility("Gain {formula} points.", [], (a, m) => {
                a.owner.setProp("points", a.owner.getProp("points") + a.card!.pow(), a)
            }),
            new BaseAbility("Randomly add points to all cards in the deck", [], (a2, m) => {
                for (let c of a2.deck!) {
                    if (c.getProp("point_value")) {
                        c.setProp("point_value", c.getProp("point_value") + Math.floor(Math.random() * c.pow()))
                    } else {
                        c.setProp("point_value", [-c.pow(), 0, 0, 1, 1, c.pow()].sort((a, b) => Math.random() - 0.5)[0])
                    }
                }
            })
        ]).setRarity(Rarity.BASIC),
    ],
    faith_deck: [
        new Card(`Thoughts and Prayers`, [
            new AbilityAddResource(1, "faith"),
            new AbilityDrawCard(1),
            new BaseAbility("Slow your roll. You pray instead of getting closer to winning", [], (a, m) => a.owner.addTurns(1))
        ]).setRarity(Rarity.BASIC),
    ],
    romance: [

    ],
    basic: [
        new Card(`Just Do Better`, [
            new AbilityAddDeck("romance", 75, true).setText(`Invent romance. Add it to the game.`),
            new AbilityAddResource(5, "love")
        ]).setRarity(Rarity.RARE),
        new Card(`Oozify`, [
            new BaseAbility(`Choose a card in your hand. Split it into {formula} weaker cards.`, [
                {pointer: AIPointer.CARD_IN_HAND_MOST_POWER, choice: Choices.CARD_IN_HAND}
            ], (a, m) => {
                let card = m[0] as Card
                let cards = []
                for (let i = 0; i < a.card.pow() + 1; i++) {
                    let newCard = card.clone().setPow(Math.floor(1 / a.card!.pow() * card.pow()));
                    newCard.setName(`Oozing ${newCard.getName()}`)
                    newCard.setRarity(Math.max(0, newCard.getRarity() - 1))
                    cards.push(newCard)
                }
                //remove the old card
                a.owner.cih().splice(a.owner.cih().indexOf(card), 1)
                a.owner.cih().push(...cards)
            }).setCanPlay((c) => {
                return c.owner.cih().length > 1
            }).setFormula(`{pow} + 1`)
        ]).setRarity(Rarity.RARE),
        new Card(`You Could Make a Religion Outta This`, [
            new AbilityAddDeck(`faith_deck`, 75, true).setText("Invent religion."),
            new AbilityAddResource(1, "faith"),
            new AbilityRemoveOtherCopiesFromGame()
        ]).setRarity(Rarity.RARE),
        new Card(`What's the Point?`, [
            new AbilityAddDeck("point_deck", 75, true).setText(`Invent points. Add points to the game.`),
            new AbilitySetPropAll("points_to_win", 100).setText("First player to 100 points wins on their next turn!"),
            new AbilityAddEventToAll(["play"], (abilityArgs) => {
                if (abilityArgs.card!.getProp("point_value")) {
                    let points = abilityArgs.card!.getProp("point_value") ?? 0
                    points *= 0.75 + (abilityArgs.card!.pow() * 0.25)
                    abilityArgs.owner.setProp("points", (abilityArgs.owner.getProp("points") ?? 0) + points, abilityArgs)
                }
            }).setText("Whenever someone plays a card, they get however many points that card is worth."),
            new AbilityAddEventToAll(["points_change"], (abilityArgs) => {
                if (abilityArgs.owner.getProp("points") >= abilityArgs.owner.getProp("points_to_win") ?? 100) {
                    abilityArgs.owner.setCanWin(true, "saw the point")
                }
            }).setText("Every time someone's score changes, check if they can win."),
            new BaseAbility("For each card in the deck, assign a random point value!", [], (abilityArgs, madeChoices) => {
                let points = [-7, -5, -3, -2, -2, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 5, 10]
                for (let card of abilityArgs.deck!.asArray()) {
                    card.setProp("point_value", points[Math.floor(Math.random() * points.length)])
                }
            }),
            new AbilityRemoveOtherCopiesFromGame()
        ]).setRarity(Rarity.LEGENDARY),
        new Card(`Agonize over a Decision`, [
            new AbilityDrawCard(3),
            new AbilityDiscardSelfCard(3)
        ]).setRarity(Rarity.UNCOMMON),
        new Card(`Skip Bitch`, [
            new BaseAbility(`Skip an opponents turn`, [
                {pointer: AIPointer.OPPONENT_MOST_CARDS, choice: Choices.OPPONENT}
            ], (abilityArgs, madeChoices) => {
                let opponent = madeChoices[0] as Player
                opponent.skip()
            })
        ]).setRarity(Rarity.UNCOMMON),
        new Card(`Megaskip Bitch`, [
            new BaseAbility(`Skip an opponents next {formula} turns`, [
                {pointer: AIPointer.OPPONENT_MOST_CARDS, choice: Choices.OPPONENT}
            ], (abilityArgs, madeChoices) => {
                let opponent = madeChoices[0] as Player
                opponent.skip()
                opponent.skip()
            }).setFormula(`1 + {pow}`)
        ]).setRarity(Rarity.HAXOR),
        new Card(`Housing Economy Crash`, [
            new BaseAbility(`Each player discards all cards above common rarity`, [], (abilityArgs, madeChoices) => {
                let players = [abilityArgs.owner, ...abilityArgs.opps]
                for (let player of players) {
                    let hand = player.cih().filter((card) => {
                        if (!card) {
                            return false
                        }
                        return card.getRarity() > Rarity.COMMON
                    })
                    for (let card of hand) {
                        player.discard(card, abilityArgs.deck)
                    }
                }
            })
        ]).setRarity(Rarity.RARE),
        new Card(`Tactical Cuckage`, [
            new AbilityDiscardOppCard(2),
            new AbilityDiscardSelfCard(3),
            new BaseAbility(`Make an opponent skip a turn`, [
                {pointer: AIPointer.OPPONENT_MOST_CARDS, choice: Choices.OPPONENT}
            ], (abilityArgs, madeChoices) => {
                let opponent = madeChoices[0] as Player
                opponent.skip()
            }),
            new AbilityDrawCard(1)
        ]).setRarity(Rarity.MYTHIC),
        new Card(`⚡⚡ Supercharge ⚡⚡`, [
            new AbilityIncreasePower(0),
            new BaseAbility(`⚡⚡`, [], (a, m) => {
                let card = m[0] as Card
                card.setName(`Empowered ${card.getName()}`)
            }).setFormula(`{pow}`)

        ]).setRarity(Rarity.UNCOMMON),
        new Card(`Gifts of Giving`, [
            new AbilityDrawCard(1),
            new AbilitySymDraw(1)
        ]).setRarity(Rarity.COMMON),
        new Card(`Minor Cucking`, [
            new AbilityDiscardOppCard(1)
        ]).setRarity(Rarity.COMMON),
        new Card(`Gifted Sabotage`, [
            new AbilityDiscardSelfCard(2)
        ]).setRarity(Rarity.COMMON),
        new Card(`Basic Bitchery`, [
            new AbilityDrawCard(1)
        ]).setRarity(Rarity.BASIC),
        new Card(`Change of Perspective`, [
            new AbilityDiscardHandDrawCards(2)
        ]).setRarity(Rarity.RARE),
        new Card(`Speedbump`, [
            new BaseAbility(`Increase everyone else's cards to play by {formula}`, [], (a, m) => {
                a.opps.forEach((p) => {
                    p.addTurns(a.card!.pow())
                })
            })
        ]).setRarity(Rarity.BASIC),
        new Card(`Encrust in Gold`, [
            new BaseAbility(`Increase a card in your hands rarity. It gains {formula} power`, [
                { choice: Choices.CARD_IN_HAND, pointer: AIPointer.CARD_IN_HAND_LEAST_POWER }
            ], (a, c) => {
                let card = c[0] as Card
                card.setRarity(card.getRarity() + 1)
                card.setPow(card.pow() + a.card!.pow() + 2)
                card.setName(`Golden ${card.getName()} 💰💰`)
            }).setFormula(`{pow} + 2`)
        ]).setRarity(Rarity.RARE),
        new Card(`Scrap Buyback`, [
            new AbilityRecoverCards(1).setFormula(`{pow}`)
        ]).setRarity(Rarity.UNCOMMON),
        new Card(`Rough Breakup`, [
           new AbilityExplodeCard(),
           new BaseAbility(`Reduce the power of cards in your hand by {formula}`, [], (a, c) => {
                a.owner.cih().forEach((card) => {
                     card.setPow(card.pow() - a.card!.pow())
                })
           }).setFormula(`{pow}`)
        ]),
        new Card(`Mutual Cuckage`, [
            new BaseAbility(`Increase everyone's cards to play to win by {formula}`, [], (a, m) => {
                [a.owner, ...a.opps].forEach((p) => {
                    p.addTurns(10 + a.card!.pow())
                })
            }).setFormula(`10 + {pow}`)
        ]).setRarity(Rarity.RARE),
        new Card(`Even the Playing Field`, [
            new PlayerPredicateRestrictionAbility(`Play only if you aren't the first player`, (cardArgs) => {
                return cardArgs.owner.getTurnPlacement() > 0
            }),
            new BaseAbility(`Decrease your cards to play to win by {formula}`, [], (a, m) => {
                a.owner.addTurns(-(3 + a.card!.pow()))
            }).setFormula(`3 + {pow}`)
        ]).setRarity(Rarity.UNCOMMON),
        new Card(`Denial`, [
            new BaseAbility(`Increase an opponent's cards to play to win by {formula}`, [
                {choice: Choices.OPPONENT, pointer: AIPointer.OPPONENT_LEAST_TURNS_REMAINING}
            ], (a, m) => {
                let opp = m[0] as Player
                opp.addTurns(a.card!.pow() * 2)
            }).setFormula(`{pow} * 2`)
        ]).setRarity(Rarity.COMMON),
        new Card(`Get a Life`, [
            new AbilityAddResource(10, "life"),
            new AbilityAddDeck("life_deck", 50, true),
        ]).setRarity(Rarity.RARE),
        new Card(`Proletariat Revolution`, [
            new PlayerPredicateRestrictionAbility(`Play only if you're the first player`, (c) => {
                return c.owner.getTurnPlacement() === 0
            }),
            new BaseAbility(`Draw {formula} cards.`, [], (abilityArgs, madeChoices) => {
                if (abilityArgs.owner.getTurnPlacement() === 0) {
                    abilityArgs.owner.draw(abilityArgs.deck, abilityArgs.card!.pow() + 2)
                }
            }).setFormula(`{pow} + 2`)
        ]).setRarity(Rarity.COMMON),
        new Card(`Pile o' Crap`, [
            new TextAbility(`💩`)
        ]).setRarity(Rarity.BASIC).setProp("crap", true),
        new Card(`Beanz It`, [
            new BaseAbility(`Add "Add {formula} turns to an opponent" to a card in your hand.`, [
                {choice: Choices.CARD_IN_HAND, pointer: AIPointer.CARD_IN_HAND_RANDOM}
            ], (a, m) => {
                let card = m[0] as Card
                card.setName(`Bean-Fueled ${card.getName()} 🫘`)
                card.addAbility(new AbilityAddTurnsOpp(a.card!.pow() - card.pow()))
            }).setFormula(`{pow}`)
        ]).setRarity(Rarity.COMMON),
        new Card(`Community Service Project`, [
            new BaseAbility(`Add "Draw {formula} card" to a card in your hand.`, [
                {choice: Choices.CARD_IN_HAND, pointer: AIPointer.CARD_IN_HAND_RANDOM}
            ], (a, m) => {
                let card = m[0] as Card
                card.setName(`Wizened ${card.getName()}`)
                card.addAbility(new AbilityDrawCard(a.card?.pow() - card.pow()))
            }).setFormula(`{pow}`),
        ]).setRarity(Rarity.COMMON),
        new Card(`Academia`, [
            new AbilityAddDeck("academia_deck", 100, true).setText(`Invent student loans. Add academia to the game.`),
            new AbilityRemoveOtherCopiesFromGame()
        ]).setRarity(Rarity.RARE),
        new Card(`Currency`, [
            new AbilityAddDeck("currency_deck", 100, true, true).setText(`Invent currency. Add currency to the game.`),
            new AbilityUnlockUpgrade(new Upgrade({
                name: "Get a Job",
                description: "Search for a job in Alaska.",
                cost: [{
                    amt: 3,
                    resource: "turns"
                }],
                locked: false
            }, (cardArgs) => {
                //unlock another upgrade called "work" that gives you 20 tadbucks every time you take it.
                let p = cardArgs.owner
                p.addUpgrade(new Upgrade({
                    name: "Work",
                    description: "Work for 50 Tadbucks.",
                    cost: [{
                        amt: 1,
                        resource: "turns"
                    }]
                }, (cardArgs) => {
                    cardArgs.owner.addResource("tadbucks", 50)
                }, true, 1.2))
            })).setText("You also invent the idea of working for pay."),
            new AbilityRemoveOtherCopiesFromGame()
        ]).setRarity(Rarity.RARE)
    ]
}

export default DeckList;
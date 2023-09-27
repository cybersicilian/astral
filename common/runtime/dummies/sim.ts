import Deck from "../../logic/gameplay/deck/Deck";
import Player from "../../logic/gameplay/player/Player";
import DeckList from "../../logic/gameplay/deck/DeckList";

function initDeck() {
    let deck = Deck.fromCardList(60, "basic")

    return {
        deck: deck
    }
}

function simulate(start_hand = 5, win_thresh = 0.6, spread = [1, 1, 0, -1]) {
    let players: Player[] = []
    let deck: Deck = initDeck().deck
    for (let i = 0; i < spread.length; i++) {
        players.push(new Player(start_hand + spread[i], deck).setTurnPlacement(i))
    }
    let win = Math.ceil(players.reduce((a, b) => a + b.inHand(), 0) * win_thresh)
    let turn_ctr = 0;
    let maxCih = 0
    let winner = -1;
    while (true) {
        let breakLoop = false;
        for (let i = 0; i < players.length; i++) {
            if (players[i].skipCheck()) {
                continue;
            }
            players[i].turnStart({
                owner: players[i],
                opps: players.filter(x => x.getName() !== players[i].getName()),
                deck: deck
            })
            //draw a card
            players[i].draw(deck, 1);
            if (players[i].cih().length > maxCih) {
                maxCih = players[i].cih().length
            }
            let indices = [];
            //if you have 2 or more cards in hand, you have to give one away
            //if a player has 0 cards in hand, you have to give one to them
            if (players[i].inHand() >= 2) {
                for (let j = 0; j < players.length; j++) {
                    if (j === i) {
                        continue;
                    }
                    indices.push(j)
                }
                //check if any eligible players have 0 cards in hand
                for (let p of indices) {
                    if (players[p].inHand() === 0) {
                        indices = [p];
                        break;
                    }
                }
                if (players[i].winCheck()) {
                    winner = i;
                    breakLoop = true;
                    break;
                } else {


                    let give = players[i].weightedGive({
                        owner: players[i],
                        opps: indices.map(x => players[x]),
                        deck: deck
                    })
                    if (give) {
                        players[i].give(give, players[indices[Math.floor(Math.random() * indices.length)]]);
                        if (players[i].cih().length > maxCih) {
                            maxCih = players[i].cih().length
                        }
                    }

                    //play a card at random
                    let play = players[i].weightedPlay({
                        owner: players[i],
                        opps: indices.map(x => players[x]),
                        deck: deck
                    })
                    if (play) {
                        players[i].play(play, players.filter(x => x.getName() !== players[i].getName()), deck, undefined)
                        if (players[i].cih().length > maxCih) {
                            maxCih = players[i].cih().length
                        }
                    }

                    players[i].weightedDiscardToHand({
                        owner: players[i],
                        opps: indices.map(x => players[x]),
                        deck: deck
                    })
                }
            }
        }
        if (breakLoop) {
            break;
        }
        turn_ctr++;
        if (turn_ctr > 1000) {
            break;
        }
    }
    return {
        turns: turn_ctr,
        winner: winner,
        win_reason: winner >= 0 ? players[winner].getWinReason() : "",
        players: players,
        card_stats: players.map(x => x.getCardStats()),
        deck_size: deck.length,
        max: maxCih,
        total_cards: deck.length + deck.discardPile.length + players.reduce((a, b) => a + b.inHand(), 0)
    }
}

let resultsArr = []
let simulateCtr = 100000
let win_thresh = 1
let start_hand = 7
let spread = [-1, 0, 0]
let card_stats: {
    [key: string]: {
        winner_played: number,
        loser_played: number,
        winner_drawn: number,
        loser_drawn: number
        winner_discarded: number,
        loser_discarded: number
        winner_given: number,
        loser_given: number,
        win_rate: number,
        text: string
    }
} = {}

console.log("Simulating...")
let baseDeck = initDeck()
console.log(`Cards in deck: ${baseDeck.deck.length}`)
//print out card names and quantity in deck
let cardNames = {}
for (let card of baseDeck.deck) {
    cardNames[card.getName()] = (cardNames[card.getName()] || 0) + 1
}
console.log(`Cards in deck: ${JSON.stringify(cardNames)}`)

let fs = require('fs');
for (let i = 0; i < simulateCtr; i++) {
    resultsArr.push(simulate(start_hand, win_thresh, spread))

    let events = resultsArr[i].card_stats
    for (let player in events) {
        let j = events[player]
        if (parseInt(player) === parseInt(resultsArr[i].winner)) {
            //push these stats to the winner stats
            for (let k of Object.keys(j)) {
                if (!card_stats[k]) card_stats[k] = {
                    winner_played: 0,
                    loser_played: 0,
                    winner_drawn: 0,
                    loser_drawn: 0,
                    winner_discarded: 0,
                    loser_discarded: 0,
                    winner_given: 0,
                    loser_given: 0,
                    win_rate: 0,
                    text: ""
                }
                card_stats[k].winner_played += j[k].played
                card_stats[k].winner_drawn += j[k].drawn
                card_stats[k].winner_discarded += j[k].discarded
                card_stats[k].winner_given += j[k].given
                card_stats[k].text = j[k].text
            }
        } else {
            //push them to the loser stats
            for (let k of Object.keys(j)) {
                if (!card_stats[k]) card_stats[k] = {
                    winner_played: 0,
                    loser_played: 0,
                    winner_drawn: 0,
                    loser_drawn: 0,
                    winner_discarded: 0,
                    loser_discarded: 0,
                    winner_given: 0,
                    loser_given: 0,
                    win_rate: 0,
                    text: ""
                }
                card_stats[k].loser_played += j[k].played
                card_stats[k].loser_drawn += j[k].drawn
                card_stats[k].loser_discarded += j[k].discarded
                card_stats[k].loser_given += j[k].given
                card_stats[k].text = j[k].text
            }
        }
    }
    //if there is a stats file, combine these stats with those stats
    let stats = {}
    if (fs.existsSync('./stats.json')) {
        stats = JSON.parse(fs.readFileSync('./stats.json', 'utf8'))
        //combine
        for (let card of Object.keys(card_stats)) {
            if (!stats[card]) {
                stats[card] = {...card_stats[card], played: 1}
                delete stats[card].text
            } else {
                stats[card].winner_played += card_stats[card].winner_played
                stats[card].loser_played += card_stats[card].loser_played
                stats[card].winner_drawn += card_stats[card].winner_drawn
                stats[card].loser_drawn += card_stats[card].loser_drawn
                stats[card].winner_discarded += card_stats[card].winner_discarded
                stats[card].loser_discarded += card_stats[card].loser_discarded
                stats[card].winner_given += card_stats[card].winner_given
                stats[card].loser_given += card_stats[card].loser_given
                stats[card].win_rate = stats[card].winner_played / (stats[card].winner_played + stats[card].loser_played)
                stats[card].played += 1
                delete stats[card].text
            }
        }
        //write to file
        fs.writeFileSync('./stats.json', JSON.stringify(stats, null, 2))
    } else {
        stats = {...card_stats}
        //set played to simulateCtr
        for (let card of Object.keys(stats)) {
            stats[card].played = 1
            delete stats[card].text
        }
        fs.writeFileSync('./stats.json', JSON.stringify(stats, null, 2))
    }

    if (i % 1000 === 0) {
        console.log(`${i}/${simulateCtr}`)
        let win_reasons = resultsArr.map(x => x.win_reason)
        let win_reason_counts = win_reasons.reduce((a, b) => {
            a[b] = (a[b] || 0) + 1;
            return a;
        }, {});
        console.log(`Win reasons: ${JSON.stringify(win_reason_counts)}`)
        let results = resultsArr.map(x => x.turns)
        //average max cih
        console.log(`Average max cih: ${resultsArr.map(x => x.max).reduce((a, b) => a + b, 0) / resultsArr.length}`)
        //stat output
        console.log(`Average turns: ${results.reduce((a, b) => a + b, 0) / results.length}`)
        console.log(`Median turns: ${results.sort((a, b) => a - b)[Math.floor(results.length / 2)]}`)
        //max and min turns
        console.log(`Max turns: ${results.sort((a, b) => a - b)[results.length - 1]}`)
        console.log(`Min turns: ${results.sort((a, b) => a - b)[0]}`)

        //card stats
        console.log(`Average total cards: ${resultsArr.map(x => x.total_cards).reduce((a, b) => a + b, 0) / resultsArr.length}`)

//look at the winners
        let winners = resultsArr.map(x => x.winner)
        let winnerCounts = winners.reduce((a, b) => {
            a[b] = (a[b] || 0) + 1;
            return a;
        }, {});
        console.log(`Winners: ${JSON.stringify(winnerCounts)}`)
    }
}

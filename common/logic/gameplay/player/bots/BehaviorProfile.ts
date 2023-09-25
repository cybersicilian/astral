
let BotType = {
    Jesse: {
        collectResource: 10,
        spendResource: -15,
        affectsSelf: 5,
        affectsOpponents: 20,
        changesGame: 5,
        meme: 10,
        oppWinSetback: 50,
        discardOpponentCards: 10
    },
    Ian: {
        collectResource: 20,
        spendResource: 10,
        drawsCards: 10,
        changesGame: 10,
        affectsSelf: 15,
        discardsCards: -10,
        unlockUpgrades: 10
    }
}

export default BotType;
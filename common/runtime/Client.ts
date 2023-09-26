import {CommEnum, GameState} from "../logic/structure/utils/CommEnum";
import {CardState, PlayerState} from "../logic/gameplay/player/Player";
import {AbilityChoices} from "../logic/gameplay/cards/choices/AbilityChoices";
import {UpgradeData} from "../logic/gameplay/player/systems/Upgrade";

export type ActiveChoices = {
    choice: AbilityChoices[],
    selected: (string|number)[]
}

export type CompositeState = {
    cards: CardState[]|undefined,
    player: PlayerState|undefined,
    game: GameState|undefined
}


type ActiveCard = {
    card: number,
    choices: ActiveChoices,
    choiceSplits: number[]
}

type EventHandler = (curr_state: CardState[], player_state: PlayerState|undefined, game_state: GameState|undefined) => void
type MessageHandler = (message: string) => void
type DisconnectHandler = () => void
type ActiveCardHandler = () => void

export default class Client {
    private readonly name: string
    private id: string = ""
    private turn: number = -1

    private curr_state: CardState[] = []
    private player_state: PlayerState | undefined = undefined
    private game_state: GameState | undefined = undefined

    private socket: WebSocket | undefined = undefined

    private activeCard: ActiveCard | undefined = undefined

    private onStateChange: EventHandler|undefined = undefined
    private onMessageReceived: MessageHandler|undefined = undefined
    private onDisconnect: DisconnectHandler|undefined = undefined
    private onActiveCardSet: ActiveCardHandler|undefined = undefined


    //these are for extra features down the road
    private upgradeShop: UpgradeData[] = []

    constructor(name: string) {
        this.name = name
    }

    state(): CompositeState {
        return {
            cards: this.curr_state,
            player: this.player_state,
            game: this.game_state
        }
    }

    setStateChangeHandler(handler: EventHandler) {
        this.onStateChange = handler
    }

    setMessageHandler(handler: MessageHandler) {
        this.onMessageReceived = handler
    }

    setDisconnectHandler(handler: DisconnectHandler) {
        this.onDisconnect = handler
    }

    setActiveCardHandler(handler: ActiveCardHandler) {
        this.onActiveCardSet = () => {
            handler()
        }
    }

    addBot() {
        if (this.socket) {
            this.socket.send(JSON.stringify({
                type: CommEnum.ADD_BOT,
                id: this.id
            }))
        }
    }

    kickPlayer(id: number, message: string = "{host} hated your guts.") {
        if (this.socket) {
            let body = {
                type: CommEnum.KICK_PLAYER,
                id: this.id,
                target: id,
                msg: message
            }
            this.socket.send(JSON.stringify(body))
        }
    }

    hasActiveCard() {
        return this.activeCard !== undefined
    }

    submitRequestForChoices(cardId: number) {
        if (this.socket) {
            //TODO: add checking to see if the card can be played client side
            this.socket.send(JSON.stringify({
                type: CommEnum.GET_CHOICES,
                id: this.id,
                idInHand: cardId
            }))
        }
    }

    allChoicesMade() {
        if (this.activeCard) {
            return this.activeCard.choices.choice.length === this.activeCard.choices.selected.length
        }
        return true
    }

    nextChoiceToMake() {
        if (this.activeCard && this.activeCard.choices && this.activeCard.choices.selected && this.activeCard.choices.selected.length < this.activeCard.choices.choice.length)  {
            let re = this.activeCard.choices.choice[this.activeCard.choices.selected.length]
            return re
        }
        return undefined
    }

    makeNextChoice(choice: string|number) {
        if (this.activeCard) {
            this.activeCard.choices.selected.push(choice)
        }
    }

    playActiveCard() {
        //TODO: add checking to see if the card can be played client side
        if (this.socket && this.activeCard) {
            if (this.activeCard.choices.choice.length !== this.activeCard.choices.selected.length) {
                //TODO: choices to be made here
                return
            } else {
                //map the choices to abilities now
                let choices: (string|number)[][] = []
                for (let i = 0; i < this.activeCard.choiceSplits.length; i++) {
                    choices.push([])
                    for (let j = 0; j < this.activeCard.choiceSplits[i]; j++) {
                        choices[i].push(this.activeCard.choices.selected.shift() as string|number)
                    }
                }
                this.socket.send(JSON.stringify({
                    type: CommEnum.PLAY_CARD,
                    id: this.id,
                    idInHand: this.activeCard.card,
                    choices: choices
                }))
                this.activeCard = undefined
            }
        }
    }

    choiceStr() {
        if (this.activeCard) {
            return `${this.activeCard.choices.selected.length + 1}/${this.activeCard.choices.choice.length}`
        }
        return ""
    }

    cancelActiveCard() {
        this.activeCard = undefined
    }

    selectCardToPlay(cardId: number) {
        this.submitRequestForChoices(cardId)
    }

    discardToHandSize(cardId: number) {
        if (this.socket) {
            this.socket.send(JSON.stringify({
                type: CommEnum.DISCARD_TO_HAND,
                id: this.id,
                idInHand: [cardId]
            }))
        }
    }

    drawCard() {
        if (this.socket) {
            this.socket.send(JSON.stringify({
                type: CommEnum.DRAW_CARD,
                id: this.id
            }))
        }
    }

    giveCard(cardId: number, targetId: number) {
        if (this.socket) {
            this.socket.send(JSON.stringify({
                type: CommEnum.GIVE_CARD,
                id: this.id,
                idInHand: cardId,
                target: targetId
            }))
        }
    }

    getUpgrades() {
        if (this.socket) {
            this.socket.send(JSON.stringify({
                type: CommEnum.TRANSFER_UPGRADE_SHOP,
                id: this.id
            }))
        }
        return this.upgradeShop
    }

    buyUpgrade(upgrade: number) {
        if (this.socket) {
            //clear the active card
            this.activeCard = undefined
            this.socket.send(JSON.stringify({
                type: CommEnum.BUY_UPGRADE,
                id: this.id,
                upgrade: upgrade
            }))
        }
    }

    disconnect() {
        this.socket?.close()
    }

    connect(connStr: string) {
        // if (connStr === "") {
        //     connStr = "localhost"
        // }
        // //if there's no port, add the default port 15912
        // if (!connStr.includes(":")) {
        //     connStr += ":15912"
        // }
        //if we're not on localhost, see if it starts with wss://
        if (!connStr.startsWith("ws://") && !connStr.startsWith("wss://")) {
            connStr = "ws://" + connStr
        }
        if (connStr.length == 0) {
            connStr = "wss://vos-server.onrender.com"
        }
        this.init(new WebSocket(connStr))
    }

    init(socket: WebSocket) {
        this.socket = socket
        // message is received
        socket.addEventListener("message", event => {
            let body = JSON.parse(event.data as string)
            switch (body.type) {
                case CommEnum.CONNECTED:
                    this.id = body.connected
                    this.turn = body.turn
                    socket.send(JSON.stringify({
                        type: CommEnum.SET_NAME,
                        name: this.name,
                        id: this.id
                    }))
                    break;
                case CommEnum.UPDATE_PLAYER_STATE:
                    this.curr_state = body.state.personal as CardState[]
                    this.player_state = body.state.game.players[this.turn]
                    this.game_state = body.state.game
                    if (this.onStateChange) {
                        this.onStateChange(this.curr_state, this.player_state, this.game_state)
                    }
                    break;
                //TODO: split out server_msg and error
                case CommEnum.SERVER_MSG:
                case CommEnum.ERROR:
                    if (this.onMessageReceived) {
                        this.onMessageReceived(body.message)
                    }
                    break;
                case CommEnum.DISCONNECTED:
                    if (this.onDisconnect) {
                        this.onDisconnect()
                    }
                    break;
                case CommEnum.CHOICE_LIST:
                    this.activeCard = {
                        card: body.card,
                        choiceSplits: body.splits,
                        choices: {
                            choice: body.choices,
                            selected: []
                        }
                    }
                    if (this.onActiveCardSet) {
                        this.onActiveCardSet()
                    }
                    break;
                case CommEnum.TRANSFER_UPGRADE_SHOP:
                    this.upgradeShop = body.shop
                    break;
            }
        });

        // socket opened
        socket.addEventListener("open", event => {
            console.log("connected")
        });

        // socket closed
        socket.addEventListener("close", event => {
        });

        // error handler
        socket.addEventListener("error", event => {
        });
    }
}
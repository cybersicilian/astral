import {PlayerState} from "../player/Player";
import {Properties} from "../../structure/interfaces/IProppable";
import {ServerConfig} from "../../../runtime/Server";

export enum CommEnum {
    //admin
    CONNECTED,
    DISCONNECTED,
    SET_NAME,
    UPDATE_PLAYER_STATE,
    SERVER_MSG,

    //host commands
    ADD_BOT,
    KICK_PLAYER,

    //upgrade shop
    TRANSFER_UPGRADE_SHOP,
    BUY_UPGRADE,

    //marketplace
    TRANSFER_MARKETPLACE,

    //turn phases
    DRAW_CARD,
    PLAY_CARD,
    GIVE_CARD,
    DISCARD_TO_HAND,

    //choices
    GET_CHOICES,
    CHOICE_LIST,

    //error codes
    ERROR
}

export type GameState = {
    players: PlayerState[],
    turnPhase: number,
    activeTurn: string,
    deck: number,
    discard: {
        name: string,
        text: string,
        props: Properties
    }[],
    logs: string[],
    uis: {[key: string]: boolean}
    config: ServerConfig
}
import {PlayerState} from "../../gameplay/player/Player";
import {Properties} from "../interfaces/IProppable";
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

    //faith mechanics
    TRANSFER_RELIGION,
    ADD_RELIGIOUS_TENANT,
    CREATE_RELIGION,

    //turn phases
    DRAW_CARD,
    PLAY_CARD,
    GIVE_CARD,
    DISCARD_TO_HAND,

    //choices
    GET_CHOICES,
    CHOICE_LIST,
    PLAY_PHASE_CONFIRM,
    SEND_INTERRUPTS,
    RESOLVE_INTERRUPT,

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
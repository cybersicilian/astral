import { PlayerState } from "../player/Player";
import { Properties } from "../../structure/interfaces/IProppable";
export declare enum CommEnum {
    CONNECTED = 0,
    DISCONNECTED = 1,
    SET_NAME = 2,
    UPDATE_PLAYER_STATE = 3,
    SERVER_MSG = 4,
    ADD_BOT = 5,
    KICK_PLAYER = 6,
    TRANSFER_UPGRADE_SHOP = 7,
    BUY_UPGRADE = 8,
    TRANSFER_MARKETPLACE = 9,
    DRAW_CARD = 10,
    PLAY_CARD = 11,
    GIVE_CARD = 12,
    DISCARD_TO_HAND = 13,
    GET_CHOICES = 14,
    CHOICE_LIST = 15,
    ERROR = 16
}
export type GameState = {
    players: PlayerState[];
    turnPhase: number;
    activeTurn: string;
    deck: number;
    discard: {
        name: string;
        text: string;
        props: Properties;
    };
    logs: string[];
    uis: {
        [key: string]: boolean;
    };
};

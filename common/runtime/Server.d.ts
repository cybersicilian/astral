import Player from "../logic/gameplay/player/Player";
import Deck from "../logic/gameplay/deck/Deck";
export type ServerConfig = {
    startingHand: number;
    maxPlayers: number;
    minPlayers: number;
    fairness: boolean;
};
export default class Server {
    private players;
    private sockets;
    private deck;
    private turnPhase;
    private activeTurn;
    private logEntries;
    private sendableLogs;
    private serverObj;
    private serverPort;
    private serverConfig;
    constructor();
    reset(): void;
    static createName(): string;
    log(content: string): void;
    gameLog(content: string): void;
    getDeck(): Deck;
    addPlayer(): {
        id: string;
        index: number;
    };
    addBot(): string;
    incrementPhase(): void;
    incrementTurn(): void;
    playBotTurn(): void;
    updateUpgradeShop(id: string): void;
    disconnect(id: string, msg?: string): void;
    getActive(): Player;
    sendState(id: string): void;
    updateAllStates(): void;
    init(port?: number): void;
}

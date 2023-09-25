/// <reference types="bun-types" />
import { GameState } from "../logic/gameplay/server/CommEnum";
import { CardState, PlayerState } from "../logic/gameplay/player/Player";
import { AbilityChoices } from "../logic/gameplay/cards/choices/AbilityChoices";
import { UpgradeData } from "../logic/gameplay/player/systems/Upgrade";
export type ActiveChoices = {
    choice: AbilityChoices[];
    selected: (string | number)[];
};
export type CompositeState = {
    cards: CardState[] | undefined;
    player: PlayerState | undefined;
    game: GameState | undefined;
};
type EventHandler = (curr_state: CardState[], player_state: PlayerState | undefined, game_state: GameState | undefined) => void;
type MessageHandler = (message: string) => void;
type DisconnectHandler = () => void;
type ActiveCardHandler = () => void;
export default class Client {
    private readonly name;
    private id;
    private turn;
    private curr_state;
    private player_state;
    private game_state;
    private socket;
    private activeCard;
    private onStateChange;
    private onMessageReceived;
    private onDisconnect;
    private onActiveCardSet;
    private upgradeShop;
    constructor(name: string);
    state(): CompositeState;
    setStateChangeHandler(handler: EventHandler): void;
    setMessageHandler(handler: MessageHandler): void;
    setDisconnectHandler(handler: DisconnectHandler): void;
    setActiveCardHandler(handler: ActiveCardHandler): void;
    addBot(): void;
    kickPlayer(id: number, message?: string): void;
    hasActiveCard(): boolean;
    submitRequestForChoices(cardId: number): void;
    allChoicesMade(): boolean;
    nextChoiceToMake(): AbilityChoices | undefined;
    makeNextChoice(choice: string | number): void;
    playActiveCard(): void;
    choiceStr(): string;
    cancelActiveCard(): void;
    selectCardToPlay(cardId: number): void;
    discardToHandSize(cardId: number): void;
    drawCard(): void;
    giveCard(cardId: number, targetId: number): void;
    getUpgrades(): UpgradeData[];
    buyUpgrade(upgrade: number): void;
    disconnect(): void;
    connect(connStr: string): void;
    init(socket: WebSocket): void;
}
export {};

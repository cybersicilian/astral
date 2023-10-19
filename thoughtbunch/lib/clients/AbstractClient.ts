import AbstractRoom from "../rooms/AbstractRoom";
import {Msg} from "../msgs/Msg";

export default abstract class AbstractClient {

    private readonly socket: WebSocket;
    private room?: AbstractRoom;
    private name: string = "";

    protected constructor(socket: WebSocket) {
        this.socket = socket;
    }

    getSocket(): WebSocket {
        return this.socket;
    }

    getRoom(): AbstractRoom | undefined {
        return this.room;
    }

    getName(): string {
        return this.name;
    }

    setRoom(room: AbstractRoom): AbstractClient {
        this.room = room;
        return this;
    }

    setName(name: string): AbstractClient {
        this.name = name;
        return this;
    }

    abstract sendMsg(msg: Msg)
    abstract receiveMsg(msg: Msg)
}
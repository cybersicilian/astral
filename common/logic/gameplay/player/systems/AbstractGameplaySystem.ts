import {CommEnum} from "../../server/CommEnum";
import {CardArgs} from "../../cards/CardArgs";
import {JSX} from "react";
import Client from "../../../../runtime/Client";

export default class GameplaySystemHandler {
    private systems: AbstractGameplaySystem[] = []

    constructor() {
        this.systems = []
    }

    addSystem(system: AbstractGameplaySystem) {
        this.systems.push(system)
    }

    getSystems() {
        return this.systems
    }

    getSystem(name: string) {
        return this.systems.find((system) => system.constructor.name === name)
    }

    serverMsg(signal: CommEnum, data: any): boolean {
        for (let system of this.systems) {
            if (system.serverMsg(signal, data)) {
                return true
            }
        }
        return false
    }

    clientMsg(signal: CommEnum, data: any): boolean {
        for (let system of this.systems) {
            if (system.clientMsg(signal, data)) {
                return true
            }
        }
        return false
    }

    clientUI(client: Client): JSX {
        let ui = []
        for (let system of this.systems) {
            ui.push(system.clientUI(client))
        }
        return ui
    }
}

export default class AbstractGameplaySystem {

    //should return true if the system is accessible given the card args
    unlocked(args: CardArgs): boolean {
        throw new Error("Method not implemented.");
    }

    //the server message handler
    //returns true if the signal was received
    serverMsg(signal: CommEnum, data: any): boolean {
        throw new Error("Method not implemented.");
    }

    //the client message handler
    //returns true if the signal was received
    clientMsg(signal: CommEnum, data: any): boolean {
        throw new Error("Method not implemented.");
    }

    clientUI(client: Client): JSX {
        throw new Error("Method not implemented.");
    }
}
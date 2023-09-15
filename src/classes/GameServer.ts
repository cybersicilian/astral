import {Express} from "express";
import {Database} from "better-sqlite3";
import Player from "./Player";
import Expirable from "./util/Expirable";

export default class GameServer {

    private readonly port: number = 8080
    private readonly express: Express;
    private readonly dbase: Database;

    private players: Map<string, Expirable<Player>> = new Map<string, Expirable<Player>>();

    constructor() {
        console.log("GameServer started on port " + this.port)
        this.express = require('express')();
        this.dbase = require('better-sqlite3')("db.sqlite3");
        this.dbase.pragma('journal_mode = WAL');
    }

    init() {
        this.initRoutes();

        this.express.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}!`)
        })

        //server shutdown or process quit
        process.on('SIGINT', () => {
            this.shutdown()
        });

        process.on('SIGTERM', () => {
            this.shutdown()
        })

    }

    shutdown() {
        console.log("Shutting down server...")
        this.dbase.close();
        //iterate through the players and expire them
        for (let [key, value] of this.players.entries()) {
            value.expire();
        }
        process.exit(0);
    }

    initRoutes() {

    }

    db() {
        return this.dbase;
    }

    player(name: string): Player {
        if (this.players.has(name)) {
            return this.players.get(name).get();
        } else {
            let player = new Player(name);
            this.players.set(name, new Expirable(player, 1000 * 60 * 120, (player) => {
                this.disconnect(player)
                return player;
            }));
            return player;
        }
    }

    disconnect(player: Player) {
        player.save()
        this.players.delete(player.getName());
    }
}
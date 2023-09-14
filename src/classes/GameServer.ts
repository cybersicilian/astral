import {Express} from "express";
import {Database} from "better-sqlite3";
import Player from "./Player";

export default class GameServer {

    private readonly port: number = 8080
    private readonly express: Express;
    private readonly dbase: Database;

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

            new Player("Rogue")
        })
    }

    initRoutes() {

    }

    db() {
        return this.dbase;
    }
}
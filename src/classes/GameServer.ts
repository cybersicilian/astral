import {Express} from "express";

export default class GameServer {

    private readonly port: number = 8080
    private readonly express: Express;
    private db: any;

    constructor() {
        console.log("GameServer started on port " + this.port)
        this.express = require('express')();
        this.db = require('better-sqlite3')("db.sqlite3");
    }

    init() {
        this.initRoutes();

        this.express.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}!`)
        })
    }

    initRoutes() {

    }
}
"use strict";

const mongoose = require("mongoose")

const {db: {host, port, name}} = require('../configs/config.mongodb')

const connString = `mongodb://${host}:${port}/${name}`;

const {countConnection} = require("../helpers/check.connection");

console.log(`connectString: `, connString)

class Database {
    constructor() {
        this.connect();
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }

        return Database.instance;
    }

    // connect
    connect(type = "mongodb") {
        if (1 === 1) {
            mongoose.set("debug", true);
            mongoose.set("debug", {color: true});
        }

        mongoose
            .connect(connString, {
                maxPoolSize: 50,
            })
            .then((_) => {
                console.log(`Connected Mongodb Success: `);
                countConnection()
            })
            .catch((err) => console.log(`Error connect!`, err));
    }
}

const instanceMongodb = Database.getInstance();

module.exports = instanceMongodb;

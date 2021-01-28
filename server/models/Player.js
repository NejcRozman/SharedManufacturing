const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    playerName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    typeOfService: {
        type: String,
        required: true
    },
    typeOfOtherService1: {
        type: String,
        required: true
    },
    typeOfOtherService2: {
        type: String,
        required: true
    },
    amountOfAvailableService: {
        type: Number,
        default: 1
    },
    timeForService: {
        type: Number,
        default: 1
    },
    nextTimeForService: {
        type: Number,
        default: 1
    },
    initialTimeForService: {
        type: Number,
        default: 1
    },
    serviceTimestamp: {
        type: Number,
        default: 1
    },
    amountOfOtherService1: {
        type: Number,
        default: 0
    },
    amountOfOtherService2: {
        type: Number,
        default: 0
    },
    upgradeNumber: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: 0
    },
    stake: {
        type: Number,
        default: 0
    },
    previousAmountOfAvailableService: {
        type: Number,
        default: 1
    },
    /*price: {
        type: Map,
        default: {}
    }*/
});


const Player = mongoose.model("Player", PlayerSchema);
module.exports = Player;
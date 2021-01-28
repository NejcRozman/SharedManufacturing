const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const Admin = require('../models/Admin');
const Player = require('../models/Player');

const Production = require("../Production");
let production = new Production();
const Blockchain = require("../Blockchain");
let blockchain = new Blockchain();

exports.login_admin = (req, res, next) => {
    Admin.find({username: req.body.username})
        .exec()
        .then(admin => {
            if (admin.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            bcrypt.compare(req.body.password, admin[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                            username: admin[0].username,
                            adminId: admin[0]._id
                        },
                        process.env.ADMIN_KEY,
                        {
                            expiresIn: "1h"
                        },
                    );
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token
                    });
                }
                return res.status(401).json({
                    message: 'Auth failed'
                });
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.create_player = (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err) {
            return res.status(500).json({
                error: err
            });
        } else {
            const player = new Player({
                playerName: req.body.playerName,
                password: hash,
                balance: req.body.balance,
                typeOfService: req.body.typeOfService,
                typeOfOtherService1: req.body.typeOfOtherService1,
                typeOfOtherService2: req.body.typeOfOtherService2,
                timeForService: req.body.timeForService
            });
            player
                .save()
                .then(result => {
                    res.status(201).json({
                        message: 'Player created'
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
        }
    });
};

exports.start_game = async (req, res, next) => {
    try {
        if (req.body.adminId !== undefined) {
            if (validator.isInt(req.body.timeForBlock) && validator.isFloat(req.body.exponent)) {
                blockchain.timeForBlock = req.body.timeForBlock;
                production.exponent = -req.body.exponent;
                await Admin.findByIdAndUpdate(req.body.adminId, {gameIsOn: true, miningTime: Date.now()});
                let startProduction = await production.startProduction();
                let startBlockchain = await blockchain.startBlockchain();
                //let startBlockchain = true;
                if (startProduction && startBlockchain) {
                    res.status(201).json({
                        message: "Game started"
                    });
                }
            } else {
                res.status(400).json({
                    error: 'timeForBlock and exponent must be a number'
                });
            }
        } else {
            res.status(400).json({
                error: 'Body must have property adminId'
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
};

exports.end_game = async (req, res, next) => {
    try {
        if (req.body.adminId !== undefined) {
            await Admin.findByIdAndUpdate(req.body.adminId, {gameIsOn: false});
            await production.endProduction();
            await blockchain.endBlockchain();
            res.status(201).json({
                message: "Game is finished"
            });
        } else {
            res.status(400).json({
                error: 'Body must have property adminId'
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
};
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const Player = require('../models/Player');
const Transaction = require('../models/Transaction');
const TransactionData = require('../models/TransactionData');
const DeletedTransaction = require('../models/DeletedTransaction');
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const OrderData = require('../models/OrderData');

exports.login_player = (req, res, next) => {
    Player.find({playerName: req.body.playerName})
        .exec()
        .then(player => {
            if (player.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            bcrypt.compare(req.body.password, player[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                            playerName: player[0].playerName,
                            playerId: player[0]._id
                        },
                        process.env.PLAYER_KEY,
                        {
                            expiresIn: "24h"
                        },
                    );
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token,
                        id: player[0]._id
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

exports.create_order = async (req, res, next) => {
    try {
        if (validator.isDecimal(req.body.price)) {
            const player = await Player.findById(req.params.playerId);
            const existingOrder = await Order.find({provider: player._id});
            if (player.amountOfAvailableService > 0) {
                if (!Array.isArray(existingOrder) || !existingOrder.length) {
                    const order = await new Order({
                        provider: req.params.playerId,
                        playerName: player.playerName,
                        typeOfService: player.typeOfService,
                        amountOfService: 1,
                        price: req.body.price
                    });
                    await order.save();
                    const orderData = await new OrderData({
                        provider: req.params.playerId,
                        playerName: player.playerName,
                        typeOfService: player.typeOfService,
                        amountOfService: 1,
                        price: req.body.price
                    });
                    await orderData.save();
                    res.status(201).json({
                        message: 'Order created'
                    });
                } else {
                    res.status(400).json({ message: "Order already exists" });
                }
            } else {
                res.status(400).json({ message: "The amount of services is too low" });
            }
        } else {
            res.status(400).json({
                error: 'Price must be a number'
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err
        });
    }
};

exports.cancel_order = async (req, res, next) => {
    try {
        const id = req.body.orderId;
        const doc = await Order.findById(id);
        if (doc) {
            if (doc.provider.toString() === req.params.playerId) {
                const otherTransactions = await Transaction.find({orderId: id});
                if (!(!Array.isArray(otherTransactions) || !otherTransactions.length)) {
                    for (let transaction of otherTransactions) {
                        const consumer = await Player.findById(transaction.consumer._id);
                        const newBalance = consumer.balance + transaction.price + transaction.txFee;
                        await Player.findByIdAndUpdate(transaction.consumer._id, {balance: newBalance.toFixed(1)});
                        await Transaction.findByIdAndDelete(transaction._id);
                    }
                }
                await Order.findByIdAndDelete(id);
                res.status(200).json({
                    message: "Order deleted"
                });
            } else {
                res.status(401).json({ message: "You are not authorized" });
            }
        } else {
            res.status(404).json({ message: "No valid entry found for provided ID" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
};

exports.create_transaction = async (req, res, next) => {
    try {
        const id = req.body.orderId;
        const doc = await Order.findById(id);
        if (doc) {
            const player = await Player.findById(req.params.playerId);
            if (player.balance >= doc.price + req.body.txFee) {
                const newBalance = player.balance - doc.price - req.body.txFee;
                await Player.findByIdAndUpdate(req.params.playerId, {balance: newBalance.toFixed(1)});
                const transaction = await new Transaction({
                    consumer: req.params.playerId,
                    provider: doc.provider,
                    typeOfService: doc.typeOfService,
                    amountOfService: doc.amountOfService,
                    price: doc.price,
                    txFee: req.body.txFee,
                    typeOfTransaction: "trade",
                    orderId: id
                });
                await transaction.save();
                res.status(200).json({
                    message: "Transaction created"
                });
            } else {
                res.status(400).json({ message: "Balance is too low" });
            }
        } else {
            res.status(404).json({ message: "No valid entry found for provided ID" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
};

exports.cancel_transaction = async (req, res, next) => {
    try {
        const id = req.body.transactionId;
        const doc = await Transaction.findById(id);
        if (doc) {
            if (doc.consumer.toString() === req.params.playerId) {
                if (doc.typeOfTransaction === "unstake") {
                    const consumer = await Player.findById(doc.consumer._id);
                    const newBalance = consumer.balance + doc.txFee;
                    await Player.findByIdAndUpdate(doc.consumer._id, {balance: newBalance.toFixed(1)});
                } else {
                    const consumer = await Player.findById(doc.consumer._id);
                    const newBalance = consumer.balance + doc.price + doc.txFee;
                    await Player.findByIdAndUpdate(doc.consumer._id, {balance: newBalance.toFixed(1)});
                }
                const deletedTransaction = await new DeletedTransaction({
                    consumer: doc.consumer,
                    provider: doc.provider,
                    typeOfService: doc.typeOfService,
                    amountOfService: doc.amountOfService,
                    price: doc.price,
                    txFee: doc.txFee,
                    typeOfTransaction: doc.typeOfTransaction,
                    orderId: doc.orderId
                });
                await deletedTransaction.save();
                await Transaction.findByIdAndDelete(id);
                res.status(200).json({
                    message: "Transaction deleted"
                });
            } else {
                res.status(401).json({ message: "You are not authorized" });
            }
        } else {
            res.status(404).json({ message: "No valid entry found for provided ID" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
};


exports.stake = async (req, res, next) => {
    try {
        if (validator.isDecimal(req.body.stake)) {
            const stake = parseFloat(req.body.stake);
            const txFee = parseFloat(req.body.txFee);
            const player = await Player.findById(req.params.playerId);
            if (player.balance >= stake + txFee) {
                const newBalance = player.balance - stake - txFee;
                await Player.findByIdAndUpdate(req.params.playerId, {balance: newBalance.toFixed(1)});
                const transaction = await new Transaction({
                    consumer: req.params.playerId,
                    provider: "5f9945a43173144c25fea161",
                    typeOfService: "Stake",
                    amountOfService: 0,
                    price: stake,
                    txFee: txFee,
                    typeOfTransaction: "stake"
                });
                await transaction.save();
                res.status(200).json({
                    message: "Transaction created"
                });
            } else {
                res.status(400).json({ message: "Balance is too low" });
            }
        } else {
            res.status(400).json({
                error: 'Stake must be a number'
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
};

exports.unstake = async (req, res, next) => {
    try {
        if (validator.isDecimal(req.body.unstake)) {
            const unstake = parseFloat(req.body.unstake);
            const txFee = parseFloat(req.body.txFee);
            const player = await Player.findById(req.params.playerId);

            if (player.stake >= unstake) {
                if (player.balance >= txFee) {
                    const newBalance = player.balance - txFee;
                    await Player.findByIdAndUpdate(req.params.playerId, {balance: newBalance.toFixed(1)});
                    const transaction = await new Transaction({
                        consumer: req.params.playerId,
                        provider: "5f9945a43173144c25fea161",
                        typeOfService: "Unstake",
                        amountOfService: 0,
                        price: unstake,
                        txFee: txFee,
                        typeOfTransaction: "unstake"
                    });
                    await transaction.save();
                    res.status(200).json({
                        message: "Transaction created"
                    });
                } else {
                    res.status(400).json({ message: "Balance is too low" });
                }
            } else {
                res.status(400).json({
                    error: 'Not enough stake'
                });
            }
        } else {
            res.status(400).json({
                error: 'Stake must be a number'
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
};

exports.get_game_data = async (req, res, next) => {
    try {
        const player = await Player.findById(req.params.playerId).select("-password");
        const players = await Player.find().select("playerName typeOfService price stake");
        const orders = await Order.find().select("_id provider playerName typeOfService price");
        const allPendingTransactions = await Transaction.find();
        const allTransactions = await TransactionData.find();
        const admin = await Admin.find();
        const isGameOn = admin[0].gameIsOn;
        const miningTime = admin[0].miningTime;
        const totalStake = await players.reduce((total, current) => total + current.stake, 0);
        const playersData = await Player.find().select("_id playerName typeOfService stake");
        res.status(200).json({
            player: player,
            orders: orders,
            allPendingTransactions: allPendingTransactions,
            isGameOn: isGameOn,
            totalStake: totalStake,
            players: playersData,
            allTransactions: allTransactions,
            miningTime: miningTime
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
};




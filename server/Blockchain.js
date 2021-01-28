const Transaction = require('./models/Transaction');
const TransactionData = require('./models/TransactionData');
const Player = require('./models/Player');
const Order = require('./models/Order');
const Admin = require('./models/Admin');


class Blockchain {
    constructor() {
        this.timeForBlock = 10000;
        this.timeInterval = {};
        this.adminId = "5f9945a43173144c25fea161";
    }

    async startBlockchain() {
        return new Promise(async (resolve, reject) => {
            let that = this;
            try {
                that.timeInterval = await setInterval(async () => {
                    const transactions = await Transaction.find();
                    if (transactions.length !== 0) {
                        const max = await transactions.reduce((prev, current) => {
                            return (prev.txFee > current.txFee) ? prev : current
                        });
                        // Distribute TxFee between players
                        const players = await Player.find();
                        const sum = await players.reduce((prev, current) => {
                            return prev + current.stake;
                        }, 0);
                        await players.forEach(async player => {
                            let feeReward = max.txFee * (player.stake / sum);
                            await Player.findByIdAndUpdate(player._id, {
                                $inc: { balance: parseFloat(feeReward.toFixed(1)) }
                            });
                        });
                        // Process transaction
                        if (max.typeOfTransaction === "trade") {
                            await Player.findByIdAndUpdate(max.provider.toString(), {
                                $inc: { balance: max.price, amountOfAvailableService: -1 }
                            });
                            let consumer = await Player.findById(max.consumer.toString());
                            if (consumer.typeOfOtherService1 === max.typeOfService) {
                                await Player.findByIdAndUpdate(max.consumer.toString(), {
                                    $inc: { amountOfOtherService1: max.amountOfService }
                                });
                            } if (consumer.typeOfOtherService2 === max.typeOfService) {
                                await Player.findByIdAndUpdate(max.consumer.toString(), {
                                    $inc: { amountOfOtherService2: max.amountOfService }
                                });
                            }
                            const otherTransactions = await Transaction.find({orderId: max.orderId});
                            if (!(!Array.isArray(otherTransactions) || !otherTransactions.length)) {
                                for (let transaction of otherTransactions) {
                                    const consumer = await Player.findById(transaction.consumer._id);
                                    const newBalance = consumer.balance + transaction.price + transaction.txFee;
                                    await Player.findByIdAndUpdate(transaction.consumer._id, {balance: newBalance.toFixed(1)});
                                    await Transaction.findByIdAndDelete(transaction._id);
                                }
                            }
                            await Order.findByIdAndDelete(max.orderId);
                        } if (max.typeOfTransaction === "stake") {
                            await Player.findByIdAndUpdate(max.consumer.toString(), {
                                $inc: { stake: max.price }
                            });
                        } if (max.typeOfTransaction === "unstake") {
                            await Player.findByIdAndUpdate(max.consumer.toString(), {
                                $inc: { balance: max.price, stake: -max.price }
                            });
                        }
                        const transactionData = await new TransactionData({
                            consumer: max.consumer,
                            provider: max.provider,
                            typeOfService: max.typeOfService,
                            amountOfService: max.amountOfService,
                            price: max.price,
                            txFee: max.txFee,
                            typeOfTransaction: max.typeOfTransaction,
                            orderId: max.orderId,
                        });
                        await transactionData.save();
                        await Transaction.findByIdAndDelete(max._id);
                    }
                    // Update mining time
                    await Admin.findByIdAndUpdate(that.adminId, {miningTime: Date.now()});
                }, that.timeForBlock);
                resolve(true);
            } catch(err) {
                reject(err);
            }
        })
    }

    async endBlockchain() {
        return new Promise(async (resolve, reject) => {
            let that = this;
            try {
                await clearInterval(that.timeInterval);
                resolve(true);
            } catch(err) {
                reject(err);
            }

        })
    }
}

module.exports = Blockchain;
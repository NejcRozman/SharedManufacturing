const Player = require('./models/Player');

class Production {
    constructor() {
        this.period = 100;
        this.exponent = -0.3;
        this.timeInterval = {};
    }

    async startProduction() {
        return new Promise(async (resolve, reject) => {
            let that = this;
            try {
                const players = await Player.find();
                await players.forEach(async player => {
                    const startNextTimeForService = await that.productionFunction(player.timeForService, player.upgradeNumber);
                    await Player.findByIdAndUpdate(player._id, {
                        nextTimeForService: startNextTimeForService,
                        initialTimeForService: player.timeForService
                    });
                });
                that.timeInterval = await setInterval(async () => {
                    let currentTime = Date.now();
                    const players = await Player.find();
                    await players.forEach(async player => {
                        if (player.amountOfAvailableService === 0) {
                            if (player.previousAmountOfAvailableService === 1) {
                                await Player.findByIdAndUpdate(player._id, {
                                    serviceTimestamp: currentTime
                                });
                            }
                            if ((currentTime - player.serviceTimestamp) >= player.timeForService) {
                                await Player.findByIdAndUpdate(player._id, {
                                    amountOfAvailableService: player.amountOfAvailableService + 1,
                                    serviceTimestamp: currentTime
                                });
                            }
                        }
                        if ((player.amountOfOtherService1 > 0) && (player.amountOfOtherService2 > 0)) {
                            const newTimeForService = await that.productionFunction(player.initialTimeForService, player.upgradeNumber);
                            const newNextTimeForService = await that.productionFunction(player.initialTimeForService, player.upgradeNumber + 1);
                            console.log(newNextTimeForService);
                            await Player.findByIdAndUpdate(player._id, {
                                timeForService: newTimeForService,
                                nextTimeForService: newNextTimeForService,
                                upgradeNumber: player.upgradeNumber + 1,
                                amountOfOtherService1: player.amountOfOtherService1 - 1,
                                amountOfOtherService2: player.amountOfOtherService2 - 1
                            });
                        }
                        await Player.findByIdAndUpdate(player._id, {
                            previousAmountOfAvailableService: player.amountOfAvailableService
                        });
                    });
                }, that.period);
                resolve(true);
            } catch(err) {
                reject(err);
            }
        })
    }

    async endProduction() {
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

    async productionFunction(initialTimeForService, upgradeNumber) {
        return new Promise(async (resolve, reject) => {
            let that = this;
            try {
                const newTime = ((upgradeNumber + 2) ** that.exponent) * initialTimeForService;
                resolve(newTime);
            } catch(err) {
                reject(err);
            }

        })
    }
}

module.exports = Production;
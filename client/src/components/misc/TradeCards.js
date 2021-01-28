import React, {useState, useEffect} from 'react';
import { useGlobalContext} from "../../context/context";


const TradeCards = () => {
    const { gameData, openConfirmModal, setConfirmModalContent } = useGlobalContext();
    const [pendingTrades, setPendingTrades] = useState([]);
    const [requestedTrades, setRequestedTrades] = useState([]);

    function millisToMinutesAndSeconds(millis) {
        let d = new Date(1000*Math.round(millis/1000));
        if (d.getUTCMinutes() === 0) {
            return ( d.getUTCSeconds() + 's' );
        } else {
            return ( d.getUTCMinutes() + 'min ' + d.getUTCSeconds() + 's' );
        }
    }

    function setConfirmModal(trade) {
        setConfirmModalContent(trade);
        openConfirmModal();
    }

    useEffect(() => {
        const setDataArrays = async () => {
            const pendingArray = await Promise.all(gameData.pendingTrades.map(async (item) => {
                const { _id, consumer, provider, typeOfService, amountOfService, price, txFee, createdAt } = item;
                const createdMillis = await new Date(createdAt).getTime();
                const timeLeft = 300000 - (Date.now() - createdMillis);
                if (timeLeft > 0) {
                    const width = await Math.floor((1 - ((Date.now() - createdMillis) / 300000)) * 100);
                    const consumerObject = await gameData.players.filter(player => player._id === consumer);
                    const providerObject = await gameData.players.filter(player => player._id === provider);
                    return (
                        {
                            id: _id,
                            consumer: consumerObject[0].playerName,
                            provider: providerObject[0].playerName,
                            typeOfService: typeOfService,
                            amountOfService: amountOfService,
                            price: price,
                            txFee: txFee,
                            timeLeft: timeLeft,
                            width: width
                        }
                    )
                }
            }));
            if (!Array.isArray(pendingArray) || !pendingArray.length) {
                setPendingTrades([]);
            } else {
                await pendingArray.sort((a, b) => parseInt(a.width) - parseInt(b.width));
                setPendingTrades(pendingArray);
            }

            // --------------------------------------- Requested array -------------------------------------------

            const requestedArray = await Promise.all(gameData.requestedTrades.map(async (item) => {
                const { _id, consumer, provider, typeOfService, amountOfService, price, txFee, createdAt } = item;
                const createdMillis = await new Date(createdAt).getTime();
                const timeLeft = 300000 - (Date.now() - createdMillis);
                if (timeLeft > 0) {
                    const width = await Math.floor((1 - ((Date.now() - createdMillis) / 300000)) * 100);
                    const consumerObject = await gameData.players.filter(player => player._id === consumer);
                    const providerObject = await gameData.players.filter(player => player._id === provider);
                    return (
                        {
                            id: _id,
                            consumer: consumerObject[0].playerName,
                            provider: providerObject[0].playerName,
                            typeOfService: typeOfService,
                            amountOfService: amountOfService,
                            price: price,
                            txFee: txFee,
                            timeLeft: timeLeft,
                            width: width
                        }
                    )
                }
            }));
            if (!Array.isArray(requestedArray) || !requestedArray.length) {
                setRequestedTrades([]);
            } else {
                await requestedArray.sort((a, b) => parseInt(a.width) - parseInt(b.width));
                setRequestedTrades(requestedArray);
            }
        };
        setDataArrays();
    }, [gameData]);


    return (
        <>
            <div className="trade-cards-container">
                <div className="pending-trades-container">
                    {
                        pendingTrades.map((item) => {
                            if (item !== undefined) {
                                return (
                                    <div className="pending-trades-card" key={item.id}>
                                        <div className="time-progress-container">
                                            <div className="time-progress">
                                                <div className="time-progress-filler" style={{width: `${item.width}%`}}></div>
                                            </div>
                                            <span className="time-progress-text">
                                        Time left: {millisToMinutesAndSeconds(item.timeLeft)}
                                    </span>
                                        </div>
                                        <div className="pending-trades-card-first-row">
                                            <p>{item.consumer} &#8646; {item.provider}</p>
                                        </div>
                                        <div className="pending-trades-card-second-row">
                                            <p>Service: {item.typeOfService}</p>
                                            <p>Price: {item.price}$</p>
                                            <p>Tx Fee: {item.txFee}$</p>
                                        </div>
                                        <div className="pending-trades-card-third-row">
                                            <button type="button" className="trade-btn" onClick={() => {
                                                item.type = "cancel trade";
                                                setConfirmModal(item);
                                            }}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )
                            }
                        })
                    }
                </div>
                <div className="requested-trades-container">
                    {
                        requestedTrades.map((item) => {
                            if (item !== undefined) {
                                return (
                                    <div className="requested-trades-card" key={item.id}>
                                        <div className="time-progress-container">
                                            <div className="time-progress">
                                                <div className="time-progress-filler" style={{width: `${item.width}%`}}></div>
                                            </div>
                                            <span className="time-progress-text">
                                        Time left: {millisToMinutesAndSeconds(item.timeLeft)}
                                    </span>
                                        </div>
                                        <div className="requested-trades-card-first-row">
                                            <p>{item.consumer} &#8646; {item.provider}</p>
                                        </div>
                                        <div className="requested-trades-card-second-row">
                                            <p>Price: {item.price}$</p>
                                            <p>Tx Fee: {item.txFee}$</p>
                                        </div>
                                        <div className="requested-trades-card-third-row">
                                            <button type="button" className="trade-accept-btn" onClick={() => {
                                                item.type = "accept trade";
                                                setConfirmModal(item);
                                            }}>
                                                Accept
                                            </button>
                                            <button type="button" className="trade-reject-btn" onClick={() => {
                                                item.type = "reject trade";
                                                setConfirmModal(item);
                                            }}>
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                )
                            }
                        })
                    }
                </div>
            </div>
        </>
    )
};

export default TradeCards
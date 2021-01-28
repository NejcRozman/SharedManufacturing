import React, {useState, useEffect} from 'react'
import { useGlobalContext} from "../../context/context";
import balanceImg from '../../assets/balance.png';
import stakeImg from '../../assets/stake.png';

const Stats = () => {
    const { gameData } = useGlobalContext();
    const [serviceCompleted, setServiceCompleted] = useState(0);
    const [relativeStake, setRelativeStake] = useState(0);

    function millisToMinutesAndSeconds(millis) {
        let d = new Date(1000*Math.round(millis/1000));
        if (d.getUTCMinutes() === 0) {
            return ( d.getUTCSeconds() + 's' );
        } else {
            return ( d.getUTCMinutes() + 'min ' + d.getUTCSeconds() + 's' );
        }
    }

    useEffect(() => {
        if (gameData.player.amountOfAvailableService === 0) {
            let newServiceCompleted = Math.floor(((Date.now() - gameData.player.serviceTimestamp) / gameData.player.timeForService) * 100);
            setServiceCompleted(newServiceCompleted);
        } else {
            setServiceCompleted(100);
        }
        let newRelativeStake = Math.floor((gameData.player.stake / gameData.totalStake) * 100);
        setRelativeStake(newRelativeStake);
    }, [gameData]);

    return (
        <>
            <div className="stats-grid">
                <div className="grid-item-stats">
                    <div className={"stats-image"}>
                        <img src={balanceImg} alt={"balance"}/>
                    </div>
                    <div className={"stats-value"}>
                        <p>{gameData.player.balance}</p>
                    </div>
                </div>
                <div className="grid-item-stats">
                    <div className="time-value">
                        <h2>Service {gameData.player.typeOfService}</h2>
                    </div>
                    <div className={`${gameData.player.amountOfAvailableService === 1 ? 'time-value-available' : 'time-value-unavailable'}`}>
                        <h2>{gameData.player.amountOfAvailableService === 1 ? 'Available' : 'Unavailable'}</h2>
                    </div>
                    <div className="time-container">
                        <div className="bar-container">
                            <div className="bar-filler" style={{width: `${serviceCompleted}%`}}>
                                <span className="bar-label">{`${serviceCompleted}%`}</span>
                            </div>
                            <div className="bottom">
                                <p>Time for service = {millisToMinutesAndSeconds(gameData.player.timeForService)}</p>
                                <i></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid-item-stats">
                    <div className="stake-image">
                        <img src={stakeImg} alt={"stake"}/>
                    </div>
                    <div className={"stake-value"}>
                        <p>{gameData.player.stake}</p>
                    </div>
                    <div className={"stake-value"}>
                        <p>({relativeStake}%)</p>
                    </div>
                </div>
                <div className="grid-item-stats">
                    <div className="upgrade-value">
                        <h2>Upgrade</h2>
                    </div>
                    <div className="upgrade-container">
                        <div className={`${(gameData.player.amountOfOtherService1 > 0) ? 'upgrade-container-green' : 'upgrade-container-red'}`}>
                            <p>{`${gameData.player.amountOfOtherService1}`} &#215; {`${gameData.player.typeOfOtherService1}`}</p>
                        </div>
                        <div>
                            <p>+</p>
                        </div>
                        <div className={`${(gameData.player.amountOfOtherService2 > 0) ? 'upgrade-container-green' : 'upgrade-container-red'}`}>
                            <p>{`${gameData.player.amountOfOtherService2}`} &#215; {`${gameData.player.typeOfOtherService2}`}</p>
                        </div>
                    </div>
                    <div className="upgrade-container">
                        <div className="upgrade-container-formula">
                            <p>{`${gameData.player.typeOfOtherService1}`} + {`${gameData.player.typeOfOtherService2}`} = &#8681; {millisToMinutesAndSeconds(gameData.player.timeForService - gameData.player.nextTimeForService)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default Stats
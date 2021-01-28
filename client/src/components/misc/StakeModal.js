import React, {useState, useEffect} from 'react';
import { useGlobalContext} from "../../context/context";
import { FaTimes, FaPlus, FaMinus } from 'react-icons/fa';
import Axios from "axios/index";

const StakeModal = () => {
    const { gameData, isStakeModalOpen, closeStakeModal } = useGlobalContext();
    const [relativeStake, setRelativeStake] = useState(0);
    const [newStake, setNewStake] = useState(0);
    const [txFee, setTxFee] = useState();
    const [showAlert, setShowAlert] = useState(false);
    const [alertContent, setAlertContent] = useState('');

    const increaseNewStake = () => {
        if (newStake <= gameData.player.balance-1) {
            setNewStake(newStake+1);
        }
    };

    const decreaseNewStake = () => {
        if (newStake >= -(gameData.player.stake-1)) {
            setNewStake(newStake-1);
        }
    };

    const countDecimals = (value) => {
        if(Math.floor(value).toString() === value) return 0;
        return value.toString().split(".")[1].length || 0;
    };

    const confirm = async () => {
        try {
            if (txFee === undefined || txFee === "") {
                setAlertContent('You must enter a value');
                setShowAlert(true);
            } else {
                if (isNaN(txFee) || txFee < 0) {
                    setAlertContent('Input must be a positive number');
                    setShowAlert(true);
                } else {
                    if (countDecimals(txFee) > 1) {
                        setAlertContent('Input value can have at most one decimal place');
                        setShowAlert(true);
                    } else {
                        if (newStake+parseFloat(txFee) > gameData.player.balance) {
                            setAlertContent('Price and TxFee is higher than balance');
                            setShowAlert(true);
                        } else {
                            const token = localStorage.getItem("auth-token");
                            const playerId = localStorage.getItem("playerId");
                            if (newStake > 0) {
                                const data = {
                                    stake: newStake.toString(),
                                    txFee: txFee
                                };
                                const options = {
                                    headers: {
                                        Authorization: "Bearer " + token
                                    }
                                };
                                const confirmRes =  await Axios.post(`/player/stake/${playerId}`, data, options);
                            } if (newStake < 0) {
                                const newUnstake = -newStake;
                                const data = {
                                    unstake: newUnstake.toString(),
                                    txFee: txFee
                                };
                                const options = {
                                    headers: {
                                        Authorization: "Bearer " + token
                                    }
                                };
                                const confirmRes =  await Axios.post(`/player/unstake/${playerId}`, data, options);
                            }
                            setNewStake(0);
                            closeStakeModal();
                            setAlertContent('');
                            setShowAlert(false);
                            setTxFee();
                            document.getElementById("inputHolder").value= "";
                        }
                    }
                }
            }

        } catch(err) {
            console.log(err);
        }
    };

    useEffect(() => {
        let newRelativeStake = Math.floor((gameData.player.stake / gameData.totalStake) * 100);
        setRelativeStake(newRelativeStake);
    }, [gameData]);

    return (
        <div
            className={`${
                isStakeModalOpen ? 'modal-confirm-overlay show-modal-confirm' : 'modal-confirm-overlay'
                }`}
        >
            <div className='modal-confirm-container'>
                <h3>Stake: {gameData.player.stake} ({relativeStake}%)</h3>
                <div className="stake-modal-container">
                    <div>
                        <button className='decrease-stake-btn' onClick={decreaseNewStake}>
                            <FaMinus></FaMinus>
                        </button>
                    </div>
                    <div>
                        <h1>{newStake}</h1>
                    </div>
                    <div>
                        <button className='increase-stake-btn' onClick={increaseNewStake}>
                            <FaPlus></FaPlus>
                        </button>
                    </div>
                </div>
                <div className={"modal-input-group"}>
                    <label htmlFor={"txFee"}>Tx Fee</label>
                    <div className="modal-input-group-container">
                        <input type={"text"} name={"txFee"} id={"inputHolder"} placeholder={"Enter tx fee"} onChange={e => setTxFee(e.target.value)}/>
                    </div>
                </div>
                <div className={`${showAlert? 'modal-input-alert show-modal-input-alert' : 'modal-input-alert'}`}>
                    {alertContent}
                </div>
                <button className='close-modal-btn' onClick={() => {
                    setNewStake(0);
                    closeStakeModal();
                    setAlertContent('');
                    setShowAlert(false);
                    setTxFee();
                    document.getElementById("inputHolder").value= "";
                }}>
                    <FaTimes></FaTimes>
                </button>
                <button className='confirm-modal-btn' onClick={confirm}>Confirm</button>
            </div>
        </div>
    )
};

export default StakeModal
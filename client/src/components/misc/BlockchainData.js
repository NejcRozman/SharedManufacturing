import React, {useState, useEffect} from 'react';
import { useGlobalContext} from "../../context/context";
import PieChart from '../misc/PieChart';
import TransactionsTable from '../misc/TransactionsTable';
import AllTransactionsTable from '../misc/AllTransactionsTable';
import Axios from "axios/index";



const BlockchainData = () => {
    const { gameData } = useGlobalContext();
    const [chartDataArray, setChartDataArray] = useState([]);
    const [relativeStake, setRelativeStake] = useState(0);
    const [newStake, setNewStake] = useState(0);
    const [txFee, setTxFee] = useState();
    const [showAlert, setShowAlert] = useState(false);
    const [alertContent, setAlertContent] = useState('');

    const countDecimals = (value) => {
        if(Math.floor(value).toString() === value) return 0;
        return value.toString().split(".")[1].length || 0;
    };

    const confirmStake = async () => {
        try {
            if ((txFee === undefined || txFee === "") || (newStake === undefined || newStake === "")) {
                setAlertContent('You must enter a value');
                setShowAlert(true);
            } else {
                if ((isNaN(txFee) || txFee <= 0) || (isNaN(newStake) || newStake <= 0)) {
                    setAlertContent('Amount and tx fee must be a positive number bigger than 0');
                    setShowAlert(true);
                } else {
                    if ((countDecimals(txFee) > 1) || (countDecimals(newStake) > 1)) {
                        setAlertContent('Input value can have at most one decimal place');
                        setShowAlert(true);
                    } else {
                        if (parseFloat(newStake)+parseFloat(txFee) > gameData.player.balance) {
                            setAlertContent('Amount + TxFee is bigger than balance');
                            setShowAlert(true);
                        } else {
                            const token = localStorage.getItem("auth-token");
                            const playerId = localStorage.getItem("playerId");
                            const data = {
                                stake: newStake,
                                txFee: txFee
                            };
                            const options = {
                                headers: {
                                    Authorization: "Bearer " + token
                                }
                            };
                            const confirmRes =  await Axios.post(`/player/stake/${playerId}`, data, options);
                            setNewStake(0);
                            setAlertContent('');
                            setShowAlert(false);
                            setTxFee();
                            document.getElementById("inputHolder").value= "";
                            document.getElementById("amountHolder").value= "";
                        }
                    }
                }
            }

        } catch(err) {
            console.log(err);
        }
    };

    const confirmUnstake = async () => {
        try {
            if ((txFee === undefined || txFee === "") || (newStake === undefined || newStake === "")) {
                setAlertContent('You must enter a value');
                setShowAlert(true);
            } else {
                if ((isNaN(txFee) || txFee <= 0) || (isNaN(newStake) || newStake <= 0)) {
                    setAlertContent('Amount and tx fee must be a positive number bigger than 0');
                    setShowAlert(true);
                } else {
                    if ((countDecimals(txFee) > 1) || (countDecimals(newStake) > 1)) {
                        setAlertContent('Input value can have at most one decimal place');
                        setShowAlert(true);
                    } else {
                        if (parseFloat(newStake) > gameData.player.stake) {
                            setAlertContent('Amount is bigger than your stake');
                            setShowAlert(true);
                        } else {
                            const token = localStorage.getItem("auth-token");
                            const playerId = localStorage.getItem("playerId");
                            const data = {
                                unstake: newStake,
                                txFee: txFee
                            };
                            const options = {
                                headers: {
                                    Authorization: "Bearer " + token
                                }
                            };
                            const confirmRes =  await Axios.post(`/player/unstake/${playerId}`, data, options);
                            setNewStake(0);
                            setAlertContent('');
                            setShowAlert(false);
                            setTxFee();
                            document.getElementById("inputHolder").value= "";
                            document.getElementById("amountHolder").value= "";
                        }
                    }
                }
            }

        } catch(err) {
            console.log(err);
        }
    };

    useEffect(() => {
        const createDataArray = async () => {
            const dataArray = await gameData.players.map((item) => {
                return({
                    id: item.playerName,
                    value: parseInt(item.stake)
                });
            });
            setChartDataArray(dataArray);
        };
        createDataArray();
        let newRelativeStake = Math.floor((gameData.player.stake / gameData.totalStake) * 100);
        setRelativeStake(newRelativeStake);
    }, [gameData]);



    return (
        <>
            <div className="blockchain-container">
                <div className="blockchain-info-container">
                    <TransactionsTable/>
                    <div className="piechart-container">
                        <div className="piechart-container-text">
                            <h3>Blockchain - stake</h3>
                            <h4>Your stake: {gameData.player.stake} ({relativeStake}%)</h4>
                        </div>
                        <div className="piechart-container-chart-stake">
                            <div className="piechart-container-chart">
                                <PieChart data={chartDataArray}/>
                            </div>
                            <div className="stake-input-container">
                                <div className={"modal-input-group"}>
                                    <label htmlFor={"Amount"}>Amount</label>
                                    <div className="modal-input-group-container">
                                        <input style={{backgroundColor: "#dbdbdb"}} type={"text"} name={"amount"} id={"amountHolder"} placeholder={"Enter amount"} onChange={e => setNewStake(e.target.value)}/>
                                    </div>
                                </div>
                                <div className={"modal-input-group"}>
                                    <label htmlFor={"txFee"}>Tx Fee</label>
                                    <div className="modal-input-group-container">
                                        <input style={{backgroundColor: "#dbdbdb"}} type={"text"} name={"txFee"} id={"inputHolder"} placeholder={"Enter tx fee"} onChange={e => setTxFee(e.target.value)}/>
                                    </div>
                                </div>
                                <div className={`${showAlert? 'modal-input-alert show-modal-input-alert' : 'modal-input-alert'}`}>
                                    {alertContent}
                                </div>
                                <button className='confirm-stake-btn' onClick={() => confirmStake()}>Stake</button>
                                <button className='confirm-unstake-btn' onClick={() => confirmUnstake()}>Unstake</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="all-transactions-container">
                    <h3>Transactions History</h3>
                    <AllTransactionsTable/>
                </div>
            </div>
        </>
    )
};

export default BlockchainData
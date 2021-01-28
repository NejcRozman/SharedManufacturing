import React, { useState, useEffect } from 'react';
import { useGlobalContext} from "../../context/context";
import { FaTimes } from 'react-icons/fa';

const SetPriceModal = () => {
    const { gameData, closeSetPriceModal, isSetPriceModalOpen } = useGlobalContext();
    const [price, setPrice] = useState();
    const [allSelected, setAllSelected] = useState(false);
    const [checkBoxes, setCheckBoxes] = useState([]);

    const selectAll = async () => {
        await setAllSelected(!allSelected);
        const newArray = await checkBoxes.map(item => ({ ...item, isChecked: !allSelected }));
        await setCheckBoxes(newArray);
    };

    const selectOne = async (e) => {
        let itemName = e.target.name;
        let checked = e.target.checked;
        const newArray = await checkBoxes.map(item =>
            item.name === itemName ? { ...item, isChecked: checked } : item
        );
        setCheckBoxes(newArray);
        const allChecked = await newArray.every(item => item.isChecked);
        setAllSelected(allChecked);
    };

    const confirm = async () => {
        try {

        } catch(err) {
            console.log(err);
        }
    };

    useEffect(() => {
        const getPlayersData = async () => {
            const playersData = await gameData.players.map((item, index) => {
                return {
                    id: item._id,
                    name: "item" + (index+1).toString(),
                    playerName: item.playerName
                }
            });
            const priceData = await Promise.all(playersData.map(async (player) => {
                const playerPriceData = await Object.keys(gameData.player.price).forEach(function(key) {
                    if (key === player.id) {
                        return key;
                    }
                });
                if (playerPriceData === undefined) {
                    return {
                        ...player,
                        price: "undefined"
                    }
                } else {
                    return {
                        ...player,
                        price: playerPriceData.Object.keys(playerPriceData[0])[0]
                    }
                }
            }));
            const newArray = await Promise.all(priceData.map(async (data) => {
                const tableData = await checkBoxes.filter(item => item.id === data.id);
                if (!Array.isArray(tableData) || !tableData.length) {
                    return {
                        ...data,
                        isChecked: false
                    }
                } else {
                    return {
                        ...data,
                        isChecked: tableData.isChecked
                    }
                }
            }));
            await setCheckBoxes(newArray);
        };
        getPlayersData();
    }, [gameData]);


    return (
        <div
            className={`${
                isSetPriceModalOpen ? 'modal-confirm-overlay show-modal-confirm' : 'modal-confirm-overlay'
                }`}
        >
            <div className='modal-confirm-container'>
                <h3>Set Price</h3>
                <div className="set-price-container">
                    <table className="table-set-price">
                        <thead>
                        <tr>
                            <th className="table-set-price-head">Select</th>
                            <th className="table-set-price-head">Player Name</th>
                            <th className="table-set-price-head">Price</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            checkBoxes.map((item) => (
                                <tr key={item.id}>
                                    <td><input type="checkbox" id={item.id} name={item.name} checked={item.isChecked} onChange={selectOne}/></td>
                                    <td>{item.playerName}</td>
                                    <td>{item.price}$</td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                </div>
                <div className="select-all-container">
                    <button className='select-all-btn' onClick={() => selectAll()}>{allSelected ? 'Unselect All' : 'Select All'}</button>
                </div>
                <div className={"modal-input-group"}>
                    <label htmlFor={"Price"}>Price</label>
                    <div className="modal-input-group-container">
                        <input type={"text"} name={"Price"} id={"inputHolder"} placeholder={"Enter price"} onChange={e => setPrice(e.target.value)}/>
                        <span>$</span>
                    </div>
                </div>

                <button className='close-modal-btn' onClick={() => {
                    closeSetPriceModal();
                }}>
                    <FaTimes></FaTimes>
                </button>
                <div className="set-price-buttons-container">
                    <button className='confirm-modal-btn' onClick={confirm}>Set</button>
                    <button className='confirm-modal-btn'>Remove</button>
                </div>
            </div>
        </div>
    )
};

export default SetPriceModal
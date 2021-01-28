import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { links } from '../../links';
import { FaMoneyBillAlt, FaBusinessTime, FaChartPie } from 'react-icons/fa';
import { useGlobalContext} from "../../context/context";
import CreateOrderModal from '../misc/CreateOrderModal';

const Sidebar = () => {
    const { gameData, openCreateOrderModal } = useGlobalContext();
    const [orderExists, setOrderExists] = useState(false);
    const [relativeStake, setRelativeStake] = useState(0);

    const orderNotExists = async () => {
        const order = gameData.orders.filter(item => item.provider === gameData.player._id);
        setOrderExists(!Array.isArray(order) || !order.length);
    };

    useEffect(() => {
        orderNotExists();
        let newRelativeStake = Math.floor((gameData.player.stake / gameData.totalStake) * 100);
        setRelativeStake(newRelativeStake);
    }, [gameData]);

    return (
        <div>
            <div className="sidebar">
                <ul className='sidebar-links'>
                    {links.map((link) => {
                        const { id, url, text, icon } = link;
                        return (
                            <li key={id}>
                                <Link to={url}>
                                    {icon}
                                    {text}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <div className="stats-sidebar">
                <h3>Stats</h3>
                <div className="stats-sidebar-values">
                    <div className="stats-sidebar-values-stat">
                        <FaMoneyBillAlt style={{color: "green", fontSize: "22px"}}/>
                        <h4>{gameData.player.balance}</h4>
                    </div>
                    <div className="stats-sidebar-values-stat">
                        <FaBusinessTime style={{color: "#38aaff", fontSize: "22px"}}/>
                        <h4 style={gameData.player.amountOfAvailableService === 1 ? {color: "forestgreen", fontSize: "18px"} : {color: "darkred", fontSize: "18px"}}>{gameData.player.amountOfAvailableService === 1 ? 'AVAILABLE' : 'UNAVAILABLE'}</h4>
                    </div>
                    <div className="stats-sidebar-values-stat">
                        <FaChartPie style={{color: "#ffba72", fontSize: "22px"}}/>
                        <h4>{gameData.player.stake} ({relativeStake}%)</h4>
                    </div>
                </div>
            </div>
            <div className="create-order-container">
                {gameData.player.amountOfAvailableService === 1 && orderExists ? <button className="create-order-btn" onClick={openCreateOrderModal}>Set Price</button> : ''}
            </div>
            <CreateOrderModal/>
        </div>
    )
};

export default Sidebar
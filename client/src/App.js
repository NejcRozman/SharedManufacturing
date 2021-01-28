import React, { useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import {useGlobalContext} from "./context/context";

import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import Login from "./components/auth/Login";
import Trade from './components/pages/Trade';
import Blockchain from './components/pages/Blockchain';
import Error from './components/pages/Error';
import Axios from "axios/index";

Axios.defaults.baseURL = '5.189.178.30:8000';

function App() {
    const { setIsGameOn, setGameData } = useGlobalContext();

    const getGameData = async () => {
        try {
            let token = localStorage.getItem("auth-token");
            let playerId = localStorage.getItem("playerId");
            const gameRes = await Axios.get(`/player/gameData/${playerId}`, {
                headers: {"authorization": "Bearer " + token}
            });
            setGameData({
                token,
                player: gameRes.data.player,
                orders: gameRes.data.orders,
                allPendingTransactions: gameRes.data.allPendingTransactions,
                totalStake: gameRes.data.totalStake,
                players: gameRes.data.players,
                allTransactions: gameRes.data.allTransactions,
                miningTime: gameRes.data.miningTime
            });
            setIsGameOn(gameRes.data.isGameOn);
        } catch (err) {
            if (err.response !== undefined && err.response.data.message === "Auth failed") {
                localStorage.setItem("auth-token", "");
                localStorage.setItem("playerId", "");
                window.location.reload(false);
            }
        }
    };

    useEffect(() => {
        const checkLoggedInAndGame = async () => {
            let token = localStorage.getItem("auth-token");
            let playerId = localStorage.getItem("playerId");
            if (token !== (null || "") && playerId !== (null || "")) {
                getGameData();
                const interval = setInterval(() => {
                    getGameData();
                }, 100);
                return () => {
                    clearInterval(interval);
                };
            }
        };
        checkLoggedInAndGame();
    }, []);

    return (
        <>
            <Router>
                <Navbar/>
                <Switch>
                    <Route exact path={"/"} component={Home} />
                    <Route path={"/login"} component={Login}/>
                    <Route path={"/trade"} component={Trade}/>
                    <Route path={"/blockchain"} component={Blockchain}/>
                    <Route path={"*"} component={Error}/>
                </Switch>
            </Router>
        </>
    )
}

export default App

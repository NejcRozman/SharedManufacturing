import React, { useEffect } from 'react';
import {useGlobalContext} from "../../context/context";

import Sidebar from '../layout/Sidebar';
import Modal from '../misc/Modal';
import Stats from '../misc/Stats';
import StakeModal from '../misc/StakeModal';


const Home = () => {
    const { gameData, isGameOn, setModalContent} = useGlobalContext();


    useEffect(() => {
        const checkLoggedInAndGame = async () => {
            let token = localStorage.getItem("auth-token");
            let playerId = localStorage.getItem("playerId");
            if (token !== (null || "") && playerId !== (null || "")) {
                if (!isGameOn) {
                    setModalContent('Wait for the admin to start the game!');
                }
            } else {
                setModalContent('Please log in!');
            }
        };
        checkLoggedInAndGame();
    }, []);

    return (
        <div>
            <div>
                {
                    gameData.player ? (
                        <div>
                            {
                                isGameOn ? (
                                    <div>
                                        <div className="home-grid">
                                            <div className="item-sidebar">
                                                <Sidebar/>
                                            </div>
                                            <div className="item-content">
                                                <Stats/>
                                            </div>
                                        </div>
                                        <StakeModal/>
                                    </div>
                                ) : (
                                    <>
                                        <Modal/>
                                    </>
                                )
                            }
                        </div>

                    ) : (
                        <>
                            <Modal/>
                        </>
                    )
                }
            </div>
        </div>
    )
};

export default Home
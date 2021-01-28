import React, {useState, useEffect} from 'react'
import { useGlobalContext} from "../../context/context";
import BarChart from '../misc/BarChart';


const Trade = () => {
    const { gameData } = useGlobalContext();
    const [dataArray1, setDataArray1] = useState([]);
    const [dataArray2, setDataArray2] = useState([]);
    const [dataArray3, setDataArray3] = useState([]);
    const [modifiedDataArray1, setModifiedDataArray1] = useState([]);
    const [modifiedDataArray2, setModifiedDataArray2] = useState([]);
    const [modifiedDataArray3, setModifiedDataArray3] = useState([]);

    /*const sortArray = async (array) => {
        let namesArray = [];
        for (const item of array) {
            if (! await namesArray.includes(item.playerName)) {
                await namesArray.push(item.playerName);
            }
        }
        let finalArray = await Promise.all(namesArray.map( async (item) => {
            let index = 0;
            let orders = await array.filter(order => order.playerName === item);
            orders = await orders.map((order) => {
                index = index +1;
                order.playerName = order.playerName+(index).toString();
                return order;
            });
            return orders;
        }));
        return finalArray.flat();
    };*/


    useEffect(() => {
        const sortDataArrays = async () => {
            let array1 = await gameData.orders.filter(item => item.typeOfService === gameData.player.typeOfOtherService1);
            let array2 = await gameData.orders.filter(item => item.typeOfService === gameData.player.typeOfOtherService2);
            let array3 = await gameData.orders.filter(item => item.typeOfService === gameData.player.typeOfService);
            await array1.forEach((item) => {
                item.price = parseFloat(item.price);
                item.color= '#1E90FF';
            });
            await array2.forEach((item) => {
                item.price = parseFloat(item.price);
                item.color= 'green';
            });
            await array3.forEach((item) => {
                item.price = parseFloat(item.price);
                if (item.playerName === gameData.player.playerName) {
                    item.color= '#FFD700';
                } else {
                    item.color= "#FF8C00";
                }
            });
            await array1.sort((a, b) => parseInt(a.price) - parseInt(b.price));
            await array2.sort((a, b) => parseInt(a.price) - parseInt(b.price));
            await array3.sort((a, b) => parseInt(a.price) - parseInt(b.price));
            setDataArray1(array1);
            setDataArray2(array2);
            setDataArray3(array3);
            let modifiedArray1 = await array1.map((item) => {
               if (item.price < 1) {
                   return {...item, price: 0.9};
               } else {
                   return {...item};
               }
            });
            let modifiedArray2 = await array2.map((item) => {
                if (item.price < 1) {
                    return {...item, price: 0.9};
                } else {
                    return {...item};
                }
            });
            let modifiedArray3 = await array3.map((item) => {
                if (item.price < 1) {
                    return {...item, price: 0.9};
                } else {
                    return {...item};
                }
            });
            setModifiedDataArray1(modifiedArray1);
            setModifiedDataArray2(modifiedArray2);
            setModifiedDataArray3(modifiedArray3);
        };
        sortDataArrays();
    }, [gameData]);

    return (
        <>
            <div className="trades-container">
                <div className="other-services-trade-container">
                    <div className="chart-container">
                        <div className="chart-container-text">
                            <h3>Service {`${gameData.player.typeOfOtherService1}`}</h3>
                        </div>
                        <div className="chart-container-chart">
                            <BarChart dataArray={dataArray1} modifiedData={modifiedDataArray1}/>
                        </div>
                    </div>
                    <div className="chart-container">
                        <div className="chart-container-text">
                            <h3>Service {`${gameData.player.typeOfOtherService2}`}</h3>
                        </div>
                        <div className="chart-container-chart">
                            <BarChart dataArray={dataArray2} modifiedData={modifiedDataArray2}/>
                        </div>
                    </div>
                </div>
                <div className="my-service-trade-container">
                    <div className="chart-container">
                        <div className="chart-container-text">
                            <h3>Service {`${gameData.player.typeOfService}`}</h3>
                        </div>
                        <div className="chart-container-chart">
                            <BarChart dataArray={dataArray3} modifiedData={modifiedDataArray3}/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default Trade;
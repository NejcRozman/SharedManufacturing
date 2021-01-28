import React from 'react'
import { ResponsiveBar } from '@nivo/bar';
import { useGlobalContext} from "../../context/context";

const BarChart = ({dataArray, modifiedData}) => {
    const { gameData, openTradeModal, setTradeModalContent, openCancelOrderModal, setCancelOrderModalContent } = useGlobalContext();

    const setTradeModal = (data) => {
        if (data.typeOfService !== gameData.player.typeOfService) {
            const realData = dataArray.filter(item => item._id === data._id);
            if (!(!Array.isArray(realData) || !realData.length)) {
                setTradeModalContent(realData[0]);
                openTradeModal();
            }
        } else {
            if (data.playerName === gameData.player.playerName) {
                const realData = dataArray.filter(item => item._id === data._id);
                if (!(!Array.isArray(realData) || !realData.length)) {
                    setCancelOrderModalContent(realData[0]);
                    openCancelOrderModal();
                }
            }
        }
    };

    const mouseHover = (data, event) => {
        if (data.typeOfService !== gameData.player.typeOfService) {
            event.target.style.cursor = 'pointer';
        } else {
            if (data.playerName === gameData.player.playerName) {
                event.target.style.cursor = 'pointer';
            }
        }
    };

    const renderLabel = (data) => {
        const realData = dataArray.filter(item => item._id === data._id);
        if (!(!Array.isArray(realData) || !realData.length)) {
            return realData[0].price.toString();
        }
    };

    const renderTooltip = (data) => {
        const realData = dataArray.filter(item => item._id === data._id);
        if (!(!Array.isArray(realData) || !realData.length)) {
            return realData[0].price.toString();
        }
    };

    return (
        <ResponsiveBar
            data={modifiedData}
            onClick={(data) => setTradeModal(data.data)}
            onMouseEnter={(data, event) => mouseHover(data.data, event)}
            keys={[ 'price' ]}
            indexBy="playerName"
            margin={{ top: 10, right: 20, bottom: 50, left: 70 }}
            padding={0.25}
            valueScale={{ type: 'symlog'}}
            theme={{ "fontSize": 14, fontFamily: "Roboto, sans-serif", axis: { legend: { text: { fontSize: "16px", fontWeight: "bold", fontFamily: "Roboto, sans-serif" } } } }}
            colors={d => d.data.color}
            borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'PRICE',
                legendPosition: 'middle',
                legendOffset: -50,
                tickValues: 3
            }}
            tooltip={({ data, id }) => {
                return (
                    <strong>
                        {id} - {data.playerName}: {renderTooltip(data)}
                    </strong>
                )
            }}
            label={(data) => renderLabel(data.data)}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="white"
            animate={false}
            motionStiffness={90}
            motionDamping={15}
        />
    )
};


export default BarChart
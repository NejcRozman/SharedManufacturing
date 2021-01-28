import React from 'react';
import {
    FaHome,
    FaUserFriends,
    FaChartPie,
} from 'react-icons/fa';
export const links = [
    {
        id: 1,
        url: '/',
        text: 'Home',
        icon: <FaHome />,
    },
    {
        id: 2,
        url: '/trade',
        text: 'Trade',
        icon: <FaUserFriends />,
    },
    {
        id: 3,
        url: '/blockchain',
        text: 'Blockchain',
        icon: <FaChartPie />,
    }
];

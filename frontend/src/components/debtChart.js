import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { getDebtData } from '../services/debtService.js';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const DebtChart = ({ countryCode }) => {
    const [debtData, setDebtData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!countryCode) return;
            try {
                const data = await getDebtData(countryCode);
                setDebtData(data);
            } catch (error) {
                console.error('Error fetching debt data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [countryCode]);


    const chartData = {
        labels: Object.keys(debtData), // Vuosiluvut
        datasets: [
            {
                label: 'General Government Gross Debt (millions)',
                data: Object.values(debtData), // Velan arvot
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1,
            },
        ],
    };

    // Kaavion asetukset
    const options = {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Year',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Debt in Millions',
                },
                ticks: {
                    callback: function (value) {
                        return value / 1000000 + 'M'; // Näytetään miljoonina
                    },
                },
            },
        },
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    if (loading) {
        return <p>Loading data...</p>;
    }

    if (Object.keys(debtData).length === 0) {
        return <p>No debt data available for this country.</p>;
    }

    return (
        <div>
            <h2>{countryCode} General Government Gross Debt</h2>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default DebtChart;
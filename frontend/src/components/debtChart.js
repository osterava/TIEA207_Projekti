import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { getDebtData } from '../services/debtService.js';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DebtChart = ({ countryCode }) => {
    const [debtData, setDebtData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!countryCode) return
            try {
                const data = await getDebtData(countryCode)
                setDebtData(data)
            } catch (error) {
                console.error('Error fetching debt data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [countryCode])

    const chartData = {
        labels: Object.keys(debtData),
        datasets: [
            {
                label: 'General Government Gross Debt (millions)',
                data: Object.values(debtData),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    if (loading) {
        return <p>Loading data...</p>;
    }

    if (Object.keys(debtData).length === 0) {
        return <p>No debt data available for this country.</p>
    }

    return (
        <div>
            <h2>{countryCode} General Government Gross Debt</h2>
            <Bar data={chartData} />
        </div>
    );
};

export default DebtChart;

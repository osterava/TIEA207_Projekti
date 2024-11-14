import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { getDebtData } from '../services/debtService.js'
import { getTotalDebtData } from '../services/totalDebtService.js'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend)

const DebtChart = ({ countryCode }) => {
    const [debtData, setDebtData] = useState({})
    const [totalDebtData, setTotalDebtData] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            if (!countryCode) return
            try {
                setLoading(true)
                const data = await getDebtData(countryCode)
                const totalData = await getTotalDebtData(countryCode)
                setDebtData(data)
                setTotalDebtData(totalData)
            } catch (error) {
                console.error('Error fetching debt data:', error)
                setError('Failed to load debt data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [countryCode])

    const labels = debtData && Object.keys(debtData)

    const filteredTotalDebtData = totalDebtData ? labels.map(year => totalDebtData[year] || null) : []

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'General Government Gross Debt (% per GDP)',
                data: debtData && Object.values(debtData),
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1,
            },
            {
                label: 'Total Debt (% per GDP)',
                data: filteredTotalDebtData,
                fill: false,
                borderColor: 'rgba(255, 99, 132, 1)',
                tension: 0.1,
            },
        ],
    }

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
                    text: 'Debt in Percentage',
                },
                ticks: {
                    callback: function (value) {
                        return value + '%';
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
        return <p>Loading data...</p>
    }

    if (error) {
        return <p>{error}</p>
    }

    if (!debtData || Object.keys(debtData).length === 0) {
        return <p>No debt data available for this country.</p>
    }

    if (!totalDebtData || Object.keys(debtData).length === 0) {
        return <p>No debt data available for this country.</p>
    }

    return (
        <div>
            <h2>{countryCode} General Government Gross Debt</h2>
            <Line data={chartData} options={options} />
        </div>
    )
}

export default DebtChart

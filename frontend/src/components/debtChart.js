import React from 'react'
import { Line } from 'react-chartjs-2'
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

/**
 * DebtChart Component
 * Renders a line chart comparing General Government Gross Debt and Total Debt for a specific country.
 * @param {Object} props - Component properties
 * @param {string} props.countryCode - Country code to filter data
 * @param {Object} props.centralGovDebt - Data for total debt by year
 * @param {Object} props.publicDebt - Data for public debt by year
 * @returns {JSX.Element} - A React component rendering the debt chart or an appropriate message if data is unavailable.
 */
const DebtChart = ({ countryCode, centralGovDebt, publicDebt }) => {

  const totalDebtData = centralGovDebt[countryCode]
  const debtData = publicDebt[countryCode]

  if (!debtData && !totalDebtData) return <p> No debt data available for this country </p>

  var labels
  if (!debtData) labels = totalDebtData && Object.keys(totalDebtData)
  else labels = debtData && Object.keys(debtData)

  const filteredTotalDebtData = totalDebtData ? labels.map(year => totalDebtData[year] || null) : []

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'General Government Debt (% of GDP)',
        data: debtData && Object.values(debtData),
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
      {
        label: 'Central Government Debt (% of GDP)',
        data: filteredTotalDebtData,
        fill: false,
        borderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
            return value + '%'
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
    },
  }

  return (
    <div id="debtChart">
      <Line data={chartData} options={options} />
    </div>
  )
}

export default DebtChart

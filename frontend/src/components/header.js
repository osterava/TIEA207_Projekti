import React from 'react'
import Slider from './Slider'
import HeatmapButton from './HeatmapButton'

/**
 * The Header component contains the title, a year slider, and a button to toggle the heatmap display.
 * It manages the year and heatmap state through props passed down from the parent component.
 * @param {number} year The currently selected year, which controls the data shown in the heatmap.
 * @param {function} setYear A function to update the year state in the parent component.
 * @param {boolean} heatmap A boolean indicating whether the heatmap is currently displayed.
 * @param {function} setHeatmap A function to toggle the heatmap display in the parent component.
 */
const Header = ({ year, setYear, heatmap, setHeatmap }) => {

  return (
    <header className='header'>
      <h1>DebtMap</h1>
      <p className="header_description">
        Explore and visualize global economic data including Gross General Debt, Central Government Debt, Population
        and GDP. Data is sourced from the reliable <a href="https://www.imf.org/external/datamapper/api/" target="_blank" rel="noopener noreferrer">
        IMF Open Data API
        </a>.
      </p>
      <Slider
        year={year}
        setYear={setYear}
      />
      <HeatmapButton
        heatmap={heatmap}
        setHeatmap={setHeatmap}
      />
    </header>
  )
}

export default Header
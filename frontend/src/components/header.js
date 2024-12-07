import { React, useState } from 'react'
import Slider from './Slider'

/**
 * The Header component contains the title, a year slider, and a button to toggle the heatmap display.
 * It manages the year and heatmap state through props passed down from the parent component.
 * @param {number} year The currently selected year, which controls the data shown in the heatmap.
 * @param {function} setYear A function to update the year state in the parent component.
 * @param {boolean} heatmap A boolean indicating whether the heatmap is currently displayed.
 * @param {function} setHeatmap A function to toggle the heatmap display in the parent component.
 */
const Header = ({ year, setYear, heatmap, setHeatmap }) => {
  const [hover, setHover] = useState(false)

  return (
    <header className='header'>
      <div id="header-top-row">
        <h1 onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)}>DebtMap</h1>
        <p onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)} className={hover ? 'show-header-desc' : 'hide-header-desc'} >
          Explore and visualize global economic data including: general government debt (GG), central government debt (CG), population,
          and gross domestic product (GDP). Data is sourced from the reliable <a href="https://www.imf.org/external/datamapper/api/" target="_blank" rel="noopener noreferrer">
          IMF Open Data API
          </a>.
        </p>
      </div>
      <Slider
        year={year}
        setYear={setYear}
        heatmap={heatmap}
        setHeatmap={setHeatmap}
      />
    </header>
  )
}

export default Header
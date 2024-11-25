import React from 'react'
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

  /**
   * Toggles the heatmap display between true and false when the button is clicked.
   */
  const onHeatmapToggle = () => {
    setHeatmap(!heatmap)
  }

  return (
    <header className='header' style={{ position: 'relative' }}>
      <div>
        <h1>DebtMap - View Annual Debt Statistics</h1>
        <button onClick={onHeatmapToggle} style={{ margin: '10px', padding: '10px' }}>{heatmap ? 'Show CENTRAL government debt' : 'Show GENERAL government debt'}</button>
      </div>
      <Slider
        year={year}
        setYear={setYear}
      />
    </header>
  )
}

export default Header
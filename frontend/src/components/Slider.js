import HeatmapButton from './HeatmapButton'
/**
 * A slider component that allows users to select a year within a given range.
 * The selected year is passed to the parent component via the `setYear` function.
 * @param {number} year The currently selected year, displayed alongside the slider.
 * @param {function} setYear A function to update the year in the parent component's state.
 */
const Slider = ({ year, setYear, heatmap, setHeatmap }) => {

  /**
  * Handles the change event of the slider, updating the parent component with the selected year.
  * @param {object} event The change event triggered by the slider input.
  */
  const handleChange = (event) => {
    setYear(parseInt(event.target.value))
  }

  const min = 1990
  const max = 2029

  const incrementYear = () => {
    if (year < max) setYear(year + 1)
  }

  const decrementYear = () => {
    if (year > min) setYear(year - 1)
  }


  return (
    <div id="sliderWrapper">
      <div id="sliderInnerWrapper">
        <span>{min}</span>
        <input
          id="slider"
          type="range"
          min={min}
          max={max}
          aria-label={'Year slider from 1990 to 2025'}
          value={year}
          onChange={handleChange}
        />
        <span>{max}</span>
      </div>
      <div id="buttonWrapper">
        <p className={heatmap ? 'current_debt heatmapOn' : 'current_debt heatmapOff'}>{heatmap ? 'General government debt' : 'Central government debt'}</p>
        <div id="yearButtons">
          <button onClick={decrementYear}>-</button>
          <span style={{ margin: '0 1vw' }}>{year}</span>
          <button onClick={incrementYear}>+</button>
        </div>
        <HeatmapButton
          heatmap={heatmap}
          setHeatmap={setHeatmap}
        />
      </div>
    </div>
  )
}

export default Slider
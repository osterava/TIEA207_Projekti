/**
 * A slider component that allows users to select a year within a given range.
 * The selected year is passed to the parent component via the `setYear` function.
 * @param {number} year The currently selected year, displayed alongside the slider.
 * @param {function} setYear A function to update the year in the parent component's state.
 */
const Slider = ({ year, setYear }) => {

  /**
  * Handles the change event of the slider, updating the parent component with the selected year.
  * @param {object} event The change event triggered by the slider input.
  */
  const handleChange = (event) => {
    setYear(parseInt(event.target.value))
  }

  return (
    <div style={{ display: 'flex' }}>
      <input
        id="slider"
        type="range"
        min="1990"
        max="2025"
        aria-label={'Year slider from 1990 to 2025'}
        value={year}
        onChange={handleChange}
      />
      <span>{year}</span>
    </div>
  )
}

export default Slider
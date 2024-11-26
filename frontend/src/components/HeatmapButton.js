const HeatmapButton = ({ heatmap, setHeatmap }) => {

  /**
   * Toggles the heatmap display between true and false when the button is clicked.
   */
  const onHeatmapToggle = () => {
    setHeatmap(!heatmap)
  }

  return (
    <>
      <button className={heatmap ? 'toggleon' : 'toggleoff'} onClick={onHeatmapToggle}>Toggle Heatmap</button>
    </>
  )
}

export default HeatmapButton
const HeatmapButton = ({ heatmap, setHeatmap }) => {

  /**
   * Toggles the heatmap display between true and false when the button is clicked.
   */
  const onHeatmapToggle = () => {
    setHeatmap(!heatmap)
  }

  return (
    <>
      <button onClick={onHeatmapToggle}>{heatmap ? 'Show CG debt' : 'Show GG debt'}</button>
    </>
  )
}

export default HeatmapButton
import React, { useState } from 'react'
import MapComponent from './components/MapComponent.js'
import Footer from './components/footer.js'
import Header from './components/header.js'
import './App.css'
import Search from './components/search.js'

/**
 * The main App component that serves as the entry point of the application.
 * This component manages the state for the selected year and the heatmap visibility,
 * passing these as props to child components like Header and MapComponent.
 * It also includes the Footer component at the bottom of the page.
 * @returns {JSX.Element} The rendered application UI.
 */
const App = () => {
  const [year, setYear] = useState(2024)
  const [heatmap, setHeatmap] = useState(true) // True = GG debt, False = CG debt

  return (
    <div className='app'>
      <Header
        year={year}
        setYear={setYear}
        heatmap={heatmap}
        setHeatmap={setHeatmap}
      />{/*
        <Search
          year={year}
      />*/}
      <MapComponent
        year={year}
        heatmap={heatmap}
      />
      <Footer />
    </div>
  )
}

export default App

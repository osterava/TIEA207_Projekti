import React, { useState } from 'react'
import MapComponent from './components/MapComponent.js'
import Footer from './components/footer.js'
import Header from './components/header.js'
import './App.css'
import Search from './components/search.js'

const App = () => {
  const [year, setYear] = useState(2024)
  const [heatmap, setHeatmap] = useState(false)

  return (
    <div className='app'>
      <Header
        year={year}
        setYear={setYear}
        heatmap={heatmap}
        setHeatmap={setHeatmap}
      />
      <Search/>
      <MapComponent 
        year={year}
        heatmap={heatmap}
      />
      <Footer />
    </div>
  )
}

export default App

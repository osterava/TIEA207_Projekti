import React, { useState } from 'react'
import MapComponent from './components/MapComponent.js'
import Footer from './components/footer.js'
import Header from './components/header.js'
import './App.css'

const App = () => {
  const [year, setYear] = useState(new Date().getFullYear());

  return (
    <div className='app'>
      <Header 
        onYearChange={(year) => {setYear(year)}}
      />
      <MapComponent 
        year={year}
      />
      <Footer />
    </div>
  )
}

export default App;

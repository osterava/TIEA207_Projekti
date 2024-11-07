import React from 'react'
import MapComponent from './components/MapComponent.js'
import Footer from './components/footer.js'
import './App.css'

const App = () => {
  return (
    <div className='app'>
      <div class='header'><h1>| Velkakartta</h1></div>
      <MapComponent />
      <Footer />
    </div>
  )
}

export default App;

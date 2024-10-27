import React from 'react'
import MapComponent from './components/MapComponent'
import DataComponent from './components/dataComponent'
// import './App.css';

const appStyle = {
  backgroundColor: 'Beige', 
}

const App = () => {
  return (
    <div style={appStyle}>
      <h1 style = {{textAlign:'center',fontFamily:'Georgia'}}>Velkakartta</h1>
      <MapComponent />
      <DataComponent />
    </div>
  )
}

export default App;

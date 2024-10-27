import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import mapService from '../services/mapService.js'

const MapComponent = () => {
  const [mapData, setMapData] = useState(null)
  const mapRef = useRef(null)

  useEffect(() => {
    mapService.getMapData().then(data => {
      setMapData(data)
      
      if (mapRef.current === null) {
        const mapElement = document.getElementById('map')
        if (mapElement) {
          const map = L.map(mapElement).setView([20, 0], 2)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
          }).addTo(map)
          mapRef.current = map
        }
      }
    })

    return () => {
      if (mapRef.current !== null) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div>
      <div id="map" style={{ height: '600px' }}></div>
      {mapData && <p>{mapData.message}</p>}
    </div>
  )
}

export default MapComponent;

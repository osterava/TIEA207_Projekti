import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const MapComponent = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current === null) {
      const map = L.map('map').setView([20, 0], 2)
      L.tileLayer('https://{s}.tile.openstreetmap.org/%7Bz%7D/%7Bx%7D/%7By%7D.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      mapRef.current = map
    }

    return () => {
      if (mapRef.current !== null) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

 return <div id="map" style={{ height: '600px' }}></div>
}

export default MapComponent
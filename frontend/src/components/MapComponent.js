import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import mapService from '../services/mapService.js'
import countries from '../data/countries.json'

var geojson;

/**
 * Highlight-funktio. Tyyli placeholder
 * @param {*} e 
 */
function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
      weight: 5,
      // color: 'black',
      fillColor: 'red',
      // dashArray: '',
      fillOpacity: 1
  });

  layer.bringToFront();
}

/**
 * Resetoidaan highlight
 * @param {*} e 
 */
function resetHighlight(e) {
  geojson.resetStyle(e.target);
}

/**
 * Laitetaan highlightit mouseoverilla placeholderina. Voidaan vaihtaa esim click
 * @param {*} layer 
 */
function onEachFeature(feature, layer) {
  layer.on({
      // mouseover: highlightFeature,
      // mouseout: resetHighlight
      click: highlightFeature,
      mouseout: resetHighlight
  });
}

/**
 * Haetaan GeoJSON-layerin tyyli
 * @returns Tyylit-objekti
 */
function style() {
  return {
      fillColor: 'grey',
      weight: 2,
      opacity: 1,
      color: 'white',
      // dashArray: '3',
      fillOpacity: 0.7
  };
}


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
          // Lisätään GeoJSON-layeri
          L.geoJSON(countries).addTo(map);

          geojson = L.geoJson(countries, {
            style: style,
            onEachFeature: onEachFeature
          }).addTo(map);
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

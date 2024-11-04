import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import mapService from '../services/mapService.js'
import populationService from '../services/popService.js'
import gdpService from '../services/gdpService.js'
import countries from '../data/countries.json'
import DebtChart from './debtChart.js'

const currentYear = new Date().getFullYear()
var geojson;

/**
 * Highlight function to style the selected country
 * @param {*} e 
 */
function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    fillColor: 'red',
    fillOpacity: 1,
  });

  layer.bringToFront();
}

/**
 * Reset highlight style
 * @param {*} e 
 */
function resetHighlight(e) {
  geojson.resetStyle(e.target);
}

/**
 * Assign event handlers to each feature (country)
 * @param {*} feature 
 * @param {*} layer 
 */
function onEachFeature(feature, layer, setSelectedCountry, setInfoVisible, setPopulationData, setSelectedCountryCode, setCountryGBDYear) {

  layer.on({
    click: () => {
      setSelectedCountry(feature.properties)
      setInfoVisible(true)

      const countryCode = feature.properties.gu_a3
      setSelectedCountryCode(countryCode)
      
      if (countryCode) {
        populationService.getDataByYear(2024, countryCode)
        .then(data => {
          
          const regionKey = 'LP'
          
          const countryPopulation = data[regionKey] ? data[regionKey][countryCode] : undefined;
          
          if (countryPopulation !== undefined) {
            setPopulationData(countryPopulation)
          } else {
            setPopulationData('No data available for this country')
          }
        })
        .catch(error => {
          console.error('Error fetching population data:', error)
          setPopulationData('Error fetching data')
        })
      
        gdpService.getGDPByYear(currentYear-1, countryCode)
        .then(data => {
          const regionKey='NGDPD'
          console.log('Fetched GDP data:', data);
            const gdpValue = data[regionKey] ? data[regionKey][countryCode] : undefined;
            setCountryGBDYear(gdpValue || 'No data available');
        })
        .catch(error => {
            console.error('Error fetching GDP data:', error);
            setCountryGBDYear('Error fetching data');
        })

      } else {
        console.error('Country code is undefined. Cannot fetch population data.')
      }
    },
    mouseover: highlightFeature,
    mouseout: resetHighlight,
  });
}


/**
 * Get style for the GeoJSON layer
 * @returns Style object
 */
function style() {
  return {
    fillColor: 'grey',
    weight: 2,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7,
  };
}

const MapComponent = () => {
  const [populationData, setPopulationData] = useState(null)
  const [mapData, setMapData] = useState(null)
  const [infoVisible, setInfoVisible] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedCountryCode, setSelectedCountryCode] = useState(null)
  const [selectedCountryGBDYear,setCountryGBDYear] = useState(null)

  const mapRef = useRef(null)

  useEffect(() => {
    mapService.getMapData().then(data => {
      setMapData(data);

      if (mapRef.current === null) {
        const mapElement = document.getElementById('map');
        if (mapElement) {
          const map = L.map(mapElement).setView([30, 5], 2);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
          }).addTo(map)

          map.setMinZoom(2)
          map.setMaxZoom(7)

          mapRef.current = map;

          // Add GeoJSON layer with event handling
          geojson = L.geoJson(countries, {
            style: style,
            onEachFeature: (feature, layer) => 
             onEachFeature(feature, layer, setSelectedCountry, setInfoVisible, setPopulationData,
            setSelectedCountryCode,setCountryGBDYear)
          }).addTo(map)
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

  const closeInfoBox = () => {
    setInfoVisible(false)
    setSelectedCountry(null)
    setPopulationData(null);
  }

  return (
    <div style={{ display: 'flex',width:'100%' }}>
      <div
        id="map"
        style={{
          height: '700px',
          width: infoVisible ? '70%' : '100%', // Increase left margin when info box is visible
          marginLeft: infoVisible ? '25%' : '5%',
          marginRight: '5%',
          transition: 'margin-left 0.3s ease', // Smooth transition for the left margin
        }}
      ></div>

      {infoVisible && (
        <div
          style={{
            width: '22%',
            height: '660px',
            background: 'white',
            position: 'absolute',
            top: 0,
            left: '0',
            boxShadow: '2px 0 5px rgba(0,0,0,0.5)',
            zIndex: 1000,
            padding: '20px',
            overflowY: 'auto',
            marginTop: '80px',
            marginLeft: '5px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={closeInfoBox}>Close</button>
          </div>
            <h2>{selectedCountry ? selectedCountry.name : ''}</h2>
            <p>Country id: {selectedCountryCode} </p>
            <p>Population ({currentYear}): {populationData} million people</p>
            <p>GDP ({currentYear-1}): {selectedCountryGBDYear} billion USD</p>
            <DebtChart countryCode={selectedCountryCode} />
            <p>shows the development of gross debt in relation to GDP</p>
          </div>
      )}

      {mapData && <p>{mapData.message}</p>}
    </div>
  )
}

export default MapComponent

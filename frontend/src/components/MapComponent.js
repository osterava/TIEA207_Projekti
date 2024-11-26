/**
 * React and hooks import for managing component state and lifecycle.
 */

import React, { useEffect, useRef, useState } from 'react'

/**
 * Leaflet library for interactive maps and required CSS for styling.
*/
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import mapService from '../services/mapService.js'
import populationService from '../services/popService.js'
import gdpService from '../services/gdpService.js'
import countries from '../data/countries.json'

/**
 * Custom InfoBox component to display detailed information about selected countries.
 */

import InfoBox from './infoBox.js'
import { getData } from '../services/debtService.js'
import { debounce } from 'lodash'


/**
 * Debugattavaa / TODO:
 * vuoden vaihtaminen päivittää kartan, mutta ei päivitä maan tietoja
 * vuoden vaihtaminen esim. 2019 -> 2011, ohjelma jää vuodelle 2015
 * -> ei renderöi VIIMEISINTÄ vuotta, vaan jonkin vuoden, jonka aloitti renderöimään aiemmin
 * | Täytyy selvittää syy, miksi vuoden päivittyminen sekoittaa layerit (useEffect kesken?)
 * Maan nopea valitseminen edellisen valinnan jälkeen sekoittaa maiden tiedot
 * -> Konsolista näkee "Fetched GDP data väärältä maalta viimeiseksi valitun maan sijaan"
 * | Täytyy ehkä ladata debtDatan mukaisesti ladata kaikki data MapComponenttin, jotta pyynnöt eivät sekoitu
 * TL;DR: API data pitää ehkä ladata suoraan MapComponenttiin,
 */

/**
 * GeoJson initial layer generation
 */
var defaultGeoJsonLayer = null
var heatmapGeoJsonLayer = null

/**
 * Apply heatmap style based on the country's debt.
 * @param {*} feature GeoJSON feature representing a country.
 * @param {number} year The selected year to display debt data.
 */
const applyHeatmapStyle = (feature, year) => {
  let fillColor = 'black'

  if (feature && feature.properties && feature.properties.debt && feature.properties.debt[year] !== undefined) {
    const debt = feature.properties.debt[year]

    if (debt > 100) {
      fillColor = '#ff0d0d'
    } else if (debt > 85) {
      fillColor = '#ff4e11'
    } else if (debt > 70) {
      fillColor = '#ff8e15'
    } else if (debt > 55) {
      fillColor = '#fab733'
    } else if (debt > 40) {
      fillColor = '#acb334'
    } else if (debt > 25) {
      fillColor = '#69b34c'
    } else if (debt > 10) {
      fillColor = '#3baf4a'
    } else if (debt > 0) {
      fillColor = 'green'
    } else {
      fillColor = 'black'
    }
  }

  return {
    weight: 2,
    fillColor: fillColor,
    fillOpacity: 1,
    color: 'white',
    opacity: 1,
  }
}

/**
 * Highlight function to style the selected country
 * @param {*} e
 */
function highlightFeature(e) {
  var layer = e.target

  layer.setStyle({
    weight: 5,
    // fillcolor: 'red'
    fillColor: '#BF4342',
    fillOpacity: 1,
  })

  layer.bringToFront()
}

/**
 * Reset highlight style
 * @param {*} e
 */
function resetHighlight(e) {
  defaultGeoJsonLayer.resetStyle(e.target)
}

/**
 * Handle feature (country) click event for heatmap layer.
 * Sets the selected country, fetches population and GDP data, and adjusts the map view.
 * @param {*} feature GeoJSON feature representing a country.
 * @param {*} layer Leaflet layer for the country.
 * @param {*} setSelectedCountry State updater for selected country.
 * @param {*} setInfoVisible State updater for info box visibility.
 * @param {*} setSelectedCountryCode State updater for selected country code.
 * @param {*} setCountryGBDYear State updater for selected country GDP data.
 * @param {*} publicDebtData Data related to country debt.
 * @param {number} year The selected year to fetch data for.
 * @param {*} mapRef Reference to the map object.
 */
function heatmapFeature(feature, layer, setSelectedCountry, setInfoVisible, setSelectedCountryCode, publicDebtData, year, mapRef) {
  if (!publicDebtData || !feature || !feature.properties) {
    console.error('Missing debt data or feature properties')
    return
  }

  const debt = debtData[feature.properties.gu_a3]
  if (debt) {
    feature.properties.debt = debt
  } else {
    // Liikaa erroreita konsoliin: console.error('Debt data not available for country', feature.properties.gu_a3)
  }

  layer.on({
    click: () => {
      setSelectedCountry(null)
      setSelectedCountryCode(null)

      setSelectedCountry(feature.properties)
      setInfoVisible(true)

      const countryCode = feature.properties.gu_a3
      setSelectedCountryCode(countryCode)

      if (mapRef.current && feature.geometry) {
        const bounds = L.geoJSON(feature.geometry).getBounds()
        mapRef.current.fitBounds(bounds, {
          padding: [5, 5],
        })
      }

      // Use the common fetch function
      fetchCountryData(countryCode, year, setPopulationData, setCountryGBDYear)
    }
  })
}


/**
 * Assign event handlers to each feature (country) in the map.
 * @param {*} feature GeoJSON feature representing a country.
 * @param {*} layer Leaflet layer for the country.
 * @param {*} setSelectedCountry State updater for selected country.
 * @param {*} setInfoVisible State updater for info box visibility.
 * @param {*} setSelectedCountryCode State updater for selected country code.
 * @param {*} setCountryGBDYear State updater for selected country GDP data.
 * @param {number} year The selected year.
 * @param {*} mapRef Reference to the map object.
 */
function onEachFeature(feature, layer, setSelectedCountry, setInfoVisible, setSelectedCountryCode, year, mapRef) {
  const { gu_a3: countryCode, name: countryName } = feature.properties

  if (countryName) {
    layer.bindTooltip(countryName, { permanent: false, direction: 'auto', className: 'labelstyle', sticky: true })
  }

  layer.on({
    click: () => {
      resetData()
      setSelectedCountry(feature.properties)
      setInfoVisible(true)
      setSelectedCountryCode(countryCode)

      if (mapRef.current && feature.geometry) {
        const bounds = L.geoJSON(feature.geometry).getBounds()
        mapRef.current.fitBounds(bounds, {
          padding: [5, 5],
        })
      }

      // Use the common fetch function
      fetchCountryData(countryCode, year, setPopulationData, setCountryGBDYear)
    },
    mouseover: highlightFeature,
    mouseout: resetHighlight,
  })

  function resetData() {
    setSelectedCountry(null)
    setPopulationData(null)
    setSelectedCountryCode(null)
    setCountryGBDYear(null)
  }
}



/**
 * Get style for the GeoJSON layer
 * @returns Style object
 */
function defaultStyle() {
  return {
    //fillcolor: 'grey'
    fillColor: '#818D92',
    weight: 2,
    opacity: 1,
    // color: white
    color: '#222222',
    fillOpacity: 1,
  }
}

/* ------------------------------------------------------------------------------------------------------------------------------------------ */

/**
 * React component for the map.
 * Manages the visualization of countries, data fetching, and user interaction.
 * @param {Object} props - Component properties.
 * @param {number} props.year - The selected year for data visualization.
 * @param {boolean} props.heatmap - Flag to toggle heatmap visualization.
 */
const MapComponent = ({ year, heatmap }) => {
  const [publicDebtData, setPublicDebtData] = useState(null)
  const [populationData, setPopulationData] = useState(null)
  const [gdpData, setGDPData] = useState(null)
  const [centralGovernmentDebtData, setCentralGovernmentDebtData] = useState(null)
  //const [mapData, setMapData] = useState(null)
  const [infoVisible,   setInfoVisible] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedCountryCode, setSelectedCountryCode] = useState(null)
  const [loading, setLoading] = useState(true)

  const mapRef = useRef(null)

  // TODO: debtDatan mukaisesti populointi ja gdp datan haku ja asettaminen
  useEffect(() => {
    if (!loading) return
    const fetchData = async () => {
      try {
        const result = await getData()
        var data = result.values.GGXWDG_NGDP
        setDebtData(data)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }

    fetchData()
  }, [loading])

  useEffect(() => {
    if (loading) return

      if (mapRef.current === null) {
        const mapElement = document.getElementById('map')
        const southWest = L.latLng(-89.98155760646617, -200)
        const northEast = L.latLng(89.99346179538875, 200)
        const bounds = L.latLngBounds(southWest, northEast)

      if (mapElement) {
        const map = L.map(mapElement).setView([30, 5], 2)

        // Jostain syystä hajoittaa koodin: 'el is not defined' tms.
        //map.setMinZoom(3)
        //map.setMaxZoom(7)

        mapRef.current = map

          // Add GeoJSON layer with heatmap style
          // TODO: Selvitä miksi heatmap ei toimi
          heatmapGeoJsonLayer = L.geoJson(countries, {
            style: (feature) => applyHeatmapStyle(feature, year),
            onEachFeature: (feature, layer) => heatmapFeature(feature, layer, setSelectedCountry, setInfoVisible, setPopulationData,
              setSelectedCountryCode,setCountryGBDYear, debtData, year, mapRef)
          }).addTo(map)

          // Add GeoJSON layer with event handling
          defaultGeoJsonLayer = L.geoJson(countries, {
            style: defaultStyle,
            onEachFeature: (feature, layer) =>
              onEachFeature(feature, layer, setSelectedCountry, setInfoVisible, setPopulationData,
                setSelectedCountryCode,setCountryGBDYear, year, mapRef)
          }).addTo(map)
        }

        debounceHeatmap()
      }
    }

    if (heatmap) {
      heatmapGeoJsonLayer.bringToFront()
    } else {
      defaultGeoJsonLayer.bringToFront()
    }

    return () => {
      if (mapRef.current !== null) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }

  }, [loading,debtData, year, heatmap])

  const resetMapView = () => {
    if (mapRef.current) {
      const southWest = L.latLng(-89.98155760646617, -200)
      const northEast = L.latLng(89.99346179538875, 200)
      const bounds = L.latLngBounds([southWest, northEast])
      mapRef.current.fitBounds(bounds)
    }
  }

  const closeInfoBox = () => {
    setInfoVisible(false)
    setSelectedCountry(null)
    setSelectedCountryCode(null)
    setCountryGBDYear(null)
    resetMapView()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  /**
   * Bugia: harmaita kohtia jää karttaan infoboxin sulkemisen jälkeen, saattaa olla vain livetestatessa css muuttaessa
   */
  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <div
        id="map"
        style={{
          height: '60vh',
          width: infoVisible ? '60%' : '100%',
          marginLeft: infoVisible ? '36%' : '5%',
          marginRight: infoVisible ? '5%' : '5%',
          transition: 'width 0.3s ease, margin-left 0.3s ease, margin-right 0.3s ease',
        }}
      ></div>

      {infoVisible && (
        <InfoBox
          selectedCountry={selectedCountry}
          populationData={populationData[selectedCountryCode] !== undefined ? populationData[selectedCountryCode][year] : null}
          selectedCountryGBDYear={gdpData[selectedCountryCode] !== undefined ? gdpData[selectedCountryCode][year] : null}
          selectedCountryCode={selectedCountryCode}
          cgDebt={centralGovernmentDebtData[selectedCountryCode] !== undefined ? centralGovernmentDebtData[selectedCountryCode][year] : null}
          publicDebt={publicDebtData}
          centralGovDebt={centralGovernmentDebtData}
          closeInfoBox={closeInfoBox}
          year={year}
        />
      )}

      {mapData && <p>{mapData.message}</p>}
    </div>
  )
}

export default MapComponent

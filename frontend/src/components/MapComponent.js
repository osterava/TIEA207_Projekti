/**
 * React and hooks import for managing component state and lifecycle.
 */

import React, { useEffect, useRef, useState } from 'react'

/**
 * Leaflet library for interactive maps and required CSS for styling.
*/
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * JSON file containing geographical data for countries.
 */
import countries from '../data/countries.json'

/**
 * Custom InfoBox component to display detailed information about selected countries.
 */

import InfoBox from './infoBox.js'

import Search from './search.js'

/**
 * Services to fetch data:
 * - Public debt data
 * - GDP data
 * - Population data
 * - Central government debt data
 * - GeoJSON map data
 */
import { getData as getPublicDebtData } from '../services/publicDebtService.js'
import { getData as getGDPData } from '../services/gdpService.js'
import { getData as getPopulationData } from '../services/popService.js'
import { getData as getCGDebtData } from '../services/cgDebtService.js'
import { getGGDebtData } from '../services/publicDebtService.js'


/**
 * Debugattavaa / TODO:
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
var cgDebtHeatmapLayer = null
var ggDebtHeatmapLayer = null

/**
 * Apply heatmap style based on the country's debt.
 * @param {*} feature GeoJSON feature representing a country.
 * @param {number} year The selected year to display debt data.
 */
const applyHeatmapStyle = (feature, year, isGGDebt) => {
  let fillColor = 'black'

  let debt = 0
  if (isGGDebt && feature && feature.properties && feature.properties.debtGG && feature.properties.debtGG[year] !== undefined) {
    debt = feature.properties.debtGG[year]
  } else if (!isGGDebt && feature && feature.properties && feature.properties.debtCG && feature.properties.debtCG[year] !== undefined) {
    debt = feature.properties.debtCG[year]
  }
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
function highlightFeatureHeatmap(e) {
  var layer = e.target

  layer.setStyle({
    weight: 5,
    fillColor: '#fff',
    fillOpacity: 0.3,
  })

  layer.bringToFront()
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
function heatmapFeature(feature, layer, setSelectedCountry, setInfoVisible, setSelectedCountryCode, debtData, mapRef, resetHighlight, ggDebtData) {
  if (!debtData || !feature || !feature.properties ) {
    console.error('Missing debt data or feature properties')
    return
  }

  var debt = debtData[feature.properties.gu_a3]

  if (ggDebtData) {
    if (debt) {
      feature.properties.debtGG = debt
    } else {
      // Liikaa erroreita konsoliin: console.error('Debt data not available for country', feature.properties.gu_a3)
    }
  } else {
    if (debt) {
      feature.properties.debtCG = debt
    } else {
      // Liikaa erroreita konsoliin: console.error('Debt data not available for country', feature.properties.gu_a3)
    }
  }


  layer.on({
    click: () => {
      setSelectedCountry(null)
      setSelectedCountryCode(null)

      setSelectedCountry(feature.properties)
      setInfoVisible(true)

      const countryCode = feature.properties.gu_a3
      setSelectedCountryCode(countryCode)

      highlightFeatureHeatmap({ target: layer })
    },
    mouseover: highlightFeatureHeatmap,
    mouseout: resetHighlight,
  })
}

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
  const [infoVisible,   setInfoVisible] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedCountryCode, setSelectedCountryCode] = useState(null)
  const [loading, setLoading] = useState(true)

  const mapRef = useRef(null)

  /**
   * Fetch all data that is needed to run the application
   */
  useEffect(() => {
    // If data is already loaded, skip fetching
    if (!loading) return
    const fetchData = async () => {
      try {

        const ggDebtData1 = await getPublicDebtData()
        var data = ggDebtData1.values.GGXWDG_NGDP
        console.log(data)

        const ggDebtData2 = await getGGDebtData()
        for (var countryCode in data) {
          for (var year in ggDebtData2.values[countryCode]) {
            if (data[countryCode][year] === undefined) {
              data[countryCode][year] = ggDebtData2.values[countryCode][year]
            }
          }
        }
        setPublicDebtData(data)
        console.log('Debt data:', data)

        const popData = await getPopulationData()
        data = popData.values.LP
        setPopulationData(data)
        console.log('Population data:', data)

        const gdp_Data = await getGDPData()
        data = gdp_Data.values.NGDPD
        setGDPData(data)
        console.log('GDP data:', data)

        const cgDebtData = await getCGDebtData()
        data = cgDebtData.values.CG_DEBT_GDP
        setCentralGovernmentDebtData(data)
        console.log('Central government debt data:', data)

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

    /**
     * Reset highlight style
     * @param {*} e
     */
    function resetHighlight(e) {
      if (!heatmap) cgDebtHeatmapLayer.resetStyle(e.target)
      else ggDebtHeatmapLayer.resetStyle(e.target)
    }

    if (mapRef.current === null) {
      const mapElement = document.getElementById('map')

      if (mapElement) {
        const map = L.map(mapElement).setView([40, 5], 2)

        // Jostain syystä hajoittaa koodin: 'el is undefined'
        //map.setMinZoom(3)
        //map.setMaxZoom(7)

        mapRef.current = map

        // Add GeoJSON layer with heatmap style

        ggDebtHeatmapLayer = L.geoJson(countries, {
          style: (feature) => applyHeatmapStyle(feature, year, true),
          onEachFeature: (feature, layer) => heatmapFeature(feature, layer, setSelectedCountry, setInfoVisible,
            setSelectedCountryCode, publicDebtData, mapRef, resetHighlight, true)
        }).addTo(map)

        // Add GeoJSON layer with event handling
        cgDebtHeatmapLayer = L.geoJson(countries, {
          style: (feature) => applyHeatmapStyle(feature, year, false),
          onEachFeature: (feature, layer) => heatmapFeature(feature, layer, setSelectedCountry, setInfoVisible,
            setSelectedCountryCode, centralGovernmentDebtData, mapRef, resetHighlight, false)
        }).addTo(map)
      }
    }

    if (heatmap) {
      ggDebtHeatmapLayer.bringToFront()
    } else {
      cgDebtHeatmapLayer.bringToFront()
    }

    return () => {
      if (mapRef.current !== null) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [loading,publicDebtData, year, heatmap, populationData, gdpData, centralGovernmentDebtData])

  const closeInfoBox = () => {
    setInfoVisible(false)
    setSelectedCountry(null)
    setSelectedCountryCode(null)
  }

  const handleCountrySelect = (country, countryCode) => {
    setSelectedCountry(country)
    setSelectedCountryCode(countryCode)
    setInfoVisible(true)
  }

  const handleMouseEnter = () => {
    mapRef.current.scrollWheelZoom.disable()
  }

  const handleMouseLeave = () => {
    mapRef.current.scrollWheelZoom.enable()
  }


  if (loading) {
    return <div style={{ justifyContent: 'center', display: 'flex', margin: '3vh' }}><strong>Loading map...</strong></div>
  }

  /**
   * Bugia: harmaita kohtia jää karttaan infoboxin sulkemisen jälkeen, saattaa olla vain livetestatessa css muuttaessa
   * <div style={{ display: 'flex', width: '100%' }}></div>
   */

  return (
    <div id='mapContainer'>
      <div id="map">
        <Search onCountrySelect={handleCountrySelect} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} />
      </div>
      <InfoBox
        selectedCountry={selectedCountry}
        populationData={populationData[selectedCountryCode] !== undefined ? populationData[selectedCountryCode][year] : null}
        selectedCountryGBDYear={gdpData[selectedCountryCode] !== undefined ? gdpData[selectedCountryCode][year] : null}
        selectedCountryCode={selectedCountryCode}
        cgDebt={centralGovernmentDebtData[selectedCountryCode] !== undefined ? centralGovernmentDebtData[selectedCountryCode][year] : null}
        ggDebt={publicDebtData[selectedCountryCode] !== undefined ? publicDebtData[selectedCountryCode][year] : null}
        publicDebt={publicDebtData}
        centralGovDebt={centralGovernmentDebtData}
        closeInfoBox={closeInfoBox}
        year={year}
        infoVisible={infoVisible}
      />
    </div>
  )
}

export default MapComponent
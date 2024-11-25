import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import countries from '../data/countries.json'
import InfoBox from './infoBox.js'
import { getData as getPublicDebtData } from '../services/publicDebtService.js'
import { getData as getGDPData } from '../services/gdpService.js'
import { getData as getPopulationData } from '../services/popService.js'
import { getData as getCGDebtData } from '../services/cgDebtService.js'
import { getMapData } from '../services/mapService.js'
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
    for (var year in ggDebtData[feature.properties.gu_a3]) {
      if (debt[year] === undefined) {
        debt[year] = ggDebtData[feature.properties.gu_a3][year]
      }
    }
  }

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

      if (mapRef.current && feature.geometry) {
        const bounds = L.geoJSON(feature.geometry).getBounds()
        let center = bounds.getCenter()
        center = L.latLng(center.lat, center.lng + 50)
        mapRef.current.setView(center, 4)
      }
    },
    mouseover: highlightFeatureHeatmap,
    mouseout: resetHighlight,
  })
}

/**
 * Main component for displaying the map and managing country data.
 * @param {year,heatmap} props The props passed to the component.
 */
const MapComponent = ({ year, heatmap }) => {
  const [publicDebtData, setPublicDebtData] = useState(null)
  const [ggDebtData, setGGDebtData] = useState(null)
  const [populationData, setPopulationData] = useState(null)
  const [gdpData, setGDPData] = useState(null)
  const [centralGovernmentDebtData, setCentralGovernmentDebtData] = useState(null)
  //const [mapData, setMapData] = useState(null) // Ilmeisesti jsonplaceholderin dataa palvelimen puolella....
  const [infoVisible,   setInfoVisible] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedCountryCode, setSelectedCountryCode] = useState(null)
  const [loading, setLoading] = useState(true)

  const mapRef = useRef(null)

  useEffect(() => {
    if (!loading) return
    const fetchData = async () => {
      try {
        // Getting public debt data
        const pdData = await getPublicDebtData()
        var data = pdData.values.GGXWDG_NGDP
        setPublicDebtData(data)
        console.log('Debt data:', data)

        // Getting population data
        const popData = await getPopulationData()
        data = popData.values.LP
        setPopulationData(data)
        console.log('Population data:', data)

        // Getting GDP data
        const gdp_Data = await getGDPData()
        data = gdp_Data.values.NGDPD
        setGDPData(data)
        console.log('GDP data:', data)

        // Getting central government debt data
        const cgDebtData = await getCGDebtData()
        data = cgDebtData.values.CG_DEBT_GDP
        setCentralGovernmentDebtData(data)
        console.log('Central government debt data:', data)

        const rawMapData = await getMapData()
        //setMapData(rawMapData)
        console.log('Map data:', rawMapData)

        const ggDebtData = await getGGDebtData()
        data = ggDebtData.values.GG_DEBT_GDP
        setGGDebtData(data)
        console.log('General government debt data (2):', data)

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
      const southWest = L.latLng(-89.98155760646617, -200)
      const northEast = L.latLng(89.99346179538875, 200)
      const bounds = L.latLngBounds(southWest, northEast)

      if (mapElement) {
        const map = L.map(mapElement).setView([30, 5], 2)

        // Jostain syystä hajoittaa koodin: 'el is undefined'
        //map.setMinZoom(3)
        //map.setMaxZoom(7)

        mapRef.current = map

        // Add GeoJSON layer with heatmap style

        ggDebtHeatmapLayer = L.geoJson(countries, {
          style: (feature) => applyHeatmapStyle(feature, year, true),
          onEachFeature: (feature, layer) => heatmapFeature(feature, layer, setSelectedCountry, setInfoVisible,
            setSelectedCountryCode, publicDebtData, mapRef, resetHighlight, ggDebtData)
        }).addTo(map)

        // Add GeoJSON layer with event handling
        cgDebtHeatmapLayer = L.geoJson(countries, {
          style: (feature) => applyHeatmapStyle(feature, year, false),
          onEachFeature: (feature, layer) => heatmapFeature(feature, layer, setSelectedCountry, setInfoVisible,
            setSelectedCountryCode, centralGovernmentDebtData, mapRef, resetHighlight, null)
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
  }, [loading,publicDebtData, year, heatmap, populationData, gdpData, centralGovernmentDebtData, ggDebtData])

  const closeInfoBox = () => {
    setInfoVisible(false)
    setSelectedCountry(null)
    setSelectedCountryCode(null)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  /**
   * Bugia: harmaita kohtia jää karttaan infoboxin sulkemisen jälkeen, saattaa olla vain livetestatessa css muuttaessa
   */
  return (
    <div id='mapContainer'>
      <div id="map"></div>

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
        infoVisible={infoVisible}
      />

      {/*mapData && <p>{mapData.message}</p>*/}
    </div>
  )
}

export default MapComponent

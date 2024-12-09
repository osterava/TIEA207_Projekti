/**
 * React and hooks import for managing component state and lifecycle.
 */

import React, { useEffect, useRef, useState } from 'react'

/**
 * Leaflet library for interactive maps and required CSS for styling.
*/
import L, { map } from 'leaflet'
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
let selectedLayer = null

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
 * Get color codes depending on the d value
 * @param {*} d
 * @returns color code as string
 */
function getColor(d) {
  return d > 100 ? '#ff0d0d' :
    d > 85  ? '#ff4e11' :
      d > 70  ? '#ff8e15' :
        d > 55  ? '#fab733' :
          d > 40   ? '#acb334' :
            d > 25   ? '#69b34c' :
              d > 10   ? '#3baf4a' :
                d > 0    ? 'green':
                  'black'
}

function highlightSelectedFeature(e) {
  var layer = e.target
  layer.setStyle({
    weight: 3,
    fillColor: '#fff',
    color: 'black',
    fillOpacity: 0.3,
  })

  layer.bringToFront()
}

/**
 * Highlight function to style the selected country
 * @param {*} e
 */
function highlightFeatureHeatmap(e) {
  var layer = e.target
  if (layer === selectedLayer) {
    layer.setStyle({
      weight: 5,
    })
    return
  }

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
function heatmapFeature(feature, layer, setSelectedCountry, setInfoVisible, setSelectedCountryCode, debtData, mapRef, resetHighlight, ggDebtData, setZoom, setCenter) {
  if (!debtData || !feature || !feature.properties ) {
    console.error('Missing debt data or feature properties')
    return
  }

  if (feature.properties.name) {
    layer.bindTooltip(feature.properties.name, { permanent: false, direction: 'auto', className:'labelstyle', sticky: true  })
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

      if (selectedLayer) {
        resetHighlight({ target: selectedLayer })
      }

      if (selectedLayer === layer) {
        selectedLayer = null
        setSelectedCountry(null)
        setInfoVisible(false)
        setSelectedCountryCode(null)
        return
      }

      highlightSelectedFeature({ target: layer })
      selectedLayer = layer
    },
    mouseover: highlightFeatureHeatmap,
    mouseout: (e) => {
      if (selectedLayer !== e.target) {
        resetHighlight(e)
        if (selectedLayer) selectedLayer.bringToFront()
      } else {
        highlightSelectedFeature(e)
      }
    },
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
  const [center, setCenter] = useState([40, 5])
  const [zoom, setZoom] = useState(3)

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
          for (var year in ggDebtData2.values.GG_DEBT_GDP[countryCode]) {
            if (data[countryCode][year] === undefined) {
              data[countryCode][year] = ggDebtData2.values.GG_DEBT_GDP[countryCode][year]
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

  const isUpdating = useRef(false)
  useEffect(() => {
    if (loading) return
    console.log('UseEffect 2')
    if (!mapRef.current) {
      const mapElement = document.getElementById('map')
      const southWest = L.latLng(-89.98155760646617, -200)
      const northEast = L.latLng(89.99346179538875, 200)
      const bounds = L.latLngBounds(southWest, northEast)
      const legend = L.control({ position: 'bottomright' })

      mapRef.current = L.map(mapElement, { attributionControl:false }).setView([40, 5], 3)
      L.control.attribution({
        position: 'bottomleft',
      }).addTo(mapRef.current)

      try {
        mapRef.current.setMaxZoom(6)
        mapRef.current.setMinZoom(2)
        mapRef.current.setMaxBounds(bounds)
      } catch (err) {
        console.error('Error setting zoom levels:', err)
      }

      mapRef.current.on('zoomend', () => {
        if (isUpdating.current) return
        const _zoom = mapRef.current.getZoom()
        setZoom(_zoom)
      })
      mapRef.current.on('moveend', () => {
        if (isUpdating.current) return
        const _center = mapRef.current.getCenter()
        setCenter(_center)
      })

      legend.onAdd = () => {
        let div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 10, 25, 40, 55, 70, 85, 100]
        div.innerHTML = '<h4>Debt % per GDP</h4> <i style="background: black"></i> No data<br />'
        // Get colors for the intervals
        for (let i = 0; i < grades.length; i++) {
          div.innerHTML +=
          '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+')
        }
        return div
      }
      legend.addTo(mapRef.current)

      return () => {
        if (mapRef.current) {
          mapRef.current.remove()
          mapRef.current = null
        }
      }
    }
  },[loading]) //Only run once

  /**
   * Reset highlight style
   * @param {*} e
   */
  function resetHighlight(e) {
    if (!heatmap) cgDebtHeatmapLayer.resetStyle(e.target)
    else ggDebtHeatmapLayer.resetStyle(e.target)
  }

  const memoizedResetHighlight = React.useCallback(resetHighlight, [heatmap])

  useEffect(() => {
    if (loading || !mapRef.current) return
    isUpdating.current = true
    console.log('UseEffect center and zoom')
    mapRef.current.setView(center, zoom)
    isUpdating.current = false
  }, [center, zoom, loading])

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.invalidateSize()
  }, [infoVisible])

  useEffect(() => {
    if (loading || !mapRef.current) return
    console.log('UseEffect layers')

    ggDebtHeatmapLayer = L.geoJson(countries, {
      style: (feature) => applyHeatmapStyle(feature, year, true),
      onEachFeature: (feature, layer) => heatmapFeature(feature, layer, setSelectedCountry, setInfoVisible,
        setSelectedCountryCode, publicDebtData, mapRef, memoizedResetHighlight, true, setZoom, setCenter)
    }).addTo(mapRef.current)

    // Add GeoJSON layer with event handling
    cgDebtHeatmapLayer = L.geoJson(countries, {
      style: (feature) => applyHeatmapStyle(feature, year, false),
      onEachFeature: (feature, layer) => heatmapFeature(feature, layer, setSelectedCountry, setInfoVisible,
        setSelectedCountryCode, centralGovernmentDebtData, mapRef, memoizedResetHighlight, false, setZoom, setCenter)
    }).addTo(mapRef.current)
  }, [centralGovernmentDebtData, loading, memoizedResetHighlight, publicDebtData, year])

  // Heatmap useEffect
  useEffect(() => {
    if (!mapRef.current) return
    console.log('UseEffect heatmap')
    if (heatmap) {
      ggDebtHeatmapLayer.bringToFront()
      if (selectedLayer) selectedLayer.bringToFront()
    } else {
      cgDebtHeatmapLayer.bringToFront()
      if (selectedLayer) selectedLayer.bringToFront()
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.removeLayer(cgDebtHeatmapLayer)
        mapRef.current.removeLayer(ggDebtHeatmapLayer)
      }
    }
  }, [heatmap, loading, year])

  // Selected country useEffect
  useEffect(() => {
    if (!mapRef.current) return
    console.log('UseEffect selected country')
    if (selectedCountryCode) {
      const layers = heatmap ? ggDebtHeatmapLayer.getLayers() : cgDebtHeatmapLayer.getLayers()
      const layer = layers.find(
        (l) => l.feature.properties && l.feature.properties.gu_a3 === selectedCountryCode
      )

      if (layer) {
        highlightSelectedFeature({ target: layer })
        selectedLayer = layer
      }
    }
  }, [selectedCountryCode, heatmap])

  const closeInfoBox = () => {
    try {
      setZoom(mapRef.current.getZoom())
      setCenter(mapRef.current.getCenter())
    } catch (error) {
      console.error('Error getting map center and zoom:', error)
    }
    setInfoVisible(false)
    setSelectedCountry(null)
    setSelectedCountryCode(null)

    if (selectedLayer) {
      if (heatmap) {
        ggDebtHeatmapLayer.resetStyle(selectedLayer)
      } else {
        cgDebtHeatmapLayer.resetStyle(selectedLayer)
      }
      selectedLayer = null
    }
  }

  const handleCountrySelect = (country, countryCode) => {

    if (selectedLayer) {
      if (heatmap) {
        ggDebtHeatmapLayer.resetStyle(selectedLayer)
      } else {
        cgDebtHeatmapLayer.resetStyle(selectedLayer)
      }
    }

    const layers = heatmap ? ggDebtHeatmapLayer.getLayers() : cgDebtHeatmapLayer.getLayers()
    const layer = layers.find(
      (l) => l.feature.properties && l.feature.properties.gu_a3 === countryCode
    )

    if (layer) {
      highlightSelectedFeature({ target: layer })
      selectedLayer = layer
    }
    setSelectedCountry(country)
    setSelectedCountryCode(countryCode)
    setInfoVisible(true)
  }


  const handleMouseEnter = () => {
    if(mapRef.current._mapPane) mapRef.current.scrollWheelZoom.disable()
  }

  const handleMouseLeave = () => {
    if(mapRef.current._mapPane) mapRef.current.scrollWheelZoom.enable()
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
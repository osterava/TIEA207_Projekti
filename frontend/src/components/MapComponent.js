import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import mapService from '../services/mapService.js'
import populationService from '../services/popService.js'
import gdpService from '../services/gdpService.js'
import countries from '../data/countries.json'
import DebtChart from './debtChart.js'
import { getData } from '../services/debtService.js'
import { debounce } from 'lodash'

/**
 * Debugattavaa:
 * vuoden vaihtaminen päivittää kartan, mutta ei päivitä maan tietoja
 * vuoden vaihtaminen esim. 2019 -> 2011, ohjelma jää vuodelle 2015 
 * -> ei renderöi VIIMEISINTÄ vuotta, vaan jonkin vuoden, jonka aloitti renderöimään aiemmin
 * | Täytyy selvittää syy, miksi vuoden päivittyminen sekoittaa layerit (useEffect kesken?) 
 * Maan nopea valitseminen edellisen valinnan jälkeen sekoittaa maiden tiedot
 * -> Konsolista näkee "Fetched GDP data väärältä maalta viimeiseksi valitun maan sijaan"
 * | Täytyy ehkä ladata debtDatan mukaisesti ladata kaikki data MapComponenttin, jotta pyynnöt eivät sekoitu
 * TL;DR: API data pitää ehkä ladata suoraan MapComponenttiin,  
 */

var defaultGeoJsonLayer = null;
var heatmapGeoJsonLayer = null;

/**
 * Apply heatmap style based on the country's debt
 * @param {*} feature 
 */
const applyHeatmapStyle = (feature, year) => {
  console.log('Feature:', feature, 'Year:', year); // Debugging line to check values

  let fillColor;
  if (!feature.properties.debt || !feature.properties.debt[year]) {
    fillColor = 'black';
  } else {
    const debt = feature.properties.debt[year];

    if (debt > 100) {
      fillColor = '#ff0d0d';
    } else if (debt > 85) {
      fillColor = '#ff4e11';
    } else if (debt > 70) {
      fillColor = '#ff8e15';
    } else if (debt > 55) {
      fillColor = '#fab733';
    } else if (debt > 40) {
      fillColor = '#acb334';
    } else if (debt > 25) {
      fillColor = '#69b34c';
    } else if (debt > 10) {
      fillColor = '#3baf4a';
    } else if (debt > 0) {
      fillColor = 'green';
    } else {
      fillColor = 'black';
    }
  }

  return {
    weight: 2,
    fillColor: fillColor,
    fillOpacity: 1,
    color: 'white',
    opacity: 1,
  };
}

/**
 * Highlight function to style the selected country
 * @param {*} e 
 */
function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    // fillcolor: 'red'
    fillColor: '#BF4342',
    fillOpacity: 1,
  });

  layer.bringToFront();
}

/**
 * Reset highlight style
 * @param {*} e 
 */
function resetHighlight(e) {
  defaultGeoJsonLayer.resetStyle(e.target);
}

function heatmapFeature(feature, layer, setSelectedCountry, setInfoVisible, setPopulationData, setSelectedCountryCode, setCountryGBDYear, debtData, year) {
  feature.properties.debt = debtData[feature.properties.gu_a3];
  layer.on({
    click: () => {
    console.log(debtData);
    
      // Nollataan data, ettei näytä edellisen maan tietoja
      setSelectedCountry(null)
      setPopulationData(null);
      setSelectedCountryCode(null);
      setCountryGBDYear(null);


      setSelectedCountry(feature.properties)
      setInfoVisible(true)

      const countryCode = feature.properties.gu_a3
      setSelectedCountryCode(countryCode)
      
      if (countryCode) {
        populationService.getDataByYear(year, countryCode)
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
      
        gdpService.getGDPByYear(year-1, countryCode)
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
    }
  });
}

/**
 * Assign event handlers to each feature (country)
 * @param {*} feature 
 * @param {*} layer 
 */
function onEachFeature(feature, layer, setSelectedCountry, setInfoVisible, setPopulationData, setSelectedCountryCode, setCountryGBDYear, year) {

  layer.on({
    click: () => {
      console.log(feature);
      
      // Nollataan data, ettei näytä edellisen maan tietoja
      setSelectedCountry(null)
      setPopulationData(null);
      setSelectedCountryCode(null);
      setCountryGBDYear(null);


      setSelectedCountry(feature.properties)
      setInfoVisible(true)

      const countryCode = feature.properties.gu_a3
      setSelectedCountryCode(countryCode)
      
      if (countryCode) {
        populationService.getDataByYear(year, countryCode)
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
      
        gdpService.getGDPByYear(year-1, countryCode)
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
function defaultStyle() {
  return {
    //fillcolor: 'grey'
    fillColor: '#818D92',
    weight: 2,
    opacity: 1,
    // color: white
    color: '#222222',
    fillOpacity: 1,
  };
}

const MapComponent = ({year, heatmap}) => {
  const [populationData, setPopulationData] = useState(null)
  const [mapData, setMapData] = useState(null)
  const [infoVisible, setInfoVisible] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedCountryCode, setSelectedCountryCode] = useState(null)
  const [selectedCountryGBDYear,setCountryGBDYear] = useState(null)
  const [debtData, setDebtData] = useState(null);
  // Lisäys mallia näin:
  // const [popData, setPopData] = useState(null);
  // const [gdpData, setGDPData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const mapRef = useRef(null)

  // Pyritään hakemaan data ennen muun koodin suorittamista
  // TODO: debtDatan mukaisesti populointi ja gdp datan haku ja asettaminen 
  useEffect(() => {
    if (!loading) return;
    const fetchData = async () => {
      try {
        const result = await getData()

        // Eristetään data, ei tarvitse aina merkata '.values.GGXWDG_NGDP'
        var data = result.values.GGXWDG_NGDP
        setDebtData(data)
        setLoading(false)
      } catch (err) {
        console.error(err);
        setLoading(false)
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;

    mapService.getMapData().then(data => {
      setMapData(data);

      if (mapRef.current === null) {
        const mapElement = document.getElementById('map');
        const southWest = L.latLng(-89.98155760646617, -200);
        const northEast = L.latLng(89.99346179538875, 200);
        const bounds = L.latLngBounds(southWest, northEast);

        if (mapElement) {
          const map = L.map(mapElement).setView([30, 5], 2);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
          }).addTo(map)

          map.setMaxBounds(bounds);
          map.setMinZoom(2);
          map.setMaxZoom(7);

          mapRef.current = map;
          
          // Add GeoJSON layer with heatmap style
          // TODO: Selvitä miksi heatmap ei toimi
          heatmapGeoJsonLayer = L.geoJson(countries, {
            style: (feature) => applyHeatmapStyle(feature, year),
            onEachFeature: (feature, layer) => heatmapFeature(feature, layer, setSelectedCountry, setInfoVisible, setPopulationData,
              setSelectedCountryCode,setCountryGBDYear, debtData, year)
          }).addTo(map);

          // Add GeoJSON layer with event handling
          defaultGeoJsonLayer = L.geoJson(countries, {
            style: defaultStyle,
            onEachFeature: (feature, layer) => 
             onEachFeature(feature, layer, setSelectedCountry, setInfoVisible, setPopulationData,
            setSelectedCountryCode,setCountryGBDYear, year)
          }).addTo(map)
        }

        debounceHeatmap();
      }
    })

    const debounceHeatmap = debounce(() => {
      if (heatmap) {
        heatmapGeoJsonLayer.setStyle((feature) => applyHeatmapStyle(feature, year));
        heatmapGeoJsonLayer.bringToFront();
      } else {
        defaultGeoJsonLayer.setStyle(defaultStyle);
        defaultGeoJsonLayer.bringToFront();
      }
    });

    return () => {
      if (mapRef.current !== null) {
        mapRef.current.remove()
        mapRef.current = null
      }
    };

  }, [loading,debtData, year, heatmap]);

  const closeInfoBox = () => {
    setInfoVisible(false)
    setSelectedCountry(null)
    setPopulationData(null);
    setSelectedCountryCode(null);
    setCountryGBDYear(null);
  }

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while data is being fetched
  }

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <div
        id="map"
        style={{
          height: '600px',
          width: infoVisible ? '70%' : '100%', // Increase left margin when info box is visible
          marginLeft: infoVisible ? '25%' : '5%',
          marginRight: '5%',
          transition: 'margin-left 0.3s ease', // Smooth transition for the left margin
        }}
      ></div>
  
      {infoVisible && (
        <div id="info-box">
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={closeInfoBox}>Close</button>
          </div>
          <h2>{selectedCountry ? selectedCountry.name : ''}</h2>
          <p>Country ID: {selectedCountryCode}</p>
          <p>Population ({year}): {populationData} million people</p>
          <p>GDP ({year}): {selectedCountryGBDYear} billion USD</p>
          <DebtChart countryCode={selectedCountryCode} />
          <p>Shows the development of gross debt in relation to GDP.</p>
        </div>
      )}
  
      {mapData && <p>{mapData.message}</p>}
    </div>
  )
}

export default MapComponent

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import mapService from '../services/mapService.js';
import { getData } from '../services/dataService'
import countries from '../data/countries.json';

var defaultGeoJsonLayer;
var heatmapGeoJsonLayer;

/**
 * Apply heatmap style based on the country's debt
 * @param {*} feature 
 */
const applyHeatmapStyle = (feature) => {
  if (!feature.properties.debt) {
    feature.properties.debt = { '2024': 0 };
  }
  const debt = feature.properties.debt['2024'];
  let fillColor;

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
  defaultGeoJsonLayer.resetStyle(e.target);
}

function heatmapFeature(feature, layer, setSelectedCountry, setInfoVisible, debtData) {
  feature.properties.debt = debtData[feature.properties.adm0_a3];
  layer.on({
    click: () => {
    console.log(feature);
    setSelectedCountry(feature.properties)
    setInfoVisible(true)
    }
  });
}

/**
 * Assign event handlers to each feature (country)
 * @param {*} feature 
 * @param {*} layer 
 */
function onEachFeature(feature, layer, setSelectedCountry, setInfoVisible) {
  layer.on({
    click: () => {
      console.log(feature);
      
      setSelectedCountry(feature.properties)
      setInfoVisible(true)
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
    fillColor: 'grey',
    weight: 2,
    opacity: 1,
    color: 'white',
    fillOpacity: 1,
  };
}

const MapComponent = () => {
  const [mapData, setMapData] = useState(null);
  const [infoVisible, setInfoVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [heatmap, setHeatmap] = useState(true);
  const [debtData, setDebtData] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  // Pyritään hakemaan data ennen muun koodin suorittamista
  useEffect(() => {
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


  // Velkadata haettu, voidaan piirtää heatmap-kartta (EI TOIMI)
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
          }).addTo(map);

          map.setMaxBounds(bounds);
          map.setMinZoom(2);
          map.setMaxZoom(7);

          mapRef.current = map;
          
          // Add GeoJSON layer with heatmap style
          // TODO: Selvitä miksi heatmap ei toimi
          heatmapGeoJsonLayer = L.geoJson(countries, {
            style: applyHeatmapStyle,
            onEachFeature: (feature, layer) => heatmapFeature(feature, layer, setSelectedCountry, setInfoVisible, debtData)
          }).addTo(map);

          // Add GeoJSON layer with event handling
          defaultGeoJsonLayer = L.geoJson(countries, {
            style: defaultStyle,
            onEachFeature: (feature, layer) => onEachFeature(feature, layer, setSelectedCountry, setInfoVisible)
          }).addTo(map);

          heatmapGeoJsonLayer.setStyle(applyHeatmapStyle);
        }
      }
    });

    return () => {
      if (mapRef.current !== null) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loading]);
  
  const toggleHeatmap = () => {
    console.log('Toggling heatmap');
    console.log(countries);
    
    heatmap ? heatmapGeoJsonLayer.bringToFront() : defaultGeoJsonLayer.bringToFront();
    setHeatmap(!heatmap);
  }

  const closeInfoBox = () => {
    setInfoVisible(false);
    setSelectedCountry(null);
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while data is being fetched
  }

  return (
  <>
    <div style={{ display: 'flex' }}>
      <div
        id="map"
        style={{
          height: '500px',
          width: '90%', 
          marginLeft: infoVisible ? '305px' : '150px', // Increase left margin when info box is visible
          marginRight: infoVisible ? '0' : '150px', // Increase right margin when info box is not visible
          transition: 'margin 0.3s ease', // Smooth transition for the left margin
        }}
      ></div>

      {infoVisible && (
        <div
          id="info-box"
          style={{
            width: '250px',
            height: '460px',
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
          <p>1st thing..: {selectedCountry ? selectedCountry.region : ''}</p>
          <p>2nd thing... {selectedCountry ? selectedCountry.population : ''}</p>
        </div>
      )}
      {mapData && <p>{mapData.message}</p>}
    </div>
    <div id="map-buttons">
      <button onClick={toggleHeatmap}>Toggle heatmap</button>
    </div>
  </>
  )
}

export default MapComponent

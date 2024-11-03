import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import mapService from '../services/mapService.js';
import countries from '../data/countries.json';

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
function onEachFeature(feature, layer, setSelectedCountry, setInfoVisible) {
  layer.on({
    click: () => {
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
  const [mapData, setMapData] = useState(null);
  const [infoVisible, setInfoVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    mapService.getMapData().then(data => {
      setMapData(data);

      if (mapRef.current === null) {
        const mapElement = document.getElementById('map');
        const southWest = L.latLng(-89.98155760646617, -180),
        northEast = L.latLng(89.99346179538875, 180);
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

          // Add GeoJSON layer with event handling
          geojson = L.geoJson(countries, {
            style: style,
            onEachFeature: (feature, layer) => onEachFeature(feature, layer, setSelectedCountry, setInfoVisible)
          }).addTo(map);
        }
      }
    });

    return () => {
      if (mapRef.current !== null) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const closeInfoBox = () => {
    setInfoVisible(false);
    setSelectedCountry(null);
  };

  return (
    <div style={{ display: 'flex' }}>
      <div
        id="map"
        style={{
          height: '500px',
          width: '90%', 
          marginLeft: infoVisible ? '355px' : '150px', // Increase left margin when info box is visible
          marginRight: '150px',
          transition: 'margin-left 0.3s ease', // Smooth transition for the left margin
        }}
      ></div>

      {infoVisible && (
        <div
          style={{
            width: '300px',
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
  )
}

export default MapComponent

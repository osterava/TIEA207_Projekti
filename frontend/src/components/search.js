import React, { useState, useEffect, useRef } from 'react'
import { FaSearch, FaTimes } from 'react-icons/fa'
import InfoBox from './infoBox'
import './search.css'
import countriesData from '../data/countries.json'
import populationService from '../services/popService.js'
import gdpService from '../services/gdpService.js'

const Search = ({ year }) => {
  const [search, setSearch] = useState('')
  const [searchData, setSearchData] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [populationData, setPopulationData] = useState(null)
  const [gdpData, setGdpData] = useState(null)
  const searchRef = useRef(null)

  // Fetch data for the selected country
  const fetchCountryData = async (countryCode) => {
    try {
      const populationResponse = await populationService.getDataByYear(year, countryCode)
      const population = populationResponse.LP ? populationResponse.LP[countryCode] : 'No data available'
      setPopulationData(population)
    } catch (error) {
      console.error('Error fetching population data:', error)
      setPopulationData('Error fetching population data')
    }

    try {
      const gdpResponse = await gdpService.getGDPByYear(year, countryCode)
      const gdp = gdpResponse.NGDPD ? gdpResponse.NGDPD[countryCode] : 'No data available'
      setGdpData(gdp)
    } catch (error) {
      console.error('Error fetching GDP data:', error)
      setGdpData('Error fetching GDP data')
    }
  }

  const handleChange = (e) => {
    setSearch(e.target.value)
    setShowSuggestions(e.target.value !== '')
  }

  const handleClear = () => {
    setSearch('')
    setShowSuggestions(false)
  }

  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (country) => {
    setSelectedCountry(country.properties)
    fetchCountryData(country.properties.gu_a3)
    setSearch('')
    setShowSuggestions(false)
  }

  const closeInfoBox = () => {
    setSelectedCountry(null)
    setPopulationData(null)
    setGdpData(null)
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (search !== '') {
      const newFilterData = countriesData.features.filter((country) =>
        country.properties.name.toLowerCase().startsWith(search.toLowerCase())
      )
      setSearchData(newFilterData)
    } else {
      setSearchData([])
    }
  }, [search])

  return (
    <div className="input-wrapper" ref={searchRef}>
      <FaSearch id="search-icon" />
      <input
        placeholder="Type to search..."
        onChange={handleChange}
        value={search}
        onFocus={() => setShowSuggestions(true)}
      />
      {search && <FaTimes id="clear-icon" onClick={handleClear} />}
      {showSuggestions && searchData.length > 0 && (
        <div className="search_result">
          {searchData.map((country, index) => (
            <button
              key={index}
              className="search_suggestion_line"
              onClick={() => handleSuggestionClick(country)}
            >
              {country.properties.name}
            </button>
          ))}
        </div>
      )}
      {selectedCountry && (
        <InfoBox
          selectedCountry={selectedCountry}
          populationData={populationData}
          selectedCountryGBDYear={gdpData}
          selectedCountryCode={selectedCountry.gu_a3}
          closeInfoBox={closeInfoBox}
          year={year}
        />
      )}
    </div>
  )
}

export default Search

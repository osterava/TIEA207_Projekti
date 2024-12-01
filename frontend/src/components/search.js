import React, { useState, useEffect, useRef } from 'react'
import { FaSearch, FaTimes } from 'react-icons/fa'
import countriesData from '../data/countries.json'
import { getData as getPopulationData } from '../services/popService.js'
import { getData as getGDPData } from '../services/gdpService.js'
import { getData as getPublicDebtData } from '../services/publicDebtService.js'
import { getData as getCGDebtData } from '../services/cgDebtService.js'
import { getGGDebtData } from '../services/publicDebtService.js'

const Search = ({ year, onCountrySelect }) => {
  const [search, setSearch] = useState('')
  const [searchData, setSearchData] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [populationData, setPopulationData] = useState({})
  const [gdpData, setGDPData] = useState({})
  const [publicDebtData, setPublicDebtData] = useState({})
  const [centralGovernmentDebtData, setCentralGovernmentDebtData] = useState({})
  const [ggDebtData, setGGDebtData] = useState(null)
  const searchRef = useRef(null)

  const fetchData = async () => {
    try {
      const popData = await getPopulationData()
      data = popData.values.LP
      setPopulationData(data)
      console.log('Population data:', data)

      const gdp_Data = await getGDPData()
      data = gdp_Data.values.NGDPD
      setGDPData(data)
      console.log('GDP data:', data)


      const pdData = await getPublicDebtData()
      var data = pdData.values.GGXWDG_NGDP
      setPublicDebtData(data)
      console.log('Debt data:', data)

      const cgDebtData = await getCGDebtData()
      data = cgDebtData.values.CG_DEBT_GDP
      setCentralGovernmentDebtData(data)
      console.log('Central government debt data:', data)

      const ggDebtData = await getGGDebtData()
      data = ggDebtData.values.GG_DEBT_GDP
      setGGDebtData(data)
      console.log('General government debt data (2):', data)

    } catch (error) {
      console.error('Error fetching data:', error)
    }
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
    const countryCode = country.properties.gu_a3
    onCountrySelect(country.properties, countryCode)
    setSearch('')
    setShowSuggestions(false)
  }

  useEffect(() => {
    fetchData()
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
    <div className="search" ref={searchRef}>
      <div className="searchWrapper">
        <div className="inputWrapper">
          <FaSearch className="searchIcon" />
          <input
            placeholder="Search a country..."
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            onFocus={() => setShowSuggestions(true)}
          />
          {search && (
            <button
              className="clearButton"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>
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
      </div>
    </div>
  )
}

export default Search
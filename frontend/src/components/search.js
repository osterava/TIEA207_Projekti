import React, { useState, useEffect, useRef } from 'react'
import { FaSearch, FaTimes } from 'react-icons/fa'
import countriesData from '../data/countries.json'

const Search = ({ onCountrySelect, onMouseEnter, onMouseLeave }) => {
  const [search, setSearch] = useState('')
  const [searchData, setSearchData] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)

  const handleClear = () => {
    setSearch('')
    setShowSuggestions(false)
  }

  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setShowSuggestions(false)
    }
    onMouseLeave()
  }

  const handleSuggestionClick = (country) => {
    const countryCode = country.properties.gu_a3
    onCountrySelect(country.properties, countryCode)
    setSearch('')
    setShowSuggestions(false)
    onMouseLeave
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  })

  useEffect(() => {
    if (search !== '') {
      const newFilterData = countriesData.features.filter((country) =>
        country.properties.name.toLowerCase().includes(search.toLowerCase())
      )
      setSearchData(newFilterData)
    } else {
      setSearchData([])
    }
  }, [search])

  return (
    <div className="search" ref={searchRef} onMouseOver={onMouseEnter} onMouseOut={onMouseLeave}>
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

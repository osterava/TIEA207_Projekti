import axios from 'axios'

const baseUrl = '/api/total_debt'

/**
 * Fetches total debt data from the API.
 * @returns {Object} The total debt data retrieved from the API.
 */
export const getData = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

/**
 * Fetches total debt data for a specific country.
 * @param {string} countryCode The country code for the specific country.
 * @returns {Object} The total debt data for the specified country.
 */
export const getTotalDebtData = async (countryCode) => {
  const rawData = await getData()
  return rawData.values.CG_DEBT_GDP[countryCode]
}


/**
 * Fetches total debt data for a specific country and year.
 * @param {string} countryCode The country code for the specific country.
 * @param {string} year The year for which the total debt data is requested.
 * @returns {number} The total debt data for the specified country and year.
 */
export const getTotalDebtYear = async (countryCode, year) => {
  const rawData = await getData()
  const yearStr = year.toString()
  const countryData = rawData.values?.CG_DEBT_GDP?.[countryCode]

  if (!countryData || !countryData[yearStr]) {
    const fallbackYear = '2022'
    console.warn(`No data available for ${yearStr}. Returning data for ${fallbackYear}.`)
    return countryData[fallbackYear] || 'Data unavailable'
  }

  return countryData[yearStr]
}

const dataService = { getData, getTotalDebtData, getTotalDebtYear }
export default dataService

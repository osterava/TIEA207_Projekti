import axios from 'axios'

const baseUrl = '/api/total_debt'

/**
 * Fetches total debt data from the API.
 * Makes a GET request to the `/api/total_debt` endpoint to retrieve total debt data.
 * The response contains debt data for different countries, typically represented as a percentage of GDP.
 * @returns {Object} The total debt data retrieved from the API.
 */
export const getData = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

/**
 * Fetches total debt data for a specific country.
 * This function filters the total debt data by the provided `countryCode`,
 * and returns the debt data for the specified country.
 * @param {string} countryCode The country code for the specific country.
 * @returns {Object} The total debt data for the specified country.
 */
export const getTotalDebtData = async (countryCode) => {
  const rawData = await getData()
  return rawData.values.CG_DEBT_GDP[countryCode]
}

const dataService = { getData }
export default dataService

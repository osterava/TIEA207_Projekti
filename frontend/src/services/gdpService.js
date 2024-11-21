import axios from 'axios'

const baseUrl = '/api/gdp'

/**
 * Fetches the general GDP data from the API.
 * Makes a GET request to the `/api/gdp` endpoint to retrieve the GDP data.
 * The response data contains GDP information for various countries and regions.
 * @returns {Object} The data retrieved from the GDP API.
 */
export const getData = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const dataService = { getData }
export default dataService

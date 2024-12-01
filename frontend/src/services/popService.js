import axios from 'axios'

const baseUrl = '/api/population'

/**
 * Fetches population data from the API.
 * Makes a GET request to the `/api/population` endpoint to retrieve population-related data.
 * The response may contain population data by country, region, and year.
 * @returns {Object} The population data retrieved from the API.
 */
export const getData = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const dataService = { getData }
export default dataService

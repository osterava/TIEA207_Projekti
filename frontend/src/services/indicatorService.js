import axios from 'axios'

const baseUrl = '/api/indicator'

/**
 * Fetches the indicator data from the API.
 * Makes a GET request to the `/api/indicator` endpoint to retrieve the indicator data.
 * The response contains various indicator data points, such as economic or social statistics.
 * @returns {Object} The data retrieved from the indicator API.
 */
export const getData = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const dataService = { getData }
export default dataService

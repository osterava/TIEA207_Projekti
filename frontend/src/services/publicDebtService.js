import axios from 'axios'

const baseUrl = '/api/debt'

/**
 * Fetches the general debt data from the API.
 * Makes a GET request to the `/api/debt` endpoint to retrieve the debt data.
 * The response data contains various debt-related statistics for multiple countries.
 * @returns {Object} The data retrieved from the debt API.
 */
export const getData = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const dataService = { getData }
export default dataService

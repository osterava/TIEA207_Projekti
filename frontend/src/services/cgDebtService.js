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

const dataService = { getData }
export default dataService

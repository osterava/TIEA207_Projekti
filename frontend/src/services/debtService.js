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

/**
 * Fetches the debt data for a specific country by its country code.
 * Retrieves the debt data for the given country by calling the `getData` function,
 * and extracting the debt data specific to that country based on the country code.
 * @param {string} countryCode The country code to fetch debt data for.
 * @returns {Object} The debt data for the specified country.
 */
export const getDebtData = async (countryCode) => {
  const rawData = await getData()
  return rawData.values.GGXWDG_NGDP[countryCode]
}

const dataService = { getData }
export default dataService

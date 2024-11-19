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
/**
 * Fetches the GDP data for a specific country and year.
 * Retrieves the GDP data for the given country by calling `getData` and filtering
 * out the relevant GDP information based on the `countryCode` and `year`. The result
 * is structured by regions and contains the GDP data for the specified country and year.
 * @param {number} year The year for which the GDP data is requested.
 * @param {string} countryCode The country code to fetch GDP data for.
 * @returns {Object} The filtered GDP data for the specified country and year, grouped by region.
 */
export const getGDPByYear = async (year, countryCode) => {
  const rawData = await getData()
  const result = {}

  for (const region in rawData.values) {
    if (rawData.values[region][countryCode]) {
      const GDBData = rawData.values[region][countryCode][year]

      if (GDBData !== undefined) {
        if (!result[region]) {
          result[region] = {}
        }
        result[region][countryCode] = GDBData
        console.log(result)
      }
    }
  }

  return result
}

const dataService = { getData,getGDPByYear }
export default dataService

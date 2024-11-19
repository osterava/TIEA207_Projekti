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

/**
 * Fetches population data for a specific country and year.
 * This function filters the population data by the provided `year` and `countryCode`,
 * and returns the population data for the specified country in the requested year.
 * @param {number} year The year for which population data is required.
 * @param {string} countryCode The country code for the specific country.
 * @returns {Object} An object containing the population data for the specified country and year.
 */
export const getDataByYear = async (year, countryCode) => {
  const rawData = await getData()
  const result = {}

  for (const region in rawData.values) {
    if (rawData.values[region][countryCode]) {
      const populationData = rawData.values[region][countryCode][year]

      if (populationData !== undefined) {
        if (!result[region]) {
          result[region] = {}
        }
        result[region][countryCode] = populationData
      }
    }
  }

  return result
}


const dataService = { getData, getDataByYear }
export default dataService

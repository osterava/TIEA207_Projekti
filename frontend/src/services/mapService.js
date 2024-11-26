import axios from 'axios'

const baseUrl = '/api/maps'

/**
 * Fetches map data from the API.
 * Makes a GET request to the `/api/maps` endpoint to retrieve map-related data.
 * The response may contain information about map layers, geographical boundaries,
 * or other relevant spatial data.
 * @returns {Object} The map data retrieved from the API.
 */
export const getMapData = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const mapService = { getMapData }

export default mapService
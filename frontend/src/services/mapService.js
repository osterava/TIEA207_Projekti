import axios from 'axios'

const baseUrl = '/api/maps'

export const getMapData = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const mapService = { getMapData }

export default mapService

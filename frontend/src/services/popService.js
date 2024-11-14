import axios from 'axios'

const baseUrl = '/api/population'

export const getData = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

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

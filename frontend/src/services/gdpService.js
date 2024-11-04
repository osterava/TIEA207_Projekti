import axios from 'axios'

const baseUrl = '/api/gdp' 

export const getData = async () => {
    const response = await axios.get(baseUrl)
    return response.data
}

export const getGDPByYear = async (year, countryCode) => {
    const rawData = await getData()
    const result = {}

    for (const region in rawData.values) {
        if (rawData.values[region][countryCode]) {
            const GDBData = rawData.values[region][countryCode][year];
            
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

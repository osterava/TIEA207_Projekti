import axios from 'axios'

const baseUrl = '/api/debt' 

export const getData = async () => {
    const response = await axios.get(baseUrl)
    return response.data;
}

export const getDebtData = async (countryCode) => {
    const rawData = await getData()
    return rawData.values.GGXWDG_NGDP[countryCode]
}

const dataService = { getData }
export default dataService

import axios from 'axios'

const baseUrl = '/api/total_debt'

export const getData = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

export const getTotalDebtData = async (countryCode) => {
  const rawData = await getData()
  return rawData.values.CG_DEBT_GDP[countryCode]
}

const dataService = { getData }
export default dataService

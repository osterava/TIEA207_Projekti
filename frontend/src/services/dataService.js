import axios from 'axios'

const baseUrl = '/api/debt' 

export const getData = async () => {
    const response = await axios.get(baseUrl)
    return response.data;
}

const dataService = { getData }
export default dataService


    // Muunna data objektille taulukoksi
    import React, { useEffect, useState } from 'react'
    import { getData } from '../services/dataService'
    
    const DataComponent = () => {
        const [data, setData] = useState({})
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState(null)
    
        useEffect(() => {
            const fetchData = async () => {
                try {
                    const result = await getData()
                    setData(result.values.GGXWDG_NGDP.FIN)
                } catch (err) {
                    setError(err.message)
                } finally {
                    setLoading(false)
                }
            }
    
            fetchData()
        }, [])
    
        if (loading) return <div>Loading...</div>
        if (error) return <div>Error: {error}</div>
    
        const dataEntries = Object.entries(data)
    
        return (
            <div>
                <h1>Data List</h1>
                <h2>Hakee vain tällä hetkellä Suomen datan</h2>
                <h2> Tämä nyt vain hetkellisesti visualisoimassa, että se data oikeasti tulee fronttiin</h2>
                <ul>
                    {dataEntries.map(([year, value]) => ( 
                        <li key={year}>
                            Year: {year}, Value: {value}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };
    
    export default DataComponent;
    
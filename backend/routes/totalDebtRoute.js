const express = require('express')
const axios = require('axios')

const router = express.Router()

const apiUrl = process.env.IMF_TOTAL_DEBT

router.get('/', async (req, res) => { 
    try {
        const response = await axios.get(apiUrl)
        res.json(response.data)
        
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
})

module.exports = router

const express = require('express')
const axios = require('axios')
const router = express.Router()

const apiUrl = process.env.MAP_URL 

router.get('/', async (req, res) => {
  try {
    const response = await axios.get(apiUrl)
    res.json(response.data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from API' })
  }
})

module.exports = router

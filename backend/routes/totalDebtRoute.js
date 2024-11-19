const express = require('express')
const axios = require('axios')

const router = express.Router()

const apiUrl = process.env.IMF_TOTAL_DEBT

/**
 * Route handler for GET requests to retrieve debt data.
 * 
 * This endpoint fetches debt-related data from an external API (defined by the `IMF_TOTAL_DEBT` environment variable).
 * It uses Axios to make a request to the API and returns the data as a JSON response to the client.
 * If an error occurs during the API request, a 500 status code with an error message is sent back to the client.
 *
 * @route GET /api/total_debt
 * @returns {Object} JSON response containing the debt data or an error message
 */
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

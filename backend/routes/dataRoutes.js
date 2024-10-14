require('dotenv').config()
const express = require('express');
const axios = require('axios');

const router = express.Router();

// Ensure actual URL is set in .env file. Current: IMF API for GDP data
const apiUrl = process.env.IMF_URL;

router.get('/api/data', async (req, res) => {
    try {
        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

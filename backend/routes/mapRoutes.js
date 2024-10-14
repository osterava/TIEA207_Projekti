require('dotenv').config()
const express = require('express');
const axios = require('axios');

const router = express.Router();

// Ensure actual URL is set in .env file. Current: JSONPlaceholder API
const apiUrl = process.env.MAP_URL;

router.get('/api/map', async (req, res) => {
    try {
        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from API' });
    }
});

module.exports = router;


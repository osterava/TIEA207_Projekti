const express = require('express');
const axios = require('axios');

const router = express.Router();

// Replace with the actual URL. Current: International Monetary Fund (IMF) API for government debt-to-GDP ratio
const apiUrl = 'https://www.imf.org/external/datamapper/api/v1/GGXWDG_NGDP';

router.get('/api/data', async (req, res) => {
    try {
        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from API' });
    }
});

module.exports = router;

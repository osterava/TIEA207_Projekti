require('dotenv').config()
const express = require('express');
const axios = require('axios');

const router = express.Router();

const apiUrl = process.env.IMF_DEBT;

router.get('/api/data', async (req, res) => {
    try {
        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
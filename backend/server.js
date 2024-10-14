require('dotenv').config()
const express = require('express')
const app = express()
const mapRoutes = require('./routes/mapRoutes')

app.use(express.json())
app.use('/api/maps', mapRoutes)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

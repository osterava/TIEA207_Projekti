require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mapRoutes = require('./routes/mapRoutes')
const dataRoute = require('./routes/dataRoutes')

const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/maps', mapRoutes)
app.use('/api/data', dataRoute)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

require('dotenv').config()
const express = require('express')
const app = express()
const mapRoutes = require('./routes/mapRoutes')
const dataRoute = require('./routes/dataRoutes')
const cors = require('cors')

app.use(express.json())
app.use(cors())
app.use('/', mapRoutes)
app.use('/', dataRoute)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

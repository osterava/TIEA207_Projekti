require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mapRoutes = require('./routes/mapRoutes')
const dataRoute = require('./routes/dataRoutes')
const popRoute = require('./routes/populationRoute')
const gdpRoute = require('./routes/gdpRoute')
const totalDebtRoute = require('./routes/totalDebtRoute')
const indicatorRoute = require('./routes/indicatorRoute')

const app = express()

app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`)
  next()
})

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

app.use('/api/maps', mapRoutes)
app.use('/api/debt', dataRoute)
app.use('/api/total_debt', totalDebtRoute)
app.use('/api/population', popRoute)
app.use('/api/gdp', gdpRoute)
app.use('/api/indicator', indicatorRoute)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

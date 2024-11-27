require('dotenv').config()
const express = require('express')
const cors = require('cors')
const dataRoute = require('./routes/dataRoutes')
const popRoute = require('./routes/populationRoute')
const gdpRoute = require('./routes/gdpRoute')
const totalDebtRoute = require('./routes/totalDebtRoute')
const indicatorRoute = require('./routes/indicatorRoute')
const ggRoute = require('./routes/ggDebtRoute')

const app = express()

/**
 * Middleware to log incoming requests.
 * This middleware logs the HTTP method and the requested URL for each incoming request.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {function} next - The next middleware function to call.
 */
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`)
  next()
})

// Middleware to parse JSON requests
app.use(express.json())
// Middleware to enable CORS (Cross-Origin Resource Sharing)
app.use(cors())
// Middleware to serve static files from the 'build' directory
app.use(express.static('build'))

// Define API routes for different resources
app.use('/api/debt', dataRoute)
app.use('/api/total_debt', totalDebtRoute)
app.use('/api/population', popRoute)
app.use('/api/gdp', gdpRoute)
app.use('/api/indicator', indicatorRoute)
app.use('/api/gg_debt', ggRoute)

// Set the port to either the environment variable or default to 3001
const PORT = process.env.PORT || 3001
/**
 * Start the server and listen on the defined port.
 * Logs a message when the server is successfully running.
 */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

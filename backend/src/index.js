/**
 * Backend entry point.
 * Starts the HTTP server using the configured Express app.
 */

const app = require('./app')
const { env } = require('./config/env')

app.listen(env.port, () => {
	console.log(`Backend running on http://localhost:${env.port}`)
})

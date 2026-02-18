/**
 * Global error middleware.
 */

const { env } = require('../config/env')

function errorHandler(err, _req, res, _next) {
	const status = Number(err.status || 500)
	const message = err.message || 'Internal server error'

	res.status(status).json({
		ok: false,
		message,
		...(env.nodeEnv === 'development' ? { stack: err.stack } : {}),
	})
}

module.exports = { errorHandler }

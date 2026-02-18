/**
 * Wraps async route handlers and forwards errors to Express error middleware.
 */

function asyncHandler(handler) {
	return (req, res, next) => {
		Promise.resolve(handler(req, res, next)).catch(next)
	}
}

module.exports = { asyncHandler }

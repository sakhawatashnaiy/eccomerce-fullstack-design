/**
 * Firebase auth guard middleware.
 * Expects `Authorization: Bearer <idToken>` and attaches decoded user to `req.user`.
 */

const { getFirebaseAdmin } = require('../config/firebaseAdmin')

async function authGuard(req, _res, next) {
	try {
		const authHeader = req.headers.authorization || ''
		if (!authHeader.startsWith('Bearer ')) {
			const error = new Error('Missing or invalid authorization token')
			error.status = 401
			throw error
		}

		const token = authHeader.slice(7)
		const { auth } = getFirebaseAdmin()
		const decoded = await auth.verifyIdToken(token)
		req.user = decoded
		next()
	} catch (error) {
		error.status = error.status || 401
		next(error)
	}
}

module.exports = { authGuard }

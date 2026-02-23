/**
 * Admin guard middleware.
 *
 * Requires `authGuard` to have already populated `req.user`.
 * Admin authorization is granted if:
 * - Firebase custom claim `admin === true` exists, OR
 * - user uid/email is in env allowlist (ADMIN_UIDS / ADMIN_EMAILS), OR
 * - Firestore user profile role is `admin`.
 */

const { env } = require('../config/env')
const { findOrCreateUserProfile } = require('../modules/auth/auth.service')

function parseCsv(value) {
	return String(value || '')
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean)
}

function isAllowlisted({ uid, email }) {
	const allowedUids = new Set(parseCsv(env.adminUids))
	const allowedEmails = new Set(parseCsv(env.adminEmails).map((e) => e.toLowerCase()))

	if (uid && allowedUids.has(String(uid))) return true
	if (email && allowedEmails.has(String(email).toLowerCase())) return true
	return false
}

async function adminGuard(req, _res, next) {
	try {
		const decoded = req.user
		if (!decoded?.uid) {
			const error = new Error('Unauthorized')
			error.status = 401
			throw error
		}

		// 1) Firebase custom claim.
		if (decoded.admin === true) return next()

		// 2) Env allowlist.
		if (isAllowlisted({ uid: decoded.uid, email: decoded.email })) return next()

		// 3) Firestore user profile role.
		const profile = await findOrCreateUserProfile(decoded)
		if (String(profile?.role || '').toLowerCase() === 'admin') return next()

		const error = new Error('Forbidden')
		error.status = 403
		throw error
	} catch (error) {
		error.status = error.status || 403
		next(error)
	}
}

module.exports = { adminGuard }

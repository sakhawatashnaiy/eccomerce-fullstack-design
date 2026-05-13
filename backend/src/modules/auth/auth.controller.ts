/**
 * Auth controller.
 */

const { findOrCreateUserProfile } = require('./auth.service')

async function getMe(req, res) {
	const user = await findOrCreateUserProfile(req.user)
	res.status(200).json({ ok: true, data: user })
}

module.exports = { getMe }

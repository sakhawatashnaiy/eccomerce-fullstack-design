/**
 * Users service.
 */

const { getFirebaseAdmin } = require('../../config/firebaseAdmin')

async function readUserById(uid) {
	const { db } = getFirebaseAdmin()
	const snapshot = await db.collection('users').doc(uid).get()
	if (!snapshot.exists) {
		const error = new Error('User not found')
		error.status = 404
		throw error
	}
	return snapshot.data()
}

module.exports = { readUserById }

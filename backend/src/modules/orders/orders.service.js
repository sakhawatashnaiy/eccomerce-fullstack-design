/**
 * Orders service.
 */

const { getFirebaseAdmin } = require('../../config/firebaseAdmin')

async function readOrdersByUser(uid) {
	const { db } = getFirebaseAdmin()
	const snapshot = await db.collection('orders').where('uid', '==', uid).get()
	return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

async function createOrderForUser(uid, payload) {
	const { db } = getFirebaseAdmin()
	const { items = [], subtotal = 0, shipping = 0, tax = 0, total = 0 } = payload || {}

	if (!Array.isArray(items) || items.length === 0) {
		const error = new Error('Order items are required')
		error.status = 400
		throw error
	}

	const order = {
		uid,
		items,
		subtotal,
		shipping,
		tax,
		total,
		status: 'pending',
		createdAt: new Date().toISOString(),
	}

	const docRef = await db.collection('orders').add(order)
	return { id: docRef.id, ...order }
}

module.exports = { readOrdersByUser, createOrderForUser }

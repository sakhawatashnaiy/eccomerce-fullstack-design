/**
 * Cart service.
 */

const { getFirebaseAdmin } = require('../../config/firebaseAdmin')

async function readCartByUser(uid) {
	const { db } = getFirebaseAdmin()
	const snapshot = await db.collection('carts').doc(uid).collection('items').get()
	return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

async function upsertCartItem(uid, payload) {
	const { db } = getFirebaseAdmin()
	const { productId, qty } = payload || {}

	if (!productId) {
		const error = new Error('productId is required')
		error.status = 400
		throw error
	}

	const nextQty = Math.max(0, Math.floor(Number(qty) || 0))
	const itemRef = db.collection('carts').doc(uid).collection('items').doc(productId)

	if (nextQty <= 0) {
		await itemRef.delete()
		return { productId, qty: 0, removed: true }
	}

	const item = { productId, qty: nextQty, updatedAt: new Date().toISOString() }
	await itemRef.set(item, { merge: true })
	return item
}

module.exports = { readCartByUser, upsertCartItem }

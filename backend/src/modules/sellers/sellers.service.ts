/**
 * Sellers service.
 */

const { getFirebaseAdmin } = require('../../config/firebaseAdmin')

function normalizeSellerId(value) {
	return String(value || '').trim()
}

async function readSellerById(id) {
	const { db } = getFirebaseAdmin()
	const sellerId = normalizeSellerId(id)
	if (!sellerId) {
		const error = new Error('Seller id is required')
		error.status = 400
		throw error
	}
	const doc = await db.collection('sellers').doc(sellerId).get()
	if (!doc.exists) {
		const error = new Error('Seller not found')
		error.status = 404
		throw error
	}
	return { id: doc.id, ...doc.data() }
}

async function upsertSeller(payload: any = {}) {
	const { db } = getFirebaseAdmin()
	const sellerId = normalizeSellerId(payload.id || payload.sellerId)
	if (!sellerId) {
		const error = new Error('id is required')
		error.status = 400
		throw error
	}

	const doc = {
		id: sellerId,
		name: String(payload.name || '').trim() || sellerId,
		country: payload.country != null ? String(payload.country) : null,
		rating: payload.rating != null ? Number(payload.rating) : 0,
		followers: payload.followers != null ? Math.max(0, Math.floor(Number(payload.followers) || 0)) : 0,
		createdAt: payload.createdAt || new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}

	await db.collection('sellers').doc(sellerId).set(doc, { merge: true })
	return doc
}

async function listSellers() {
	const { db } = getFirebaseAdmin()
	const snapshot = await db.collection('sellers').orderBy('createdAt', 'desc').get()
	return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

module.exports = { readSellerById, upsertSeller, listSellers }

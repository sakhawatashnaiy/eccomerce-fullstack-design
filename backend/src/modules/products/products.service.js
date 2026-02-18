/**
 * Products service.
 */

const { getFirebaseAdmin } = require('../../config/firebaseAdmin')
const { isDataUriImage, uploadImageToCloudinary } = require('../../config/cloudinary')
const { sampleProducts } = require('./sampleProducts')

async function resolveProductImage(image) {
	const value = String(image ?? '').trim()
	if (!value) return value

	if (isDataUriImage(value)) {
		const uploaded = await uploadImageToCloudinary(value, { folder: 'products' })
		return uploaded.url
	}

	return value
}

function normalizeProductInput(payload = {}) {
	return {
		name: String(payload.name ?? '').trim(),
		price: Number(payload.price ?? 0),
		image: String(payload.image ?? '').trim(),
		description: String(payload.description ?? '').trim(),
		category: String(payload.category ?? '').trim(),
		stocks: Math.max(0, Math.floor(Number(payload.stocks ?? 0))),
		brand: payload.brand ?? null,
		compareAtPrice: payload.compareAtPrice != null ? Number(payload.compareAtPrice) : null,
		rating: payload.rating != null ? Number(payload.rating) : 0,
		reviews: payload.reviews != null ? Number(payload.reviews) : 0,
		badge: payload.badge ?? null,
		isFeatured: Boolean(payload.isFeatured),
		createdAt: payload.createdAt || new Date().toISOString(),
	}
}

async function readAllProducts(query = {}) {
	const { db } = getFirebaseAdmin()
	const snapshot = await db.collection('products').get()

	let items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

	const search = String(query.search || '').trim().toLowerCase()
	const category = String(query.category || '').trim().toLowerCase()
	const featured = String(query.featured || '').trim().toLowerCase()
	const limit = Number(query.limit || 0)

	if (search) {
		items = items.filter((product) => {
			const name = String(product.name || '').toLowerCase()
			const cat = String(product.category || '').toLowerCase()
			return name.includes(search) || cat.includes(search)
		})
	}

	if (category) {
		items = items.filter((product) => String(product.category || '').toLowerCase() === category)
	}

	if (featured === 'true') {
		items = items.filter((product) => Boolean(product.isFeatured))
	}

	items.sort((a, b) => {
		const da = new Date(a.createdAt || 0).getTime() || 0
		const dbValue = new Date(b.createdAt || 0).getTime() || 0
		return dbValue - da
	})

	if (limit > 0) {
		items = items.slice(0, limit)
	}

	return items
}

async function readProductById(id) {
	const { db } = getFirebaseAdmin()
	const snapshot = await db.collection('products').doc(id).get()
	if (!snapshot.exists) {
		const error = new Error('Product not found')
		error.status = 404
		throw error
	}
	return { id: snapshot.id, ...snapshot.data() }
}

async function createProductDoc(payload) {
	const { db } = getFirebaseAdmin()
	const image = await resolveProductImage(payload.image)
	const data = normalizeProductInput({ ...payload, image })

	const docId = String(payload.id || '').trim()
	if (docId) {
		const ref = db.collection('products').doc(docId)
		await ref.set(data)
		return { id: docId, ...data }
	}

	const ref = await db.collection('products').add(data)
	return { id: ref.id, ...data }
}

async function updateProductDoc(id, payload) {
	const { db } = getFirebaseAdmin()
	const ref = db.collection('products').doc(id)
	const snapshot = await ref.get()

	if (!snapshot.exists) {
		const error = new Error('Product not found')
		error.status = 404
		throw error
	}

	const current = snapshot.data()
	const image =
		payload.image !== undefined ? await resolveProductImage(payload.image) : current.image
	const merged = normalizeProductInput({ ...current, ...payload, image })
	merged.updatedAt = new Date().toISOString()

	await ref.set(merged, { merge: true })
	return { id, ...merged }
}

async function deleteProductDoc(id) {
	const { db } = getFirebaseAdmin()
	const ref = db.collection('products').doc(id)
	const snapshot = await ref.get()
	if (!snapshot.exists) {
		const error = new Error('Product not found')
		error.status = 404
		throw error
	}
	await ref.delete()
	return { id, deleted: true }
}

async function seedProductCollection() {
	const { db } = getFirebaseAdmin()

	const writes = sampleProducts.map((product) => {
		const data = normalizeProductInput(product)
		const id = String(product.id).trim()
		return db.collection('products').doc(id).set(data, { merge: true })
	})

	await Promise.all(writes)
	return { inserted: sampleProducts.length }
}

module.exports = {
	readAllProducts,
	readProductById,
	createProductDoc,
	updateProductDoc,
	deleteProductDoc,
	seedProductCollection,
}

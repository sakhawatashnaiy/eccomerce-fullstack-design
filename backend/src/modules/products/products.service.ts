/**
 * Products service.
 */

const { getFirebaseAdmin } = require('../../config/firebaseAdmin')
const { isDataUriImage, uploadImageToCloudinary } = require('../../config/cloudinary')
const { sampleProducts } = require('./sampleProducts')

type AnyRecord = Record<string, any>

function normalizeId(value) {
	return String(value ?? '').trim()
}

function normalizeIsoDate(value) {
	const raw = String(value ?? '').trim()
	if (!raw) return null
	const d = new Date(raw)
	if (Number.isNaN(d.getTime())) return null
	return d.toISOString()
}

function normalizeMoney(value) {
	const n = Number(value ?? 0)
	if (!Number.isFinite(n)) return 0
	return n
}

function normalizeStocks(value) {
	return Math.max(0, Math.floor(Number(value ?? 0) || 0))
}

function normalizeVariantsInput(variants: any) {
	if (!Array.isArray(variants)) return []
	return variants
		.map((v) => {
			if (!v || typeof v !== 'object') return null
			const id = normalizeId(v.id || v.sku)
			if (!id) return null
			return {
				id,
				label: String(v.label || v.name || id).trim(),
				price: normalizeMoney(v.price),
				stocks: normalizeStocks(v.stocks),
				options: v.options && typeof v.options === 'object' ? v.options : null,
			}
		})
		.filter(Boolean)
}

function normalizeImagesInput(images: any, fallbackImage: any) {
	const list = Array.isArray(images) ? images : []
	const normalized = list
		.map((value) => String(value || '').trim())
		.filter(Boolean)
	if (!normalized.length && fallbackImage) {
		const fallback = String(fallbackImage || '').trim()
		if (fallback) normalized.push(fallback)
	}
	return normalized
}

function normalizeDealInput(deal: AnyRecord | null) {
	if (!deal || typeof deal !== 'object') return null
	const price = normalizeMoney(deal.price ?? deal.dealPrice)
	const startsAt = normalizeIsoDate(deal.startsAt)
	const endsAt = normalizeIsoDate(deal.endsAt)
	const label = String(deal.label || 'Flash deal').trim()
	if (!price || price <= 0) return null
	return { price, startsAt, endsAt, label }
}

function normalizeSellerInput(seller: AnyRecord | null, payload: AnyRecord = {}) {
	const sellerId = normalizeId(payload.sellerId || seller?.id || seller?.sellerId)
	const sellerName = String(payload.sellerName || seller?.name || '').trim()
	if (!sellerId && !sellerName) return { sellerId: null, seller: null }
	const id = sellerId || sellerName
	return {
		sellerId: id,
		seller: {
			id,
			name: sellerName || id,
		},
	}
}

function isDealActive(product: AnyRecord, now = new Date()) {
	const deal = product?.deal
	if (!deal || typeof deal !== 'object') return false
	if (!(Number(deal.price) > 0)) return false
	if (deal.startsAt) {
		const starts = new Date(deal.startsAt)
		if (!Number.isNaN(starts.getTime()) && now.getTime() < starts.getTime()) return false
	}
	if (deal.endsAt) {
		const ends = new Date(deal.endsAt)
		if (!Number.isNaN(ends.getTime()) && now.getTime() > ends.getTime()) return false
	}
	return true
}

async function resolveProductImage(image: any) {
	const value = String(image ?? '').trim()
	if (!value) return value

	if (isDataUriImage(value)) {
		const uploaded = await uploadImageToCloudinary(value, { folder: 'products' })
		return uploaded.url
	}

	return value
}

async function resolveProductImages(images: any) {
	if (!Array.isArray(images) || images.length === 0) return []
	const resolved = await Promise.all(images.map((value) => resolveProductImage(value)))
	return resolved.map((value) => String(value || '').trim()).filter(Boolean)
}

function normalizeProductInput(payload: AnyRecord = {}) {
	const { sellerId, seller } = normalizeSellerInput(payload.seller, payload)
	const variants = normalizeVariantsInput(payload.variants)
	const deal = normalizeDealInput(payload.deal)
	const images = normalizeImagesInput(payload.images, payload.image)

	return {
		name: String(payload.name ?? '').trim(),
		price: normalizeMoney(payload.price),
		image: String(payload.image ?? '').trim(),
		images,
		description: String(payload.description ?? '').trim(),
		category: String(payload.category ?? '').trim(),
		stocks: normalizeStocks(payload.stocks),
		brand: payload.brand ?? null,
		compareAtPrice: payload.compareAtPrice != null ? Number(payload.compareAtPrice) : null,
		rating: payload.rating != null ? Number(payload.rating) : 0,
		reviews: payload.reviews != null ? Number(payload.reviews) : 0,
		badge: payload.badge ?? null,
		isFeatured: Boolean(payload.isFeatured),
		sellerId,
		seller,
		deal,
		variants,
		createdAt: payload.createdAt || new Date().toISOString(),
	}
}

async function readAllProducts(query: AnyRecord = {}) {
	const { db } = getFirebaseAdmin()
	const snapshot = await db.collection('products').get()

	let items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

	const search = String(query.search || '').trim().toLowerCase()
	const category = String(query.category || '').trim().toLowerCase()
	const featured = String(query.featured || '').trim().toLowerCase()
	const sellerId = String(query.sellerId || '').trim().toLowerCase()
	const deals = String(query.deals || query.flashDeals || '').trim().toLowerCase()
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

	if (sellerId) {
		items = items.filter((product) => String(product.sellerId || '').trim().toLowerCase() === sellerId)
	}

	if (deals === 'true') {
		const now = new Date()
		items = items.filter((product) => isDealActive(product, now))
	}

	const priceMin = Number(query.priceMin)
	const priceMax = Number(query.priceMax)
	if (Number.isFinite(priceMin)) {
		items = items.filter((product) => Number(product.price) >= priceMin)
	}
	if (Number.isFinite(priceMax)) {
		items = items.filter((product) => Number(product.price) <= priceMax)
	}

	const rating = Number(query.rating)
	if (Number.isFinite(rating) && rating > 0) {
		items = items.filter((product) => Number(product.rating || 0) >= rating)
	}

	const brand = String(query.brand || '').trim().toLowerCase()
	if (brand) {
		items = items.filter((product) => String(product.brand || '').trim().toLowerCase() === brand)
	}

	const sortKey = String(query.sort || 'newest').trim().toLowerCase()
	items.sort((a, b) => {
		if (sortKey === 'price-asc') {
			return Number(a.price || 0) - Number(b.price || 0)
		}
		if (sortKey === 'price-desc') {
			return Number(b.price || 0) - Number(a.price || 0)
		}
		if (sortKey === 'rating') {
			return Number(b.rating || 0) - Number(a.rating || 0)
		}
		if (sortKey === 'popularity') {
			return Number(b.reviews || 0) - Number(a.reviews || 0)
		}
		const da = new Date(a.createdAt || 0).getTime() || 0
		const dbValue = new Date(b.createdAt || 0).getTime() || 0
		return dbValue - da
	})

	if (limit > 0) {
		items = items.slice(0, limit)
	}

	return items
}

async function readProductRecommendations(productId: any, options: AnyRecord = {}) {
	const limit = Math.max(1, Math.min(24, Math.floor(Number(options.limit || 8) || 8)))
	const product = await readProductById(productId)
	const all = await readAllProducts({})
	const category = String(product?.category || '').trim().toLowerCase()
	return all
		.filter((p) => p?.id && p.id !== productId)
		.filter((p) => (category ? String(p.category || '').trim().toLowerCase() === category : true))
		.slice(0, limit)
}

async function readProductReviews(productId) {
	const { db } = getFirebaseAdmin()
	const snapshot = await db
		.collection('products')
		.doc(String(productId))
		.collection('reviews')
		.orderBy('createdAt', 'desc')
		.get()
	return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

async function recalcProductRating(productId) {
	const { db } = getFirebaseAdmin()
	const reviews = await readProductReviews(productId)
	const count = reviews.length
	const sum = reviews.reduce((acc, r) => acc + (Number(r?.rating) || 0), 0)
	const avg = count ? Math.round((sum / count) * 10) / 10 : 0
	await db
		.collection('products')
		.doc(String(productId))
		.set({ rating: avg, reviews: count, updatedAt: new Date().toISOString() }, { merge: true })
	return { rating: avg, reviews: count }
}

async function upsertProductReview(uid: any, productId: any, payload: AnyRecord = {}) {
	const { db } = getFirebaseAdmin()
	const rating = Math.max(1, Math.min(5, Math.floor(Number(payload.rating) || 0)))
	if (!rating) {
		const error = new Error('rating is required (1-5)')
		error.status = 400
		throw error
	}
	const text = String(payload.text || '').trim()
	const displayName = payload.displayName != null ? String(payload.displayName) : null

	const ref = db.collection('products').doc(String(productId)).collection('reviews').doc(String(uid))
	await ref.set(
		{
			uid: String(uid),
			rating,
			text,
			displayName,
			updatedAt: new Date().toISOString(),
			createdAt: payload.createdAt || new Date().toISOString(),
		},
		{ merge: true }
	)

	const agg = await recalcProductRating(productId)
	const doc = await ref.get()
	return { review: { id: doc.id, ...doc.data() }, aggregate: agg }
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
	const resolvedImages = await resolveProductImages(payload.images)
	const images = resolvedImages.length ? resolvedImages : normalizeImagesInput([], image)
	const data = normalizeProductInput({ ...payload, image, images })

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

	const current: any = snapshot.data() || {}
	const image =
		payload.image !== undefined ? await resolveProductImage(payload.image) : current.image
	const resolvedImages =
		payload.images !== undefined ? await resolveProductImages(payload.images) : current.images
	const images = Array.isArray(resolvedImages) && resolvedImages.length
		? resolvedImages
		: normalizeImagesInput(current.images, image)
	const merged: any = normalizeProductInput({ ...current, ...payload, image, images })
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
	readProductRecommendations,
	readProductReviews,
	upsertProductReview,
}

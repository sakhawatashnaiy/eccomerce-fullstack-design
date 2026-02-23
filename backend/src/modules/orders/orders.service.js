/**
 * Orders service.
 */

const { getFirebaseAdmin } = require('../../config/firebaseAdmin')

const ORDER_STATUSES = ['pending', 'shipped', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded']
const PAYMENT_METHODS = ['cod', 'card', 'jazzcash', 'easypaisa', 'bank', 'paypal']

function normalizeStatus(value) {
	return String(value || '').trim().toLowerCase()
}

function normalizePaymentMethod(value) {
	const method = normalizeStatus(value)
	if (!method) return ''

	if (method === 'cash on delivery' || method === 'cash_on_delivery') return 'cod'
	if (method === 'credit card' || method === 'debit card') return 'card'
	if (method === 'bank transfer' || method === 'bank_transfer' || method === 'bank-card' || method === 'bankcard') {
		return 'bank'
	}

	return method
}

function assertAllowed(value, allowed, label) {
	if (!allowed.includes(value)) {
		const error = new Error(`Invalid ${label}`)
		error.status = 400
		throw error
	}
}

function assertCanTransition(from, to) {
	if (from === to) return

	const allowed = {
		pending: ['shipped', 'cancelled'],
		shipped: ['delivered'],
		delivered: [],
		cancelled: [],
	}

	if (!allowed[from] || !allowed[from].includes(to)) {
		const error = new Error(`Cannot change status from ${from} to ${to}`)
		error.status = 400
		throw error
	}
}

async function readOrdersByUser(uid) {
	const { db } = getFirebaseAdmin()
	const snapshot = await db.collection('orders').where('uid', '==', uid).get()
	return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

async function readAllOrders() {
	const { db } = getFirebaseAdmin()
	const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get()
	return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

async function readOrderById(orderId) {
	const { db } = getFirebaseAdmin()
	const doc = await db.collection('orders').doc(String(orderId)).get()
	if (!doc.exists) {
		const error = new Error('Order not found')
		error.status = 404
		throw error
	}
	return { id: doc.id, ...doc.data() }
}

async function createOrderForUser(uid, payload) {
	const { db } = getFirebaseAdmin()
	const {
		items = [],
		subtotal = 0,
		shipping = 0,
		tax = 0,
		total = 0,
		customer = {},
		shippingAddress = {},
		payment = {},
	} = payload || {}

	if (!Array.isArray(items) || items.length === 0) {
		const error = new Error('Order items are required')
		error.status = 400
		throw error
	}

	const paymentMethod = normalizePaymentMethod(payment?.method) || 'cod'
	if (paymentMethod) assertAllowed(paymentMethod, PAYMENT_METHODS, 'payment method')

	const order = {
		uid,
		items,
		subtotal,
		shipping,
		tax,
		total,
		status: 'pending',
		customer: {
			name: String(customer?.name || ''),
			email: String(customer?.email || ''),
			phone: String(customer?.phone || ''),
		},
		shippingAddress: {
			line1: String(shippingAddress?.line1 || ''),
			line2: String(shippingAddress?.line2 || ''),
			city: String(shippingAddress?.city || ''),
			state: String(shippingAddress?.state || ''),
			postalCode: String(shippingAddress?.postalCode || ''),
			country: String(shippingAddress?.country || ''),
		},
		payment: {
			method: paymentMethod,
			status: normalizeStatus(payment?.status) || 'unpaid',
			transactionId: String(payment?.transactionId || ''),
		},
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}

	assertAllowed(order.payment.status, PAYMENT_STATUSES, 'payment status')

	const docRef = await db.collection('orders').add(order)
	return { id: docRef.id, ...order }
}

async function updateOrderById(orderId, patch) {
	const { db } = getFirebaseAdmin()
	const ref = db.collection('orders').doc(String(orderId))
	const doc = await ref.get()
	if (!doc.exists) {
		const error = new Error('Order not found')
		error.status = 404
		throw error
	}

	const current = doc.data() || {}
	const next = {}

	// Status transitions
	if (Object.prototype.hasOwnProperty.call(patch || {}, 'status')) {
		const to = normalizeStatus(patch.status)
		assertAllowed(to, ORDER_STATUSES, 'order status')
		const from = normalizeStatus(current.status) || 'pending'
		assertCanTransition(from, to)
		next.status = to
		if (to === 'shipped') next.shippedAt = new Date().toISOString()
		if (to === 'delivered') next.deliveredAt = new Date().toISOString()
		if (to === 'cancelled') next.cancelledAt = new Date().toISOString()
	}

	// Payment patch
	if (patch?.payment && typeof patch.payment === 'object') {
		const currentPayment = current.payment || {}
		const merged = { ...currentPayment }
		if (Object.prototype.hasOwnProperty.call(patch.payment, 'method')) {
			merged.method = normalizePaymentMethod(patch.payment.method)
			assertAllowed(merged.method, PAYMENT_METHODS, 'payment method')
		}
		if (Object.prototype.hasOwnProperty.call(patch.payment, 'status')) {
			merged.status = normalizeStatus(patch.payment.status)
			assertAllowed(merged.status, PAYMENT_STATUSES, 'payment status')
		}
		if (Object.prototype.hasOwnProperty.call(patch.payment, 'transactionId')) {
			merged.transactionId = String(patch.payment.transactionId || '')
		}
		next.payment = merged
	}

	// Allow updating customer contact fields (optional)
	if (patch?.customer && typeof patch.customer === 'object') {
		next.customer = {
			...(current.customer || {}),
			...(patch.customer || {}),
		}
	}

	// Allow updating shipping address (optional)
	if (patch?.shippingAddress && typeof patch.shippingAddress === 'object') {
		next.shippingAddress = {
			...(current.shippingAddress || {}),
			...(patch.shippingAddress || {}),
		}
	}

	if (Object.keys(next).length === 0) {
		return { id: doc.id, ...current }
	}

	next.updatedAt = new Date().toISOString()
	await ref.set(next, { merge: true })
	const updated = await ref.get()
	return { id: updated.id, ...updated.data() }
}

module.exports = {
	readOrdersByUser,
	readAllOrders,
	readOrderById,
	createOrderForUser,
	updateOrderById,
}

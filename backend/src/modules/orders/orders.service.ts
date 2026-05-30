/**
 * Orders service.
 */

const { getFirebaseAdmin } = require('../../config/firebaseAdmin')
const { validateCoupon } = require('../coupons/coupons.service')

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

async function readOrderByIdForUser(uid, orderId) {
	const order = await readOrderById(orderId)
	if (String(order.uid || '') !== String(uid || '')) {
		const error = new Error('Order not found')
		error.status = 404
		throw error
	}
	return order
}

async function readOrderTrackingForUser(uid, orderId) {
	const order = await readOrderByIdForUser(uid, orderId)
	const history = Array.isArray(order.statusHistory) ? order.statusHistory : []
	return {
		orderId: order.id,
		status: order.status,
		events: history,
		createdAt: order.createdAt || null,
		shippedAt: order.shippedAt || null,
		deliveredAt: order.deliveredAt || null,
		cancelledAt: order.cancelledAt || null,
	}
}

function safeNumber(value) {
	const n = Number(value)
	return Number.isFinite(n) ? n : 0
}

function computeSubtotalFromItems(items) {
	if (!Array.isArray(items)) return 0
	return items.reduce((sum, item) => {
		const price = safeNumber(item?.price)
		const qty = Math.max(0, Math.floor(safeNumber(item?.qty) || 0))
		return sum + price * qty
	}, 0)
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
		coupon,
		couponCode,
	} = payload || {}

	if (!Array.isArray(items) || items.length === 0) {
		const error = new Error('Order items are required')
		error.status = 400
		throw error
	}

	const paymentMethod = normalizePaymentMethod(payment?.method) || 'cod'
	if (paymentMethod) assertAllowed(paymentMethod, PAYMENT_METHODS, 'payment method')

	const computedSubtotal = computeSubtotalFromItems(items) || safeNumber(subtotal)
	const computedShipping = safeNumber(shipping)
	const computedTax = safeNumber(tax)

	const code = String(coupon?.code || couponCode || '').trim()
	let discount = { code: null, amount: 0 }
	if (code) {
		const result = await validateCoupon(code, computedSubtotal)
		if (result.ok) {
			discount = { code: result.code, amount: Number(result.amountOff) || 0 }
		}
	}

	const computedTotal = Math.max(
		0,
		computedSubtotal + computedShipping + computedTax - (Number(discount.amount) || 0)
	)

	const order = {
		uid,
		items,
		subtotal: computedSubtotal,
		shipping: computedShipping,
		tax: computedTax,
		discount,
		total: computedTotal || safeNumber(total),
		status: 'pending',
		statusHistory: [
			{
				status: 'pending',
				at: new Date().toISOString(),
				label: 'Placed',
			},
		],
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
	const next: Record<string, any> = {}

	// Status transitions
	if (Object.prototype.hasOwnProperty.call(patch || {}, 'status')) {
		const to = normalizeStatus(patch.status)
		assertAllowed(to, ORDER_STATUSES, 'order status')
		const from = normalizeStatus(current.status) || 'pending'
		assertCanTransition(from, to)
		next.status = to
		const history = Array.isArray(current.statusHistory) ? current.statusHistory : []
		history.push({ status: to, at: new Date().toISOString(), label: to })
		next.statusHistory = history.slice(-20)
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

	// Allow updating tracking metadata (optional)
	if (patch?.tracking && typeof patch.tracking === 'object') {
		next.tracking = {
			...(current.tracking || {}),
			...(patch.tracking || {}),
		}
	}

	// Append admin notes for audit trail (optional)
	if (patch?.adminNote) {
		const note = String(patch.adminNote || '').trim()
		if (note) {
			const history = Array.isArray(current.adminNotes) ? current.adminNotes : []
			history.push({
				note,
				label: String(patch.adminNoteLabel || 'Review'),
				by: String(patch.adminNoteBy || 'admin'),
				at: new Date().toISOString(),
			})
			next.adminNotes = history.slice(-20)
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
	readOrderByIdForUser,
	readOrderTrackingForUser,
	createOrderForUser,
	updateOrderById,
}

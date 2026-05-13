/**
 * Coupon persistence (localStorage).
 */

const COUPON_KEY = 'cart:coupon'

function emitCouponUpdated() {
	if (typeof window === 'undefined') return
	window.dispatchEvent(new Event('coupon:updated'))
}

function safeParse(json, fallback) {
	try {
		return JSON.parse(json)
	} catch {
		return fallback
	}
}

export function getAppliedCoupon() {
	if (typeof window === 'undefined') return null
	const raw = window.localStorage.getItem(COUPON_KEY)
	const parsed = raw ? safeParse(raw, null) : null
	return parsed && typeof parsed === 'object' ? parsed : null
}

export function setAppliedCoupon(coupon) {
	if (typeof window === 'undefined') return
	if (!coupon) {
		window.localStorage.removeItem(COUPON_KEY)
		emitCouponUpdated()
		return
	}
	window.localStorage.setItem(COUPON_KEY, JSON.stringify(coupon))
	emitCouponUpdated()
}

export function clearAppliedCoupon() {
	setAppliedCoupon(null)
}

export function subscribeCouponUpdated(callback) {
	window.addEventListener('coupon:updated', callback)
	return () => window.removeEventListener('coupon:updated', callback)
}

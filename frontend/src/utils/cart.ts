/**
 * Cart persistence utilities.
 * Stores cart items in localStorage and emits `cart:updated` so components can refresh.
 */
const CART_KEY = 'cart'

function emitCartUpdated() {
	if (typeof window === 'undefined') return
	window.dispatchEvent(new Event('cart:updated'))
}

function safeParse(json, fallback) {
	try {
		return JSON.parse(json)
	} catch {
		return fallback
	}
}

export function getCartItems() {
	if (typeof window === 'undefined') return []
	const raw = window.localStorage.getItem(CART_KEY)
	const parsed = raw ? safeParse(raw, []) : []
	return Array.isArray(parsed) ? parsed : []
}

export function getCartCount() {
	return getCartItems().reduce((sum, item) => sum + (Number(item?.qty) || 0), 0)
}

function buildCartItemId(productId, variantId) {
	const base = String(productId || '').trim()
	const variant = String(variantId || '').trim()
	return variant ? `${base}::${variant}` : base
}

export function addToCart(product, qty = 1, options = {}) {
	if (typeof window === 'undefined') return
	const nextQty = Math.max(1, Number(qty) || 1)
	const productId = String(product?.id || '').trim()
	const variantId = String(options?.variantId || '').trim()
	const itemId = buildCartItemId(productId, variantId)
	const variantLabel = String(options?.variantLabel || '').trim() || null
	const overridePrice = options?.price != null ? Number(options.price) : null
	const items = getCartItems()
	const index = items.findIndex((i) => i?.id === itemId)

	if (index >= 0) {
		items[index] = { ...items[index], qty: (Number(items[index].qty) || 0) + nextQty }
	} else {
		items.push({
			id: itemId,
			productId,
			variantId: variantId || null,
			variantLabel,
			name: product?.name,
			price: overridePrice != null && !Number.isNaN(overridePrice) ? overridePrice : product?.price,
			image: product?.image,
			qty: nextQty,
		})
	}

	window.localStorage.setItem(CART_KEY, JSON.stringify(items))
	emitCartUpdated()
}

export function setCartItemQty(id, qty) {
	if (typeof window === 'undefined') return
	const nextQty = Math.max(0, Math.floor(Number(qty) || 0))
	const items = getCartItems()
	const index = items.findIndex((i) => i?.id === id)
	if (index < 0) return

	if (nextQty <= 0) {
		items.splice(index, 1)
	} else {
		items[index] = { ...items[index], qty: nextQty }
	}

	window.localStorage.setItem(CART_KEY, JSON.stringify(items))
	emitCartUpdated()
}

export function removeFromCart(id) {
	setCartItemQty(id, 0)
}

export function clearCart() {
	if (typeof window === 'undefined') return
	window.localStorage.setItem(CART_KEY, JSON.stringify([]))
	emitCartUpdated()
}

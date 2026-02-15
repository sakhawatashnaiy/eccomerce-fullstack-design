/**
 * Recently viewed persistence utilities.
 * Stores product IDs in localStorage and emits `recentlyViewed:updated`.
 */
const RECENTLY_VIEWED_KEY = 'recentlyViewed'
const MAX_ITEMS = 8

function safeParse(json, fallback) {
	try {
		return JSON.parse(json)
	} catch {
		return fallback
	}
}

export function getRecentlyViewedIds() {
	if (typeof window === 'undefined') return []
	const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY)
	const parsed = raw ? safeParse(raw, []) : []
	return Array.isArray(parsed) ? parsed.filter(Boolean) : []
}

export function addRecentlyViewed(productId) {
	if (typeof window === 'undefined') return
	if (!productId) return
	const existing = getRecentlyViewedIds()
	const next = [productId, ...existing.filter((id) => id !== productId)].slice(0, MAX_ITEMS)
	window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next))
	window.dispatchEvent(new Event('recentlyViewed:updated'))
}

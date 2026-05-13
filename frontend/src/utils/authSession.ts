/**
 * Lightweight auth session persistence.
 * Stores Firebase ID token + minimal user info in localStorage.
 */

const TOKEN_KEY = 'auth:idToken'
const USER_KEY = 'auth:user'

export function setAuthSession({ token, user }) {
	if (token) localStorage.setItem(TOKEN_KEY, token)
	if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
	window.dispatchEvent(new Event('auth:updated'))
}

export function clearAuthSession() {
	localStorage.removeItem(TOKEN_KEY)
	localStorage.removeItem(USER_KEY)
	window.dispatchEvent(new Event('auth:updated'))
}

export function getAuthToken() {
	return localStorage.getItem(TOKEN_KEY) || ''
}

export function getAuthUser() {
	try {
		const raw = localStorage.getItem(USER_KEY)
		return raw ? JSON.parse(raw) : null
	} catch {
		return null
	}
}

export function isSignedIn() {
	return Boolean(getAuthToken())
}

export function subscribeAuthUpdated(callback) {
	window.addEventListener('auth:updated', callback)
	return () => window.removeEventListener('auth:updated', callback)
}

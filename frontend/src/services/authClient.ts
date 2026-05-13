/**
 * Firebase Auth client helpers.
 */

import {
	createUserWithEmailAndPassword,
	onIdTokenChanged,
	signInWithEmailAndPassword,
	signOut,
	updateProfile,
} from 'firebase/auth'

import { getFirebaseAuth } from '../config/firebaseClient.js'
import { clearAuthSession, setAuthSession } from '../utils/authSession.js'

let tokenListenerUnsubscribe = null

function pickUser(user) {
	if (!user) return null
	return {
		uid: user.uid,
		email: user.email || null,
		displayName: user.displayName || null,
		photoURL: user.photoURL || null,
	}
}

export function getFriendlyAuthError(error) {
	const message = String(error?.message || '')
	if (message.includes('Firebase client is not configured')) {
		return 'Firebase is not configured for this frontend. Add the VITE_FIREBASE_* variables (see frontend/.env.example) and restart the dev server.'
	}

	const code = String(error?.code || '')
	if (code === 'auth/email-already-in-use') return 'That email is already in use.'
	if (code === 'auth/invalid-email') return 'Please enter a valid email address.'
	if (code === 'auth/weak-password') return 'Password is too weak. Use at least 8 characters.'
	if (code === 'auth/invalid-credential') return 'Incorrect email or password.'
	if (code === 'auth/user-disabled') return 'This account has been disabled.'
	if (code === 'auth/user-not-found') return 'No account found for this email.'
	if (code === 'auth/wrong-password') return 'Incorrect email or password.'
	if (code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.'
	if (code === 'auth/network-request-failed') return 'Network error. Check your internet connection.'
	return message || 'Authentication failed. Please try again.'
}

export function initAuthTokenListener() {
	if (tokenListenerUnsubscribe) return tokenListenerUnsubscribe

	let auth
	try {
		auth = getFirebaseAuth()
	} catch {
		// Firebase not configured; keep app usable.
		tokenListenerUnsubscribe = () => {}
		return tokenListenerUnsubscribe
	}

	tokenListenerUnsubscribe = onIdTokenChanged(auth, async (user) => {
		if (!user) {
			clearAuthSession()
			return
		}
		const token = await user.getIdToken()
		setAuthSession({ token, user: pickUser(user) })
	})

	return tokenListenerUnsubscribe
}

export async function signupWithEmailPassword({ fullName, email, password }) {
	const auth = getFirebaseAuth()
	const credential = await createUserWithEmailAndPassword(auth, String(email).trim(), String(password))
	if (fullName) {
		await updateProfile(credential.user, { displayName: String(fullName).trim() })
	}
	const token = await credential.user.getIdToken()
	setAuthSession({ token, user: pickUser(credential.user) })
	return { token, user: pickUser(credential.user) }
}

export async function loginWithEmailPassword({ email, password }) {
	const auth = getFirebaseAuth()
	const credential = await signInWithEmailAndPassword(auth, String(email).trim(), String(password))
	const token = await credential.user.getIdToken()
	setAuthSession({ token, user: pickUser(credential.user) })
	return { token, user: pickUser(credential.user) }
}

export async function logout() {
	let auth
	try {
		auth = getFirebaseAuth()
	} catch {
		clearAuthSession()
		return
	}
	await signOut(auth)
	clearAuthSession()
}

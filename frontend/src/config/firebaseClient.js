/**
 * Firebase client initialization (frontend).
 *
 * Requires Vite env vars:
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_APP_ID
 *
 * Optional:
 * - VITE_FIREBASE_STORAGE_BUCKET
 * - VITE_FIREBASE_MESSAGING_SENDER_ID
 */

import { initializeApp, getApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

function readFirebaseConfig() {
	return {
		apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
		authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
		projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
		appId: import.meta.env.VITE_FIREBASE_APP_ID,
		storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
		messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	}
}

function hasRequiredFirebaseConfig(config) {
	return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId)
}

export function getFirebaseApp() {
	const config = readFirebaseConfig()
	if (!hasRequiredFirebaseConfig(config)) {
		throw new Error(
			'Firebase client is not configured. Set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID.'
		)
	}

	if (getApps().length) return getApp()
	return initializeApp(config)
}

export function getFirebaseAuth() {
	return getAuth(getFirebaseApp())
}

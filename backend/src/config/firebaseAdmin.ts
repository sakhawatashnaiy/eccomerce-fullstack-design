/**
 * Firebase Admin SDK initialization.
 * Reads service account JSON from environment and exposes reusable instances.
 */

const admin = require('firebase-admin')
const { env } = require('./env')

let app

function parseServiceAccountFromEnv() {
	if (env.firebaseServiceAccount) {
		try {
			return JSON.parse(env.firebaseServiceAccount)
		} catch (_error) {
			throw new Error(
				'FIREBASE_SERVICE_ACCOUNT must be valid JSON. If using multiline private_key, escape newlines as \\n or use split vars FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.'
			)
		}
	}

	if (env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey) {
		return {
			project_id: env.firebaseProjectId,
			client_email: env.firebaseClientEmail,
			private_key: env.firebasePrivateKey,
			private_key_id: env.firebasePrivateKeyId || undefined,
		}
	}

	throw new Error(
		'Missing Firebase credentials. Set FIREBASE_SERVICE_ACCOUNT (full JSON) or set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.'
	)
}

function getFirebaseAdmin() {
	if (app) return { admin, app, auth: admin.auth(), db: admin.firestore() }

	const serviceAccount = parseServiceAccountFromEnv()

	app = admin.apps.length
		? admin.app()
		: admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })

	console.log('✅ Firebase connected successfully')

	return { admin, app, auth: admin.auth(), db: admin.firestore() }
}

module.exports = { getFirebaseAdmin }

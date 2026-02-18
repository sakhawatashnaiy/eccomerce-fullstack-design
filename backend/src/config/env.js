/**
 * Environment configuration.
 * Centralizes and validates required environment variables.
 */

require('dotenv').config()

function normalizeEnvValue(value = '') {
	return String(value).trim().replace(/,$/, '').replace(/^"([\s\S]*)"$/, '$1')
}

const env = {
	port: Number(process.env.PORT || 5000),
	nodeEnv: process.env.NODE_ENV || 'development',
	cloudinaryCloudName: normalizeEnvValue(process.env.CLOUDINARY_CLOUD_NAME || ''),
	cloudinaryApiKey: normalizeEnvValue(process.env.CLOUDINARY_API_KEY || ''),
	cloudinaryApiSecret: normalizeEnvValue(process.env.CLOUDINARY_API_SECRET || ''),
	firebaseServiceAccount: normalizeEnvValue(process.env.FIREBASE_SERVICE_ACCOUNT || ''),
	firebaseProjectId: normalizeEnvValue(process.env.FIREBASE_PROJECT_ID || ''),
	firebaseClientEmail: normalizeEnvValue(process.env.FIREBASE_CLIENT_EMAIL || ''),
	firebasePrivateKey: normalizeEnvValue(process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
	firebasePrivateKeyId: normalizeEnvValue(process.env.FIREBASE_PRIVATE_KEY_ID || ''),
}

module.exports = { env }

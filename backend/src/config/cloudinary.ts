/**
 * Cloudinary configuration and upload helpers.
 */

const { v2: cloudinary } = require('cloudinary')
const { env } = require('./env')

const DEFAULT_UPLOAD_TIMEOUT_MS = 60_000
// Rough guardrail: base64 data URLs are ~33% larger than the raw bytes.
// Keeping this conservative avoids slow uploads and oversized request bodies.
const MAX_DATA_URI_CHARS = 15_000_000

let configured = false

function ensureCloudinaryConfig() {
	if (configured) return

	if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
		const error = new Error(
			'Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.'
		)
		error.status = 500
		throw error
	}

	cloudinary.config({
		cloud_name: env.cloudinaryCloudName,
		api_key: env.cloudinaryApiKey,
		api_secret: env.cloudinaryApiSecret,
		secure: true,
		timeout: DEFAULT_UPLOAD_TIMEOUT_MS,
	})

	configured = true
}

function isDataUriImage(value = '') {
	return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(String(value).trim())
}

function withTimeout(promise: Promise<any>, timeoutMs: number, label: string) {
	const ms = Number(timeoutMs) > 0 ? Number(timeoutMs) : DEFAULT_UPLOAD_TIMEOUT_MS
	return Promise.race([
		promise,
		new Promise((_, reject) => {
			setTimeout(() => {
				const error = new Error(`${label} timed out after ${ms}ms`)
				error.status = 504
				reject(error)
			}, ms)
		}),
	])
}

function assertUploadableImageString(value: string) {
	const text = String(value || '').trim()
	if (!text) return

	if (isDataUriImage(text) && text.length > MAX_DATA_URI_CHARS) {
		const error = new Error('Image is too large. Please upload a smaller image (or compress it before uploading).')
		error.status = 413
		throw error
	}
}

async function uploadImageToCloudinary(
	file: string,
	options: { folder?: string; timeoutMs?: number } = {}
) {
	ensureCloudinaryConfig()
	assertUploadableImageString(file)

	const timeoutMs = options.timeoutMs ?? DEFAULT_UPLOAD_TIMEOUT_MS

	const result = await withTimeout(
		cloudinary.uploader.upload(file, {
			folder: options.folder || 'products',
			resource_type: 'image',
			unique_filename: true,
			overwrite: true,
		}),
		timeoutMs,
		'Cloudinary upload'
	)

	return {
		url: result.secure_url,
		publicId: result.public_id,
	}
}

module.exports = {
	isDataUriImage,
	uploadImageToCloudinary,
}

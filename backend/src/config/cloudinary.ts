/**
 * Cloudinary configuration and upload helpers.
 */

import { v2 as cloudinary } from 'cloudinary'
import { env } from './env'

const DEFAULT_UPLOAD_TIMEOUT_MS = 60_000
const MAX_DATA_URI_CHARS = 15_000_000

let configured = false

interface CloudinaryError extends Error {
	status?: number
}

function ensureCloudinaryConfig(): void {
	if (configured) return

	if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
		const error: CloudinaryError = new Error(
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

function isDataUriImage(value: string = ''): boolean {
	return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(String(value).trim())
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
	const ms = Number(timeoutMs) > 0 ? Number(timeoutMs) : DEFAULT_UPLOAD_TIMEOUT_MS
	return Promise.race<T>([
		promise,
		new Promise((_, reject) => {
			setTimeout(() => {
				const error: CloudinaryError = new Error(`${label} timed out after ${ms}ms`)
				error.status = 504
				reject(error)
			}, ms)
		}),
	])
}

function assertUploadableImageString(value: string): void {
	const text = String(value || '').trim()
	if (!text) return

	if (isDataUriImage(text) && text.length > MAX_DATA_URI_CHARS) {
		const error: CloudinaryError = new Error('Image is too large. Please upload a smaller image (or compress it before uploading).')
		error.status = 413
		throw error
	}
}

interface UploadOptions {
	folder?: string
	timeoutMs?: number
}

interface UploadResult {
	url: string
	publicId: string
}

async function uploadImageToCloudinary(
	file: string,
	options: UploadOptions = {}
): Promise<UploadResult> {
	ensureCloudinaryConfig()
	assertUploadableImageString(file)

	const timeoutMs = options.timeoutMs ?? DEFAULT_UPLOAD_TIMEOUT_MS

	const result = await withTimeout(
		cloudinary.uploader.upload(file, {
			folder: options.folder || 'products',
			resource_type: 'image' as const,
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

export { isDataUriImage, uploadImageToCloudinary }

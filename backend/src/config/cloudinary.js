/**
 * Cloudinary configuration and upload helpers.
 */

const { v2: cloudinary } = require('cloudinary')
const { env } = require('./env')

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
	})

	configured = true
}

function isDataUriImage(value = '') {
	return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(String(value).trim())
}

async function uploadImageToCloudinary(file, options = {}) {
	ensureCloudinaryConfig()

	const result = await cloudinary.uploader.upload(file, {
		folder: options.folder || 'products',
		resource_type: 'image',
	})

	return {
		url: result.secure_url,
		publicId: result.public_id,
	}
}

module.exports = {
	isDataUriImage,
	uploadImageToCloudinary,
}

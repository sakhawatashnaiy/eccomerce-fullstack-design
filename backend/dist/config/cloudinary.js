"use strict";
/**
 * Cloudinary configuration and upload helpers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDataUriImage = isDataUriImage;
exports.uploadImageToCloudinary = uploadImageToCloudinary;
const cloudinary_1 = require("cloudinary");
const env_1 = require("./env");
const DEFAULT_UPLOAD_TIMEOUT_MS = 60000;
const MAX_DATA_URI_CHARS = 15000000;
let configured = false;
function ensureCloudinaryConfig() {
    if (configured)
        return;
    if (!env_1.env.cloudinaryCloudName || !env_1.env.cloudinaryApiKey || !env_1.env.cloudinaryApiSecret) {
        const error = new Error('Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.');
        error.status = 500;
        throw error;
    }
    cloudinary_1.v2.config({
        cloud_name: env_1.env.cloudinaryCloudName,
        api_key: env_1.env.cloudinaryApiKey,
        api_secret: env_1.env.cloudinaryApiSecret,
        secure: true,
        timeout: DEFAULT_UPLOAD_TIMEOUT_MS,
    });
    configured = true;
}
function isDataUriImage(value = '') {
    return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(String(value).trim());
}
function withTimeout(promise, timeoutMs, label) {
    const ms = Number(timeoutMs) > 0 ? Number(timeoutMs) : DEFAULT_UPLOAD_TIMEOUT_MS;
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => {
                const error = new Error(`${label} timed out after ${ms}ms`);
                error.status = 504;
                reject(error);
            }, ms);
        }),
    ]);
}
function assertUploadableImageString(value) {
    const text = String(value || '').trim();
    if (!text)
        return;
    if (isDataUriImage(text) && text.length > MAX_DATA_URI_CHARS) {
        const error = new Error('Image is too large. Please upload a smaller image (or compress it before uploading).');
        error.status = 413;
        throw error;
    }
}
async function uploadImageToCloudinary(file, options = {}) {
    ensureCloudinaryConfig();
    assertUploadableImageString(file);
    const timeoutMs = options.timeoutMs ?? DEFAULT_UPLOAD_TIMEOUT_MS;
    const result = await withTimeout(cloudinary_1.v2.uploader.upload(file, {
        folder: options.folder || 'products',
        resource_type: 'image',
        unique_filename: true,
        overwrite: true,
    }), timeoutMs, 'Cloudinary upload');
    return {
        url: result.secure_url,
        publicId: result.public_id,
    };
}
//# sourceMappingURL=cloudinary.js.map
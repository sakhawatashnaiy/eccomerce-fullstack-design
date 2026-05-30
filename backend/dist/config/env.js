"use strict";
/**
 * Environment configuration.
 * Centralizes and validates required environment variables.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function normalizeEnvValue(value = '') {
    return String(value).trim().replace(/,$/, '').replace(/^"([\s\S]*)"$/, '$1');
}
exports.env = {
    port: Number(process.env.PORT || 5000),
    nodeEnv: process.env.NODE_ENV || 'development',
    adminUids: normalizeEnvValue(process.env.ADMIN_UIDS || process.env.VITE_ADMIN_UIDS || ''),
    adminEmails: normalizeEnvValue(process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || ''),
    cloudinaryCloudName: normalizeEnvValue(process.env.CLOUDINARY_CLOUD_NAME || ''),
    cloudinaryApiKey: normalizeEnvValue(process.env.CLOUDINARY_API_KEY || ''),
    cloudinaryApiSecret: normalizeEnvValue(process.env.CLOUDINARY_API_SECRET || ''),
    firebaseServiceAccount: normalizeEnvValue(process.env.FIREBASE_SERVICE_ACCOUNT || ''),
    firebaseProjectId: normalizeEnvValue(process.env.FIREBASE_PROJECT_ID || ''),
    firebaseClientEmail: normalizeEnvValue(process.env.FIREBASE_CLIENT_EMAIL || ''),
    firebasePrivateKey: normalizeEnvValue(process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    firebasePrivateKeyId: normalizeEnvValue(process.env.FIREBASE_PRIVATE_KEY_ID || ''),
};
//# sourceMappingURL=env.js.map
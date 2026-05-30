"use strict";
/**
 * Firebase Admin SDK initialization.
 * Reads service account JSON from environment and exposes reusable instances.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirebaseAdmin = getFirebaseAdmin;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const env_1 = require("./env");
let app;
function parseServiceAccountFromEnv() {
    if (env_1.env.firebaseServiceAccount) {
        try {
            return JSON.parse(env_1.env.firebaseServiceAccount);
        }
        catch (_error) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT must be valid JSON. If using multiline private_key, escape newlines as \\n or use split vars FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.');
        }
    }
    if (env_1.env.firebaseProjectId && env_1.env.firebaseClientEmail && env_1.env.firebasePrivateKey) {
        return {
            project_id: env_1.env.firebaseProjectId,
            client_email: env_1.env.firebaseClientEmail,
            private_key: env_1.env.firebasePrivateKey,
            private_key_id: env_1.env.firebasePrivateKeyId || undefined,
        };
    }
    throw new Error('Missing Firebase credentials. Set FIREBASE_SERVICE_ACCOUNT (full JSON) or set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.');
}
function getFirebaseAdmin() {
    if (app)
        return { admin: firebase_admin_1.default, app, auth: firebase_admin_1.default.auth(), db: firebase_admin_1.default.firestore() };
    const serviceAccount = parseServiceAccountFromEnv();
    app = firebase_admin_1.default.apps.length
        ? firebase_admin_1.default.app()
        : firebase_admin_1.default.initializeApp({ credential: firebase_admin_1.default.credential.cert(serviceAccount) });
    console.log('✅ Firebase connected successfully');
    return { admin: firebase_admin_1.default, app, auth: firebase_admin_1.default.auth(), db: firebase_admin_1.default.firestore() };
}
//# sourceMappingURL=firebaseAdmin.js.map
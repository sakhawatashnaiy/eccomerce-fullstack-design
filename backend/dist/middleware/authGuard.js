"use strict";
/**
 * Firebase auth guard middleware.
 * Expects `Authorization: Bearer <idToken>` and attaches decoded user to `req.user`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authGuard = authGuard;
const firebaseAdmin_1 = require("../config/firebaseAdmin");
async function authGuard(req, _res, next) {
    try {
        const authHeader = req.headers.authorization || '';
        if (!authHeader.startsWith('Bearer ')) {
            const error = new Error('Missing or invalid authorization token');
            error.status = 401;
            throw error;
        }
        const token = authHeader.slice(7);
        const { auth } = (0, firebaseAdmin_1.getFirebaseAdmin)();
        const decoded = await auth.verifyIdToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        error.status = error.status || 401;
        next(error);
    }
}
//# sourceMappingURL=authGuard.js.map
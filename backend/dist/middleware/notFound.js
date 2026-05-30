"use strict";
/**
 * 404 middleware for unknown routes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
function notFound(req, res) {
    res.status(404).json({ ok: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}
//# sourceMappingURL=notFound.js.map
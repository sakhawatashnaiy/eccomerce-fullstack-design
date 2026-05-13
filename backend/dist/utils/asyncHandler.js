"use strict";
/**
 * Wraps async route handlers and forwards errors to Express error middleware.
 */
Object.defineProperty(exports, "__esModule", { value: true });
function asyncHandler(handler) {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}
module.exports = { asyncHandler };

"use strict";
/**
 * Global error middleware.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const env_1 = require("../config/env");
function errorHandler(err, _req, res, _next) {
    const status = Number(err.status || 500);
    const message = err.message || 'Internal server error';
    res.status(status).json({
        ok: false,
        message,
        ...(env_1.env.nodeEnv === 'development' ? { stack: err.stack } : {}),
    });
}
//# sourceMappingURL=errorHandler.js.map
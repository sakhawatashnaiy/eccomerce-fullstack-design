"use strict";
/**
 * Admin guard middleware.
 *
 * Kept for backwards compatibility.
 * Internally delegates to the generic RBAC middleware.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const { requireRoles } = require('./roleGuard');
const adminGuard = requireRoles(['admin']);
module.exports = { adminGuard };

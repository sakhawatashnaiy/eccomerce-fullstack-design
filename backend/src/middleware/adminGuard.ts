/**
 * Admin guard middleware.
 *
 * Kept for backwards compatibility.
 * Internally delegates to the generic RBAC middleware.
 */

const { requireRoles } = require('./roleGuard')

const adminGuard = requireRoles(['admin'])

module.exports = { adminGuard }

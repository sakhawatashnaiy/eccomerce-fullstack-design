/**
 * User routes.
 */

const { Router } = require('express')
const { authGuard } = require('../../middleware/authGuard')
const { requireSelfOrRoles } = require('../../middleware/roleGuard')
const { asyncHandler } = require('../../utils/asyncHandler')
const { getUserById } = require('./users.controller')

const router = Router()

router.get('/:uid', authGuard, requireSelfOrRoles({ param: 'uid', roles: ['admin'] }), asyncHandler(getUserById))

module.exports = router

/**
 * User routes.
 */

const { Router } = require('express')
const { authGuard } = require('../../middleware/authGuard')
const { asyncHandler } = require('../../utils/asyncHandler')
const { getUserById } = require('./users.controller')

const router = Router()

router.get('/:uid', authGuard, asyncHandler(getUserById))

module.exports = router

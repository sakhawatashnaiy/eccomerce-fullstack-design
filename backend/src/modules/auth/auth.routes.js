/**
 * Auth routes.
 */

const { Router } = require('express')
const { getMe } = require('./auth.controller')
const { authGuard } = require('../../middleware/authGuard')
const { asyncHandler } = require('../../utils/asyncHandler')

const router = Router()

router.get('/me', authGuard, asyncHandler(getMe))

module.exports = router

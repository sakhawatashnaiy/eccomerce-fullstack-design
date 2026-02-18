/**
 * Cart routes.
 */

const { Router } = require('express')
const { authGuard } = require('../../middleware/authGuard')
const { asyncHandler } = require('../../utils/asyncHandler')
const { getMyCart, upsertMyCartItem } = require('./cart.controller')

const router = Router()

router.get('/me', authGuard, asyncHandler(getMyCart))
router.post('/me/items', authGuard, asyncHandler(upsertMyCartItem))

module.exports = router

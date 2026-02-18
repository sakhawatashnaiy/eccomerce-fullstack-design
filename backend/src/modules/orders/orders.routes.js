/**
 * Order routes.
 */

const { Router } = require('express')
const { authGuard } = require('../../middleware/authGuard')
const { asyncHandler } = require('../../utils/asyncHandler')
const { listMyOrders, createMyOrder } = require('./orders.controller')

const router = Router()

router.get('/me', authGuard, asyncHandler(listMyOrders))
router.post('/me', authGuard, asyncHandler(createMyOrder))

module.exports = router

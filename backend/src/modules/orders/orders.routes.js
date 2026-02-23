/**
 * Order routes.
 */

const { Router } = require('express')
const { authGuard } = require('../../middleware/authGuard')
const { adminGuard } = require('../../middleware/adminGuard')
const { asyncHandler } = require('../../utils/asyncHandler')
const { listMyOrders, createMyOrder, listAllOrders, getOrder, patchOrder } = require('./orders.controller')

const router = Router()

router.get('/me', authGuard, asyncHandler(listMyOrders))
router.post('/me', authGuard, asyncHandler(createMyOrder))

// Admin
router.get('/admin', authGuard, adminGuard, asyncHandler(listAllOrders))
router.get('/admin/:id', authGuard, adminGuard, asyncHandler(getOrder))
router.patch('/admin/:id', authGuard, adminGuard, asyncHandler(patchOrder))

module.exports = router

/**
 * Coupons routes.
 */

const { Router } = require('express')
const { authGuard } = require('../../middleware/authGuard')
const { adminGuard } = require('../../middleware/adminGuard')
const { asyncHandler } = require('../../utils/asyncHandler')
const { postValidateCoupon, adminUpsertCoupon, adminListCoupons } = require('./coupons.controller')

const router = Router()

router.post('/validate', authGuard, asyncHandler(postValidateCoupon))

// Admin management (optional UI later)
router.get('/admin', authGuard, adminGuard, asyncHandler(adminListCoupons))
router.post('/admin', authGuard, adminGuard, asyncHandler(adminUpsertCoupon))

module.exports = router

/**
 * API v1 route aggregator.
 */

const { Router } = require('express')

const authRoutes = require('../modules/auth/auth.routes')
const userRoutes = require('../modules/users/users.routes')
const productRoutes = require('../modules/products/products.routes')
const cartRoutes = require('../modules/cart/cart.routes')
const orderRoutes = require('../modules/orders/orders.routes')
const wishlistRoutes = require('../modules/wishlist/wishlist.routes')
const couponsRoutes = require('../modules/coupons/coupons.routes')
const sellersRoutes = require('../modules/sellers/sellers.routes')

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/products', productRoutes)
router.use('/cart', cartRoutes)
router.use('/orders', orderRoutes)
router.use('/wishlist', wishlistRoutes)
router.use('/coupons', couponsRoutes)
router.use('/sellers', sellersRoutes)

module.exports = router

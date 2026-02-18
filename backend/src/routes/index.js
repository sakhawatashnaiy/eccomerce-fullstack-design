/**
 * API v1 route aggregator.
 */

const { Router } = require('express')

const authRoutes = require('../modules/auth/auth.routes')
const userRoutes = require('../modules/users/users.routes')
const productRoutes = require('../modules/products/products.routes')
const cartRoutes = require('../modules/cart/cart.routes')
const orderRoutes = require('../modules/orders/orders.routes')

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/products', productRoutes)
router.use('/cart', cartRoutes)
router.use('/orders', orderRoutes)

module.exports = router

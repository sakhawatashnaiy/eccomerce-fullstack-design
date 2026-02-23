/**
 * Product routes.
 */

const { Router } = require('express')
const { authGuard } = require('../../middleware/authGuard')
const { adminGuard } = require('../../middleware/adminGuard')
const { asyncHandler } = require('../../utils/asyncHandler')
const {
	listProducts,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct,
	seedProducts,
} = require('./products.controller')

const router = Router()

router.get('/', asyncHandler(listProducts))
router.post('/', authGuard, adminGuard, asyncHandler(createProduct))
router.post('/seed', authGuard, adminGuard, asyncHandler(seedProducts))
router.get('/:id', asyncHandler(getProductById))
router.put('/:id', authGuard, adminGuard, asyncHandler(updateProduct))
router.delete('/:id', authGuard, adminGuard, asyncHandler(deleteProduct))

module.exports = router

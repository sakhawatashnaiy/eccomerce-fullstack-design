/**
 * Product routes.
 */

const { Router } = require('express')
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
router.post('/', asyncHandler(createProduct))
router.post('/seed', asyncHandler(seedProducts))
router.get('/:id', asyncHandler(getProductById))
router.put('/:id', asyncHandler(updateProduct))
router.delete('/:id', asyncHandler(deleteProduct))

module.exports = router

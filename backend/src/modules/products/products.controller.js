/**
 * Products controller.
 */

const {
	readAllProducts,
	readProductById,
	createProductDoc,
	updateProductDoc,
	deleteProductDoc,
	seedProductCollection,
} = require('./products.service')

async function listProducts(req, res) {
	const data = await readAllProducts(req.query)
	res.status(200).json({ ok: true, data })
}

async function getProductById(req, res) {
	const data = await readProductById(req.params.id)
	res.status(200).json({ ok: true, data })
}

function validatePayload(payload, { partial = false } = {}) {
	const required = ['name', 'price', 'image', 'description', 'category', 'stocks']
	if (!partial) {
		for (const key of required) {
			if (payload?.[key] === undefined || payload?.[key] === null || payload?.[key] === '') {
				const error = new Error(`${key} is required`)
				error.status = 400
				throw error
			}
		}
	}
}

async function createProduct(req, res) {
	validatePayload(req.body)
	const data = await createProductDoc(req.body)
	res.status(201).json({ ok: true, data })
}

async function updateProduct(req, res) {
	validatePayload(req.body, { partial: true })
	const data = await updateProductDoc(req.params.id, req.body)
	res.status(200).json({ ok: true, data })
}

async function deleteProduct(req, res) {
	const data = await deleteProductDoc(req.params.id)
	res.status(200).json({ ok: true, data })
}

async function seedProducts(_req, res) {
	const data = await seedProductCollection()
	res.status(200).json({ ok: true, data })
}

module.exports = {
	listProducts,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct,
	seedProducts,
}

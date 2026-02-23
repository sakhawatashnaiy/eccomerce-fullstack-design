/**
 * Orders controller.
 */

const {
	readOrdersByUser,
	readAllOrders,
	readOrderById,
	createOrderForUser,
	updateOrderById,
} = require('./orders.service')

async function listMyOrders(req, res) {
	const data = await readOrdersByUser(req.user.uid)
	res.status(200).json({ ok: true, data })
}

async function createMyOrder(req, res) {
	const data = await createOrderForUser(req.user.uid, req.body)
	res.status(201).json({ ok: true, data })
}

async function listAllOrders(req, res) {
	const data = await readAllOrders()
	res.status(200).json({ ok: true, data })
}

async function getOrder(req, res) {
	const data = await readOrderById(req.params.id)
	res.status(200).json({ ok: true, data })
}

async function patchOrder(req, res) {
	const data = await updateOrderById(req.params.id, req.body)
	res.status(200).json({ ok: true, data })
}

module.exports = { listMyOrders, createMyOrder, listAllOrders, getOrder, patchOrder }

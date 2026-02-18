/**
 * Orders controller.
 */

const { readOrdersByUser, createOrderForUser } = require('./orders.service')

async function listMyOrders(req, res) {
	const data = await readOrdersByUser(req.user.uid)
	res.status(200).json({ ok: true, data })
}

async function createMyOrder(req, res) {
	const data = await createOrderForUser(req.user.uid, req.body)
	res.status(201).json({ ok: true, data })
}

module.exports = { listMyOrders, createMyOrder }

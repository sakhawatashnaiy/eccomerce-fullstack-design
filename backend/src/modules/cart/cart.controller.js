/**
 * Cart controller.
 */

const { readCartByUser, upsertCartItem } = require('./cart.service')

async function getMyCart(req, res) {
	const data = await readCartByUser(req.user.uid)
	res.status(200).json({ ok: true, data })
}

async function upsertMyCartItem(req, res) {
	const data = await upsertCartItem(req.user.uid, req.body)
	res.status(200).json({ ok: true, data })
}

module.exports = { getMyCart, upsertMyCartItem }

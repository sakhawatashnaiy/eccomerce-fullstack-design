/**
 * Coupons controller.
 */

const { validateCoupon, createOrUpdateCoupon, listCoupons } = require('./coupons.service')

async function postValidateCoupon(req, res) {
	const { code, subtotal } = req.body || {}
	const data = await validateCoupon(code, subtotal)
	res.status(200).json({ ok: true, data })
}

async function adminUpsertCoupon(req, res) {
	const data = await createOrUpdateCoupon(req.body)
	res.status(201).json({ ok: true, data })
}

async function adminListCoupons(_req, res) {
	const data = await listCoupons()
	res.status(200).json({ ok: true, data })
}

module.exports = { postValidateCoupon, adminUpsertCoupon, adminListCoupons }

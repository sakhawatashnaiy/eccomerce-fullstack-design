/**
 * Wishlist controller.
 */

const {
	readWishlistProductIds,
	addWishlistItem,
	removeWishlistItem,
} = require('./wishlist.service')

async function getMyWishlist(req, res) {
	const data = await readWishlistProductIds(req.user.uid)
	res.status(200).json({ ok: true, data })
}

async function putMyWishlistItem(req, res) {
	const data = await addWishlistItem(req.user.uid, req.params.productId)
	res.status(200).json({ ok: true, data })
}

async function deleteMyWishlistItem(req, res) {
	const data = await removeWishlistItem(req.user.uid, req.params.productId)
	res.status(200).json({ ok: true, data })
}

module.exports = { getMyWishlist, putMyWishlistItem, deleteMyWishlistItem }

"use strict";
/**
 * Wishlist routes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const { Router } = require('express');
const { authGuard } = require('../../middleware/authGuard');
const { asyncHandler } = require('../../utils/asyncHandler');
const { getMyWishlist, putMyWishlistItem, deleteMyWishlistItem } = require('./wishlist.controller');
const router = Router();
router.get('/me', authGuard, asyncHandler(getMyWishlist));
router.put('/me/:productId', authGuard, asyncHandler(putMyWishlistItem));
router.delete('/me/:productId', authGuard, asyncHandler(deleteMyWishlistItem));
module.exports = router;
//# sourceMappingURL=wishlist.routes.js.map
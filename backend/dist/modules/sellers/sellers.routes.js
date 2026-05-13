"use strict";
/**
 * Sellers routes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const { Router } = require('express');
const { authGuard } = require('../../middleware/authGuard');
const { adminGuard } = require('../../middleware/adminGuard');
const { asyncHandler } = require('../../utils/asyncHandler');
const { getSeller, getSellerProducts, adminListSellers, adminUpsertSeller } = require('./sellers.controller');
const router = Router();
router.get('/admin/list', authGuard, adminGuard, asyncHandler(adminListSellers));
router.post('/admin', authGuard, adminGuard, asyncHandler(adminUpsertSeller));
router.get('/:id', asyncHandler(getSeller));
router.get('/:id/products', asyncHandler(getSellerProducts));
module.exports = router;

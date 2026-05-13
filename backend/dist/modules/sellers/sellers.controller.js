"use strict";
/**
 * Sellers controller.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const { readSellerById, upsertSeller, listSellers } = require('./sellers.service');
const { readAllProducts } = require('../products/products.service');
async function getSeller(req, res) {
    const data = await readSellerById(req.params.id);
    res.status(200).json({ ok: true, data });
}
async function getSellerProducts(req, res) {
    const sellerId = String(req.params.id || '').trim();
    const data = await readAllProducts({ sellerId });
    res.status(200).json({ ok: true, data });
}
async function adminListSellers(_req, res) {
    const data = await listSellers();
    res.status(200).json({ ok: true, data });
}
async function adminUpsertSeller(req, res) {
    const data = await upsertSeller(req.body);
    res.status(201).json({ ok: true, data });
}
module.exports = { getSeller, getSellerProducts, adminListSellers, adminUpsertSeller };

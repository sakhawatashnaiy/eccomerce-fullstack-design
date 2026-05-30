"use strict";
/**
 * Coupons service.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const { getFirebaseAdmin } = require('../../config/firebaseAdmin');
function normalizeCode(value) {
    return String(value || '').trim().toUpperCase();
}
function parseDate(value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}
function toMoneyInt(value) {
    const n = Math.round(Number(value) || 0);
    return Number.isFinite(n) ? n : 0;
}
async function readCouponByCode(code) {
    const { db } = getFirebaseAdmin();
    const normalized = normalizeCode(code);
    if (!normalized) {
        const error = new Error('code is required');
        error.status = 400;
        throw error;
    }
    const doc = await db.collection('coupons').doc(normalized).get();
    if (!doc.exists)
        return null;
    return { id: doc.id, ...doc.data() };
}
function validateCouponDoc(coupon, { subtotal }) {
    if (!coupon)
        return { ok: false, reason: 'Invalid code' };
    if (coupon.active === false)
        return { ok: false, reason: 'Coupon is inactive' };
    const now = new Date();
    if (coupon.expiresAt) {
        const exp = parseDate(coupon.expiresAt);
        if (exp && exp.getTime() < now.getTime())
            return { ok: false, reason: 'Coupon is expired' };
    }
    const minSubtotal = toMoneyInt(coupon.minSubtotal);
    if (minSubtotal > 0 && toMoneyInt(subtotal) < minSubtotal) {
        return { ok: false, reason: `Minimum subtotal is ${minSubtotal}` };
    }
    const amountOff = toMoneyInt(coupon.amountOff);
    if (amountOff <= 0)
        return { ok: false, reason: 'Coupon has no discount' };
    const applied = Math.max(0, Math.min(amountOff, toMoneyInt(subtotal)));
    return {
        ok: true,
        amountOff: applied,
        code: coupon.code || coupon.id,
        minSubtotal,
        expiresAt: coupon.expiresAt || null,
    };
}
async function validateCoupon(code, subtotal) {
    const coupon = await readCouponByCode(code);
    return validateCouponDoc(coupon, { subtotal });
}
async function createOrUpdateCoupon(payload = {}) {
    const { db } = getFirebaseAdmin();
    const code = normalizeCode(payload.code);
    if (!code) {
        const error = new Error('code is required');
        error.status = 400;
        throw error;
    }
    const doc = {
        code,
        active: payload.active !== false,
        amountOff: toMoneyInt(payload.amountOff),
        minSubtotal: toMoneyInt(payload.minSubtotal),
        expiresAt: payload.expiresAt ? new Date(payload.expiresAt).toISOString() : null,
        updatedAt: new Date().toISOString(),
        createdAt: payload.createdAt || new Date().toISOString(),
    };
    await db.collection('coupons').doc(code).set(doc, { merge: true });
    return doc;
}
async function listCoupons() {
    const { db } = getFirebaseAdmin();
    const snapshot = await db.collection('coupons').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}
module.exports = { validateCoupon, createOrUpdateCoupon, listCoupons };
//# sourceMappingURL=coupons.service.js.map
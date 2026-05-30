"use strict";
/**
 * Wishlist service.
 * Stores per-user wishlist items in Firestore.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const { getFirebaseAdmin } = require('../../config/firebaseAdmin');
function normalizeProductId(value) {
    return String(value || '').trim();
}
async function readWishlistProductIds(uid) {
    const { db } = getFirebaseAdmin();
    const snapshot = await db.collection('wishlists').doc(uid).collection('items').get();
    return snapshot.docs.map((doc) => doc.id);
}
async function addWishlistItem(uid, productId) {
    const { db } = getFirebaseAdmin();
    const id = normalizeProductId(productId);
    if (!id) {
        const error = new Error('productId is required');
        error.status = 400;
        throw error;
    }
    const ref = db.collection('wishlists').doc(uid).collection('items').doc(id);
    await ref.set({ productId: id, createdAt: new Date().toISOString() }, { merge: true });
    return { productId: id, active: true };
}
async function removeWishlistItem(uid, productId) {
    const { db } = getFirebaseAdmin();
    const id = normalizeProductId(productId);
    if (!id) {
        const error = new Error('productId is required');
        error.status = 400;
        throw error;
    }
    const ref = db.collection('wishlists').doc(uid).collection('items').doc(id);
    await ref.delete();
    return { productId: id, active: false };
}
module.exports = { readWishlistProductIds, addWishlistItem, removeWishlistItem };
//# sourceMappingURL=wishlist.service.js.map
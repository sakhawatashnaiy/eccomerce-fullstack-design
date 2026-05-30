"use strict";
/**
 * Auth service.
 * Ensures a Firestore user profile exists for Firebase-authenticated users.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOrCreateUserProfile = findOrCreateUserProfile;
const { getFirebaseAdmin } = require('../../config/firebaseAdmin');
async function findOrCreateUserProfile(decodedUser) {
    const { db } = getFirebaseAdmin();
    const userRef = db.collection('users').doc(decodedUser.uid);
    const snapshot = await userRef.get();
    if (!snapshot.exists) {
        const profile = {
            uid: decodedUser.uid,
            email: decodedUser.email || null,
            displayName: decodedUser.name || null,
            photoURL: decodedUser.picture || null,
            role: 'customer',
            createdAt: new Date().toISOString(),
        };
        await userRef.set(profile);
        return profile;
    }
    return snapshot.data();
}
//# sourceMappingURL=auth.service.js.map
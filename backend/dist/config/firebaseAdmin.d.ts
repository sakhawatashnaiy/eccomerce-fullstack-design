/**
 * Firebase Admin SDK initialization.
 * Reads service account JSON from environment and exposes reusable instances.
 */
import admin from 'firebase-admin';
interface FirebaseServices {
    admin: typeof admin;
    app: admin.app.App;
    auth: admin.auth.Auth;
    db: admin.firestore.Firestore;
}
declare function getFirebaseAdmin(): FirebaseServices;
export { getFirebaseAdmin };
//# sourceMappingURL=firebaseAdmin.d.ts.map
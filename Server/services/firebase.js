// Server/services/firebase.js
// Firebase Admin SDK — initialised once (singleton) for the entire server.
// Used to verify Google ID tokens sent from the frontend.

const admin = require("firebase-admin");

// Guard: avoid re-initialising if the module is hot-reloaded in dev
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Render / Vercel stores private keys with literal \n — replace them back
      privateKey: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        : undefined,
    }),
  });
}

const firebaseAdmin = admin;

/**
 * Verify a Firebase ID token (sent from the frontend after Google sign-in).
 * Returns the decoded token payload which contains uid, email, name, picture, etc.
 *
 * @param {string} idToken  — the raw ID token string from the client
 * @returns {Promise<admin.auth.DecodedIdToken>}
 */
const verifyFirebaseToken = async (idToken) => {
  const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
  return decodedToken;
};

module.exports = { firebaseAdmin, verifyFirebaseToken };

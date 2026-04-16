// Server/services/authApi.js
// Server-side auth helpers — token verification utilities using Firebase Admin.
// These are used by the backend controllers/middleware (not the frontend).

const { verifyFirebaseToken } = require("./firebase");

/**
 * Verify the Firebase Google ID token sent by the frontend.
 * Returns a clean user-info object on success, throws on failure.
 *
 * Usage (in a controller or middleware):
 *   const googleUser = await verifyGoogleIdToken(req.body.idToken);
 *
 * @param {string} idToken — Firebase ID token from frontend
 * @returns {{ uid, email, name, picture, emailVerified }}
 */
const verifyGoogleIdToken = async (idToken) => {
  if (!idToken) throw new Error("ID token is required");

  const decoded = await verifyFirebaseToken(idToken);

  if (!decoded.email) throw new Error("Email not found in token");

  return {
    uid: decoded.uid,
    email: decoded.email,
    name: decoded.name || decoded.email.split("@")[0],
    picture: decoded.picture || "",
    emailVerified: decoded.email_verified === true,
  };
};

module.exports = { verifyGoogleIdToken };

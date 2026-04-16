// client/src/services/firebase.js
// ⚠️  This file is intentionally empty.
// Firebase is NO LONGER initialised on the client via a separate service file.
// All Firebase logic (Google popup + ID token retrieval) is inlined directly
// inside GoogleLoginButton.jsx so a single component handles its own dependency.
// Server-side verification is done by Server/services/firebase.js (firebase-admin).

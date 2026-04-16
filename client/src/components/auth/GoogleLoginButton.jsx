// components/auth/GoogleLoginButton.jsx
//
// Self-contained Google login button.
// ─────────────────────────────────────────────────────────────────────────────
// Flow:
//   1. Initialise Firebase client SDK (singleton, inline — no service file needed)
//   2. Open Google sign-in popup via Firebase
//   3. Get the Firebase ID token  ← sent to our backend for server-side verification
//   4. POST /api/auth/google  { idToken }
//      Backend: Firebase Admin verifies idToken → creates/updates user → returns JWT
//   5. Store JWT + user in localStorage → call onSuccess()
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// ── Firebase client config (only needed for the Google popup) ─────────────────
// Values come from client/.env  (VITE_FIREBASE_* keys)
// The actual token verification is done server-side with firebase-admin.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Singleton — avoid "Firebase: already exists" error during Vite HMR
const firebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ── Backend base URL ──────────────────────────────────────────────────────────
const BASE_URL = "https://skillbarter-2.onrender.com/api";

// ── Icons ─────────────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg
    className="w-5 h-5 flex-shrink-0"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Spinner = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-slate-700 flex-shrink-0" />
);

// ── Component ──────────────────────────────────────────────────────────────────
/**
 * Props:
 *  onSuccess(data) — called with backend response { user, token, refreshToken }
 *  onError(msg)    — called with an error string
 *  label           — button text (default "Continue with Google")
 *  isDarkMode      — bool (default true)
 *  disabled        — bool
 */
export default function GoogleLoginButton({
  onSuccess,
  onError,
  label = "Continue with Google",
  isDarkMode = true,
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (loading || disabled) return;
    setLoading(true);

    try {
      // ── Step 1: Open Google popup via Firebase client SDK ────────────────
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // ── Step 2: Get the Firebase ID token ────────────────────────────────
      // This is a signed JWT issued by Google/Firebase — the server will
      // verify it using firebase-admin (Server/services/firebase.js).
      const idToken = await firebaseUser.getIdToken();

      // ── Step 3: Send only the ID token to our backend ────────────────────
      // The backend extracts name/email/photo/uid from the verified token.
      const res = await fetch(`${BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google login failed");

      // ── Step 4: Persist JWT ───────────────────────────────────────────────
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      // ── Step 5: Notify parent ─────────────────────────────────────────────
      if (onSuccess) onSuccess(data);
    } catch (err) {
      const msg =
        err?.code === "auth/popup-closed-by-user"
          ? "Sign-in popup was closed. Please try again."
          : err?.code === "auth/popup-blocked"
          ? "Pop-up was blocked by your browser. Please allow pop-ups for this site."
          : err?.code === "auth/network-request-failed"
          ? "Network error. Please check your connection and try again."
          : err?.code === "auth/cancelled-popup-request"
          ? "Another sign-in popup is already open."
          : err?.message || "Google sign-in failed. Please try again.";

      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const base = "relative w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold text-sm border transition-all duration-200 select-none";
  const dark = "bg-white/5 border-white/15 text-slate-200 hover:bg-white/10 hover:border-white/30 active:scale-[0.98] shadow-sm";
  const light = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] shadow-sm";
  const cls = `${base} ${isDarkMode ? dark : light} ${loading || disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`;

  return (
    <button
      type="button"
      id="google-login-btn"
      onClick={handleGoogleLogin}
      disabled={loading || disabled}
      className={cls}
      aria-label="Continue with Google"
    >
      {loading ? <Spinner /> : <GoogleIcon />}
      <span>{loading ? "Signing in…" : label}</span>
    </button>
  );
}

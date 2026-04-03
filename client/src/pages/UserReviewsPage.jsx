import { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearReviews } from "../redux/slices/reviewSlice";
import ReviewList from "../components/reviews/ReviewList";
import api from "../utils/api";
import { ThemeContext } from "../contexts/ThemeContext";

export default function UserReviewsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = useParams();
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext) || { theme: "dark" };
  const d = theme === "dark";

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = location.state?.userId || userId;

  useEffect(() => {
    if (!targetUserId) { navigate("/dashboard"); return; }
    dispatch(clearReviews());

    api.get(`/users/${targetUserId}`)
      .then((r) => setUser(r.data))
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [targetUserId, navigate, dispatch]);

  /* ── tokens ── */
  const pageBg = d ? "bg-[#080c17]" : "bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50";
  const cardBase = `rounded-2xl border ${d ? "bg-[#0d1525]/80 border-indigo-500/15" : "bg-white border-indigo-100 shadow-sm"}`;

  /* ── Loading ── */
  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse ${d ? "bg-indigo-500/8" : "bg-indigo-200/25"}`} />
        <div className={`absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse delay-1000 ${d ? "bg-violet-500/6" : "bg-violet-200/20"}`} />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-violet-500/20 border-b-violet-500 rounded-full animate-spin"
            style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
        </div>
        <div className="text-center">
          <p className={`font-semibold mb-1 ${d ? "text-indigo-400" : "text-indigo-600"}`}>Loading Reviews</p>
          <p className={d ? "text-slate-500" : "text-slate-400"}>Gathering feedback and testimonials…</p>
        </div>
      </div>
    </div>
  );

  /* ── Not Found ── */
  if (!user) return (
    <div className={`min-h-screen flex items-center justify-center ${pageBg}`}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse bg-red-500/6" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse delay-1000 bg-orange-500/5" />
      </div>
      <div className="relative z-10 text-center">
        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 ${d ? "bg-red-500/10" : "bg-red-50"}`}>
          <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <h2 className={`text-2xl font-bold mb-3 ${d ? "text-white" : "text-slate-900"}`}>User Not Found</h2>
        <p className={`max-w-md mx-auto mb-6 ${d ? "text-slate-400" : "text-slate-500"}`}>
          The requested user profile could not be located. Please verify the user ID and try again.
        </p>
        <button onClick={() => navigate(-1)}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all">
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen relative overflow-hidden ${pageBg}`}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse ${d ? "bg-indigo-500/8" : "bg-indigo-200/25"}`} />
        <div className={`absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse delay-1000 ${d ? "bg-violet-500/6" : "bg-violet-200/20"}`} />
        <div className={`absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl animate-pulse delay-500 ${d ? "bg-purple-500/4" : "bg-purple-100/25"}`} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Back ── */}
        <button onClick={() => navigate(-1)}
          className={`flex items-center gap-2 font-medium transition-colors ${d ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Back
        </button>

        {/* ── Profile Header ── */}
        <div className={`${cardBase} p-6 sm:p-8 relative overflow-hidden`}>
          {/* top accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-xl shadow-indigo-500/25">
                {user.profileImage
                  ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  : <span>{user.name?.charAt(0)?.toUpperCase() || "U"}</span>}
              </div>
              {/* Status dot */}
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                <div className="w-2.5 h-2.5 bg-emerald-300 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className={`text-3xl font-black mb-2 ${d ? "text-white" : "text-slate-900"}`}>
                Reviews for <span className={d ? "text-indigo-300" : "text-indigo-600"}>{user.name}</span>
              </h1>
              <p className={`mb-5 max-w-2xl ${d ? "text-slate-400" : "text-slate-500"}`}>
                Authentic feedback from community members who have experienced {user.name}'s expertise firsthand
              </p>

              {/* Badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2.5">
                <span className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border font-medium ${d ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-600"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  Verified Reviews
                </span>
                <span className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border font-medium ${d ? "bg-violet-500/10 border-violet-500/25 text-violet-300" : "bg-violet-50 border-violet-200 text-violet-600"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  Community Member
                </span>
                <span className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border font-medium ${d ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-600"}`}>
                  <div className="relative">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    <div className="absolute inset-0 w-2 h-2 bg-emerald-400/50 rounded-full animate-ping" />
                  </div>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Reviews Section ── */}
        <div className={`${cardBase} relative overflow-hidden`}>
          {/* top accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

          {/* Section Header */}
          <div className={`p-6 border-b ${d ? "border-indigo-500/10" : "border-indigo-100"} flex flex-col sm:flex-row items-center justify-between gap-3`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/25">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
              </div>
              <div>
                <h2 className={`text-lg font-bold ${d ? "text-white" : "text-slate-800"}`}>Community Reviews & Testimonials</h2>
                <p className={d ? "text-slate-400" : "text-slate-500"}>Real experiences shared by verified members</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border ${d ? "bg-emerald-500/10 border-emerald-500/25" : "bg-emerald-50 border-emerald-200"}`}>
              <div className="relative">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 bg-emerald-300/50 rounded-full animate-ping" />
              </div>
              <span className={`font-medium ${d ? "text-emerald-300" : "text-emerald-600"}`}>Live Feedback</span>
            </div>
          </div>

          {/* Reviews */}
          <div className="p-6">
            <ReviewList userId={targetUserId} showActions={false} showTitle={false} limit={10} />
          </div>
        </div>
      </div>
    </div>
  );
}
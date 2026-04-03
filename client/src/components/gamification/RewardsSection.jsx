// components/gamification/RewardsSection.jsx
import { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import { redeemReward } from "../../services/gamificationApi";
import { toast } from "react-toastify";

const REWARDS = [
  {
    id: "badge_pack",
    name: "Exclusive Badge Pack",
    description: "Unlock the 'Badge Collector' badge — limited edition!",
    icon: "🏅",
    cost: 500,
    type: "badge",
    color: "from-amber-500 to-orange-500",
    bgDark: "bg-amber-500/10 border-amber-500/20",
    bgLight: "bg-amber-50 border-amber-200",
    effect: "Adds Badge Collector badge to your profile",
    permanent: true,
  },
  {
    id: "xp_boost",
    name: "2× XP Boost",
    description: "Double your XP earnings for 24 hours",
    icon: "⚡",
    cost: 300,
    type: "boost",
    color: "from-yellow-400 to-amber-500",
    bgDark: "bg-yellow-500/10 border-yellow-500/20",
    bgLight: "bg-yellow-50 border-yellow-200",
    effect: "2× XP for 24 hours (stackable)",
    permanent: false,
  },
  {
    id: "bonus_credits",
    name: "Bonus Time Credits",
    description: "Earn 2 extra time credits for your wallet",
    icon: "💎",
    cost: 400,
    type: "credits",
    color: "from-cyan-400 to-blue-500",
    bgDark: "bg-cyan-500/10 border-cyan-500/20",
    bgLight: "bg-cyan-50 border-cyan-200",
    effect: "+2 Time Credits added to wallet",
    permanent: true,
  },
  {
    id: "profile_frame",
    name: "Golden Profile Frame",
    description: "Show off a golden frame around your avatar",
    icon: "🖼️",
    cost: 800,
    type: "cosmetic",
    color: "from-yellow-500 to-yellow-600",
    bgDark: "bg-yellow-600/10 border-yellow-600/20",
    bgLight: "bg-yellow-50 border-yellow-200",
    effect: "Golden frame shown on your public profile",
    permanent: true,
  },
  {
    id: "streak_shield",
    name: "Streak Shield",
    description: "Protect your streak for 1 missed day",
    icon: "🛡️",
    cost: 250,
    type: "shield",
    color: "from-violet-500 to-purple-600",
    bgDark: "bg-violet-500/10 border-violet-500/20",
    bgLight: "bg-violet-50 border-violet-200",
    effect: "Shield Bearer badge + streak protection",
    permanent: true,
  },
  {
    id: "mentor_tag",
    name: "Mentor Tag",
    description: "Show a 'Mentor' tag on your public profile",
    icon: "🧑‍🏫",
    cost: 1000,
    type: "cosmetic",
    color: "from-pink-500 to-rose-600",
    bgDark: "bg-pink-500/10 border-pink-500/20",
    bgLight: "bg-pink-50 border-pink-200",
    effect: "Mentor badge + tag shown on your profile & UserDetailPage",
    permanent: true,
  },
  {
    id: "crown_badge",
    name: "Crown Badge",
    description: "Prestige crown badge shown on your profile",
    icon: "👑",
    cost: 1500,
    type: "cosmetic",
    color: "from-amber-400 to-yellow-600",
    bgDark: "bg-amber-500/10 border-amber-500/20",
    bgLight: "bg-amber-50 border-amber-200",
    effect: "Crown Badge added to your profile permanently",
    permanent: true,
  },
];

export default function RewardsSection({ xp = 0, redeemedRewards = [], onRedeemSuccess }) {
  const { isDarkMode } = useTheme();
  const [loadingId, setLoadingId] = useState(null);
  const [localXp, setLocalXp] = useState(xp);
  const [localRedeemed, setLocalRedeemed] = useState(
    new Set((redeemedRewards || []).map(r => r.rewardId))
  );

  const handleRedeem = async (reward) => {
    if (loadingId) return;

    const canAfford = localXp >= reward.cost;
    if (!canAfford) {
      toast.error(`Not enough XP! You need ${reward.cost} XP.`);
      return;
    }

    if (reward.permanent && localRedeemed.has(reward.id)) {
      toast.warning("You already redeemed this reward!");
      return;
    }

    setLoadingId(reward.id);
    try {
      const res = await redeemReward(reward.id);
      if (res.success) {
        toast.success(res.message || `🎉 "${reward.name}" redeemed!`);
        setLocalXp(res.remainingXp);
        if (reward.permanent) {
          setLocalRedeemed(prev => new Set([...prev, reward.id]));
        }
        // Notify parent to refresh gamification data
        if (onRedeemSuccess) onRedeemSuccess(res);
      } else {
        toast.error(res.message || "Redeem failed");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to redeem. Try again.";
      toast.error(msg);
    } finally {
      setLoadingId(null);
    }
  };

  const typeLabel = {
    badge: "Badge Reward",
    boost: "24h Boost",
    credits: "Time Credits",
    cosmetic: "Profile Cosmetic",
    shield: "Streak Shield",
  };

  const typeColor = {
    badge: "text-amber-400",
    boost: "text-yellow-400",
    credits: "text-cyan-400",
    cosmetic: "text-pink-400",
    shield: "text-violet-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl border p-6 ${isDarkMode ? "bg-gray-900/80 border-white/10" : "bg-white border-gray-200"} shadow-lg`}>
        <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              🎁 Rewards Store
            </h2>
            <p className={`text-sm mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Spend your hard-earned XP on exclusive rewards, badges & cosmetics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${isDarkMode ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-amber-100 text-amber-600"}`}>
              ⚡ {localXp.toLocaleString()} XP available
            </div>
          </div>
        </div>

        {/* Redeemed count */}
        {localRedeemed.size > 0 && (
          <div className={`mt-3 flex items-center gap-2 text-sm ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>
            <span>✅</span>
            <span>{localRedeemed.size} reward{localRedeemed.size > 1 ? "s" : ""} redeemed</span>
          </div>
        )}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {REWARDS.map((reward) => {
          const canAfford = localXp >= reward.cost;
          const isRedeemed = reward.permanent && localRedeemed.has(reward.id);
          const isLoading = loadingId === reward.id;

          return (
            <div
              key={reward.id}
              className={`relative rounded-2xl border p-5 transition-all duration-300 ${
                isDarkMode ? reward.bgDark : reward.bgLight
              } ${isRedeemed
                ? "opacity-80 cursor-default"
                : canAfford
                  ? "hover:scale-105 hover:shadow-lg cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {/* Redeemed ribbon */}
              {isRedeemed && (
                <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isDarkMode ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-emerald-100 text-emerald-700 border border-emerald-200"}`}>
                  ✅ Redeemed
                </div>
              )}

              {/* Icon */}
              <div className="text-4xl mb-3 leading-none">{reward.icon}</div>

              {/* Type label */}
              <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${typeColor[reward.type] || "text-gray-400"}`}>
                {typeLabel[reward.type] || reward.type}
              </div>

              {/* Name */}
              <div className={`font-bold text-base mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {reward.name}
              </div>

              {/* Description */}
              <div className={`text-xs mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {reward.description}
              </div>

              {/* Effect info */}
              <div className={`text-[11px] font-medium mb-4 flex items-start gap-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                <span>→</span>
                <span>{reward.effect}</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto">
                <span className={`text-sm font-bold bg-gradient-to-r ${reward.color} bg-clip-text text-transparent`}>
                  {reward.cost.toLocaleString()} XP
                </span>

                <button
                  onClick={() => !isRedeemed && !isLoading && handleRedeem(reward)}
                  disabled={isLoading || (!canAfford && !isRedeemed)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isRedeemed
                      ? isDarkMode ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default" : "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                      : isLoading
                        ? "bg-white/10 text-gray-400 cursor-wait animate-pulse"
                        : canAfford
                          ? `bg-gradient-to-r ${reward.color} text-white hover:opacity-90 shadow-md active:scale-95`
                          : isDarkMode
                            ? "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-3 h-3 rounded-full border border-gray-400 border-t-transparent animate-spin" />
                      Redeeming…
                    </>
                  ) : isRedeemed ? (
                    "✅ Owned"
                  ) : canAfford ? (
                    "🎁 Redeem"
                  ) : (
                    "🔒 Need more XP"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Redemption History */}
      {redeemedRewards && redeemedRewards.length > 0 && (
        <div className={`rounded-2xl border p-5 ${isDarkMode ? "bg-gray-900/60 border-white/10" : "bg-white border-gray-200"}`}>
          <h3 className={`text-base font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            🧾 Redemption History
          </h3>
          <div className="space-y-2">
            {redeemedRewards.map((r, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl text-sm ${isDarkMode ? "bg-white/5" : "bg-gray-50"}`}>
                <div className="flex items-center gap-2">
                  <span>{REWARDS.find(rw => rw.id === r.rewardId)?.icon || "🎁"}</span>
                  <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>{r.rewardName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-red-400 font-semibold text-xs">-{r.xpSpent} XP</span>
                  <span className={`text-[10px] ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    {new Date(r.redeemedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className={`text-xs text-center ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>
        Coming soon: Daily spin wheel, seasonal rewards & XP multipliers 🚀
      </p>
    </div>
  );
}

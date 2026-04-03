// components/report/SafetyGuidelines.jsx
import { BookOpen, CheckCircle2, AlertTriangle, Shield, Users, MessageSquare, Star } from "lucide-react";

const GUIDELINES = [
  {
    icon: Shield,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
    title: "No Spam or Fraud",
    description: "Do not send unsolicited messages, advertise services, or engage in any fraudulent activity. All transactions must be honest and transparent.",
    examples: ["Sending repeated promotional messages", "Creating fake transactions", "Deceiving users about your skills"],
  },
  {
    icon: Users,
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/20",
    title: "No Harassment",
    description: "Treat every community member with respect. Harassment, threats, discrimination, or bullying of any kind will result in immediate action.",
    examples: ["Sending threatening messages", "Discriminatory language", "Persistent unwanted contact after rejection"],
  },
  {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    title: "Respect Community Guidelines",
    description: "Follow all platform rules to maintain a safe, productive environment. The community thrives when everyone contributes positively.",
    examples: ["Share genuine, helpful knowledge", "Give honest reviews", "Report violations promptly"],
  },
  {
    icon: Star,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
    title: "No Fake Profiles",
    description: "Use your real identity and provide accurate information. Impersonation, false credentials, and misleading profiles are strictly prohibited.",
    examples: ["Claiming false qualifications", "Impersonating other users", "Using fake profile photos"],
  },
  {
    icon: MessageSquare,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    title: "Appropriate Content Only",
    description: "All shared content must be professional, relevant, and appropriate for all users. No adult, violent, or harmful content.",
    examples: ["No adult or NSFW content", "No graphic violence", "No hate speech or extremism"],
  },
  {
    icon: AlertTriangle,
    color: "text-orange-500",
    bg: "bg-orange-500/10 border-orange-500/20",
    title: "Accurate Information",
    description: "Share only accurate, verifiable information. Spreading misinformation or misleading claims about skills, prices, or services is prohibited.",
    examples: ["False skill certification claims", "Misleading session prices", "Fake reviews or testimonials"],
  },
];

const ACTIONS_TABLE = [
  { offense: "First violation",     action: "Warning issued",              impact: "-10 Trust Score" },
  { offense: "Second violation",    action: "7-day suspension",            impact: "-20 Trust Score" },
  { offense: "Third violation",     action: "30-day suspension",           impact: "-30 Trust Score" },
  { offense: "Repeated violations", action: "Permanent ban",               impact: "Trust Score: 0" },
  { offense: "Severe offense",      action: "Immediate permanent ban",     impact: "Legal action possible" },
];

export default function SafetyGuidelines({ isDarkMode }) {
  const cardBase = isDarkMode ? "bg-gray-900/60 border-gray-800" : "bg-white border-gray-200 shadow-sm";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl border p-6 ${cardBase}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Safety Guidelines
            </h2>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
              Platform rules to maintain a safe, trustworthy community
            </p>
          </div>
        </div>
        <div className={`mt-4 px-4 py-3 rounded-xl border ${
          isDarkMode ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"
        }`}>
          <p className={`text-sm ${isDarkMode ? "text-emerald-300" : "text-emerald-700"}`}>
            ✅ By using SkillBarter, you agree to uphold these community standards. Violations are taken seriously and result in progressive disciplinary actions.
          </p>
        </div>
      </div>

      {/* Guidelines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {GUIDELINES.map(({ icon: Icon, color, bg, title, description, examples }) => (
          <div key={title} className={`rounded-2xl border p-5 ${cardBase} hover:scale-[1.01] transition-transform`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-base mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {title}
                </h3>
                <p className={`text-sm mb-3 leading-relaxed ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
                  {description}
                </p>
                <div className="space-y-1">
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? "text-slate-500" : "text-gray-400"}`}>
                    Examples of violations:
                  </p>
                  {examples.map((ex) => (
                    <div key={ex} className={`flex items-center gap-2 text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                      <span className="text-red-500 font-bold">✕</span>
                      {ex}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Consequence Table */}
      <div className={`rounded-2xl border overflow-hidden ${cardBase}`}>
        <div className={`px-5 py-3 border-b ${isDarkMode ? "border-gray-800 bg-gray-950/40" : "border-gray-100 bg-gray-50"}`}>
          <h3 className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            ⚖️ Enforcement Actions
          </h3>
        </div>
        <div className="divide-y divide-gray-800/20">
          {ACTIONS_TABLE.map(({ offense, action, impact }) => (
            <div
              key={offense}
              className={`grid grid-cols-3 gap-2 px-5 py-3 text-sm items-center ${
                isDarkMode ? "hover:bg-gray-800/30" : "hover:bg-gray-50"
              }`}
            >
              <span className={isDarkMode ? "text-slate-300" : "text-gray-700"}>{offense}</span>
              <span className={`font-semibold ${isDarkMode ? "text-amber-400" : "text-amber-600"}`}>{action}</span>
              <span className={`font-bold text-right ${
                impact.includes("0") ? "text-red-500" : "text-orange-500"
              }`}>{impact}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Appeal info */}
      <div className={`rounded-2xl border p-5 ${
        isDarkMode ? "bg-blue-900/10 border-blue-500/20" : "bg-blue-50 border-blue-200"
      }`}>
        <h3 className={`font-bold text-sm mb-2 ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
          📬 Appeal Process
        </h3>
        <p className={`text-sm ${isDarkMode ? "text-blue-200" : "text-blue-600"}`}>
          If you believe a moderation action taken against your account was incorrect, you can appeal by contacting our support team at{" "}
          <a href="mailto:safety@skillbarter.com" className="underline font-semibold hover:opacity-80">
            safety@skillbarter.com
          </a>
          . Please include your User ID and a detailed explanation. Appeals are reviewed within 3–5 business days.
        </p>
      </div>
    </div>
  );
}

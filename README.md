<div align="center">

# 🌉 SkillBarter

### *The Ultimate Peer-to-Peer Skill Exchange Platform*

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)
[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-skillbarter2.netlify.app-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://skillbarter2.netlify.app/)

**SkillBarter** is a full-stack MERN platform where people trade knowledge — teach what you know, learn what you want. SmartAlgorithm based smart matching, real-time communication, blockchain-inspired smart contracts, gamification, and a rich community ecosystem.

[🌐 Live Demo](#-live-demo) · [🚀 Quick Start](#-quick-start) · [📸 Screenshots](#-web-app-screenshots) · [🏗️ Architecture](#️-architecture--project-structure) · [📡 API Docs](#-api-endpoints) · [🤝 Contributing](#-contributing)

</div>

---

## 📚 Table of Contents

| Section | Description |
|---|---|
| [🌐 Live Demo](#-live-demo) | **Try the live app now** |
| [🚀 Features](#-features) | Full platform feature overview |
| [📸 Screenshots](#-web-app-screenshots) | App UI screenshots |
| [🏗️ Architecture](#️-architecture--project-structure) | Project & folder structure |
| [🛠️ Tech Stack](#️-tech-stack) | All technologies used |
| [🗺️ App Pages & Routes](#️-app-pages--routes) | Every page & route |
| [📡 API Endpoints](#-api-endpoints) | Complete REST API reference |
| [🗄️ Database Models](#️-database-models) | All MongoDB schemas |
| [🔌 Socket Events](#-real-time-socket-events) | WebSocket event reference |
| [🤖 Smart Matching](#-smart-matching-engine) | How matching works |
| [🔐 Authentication Flow](#-authentication-flow) | Auth & security flow |
| [🎛️ State Management](#️-state-management) | Redux store documentation |
| [🌙 Theme System](#-theme-system) | Dark/Light mode |
| [⚙️ Environment Variables](#️-environment-variables) | Full env config reference |
| [🚀 Quick Start](#-quick-start) | Setup & run instructions |
| [🔒 Security](#-security-features) | Security implementation |
| [🧪 Development](#-development) | Dev workflow |
| [🤝 Contributing](#-contributing) | How to contribute |

---

## 🌐 Live Demo

<div align="center">

### 🚀 The platform is live and fully deployed!

<a href="https://skillbarter2.netlify.app/" target="_blank">
  <img src="https://img.shields.io/badge/🌐_Open_Live_App-skillbarter2.netlify.app-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" alt="Live Demo" height="50"/>
</a>

&nbsp;

| | Details |
|---|---|
| 🔗 **URL** | [https://skillbarter2.netlify.app/](https://skillbarter2.netlify.app/) |
| ☁️ **Hosted on** | Netlify (Frontend) |
| ⚡ **Status** | ![Status](https://img.shields.io/website?url=https%3A%2F%2Fskillbarter2.netlify.app&style=flat-square&label=Status&up_message=Online&down_message=Offline) |
| 🔐 **Auth** | Register a free account or use guest access |
| 📱 **Mobile** | Fully responsive on all screen sizes |

> **Note:** The backend is hosted on a free-tier server — the first request after inactivity may take ~20–30 seconds to wake up (cold start). Subsequent requests will be fast.

</div>

---

## 🚀 Features

### Core Platform
| Feature | Description |
|---|---|
| 🤖 **Smart Matching** | Algorithm scores compatibility across skills, availability & history |
| 💬 **Real-time Chat** | Socket.io messaging with typing indicators, file sharing, voice notes & read receipts |
| 📹 **Video Meetings** | WebRTC-based meeting rooms with screen sharing, participants panel & recording |
| 📅 **Session Scheduling** | Book, manage, and track 1-on-1 skill sessions with calendar view |
| 📃 **Smart Contracts** | Blockchain-inspired skill contracts with milestone tracking |
| ⭐ **Reviews & Ratings** | Post-session peer reviews with detailed skill-specific ratings |

### Engagement & Community
| Feature | Description |
|---|---|
| 🏆 **Gamification** | XP points, badges, leaderboards, and achievements |
| ⚡ **Challenges** | Skill challenges with submissions, voting, and XP rewards |
| 🛤️ **Learning Paths** | Structured, curated multi-step skill learning journeys |
| 📚 **Learning Resources** | Community-contributed resource library with ratings |
| 🌐 **Community Feed** | Posts, likes, comments, and discussions |
| 👥 **Group Sessions** | Collaborative multi-user skill sharing sessions |

### Advanced Features
| Feature | Description |
|---|---|
| ✅ **Skill Verification** | Peer-verified skill badges with endorsements |
| 💰 **Time Banking** | Exchange hours as a currency for skill trades |
| 🔗 **Social Integration** | Social sharing, referrals, and external profiles |
| 🔔 **Smart Notifications** | Real-time + persistent notification center |
| 🧑‍💼 **Expert Profiles** | Detailed expert pages with skills, reviews & portfolios |
| 🛡️ **Report & Safety** | Content moderation and safety reporting system |
| 📊 **Admin Analytics** | Deep-dive dashboards for every platform module |

---

## 📸 Web-App Screenshots

### 🏠 Landing Page Experience
<div align="center">
  <img src="./screenshots/home_page_header.png" alt="SkillBarter Landing Page - Hero Section" width="800"/>
  <p><em>Hero section — animated calls-to-action & platform overview</em></p>
</div>

<div align="center">
  <img src="./screenshots/home_page_learning.png"alt="Landing Page - learning Section" width="800"/>
  <p><em>Realtime to chat, video call, screen sharing, file sharing, voice notes & read receipts</em></p>
</div>

<div align="center">
  <img src="./screenshots/home_page_feature.png" alt="Landing Page - feature Section" width="800"/>
  <p><em>Explore the features of the platform</em></p>
</div>

<div align="center">
  <img src="./screenshots/home_page_skillexpert.png" alt="Landing Page - Skill Expert" width="800"/>
  <p><em>Explore the skill expert of the platform</em></p>
</div>

<div align="center">
  <img src="./screenshots/home_page_footer.png" alt="Landing Page - Footer" width="800"/>
  <p><em>Footer of the platform</em></p>
</div>

---

### 🔐 Authentication Pages
<div align="center">
  <img src="./screenshots/register_page.png" alt="User Registration Page" width="800"/>
  <p><em>Sleek user registration with real-time validation</em></p>
</div>

<div align="center">
  <img src="./screenshots/login_page.png" alt="User Login Page" width="800"/>
  <p><em>Secure login with JWT authentication</em></p>
</div>

<div align="center">
  <img src="./screenshots/forgotpassword_page.png" alt="User Forgot Password Page" width="800"/>
  <p><em>Forgot password page</em></p>
</div>

---

### 🎯 Dashboard & Skill Management
<div align="center">
  <img src="./screenshots/dashboard_page.png" alt="User Dashboard" width="800"/>
  <p><em>Main dashboard — stats, recent matches, upcoming sessions & notifications</em></p>
</div>

<div align="center">
  <img src="./screenshots/skill_page.png" alt="Add Skill Interface" width="800"/>
  <p><em>Skill addition interface with categories and proficiency levels</em></p>
</div>

<div align="center">
  <img src="./screenshots/skillexpert_page.png" alt="Skill Expert Page" width="800"/>
  <p><em>Skill Expert Page</em></p>
</div>

---

### 👤 Profile & User Details
<div align="center">
  <img src="./screenshots/profile_page.png" alt="User Profile Page" width="800"/>
  <p><em>Rich user profile with skills, ratings, badges & session history</em></p>
</div>

---

### 🤖 Matche requests & Smart Matching
<div align="center">
  <img src="./screenshots/metches_page.png" alt="Matches & Smart Matching" width="800"/>
  <p><em>Match request inbox — sent, received, accepted & pending</em></p>
</div>

<div align="center">
  <img src="./screenshots/smart_matches_page.png" alt="Match Algorithm Results" width="800"/>
  <p><em>Advanced match results with skill overlap analysis</em></p>
</div>

---

### 💬 Real-time System
<div align="center">
  <img src="./screenshots/chat_page.png" alt="Real-time Chat Interface" width="800"/>
  <p><em>Interactive messaging — text, files, voice notes & emoji support</em></p>
</div>

<div align="center">
  <img src="./screenshots/meeting_page.png" alt="Meeting Page" width="800"/>
  <p><em>Meeting Page</em></p>
</div>

<div align="center">
  <img src="./screenshots/session_page.png" alt="Session Page" width="800"/>
  <p><em>Session Page</em></p>
</div>

<div align="center">
  <img src="./screenshots/contract_page.png" alt="Contract Page" width="800"/>
  <p><em>Contract Page</em></p>
</div>

---

### 💬 Resources & Community System
<div align="center">
  <img src="./screenshots/resource_page.png" alt="Resources & Community Page" width="800"/>
  <p><em>Resources Page</em></p>
</div>

<div align="center">
  <img src="./screenshots/community_page.png" alt="Resources & Community Page" width="800"/>
  <p><em>Community Page</em></p>
</div>

---

### 📝 Review System
<div align="center">
  <img src="./screenshots/review_page.png" alt="Review Page" width="800"/>
  <p><em>Review Page</em></p>
</div>

---

### 🤖 SkillHub Page
<div align="center">
  <img src="./screenshots/skillhub_page.png" alt="SkillHub Page" width="800"/>
  <p><em>SkillHub Page</em></p>
</div>

<div align="center">
  <img src="./screenshots/skillhub_timebanking_page.png" alt="SkillHub Timebanking Page" width="800"/>
  <p><em>SkillHub Timebanking Page</em></p>
</div>

<div align="center">
  <img src="./screenshots/skillhub_groupsession_page.png" alt="SkillHub Group Session Page" width="800"/>
  <p><em>SkillHub Group Session Page</em></p>
</div>

<div align="center">
  <img src="./screenshots/skillhub_skillverification_page.png" alt="SkillHub Skill Verification Page" width="800"/>
  <p><em>SkillHub Skill Verification Page</em></p>
</div>

<div align="center">
  <img src="./screenshots/skillhub_socialintegration_page.png" alt="SkillHub Social Integration Page" width="800"/>
  <p><em>SkillHub Social Integration Page</em></p>
</div>

<div align="center">
  <img src="./screenshots/skillhub_gamification_page.png" alt="SkillHub Gamification Page" width="800"/>
  <p><em>SkillHub Gamification Page</em></p>
</div>

<div align="center">
  <img src="./screenshots/skillhub_learningpath_page.png" alt="SkillHub Learning Path Page" width="800"/>
  <p><em>SkillHub Learning Path Page</em></p>
</div>

<div align="center">
  <img src="./screenshots/skillhub_challenges_page.png" alt="SkillHub Challenges Page" width="800"/>
  <p><em>SkillHub Challenges Page</em></p>
</div>

---

### 🛡️ Report & Safety Management
<div align="center">
  <img src="./screenshots/report_and_safety_page.png" alt="Report and Safety Page" width="800"/>
  <p><em>Report and Safety Page</em></p>
</div>

---

### ⚙️ Admin Panel & Management
<div align="center">
  <img src="./screenshots/admin_dashboard_page.png" alt="Admin Dashboard Overview" width="800"/>
  <p><em>Admin Dashboard — platform-wide health & KPI overview</em></p>
</div>

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React.js** | 18+ | UI framework & component system |
| **Vite** | Latest | Build tool & dev server |
| **Redux Toolkit** | Latest | Global state management |
| **React Router v6** | Latest | Client-side routing |
| **Socket.io Client** | 4.8+ | Real-time WebSocket communication |
| **TailwindCSS** | Latest | Utility-first CSS framework |
| **React Toastify** | Latest | Toast notification system |
| **WebRTC** | Native | Peer-to-peer video calling |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 20+ | JavaScript runtime |
| **Express.js** | 5.1+ | Web framework & REST API |
| **MongoDB** | Latest | NoSQL document database |
| **Mongoose** | 8+ | MongoDB ODM |
| **Socket.io** | 4.8+ | WebSocket server |
| **JWT** | 9+ | Access & refresh token auth |
| **Bcryptjs** | 3+ | Password hashing |
| **Multer** | 2+ | File upload handling |
| **Cloudinary** | 2+ | Cloud image/file storage |
| **Brevo (sib-api-v3-sdk)** | 7+ | Transactional email service for OTP verification and notifications |
| **Node-cron** | 4+ | Scheduled background tasks |
| **Helmet** | 8+ | HTTP security headers |
| **Express Rate Limit** | 7+ | API rate limiting |
| **Morgan** | 1+ | HTTP request logging |
| **@google/genai** | 1.45+ | Google Gemini AI integration |

---

## 🏗️ Architecture & Project Structure

```
SkillBarter/
│
├── 📁 client/                          # React + Vite Frontend
│   ├── 📁 src/
│   │   ├── 📁 assets/                  # Static images, icons, fonts
│   │   ├── 📁 components/              # Reusable UI components
│   │   │   ├── 📁 admin/               # Admin panel components
│   │   │   │   ├── ActiveMeetings.jsx
│   │   │   │   ├── ChallengesAnalytics.jsx
│   │   │   │   ├── CommunityAnalytics.jsx
│   │   │   │   ├── ContractManagement.jsx
│   │   │   │   ├── DataAnalysis.jsx
│   │   │   │   ├── GamificationAnalytics.jsx
│   │   │   │   ├── PlatformAnalytics.jsx
│   │   │   │   ├── ReportManagement.jsx
│   │   │   │   ├── ResourcesAnalytics.jsx
│   │   │   │   ├── ReviewManagement.jsx
│   │   │   │   ├── SessionManagement.jsx
│   │   │   │   ├── SkillManagement.jsx
│   │   │   │   ├── StatsOverview.jsx
│   │   │   │   └── UserManagement.jsx
│   │   │   ├── 📁 auth/                # Auth forms
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   └── ResetPassword.jsx
│   │   │   ├── 📁 challenges/          # Challenge components
│   │   │   ├── 📁 chat/               # Chat UI components
│   │   │   │   ├── ChatList.jsx
│   │   │   │   ├── ChatWindow.jsx
│   │   │   │   ├── MessageBubble.jsx
│   │   │   │   └── VoiceRecorder.jsx
│   │   │   ├── 📁 common/             # Shared UI atoms
│   │   │   ├── 📁 community/          # Community feed components
│   │   │   ├── 📁 contract/           # Smart contract components
│   │   │   ├── 📁 gamification/       # XP, badges, leaderboard
│   │   │   ├── 📁 groupsessions/      # Group session UI
│   │   │   ├── 📁 layout/             # Layout shells
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Layout.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── 📁 learningpath/       # Learning path components
│   │   │   ├── 📁 matching/           # Match card components
│   │   │   ├── 📁 meeting/            # Meeting room components
│   │   │   │   └── ParticipantsPanel.jsx
│   │   │   ├── 📁 profile/            # Profile subcomponents
│   │   │   ├── 📁 report/             # Safety report components
│   │   │   │   └── SafetyStatus.jsx
│   │   │   ├── 📁 resources/          # Resource library components
│   │   │   ├── 📁 reviews/            # Review form & display
│   │   │   ├── 📁 session/            # Session reminder
│   │   │   │   └── SessionReminder.jsx
│   │   │   ├── 📁 social/             # Social integration
│   │   │   ├── 📁 timebanking/        # Time bank components
│   │   │   ├── 📁 verification/       # Skill verification UI
│   │   │   ├── GlobalCallNotification.jsx  # Global call pop-up
│   │   │   ├── SkillCard.jsx
│   │   │   ├── SkillMentor.jsx        # AI mentor widget
│   │   │   └── VideoCall.jsx          # WebRTC video call
│   │   │
│   │   ├── 📁 contexts/               # React context providers
│   │   │   ├── SocketContext.jsx      # Socket.io global context
│   │   │   └── ThemeContext.jsx       # Dark/Light theme context
│   │   │
│   │   ├── 📁 hooks/                  # Custom React hooks
│   │   │
│   │   ├── 📁 pages/                  # Top-level route pages
│   │   │   ├── AboutPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── ChallengeDetails.jsx
│   │   │   ├── Challenges.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── Community.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ExpertProfile.jsx
│   │   │   ├── Gamification.jsx
│   │   │   ├── GroupSessions.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── HowItWorksPage.jsx
│   │   │   ├── LearningPath.jsx
│   │   │   ├── LearningResources.jsx
│   │   │   ├── MatchesPage.jsx
│   │   │   ├── MeetingPage.jsx
│   │   │   ├── MeetingRoom.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── ReportSafety.jsx
│   │   │   ├── ResourceDetails.jsx
│   │   │   ├── ReviewPage.jsx
│   │   │   ├── ReviewsPage.jsx
│   │   │   ├── SchedulePage.jsx
│   │   │   ├── SessionScheduler.jsx
│   │   │   ├── SkillExpertsList.jsx
│   │   │   ├── SkillHub.jsx
│   │   │   ├── SkillVerification.jsx
│   │   │   ├── SkillsExperts.jsx
│   │   │   ├── SkillsPage.jsx
│   │   │   ├── SmartContractPage.jsx
│   │   │   ├── SocialIntegration.jsx
│   │   │   ├── TimeBanking.jsx
│   │   │   ├── UserDetailPage.jsx
│   │   │   └── UserReviewsPage.jsx
│   │   │
│   │   ├── 📁 redux/                  # State management
│   │   │   ├── 📁 slices/
│   │   │   │   ├── adminSlice.js
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── chatSlice.js
│   │   │   │   ├── matchSlice.js
│   │   │   │   ├── reviewSlice.js
│   │   │   │   ├── skillSlice.js
│   │   │   │   ├── smartMatchSlice.js
│   │   │   │   └── userSlice.js
│   │   │   └── store.js
│   │   │
│   │   ├── 📁 services/               # API service layer
│   │   ├── 📁 utils/                  # Helper utilities
│   │   ├── App.jsx                    # Root app + routing
│   │   └── main.jsx                   # Vite entry point
│   │
│   └── package.json
│
├── 📁 Server/                          # Node.js + Express Backend
│   ├── 📁 config/                     # DB & app config
│   ├── 📁 controllers/                # Business logic (25 controllers)
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── challengeController.js
│   │   ├── chatController.js
│   │   ├── communityController.js
│   │   ├── contractController.js
│   │   ├── gamificationController.js
│   │   ├── groupSessionController.js
│   │   ├── learningPathController.js
│   │   ├── matchController.js
│   │   ├── notificationController.js
│   │   ├── progressController.js
│   │   ├── referralController.js
│   │   ├── reportController.js
│   │   ├── resourceController.js
│   │   ├── reviewController.js
│   │   ├── scheduleController.js
│   │   ├── sessionController.js
│   │   ├── skillController.js
│   │   ├── skillsController.js
│   │   ├── socialController.js
│   │   ├── userController.js
│   │   ├── verificationController.js
│   │   └── walletController.js
│   │
│   ├── 📁 middleware/                 # Custom Express middlewares
│   ├── 📁 models/                     # Mongoose schemas (28 models)
│   ├── 📁 routes/                     # Express route definitions (25 files)
│   ├── 📁 services/                   # External service integrations
│   ├── 📁 sockets/                    # Socket.io event handlers
│   │   ├── chatHandler.js
│   │   ├── meetingHandler.js
│   │   ├── notifHandler.js
│   │   ├── socketController.js
│   │   └── videoCallHandler.js
│   ├── 📁 uploads/                    # Local file uploads (dev)
│   ├── 📁 utils/                      # Utilities & AI matching
│   ├── .env                           # Environment config
│   └── server.js                      # Entry point
│
├── 📁 screenshots/                    # App UI screenshots
├── package.json
└── README.md
```

---

## 🗺️ App Pages & Routes

### Public Routes (No Auth Required)

| Route | Page | Description |
|---|---|---|
| `/` | `HomePage` | Landing page — hero, features, testimonials, CTA |
| `/about` | `AboutPage` | Platform story, mission & team |
| `/contact` | `ContactPage` | Contact form & support info |
| `/how-it-works` | `HowItWorksPage` | Step-by-step platform guide |
| `/login` | `AuthPage` | Login with email & password |
| `/register` | `RegisterForm` | New account creation |
| `/forgot-password` | `ForgotPassword` | Password reset request |
| `/reset-password/:token` | `ResetPassword` | Set new password via token |

---

### 🔒 Protected User Routes (Auth Required)

| Route | Page | Description |
|---|---|---|
| `/dashboard` | `DashboardPage` | Main user hub — stats, matches, sessions |
| `/profile` | `ProfilePage` | Edit profile, bio, avatar, skills |
| `/user/:id` | `UserDetailPage` | View another user's public profile |
| `/user/:userId/reviews` | `UserReviewsPage` | All reviews for a specific user |

#### 🎯 Skills & Experts
| Route | Page | Description |
|---|---|---|
| `/skills` | `SkillsPage` | Manage your teaching & learning skills |
| `/skills/explore` | `SkillsExperts` | Browse skills by category |
| `/skills/explore/:skillName` | `SkillExpertsList` | List of experts for a skill |
| `/skills/explore/:skillName/expert/:expertId` | `ExpertProfile` | Expert's detailed profile |

#### 💬 Matching & Communication
| Route | Page | Description |
|---|---|---|
| `/matches` | `MatchesPage` | Sent, received & active match requests |
| `/chat` | `ChatPage` | Chat inbox — list of conversations |
| `/chat/:userId` | `ChatPage` | Direct chat with a specific user |
| `/chat/match/:matchId` | `ChatPage` | Chat within a match context |
| `/notifications` | `NotificationsPage` | Notification center |

#### 📅 Sessions & Meetings
| Route | Page | Description |
|---|---|---|
| `/meeting` | `MeetingPage` | Schedule or join a meeting |
| `/meeting/:meetingId` | `MeetingRoom` | Full-screen WebRTC meeting room |
| `/sessions` | `SessionScheduler` | Book & manage 1-on-1 sessions |

#### ⭐ Reviews & Contracts
| Route | Page | Description |
|---|---|---|
| `/reviews` | `ReviewsPage` | All your reviews (received & given) |
| `/review/:matchId` | `ReviewPage` | Submit review for a completed session |
| `/contracts` | `SmartContractPage` | Create & manage skill contracts |

#### 🌟 Skill Hub (Advanced Features)
| Route | Page | Description |
|---|---|---|
| `/skill-hub` | `SkillHub` | Hub landing with all advanced modules |
| `/skill-hub/social-integration` | `SocialIntegration` | Connect social accounts & referrals |
| `/skill-hub/time-banking` | `TimeBanking` | Exchange time credits for skills |
| `/skill-hub/group-sessions` | `GroupSessions` | Create/join multi-user sessions |
| `/skill-hub/skill-verification` | `SkillVerification` | Get skills peer-verified |
| `/skill-hub/gamification` | `Gamification` | XP, badges & leaderboard |
| `/skill-hub/challenges` | `Challenges` | Browse & join skill challenges |
| `/skill-hub/challenges/:id` | `ChallengeDetails` | View & submit a challenge |
| `/skill-hub/learning-path` | `LearningPath` | Follow curated learning journeys |

#### 📚 Resources & Community
| Route | Page | Description |
|---|---|---|
| `/resources` | `LearningResources` | Browse the resource library |
| `/resources/:id` | `ResourceDetails` | View a specific resource |
| `/community` | `Community` | Community feed — posts, likes, comments |
| `/report-safety` | `ReportSafety` | Submit safety & content reports |

---

### 🛡️ Admin Routes (`/admin/*`)

| Route | Component | Description |
|---|---|---|
| `/admin/dashboard` | `AdminDashboard` | Platform overview & health KPIs |
| `/admin/users` | `UserManagement` | Search, verify, ban & manage users |
| `/admin/reviews` | `ReviewManagement` | Approve, flag & moderate reviews |
| `/admin/skills` | `SkillManagement` | Manage skill categories & curation |
| `/admin/stats` | `StatsOverview` | Platform-wide statistics summary |
| `/admin/data-analysis` | `DataAnalysis` | Deep-dive data analysis dashboards |
| `/admin/meetings` | `ActiveMeetings` | Monitor active & past meetings |
| `/admin/sessions` | `SessionManagement` | All session records & states |
| `/admin/contracts` | `ContractManagement` | Smart contract oversight |
| `/admin/reports` | `ReportManagement` | Safety reports & content flags |
| `/admin/community-analytics` | `CommunityAnalytics` | Community engagement metrics |
| `/admin/challenges-analytics` | `ChallengesAnalytics` | Challenge participation analytics |
| `/admin/gamification-analytics` | `GamificationAnalytics` | XP, badge & leaderboard analytics |
| `/admin/resources-analytics` | `ResourcesAnalytics` | Resource usage & rating analytics |
| `/admin/platform-analytics` | `PlatformAnalytics` | Full platform health analytics |

---

## 📡 API Endpoints

### 🔑 Auth Routes — `/api/auth`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/register` | Register new user | ❌ |
| `POST` | `/login` | Login & receive JWT | ❌ |
| `POST` | `/refresh` | Refresh access token | ❌ |
| `POST` | `/logout` | Logout & invalidate tokens | ✅ |
| `POST` | `/forgot-password` | Send reset email | ❌ |
| `POST` | `/reset-password/:token` | Set new password | ❌ |

### 👤 User Routes — `/api/users`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/profile` | Get own profile | ✅ |
| `PUT` | `/profile` | Update profile details | ✅ |
| `GET` | `/search` | Search users by skill/name | ✅ |
| `GET` | `/:id` | Get user by ID | ✅ |
| `POST` | `/avatar` | Upload profile avatar | ✅ |
| `PUT` | `/skills` | Update user skills list | ✅ |
| `POST` | `/block/:id` | Block a user | ✅ |
| `GET` | `/blocked` | List blocked users | ✅ |

### 🤝 Match Routes — `/api/matches`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/request` | Send a match request | ✅ |
| `GET` | `/` | Get all matches | ✅ |
| `GET` | `/smart` | Get smart matches | ✅ |
| `PUT` | `/:id/accept` | Accept a match request | ✅ |
| `PUT` | `/:id/decline` | Decline a match request | ✅ |
| `DELETE` | `/:id` | Cancel a match | ✅ |

### 💬 Chat Routes — `/api/chats`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/conversations` | List all conversations | ✅ |
| `GET` | `/:matchId` | Get messages for a match | ✅ |
| `POST` | `/message` | Send a text message | ✅ |
| `POST` | `/message/file` | Send a file/image | ✅ |
| `PUT` | `/:id/read` | Mark messages as read | ✅ |

### 🎯 Skills Routes — `/api/skills`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | Get all skills | ✅ |
| `POST` | `/` | Add new skill | ✅ |
| `PUT` | `/:id` | Update a skill | ✅ |
| `DELETE` | `/:id` | Remove a skill | ✅ |
| `GET` | `/categories` | Get all skill categories | ❌ |
| `GET` | `/experts/:skillName` | Get experts for a skill | ✅ |

### ⭐ Review Routes — `/api/reviews`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/` | Submit a review | ✅ |
| `GET` | `/user/:userId` | Get reviews for a user | ✅ |
| `GET` | `/match/:matchId` | Get review for a match | ✅ |
| `PUT` | `/:id` | Update a review | ✅ |
| `DELETE` | `/:id` | Delete a review | ✅ |

### 📅 Session Routes — `/api/sessions`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/` | Create a session | ✅ |
| `GET` | `/` | Get user's sessions | ✅ |
| `PUT` | `/:id` | Update session status | ✅ |
| `DELETE` | `/:id` | Cancel a session | ✅ |

### 📃 Contract Routes — `/api/contracts`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/` | Create skill contract | ✅ |
| `GET` | `/` | Get user's contracts | ✅ |
| `PUT` | `/:id` | Update contract status | ✅ |
| `PUT` | `/:id/sign` | Sign a contract | ✅ |

### 🏆 Gamification — `/api/gamification`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/leaderboard` | Global XP leaderboard | ✅ |
| `GET` | `/badges` | User's earned badges | ✅ |
| `GET` | `/xp` | User's XP history | ✅ |

### ⚡ Challenge Routes — `/api/challenges`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | List all challenges | ✅ |
| `GET` | `/:id` | Get challenge details | ✅ |
| `POST` | `/:id/submit` | Submit to a challenge | ✅ |
| `POST` | `/:id/vote` | Vote on a submission | ✅ |

### 🛤️ Learning Path Routes — `/api/learning-path`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | Get user's learning paths | ✅ |
| `POST` | `/` | Create a new learning path | ✅ |
| `PUT` | `/:id/progress` | Update step progress | ✅ |

### 📚 Resource Routes — `/api/resources`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | Browse resource library | ✅ |
| `POST` | `/` | Contribute a resource | ✅ |
| `GET` | `/:id` | Get resource details | ✅ |
| `POST` | `/:id/review` | Rate/review a resource | ✅ |

### 🌐 Community Routes — `/api/community`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/posts` | Get community feed | ✅ |
| `POST` | `/posts` | Create a post | ✅ |
| `POST` | `/posts/:id/like` | Like/unlike a post | ✅ |
| `POST` | `/posts/:id/comment` | Comment on a post | ✅ |

### 👥 Group Session Routes — `/api/group-sessions`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | List group sessions | ✅ |
| `POST` | `/` | Create group session | ✅ |
| `POST` | `/:id/join` | Join a group session | ✅ |
| `DELETE` | `/:id/leave` | Leave a group session | ✅ |

### ✅ Verification Routes — `/api/verification`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/request` | Request skill verification | ✅ |
| `POST` | `/:id/endorse` | Endorse a skill | ✅ |
| `GET` | `/status` | Get verification status | ✅ |

### 💰 Wallet & Time Banking Routes — `/api/wallet`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/balance` | Get time credit balance | ✅ |
| `POST` | `/transfer` | Transfer credits | ✅ |
| `GET` | `/transactions` | Get transaction history | ✅ |

### 🔔 Notification Routes — `/api/notifications`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/` | Get all notifications | ✅ |
| `PUT` | `/:id/read` | Mark notification read | ✅ |
| `DELETE` | `/clear` | Clear all notifications | ✅ |

### 🛡️ Report Routes — `/api/reports`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/` | Submit a safety report | ✅ |
| `GET` | `/` | Get user's reports | ✅ |

### ⚙️ Admin Routes — `/api/admin`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/dashboard` | Platform KPIs | 🔐 Admin |
| `GET` | `/users` | All users with filters | 🔐 Admin |
| `PUT` | `/users/:id/ban` | Ban a user | 🔐 Admin |
| `PUT` | `/users/:id/verify` | Verify a user | 🔐 Admin |
| `GET` | `/stats` | Aggregated statistics | 🔐 Admin |
| `GET` | `/analytics/*` | Module-specific analytics | 🔐 Admin |
| `PUT` | `/reviews/:id` | Moderate a review | 🔐 Admin |

---

## 🗄️ Database Models

The platform uses **25 Mongoose models** organized across the following domains:

### 👤 User Domain
| Model | Description |
|---|---|
| `User` | Core user profile — name, email, avatar, bio, role, skills |
| `Block` | User-to-user block relationships |
| `MatchPreference` | AI matching preferences per user |

### 🤝 Matching Domain
| Model | Description |
|---|---|
| `Match` | Match request with status (pending/accepted/declined) |

### 💬 Communication Domain
| Model | Description |
|---|---|
| `Conversation` | Chat room between two users |
| `Message` | Individual chat messages with type (text/file/voice) |
| `Meeting` | Meeting record with participants & schedule |
| `Notification` | Platform notification with type & read status |

### 🎯 Skills Domain
| Model | Description |
|---|---|
| `Skill` | Skill document with category & proficiency |
| `Verification` | Skill verification request & endorsements |

### 📅 Sessions & Contracts
| Model | Description |
|---|---|
| `Session` | 1-on-1 skill session with status lifecycle |
| `SkillContract` | Smart contract with milestones & signatures |
| `Transaction` | Time credit transfers |
| `Wallet` | User's time banking wallet |

### 🏆 Engagement Domain
| Model | Description |
|---|---|
| `Gamification` | XP points, level, badges per user |
| `Challenge` | Skill challenge with prompt & submissions |
| `Submission` | Challenge submission from a user |
| `LearningPath` | Curated multi-step learning journey |
| `Resource` | Community-contributed learning resource |
| `ResourceReview` | Rating & review for a resource |

### 🌐 Community Domain
| Model | Description |
|---|---|
| `Post` | Community feed post with likes & comments |
| `GroupSession` | Multi-participant group learning session |
| `Referral` | Referral tracking for user growth |

### 🛡️ Safety Domain
| Model | Description |
|---|---|
| `Report` | Safety or content violation report |
| `Review` | Post-session peer review with ratings |

---

## 🔌 Real-Time Socket Events

The platform uses **Socket.io** with separate handlers for each domain.

### `socketController.js` — Connection Management
| Event | Direction | Description |
|---|---|---|
| `connection` | Client → Server | User connects; adds to online users map |
| `disconnect` | Client → Server | User disconnects; cleanup |
| `register_user` | Client → Server | Links socket to user ID |
| `user_online` | Server → Client | Notify contacts user came online |
| `user_offline` | Server → Client | Notify contacts user went offline |

### `chatHandler.js` — Messaging
| Event | Direction | Description |
|---|---|---|
| `join_chat` | Client → Server | Join a conversation room |
| `leave_chat` | Client → Server | Leave a conversation room |
| `send_message` | Client → Server | Send a new message |
| `new_message` | Server → Client | Receive a message in real-time |
| `typing` | Client → Server | Broadcast typing status |
| `stop_typing` | Client → Server | Broadcast stopped typing |
| `message_read` | Client → Server | Mark messages as read |
| `messages_seen` | Server → Client | Receipt for read messages |

### `videoCallHandler.js` — Video Calls
| Event | Direction | Description |
|---|---|---|
| `call_user` | Client → Server | Initiate a call to a user |
| `incoming_call` | Server → Client | Notify recipient of incoming call |
| `call_accepted` | Client → Server | Call recipient accepts |
| `call_declined` | Client → Server | Call recipient declines |
| `call_ended` | Client → Server | Either party ends the call |
| `ice_candidate` | Client ↔ Server | WebRTC ICE candidate exchange |
| `offer` | Client → Server | WebRTC SDP offer |
| `answer` | Client → Server | WebRTC SDP answer |

### `meetingHandler.js` — Meeting Rooms
| Event | Direction | Description |
|---|---|---|
| `join_meeting` | Client → Server | Join a meeting room |
| `leave_meeting` | Client → Server | Leave a meeting room |
| `participant_joined` | Server → Client | Notify room of new participant |
| `participant_left` | Server → Client | Notify room of departure |
| `meeting_ended` | Server → Client | Host ended the meeting |
| `raise_hand` | Client → Server | Raise/lower hand in meeting |
| `screen_share_started` | Client → Server | Start screen sharing |
| `screen_share_stopped` | Client → Server | Stop screen sharing |

### `notifHandler.js` — Notifications
| Event | Direction | Description |
|---|---|---|
| `match_request` | Server → Client | New match request received |
| `match_accepted` | Server → Client | Your match was accepted |
| `session_created` | Server → Client | New session request |
| `session_accepted` | Server → Client | Session was accepted |
| `new_review` | Server → Client | New review received |
| `new_message_notif` | Server → Client | Unread message alert |

---

## 🤖 Smart Matching Engine

> **File:** `Server/utils/smartMatching.js` · `Server/utils/skillSimilarity.js`
> **Class:** `SmartMatchingAlgorithm v2` — profile-aware multi-factor scoring engine

The matching engine is a **pure algorithmic scoring system** (no external AI calls at scoring time). It evaluates every dimension of a user's profile — skills, experience, availability, learning style, language, location, reputation, activity, and GitHub presence — to produce a compatibility score from **0 to 100**.

---

### How It Works — Full Pipeline

```
┌────────────────────────────────────────────────────┐
│                    User Profile                    │
│  teachSkills · learnSkills · experienceLevel       │
│  yearsOfExperience · availability · learningStyle  │
│  teachingStyle · languages · location · bio        │
│  verifiedSkills · githubData · averageRating       │
│  totalReviews · lastLogin                          │
└─────────────────────┬──────────────────────────────┘
                      │
          SmartMatchingAlgorithm.calculateMatchScores()
                      │
         ┌────────────▼────────────┐
         │  For each candidate:    │
         │  calculateCompatibility │
         └────────────┬────────────┘
                      │
        ┌─────────────▼──────────────────────────────┐
        │   12 Independent Scoring Factors            │
        │  (each returns value 0–1 + confidence)      │
        └─────────────┬──────────────────────────────┘
                      │
        ┌─────────────▼──────────────────────────────┐
        │   Weighted Sum → Raw Total Score            │
        │   + History Bonus (additive, capped)        │
        │   + Mutual Exchange Synergy Bonus (+0.05)   │
        └─────────────┬──────────────────────────────┘
                      │
        ┌─────────────▼──────────────────────────────┐
        │   total  = Math.round(score × 100)  [0–100]│
        │   confidence = weighted avg of factor confs │
        │   reasons[]  = top 4 high-scoring factors   │
        │   highlights[] = top 6 emoji callouts       │
        │   matchType = label (see match types below) │
        └─────────────┬──────────────────────────────┘
                      │
        ┌─────────────▼──────────────────────────────┐
        │   Results sorted by compatibilityScore desc │
        └────────────────────────────────────────────┘
```

---

### ⚖️ The 12 Scoring Factors (Real Weights from Code)

> Source: `SmartMatchingAlgorithm.WEIGHTS` — weights sum to **1.0**

| # | Factor | Weight | Description |
|---|---|---|---|
| 1 | **Skill Match** | **28%** | Cross-scores `teachSkills ↔ learnSkills` in both directions using `SkillSimilarity`. Takes `max(fwd, rev, avg*0.9)` |
| 2 | **Mutual Exchange** | **15%** | Are *both* directions satisfied? If yes, gets `(fwd+rev)/2 + 0.15` bonus. The "holy grail" — triggers synergy bonus |
| 3 | **Experience Balance** | **10%** | Compares `experienceLevel` (beginner/intermediate/advanced/expert) + `yearsOfExperience`. 2-level gap = ideal mentor/learner (score 1.0) |
| 4 | **Learning Style Fit** | **8%** | User's `learningStyle` matched against candidate's `teachingStyle` via compatibility matrix |
| 5 | **Availability Overlap** | **8%** | Counts common time slots from `availability` arrays. Slight 1.2× boost applied |
| 6 | **Language Match** | **7%** | Intersection of `languages[]` arrays. No common language → 0.2. Multiple shared → highlight |
| 7 | **Location Score** | **5%** | Same city = 1.0 · Same country = 0.65 · Different = 0.25. Triggers "📍 Same city!" highlight |
| 8 | **Verified Skill Bonus** | **5%** | Checks if candidate's `verifiedSkills[]` overlap what the user wants to learn. Base = 0.4, matched = 0.6–1.0 |
| 9 | **Reputation Score** | **6%** | `averageRating` (1–5 → 0–1) × 0.8 + review count confidence × 0.2. Saturates at 10 reviews |
| 10 | **Activity Score** | **4%** | Based on `lastLogin`: Today = 1.0 · This week = 0.85 · This month = 0.60 · 90d+ = 0.15 |
| 11 | **GitHub Score** | **2%** | `reposCount / 20 × 0.6 + stars / 100 × 0.4`. Saturates at 20 repos / 100 stars |
| 12 | **Bio Completeness** | **2%** | 7 profile field checks: bio length >30, have teachSkills, learnSkills, location, languages, learning/teaching style, profileImage |

---

### 🎯 Bonus Scoring Rules

```js
// History Bonus — additive, capped at 1.0
histBonus = (historicalRating - 0.5) × 0.08
totalScore = clamp(totalScore + histBonus, 0, 1)

// Mutual Exchange Synergy — if both directions are strong
if (mutualExchange >= 0.7 && skillMatch >= 0.65) {
  totalScore += 0.05   // +5% bonus
  reasons.unshift("Perfect two-way skill exchange opportunity!")
}
```

---

### 🏷️ Match Type Labels

After scoring, each match is classified into one of **6 match types**:

| Match Type | Condition | Meaning |
|---|---|---|
| `perfect_match` | mutual ≥ 0.75 AND skill ≥ 0.65 | Both teach what the other wants with high alignment |
| `style_aligned` | skill ≥ 0.7 AND learningStyle ≥ 0.75 | Great skills + teaching style compatibility |
| `verified_expert` | skill ≥ 0.65 AND verifiedSkill ≥ 0.65 | Skill match with platform-verified credentials |
| `mutual_learning` | mutual ≥ 0.6 | Strong two-way exchange potential |
| `trusted_mentor` | skill ≥ 0.6 AND reputation ≥ 0.7 | Good skill match + highly rated user |
| `skill_complement` | total score ≥ 60 | General skill complementarity |
| `potential_match` | everything else | Partial match, worth exploring |

---

### 🔬 Skill Similarity Engine — `skillSimilarity.js`

Each skill-to-skill comparison uses a **4-algorithm weighted pipeline**:

```
Skill A  ──────────────────────────────────────────  Skill B
          │                                     │
    Category Similarity (30%)           Name Similarity (40%)
    ─────────────────────────           ─────────────────────
    • Exact category = 1.0              • Exact substring → 0.9
    • Related category = 0.7            • Levenshtein distance
    • Different = 0.1                   • Jaccard word-token similarity
                                        • Fuzzy alias matching
                                        • Takes MAX of above 3
          │                                     │
    Tag Similarity (20%)             Level Compatibility (10%)
    ─────────────────────────         ────────────────────────
    • Tag intersection / union         • Same level = 1.0
    • Jaccard over tag arrays          • 1 level diff = 0.8
                                       • 2 level diff = 0.6
                                       • 3 level diff = 0.4
          │                                     │
          └──────── Weighted Sum → 0.0 to 1.0 ──┘
```

#### Fuzzy Alias Matching
The engine knows 30+ built-in skill aliases, e.g.:
- `javascript` = `js`, `ecmascript`, `node.js`, `nodejs`
- `react` = `reactjs`, `react.js`, `react framework`
- `python` = `py`, `python3`, `python programming`
- `git` = `version control`, `github`, `gitlab`
- `aws` = `amazon web services`, `amazon aws`
- `seo` = `search engine optimization`

#### Related Category Graph
Categories that share skill relevance (bidirectional lookup):
```
programming ←→ web development, mobile development, software development
design      ←→ ui design, ux design, graphic design, web design
data science←→ machine learning, analytics, statistics, programming
marketing   ←→ digital marketing, social media, content marketing
language    ←→ translation, writing, communication
business    ←→ entrepreneurship, management, finance
teaching    ←→ education, training, mentoring
```

---

### 🧠 Experience Level Scoring Logic

```js
// Level map: beginner=1, intermediate=2, advanced=3, expert=4
lvlDiff === 0  → score 0.65   // Same level — okay, less learning opportunity
lvlDiff === 1  → score 0.90   // 1 apart — great
lvlDiff === 2  → score 1.00   // 2 apart — IDEAL mentor/mentee dynamic → triggers highlight
lvlDiff === 3  → score 0.30   // Too far apart

// Combined with yearsOfExperience:
finalExpScore = (levelScore × 0.7) + (yoeScore × 0.3)
// yoeScore = max(0, 1 - |yoeDiff| / 10), saturates at 10-year diff
```

---

### 🎨 Learning Style Compatibility Matrix

```
User's Learning Style   →   Compatible Teaching Styles
────────────────────────────────────────────────────────
Visual                  →   Project-based, Hands-on, Step-by-step guidance
Auditory                →   Lecture-based, Discussion-based
Reading/Writing         →   Lecture-based, Step-by-step guidance
Hands-on                →   Hands-on, Project-based
Interactive             →   Discussion-based, Project-based

Match score:
  style match in matrix → 1.0
  exact same style name → 0.7
  no match              → 0.3
  data missing          → 0.5 (low confidence)
```

---

### 📊 Match Output Structure

Every scored match returns:

```js
{
  user: { /* full candidate profile */ },
  compatibilityScore: 87,          // 0–100
  confidence: 73,                  // 0–100 weighted avg of factor confidences
  matchType: "perfect_match",      // one of 6 match types
  reasons: [                       // top 4 match reasons (factors scored ≥ 0.75)
    "Perfect two-way skill exchange opportunity!",
    "Your Hands-on learning style fits their Project-based teaching!",
    "Has 2 verified skill(s) you want to learn",
    "Top-rated user (4.8⭐ from 12 reviews)"
  ],
  highlights: [                    // top 6 emoji callouts for UI display
    "🎯 React ↔ React",
    "🔄 Two-way skill swap!",
    "✅ Verified in: React, Node.js",
    "📈 Ideal mentor-learner pair (beginner ↔ advanced)",
    "✨ Learning-teaching style match!",
    "🟢 Recently active"
  ],
  breakdown: {                     // per-factor detail for debugging/display
    skillMatch:          { raw: 0.91, weighted: 0.255, weight: 0.28, explanation: "React ↔ React" },
    mutualExchange:      { raw: 0.85, weighted: 0.128, weight: 0.15, explanation: "Mutual skill exchange!" },
    experienceBalance:   { raw: 1.00, weighted: 0.100, weight: 0.10, explanation: "beginner ↔ advanced" },
    // ... 9 more factors
  }
}
```

---

### 💡 Smart Insights & Recommendations

`SmartMatchingAlgorithm.getMatchInsights(user, matches)` produces:

```js
{
  totalMatches: 14,
  averageCompatibility: 63,
  matchTypes: { perfect_match: 2, skill_complement: 7, ... },
  recommendations: [
    "Set your learning style for better style-aligned matches",
    "Add your languages to find compatible collaborators"
  ]
}
```

---

## 🔐 Authentication Flow

```
1. Registration
   POST /api/auth/register  →  Hash password (bcrypt)
                            →  Create User document
                            →  Send welcome email (Nodemailer)
                            →  Return JWT + Refresh Token

2. Login
   POST /api/auth/login  →  Validate credentials
                         →  Issue Access Token (15min TTL)
                         →  Issue Refresh Token (7d TTL, HttpOnly cookie)

3. Protected Request
   Request with Bearer Token  →  JWT Middleware validates signature
                              →  Attach user to req.user
                              →  Allow or reject request

4. Token Refresh
   POST /api/auth/refresh  →  Validate Refresh Token from cookie
                           →  Issue new Access Token

5. Password Reset
   POST /api/auth/forgot-password  →  Generate reset token
                                   →  Send reset link via email
   POST /api/auth/reset-password/:token  →  Validate token + expiry
                                          →  Update password
```

---

### 2. Google Login via Firebase

SkillBarter uses **Firebase Authentication** on the frontend and **Firebase Admin SDK** on the backend to enable secure one-click Google Sign-In.

#### Full Client to Server Flow

```
CLIENT (Browser)
  User clicks "Continue with Google"
       |
       v
  Firebase JS SDK  -->  signInWithPopup(GoogleAuthProvider)
       |
       v
  Google OAuth  -->  Returns Firebase User + ID Token
       |
       v
  POST /api/auth/google  { idToken: "<Firebase JWT>" }
       |  HTTPS
SERVER (Node.js)
       |
       v
  Firebase Admin SDK: admin.auth().verifyIdToken(idToken)
       |
       v
  Extract: { uid, email, name, picture }
       |
       |-- User exists?  -->  Fetch existing user
       |-- New user?     -->  Create user (isGoogleUser: true)
       |
       v
  Issue platform JWT Access Token + Refresh Token
       |
       v
  Return { token, user }  -->  Client stores JWT
```

#### Packages Used

| Side | Package | Purpose |
|---|---|---|
| **Frontend** | `firebase` | Firebase JS SDK - handles Google OAuth popup and returns ID token |
| **Backend** | `firebase-admin` | Firebase Admin SDK - verifies Google ID tokens server-side |

#### Frontend Code (firebase.js)

```js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const result  = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  return idToken; // Send this to your backend
};
```

#### Backend Code (authController.js)

```js
// Firebase Admin initialization
import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert({
    projectId:   process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

// Google login endpoint: POST /api/auth/google
export const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  // Verify with Firebase Admin (throws if invalid or expired)
  const decoded = await admin.auth().verifyIdToken(idToken);
  const { email, name, picture } = decoded;

  // Find or create user in MongoDB
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name, email, avatar: picture, isGoogleUser: true });
  }

  // Issue platform JWT (same as email/password flow)
  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "strict" });
  res.json({ token: accessToken, user });
};
```

#### Environment Variables Required

| Location | Variable | Description |
|---|---|---|
| `client/.env` | `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `client/.env` | `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `client/.env` | `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `client/.env` | `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.firebasestorage.app` |
| `client/.env` | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Numeric sender ID |
| `client/.env` | `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `Server/.env` | `FIREBASE_PROJECT_ID` | Firebase project ID (Admin SDK) |
| `Server/.env` | `FIREBASE_CLIENT_EMAIL` | Service account email |
| `Server/.env` | `FIREBASE_PRIVATE_KEY` | Service account private key (quoted, `\n` preserved) |

#### Firebase Console Setup Steps

```
1. Go to https://console.firebase.google.com/
2. Create or open your project
3. Authentication --> Sign-in method --> Enable "Google"
4. Project Settings --> General --> Your apps --> Add Web App
   Copy the firebaseConfig object values to client/.env
5. Project Settings --> Service Accounts --> Generate new private key
   Download JSON --> Copy projectId, clientEmail, privateKey to Server/.env
6. Authentication --> Settings --> Authorized domains --> Add your domain
```

> **Security:** The Firebase ID Token is verified **server-side** using the Admin SDK.
> The client can never forge a valid token. Only after successful verification does
> the server issue its own JWT for all subsequent API requests.


---

## 🎛️ State Management

The app uses **Redux Toolkit** for global state. All slices are in `client/src/redux/slices/`.

| Slice | State Managed |
|---|---|
| `authSlice` | Logged-in user, JWT token, auth loading/error state |
| `userSlice` | Current user profile data & update status |
| `matchSlice` | Match requests (sent/received), active matches |
| `smartMatchSlice` | match results, filters, loading states |
| `chatSlice` | Conversations list, active conversation, messages |
| `skillSlice` | User's skills, categories, skill CRUD status |
| `reviewSlice` | Reviews received/given, review CRUD states |
| `adminSlice` | All admin panel data — users, stats, analytics |

---

## 🌙 Theme System

The app supports **Light & Dark mode** via a React Context.

```jsx
// Usage in any component
import { useTheme } from '../contexts/ThemeContext';

const { theme, toggleTheme } = useTheme();
// theme: 'light' | 'dark'
```
- Theme preference is persisted in `localStorage`
- All components respect the `dark:` Tailwind variants
- Smooth CSS transitions on theme switch

---

## ⚙️ Environment Variables

### Server (`Server/.env`)

```env
# Application
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/skillbarter

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (SMTP via Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis (Caching)
REDIS_URL=redis://localhost:6379

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Firebase Admin SDK (Server-side Google Auth verification)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

> **Firebase Admin Key:** Download the service account JSON from [Firebase Console](https://console.firebase.google.com/) → Project Settings → Service Accounts → Generate new private key. Copy the `private_key` value (keep the `\n` newlines as-is, wrapped in double quotes).

### Client (`client/.env`)

```env
# API & Socket
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Firebase (Google Authentication)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Firebase Setup:** Go to [Firebase Console](https://console.firebase.google.com/) → Create project → Add Web App → Copy the config values above.

---

## 🚀 Quick Start

### Prerequisites
- ✅ Node.js 18+
- ✅ MongoDB (local or Atlas)
- ✅ npm or yarn

---

### Step 1 — Clone & Install

```bash
# Clone the repository
git clone https://github.com/VaibhavVataliya/SkillBarter.git
cd SkillBarter
```

### Step 2 — Backend Setup

```bash
# Navigate to server
cd Server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# → Fill in your credentials in .env

# Start development server
npm run dev
# Server runs at http://localhost:5000
```

### Step 3 — Frontend Setup

```bash
# Open a new terminal, navigate to client
cd client

# Install dependencies
npm install

# Create environment file (fill in your actual values)
cat > .env << 'EOF'
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
EOF

# Start development server
npm run dev
# App runs at http://localhost:5173
```

### Step 4 — Open the App

Visit **http://localhost:5173** in your browser. 🎉

---

## 🔒 Security Features

| Feature | Implementation |
|---|---|
| **Password Hashing** | Bcryptjs with salt rounds |
| **JWT Tokens** | Short-lived access tokens + long-lived refresh tokens in HttpOnly cookies |
| **HTTP Headers** | Helmet.js sets secure HTTP headers |
| **Rate Limiting** | `express-rate-limit` on auth & sensitive routes |
| **Input Validation** | `express-validator` validates all request bodies |
| **CORS Policy** | Strict origin control via `cors` config |
| **File Upload Safety** | Multer with file type & size restrictions |
| **Cloudinary Signing** | Server-side signed uploads only |
| **Admin Authorization** | Role-based middleware guards admin routes |

---

## 🧪 Development

### Running Both Servers

```bash
# Backend (from /Server)
npm run dev       # nodemon auto-reload

# Frontend (from /client)
npm run dev       # Vite HMR
```

### Building for Production

```bash
# Frontend production build
cd client
npm run build
# Output in /client/dist
```

### Running Tests

```bash
# Backend tests (Jest + Supertest)
cd Server
npm test
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make** your changes with clear, atomic commits
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
4. **Push** to your branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request with a clear description

### Commit Message Format
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `style:` — Code style changes (no logic change)
- `refactor:` — Refactor without feature/fix
- `test:` — Add or update tests

---

## 📄 License

This project is licensed under the **ISC License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

## 🙏 Thank You

*SkillBarter was built with passion to help people connect, trade knowledge, and grow together.*

*Whether you're a developer, designer, teacher, or learner — there's a place for you here.*

**Happy Learning & Happy Bartering! 🌟**

---

*Made with ❤️ by Vaibhav Vataliya*

[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat-square&logo=github)](https://github.com/Vaibhav-59)

</div>

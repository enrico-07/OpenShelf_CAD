# OpenShelf 📚

> **A modern, community-driven digital library and revision platform for educational resources.**

OpenShelf is a full-featured web application designed for students, educators, and lifelong learners to discover, curate, peer-review, and collaboratively evolve study materials. Featuring integrated version control for documents, a built-in interactive reader, threaded discussions, and a moderation queue, OpenShelf ensures academic resources stay accurate, up-to-date, and accessible to everyone.

---

## ✨ Key Features

### 🔍 Discovery & Intelligent Search
- **Full-Text Multi-Attribute Search:** Instant query filtering across title, subject, tags, format, and author with keyboard shortcut (`⌘K` / `Ctrl+K`).
- **Facet Filtering & Tag Filtering:** Filter by resource type (*Study guides*, *Revision notes*, *Reading lists*), academic subject, document format, and custom tags.
- **Sorting Options:** Sort resources by relevance, highest community rating, or most saved.

### 📖 In-App Document Reader
- **Distraction-Free Reading:** Built-in document viewer supporting multi-page navigation and zoom scaling (70%–150%).
- **Interactive Controls:** Page flipping (`◄` / `►`), zoom reset (`1:1`), and full-view expansion (`F`).
- **Simulated Secure Presigned Access:** Emulates secure S3 presigned document streaming architecture.

### 🔄 Document Versioning & History
- **Collaborative Revisions:** Community members can publish incremental improvements and submit revision changelogs.
- **Audit Trail & Rollback:** View complete revision history (`v1.0`, `v2.0`, etc.) with contributor attribution and timestamps.

### 📂 Personal Shelves & Curated Collections
- **Bookmarking:** Save resources to your private library with one click or shortcut (`S`).
- **Topic Collections:** Group study guides and reading lists into custom shareable playlists (e.g., *Core CS Curriculum*, *Pre-Med Foundations*).

### 💬 Community Feedback & Peer Reviews
- **Threaded Discussions:** Leave star ratings, constructive feedback, and direct replies on any study resource.
- **Top Contributor Leaderboard:** Recognize active community contributors based on accepted improvements and reviews.

### 🛡️ Moderation & Content Integrity
- **Submission Queue:** Dedicated dashboard for community moderators to approve or reject newly submitted resources and revisions.
- **Report Handling:** In-depth reporting flow for inaccurate or unauthorized content with automated notification alerts.

### ⚡ Telemetry & Platform Insights
- **System Health Monitor:** Real-time metrics tracking HTTP 2xx/4xx/5xx error rates, p95/p99 latency, and background worker queues.

### 🎨 Design System & Accessibility
- **Modern Theme Engine:** Fluid transition between Light, Dark, and System modes with high-contrast palette tokens.
- **Keyboard-First Navigation:** Comprehensive keyboard shortcuts for global actions (`⌘K` search, `⌘U` upload, `O` open reader, `S` bookmark, `T` theme toggle).

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript 5.7](https://www.typescriptlang.org/) |
| **Build Tooling & HMR** | [Vite 8](https://vite.dev/) + [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite` |
| **Typography & Icons** | [DM Sans Variable](https://fontsource.org/fonts/dm-sans), Self-hosted [Google Material Symbols](https://fonts.google.com/icons) |
| **Code Quality & Linter** | [oxfmt](https://oxc.rs/) |
| **Backend / API** | Node.js + Express API Layer (Modular Controllers & Security Middleware) |
| **Security Architecture** | Rate limiting, input validation, Helmet-style headers, and presigned S3 token patterns |

---

## 📁 Project Structure

```text
OpenShelf/
├── public/                 # Static public assets (favicons, icons)
├── server/                 # Express backend & security layer
│   ├── controllers/        # Resource, moderation, and auth controllers
│   ├── routes/             # REST API routing
│   ├── security/           # Rate limiting, validation schemas, security middleware
│   └── index.ts            # Server entrypoint
├── src/                    # Frontend React application
│   ├── assets/             # Font subsets and brand assets
│   ├── components/         # Reusable UI components
│   │   ├── cards/          # Resource cards, feedback cards
│   │   ├── common/         # Buttons, modals, avatars, breadcrumbs, icons
│   │   ├── cover/          # Dynamic generative cover art
│   │   └── navigation/     # Sidebar, topbar, mobile nav, drawer
│   ├── data/               # Seed data, academic subject taxonomies, licenses
│   ├── hooks/              # Custom hooks (e.g., useTheme)
│   ├── modals/             # Reader, upload, collect, report, version history modals
│   ├── services/           # API client layer & contract definitions
│   ├── types/              # Domain TypeScript types and interfaces
│   ├── views/              # Page views (Discover, Library, Subjects, Moderation, etc.)
│   ├── App.tsx             # Root application orchestrator
│   ├── main.tsx            # React DOM mounting
│   └── index.css           # Global CSS tokens and Tailwind v4 setup
├── .env.example            # Environment variable template
├── package.json            # Scripts & dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration & path aliases
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v20.0.0 or higher recommended)
- **npm** or **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/enrico-07/OpenShelf.git
   cd OpenShelf
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or with pnpm:
   pnpm install
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```

### Development

Start the local development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:8443` (or the port specified in your console).

### Quality Checks & Production Build

- **Type Check:**
  ```bash
  npx tsc --noEmit
  ```

- **Format Code:**
  ```bash
  npm run format
  ```

- **Build for Production:**
  ```bash
  npm run build
  ```

- **Preview Production Build:**
  ```bash
  npm run preview
  ```

---

## 🔒 Security & Architecture Highlights

- **Rate Limiting:** Protects authentication, resource submission, and feedback endpoints against automated abuse.
- **Input Sanitization:** Validates request parameters and file payload definitions before persistence.
- **Stateless Session Design:** Ready to wire with Amazon Cognito or JWT-based authentication providers.
- **Auditable Licensing:** Enforces open-access licensing selection (Creative Commons BY 4.0, BY-NC 4.0, MIT, etc.) on all user submissions.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

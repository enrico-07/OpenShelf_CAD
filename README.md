# OpenShelf 📚

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![AWS SDK](https://img.shields.io/badge/AWS-S3_|_DynamoDB_|_SNS_|_CloudWatch-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**A modern, community-driven digital library and revision platform for educational resources.**

[Features](#-key-features) • [Architecture](#-architecture--aws-cloud-integration) • [Getting Started](#-getting-started) • [Deployment](#-deployment-guide) • [Security & RBAC](#-security--rbac) • [License](#-license)

</div>

---

## 🌟 Overview

**OpenShelf** is an open-source, full-stack educational repository designed for students, educators, and lifelong learners to discover, curate, peer-review, and collaboratively evolve study materials. Featuring integrated version control for study guides, a built-in interactive document reader, threaded discussions, an institutional moderation queue, and live AWS telemetry, OpenShelf ensures academic resources stay accurate, up-to-date, and accessible to everyone.

---

## ✨ Key Features

### 🔍 Intelligent Discovery & Instant Search
- **Full-Text Multi-Attribute Search:** Instant query filtering across title, subject, tags, format, and author with global keyboard shortcut (`⌘K` / `Ctrl+K`).
- **Facet & Taxonomy Filtering:** Filter by resource type (*Study guides*, *Revision notes*, *Reading lists*), academic subject, document format, and custom tags.
- **Dynamic Sorting:** Rank resources by relevance, highest community rating, or most saved.

### 📖 Distraction-Free In-App Smart Reader
- **Multi-Format Document Viewer:** Native reader supporting document paging, interactive text selection, and proportional zoom scaling (70%–150%).
- **🎧 AI Audio Narration (Amazon Polly):** Integrated text-to-speech audio player allowing learners to listen to study guides on the go, supporting both female and male voices. Fulfills WCAG / a11y standards.
- **🌐 Instant Multilingual Translation (Amazon Translate):** One-click neural translation converting study materials dynamically into **English, Spanish, German, Hindi, Tamil, and Malayalam** with client-side zero-cost caching.
- **Interactive Controls:** Smooth page flipping (`◄` / `►`), zoom reset (`1:1`), and full-screen view (`F`).
- **Security & Hygiene:** Integrated **DOMPurify** sanitization and XSS stripping on all rendered content.
- **Secure Pre-signed Streaming:** Seamless streaming of documents from private Amazon S3 buckets via time-limited pre-signed URLs.

### 🔄 Document Versioning & Audit History
- **Collaborative Revisions:** Community members can publish incremental improvements with changelog notes.
- **Audit Trail & Rollback:** View complete revision history (`v1.0`, `v2.0`, etc.) with contributor attribution and timestamps.

### 📂 Curated Shelves & Personal Library
- **One-Click Bookmarking:** Save resources to your private library with one click or keyboard shortcut (`S`).
- **Topic Collections:** Group study guides and reading lists into custom shareable collections (e.g., *Core CS Curriculum*, *Pre-Med Foundations*).

### 💬 Community Feedback & Peer Reviews
- **Threaded Discussions:** Leave star ratings, constructive feedback, and direct replies on any study resource.
- **Top Contributor Recognition:** Dynamic community leaderboard recognizing active contributors based on accepted improvements and reviews.

### 🛡️ Institutional Moderation & Report Handling
- **Submission Queue:** Dedicated dashboard for verified moderators to approve, flag, or reject newly submitted resources and revisions.
- **Passkey Protection:** Institutional security passkey required to register as a moderator or elevate privileges.
- **Automated Alerts:** Dispatches Amazon SNS notifications to staff when content is flagged or needs review.

### ⚡ Live Telemetry & Platform Insights
- **AWS CloudWatch Integration:** Real-time metrics tracking HTTP 2xx/4xx/5xx error rates, p95/p99 latency, and active storage volume.
- **Interactive Graphs:** Live visual telemetry tracker displaying cloud system performance.

### ⌨️ Comprehensive Keyboard Shortcuts
| Shortcut | Action |
| :--- | :--- |
| `⌘K` / `Ctrl+K` | Open global search filter |
| `⌘U` / `Ctrl+U` | Open resource upload modal |
| `O` | Open interactive reader for focused resource |
| `S` | Bookmark / save resource to personal library |
| `T` | Toggle theme (Light / Dark / System) |
| `?` | Show keyboard shortcuts modal |
| `Esc` | Close any open modal or reader |

---

## 🏛️ Architecture & AWS Cloud Integration

OpenShelf combines a high-performance **React 19 + Vite** frontend with a modular **Node.js Express** backend wired to enterprise **Amazon Web Services (AWS)** primitives.

```
┌────────────────────────────────────────────────────────┐
│               OpenShelf Client (Vercel)                │
│       React 19 • Vite • Tailwind v4 • DOMPurify        │
└───────────────┬────────────────────────▲───────────────┘
                │                        │
       HTTPS / REST API            S3 Pre-signed URL
                │                        │
┌───────────────▼────────────────────────┴───────────────┐
│              OpenShelf API Server (EC2)                │
│       Node.js • Express • Rate Limiting • JWT Auth     │
└───────────────┬────────────────────────────────────────┘
                │
   ┌────────────┼────────────┬─────────────┐
   ▼            ▼            ▼             ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Amazon  │ │  Amazon  │ │  Amazon  │ │  Amazon  │
│ DynamoDB │ │    S3    │ │   SNS    │ │CloudWatch│
│ (Tables) │ │ (Files)  │ │ (Alerts) │ │(Metrics) │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

| AWS Service | Purpose in OpenShelf |
| :--- | :--- |
| **Amazon S3** | Secure, private storage for educational PDF, DOCX, and PPTX resources with time-limited pre-signed URL downloads. |
| **Amazon DynamoDB** | Single-digit millisecond latency NoSQL persistence for resources, user profiles, revisions, feedback, and moderation queues. |
| **Amazon SNS** | Push notification topic triggering real-time alerts to moderators when resources are flagged or submitted. |
| **Amazon CloudWatch** | Ingestion of custom performance metrics (latency, HTTP error rates, throughput) reflected live in the telemetry dashboard. |
| **Amazon Polly** | Neural & standard text-to-speech engine delivering real-time audio narration inside the Smart Reader. |
| **Amazon Translate** | Neural machine translation translating study materials into Spanish, German, Hindi, Tamil, and Malayalam. |
| **AWS STS** | Credential validation and IAM role verification for EC2 instance profiles and local development. |

---

## 📁 Repository Structure

```text
OpenShelf/
├── deploy/                 # Production deployment scripts & systemd units
│   ├── aws-iam-policy.json # Least-privilege IAM policy for EC2
│   ├── ec2-setup.sh        # Automated EC2 instance setup script
│   └── openshelf.service   # Systemd unit file for 24/7 background uptime
├── server/                 # Express backend & AWS services
│   ├── aws/                # AWS SDK client configuration & connectivity tests
│   ├── controllers/        # Resource, moderation, and auth controllers
│   ├── routes/             # REST API routes (/api/resources, /api/auth, etc.)
│   ├── scripts/            # AWS initialization scripts (DynamoDB, S3, SNS)
│   ├── security/           # Rate limiting, validation schemas, security headers
│   ├── services/           # Business logic for AWS S3, DynamoDB, SNS, CloudWatch
│   └── index.ts            # Server entrypoint
├── src/                    # Frontend React application
│   ├── assets/             # Brand icons and self-hosted fonts
│   ├── components/         # Reusable modular components
│   │   ├── cards/          # ResourceCard, FeedbackCard, empty state cards
│   │   ├── common/         # Buttons, badges, modals, avatars
│   │   ├── cover/          # Dynamic generative book cover component
│   │   └── navigation/     # Sidebar, Topbar, MobileNav, Drawer
│   ├── data/               # Academic subjects taxonomy, licenses
│   ├── hooks/              # Custom React hooks (useTheme, etc.)
│   ├── modals/             # Reader, Upload, Collect, Report, Version History modals
│   ├── services/           # Typed API client layer
│   ├── types/              # Domain TypeScript types
│   ├── utils/              # Security sanitizers, formatters
│   ├── views/              # Page views (Discover, Library, Moderation, Insights, etc.)
│   ├── App.tsx             # Root UI orchestrator
│   └── main.tsx            # Application entrypoint
├── .env.example            # Environment variables template
├── package.json            # Scripts & dependencies
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Vercel SPA routing and security header configuration
└── vite.config.ts          # Vite build config & Rollup chunking
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed locally:
- **Node.js** (v20.0.0 or higher recommended)
- **npm** (v10+ or pnpm)
- **Git**
- *(Optional)* **AWS CLI** configured if testing AWS cloud integration.

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/enrico-07/OpenShelf_CAD.git
   cd openshelf
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```
   *(Update `.env` with your desired configuration or AWS credentials if testing cloud features).*

4. **Verify AWS Connection (Optional):**
   ```bash
   npm run test:aws
   ```

5. **Start the Development Servers:**
   - In terminal 1 (Backend API):
     ```bash
     npm run server
     ```
   - In terminal 2 (Frontend Client):
     ```bash
     npm run dev
     ```

6. Open your browser at `http://localhost:8443` (or the port indicated in your console).

---

## 🧪 Quality Assurance & Build Commands

```bash
# Type check the entire codebase
npx tsc --noEmit

# Format code according to strict project style
npm run format

# Build production bundle with optimized Rollup vendor splitting
npm run build

# Preview production build locally
npm run preview
```

---

## ☁️ Deployment Guide

### 1. Deploying Frontend to Vercel

OpenShelf comes pre-configured with [`vercel.json`](vercel.json) containing client-side SPA rewrites, static caching rules, and security headers:

1. Push your repository to GitHub (see [Push Instructions](#-pushing-to-github)).
2. Log into [vercel.com](https://vercel.com) and click **"Add New..."** -> **"Project"**.
3. Import your `openshelf` repository.
4. **Build & Output Settings**:
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables**:
   - `VITE_API_URL`: Set to your live backend URL (e.g. `https://api.yourdomain.com`).
6. Click **Deploy**. Your frontend is instantly available globally on Vercel's Edge Network.

---

### 2. Deploying Backend to AWS EC2

Production deployment scripts and systemd definitions are provided in [`deploy/`](deploy/):

1. **Launch an EC2 Instance:**
   - AMI: Amazon Linux 2023 or Ubuntu 22.04 LTS
   - Instance Type: `t3.small` or `t3.micro`
   - Security Group: Allow inbound traffic on port `80`, `443`, and `5000`.

2. **Attach IAM Role:**
   - Attach an IAM role to the EC2 instance using the least-privilege policy defined in [`deploy/aws-iam-policy.json`](deploy/aws-iam-policy.json).

3. **Execute Automated Provisioning:**
   ```bash
   # Clone the repository onto EC2
   git clone https://github.com/enrico-07/OpenShelf_CAD.git
   cd openshelf

   # Make setup script executable and run
   chmod +x deploy/ec2-setup.sh
   ./deploy/ec2-setup.sh
   ```

4. **Enable & Start Systemd Service:**
   ```bash
   sudo cp deploy/openshelf.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now openshelf
   ```

5. **Verify Backend Status:**
   ```bash
   curl http://localhost:5000/api/health
   # Expected response: {"status":"healthy","uptime":...}
   ```

---

## 🔒 Security & RBAC

- **Role-Based Access Control (RBAC):**
  - **Guest:** Anonymous browsing, reading, and bookmarking. Write actions (uploading, rating) require account registration.
  - **Learner:** Full access to upload materials, submit revisions, and participate in peer discussions.
  - **Moderator:** Elevated permissions to approve/reject submissions, moderate content, and view platform metrics. Requires the institutional passkey (`MODERATOR_SECRET_KEY`).
- **Input Sanitization:** Deep XSS prevention via `dompurify` and prototype pollution guards in client & server layers.
- **Rate Limiting:** Protection on authentication (`/api/auth/*`), uploads (`/api/resources/upload`), and public interactions.
- **Strict Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and strict CSP headers enabled on both Express and Vercel.

---

## 📦 Pushing to GitHub

Follow these exact steps to push your initial release:

```bash
# 1. Check status
git status

# 2. Stage all files
git add .

# 3. Commit release
git commit -m "feat(release): OpenShelf v1.0.0 production ready"

# 4. Set main branch & add your remote repository
git branch -M main
git remote add origin https://github.com/enrico-07/OpenShelf_CAD.git

# 5. Push to GitHub
git push -u origin main
```

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

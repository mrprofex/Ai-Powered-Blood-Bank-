# Predictive Emergency Blood Shortage Network

A healthcare coordination platform designed to help hospitals, blood banks, and public health coordinators across India monitor blood inventory, detect regional shortage risks early, and coordinate emergency availability.

> **Current Build Status — Phase 1: Foundation & Frontend Demo**
> All statistics, hospital counts, inventory units, shortage risk indicators, and user sessions displayed in this build are **DEMO DATA**. Real database persistence, production authentication, e-RaktKosh API synchronization, and Gemini AI predictions are scheduled for Phases 2–5.

---

## Architecture Overview

The codebase separates frontend presentation, backend API services, shared validation contracts, documentation, and test suites:

- `client/` — React + TypeScript + Tailwind CSS frontend application (Landing Page, Demo Auth, Main Network Dashboard, Blood Availability Finder, Hospital Portal, Blood Bank Portal, Admin Portal, Interactive 3D Network Topology, and Recharts analytics).
- `server/` — Express.js + TypeScript backend foundation, Zod request validation, security headers, CORS policy, centralized error handling, and initial Prisma schema for Neon PostgreSQL.
- `shared/` — Shared Zod schemas, blood group constants, and TypeScript domain contracts used across client and server.
- `docs/` — Complete engineering documentation (`prd.md`, `architecture.md`, `rules.md`, `phases.md`, `design.md`).
- `tests/` — Phase 1 smoke and validation tests.
- `src/` & `server.ts` — Root runtime entry points integrating Vite middleware with Express on port `3000` for unified local development and Vercel-compatible deployment.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts, Motion (`motion/react`), Three.js
- **Backend:** Node.js, Express.js, TypeScript, Helmet, CORS, Zod
- **Database & ORM (Configured for Phase 2):** Neon PostgreSQL + Prisma (`server/prisma/schema.prisma`)
- **Planned Integrations (Phases 2–5):** Google OAuth, Google Gemini API (backend-only explainability), Leaflet + OpenStreetMap, Authorized e-RaktKosh API

---

## Local Setup & Running

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` for local development (no database credentials or external API keys are required for Phase 1):

```bash
cp .env.example .env
```

### 3. Run the Application (Frontend + Express Backend)

```bash
npm run dev
```

This starts the unified Express + Vite server on `http://localhost:3000`.

- Frontend App: `http://localhost:3000`
- Backend Health Check: `http://localhost:3000/api/health`
- API Demo Metadata: `http://localhost:3000/api/v1/network/summary`

### 4. Type Check & Production Build

```bash
npm run lint
npm run build
```

---

## Pending Integrations & External Credentials (Future Phases)

The following integrations are intentionally excluded in Phase 1 and documented for subsequent phases:

1. **Neon PostgreSQL (`DATABASE_URL`, `DIRECT_DATABASE_URL`)** — Required in Phase 2 to activate Prisma migrations and persistent inventory records.
2. **Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)** — Required in Phase 2 for institutional and user sign-in.
3. **Google Gemini API (`GEMINI_API_KEY`)** — Required in Phase 5 for server-side natural-language explanations of deterministic shortage forecasts.
4. **Authorized e-RaktKosh API (`ERAKTKOSH_API_BASE_URL`, `ERAKTKOSH_API_KEY`)** — Requires official C-DAC / MoHFW institutional onboarding before real inventory ingestion.

---

## Phase 1 Verification Checklist

- [x] Five engineering docs created in `docs/` (`prd.md`, `architecture.md`, `rules.md`, `phases.md`, `design.md`)
- [x] Modular folder structure (`client/`, `server/`, `shared/`, `docs/`, `tests/`)
- [x] Landing Page, Demo Login, Demo Signup, Main Dashboard, Blood Availability Page, Hospital Dashboard, Blood Bank Dashboard, Admin Dashboard
- [x] Recharts inventory & shortage risk visualizations with explicit `DEMO DATA` labeling
- [x] Interactive Three.js 3D Indian Blood Network Topology viewport
- [x] Express backend with `/api/health`, Zod validation, CORS, Helmet security headers, and centralized error handling
- [x] Initial 15-model Prisma schema for Neon PostgreSQL (configuration only)
- [x] Safe `.env.example` and `.gitignore`

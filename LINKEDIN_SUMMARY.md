# Predictive Emergency Blood Shortage Network — LinkedIn Project Showcase

---

## 🎯 One-Liner
**A production-grade healthcare coordination platform transforming India's emergency blood management from reactive phone calls into a proactive, predictive network connecting hospitals, blood banks, and citizens.**

---

## 🏥 The Problem
Blood availability across Indian hospitals suffers from **localized imbalances** that cost lives:
- **Delayed Visibility**: Families & coordinators spend critical hours calling blood banks during trauma/obstetric emergencies
- **Unanticipated Shortages**: Dengue surges, seasonal donation drops, and regional trauma spikes exhaust rare groups (O⁻, AB⁻, B⁻) before replenishment
- **Preventable Wastage**: Platelets (5-day shelf life) and PRBC units expire in surplus facilities while neighbors face acute deficits
- **Fragmented Data**: No unified expiry-aware days-of-stock-cover analytics or verifiable source attribution

---

## 🚀 Solution: Predictive Emergency Blood Shortage Network

A **full-stack TypeScript monorepo** with React 19 + Express.js + Prisma/Neon PostgreSQL, engineered for clinical safety, institutional trust, and phased production deployment.

### 🎬 Current State: **Phase 1 Complete** — Foundation & Demo Frontend
> *All statistics, inventory units, and risk indicators are explicitly labeled DEMO DATA. Real database persistence, production auth, e-RaktKosh sync, and Gemini AI predictions are scheduled for Phases 2–5.*

---

## 🏗️ Architecture Highlights

| Layer | Technology | Key Decisions |
|-------|------------|---------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4 | 60-30-10 clinical color system, Zero-pill metadata, WCAG 2.1 AA |
| **Charts/3D** | Recharts, Three.js (WebGL), OGL | Blood group bars, shortage trends, 3D cold-chain topology |
| **Backend** | Express.js, TypeScript, Zod, Helmet, CORS | Layered: config → middleware → routes → controllers → services |
| **Database** | Prisma ORM + Neon PostgreSQL (15 models) | Audit trails, batch tracking, expiry-aware inventory, RBAC |
| **Auth (Planned)** | Argon2id + Google OAuth 2.0, HttpOnly cookies | Org-scoped RBAC, rate limiting, CSRF protection |
| **AI (Planned)** | Google Gemini 2.5 Flash (backend-only) | Deterministic math → structured JSON → natural-language explainability |

---

## 🎨 Four Role-Separated Portals (All Functional in Demo)

| Portal | Persona | Core Workflows (Demo) |
|--------|---------|----------------------|
| **Public Blood Finder** | Patient attendant searching B⁻ in Pune | Search by city/group/component, verification badges, emergency helplines |
| **Hospital Coordinator** | Dr. Priya Sharma (Bengaluru trauma) | Emergency requests, ranked blood bank matches, 7/30-day demand forecasts |
| **Blood Bank Officer** | Rajesh Kulkarni (1,200+ units) | Batch inventory with expiry, near-expiry alerts, transfer approvals |
| **Network Admin** | Vikram Nair (State health) | Org verification queue, sync health monitor, audit logs, RBAC governance |

---

## ✨ Standout Technical Features

### 1. **Interactive 3D Network Topology (Three.js)**
- 5 metropolitan blood coordination clusters (Delhi NCR, Mumbai–Pune, Hyderabad, Bengaluru, Chennai)
- Procedural 4-part composite nodes (pedestal, glowing core, orbiting halo, vertical spire)
- Cold-chain corridor arcs with flowing courier particles
- Raycasting hover/click, OrbitControls with exponential damping, software-WebGL detection + 2D fallback
- Real-time risk score visualization (crimson/amber/emerald)

### 2. **Clinical-Grade Design System**
- **Typography**: Plus Jakarta Sans (display) + DM Sans (body) + JetBrains Mono (tabular data)
- **Color**: Deep navy `#0B1324`, Medical blue `#1D4ED8`, Semantic risk trio (Green/Amber/Crimson) + explicit text labels
- **Zero decorative pulsing dots** — only meaningful motion (150–200ms, respects `prefers-reduced-motion`)

### 3. **Explicit Data Provenance**
- Every metric stamped `DEMO DATA` in Phase 1
- Inventory source types: `VERIFIED_MANUAL` | `ERAKTKOSH_SYNC` | `DEMO_SYNTHETIC`
- Freshness badges: `Verified <6h` | `Stale >24h` | `Demo Data`

### 4. **Security-First Backend**
- Helmet HTTP headers, strict CORS allowlisting
- Zod validation on **body/query/params** with reusable middleware
- Centralized error handler (generic client messages, structured server logs)
- Rate limiters: public / auth / authenticated tiers (Phase 2 ready)
- Zero secrets in client bundles

### 5. **15-Table Prisma Schema for Neon PostgreSQL**
- Users, Organizations, Verifications, Hospitals, Blood Banks, Locations
- Blood Inventory (expiry-aware, source-typed), Inventory History (immutable ledger)
- Blood Requests + Matches (ranked by availability/distance/freshness)
- Shortage Predictions (deterministic + optional Gemini explanation)
- Notifications, Data Sources, Sync Logs, Audit Logs

---

## 📋 Phased Roadmap (6 Phases)

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| **1** ✅ | Foundation & Demo | 5 engineering docs, modular repo, 8 demo pages, 3D topology, Express + Zod + Prisma draft |
| **2** 🔜 | Auth & Security | Neon PG migrations, Argon2id + Google OAuth, HttpOnly cookies, RBAC middleware |
| **3** 🔜 | Public Blood Finder | Leaflet + OSM map, spatial queries, InventoryDataProvider abstraction, freshness badges |
| **4** 🔜 | Hospital/Bank Portals | Batch CRUD, near-expiry alerts, emergency request→match workflow, audit trails |
| **5** 🔜 | AI Prediction Engine | Deterministic forecast (burn rate, days-of-cover, expiry loss, regional risk) + Gemini explainability |
| **6** 🔜 | Admin/Deploy | Verification queue, Playwright E2E, Vercel + Neon production, WCAG AA audit |

---

## 🛡️ Clinical Safety & Compliance

- **No automated crossmatching or compatibility clearance** — all transfusions remain under qualified medical professionals (NACO/NBTC protocols)
- **Zero unauthorized scraping** — e-RaktKosh integration only via authorized C-DAC/MoHFW institutional onboarding
- **Provider abstraction** cleanly separates: Verified Facility submissions / Authorized e-RaktKosh / Demo Synthetic
- **Audit logs** on every inventory change, transfer approval, and sensitive mutation

---

## 🧪 Phase 1 Verification Checklist

- [x] 5 engineering docs (`prd.md`, `architecture.md`, `rules.md`, `phases.md`, `design.md`)
- [x] Modular structure: `client/`, `server/`, `shared/`, `docs/`, `tests/`
- [x] 8 frontend views: Landing, Login, Signup, Main Dashboard, Blood Availability, Hospital, Blood Bank, Admin
- [x] Recharts: Blood group inventory bars, regional risk breakdown, 7-day trend, component mix donut
- [x] Three.js 3D Indian network topology with procedural nodes & corridor arcs
- [x] Express backend: `/api/health`, `/api/v1/network/*`, Zod, CORS, Helmet, centralized errors
- [x] 15-model Prisma schema (Neon-ready, zero live credentials required)
- [x] TypeScript strict mode (`tsc --noEmit` passes), production Vite build

---

## 💻 Tech Stack Badges

```
React 19  |  TypeScript  |  Vite  |  Tailwind CSS v4
Express.js  |  Node.js  |  Zod  |  Prisma ORM
Neon PostgreSQL  |  Three.js  |  Recharts  |  Motion
Helmet  |  CORS  |  Lucide React  |  OGL
```

---

## 🔗 Links & References

- **Repository**: [Add your GitHub link here]
- **Live Demo (Phase 1)**: [Add Vercel/Netlify preview link here]
- **Engineering Docs**: `/docs/prd.md`, `/docs/architecture.md`, `/docs/design.md`, `/docs/phases.md`, `/docs/rules.md`
- **Prisma Schema**: `server/prisma/schema.prisma`

---

## 📝 Suggested LinkedIn Post Copy

> **Built a production-grade healthcare coordination platform for India's emergency blood network — here's what Phase 1 delivers:**
>
> 🏥 **Problem**: Families spend critical hours calling blood banks during emergencies. Rare groups (O⁻, AB⁻) exhaust before replenishment. Platelets expire in surplus centers while neighbors face deficits.
>
> 🚀 **Solution**: A full-stack TypeScript monorepo (React 19 + Express + Prisma/Neon) with four role-separated portals — Public Finder, Hospital Coordinator, Blood Bank Officer, Network Admin — all connected by a predictive shortage engine.
>
> ✨ **Phase 1 Highlights**:
> • Interactive **Three.js 3D cold-chain topology** across 5 Indian metro clusters
> • **Recharts analytics**: blood group availability vs. thresholds, 7-day trends, component mix
> • **Clinical design system**: 60-30-10 color discipline, zero ambiguous color-only signals, WCAG 2.1 AA
> • **Explicit provenance**: Every metric labeled `DEMO DATA`; inventory tagged `VERIFIED_MANUAL`/`ERAKTKOSH_SYNC`/`DEMO_SYNTHETIC`
> • **Security-first backend**: Helmet, Zod validation, CORS, rate limiters, centralized errors, zero client secrets
> • **15-table Prisma schema** with audit trails, batch expiry tracking, RBAC-ready org structure
>
> 🗺️ **Roadmap**: Phase 2 (Neon PG + Google OAuth), Phase 3 (Leaflet map + spatial search), Phase 4 (transactional portals), Phase 5 (deterministic forecast + Gemini explainability), Phase 6 (Vercel deploy + E2E tests).
>
> 💡 **Clinical Safety**: No automated crossmatching. Zero unauthorized scraping. e-RaktKosh only via authorized C-DAC MoU. All transfusions under NACO/NBTC protocols.
>
> #HealthTech #BloodDonation #React #TypeScript #ThreeJS #Prisma #NeonDB #HealthcareInnovation #India

---

## 🎯 Key Talking Points for Interviews/Conversations

1. **"I architected a phased healthcare platform from scratch"** — 5 spec docs, modular monorepo, zero technical debt
2. **"Clinical safety was non-negotiable"** — explicit demo labeling, no automated clinical decisions, authorized-only external integrations
3. **"The 3D topology isn't eye candy"** — it models real cold-chain corridors with procedural nodes, risk-scored hubs, and interactive inspection
4. **"Backend is serverless-ready"** — Express factory pattern, Vercel-compatible, Neon connection pooling, no background workers in request path
5. **"AI explainability without hallucination"** — deterministic math computed server-side → structured JSON → Gemini only for natural-language summarization
6. **"Designed for Indian regulatory reality"** — SBTC/CDSCO license verification, e-RaktKosh adapter boundary, NACO/NBTC compliance baked in

---

*Generated from project analysis — customize links and add screenshots/video before posting.*
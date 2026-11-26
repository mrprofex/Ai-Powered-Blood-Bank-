# Phased Development Roadmap
## Predictive Emergency Blood Shortage Network

---

## Phase 1: Foundation and Architecture (Current Phase)

### Objectives
Establish a clean, modular, secure project foundation, complete engineering documentation, initial database schema draft, Express backend baseline, and responsive frontend demonstration with clearly labeled demo data.

### Tasks
- Inspect workspace and configure `.env.example`, `.gitignore`, `README.md`, and `metadata.json`.
- Author all five specification documents in `docs/`.
- Build modular directory structure (`client/`, `server/`, `shared/`, `docs/`, `tests/`).
- Create initial 15-table Prisma schema (`server/prisma/schema.prisma`) for Neon PostgreSQL (configuration only).
- Build Express backend with `/api/health`, `/api/v1/network/*` demo endpoints, Zod validation, CORS, Helmet headers, and centralized error handling.
- Build frontend demo pages: Landing, Demo Login, Demo Signup, Main Dashboard, Blood Availability, Hospital Portal, Blood Bank Portal, Admin Portal, Recharts visualizations, and Three.js 3D Network Topology.

### Dependencies
- Node.js runtime, React 19, Vite, Tailwind CSS, Recharts, Lucide React, Motion, Three.js, Zod, Express.

### Expected Deliverables
- Complete `docs/` suite, runnable unified dev server, passing TypeScript check (`tsc --noEmit`), production Vite build, and Phase 1 smoke tests.

### Testing Checklist
- [x] `tsc --noEmit` passes with zero errors
- [x] `npm run build` produces clean production bundle
- [x] `/api/health` returns `200 OK` JSON status
- [x] All 8 frontend views navigate cleanly with no broken links

### Completion Criteria
All Phase 1 files created, verified against `docs/` specifications, with zero fabricated live connections.

---

## Phase 2: Authentication and Security

### Objectives
Replace demo mode with real Neon PostgreSQL persistence, secure authentication (Email/Password + Google OAuth), session management, rate limiting, and organization-scoped RBAC.

### Tasks
- Connect Neon PostgreSQL via `DATABASE_URL` and run initial Prisma migrations.
- Implement Argon2id/scrypt password hashing and Google OAuth 2.0 server-side flow.
- Add secure HttpOnly/SameSite=None cookies or signed bearer sessions.
- Implement per-IP and per-account rate limiting with exponential backoff on auth endpoints.
- Add CSRF validation and organization-level authorization middleware.

### Dependencies
- Phase 1 complete; Neon PostgreSQL credentials; Google OAuth client credentials.

### Expected Deliverables
- Working `/api/v1/auth/*` endpoints, persistent `users` and `organizations` records, and role-protected portal routes.

### Testing Checklist
- Supertest suite verifying unauthenticated `401`, cross-organization `403`, rate limit `429`, and invalid Zod payload `400`.

### Completion Criteria
Users sign up, authenticate securely, and access only their authorized institutional portals.

---

## Phase 3: Public Blood Finder & Geographical Discovery

### Objectives
Enable citizens and coordinators to search live verified blood inventory across India using interactive maps and filterable clinical criteria.

### Tasks
- Integrate Leaflet + OpenStreetMap tiles and permitted Nominatim geocoding with caching.
- Implement `InventoryDataProvider` abstraction with source attribution (`VERIFIED_MANUAL`, `DEMO_SYNTHETIC`, and `AuthorizedERaktKoshProvider` stub).
- Build `/api/v1/network/availability` backed by PostgreSQL spatial/location filters.
- Add freshness badges (`Verified < 6h`, `Stale > 24h`, `Demo Data`) and clinical disclaimers.

### Dependencies
- Phase 2 complete; `locations` seeded with Indian cities/states.

### Expected Deliverables
- Live Public Blood Finder page with map pins, radius/city filter, component filter, and source attribution.

### Testing Checklist
- Search filter unit tests, empty/error state tests, and stale-timestamp rendering verification.

### Completion Criteria
Public users can locate verified blood banks by location, blood group, and component with transparent freshness metadata.

---

## Phase 4: Hospital and Blood Bank Portals

### Objectives
Deliver transactional inventory management for blood banks and emergency request/matching workflows for hospitals.

### Tasks
- Build Blood Bank batch entry forms (blood group, component, unit count, expiry date) with atomic Prisma transactions writing to `blood_inventory` and `inventory_history`.
- Implement near-expiry alerting (batches expiring within 7 days).
- Build Hospital emergency request submission and ranked candidate blood bank matching (`blood_request_matches`).
- Record immutable `audit_logs` on every inventory change and transfer approval.

### Dependencies
- Phase 2 & Phase 3 complete.

### Expected Deliverables
- Full CRUD inventory portal for Blood Banks and end-to-end request-to-allocation workflow for Hospitals.

### Testing Checklist
- Transactional race-condition tests, negative unit rejection tests, and cross-facility authorization tests.

### Completion Criteria
Hospitals can submit emergency requests and coordinate verified transfers with Blood Banks end to end.

---

## Phase 5: AI Prediction Engine

### Objectives
Implement deterministic shortage forecasting and Gemini-powered operational explanations without risking LLM hallucinations.

### Tasks
- Build deterministic forecasting service computing consumption velocity, days-of-stock-cover, expiry loss projections, and regional risk scores (`0–100`).
- Persist results in `shortage_predictions` with model version and calculation inputs.
- Integrate `@google/genai` (`gemini-2.5-flash`) exclusively on the backend to convert validated prediction records into plain-language coordination recommendations.
- Render explainability drawers in Main, Hospital, and Admin dashboards.

### Dependencies
- Phase 4 inventory history data; `GEMINI_API_KEY` secret.

### Expected Deliverables
- Deterministic prediction engine + Gemini explanation endpoint + interactive forecast charts.

### Testing Checklist
- Unit tests verifying deterministic math across edge cases (zero burn rate, imminent expiry spikes) and prompt-injection sanitization tests.

### Completion Criteria
Shortage alerts are accurately forecasted 48–96 hours ahead with clear, grounded operational explanations.

---

## Phase 6: Admin Dashboard, Testing, Optimization and Deployment

### Objectives
Complete institutional verification workflows, harden performance, run end-to-end tests, and deploy to Vercel + Neon PostgreSQL.

### Tasks
- Build Admin organization verification queue (`organization_verifications`), sync monitor (`sync_logs`), and audit log viewer.
- Add public SEO metadata, `sitemap.xml`, `robots.txt`, and accessibility audit (WCAG AA).
- Execute Playwright end-to-end tests and OWASP security checklist.
- Configure Vercel deployment (`vercel.json` / serverless entry) and production environment variables.

### Dependencies
- Phases 1–5 complete; Vercel & Neon production environments.

### Expected Deliverables
- Production-ready deployed platform with verified test suite and zero critical security findings.

### Testing Checklist
- Vitest unit suite, Supertest API suite, Playwright E2E suite, `npm audit`, and Lighthouse accessibility score >= 95.

### Completion Criteria
Application live on Vercel with verified health checks, audit logs, and passing test suites.

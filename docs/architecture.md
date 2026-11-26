# System Architecture Specification
## Predictive Emergency Blood Shortage Network

---

## 1. High-Level Architecture

The platform is engineered as a modular TypeScript monorepo separating presentation (`client/`), API & domain services (`server/`), shared schemas (`shared/`), documentation (`docs/`), and automated tests (`tests/`).

```
┌───────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (React + Vite + TS)                       │
│  Landing │ Public Finder │ Hospital Portal │ Blood Bank │ Admin │ 3D View │
│            Recharts Analytics │ Motion UI │ Shared Zod Schemas            │
└────────────────────────────────────┬──────────────────────────────────────┘
                                     │ HTTPS / JSON REST (/api/v1/*)
┌────────────────────────────────────▼──────────────────────────────────────┐
│                     SERVER (Express.js + TypeScript)                      │
│  Helmet Headers │ CORS Policy │ Rate Limiter (Ph 2) │ Zod Request Guard   │
│  Auth Middleware (Ph 2) │ Controllers │ Prediction Engine (Ph 5)          │
│  Data Provider Abstraction (Verified Manual / Demo / e-RaktKosh Adapter)  │
└──────────────┬───────────────────────────────────────────┬────────────────┘
               │ Prisma ORM (Parameterized SQL)            │ HTTPS (Server-Side Only)
┌──────────────▼──────────────┐             ┌──────────────▼────────────────┐
│   Neon PostgreSQL (Ph 2+)   │             │  External Services (Ph 2–5)   │
│   Connection Pooled (PgBouncer)           │  - Google OAuth 2.0           │
│   15-Table Relational Schema│             │  - Google Gemini API          │
└─────────────────────────────┘             │  - Authorized e-RaktKosh API  │
                                            └───────────────────────────────┘
```

---

## 2. Frontend Architecture (`client/`)

- **Framework:** React 19 with TypeScript and Vite.
- **Styling:** Tailwind CSS v4 with a clinical deep-navy, medical-blue, and neutral-slate design system.
- **Charts & Visualization:** Recharts for blood group distribution, regional shortage risk breakdown, and 7-day trend projections.
- **3D Network Topology:** Three.js WebGL interactive network visualization showcasing regional hub coordination with software-WebGL detection, procedural PBR materials, and `RoomEnvironment` lighting.
- **State & Navigation:** Client-side route/view state with modular page views (`LandingPage`, `LoginPage`, `SignupPage`, `MainDashboard`, `BloodAvailabilityPage`, `HospitalDashboard`, `BloodBankDashboard`, `AdminDashboard`) and shared layout shell (`AppShell`).
- **Demo Mode Boundary (Phase 1):** Local demo state and `/api/v1/network/*` demo endpoints clearly stamped with `isDemoData: true` and `DEMO DATA` UI indicators.

---

## 3. Backend Architecture (`server/`)

The Express backend follows a strict layered architecture compatible with both standalone Node execution and Vercel Serverless Functions:

- **`server/src/config/`**: Environment validation (`env.ts`) and Neon PostgreSQL / Prisma configuration (`database.ts`).
- **`server/src/middleware/`**:
  - `security.ts`: Helmet baseline HTTP headers and strict CORS origin allowlisting.
  - `validate.ts`: Reusable Zod schema validation middleware for `body`, `query`, and `params`.
  - `errorHandler.ts`: Centralized error normalizer returning generic client-safe JSON messages while logging structured diagnostics server-side.
- **`server/src/routes/`**: Versioned REST routes (`/api/health`, `/api/v1/network/*`).
- **`server/src/controllers/`**: Request handlers delegating business logic cleanly without leaking database or stack internals.
- **`server/src/services/`**: Data-provider abstraction boundary (`dataProvider.ts` planned for Phase 3+) separating verified DB inventory, synthetic demo datasets, and future authorized e-RaktKosh adapters.

---

## 4. Database Architecture (`server/prisma/schema.prisma`)

Designed for Neon PostgreSQL (serverless connection pooling via `DATABASE_URL` + direct migration connection via `DIRECT_DATABASE_URL`). Covers 15 relational tables:

1. `users` — Authenticated accounts, hashed password/OAuth subject, role (`PUBLIC`, `HOSPITAL_COORDINATOR`, `BLOOD_BANK_OFFICER`, `ADMIN`).
2. `organizations` — Registered legal healthcare entities (Hospitals and Blood Banks).
3. `organization_verifications` — License numbers (e.g., SBTC/CDSCO registration), verification status, reviewer audit trail.
4. `hospitals` — Hospital capacity, trauma tier, emergency contact metadata.
5. `blood_banks` — Component separation capability, storage capacity, operating hours.
6. `locations` — Standardized Indian state, district, city, pin code, and latitude/longitude coordinates.
7. `blood_inventory` — Blood group, component (`WHOLE_BLOOD`, `PRBC`, `PLATELETS`, `FFP`, `CRYO`), units available, expiry timestamp, source attribution (`VERIFIED_MANUAL`, `ERAKTKOSH_SYNC`, `DEMO_SYNTHETIC`), verification flag.
8. `inventory_history` — Immutable ledger of stock additions, issues, transfers, and expirations.
9. `blood_requests` — Emergency and scheduled hospital requests with urgency (`CRITICAL`, `HIGH`, `ROUTINE`) and fulfillment status.
10. `blood_request_matches` — Ranked candidate blood banks matched by availability, distance, and expiry priority.
11. `shortage_predictions` — Deterministic forecast outputs (days of stock cover, risk score, horizon hours, model version) plus optional Gemini natural-language summary.
12. `notifications` — In-app alert records for shortage thresholds and request state transitions.
13. `data_sources` — Registry of upstream inventory feeds and sync reliability metadata.
14. `sync_logs` — Execution history, record counts, and status for external ingestion runs.
15. `audit_logs` — Security and compliance trail for sensitive mutations, approvals, and login events.

---

## 5. API Design (REST Contract)

| Endpoint | Method | Purpose | Phase |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Service liveness, runtime mode, DB configuration status | Phase 1 |
| `/api/v1/network/summary` | `GET` | Aggregated demo network KPIs and blood group totals | Phase 1 |
| `/api/v1/network/availability` | `GET` | Filterable blood inventory search (Zod-validated query params) | Phase 1 (Demo) / Phase 3 |
| `/api/v1/auth/*` | `POST` | Login, signup, Google OAuth callback, session logout | Phase 2 |
| `/api/v1/hospitals/requests` | `GET/POST` | Emergency blood requests & candidate matching | Phase 4 |
| `/api/v1/blood-banks/inventory` | `GET/POST/PATCH` | Batch inventory logging and expiry management | Phase 4 |
| `/api/v1/predictions/shortages` | `GET/POST` | Deterministic shortage scoring + Gemini summary | Phase 5 |
| `/api/v1/admin/verifications` | `GET/PATCH` | Institutional onboarding approval & audit logs | Phase 6 |

---

## 6. Planned Phase Flows (Phases 2–5)

### Authentication Flow (Phase 2)
- Email/password (Argon2id/scrypt hashed) or Google OAuth 2.0 via server-side exchange.
- HttpOnly, Secure, SameSite=None partitioned cookies or signed server session store in PostgreSQL.
- Middleware enforces both `user.role` and `organizationId` ownership on every mutation.

### AI Prediction Flow (Phase 5)
1. Backend queries `blood_inventory` (excluding expired/quarantined units) and 30-day `inventory_history`.
2. Deterministic engine computes:
   - `daily_burn_rate = weighted_consumption_units / window_days`
   - `days_of_stock_cover = usable_units / max(daily_burn_rate, floor)`
   - `expiry_loss_48h = units expiring within 48h`
   - `regional_risk_score` (0–100 normalized score mapped to `LOW`, `MODERATE`, `CRITICAL`).
3. Structured JSON summary is passed to `@google/genai` (`gemini-2.5-flash`) on the server to generate concise operational redistribution guidance.
4. Gemini never fabricates stock numbers or clinical blood compatibility rules.

---

## 7. e-RaktKosh Integration Strategy

Reference: C-DAC / Ministry of Health & Family Welfare (`https://eraktkosh.mohfw.gov.in/` and `https://cdac.gov.in/index.aspx?id=product_details&productId=e-RaktKosh`).

- **No Unauthorized Scraping:** The platform will never scrape restricted portals or bypass authentication.
- **Provider Abstraction:** An `InventoryDataProvider` interface abstracts three clean sources:
  1. `VerifiedFacilityProvider` (authenticated hospital/blood bank portal submissions)
  2. `AuthorizedERaktKoshProvider` (ready for official API key / institutional MoU credentials via `ERAKTKOSH_API_BASE_URL` and `ERAKTKOSH_API_KEY`)
  3. `DemoSyntheticProvider` (explicitly tagged `DEMO_SYNTHETIC` for hackathon evaluation).
- Every record retains `sourceType`, `verificationStatus`, and `lastUpdatedAt` so users can immediately distinguish verified live records from stale or demo entries.

---

## 8. Folder & File Structure

```
.
├── client/
│   └── src/
│       ├── components/
│       │   ├── charts/          # Recharts visualizations
│       │   ├── layout/          # Sidebar, top bar, footer, demo banner
│       │   ├── three/           # Three.js 3D regional network visualizer
│       │   └── ui/              # Reusable cards, buttons, tables, states
│       ├── data/                # Explicitly labeled DEMO DATA fixtures
│       ├── pages/               # Landing, Login, Signup, Main, Availability, Portals
│       ├── services/            # Typed frontend API client
│       ├── types/               # Frontend view-model interfaces
│       └── App.tsx              # Client router & view coordinator
├── server/
│   ├── prisma/
│   │   └── schema.prisma        # 15-model Neon PostgreSQL schema draft
│   └── src/
│       ├── config/              # Env & Prisma config (no live DB required in Ph 1)
│       ├── controllers/         # Route handlers
│       ├── middleware/          # Security headers, CORS, Zod validation, error handler
│       ├── routes/              # Health & v1 network routes
│       └── app.ts               # Express app factory (Vercel-compatible)
├── shared/
│   ├── constants/               # Blood groups, components, risk tiers
│   ├── schemas/                 # Shared Zod validation schemas
│   └── types/                   # Shared API DTOs
├── docs/                        # prd.md, architecture.md, rules.md, phases.md, design.md
├── tests/                       # Phase 1 smoke & schema validation tests
├── src/                         # Root Vite mount bridge
├── server.ts                    # Unified dev/prod server entrypoint (port 3000)
├── index.html
├── package.json
└── .env.example
```

---

## 9. Deployment Architecture (Vercel + Neon)

- **Stateless Express Handler:** `server/src/app.ts` exports the Express app without internal background workers or local disk state, enabling clean wrapping as a Vercel Serverless Function (`/api/*`) while serving the built `dist/` SPA via CDN.
- **Neon PostgreSQL:** Serverless driver / pooled connection string (`DATABASE_URL` with `-pooler`) prevents connection exhaustion across ephemeral lambdas.
- **Scheduled Jobs:** Periodic shortage recalculations and sync jobs (Phase 5+) will trigger via Vercel Cron hitting authenticated internal endpoints rather than `setInterval` inside request handlers.

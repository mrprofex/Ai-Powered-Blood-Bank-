# Product Requirements Document (PRD)
## Predictive Emergency Blood Shortage Network

---

## 1. Project Vision

Transform emergency blood management across India from fragmented, reactive phone calls into a proactive, predictive coordination network connecting hospitals, licensed blood banks, regional health coordinators, and citizens seeking verified blood availability.

---

## 2. Problem Definition

Blood availability across Indian hospitals and blood banks frequently suffers from localized imbalances:

- **Delayed Visibility:** Families and hospital coordinators spend critical hours calling individual blood banks during trauma, obstetric emergencies, or surgical scheduling.
- **Unanticipated Shortages:** Sudden dengue surges, seasonal donation drops, and regional trauma spikes exhaust rare blood groups (`O-`, `AB-`, `B-`) before replenishment orders are triggered.
- **Preventable Expiry Wastage:** Packed Red Blood Cells (PRBC), platelets (5-day shelf life), and plasma units expire in surplus facilities while neighboring hospitals face acute deficits.
- **Fragmented Data Attribution:** Existing public records lack unified expiry-aware days-of-stock-cover analytics or verifiable source attribution distinguishing live feeds from stale or simulated records.

---

## 3. Core Objectives

1. **Centralized Network Visibility:** Aggregate blood group availability (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`) across verified hospitals and blood banks with explicit source attribution and last-updated timestamps.
2. **Predictive Shortage Prevention:** Calculate days-of-stock-cover, expiry velocity, and regional demand pressure deterministically, surfacing actionable early warnings 48–96 hours ahead of critical stockouts.
3. **Intelligent Inter-Facility Coordination:** Match emergency hospital blood requests against nearby blood banks with healthy surplus and minimal cold-chain transit distance.
4. **Public Blood Discovery:** Provide patients and families an accessible, location-aware search interface with clear clinical disclaimers.
5. **Auditability & Trust:** Enforce role-based access control, verification workflows for institutions, and immutable audit logs for every inventory change.

---

## 4. Target Users & Personas

### Persona 1: Dr. Priya Sharma — Hospital Transfusion Coordinator (Hospital Portal)
- **Context:** Tertiary trauma hospital in Bengaluru managing 40+ surgical and emergency transfusions weekly.
- **Pain Points:** Discovers `O-` or platelet shortfalls only hours before surgery; relies on manual WhatsApp groups to locate units.
- **Goal:** Monitor internal stock cover, broadcast verified emergency requests, and receive ranked nearby blood bank matches.

### Persona 2: Rajesh Kulkarni — Blood Bank Inventory Officer (Blood Bank Portal)
- **Context:** Regional licensed blood center storing 1,200+ units across components (Whole Blood, PRBC, Platelets, FFP).
- **Pain Points:** Platelet units expire within 5 days; difficult to notify neighboring hospitals about impending surplus before wastage.
- **Goal:** Log batch updates with expiry dates, monitor near-expiry alerts, and approve incoming inter-facility transfer requests.

### Persona 3: Ananya Verma — Citizen / Patient Attendant (Public Blood Finder)
- **Context:** Searching urgently for `B-` PRBC units in Pune for a scheduled oncology procedure.
- **Pain Points:** Outdated phone numbers and uncertainty over whether listed inventory is verified or stale.
- **Goal:** Search by city, blood group, and component with clear verification timestamps and direct institutional contact details.

### Persona 4: Vikram Nair — State Health Network Administrator (Admin Portal)
- **Context:** Oversees multi-district blood supply resilience and institutional onboarding.
- **Pain Points:** Cannot easily audit which facilities have stale data or approve new blood bank registrations securely.
- **Goal:** Verify organization licenses, monitor sync health, and inspect regional shortage risk heatmaps.

---

## 5. Functional Requirements

| ID | Module | Requirement | Target Phase |
| :--- | :--- | :--- | :--- |
| FR-01 | Public Finder | Search verified blood inventory by state, city, blood group, and component type | Phase 3 |
| FR-02 | Public Finder | Display source attribution (`VERIFIED`, `STALE`, `DEMO`) and last-updated timestamp on every record | Phase 1 / 3 |
| FR-03 | Hospital Portal | Submit emergency blood requests with urgency level, units needed, and clinical window | Phase 4 |
| FR-04 | Hospital Portal | View ranked matching blood banks based on stock availability, expiry, and distance | Phase 4 |
| FR-05 | Blood Bank Portal | Manage batch inventory including component type, unit count, and expiry date | Phase 4 |
| FR-06 | Blood Bank Portal | Flag batches expiring within 7 days for priority redistribution | Phase 4 |
| FR-07 | Prediction Engine | Compute days-of-stock-cover, consumption velocity, and shortage risk tier (`LOW`, `MODERATE`, `CRITICAL`) | Phase 5 |
| FR-08 | AI Explainability | Generate human-readable operational recommendations using Gemini from validated backend calculations | Phase 5 |
| FR-09 | Auth & RBAC | Server-side session authentication, Google OAuth, and organization-scoped authorization | Phase 2 |
| FR-10 | Admin Portal | Review and verify hospital/blood bank registrations, inspect audit logs and sync status | Phase 6 |

---

## 6. Non-Functional Requirements

- **Security:** Strict Zod input validation, parameterized Prisma queries, CSRF protection, rate limiting on auth/public routes, Helmet HTTP headers, and zero secrets in frontend bundles.
- **Clinical Safety:** The platform never performs automated blood crossmatching, compatibility clearance, or clinical release decisions. All transfusions remain subject to qualified medical professionals and NACO/NBTC protocols.
- **Accessibility:** WCAG 2.1 AA color contrast, keyboard-navigable controls, semantic HTML, and explicit text labels alongside status colors.
- **Performance & Deployment:** Serverless-compatible Express + Vite architecture targeting Vercel and Neon PostgreSQL connection pooling.
- **Transparency:** Simulated demo datasets must be explicitly labeled `DEMO DATA` across all interfaces.

---

## 7. Core Features & User Journeys

### Journey A: Demo Stakeholder Exploration (Phase 1)
1. Visitor opens Landing Page, inspects platform mission, regional network topology, and safety principles.
2. Navigates to Demo Login or clicks **Explore Demo Network** to enter the Main Dashboard.
3. Views simulated national metrics, blood group stock charts, shortage risk distribution, and switches between **Public Blood Availability**, **Hospital Portal**, **Blood Bank Portal**, and **Admin Portal**.

### Journey B: Hospital Emergency Request & Matching (Phase 4–5)
1. Verified Hospital Coordinator logs in, sees `O-` stock cover drop below 1.5 days.
2. Submits a request for 6 units of `O-` PRBC.
3. Matching service scores nearby licensed blood banks by available unreserved units, proximity, and freshness.
4. Blood Bank Officer accepts allocation and updates transfer status; audit log records every state change.

---

## 8. Acceptance Criteria (Phase 1 Foundation)

- Complete 5-document engineering specification in `docs/`.
- Organized modular repository (`client/`, `server/`, `shared/`, `docs/`, `tests/`).
- Working responsive UI across Landing, Demo Login/Signup, Main Dashboard, Blood Availability, Hospital, Blood Bank, and Admin views.
- Clear `DEMO DATA` labeling on all simulated figures and non-production auth notices on Login/Signup.
- Express backend serving `/api/health` and validated demo summary routes with Zod, CORS, Helmet, and centralized error handling.
- Initial 15-model Prisma schema prepared for Neon PostgreSQL without requiring live credentials.

---

## 9. Hackathon MVP Scope vs. Future Enhancements

### Hackathon MVP Scope (Phases 1–6)
- Public Blood Finder with interactive map (Leaflet + OpenStreetMap) and availability filters.
- Role-based Hospital and Blood Bank portals with real PostgreSQL persistence.
- Deterministic shortage prediction engine paired with Gemini natural-language action summaries.
- e-RaktKosh-compatible data provider abstraction supporting verified submissions and demo datasets.

### Future Enhancements (Post-Hackathon)
- Official institutional integration with C-DAC e-RaktKosh APIs upon MoHFW authorization.
- Cold-chain IoT temperature telemetry ingestion during inter-facility dispatch.
- SMS / WhatsApp emergency alerts via verified DLT-registered Indian telecom gateways.
- Automated voluntary donor drive scheduling during predicted seasonal deficits.

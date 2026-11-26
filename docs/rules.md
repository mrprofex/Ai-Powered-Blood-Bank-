# Engineering Rules & Security Standards
## Predictive Emergency Blood Shortage Network

---

## 1. Coding Conventions & TypeScript Rules

- **Strict TypeScript:** Avoid `any`; use explicit interfaces, discriminated unions, and Zod-inferred types (`z.infer<typeof Schema>`).
- **Module Boundaries:**
  - `client/` may import from `shared/`, never from `server/`.
  - `server/` may import from `shared/`, never from `client/`.
  - `shared/` must remain runtime-agnostic (no Node `fs`/`crypto` or browser `window`/`document` dependencies).
- **Functional React:** Use functional components, typed props, and focused hooks. Keep side effects isolated and clean up subscriptions/WebGL contexts on unmount.

---

## 2. Naming Conventions

- **Components:** `PascalCase.tsx` (e.g., `BloodAvailabilityPage.tsx`, `NetworkTopology3D.tsx`).
- **Hooks & Utilities:** `camelCase.ts` (e.g., `useDemoSession.ts`, `formatDate.ts`).
- **Backend Modules:** `camelCase.ts` grouped by responsibility (`networkController.ts`, `errorHandler.ts`).
- **Database Tables & Columns:** `snake_case` mapped via Prisma `@map` and `@@map` directives.
- **Environment Variables:** `SCREAMING_SNAKE_CASE`; server-only secrets must NEVER carry the `VITE_` prefix.

---

## 3. Security Standards

1. **Secrets Management:** Never commit `.env` files or hardcode API keys, database URLs, or OAuth secrets. Every required variable must be documented safely in `.env.example`.
2. **Client Bundle Isolation:** `GEMINI_API_KEY`, `DATABASE_URL`, `GOOGLE_CLIENT_SECRET`, and `SESSION_SECRET` must reside exclusively on the server.
3. **Baseline HTTP Headers:** Configure Helmet security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-DNS-Prefetch-Control`, etc.) and strict CORS allowlisting.
4. **Authentication & RBAC (Phase 2+):**
   - Hash passwords with Argon2id or `crypto.scrypt` with per-user salts.
   - Enforce server-side session verification and organization-level ownership checks on every protected route.
   - Apply strict per-IP and per-account rate limiting with exponential backoff on auth endpoints.
5. **No Unsafe HTML Rendering:** Never use `dangerouslySetInnerHTML`, `innerHTML`, or raw `document.write`.

---

## 4. API Development & Validation Rules

- **Zod Everywhere:** Validate all request `body`, `query`, and `params` on the server using `validateRequest` middleware before reaching controller logic.
- **Bounded Queries:** Enforce explicit min/max bounds on pagination (`limit <= 100`), string lengths, and allowed enum values (`BloodGroup`, `ComponentType`, `RiskLevel`).
- **Consistent Response Envelope:** Return predictable JSON payloads (`{ status, data, meta }` or `{ status: "error", message }`).

---

## 5. Error Handling & Logging Rules

- **Generic User Errors:** Return sanitized, user-friendly messages on `4xx`/`5xx` responses. Never leak stack traces, file paths, SQL queries, or raw Zod internal structures in production errors.
- **Structured Server Logging:** Log request ID, route, error class, and timestamp server-side. Never log passwords, session tokens, PII, or API keys.
- **Client Logging Hygiene:** Keep sensitive diagnostic payloads out of `console.log` in client code.

---

## 6. Database Rules (Phase 2+)

- **Parameterized Queries Only:** All SQL interactions must go through Prisma Client parameterized operations; avoid `$queryRawUnsafe`.
- **Transactions for Inventory Mutations:** Any blood request allocation or stock adjustment must execute inside `prisma.$transaction(...)` updating both `blood_inventory` and `inventory_history` atomically.
- **Audit Trail:** Write an `audit_logs` entry for verification changes, emergency allocations, and privilege modifications.

---

## 7. AI & Clinical Safety Rules (Phase 5+)

- **Deterministic Calculations First:** Shortage risk scores, days-of-stock-cover, and matching rankings must be computed deterministically in TypeScript/SQL—never delegated to an LLM.
- **Grounded Narrative Only:** Gemini receives validated summary metrics and produces human-readable operational recommendations. It must never invent inventory quantities, hospital names, or expiry timestamps.
- **No Clinical Compatibility Decisions:** The software does NOT replace laboratory crossmatching, antibody screening, or transfusion medicine sign-off. Every availability view must display a clinical verification notice.

---

## 8. Dependency Management & Testing Requirements

- **Minimal Footprint:** Approve every new dependency against bundle size, security track record, and Phase requirements. Do not introduce MongoDB, duplicate chart libraries, or unused UI kits.
- **Testing Standards:**
  - Unit tests (`tests/`) for shared Zod schemas, risk math, and helper utilities.
  - Integration tests (Phase 2+) via Supertest for API validation and authorization boundaries.
  - End-to-end checks (Phase 6) via Playwright covering critical search and portal workflows.
- **Honest Verification:** Never claim a test, security check, or external integration is verified unless it has actually been executed and passed.

---

## 9. Things Developers Must Avoid

- Do not claim demo authentication provides real account security.
- Do not label synthetic demo records as verified live hospital stock.
- Do not scrape external government websites (`e-RaktKosh`) or invent undocumented endpoints.
- Do not run infinite background loops inside serverless API request handlers.
- Do not commit `.env` files or expose server secrets in `VITE_*` variables.

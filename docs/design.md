# UI/UX Design System
## Predictive Emergency Blood Shortage Network

---

## 1. Design Philosophy

Healthcare coordination interfaces must inspire immediate institutional trust, clarity under high-pressure emergency triage, and effortless scannability across desktop command centers and mobile devices.

Core principles:
- **Clinical Precision Over Decoration:** Clean typography, restrained neutral surfaces, and strict visual hierarchy.
- **No Ambiguous Color-Only Signals:** Every semantic risk color (healthy green, moderate amber, critical crimson) is paired with an explicit text label and icon.
- **Explicit Data Provenance:** Simulated metrics are clearly marked `DEMO DATA` so clinicians and evaluators never confuse demo states with live hospital stock.
- **Single-Elevation Depth:** Subtle `1px` borders on crisp surfaces instead of nested "cards within cards" or heavy drop shadows.

---

## 2. Color System (60–30–10 Discipline)

- **60% Neutral Canvas:**
  - Light Surface Background: `#F8FAFC` (Slate 50)
  - Elevated White Surface: `#FFFFFF`
  - Deep Navy Hero / Command Dark Surface: `#0B1324` (Midnight Navy)
- **30% Structural Surfaces & Ink:**
  - Primary Ink: `#0F172A` (Slate 900)
  - Secondary Ink: `#475569` (Slate 600)
  - Hairline Dividers: `#E2E8F0` (Slate 200) / `#1E293B` (Slate 800 on dark)
- **10% Accent & Semantic Status:**
  - Medical Blue Primary Action: `#1D4ED8` (Blue 700, hover `#1E40AF`)
  - Healthy Inventory (`LOW` risk): `#16A34A` (Emerald/Green 600)
  - Moderate Shortage Risk (`MODERATE`): `#D97706` (Amber 600)
  - Critical Shortage Risk (`CRITICAL`): `#DC2626` (Crimson Red 600)

---

## 3. Typography (2+1 Font System)

- **Display & Headings:** `Plus Jakarta Sans` (Weights `600`, `700`; tight tracking `-0.02em`, `text-wrap: balance` to avoid orphan words).
- **Body & Controls:** `DM Sans` (Weights `400`, `500`, `600`; `15px–16px` prose, `1.5–1.65` line height).
- **Tabular Data & Telemetry:** `JetBrains Mono` with `font-variant-numeric: tabular-nums` on all inventory counts, timestamps, blood unit totals, and forecast numbers.

---

## 4. Spacing & Layout Architecture

- **Public Pages (Landing, Login, Signup):**
  - Clean 3-zone top bar (`[Brand Title] — [4–5 concise nav links] — [1 Primary CTA]`), `whitespace-nowrap` links, zero status tickers or badges attached to the brand mark.
  - Generous section rhythm (`py-16` to `py-24`) with max content width `1280px` (`max-w-7xl`).
- **Workspace Dashboards (Main, Availability, Hospital, Blood Bank, Admin):**
  - Collapsible `256px` left navigation sidebar + clean top bar with view breadcrumb and demo profile switcher + responsive main viewport.
  - Minimum `16px–24px` container padding; clean hairline dividers separating list rows (`36px–44px` compact table row density).

---

## 5. Components & Controls

- **Zero-Pill Metadata Discipline:** Static metadata (timestamps, facility types, city tags, blood group counts) renders as clean inline text with `·` or `/` separators rather than pill badges.
- **Interactive Segmented Controls:** Filter bars (blood group selectors, portal view tabs) use crisp `<button>` elements inside segmented rails.
- **Buttons:** Primary medical blue (`#1D4ED8`), secondary outline (`border-slate-300`), and danger/emergency actions (`#DC2626`), with `>= 40px` touch target height (`>= 44px` on mobile) and visible focus rings (`focus-visible:ring-2`).
- **Forms:** Explicit `<label>` associations, accessible validation feedback, inline helper text, and clear demo-mode notices on Login/Signup.
- **State Completeness:** Every table/list supports loading skeletons, empty states with recovery actions, and search/filter controls.

---

## 6. Charts, Maps & 3D Topology

- **Recharts Visualizations:**
  - Blood Group Inventory Bar Chart (showing available units vs. minimum safety threshold).
  - Regional Shortage Risk Breakdown & 7-Day Projected Demand Area/Line Chart.
  - Custom clinical tooltips using tabular numerals and high-contrast borders.
- **Three.js 3D Network Topology:**
  - Interactive WebGL visualization modeling regional blood distribution hubs across India using composite 3–12 part procedural nodes (`THREE.Group`), `RoomEnvironment` PBR reflections, warm/cool studio lighting, and `OrbitControls` with smooth exponential damping.
  - Includes software-WebGL detection (`isSoftwareGl`), on-demand/paced rendering, and a static 2D fallback if WebGL is unavailable.
- **Map Design (Phase 3):**
  - Leaflet + OpenStreetMap with color-and-icon-coded facility pins, cluster support, and distance radius filtering.

---

## 7. Animation & Accessibility Standards

- **Motion (`motion/react`):** Subtle `150ms–200ms` transitions (`cubic-bezier(0.16, 1, 0.3, 1)`) animating compositor properties (`opacity`, `transform`) only. Respects `prefers-reduced-motion`.
- **No Decorative Pulsing Dots:** Never place pulsing green/red dots next to headings or static cards.
- **WCAG 2.1 AA Compliance:** Minimum `4.5:1` contrast for normal text, `3:1` for large headings/UI icons, keyboard focus management, and `aria-label` attributes on icon-only controls.

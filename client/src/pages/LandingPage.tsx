import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  ArrowRight,
  Building2,
  Droplets,
  Lock,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { UserRole } from '../../../shared/constants/bloodNetwork.ts';
import type { NetworkSummaryResponse } from '../../../shared/types/network.ts';
import { BloodCompatibilityExplorer } from '../components/landing/BloodCompatibilityExplorer.tsx';
import { FlexCarouselOGL } from '../components/landing/FlexCarouselOGL.tsx';
import { NetworkTopology3D } from '../components/landing/NetworkTopology3D.tsx';
import {
  AnimatedCounter,
  BlurText,
  FadeContent,
  Magnet,
  ScrollProgressBar,
  ScrollReveal,
  SpotlightCard,
} from '../components/motion/MotionPrimitives.tsx';
import { ModalDialog } from '../components/ui/ConfirmModal.tsx';
import { PaletteSwitcher } from '../components/ui/PaletteSwitcher.tsx';
import {
  ClinicalDisclaimerNotice,
  DemoNoticeBanner,
  RiskStatusIndicator,
} from '../components/ui/UiPrimitives.tsx';
import { FALLBACK_DEMO_SUMMARY } from '../data/demoPortalData.ts';
import { fetchNetworkSummary } from '../services/networkApi.ts';
import type { PaletteId } from '../theme/palettes.ts';
import type { AppPage } from '../types/navigation.ts';

interface LandingPageProps {
  onNavigate: (page: AppPage) => void;
  onEnterWorkspaceRole?: (role: UserRole, targetPage: AppPage, searchQuery?: string) => void;
  activePaletteId: PaletteId;
  onChangePalette: (id: PaletteId) => void;
}

type FooterDocKey = 'about' | 'contact' | 'privacy' | 'terms' | 'emergency' | null;

export function LandingPage({
  onNavigate,
  onEnterWorkspaceRole,
  activePaletteId,
  onChangePalette,
}: LandingPageProps) {
  const [heroImgError, setHeroImgError] = useState(false);
  const [footerDoc, setFooterDoc] = useState<FooterDocKey>(null);
  const [summary, setSummary] = useState<NetworkSummaryResponse | null>(null);

  useEffect(() => {
    let active = true;
    fetchNetworkSummary()
      .then((data) => {
        if (active && data) setSummary(data);
      })
      .catch(() => {
        // Fallback summary values already rendered below
      });
    return () => {
      active = false;
    };
  }, []);

  const openPortal = (role: UserRole, page: AppPage, searchQuery?: string) => {
    if (onEnterWorkspaceRole) {
      onEnterWorkspaceRole(role, page, searchQuery);
    } else {
      onNavigate(page);
    }
  };

  const kpis = summary?.kpis ?? FALLBACK_DEMO_SUMMARY.kpis;
  const bloodGroupPreview = summary?.bloodGroupOverview ?? FALLBACK_DEMO_SUMMARY.bloodGroupOverview;
  const regionalOverview =
    summary?.regionalRiskOverview ?? FALLBACK_DEMO_SUMMARY.regionalRiskOverview;

  return (
    <div className="min-h-screen bg-white text-[var(--bn-text)] transition-colors duration-300">
      <ScrollProgressBar />

      {/* Strict 3-Zone Top Bar Contract with Theme Palette Studio */}
      <header className="sticky top-0 z-40 border-b border-[var(--bn-border)] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
          {/* Zone 1: Single clean wordmark */}
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2 font-display text-base font-semibold tracking-tight text-[var(--bn-primary)] whitespace-nowrap shrink-0 text-left"
          >
            <Droplets className="h-4 w-4 text-[var(--bn-primary)]" aria-hidden="true" />
            Predictive Blood Network
          </button>

          {/* Zone 2: Clean single-line text nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--bn-muted)]">
            <a
              href="#topology-3d"
              className="hover:text-[var(--bn-primary)] transition-colors whitespace-nowrap shrink-0"
            >
              3D Topology
            </a>
            <a
              href="#workflows"
              className="hover:text-[var(--bn-primary)] transition-colors whitespace-nowrap shrink-0"
            >
              Workflows
            </a>
            <a
              href="#availability-preview"
              className="hover:text-[var(--bn-primary)] transition-colors whitespace-nowrap shrink-0"
            >
              Availability
            </a>
            <a
              href="#portals"
              className="hover:text-[var(--bn-primary)] transition-colors whitespace-nowrap shrink-0"
            >
              Portals
            </a>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="hover:text-[var(--bn-primary)] transition-colors whitespace-nowrap shrink-0"
            >
              Sign In
            </button>
          </nav>

          {/* Zone 3: Palette Studio + Primary CTA */}
          <div className="flex items-center gap-2.5 shrink-0">
            <PaletteSwitcher
              activePaletteId={activePaletteId}
              onChangePalette={onChangePalette}
              compact
            />
            <Magnet>
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="clinical-btn inline-flex min-h-[38px] items-center gap-2 rounded-lg bg-[var(--bn-primary)] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[var(--bn-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bn-primary)] whitespace-nowrap shrink-0 shadow-sm"
              >
                Open Dashboard
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </button>
            </Magnet>
          </div>
        </div>
      </header>

      <main>
        {/* Centered clinical network hero */}
        <section className="relative overflow-hidden border-b border-[var(--bn-border)] bg-gradient-to-b from-[var(--bn-soft-bg)]/70 via-white to-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 clinical-dot-grid opacity-30"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full opacity-25 blur-3xl"
            style={{ background: 'radial-gradient(circle, var(--bn-spotlight), transparent 70%)' }}
          />

          <div className="relative z-10 mx-auto max-w-7xl space-y-8 px-4 pt-6 pb-12 sm:px-6 lg:pt-8 lg:pb-16">
            <DemoNoticeBanner context="India Healthcare Coordination Foundation" compact variant="light" />

            <FadeContent>
              <div className="relative isolate overflow-hidden rounded-[26px] border border-[var(--bn-accent)]/55 bg-[var(--bn-primary-deep)] shadow-[0_24px_70px_-24px_rgba(14,50,36,0.32)]">
                {!heroImgError ? (
                  <motion.img
                    initial={{ scale: 1.04 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    src="/src/assets/images/hero_green_clinical_network_1795672723523.jpg"
                    alt="Bright, modern hospital blood bank and coordination center"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgError(true)}
                    className="absolute inset-0 -z-20 h-full w-full object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-20 bg-gradient-to-br from-[var(--bn-secondary)] to-[var(--bn-primary-deep)]"
                  />
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--bn-primary-deep)]/50 via-[var(--bn-primary-deep)]/55 to-[var(--bn-primary-deep)]/80"
                />

                <div className="flex min-h-[500px] flex-col items-center justify-center px-5 py-12 text-center text-white sm:px-10 sm:py-14 lg:min-h-[530px]">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/10 px-3.5 py-1.5 text-xs font-semibold text-[var(--bn-accent-soft)] backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--bn-accent)]" aria-hidden="true" />
                    Predictive Healthcare Coordination · Phase 1 Demo
                  </div>

                  <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                    <BlurText text="Predict Shortages." />{' '}
                    <span className="text-[var(--bn-accent)]">
                      <BlurText text="Coordinate Faster." delay={0.08} />
                    </span>
                  </h1>

                  <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
                    Unite licensed blood banks and hospital transfusion services in one calm command
                    platform. Detect shortages early and coordinate verified inventory across India.
                  </p>

                  <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    <Magnet>
                      <button
                        type="button"
                        onClick={() => onNavigate('login')}
                        className="clinical-btn inline-flex min-h-[46px] items-center gap-2 rounded-full bg-[var(--bn-accent)] px-6 py-2.5 text-sm font-semibold text-[var(--bn-primary-deep)] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        Sign In to Workspace
                        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                      </button>
                    </Magnet>
                    <button
                      type="button"
                      onClick={() => openPortal('PUBLIC', 'availability')}
                      className="clinical-btn inline-flex min-h-[46px] items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20"
                    >
                      <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Search Availability
                    </button>
                  </div>

                  <div className="mt-10 grid w-full max-w-4xl grid-cols-2 gap-y-5 border-t border-white/20 pt-6 sm:grid-cols-4 sm:gap-0">
                    <div className="px-3 sm:border-r sm:border-white/20">
                      <p className="font-mono-tabular text-2xl font-semibold text-[var(--bn-accent)] sm:text-3xl">
                        <AnimatedCounter value={kpis.registeredHospitals} />
                      </p>
                      <p className="mt-1 text-[11px] text-white/75 sm:text-xs">Hospitals · DEMO</p>
                    </div>
                    <div className="px-3 sm:border-r sm:border-white/20">
                      <p className="font-mono-tabular text-2xl font-semibold text-[var(--bn-accent)] sm:text-3xl">
                        <AnimatedCounter value={kpis.registeredBloodBanks} />
                      </p>
                      <p className="mt-1 text-[11px] text-white/75 sm:text-xs">Blood Banks · DEMO</p>
                    </div>
                    <div className="px-3 sm:border-r sm:border-white/20">
                      <p className="font-mono-tabular text-2xl font-semibold text-[var(--bn-accent)] sm:text-3xl">
                        <AnimatedCounter value={kpis.availableBloodUnits} />
                      </p>
                      <p className="mt-1 text-[11px] text-white/75 sm:text-xs">Tracked Units · DEMO</p>
                    </div>
                    <div className="px-3">
                      <p className="font-mono-tabular text-2xl font-semibold text-[var(--bn-accent)] sm:text-3xl">
                        <AnimatedCounter value={kpis.activeEmergencyRequests} />
                      </p>
                      <p className="mt-1 text-[11px] text-white/75 sm:text-xs">Emergency Requests · DEMO</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeContent>
          </div>

          {/* Smooth Infinite Regional Corridor Telemetry Ticker */}
          <div className="bn-marquee-group border-t border-[var(--bn-border)] bg-white/90 py-2.5 backdrop-blur-sm overflow-hidden">
            <div className="bn-marquee-track items-center gap-8 px-4 text-xs">
              {[...regionalOverview, ...regionalOverview].map((hub, index) => (
                <button
                  key={`${hub.region}-${index}`}
                  type="button"
                  onClick={() => openPortal('PUBLIC', 'availability', hub.state)}
                  className="inline-flex items-center gap-2.5 whitespace-nowrap text-[var(--bn-muted)] hover:text-[var(--bn-primary)] transition-colors"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      hub.riskLevel === 'CRITICAL'
                        ? 'bg-[#C93440]'
                        : hub.riskLevel === 'MODERATE'
                          ? 'bg-[#B45309]'
                          : 'bg-[var(--bn-secondary)]'
                    }`}
                  />
                  <span className="font-semibold text-[var(--bn-text)]">{hub.region}</span>
                  <span className="font-mono-tabular">
                    {hub.totalUnits.toLocaleString('en-IN')}u
                  </span>
                  <span className="font-mono-tabular text-[11px]">
                    Risk {hub.riskScore}/100 · DEMO
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Three.js 3D Indian Blood Network Topology Section */}
        <section id="topology-3d" className="border-b border-[var(--bn-border)] bg-white py-16">
          <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6">
            <ScrollReveal>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--bn-accent)]">
                    Interactive 3D Network Topology · WebGL
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-semibold text-[var(--bn-text)] sm:text-3xl">
                    National cold-chain corridors in real-time 3D
                  </h2>
                  <p className="mt-2 text-sm text-[var(--bn-muted)]">
                    Orbit across India’s five metropolitan blood coordination clusters, inspect
                    simulated shortage risk scores, and click any hub to explore local stock.
                  </p>
                </div>
                <span className="font-mono-tabular text-xs font-medium text-[var(--bn-muted)]">
                  Three.js Interactive Viewport · DEMO DATA
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.08}>
              <NetworkTopology3D
                regionalData={regionalOverview}
                onExploreRegion={(city) => openPortal('PUBLIC', 'availability', city)}
              />
            </ScrollReveal>
          </div>
        </section>

        {/* React Bits Flex Carousel with OGL WebGL Ambient Backdrop */}
        <section id="workflows" className="border-b border-[var(--bn-border)] bg-[var(--bn-surface-elevated)] py-16">
          <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6">
            <ScrollReveal>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--bn-secondary)]">
                    Core Network Workflows
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-semibold text-[var(--bn-text)] sm:text-3xl">
                    Engineered for proactive blood logistics
                  </h2>
                  <p className="mt-2 text-sm text-[var(--bn-muted)]">
                    Explore how hospital triage, cold-chain inventory vaults, and deterministic
                    shortage prediction operate together across India.
                  </p>
                </div>
                <span className="font-mono-tabular text-xs font-medium text-[var(--bn-muted)]">
                  Interactive Workflow Carousel
                </span>
              </div>
            </ScrollReveal>

            <FlexCarouselOGL onSelectPortal={openPortal} />
          </div>
        </section>

        {/* Blood Availability & Interactive Compatibility Explorer Section */}
        <section id="availability-preview" className="border-b border-[var(--bn-border)] bg-[var(--bn-soft-bg)] py-16">
          <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6">
            <ScrollReveal>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--bn-secondary)]">
                    Network Supply Snapshot · DEMO DATA
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-semibold text-[var(--bn-text)]">
                    Blood group availability &amp; compatibility matrix
                  </h2>
                  <p className="mt-1.5 max-w-2xl text-sm text-[var(--bn-muted)]">
                    Immediate visibility across all eight ABO/Rh groups with days-of-cover thresholds
                    and interactive RBC compatibility exploration.
                  </p>
                </div>
                <Magnet>
                  <button
                    type="button"
                    onClick={() => openPortal('PUBLIC', 'availability')}
                    className="clinical-btn inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[var(--bn-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--bn-secondary)] whitespace-nowrap shrink-0"
                  >
                    <Search className="h-3.5 w-3.5" aria-hidden="true" />
                    Open Public Blood Finder
                  </button>
                </Magnet>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.05}>
              <BloodCompatibilityExplorer
                bloodGroups={bloodGroupPreview}
                onSearchGroup={(grp) => openPortal('PUBLIC', 'availability', grp)}
              />
            </ScrollReveal>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {bloodGroupPreview.map((item) => (
                <SpotlightCard
                  key={item.bloodGroup}
                  asButton
                  onClick={() => openPortal('PUBLIC', 'availability', item.bloodGroup)}
                  className="rounded-xl p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-xl font-bold text-[var(--bn-primary)]">
                      {item.bloodGroup}
                    </span>
                    <RiskStatusIndicator level={item.riskLevel} />
                  </div>
                  <p className="mt-4 font-mono-tabular text-2xl font-semibold text-[var(--bn-text)]">
                    {item.availableUnits.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-[var(--bn-muted)]">units</span>
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-[var(--bn-muted)]">
                    <span>Cover: {item.daysOfCover} days</span>
                    <span className="font-mono-tabular">Min: {item.minimumThreshold}</span>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* Role-Separated Workspaces Section */}
        <section id="portals" className="border-b border-[var(--bn-border)] bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <ScrollReveal className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--bn-secondary)]">
                Role-Separated Architecture
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-semibold text-[var(--bn-text)]">
                Dedicated portals for every healthcare participant
              </h2>
              <p className="mt-2 text-sm text-[var(--bn-muted)]">
                Enter directly into the isolated workspace for Public Searchers, Hospital
                Coordinators, Blood Bank Officers, or Network Administrators.
              </p>
            </ScrollReveal>

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
              <SpotlightCard className="clinical-card-interactive rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-semibold text-[var(--bn-text)]">
                    Hospital Coordination Workspace
                  </h3>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bn-soft-bg)] text-[var(--bn-primary)]">
                    <Building2 className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--bn-muted)]">
                  Submit schema-validated emergency requests, track active trauma queues, and view
                  7-day &amp; 30-day demand predictions.
                </p>
                <button
                  type="button"
                  onClick={() => openPortal('HOSPITAL_COORDINATOR', 'hospital')}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--bn-primary)] hover:text-[var(--bn-secondary)]"
                >
                  Open Hospital Workspace
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </SpotlightCard>

              <SpotlightCard className="clinical-card-interactive rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-semibold text-[var(--bn-text)]">
                    Blood Bank Vault Workspace
                  </h3>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bn-soft-bg)] text-[var(--bn-primary)]">
                    <Droplets className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--bn-muted)]">
                  Manage cold-vault inventory, commit RBAC-verified stock updates, isolate batches
                  expiring within 72 hours, and fulfill hospital requests.
                </p>
                <button
                  type="button"
                  onClick={() => openPortal('BLOOD_BANK_OFFICER', 'blood-bank')}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--bn-primary)] hover:text-[var(--bn-secondary)]"
                >
                  Open Blood Bank Workspace
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </SpotlightCard>

              <SpotlightCard className="clinical-card-interactive rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-semibold text-[var(--bn-text)]">
                    Public Searcher Portal
                  </h3>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bn-soft-bg)] text-[var(--bn-primary)]">
                    <Activity className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--bn-muted)]">
                  Explore read-only regional blood group availability, locate nearby blood banks,
                  and view Indian emergency helpline guidance.
                </p>
                <button
                  type="button"
                  onClick={() => openPortal('PUBLIC', 'public-dashboard')}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--bn-primary)] hover:text-[var(--bn-secondary)]"
                >
                  Open Public Portal
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </SpotlightCard>

              <SpotlightCard className="clinical-card-interactive rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-semibold text-[var(--bn-text)]">
                    Network Admin Command Console
                  </h3>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bn-soft-bg)] text-[var(--bn-primary)]">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--bn-muted)]">
                  Govern hospitals, blood banks, RBAC permissions, SBTC license verifications, and
                  security audit logs.
                </p>
                <button
                  type="button"
                  onClick={() => openPortal('ADMIN', 'admin')}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--bn-primary)] hover:text-[var(--bn-secondary)]"
                >
                  Open Admin Console
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </SpotlightCard>
            </div>
          </div>
        </section>

        {/* Luxury Provenance & Governance Trust Band */}
        <section className="relative overflow-hidden border-b border-[var(--bn-border)] bg-[var(--bn-primary)] py-16 text-white transition-colors duration-300">
          <div className="accent-hairline absolute top-0 left-0 right-0 h-[2px] opacity-65" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
              <div className="space-y-3 lg:col-span-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--bn-sidebar-muted)]">
                  Trust, Governance &amp; Clinical Transparency
                </p>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Built on explicit provenance and verified institutional standards.
                </h2>
                <p className="text-sm leading-relaxed text-[var(--bn-sidebar-text)]">
                  Every metric in Phase 1 carries transparent DEMO DATA labeling while establishing
                  the 15-table PostgreSQL schema, role-based API controls, and authorized
                  e-RaktKosh adapter boundaries required for clinical deployment.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7">
                <div className="rounded-xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-sm">
                  <p className="font-mono-tabular text-2xl font-semibold text-white">100%</p>
                  <p className="mt-1 text-xs font-semibold text-[var(--bn-sidebar-muted)]">Demo Provenance</p>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--bn-sidebar-text)]">
                    Zero simulated counts are ever presented as live hospital stock.
                  </p>
                </div>

                <div className="rounded-xl border border-white/25 bg-white p-5 text-[var(--bn-text)] shadow-lg">
                  <p className="font-mono-tabular text-2xl font-semibold text-[var(--bn-primary)]">
                    15 Tables
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[var(--bn-secondary)]">PostgreSQL Schema</p>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--bn-muted)]">
                    Prisma schema ready for Neon PostgreSQL, audit trails, and batch tracking.
                  </p>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-sm">
                  <p className="font-mono-tabular text-2xl font-semibold text-white">Zero</p>
                  <p className="mt-1 text-xs font-semibold text-[var(--bn-sidebar-muted)]">Scraping Policy</p>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--bn-sidebar-text)]">
                    Strict adapter boundary reserved for authorized C-DAC e-RaktKosh feeds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Clinical Disclaimer & Security Footer Callout */}
        <section className="bg-[var(--bn-soft-bg)] py-12">
          <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6">
            <div className="flex items-start gap-3 rounded-lg border border-[var(--bn-border)] bg-white px-5 py-4 text-xs text-[var(--bn-muted)]">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--bn-primary)]" aria-hidden="true" />
              <p className="leading-relaxed">
                <span className="font-semibold text-[var(--bn-text)]">Architecture Security Baseline:</span>{' '}
                All API inputs pass shared Zod schema validation behind Helmet HTTP security headers,
                API role enforcement, and strict CORS controls with zero secrets exposed in client bundles.
              </p>
            </div>
            <ClinicalDisclaimerNotice variant="light" />
          </div>
        </section>
      </main>

      {/* Complete Professional Footer */}
      <footer className="border-t border-[var(--bn-border)] bg-white py-12 text-xs text-[var(--bn-muted)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 pb-10 sm:grid-cols-2 lg:grid-cols-4 border-b border-[var(--bn-border)]">
            <div className="space-y-3">
              <p className="font-display text-sm font-semibold text-[var(--bn-primary)]">
                Predictive Emergency Blood Shortage Network
              </p>
              <p className="leading-relaxed text-[var(--bn-muted)]">
                Enterprise healthcare coordination platform uniting hospitals, licensed blood banks,
                and public searchers across India. Phase 1 Demo Foundation.
              </p>
              <p className="inline-flex items-center gap-1.5 font-mono-tabular text-[11px] font-semibold text-[var(--bn-primary)]">
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                National Health Helpline: 104 / 112
              </p>
            </div>

            <div className="space-y-2.5">
              <p className="font-semibold text-[#17231C]">Platform &amp; Networks</p>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => openPortal('PUBLIC', 'availability')}
                    className="hover:text-[#123D2B] transition-colors"
                  >
                    Blood Availability Finder
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openPortal('HOSPITAL_COORDINATOR', 'hospital')}
                    className="hover:text-[#123D2B] transition-colors"
                  >
                    Hospital Network Portal
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openPortal('BLOOD_BANK_OFFICER', 'blood-bank')}
                    className="hover:text-[#123D2B] transition-colors"
                  >
                    Blood Bank Network Portal
                  </button>
                </li>
                <li>
                  <a href="#workflows" className="hover:text-[#123D2B] transition-colors">
                    Workflows
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <p className="font-semibold text-[#17231C]">Trust &amp; Support</p>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => setFooterDoc('about')}
                    className="hover:text-[#123D2B] transition-colors"
                  >
                    About the Platform
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setFooterDoc('emergency')}
                    className="hover:text-[#123D2B] transition-colors"
                  >
                    Emergency Blood Information
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setFooterDoc('contact')}
                    className="hover:text-[#123D2B] transition-colors"
                  >
                    Contact &amp; Support
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('signup')}
                    className="hover:text-[#123D2B] transition-colors"
                  >
                    Institutional Onboarding
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <p className="font-semibold text-[#17231C]">Legal &amp; Access</p>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => setFooterDoc('privacy')}
                    className="hover:text-[#123D2B] transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setFooterDoc('terms')}
                    className="hover:text-[#123D2B] transition-colors"
                  >
                    Terms &amp; Conditions
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="hover:text-[#123D2B] transition-colors"
                  >
                    Demo Sign In
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-center sm:justify-between text-[#55655C]">
            <p>
              © {new Date().getFullYear()} Predictive Emergency Blood Shortage Network. All demo
              metrics clearly attributed.
            </p>
            <p className="font-mono-tabular">v1.0.0-phase1 · Non-Clinical Demo Environment</p>
          </div>
        </div>
      </footer>

      <ModalDialog
        open={footerDoc !== null}
        onClose={() => setFooterDoc(null)}
        title={
          footerDoc === 'about'
            ? 'About Predictive Emergency Blood Shortage Network'
            : footerDoc === 'contact'
              ? 'Contact & Institutional Support'
              : footerDoc === 'privacy'
                ? 'Privacy & Data Provenance Policy'
                : footerDoc === 'terms'
                  ? 'Terms & Conditions'
                  : 'Emergency Blood Information'
        }
        subtitle="Phase 1 Architecture Information"
      >
        <div className="space-y-3 text-xs leading-relaxed text-[#55655C]">
          {footerDoc === 'about' ? (
            <p>
              This platform connects hospitals, licensed blood banks, and public searchers across
              India to detect blood group shortages early and coordinate safe, expiry-aware
              inter-facility availability.
            </p>
          ) : null}
          {footerDoc === 'contact' ? (
            <>
              <p>
                Demo Coordination Desk:{' '}
                <strong className="text-[#17231C]">support@bloodnetwork-demo.in</strong>
              </p>
              <p>
                SBTC Institutional Onboarding Inquiries:{' '}
                <strong className="text-[#17231C]">onboarding@bloodnetwork-demo.in</strong>
              </p>
            </>
          ) : null}
          {footerDoc === 'privacy' ? (
            <p>
              Phase 1 runs strictly on simulated DEMO DATA without storing personal health records or
              donor PII. Role-based permissions and audit logs protect all institutional workflows.
            </p>
          ) : null}
          {footerDoc === 'terms' ? (
            <p>
              All inventory counts, forecasts, and facility queues shown in Phase 1 are simulated for
              demonstration and architectural evaluation and must not be used for clinical decisions.
            </p>
          ) : null}
          {footerDoc === 'emergency' ? (
            <p>
              In a real medical emergency in India, immediately call{' '}
              <strong className="text-[#C93440]">112</strong> or{' '}
              <strong className="text-[#C93440]">108</strong>, or verify official inventory directly
              with your nearest licensed blood bank / e-RaktKosh portal.
            </p>
          ) : null}
        </div>
      </ModalDialog>
    </div>
  );
}

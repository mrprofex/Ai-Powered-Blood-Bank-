import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Clock,
  MapPin,
  ShieldAlert,
} from 'lucide-react';
import type {
  DemoSessionUser,
  NetworkSummaryResponse,
} from '../../../shared/types/network.ts';
import {
  DEMO_HOSPITAL_REQUESTS,
  FALLBACK_DEMO_SUMMARY,
} from '../data/demoPortalData.ts';
import { fetchNetworkSummary } from '../services/networkApi.ts';
import type { AppPage } from '../types/navigation.ts';
import {
  BloodGroupInventoryChart,
  ComponentMixDonutChart,
  RadialKpiRing,
  ShortageTrendDemoChart,
} from '../components/charts/BloodInventoryCharts.tsx';
import {
  AnimatedCounter,
  Magnet,
  SpotlightCard,
} from '../components/motion/MotionPrimitives.tsx';
import {
  RiskStatusIndicator,
  TableSkeleton,
} from '../components/ui/UiPrimitives.tsx';

interface MainDashboardProps {
  demoUser: DemoSessionUser;
  onNavigate: (page: AppPage) => void;
}

export function MainDashboard({ demoUser, onNavigate }: MainDashboardProps) {
  const [summary, setSummary] = useState<NetworkSummaryResponse>(FALLBACK_DEMO_SUMMARY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchNetworkSummary()
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch(() => {
        // Fallback demo summary remains active
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const criticalGroupsCount = summary.bloodGroupOverview.filter(
    (item) => item.riskLevel === 'CRITICAL',
  ).length;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[#DCE3DC] pb-5">
        <div>
          <p className="text-xs font-semibold text-[#1D593E]">
            Network Operations · {demoUser.organizationName}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-[#17231C]">
            Welcome back, {demoUser.name.replace(' (Demo)', '')}
          </h2>
          <p className="mt-1 text-sm text-[#55655C]">
            Simulated national blood inventory posture, regional risk indicators, and emergency request triage.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('availability')}
            className="clinical-btn inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-[var(--bn-border)] bg-white px-3.5 py-2 text-xs font-medium text-[var(--bn-text)] hover:bg-[var(--bn-soft-bg)] whitespace-nowrap"
          >
            Search Blood Finder
          </button>
          <Magnet>
            <button
              type="button"
              onClick={() => onNavigate('requests')}
              className="clinical-btn inline-flex min-h-[38px] items-center gap-2 rounded-lg bg-[var(--bn-primary)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--bn-secondary)] whitespace-nowrap"
            >
              Emergency Queue
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </Magnet>
        </div>
      </section>

      {/* Elevated Spotlight KPI Cards with Animated Tabular Counters */}
      <section aria-label="Network overview metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SpotlightCard className="rounded-xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-[var(--bn-muted)]">Registered Hospitals · DEMO DATA</p>
              <p className="mt-1.5 text-2xl font-semibold text-[var(--bn-text)]">
                <AnimatedCounter value={summary.kpis.registeredHospitals} />
              </p>
              <p className="mt-1 text-xs text-[var(--bn-muted)]">8 state coordination clusters</p>
            </div>
            <RadialKpiRing percentage={84} label="84%" tone="primary" />
          </div>
        </SpotlightCard>

        <SpotlightCard className="rounded-xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-[var(--bn-muted)]">Blood Banks · DEMO DATA</p>
              <p className="mt-1.5 text-2xl font-semibold text-[var(--bn-text)]">
                <AnimatedCounter value={summary.kpis.registeredBloodBanks} />
              </p>
              <p className="mt-1 text-xs text-[var(--bn-muted)]">Component &amp; whole-blood hubs</p>
            </div>
            <RadialKpiRing percentage={78} label="78%" tone="secondary" />
          </div>
        </SpotlightCard>

        <SpotlightCard className="rounded-xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-[var(--bn-muted)]">Available Units · DEMO DATA</p>
              <p className="mt-1.5 text-2xl font-semibold text-[var(--bn-text)]">
                <AnimatedCounter value={summary.kpis.availableBloodUnits} />
              </p>
              <p className="mt-1 text-xs font-medium text-[var(--bn-secondary)]">Simulated regional stock</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--bn-primary)]/10 text-[var(--bn-primary)] shrink-0">
              <Activity className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
        </SpotlightCard>

        <SpotlightCard
          className="rounded-xl border-[#C93440]/25 p-5"
          spotlightColor="rgba(201, 52, 64, 0.12)"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-[var(--bn-muted)]">Emergency Requests · DEMO DATA</p>
              <p className="mt-1.5 text-2xl font-semibold text-[#C93440]">
                <AnimatedCounter value={summary.kpis.activeEmergencyRequests} />
              </p>
              <p className="mt-1 text-xs text-[var(--bn-muted)]">
                {criticalGroupsCount} groups in critical tier
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C93440]/10 text-[#C93440]">
                <ShieldAlert className="h-4.5 w-4.5" aria-hidden="true" />
              </div>
              <span className="font-mono-tabular text-[11px] font-semibold text-[#C93440]">
                Critical
              </span>
            </div>
          </div>
        </SpotlightCard>
      </section>

      {/* Extej-inspired Multi-Segment Component Supply Balance Bar */}
      <section className="clinical-card rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <p className="text-xs font-medium text-[var(--bn-muted)]">
              National Component Allocation · DEMO DATA
            </p>
            <p className="mt-0.5 font-mono-tabular text-xl font-semibold text-[var(--bn-text)]">
              {summary.kpis.availableBloodUnits.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-[var(--bn-muted)]">tracked units</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 text-[var(--bn-muted)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0E3224]" /> PRBC · 48%
            </span>
            <span className="inline-flex items-center gap-1.5 text-[var(--bn-muted)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF8547]" /> Whole Blood · 25%
            </span>
            <span className="inline-flex items-center gap-1.5 text-[var(--bn-muted)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0284C7]" /> FFP · 17%
            </span>
            <span className="inline-flex items-center gap-1.5 text-[var(--bn-muted)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#C93440]" /> Platelets · 10%
            </span>
          </div>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--bn-soft-bg)] gap-0.5">
          <div className="h-full rounded-l-full bg-[#0E3224]" style={{ width: '48%' }} />
          <div className="h-full bg-[#FF8547]" style={{ width: '25%' }} />
          <div className="h-full bg-[#0284C7]" style={{ width: '17%' }} />
          <div className="h-full rounded-r-full bg-[#C93440]" style={{ width: '10%' }} />
        </div>
      </section>

      {/* Analytics Row */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="clinical-card rounded-xl p-5 xl:col-span-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-sm font-semibold text-[#17231C]">
                Blood Group Availability vs. Threshold
              </h3>
              <p className="text-xs text-[#55655C]">
                DEMO DATA · Crimson marks critical cover below baseline
              </p>
            </div>
            <span className="font-mono-tabular text-xs text-[#55655C]">8 Groups</span>
          </div>
          <BloodGroupInventoryChart data={summary.bloodGroupOverview} />
        </div>

        <div className="clinical-card rounded-xl p-5 xl:col-span-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-sm font-semibold text-[#17231C]">
                7-Day Network Utilization Outlook
              </h3>
              <p className="text-xs text-[#55655C]">DEMO DATA · Stock vs. daily demand</p>
            </div>
            <span className="font-mono-tabular text-xs font-medium text-[#1D593E]">Units / Day</span>
          </div>
          <ShortageTrendDemoChart />
        </div>

        <div className="clinical-card rounded-xl p-5 xl:col-span-3 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-display text-sm font-semibold text-[#17231C]">
              Component Mix
            </h3>
            <p className="text-xs text-[#55655C]">DEMO DATA · Active stock distribution</p>
          </div>
          <ComponentMixDonutChart />
        </div>
      </section>

      {/* Regional Shortage Overview */}
      <section className="clinical-card overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE3DC] px-5 py-4">
          <div>
            <h3 className="font-display text-sm font-semibold text-[#17231C]">
              Regional Shortage Overview
            </h3>
            <p className="text-xs text-[#55655C]">
              DEMO DATA · Static regional risk indicators across major Indian corridors
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('predictions')}
            className="text-xs font-semibold text-[#123D2B] hover:underline"
          >
            Inspect Forecast Preview
          </button>
        </div>

        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={4} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#DCE3DC] bg-[#F2F5F1] text-xs font-medium text-[#55655C]">
                <tr>
                  <th className="px-5 py-3">Corridor</th>
                  <th className="px-4 py-3 text-right">Facilities</th>
                  <th className="px-4 py-3 text-right">Units (Demo)</th>
                  <th className="px-4 py-3">Watch Groups</th>
                  <th className="px-5 py-3">Risk Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE3DC]">
                {summary.regionalRiskOverview.map((region) => (
                  <tr key={region.region} className="hover:bg-[#F2F5F1]/60">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[#17231C]">{region.region}</p>
                      <p className="text-xs text-[#55655C]">{region.state}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono-tabular text-xs text-[#17231C]">
                      {region.hospitalsCount}H / {region.bloodBanksCount}B
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono-tabular font-semibold text-[#17231C]">
                      {region.totalUnits.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 font-mono-tabular text-xs text-[#55655C]">
                      {region.criticalGroups.length > 0
                        ? region.criticalGroups.join(', ')
                        : 'Nominal'}
                    </td>
                    <td className="px-5 py-3.5">
                      <RiskStatusIndicator level={region.riskLevel} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent Emergency Requests & Inventory Activity */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="clinical-card rounded-xl lg:col-span-6">
          <div className="flex items-center justify-between border-b border-[#DCE3DC] px-5 py-3.5">
            <div>
              <h3 className="font-display text-sm font-semibold text-[#17231C]">
                Recent Emergency Requests
              </h3>
              <p className="text-xs text-[#55655C]">DEMO DATA · Priority hospital triage</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('requests')}
              className="text-xs font-semibold text-[#123D2B] hover:underline"
            >
              All Requests
            </button>
          </div>
          <ul className="divide-y divide-[#DCE3DC]">
            {DEMO_HOSPITAL_REQUESTS.slice(0, 3).map((req) => (
              <li key={req.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#17231C]">
                    {req.hospitalName} · {req.department}
                  </p>
                  <p className="mt-0.5 text-xs text-[#55655C]">
                    {req.city} · {req.matchedBank}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono-tabular text-xs font-semibold text-[#17231C]">
                    {req.bloodGroup} · {req.units}u
                  </p>
                  <p
                    className={`mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium ${
                      req.urgency === 'CRITICAL' ? 'text-[#C93440]' : 'text-[#55655C]'
                    }`}
                  >
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {req.etaMinutes}m · {req.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="clinical-card rounded-xl lg:col-span-6">
          <div className="flex items-center justify-between border-b border-[#DCE3DC] px-5 py-3.5">
            <div>
              <h3 className="font-display text-sm font-semibold text-[#17231C]">
                Inventory Activity
              </h3>
              <p className="text-xs text-[#55655C]">DEMO DATA · Recent facility updates</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('blood-bank')}
              className="text-xs font-semibold text-[#123D2B] hover:underline"
            >
              Cold Vault
            </button>
          </div>
          <ul className="divide-y divide-[#DCE3DC]">
            {summary.recentActivity.slice(0, 3).map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#17231C]">{item.title}</p>
                  <p className="mt-0.5 text-xs text-[#55655C]">
                    {item.facility} · {item.city}
                  </p>
                </div>
                <span className="font-mono-tabular text-xs font-semibold text-[#17231C] whitespace-nowrap shrink-0">
                  {item.bloodGroup} · {item.units}u
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Regional Coordination Overview */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-semibold text-[#17231C]">
              Regional Coordination Overview
            </h3>
            <p className="text-xs text-[#55655C]">
              DEMO DATA · Active multi-state logistics hubs across India
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('availability')}
            className="text-xs font-semibold text-[#123D2B] hover:underline"
          >
            Filter Facilities by State
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summary.regionalRiskOverview.slice(0, 4).map((region) => (
            <div key={region.region} className="clinical-card rounded-xl p-4 space-y-2.5">
              <p className="inline-flex items-center gap-1 text-xs font-semibold text-[#123D2B]">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {region.state}
              </p>
              <h4 className="font-display text-sm font-semibold text-[#17231C]">{region.region}</h4>
              <div className="flex items-center justify-between border-t border-[#DCE3DC] pt-2 text-xs">
                <span className="font-mono-tabular font-semibold text-[#17231C]">
                  {region.totalUnits.toLocaleString('en-IN')}u
                </span>
                <RiskStatusIndicator level={region.riskLevel} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

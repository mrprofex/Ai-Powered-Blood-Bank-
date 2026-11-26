import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Clock,
  Database,
  MapPin,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import type {
  DemoSessionUser,
  HealthCheckResponse,
  NetworkSummaryResponse,
} from '../../../shared/types/network.ts';
import {
  DEMO_VERIFICATION_QUEUE,
  FALLBACK_DEMO_SUMMARY,
} from '../data/demoPortalData.ts';
import {
  fetchAdminConnectionsApi,
  fetchApiHealth,
  fetchNetworkSummary,
  type AdminConnectionsResponse,
} from '../services/networkApi.ts';
import type { AppPage } from '../types/navigation.ts';
import {
  BloodGroupInventoryChart,
  ComponentMixDonutChart,
  RadialKpiRing,
  ShortageTrendDemoChart,
} from '../components/charts/BloodInventoryCharts.tsx';
import { Magnet } from '../components/motion/MotionPrimitives.tsx';
import {
  ClinicalDisclaimerNotice,
  RiskStatusIndicator,
  TableSkeleton,
} from '../components/ui/UiPrimitives.tsx';

interface AdminDashboardProps {
  demoUser: DemoSessionUser;
  onNavigate: (page: AppPage) => void;
}

export function AdminDashboard({ demoUser, onNavigate }: AdminDashboardProps) {
  const [summary, setSummary] = useState<NetworkSummaryResponse>(FALLBACK_DEMO_SUMMARY);
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [connections, setConnections] = useState<AdminConnectionsResponse | null>(null);
  const [connectionsError, setConnectionsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      fetchNetworkSummary(),
      fetchApiHealth(),
      fetchAdminConnectionsApi(demoUser),
    ])
      .then(([summaryRes, healthRes, connectionsRes]) => {
        if (!active) return;
        if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
        if (healthRes.status === 'fulfilled') setHealth(healthRes.value);
        if (connectionsRes.status === 'fulfilled') {
          setConnections(connectionsRes.value);
        } else {
          setConnectionsError(
            connectionsRes.reason instanceof Error
              ? connectionsRes.reason.message
              : 'Unable to load integration status.',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [demoUser]);

  const criticalGroupsCount = summary.bloodGroupOverview.filter(
    (item) => item.riskLevel === 'CRITICAL',
  ).length;
  const verifiedCount = DEMO_VERIFICATION_QUEUE.filter((i) => i.status === 'VERIFIED').length;
  const pendingCount = DEMO_VERIFICATION_QUEUE.length - verifiedCount;
  const verificationPct = Math.round(
    (verifiedCount / Math.max(1, DEMO_VERIFICATION_QUEUE.length)) * 100,
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <section className="flex flex-col gap-4 border-b border-[#DCE3DC] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-[#1D593E]">
            Network Governance Command · {demoUser.organizationName}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-[#17231C]">
            National Blood Grid Overview
          </h2>
          <p className="mt-1 text-sm text-[#55655C]">
            Cross-state shortage surveillance, SBTC institutional verification, and platform RBAC oversight.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('admin-audit-logs')}
            className="clinical-btn inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-[#DCE3DC] bg-white px-3.5 py-2 text-xs font-medium text-[#17231C] hover:bg-[#F2F5F1] whitespace-nowrap"
          >
            Security Audit Logs
          </button>
          <Magnet>
            <button
              type="button"
              onClick={() => onNavigate('admin-verification')}
              className="clinical-btn inline-flex min-h-[38px] items-center gap-2 rounded-lg bg-[var(--bn-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--bn-secondary)] whitespace-nowrap"
            >
              Verification Queue ({pendingCount})
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </Magnet>
        </div>
      </section>

      {/* Network KPI Strip */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="clinical-card flex items-center justify-between gap-3 rounded-xl p-5">
          <div>
            <p className="text-xs text-[#55655C]">Registered Hospitals · DEMO DATA</p>
            <p className="mt-1.5 font-mono-tabular text-2xl font-semibold text-[#17231C]">
              {summary.kpis.registeredHospitals.toLocaleString('en-IN')}
            </p>
            <button
              type="button"
              onClick={() => onNavigate('admin-hospitals')}
              className="mt-1 text-xs font-semibold text-[#123D2B] hover:underline"
            >
              Manage Hospitals →
            </button>
          </div>
          <RadialKpiRing percentage={84} label="84%" tone="primary" />
        </div>

        <div className="clinical-card flex items-center justify-between gap-3 rounded-xl p-5">
          <div>
            <p className="text-xs text-[#55655C]">Blood Banks · DEMO DATA</p>
            <p className="mt-1.5 font-mono-tabular text-2xl font-semibold text-[#17231C]">
              {summary.kpis.registeredBloodBanks.toLocaleString('en-IN')}
            </p>
            <button
              type="button"
              onClick={() => onNavigate('admin-blood-banks')}
              className="mt-1 text-xs font-semibold text-[#17231C] hover:text-[#123D2B] hover:underline"
            >
              Manage Blood Banks →
            </button>
          </div>
          <RadialKpiRing percentage={verificationPct} label={`${verificationPct}%`} tone="secondary" />
        </div>

        <div className="clinical-card flex items-center justify-between gap-3 rounded-xl p-5">
          <div>
            <p className="text-xs text-[#55655C]">Available Units · DEMO DATA</p>
            <p className="mt-1.5 font-mono-tabular text-2xl font-semibold text-[#17231C]">
              {summary.kpis.availableBloodUnits.toLocaleString('en-IN')}
            </p>
            <p className="mt-1 text-xs font-medium text-[#1D593E]">8 Indian states tracked</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#123D2B]/10 text-[#123D2B] shrink-0">
            <Activity className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>

        <div className="clinical-card rounded-xl border-[#C93440]/25 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#55655C]">Critical Shortages · DEMO DATA</p>
            <ShieldAlert className="h-4 w-4 text-[#C93440]" aria-hidden="true" />
          </div>
          <p className="mt-1.5 font-mono-tabular text-2xl font-semibold text-[#C93440]">
            {summary.kpis.activeEmergencyRequests} Active
          </p>
          <p className="mt-1 text-xs text-[#55655C]">
            {criticalGroupsCount} blood groups below 2.5d cover
          </p>
        </div>
      </section>

      {/* Network Analytics Row */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="clinical-card rounded-xl p-5 xl:col-span-5">
          <div className="mb-4 flex items-center justify-between">
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
          <div className="mb-4 flex items-center justify-between">
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

        <div className="clinical-card flex flex-col justify-between rounded-xl p-5 xl:col-span-3">
          <div className="mb-4">
            <h3 className="font-display text-sm font-semibold text-[#17231C]">Component Mix</h3>
            <p className="text-xs text-[#55655C]">DEMO DATA · Active stock distribution</p>
          </div>
          <ComponentMixDonutChart />
        </div>
      </section>

      {/* Infrastructure & Regional Risk */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="clinical-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs text-[#55655C]">
            <Database className="h-4 w-4 text-[#123D2B]" aria-hidden="true" />
            Neon PostgreSQL + Prisma
          </div>
          <p className="mt-2 font-display text-base font-semibold text-[#17231C]">
            {health?.database.configured ? 'Configured' : 'Schema Draft Ready'}
          </p>
          <p className="mt-1 text-xs text-[#55655C]">
            15-table Prisma schema prepared in server/prisma/schema.prisma
          </p>
        </div>

        <div className="clinical-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs text-[#55655C]">
            <ShieldCheck className="h-4 w-4 text-[#123D2B]" aria-hidden="true" />
            Auth &amp; Gemini Integrations
          </div>
          <p className="mt-2 font-display text-base font-semibold text-[#17231C]">
            Pending Phases 2 &amp; 5
          </p>
          <p className="mt-1 text-xs text-[#55655C]">
            Google OAuth: {health?.integrations.googleOAuthConfigured ? 'Set' : 'Unset'} · Gemini:{' '}
            {health?.integrations.geminiConfigured ? 'Set' : 'Unset'}
          </p>
        </div>

        <div className="clinical-card rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs text-[#55655C]">
            <Clock className="h-4 w-4 text-[#123D2B]" aria-hidden="true" />
            e-RaktKosh Adapter Status
          </div>
          <p className="mt-2 font-display text-base font-semibold text-[#17231C]">
            {health?.integrations.eraktkoshConfigured ? 'Authorized' : 'Awaiting MoHFW Credentials'}
          </p>
          <p className="mt-1 text-xs text-[#55655C]">Strict adapter boundary; zero scraping</p>
        </div>
      </section>

      <section className="clinical-card overflow-hidden rounded-xl">
        <div className="border-b border-[#DCE3DC] px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-[#17231C]">
            Organization Connections &amp; Integration Readiness
          </h3>
          <p className="mt-1 text-xs text-[#55655C]">
            Demo directory entries are not live integrations. No organization sync has run in this
            environment.
          </p>
        </div>
        {connectionsError ? (
          <p role="alert" className="p-5 text-sm text-[#C93440]">{connectionsError}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#DCE3DC] bg-[#F2F5F1] text-xs font-medium text-[#55655C]">
                <tr>
                  <th className="px-5 py-3">Organization</th>
                  <th className="px-4 py-3">Type / Location</th>
                  <th className="px-4 py-3">Connection</th>
                  <th className="px-4 py-3">Last Sync</th>
                  <th className="px-5 py-3">Data Freshness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE3DC]">
                {(connections?.connections ?? []).map((connection) => (
                  <tr key={connection.organizationId}>
                    <td className="px-5 py-3 font-medium text-[#17231C]">
                      {connection.organizationName}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#55655C]">
                      {connection.type.replace('_', ' ')} · {connection.city}, {connection.state}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#F2F5F1] px-2.5 py-1 text-[11px] font-semibold text-[#55655C]">
                        {connection.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono-tabular text-xs text-[#55655C]">
                      {connection.lastSyncAt
                        ? new Date(connection.lastSyncAt).toLocaleString('en-IN')
                        : 'Never synced'}
                    </td>
                    <td className="px-5 py-3 text-xs text-[#55655C]">
                      {connection.isStale
                        ? 'STALE'
                        : connection.lastSyncAt
                          ? 'Within configured window'
                          : 'No sync; freshness unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 border-t border-[#DCE3DC] p-5 sm:grid-cols-2 xl:grid-cols-4">
          {(connections?.integrations ?? []).map((integration) => (
            <div key={integration.provider} className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-3">
              <p className="text-xs font-semibold text-[#17231C]">{integration.provider.replace('_', ' ')}</p>
              <p className="mt-1 text-[11px] font-medium text-[#1D593E]">
                {integration.status.replace(/_/g, ' ')}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#55655C]">
                {integration.message}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Regional Shortage Overview Table */}
      <section className="clinical-card overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE3DC] px-5 py-4">
          <div>
            <h3 className="font-display text-sm font-semibold text-[#17231C]">
              Regional Shortage Overview
            </h3>
            <p className="text-xs text-[#55655C]">
              DEMO DATA · Cross-corridor risk scoring across Indian metropolitan hubs
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('predictions')}
            className="text-xs font-semibold text-[#123D2B] hover:underline"
          >
            Inspect AI Forecasts
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

      {/* Clean Regional Corridor Coverage Summary (replaces 3D on internal dashboard) */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-semibold text-[#17231C]">
              Regional Corridor Coverage
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
            Inspect Facility Inventory
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summary.regionalRiskOverview.slice(0, 4).map((region) => (
            <div key={region.region} className="clinical-card rounded-xl p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="inline-flex items-center gap-1 text-xs font-semibold text-[#123D2B]">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {region.state}
                  </p>
                  <h4 className="mt-0.5 font-display text-sm font-semibold text-[#17231C]">
                    {region.region}
                  </h4>
                </div>
                <span className="font-mono-tabular text-xs font-semibold text-[#55655C]">
                  {region.hospitalsCount + region.bloodBanksCount} hubs
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[#DCE3DC] pt-2.5 text-xs">
                <span className="font-mono-tabular font-semibold text-[#17231C]">
                  {region.totalUnits.toLocaleString('en-IN')}u
                </span>
                <RiskStatusIndicator level={region.riskLevel} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <ClinicalDisclaimerNotice variant="light" />
    </div>
  );
}

import { AlertTriangle, ArrowRight, PackageCheck, PlusCircle } from 'lucide-react';
import { BLOOD_COMPONENT_LABELS } from '../../../shared/constants/bloodNetwork.ts';
import type { DemoSessionUser } from '../../../shared/types/network.ts';
import { DEMO_BLOOD_BANK_BATCHES } from '../data/demoPortalData.ts';
import type { AppPage } from '../types/navigation.ts';
import {
  ComponentMixDonutChart,
  RadialKpiRing,
} from '../components/charts/BloodInventoryCharts.tsx';
import { AnimatedCounter, Magnet, SpotlightCard } from '../components/motion/MotionPrimitives.tsx';
import { RiskStatusIndicator } from '../components/ui/UiPrimitives.tsx';

interface BloodBankDashboardProps {
  demoUser: DemoSessionUser;
  onNavigate: (page: AppPage) => void;
}

export function BloodBankDashboard({ demoUser, onNavigate }: BloodBankDashboardProps) {
  const expiringSoonCount = DEMO_BLOOD_BANK_BATCHES.filter(
    (batch) => batch.hoursToExpiry <= 72,
  ).reduce((acc, item) => acc + item.unitsAvailable, 0);

  const totalUnits = DEMO_BLOOD_BANK_BATCHES.reduce(
    (acc, item) => acc + item.unitsAvailable,
    0,
  );
  const reservedUnits = DEMO_BLOOD_BANK_BATCHES.reduce(
    (acc, item) => acc + item.unitsReserved,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <section className="flex flex-col gap-4 border-b border-[#DCE3DC] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-[#1D593E]">
            Blood Bank Vault Workspace · {demoUser.organizationName}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-[#17231C]">
            Welcome back, {demoUser.name.replace(' (Demo)', '')}
          </h2>
          <p className="mt-1 text-sm text-[#55655C]">
            Monitor cold-vault batches, commit RBAC-verified stock movements, prioritize 72h expiry transfers, and fulfill hospital requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('bank-expiry-management')}
            className="clinical-btn inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-[#DCE3DC] bg-white px-3.5 py-2 text-xs font-medium text-[#17231C] hover:bg-[#F2F5F1] whitespace-nowrap"
          >
            Expiry Queue
          </button>
          <Magnet>
            <button
              type="button"
              onClick={() => onNavigate('bank-update-stock')}
              className="clinical-btn inline-flex min-h-[38px] items-center gap-2 rounded-lg bg-[var(--bn-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--bn-secondary)] whitespace-nowrap"
            >
              <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Update Stock
            </button>
          </Magnet>
        </div>
      </section>

      {/* KPI & Component Analytics Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-8">
          <SpotlightCard className="rounded-xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-[var(--bn-muted)]">Cold-Vault Batches · DEMO DATA</p>
                <p className="mt-1.5 font-mono-tabular text-2xl font-semibold text-[var(--bn-text)]">
                  <AnimatedCounter value={DEMO_BLOOD_BANK_BATCHES.length} /> Active
                </p>
                <p className="mt-1 text-xs text-[var(--bn-muted)]">{demoUser.organizationName}</p>
              </div>
              <RadialKpiRing percentage={82} label="82%" tone="primary" />
            </div>
          </SpotlightCard>

          <SpotlightCard className="rounded-xl p-5">
            <p className="text-xs text-[var(--bn-muted)]">Available / Reserved · DEMO DATA</p>
            <p className="mt-1.5 font-mono-tabular text-2xl font-semibold text-[var(--bn-text)]">
              <AnimatedCounter value={totalUnits} /> / {reservedUnits}u
            </p>
            <p className="mt-1 text-xs font-medium text-[var(--bn-secondary)]">Across 4 component lines</p>
          </SpotlightCard>

          <SpotlightCard className="rounded-xl p-5">
            <p className="text-xs text-[var(--bn-muted)]">Expiring &lt;= 72h · DEMO DATA</p>
            <p className="mt-1.5 font-mono-tabular text-2xl font-semibold text-[#B45309]">
              <AnimatedCounter value={expiringSoonCount} /> Units
            </p>
            <button
              type="button"
              onClick={() => onNavigate('bank-expiry-management')}
              className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[var(--bn-primary)] hover:underline"
            >
              FEFO Watchlist
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </button>
          </SpotlightCard>
        </div>

        <div className="clinical-card rounded-xl p-5 lg:col-span-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-sm font-semibold text-[#17231C]">
              Vault Component Share
            </p>
            <span className="text-[11px] text-[#55655C]">DEMO DATA</span>
          </div>
          <ComponentMixDonutChart />
        </div>
      </div>

      {/* Component Batch Ledger */}
      <section className="clinical-card overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE3DC] px-5 py-4">
          <div>
            <h3 className="font-display text-base font-semibold text-[#17231C]">
              Component Batch Inventory &amp; Expiry Monitor
            </h3>
            <p className="text-xs text-[#55655C]">
              DEMO DATA · Use Update Stock to record donations, dispatches, or reconciliation adjustments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('bank-records')}
              className="text-xs font-semibold text-[#123D2B] hover:underline"
            >
              View Movement Ledger
            </button>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#55655C]">
              <PackageCheck className="h-4 w-4 text-[#1D593E]" aria-hidden="true" />
              24x7 Cold-Chain
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#DCE3DC] bg-[#F2F5F1] text-xs font-medium text-[#55655C]">
              <tr>
                <th className="px-5 py-3">Batch Code</th>
                <th className="px-4 py-3">Group · Component</th>
                <th className="px-4 py-3 text-right">Available / Reserved</th>
                <th className="px-4 py-3 text-right">Expiry Window</th>
                <th className="px-4 py-3">Storage Unit</th>
                <th className="px-5 py-3">Stock Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3DC]">
              {DEMO_BLOOD_BANK_BATCHES.map((batch) => (
                <tr key={batch.batchCode} className="hover:bg-[#F2F5F1]/60">
                  <td className="px-5 py-3.5 font-mono-tabular text-xs font-semibold text-[#17231C]">
                    {batch.batchCode}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono-tabular font-semibold text-[#123D2B]">
                      {batch.bloodGroup}
                    </span>
                    <span className="ml-2 text-xs text-[#55655C]">
                      {BLOOD_COMPONENT_LABELS[batch.component]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono-tabular text-[#17231C]">
                    {batch.unitsAvailable} avail · {batch.unitsReserved} res
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono-tabular">
                    {batch.hoursToExpiry <= 72 ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#B45309]">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                        {batch.hoursToExpiry}h
                      </span>
                    ) : (
                      <span className="text-[#55655C]">{Math.round(batch.hoursToExpiry / 24)}d</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#55655C]">{batch.storageUnit}</td>
                  <td className="px-5 py-3.5">
                    <RiskStatusIndicator level={batch.riskLevel} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

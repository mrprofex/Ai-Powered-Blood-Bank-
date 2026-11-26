import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Clock, Info, LineChart } from 'lucide-react';
import {
  BLOOD_COMPONENT_LABELS,
  BLOOD_GROUPS,
  type BloodGroup,
  type UserRole,
} from '../../../shared/constants/bloodNetwork.ts';
import {
  DEMO_CONSUMPTION_TREND,
  DEMO_CONSUMPTION_TREND_30D,
  DEMO_ROLE_PREDICTIONS,
} from '../data/demoPortalData.ts';
import {
  ClinicalDisclaimerNotice,
  EmptyStatePanel,
  RiskStatusIndicator,
} from '../components/ui/UiPrimitives.tsx';

interface PredictionsWorkspaceProps {
  role: UserRole;
  initialPeriod?: '7d' | '30d';
}

export function PredictionsWorkspace({
  role,
  initialPeriod = '7d',
}: PredictionsWorkspaceProps) {
  const [period, setPeriod] = useState<'7d' | '30d'>(initialPeriod);
  const [bloodGroupFilter, setBloodGroupFilter] = useState<BloodGroup | ''>('');
  const [regionFilter, setRegionFilter] = useState<string>('');

  useEffect(() => {
    setPeriod(initialPeriod);
  }, [initialPeriod]);

  const targetScope: 'HOSPITAL' | 'BLOOD_BANK' | 'NETWORK' =
    role === 'HOSPITAL_COORDINATOR'
      ? 'HOSPITAL'
      : role === 'BLOOD_BANK_OFFICER'
        ? 'BLOOD_BANK'
        : 'NETWORK';

  const scopedPredictions = useMemo(() => {
    return DEMO_ROLE_PREDICTIONS.filter((item) => {
      if (item.scope !== targetScope) return false;
      if (item.period !== period) return false;
      if (bloodGroupFilter && item.bloodGroup !== bloodGroupFilter) return false;
      if (regionFilter && item.region !== regionFilter) return false;
      return true;
    });
  }, [targetScope, period, bloodGroupFilter, regionFilter]);

  const availableRegions = useMemo(() => {
    return Array.from(
      new Set(
        DEMO_ROLE_PREDICTIONS.filter((i) => i.scope === targetScope).map((i) => i.region),
      ),
    );
  }, [targetScope]);

  const titleByRole =
    targetScope === 'HOSPITAL'
      ? 'Hospital Demand Prediction & Shortage Risk'
      : targetScope === 'BLOOD_BANK'
        ? 'Blood Bank Stock Depletion & Expiry Forecast'
        : 'Network-Wide Shortage & Regional Demand Forecast';

  const subtitleByRole =
    targetScope === 'HOSPITAL'
      ? 'Hospital-specific transfusion demand outlook, expected requirements, and trauma cover risk (DEMO DATA)'
      : targetScope === 'BLOOD_BANK'
        ? 'Cold-vault stock depletion, replenishment needs, and near-expiry rotation insights (DEMO DATA)'
        : 'Regional corridor shortages, national blood-group demand, and institutional risk summaries (DEMO DATA)';

  const chartData = period === '7d' ? DEMO_CONSUMPTION_TREND : DEMO_CONSUMPTION_TREND_30D;

  return (
    <div className="space-y-6">
      {/* Header & Period / Filter Controls */}
      <section className="clinical-card rounded-xl p-5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#123D2B]/10 text-[#123D2B] shrink-0">
              <LineChart className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-[#17231C]">
                {titleByRole}
              </h2>
              <p className="mt-0.5 text-xs text-[#55655C]">{subtitleByRole}</p>
            </div>
          </div>

          {/* 7-Day vs 30-Day Period Selector */}
          <div className="inline-flex rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-1 self-start">
            <button
              type="button"
              onClick={() => setPeriod('7d')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                period === '7d'
                  ? 'bg-white text-[#123D2B] shadow-xs'
                  : 'text-[#55655C] hover:text-[#17231C]'
              }`}
            >
              Next 7 Days
            </button>
            <button
              type="button"
              onClick={() => setPeriod('30d')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                period === '30d'
                  ? 'bg-white text-[#123D2B] shadow-xs'
                  : 'text-[#55655C] hover:text-[#17231C]'
              }`}
            >
              Next 30 Days
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2 border-t border-[#DCE3DC]">
          <div>
            <label htmlFor="pred-group" className="block text-xs font-medium text-[#55655C]">
              Blood Group Filter
            </label>
            <select
              id="pred-group"
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value as BloodGroup | '')}
              className="mt-1.5 block w-full min-h-[38px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-1.5 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
            >
              <option value="">All Blood Groups</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pred-region" className="block text-xs font-medium text-[#55655C]">
              Regional Corridor
            </label>
            <select
              id="pred-region"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="mt-1.5 block w-full min-h-[38px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-1.5 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
            >
              <option value="">All Corridors</option>
              {availableRegions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="w-full rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 text-xs text-[#55655C]">
              <p className="font-semibold text-[#17231C]">DEMO FORECAST NOTICE</p>
              <p className="mt-0.5">Not medically validated · Gemini Phase 5</p>
            </div>
          </div>
        </div>
      </section>

      {/* Forecast Trend Chart */}
      <section className="clinical-card rounded-xl p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-semibold text-[#17231C]">
              {period === '7d' ? '7-Day' : '30-Day'} Projected Stock vs. Utilization ({targetScope})
            </h3>
            <p className="text-xs text-[#55655C]">
              DEMO DATA · Simulated demand trajectory for planning preview only
            </p>
          </div>
          <span className="inline-flex items-center gap-1 font-mono-tabular text-xs text-[#55655C]">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            Last Updated: 2026-11-25 14:20 IST
          </span>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="predStockFillGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#123D2B" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="#123D2B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predDemandFillSage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D593E" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#1D593E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#DCE3DC" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#55655C', fontSize: 11 }}
                axisLine={{ stroke: '#DCE3DC' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#55655C', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#DCE3DC',
                  borderRadius: '8px',
                  color: '#17231C',
                  fontSize: '12px',
                  boxShadow: '0 4px 14px rgba(18, 61, 43, 0.08)',
                }}
              />
              <Area
                type="monotone"
                dataKey="availableUnits"
                name="Projected Available (Demo)"
                stroke="#123D2B"
                strokeWidth={1.85}
                fill="url(#predStockFillGreen)"
              />
              <Area
                type="monotone"
                dataKey="demandUnits"
                name="Projected Demand (Demo)"
                stroke="#1D593E"
                strokeWidth={2}
                strokeDasharray="4 3"
                fill="url(#predDemandFillSage)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Role-Specific Forecast Cards with Explanations */}
      {scopedPredictions.length === 0 ? (
        <EmptyStatePanel
          title="No forecasts match the current filters"
          description="Clear the blood group or corridor filter to view simulated forecasts for this period."
          actionLabel="Reset Forecast Filters"
          onAction={() => {
            setBloodGroupFilter('');
            setRegionFilter('');
          }}
        />
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {scopedPredictions.map((pred) => (
            <div
              key={pred.id}
              className="clinical-card clinical-card-interactive rounded-xl p-5 space-y-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tabular text-base font-bold text-[#123D2B]">
                      {pred.bloodGroup}
                    </span>
                    <span className="text-xs font-medium text-[#55655C]">
                      {BLOOD_COMPONENT_LABELS[pred.component]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#55655C]">{pred.region}</p>
                </div>
                <RiskStatusIndicator level={pred.riskLevel} />
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-3 text-center">
                <div>
                  <p className="text-[10px] text-[#55655C]">Current (Demo)</p>
                  <p className="mt-0.5 font-mono-tabular text-sm font-semibold text-[#17231C]">
                    {pred.currentUnits}u
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#55655C]">Proj. Need ({period})</p>
                  <p className="mt-0.5 font-mono-tabular text-sm font-semibold text-[#1D593E]">
                    {pred.projectedDemandOrDepletion}u
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#55655C]">Est. Deficit</p>
                  <p
                    className={`mt-0.5 font-mono-tabular text-sm font-semibold ${
                      pred.riskLevel === 'CRITICAL' ? 'text-[#C93440]' : 'text-[#17231C]'
                    }`}
                  >
                    -{pred.projectedDeficitUnits}u
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs leading-relaxed text-[#55655C]">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#123D2B]" aria-hidden="true" />
                <p>{pred.explanation}</p>
              </div>

              <div className="flex items-center justify-between border-t border-[#DCE3DC] pt-2.5 text-[11px] text-[#55655C]">
                <span>DEMO DATA · Non-clinical</span>
                <span className="font-mono-tabular">{pred.updatedAt}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      <ClinicalDisclaimerNotice variant="light" />
    </div>
  );
}

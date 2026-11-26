import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Clock,
  Droplets,
  Eye,
  LayoutGrid,
  MapPin,
  Phone,
  RotateCcw,
  Search,
  Table2,
  Shield,
  PlusCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  BLOOD_COMPONENTS,
  BLOOD_COMPONENT_LABELS,
  INDIAN_STATES_DEMO,
  RISK_LEVELS,
} from '../../../shared/constants/bloodNetwork.ts';
import type {
  BloodComponent,
  BloodGroup,
  RiskLevel,
} from '../../../shared/constants/bloodNetwork.ts';
import type {
  BloodGroupSummaryItem,
  BloodInventoryRecord,
} from '../../../shared/types/network.ts';
import { FALLBACK_DEMO_SUMMARY } from '../data/demoPortalData.ts';
import {
  fetchBloodAvailability,
  fetchNetworkSummary,
} from '../services/networkApi.ts';
import { ModalDialog } from '../components/ui/ConfirmModal.tsx';
import {
  ClinicalDisclaimerNotice,
  EmptyStatePanel,
  ErrorStatePanel,
  RiskStatusIndicator,
  TableSkeleton,
} from '../components/ui/UiPrimitives.tsx';
import { useAuth } from '@/client/src/context/AuthContext.tsx';
import { ProtectedRoute } from '@/client/src/components/auth/ProtectedRoute.tsx';

function getStockPercent(item: BloodGroupSummaryItem): number {
  if (item.minimumThreshold <= 0) return 100;
  return Math.min(100, Math.round((item.availableUnits / (item.minimumThreshold * 1.5)) * 100));
}

function getStockBarColor(risk: RiskLevel): string {
  if (risk === 'CRITICAL') return 'bg-[#C93440]';
  if (risk === 'MODERATE') return 'bg-[#B45309]';
  return 'bg-[#1D593E]';
}

export function BloodAvailabilityPage({ initialSearch = '' }: { initialSearch?: string }) {
  const [records, setRecords] = useState<BloodInventoryRecord[]>([]);
  const [groupSummary, setGroupSummary] = useState<BloodGroupSummaryItem[]>(
    FALLBACK_DEMO_SUMMARY.bloodGroupOverview,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | ''>('');
  const [selectedComponent, setSelectedComponent] = useState<BloodComponent | ''>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | ''>('');
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [detailRecord, setDetailRecord] = useState<BloodInventoryRecord | null>(null);
  const [requestRecord, setRequestRecord] = useState<BloodInventoryRecord | null>(null);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const { user, login, isAuthenticated } = useAuth();

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    let active = true;
    fetchNetworkSummary()
      .then((res) => {
        if (active) setGroupSummary(res.bloodGroupOverview);
      })
      .catch(() => {
        // Keep fallback demo group summary
      });
    return () => {
      active = false;
    };
  }, []);

  const loadAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchBloodAvailability({
        bloodGroup: selectedGroup || undefined,
        component: selectedComponent || undefined,
        state: selectedState || undefined,
        riskLevel: selectedRisk || undefined,
        search: searchTerm.trim() || undefined,
        limit: 50,
      });
      setRecords(response.records);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch availability.');
    } finally {
      setLoading(false);
    }
  }, [selectedGroup, selectedComponent, selectedState, selectedRisk, searchTerm]);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  const orderedGroups = useMemo(() => {
    const order: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return order.map(
      (g) =>
        groupSummary.find((item) => item.bloodGroup === g) ?? {
          bloodGroup: g,
          availableUnits: 0,
          minimumThreshold: 100,
          daysOfCover: 0,
          riskLevel: 'MODERATE' as RiskLevel,
        },
    );
  }, [groupSummary]);

  const resetFilters = () => {
    setSelectedGroup('');
    setSelectedComponent('');
    setSelectedState('');
    setSelectedRisk('');
    setSearchTerm('');
  };

  const handleRequestClick = (record: BloodInventoryRecord) => {
    if (!isAuthenticated) {
      setRequestRecord(record);
      return;
    }
    setRequestRecord(record);
  };

  const handleSubmitRequest = async () => {
    if (!requestRecord) return;
    
    setRequestSubmitting(true);
    setRequestError(null);
    setRequestSuccess(false);
    
    try {
      // In demo mode, simulate request creation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const requestId = `REQ-DEMO-${Date.now().toString().slice(-6)}`;
      console.log('Blood request created:', {
        id: requestId,
        facility: requestRecord.facilityName,
        bloodGroup: requestRecord.bloodGroup,
        component: requestRecord.component,
        units: requestRecord.unitsAvailable,
        requestedBy: user?.userName || 'Demo User',
      });
      
      setRequestSuccess(true);
      setTimeout(() => {
        setRequestRecord(null);
        setRequestSuccess(false);
      }, 3000);
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : 'Failed to create request');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleLoginForRequest = async () => {
    await login('HOSPITAL_COORDINATOR');
    // After login, the request modal will stay open and user can submit
  };

  return (
    <div className="space-y-6">
      {/* 8 Blood Group Overview Card Grid */}
      <section aria-label="Blood group availability cards" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-semibold text-[#17231C]">
              Blood Group Availability Overview
            </h2>
            <p className="text-xs text-[#55655C]">
              DEMO DATA · Click any blood group card to filter regional hospital and blood bank stock
            </p>
          </div>
          <span className="font-mono-tabular text-xs text-[#55655C]">
            Updated 14:20 IST · Synthetic Demo
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {orderedGroups.map((groupItem) => {
            const active = selectedGroup === groupItem.bloodGroup;
            const pct = getStockPercent(groupItem);
            return (
              <button
                key={groupItem.bloodGroup}
                type="button"
                onClick={() =>
                  setSelectedGroup((prev) =>
                    prev === groupItem.bloodGroup ? '' : groupItem.bloodGroup,
                  )
                }
                className={`clinical-card clinical-card-interactive rounded-xl p-4 text-left ${
                  active ? 'ring-2 ring-[#123D2B] border-[#123D2B]' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg font-mono-tabular text-sm font-bold ${
                        groupItem.riskLevel === 'CRITICAL'
                          ? 'bg-[#C93440]/10 text-[#C93440]'
                          : groupItem.riskLevel === 'MODERATE'
                            ? 'bg-[#B45309]/10 text-[#B45309]'
                            : 'bg-[#F2F5F1] text-[#123D2B]'
                      }`}
                    >
                      {groupItem.bloodGroup}
                    </span>
                    <div>
                      <p className="font-mono-tabular text-lg font-semibold text-[#17231C] leading-tight">
                        {groupItem.availableUnits.toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-normal text-[#55655C]">units</span>
                      </p>
                      <p className="text-[11px] text-[#55655C]">
                        {groupItem.daysOfCover.toFixed(1)}d cover · DEMO DATA
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stock-level indicator bar */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F2F5F1]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getStockBarColor(
                        groupItem.riskLevel,
                      )}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <RiskStatusIndicator level={groupItem.riskLevel} />
                    <span className="text-[#55655C]">
                      Threshold {groupItem.minimumThreshold.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Search & Filter Controls */}
      <section className="clinical-card rounded-xl p-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-sm font-semibold text-[#17231C]">
              Facility &amp; Location Filters
            </h3>
            <p className="text-xs text-[#55655C]">
              Distinguishes DEMO DATA from future authorized e-RaktKosh connected feeds
            </p>
          </div>

          <div className="flex items-center gap-2 self-start">
            <div className="inline-flex rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#123D2B] shadow-xs'
                    : 'text-[#55655C] hover:text-[#17231C]'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-[#123D2B] shadow-xs'
                    : 'text-[#55655C] hover:text-[#17231C]'
                }`}
              >
                <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
                Table
              </button>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="clinical-btn inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#DCE3DC] bg-white px-3 py-1.5 text-xs font-medium text-[#17231C] hover:bg-[#F2F5F1] whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label htmlFor="finder-search" className="block text-xs font-medium text-[#55655C]">
              City, Facility or Blood Group
            </label>
            <div className="relative mt-1.5">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#55655C]"
                aria-hidden="true"
              />
              <input
                id="finder-search"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Mumbai, Pune, KEM, Manipal..."
                className="block w-full min-h-[38px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] pl-8 pr-3 py-1.5 text-sm text-[#17231C] placeholder:text-[#7D8C83] focus:border-[#123D2B] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="finder-component" className="block text-xs font-medium text-[#55655C]">
              Component
            </label>
            <select
              id="finder-component"
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value as BloodComponent | '')}
              className="mt-1.5 block w-full min-h-[38px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-1.5 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
            >
              <option value="">All Components</option>
              {BLOOD_COMPONENTS.map((comp) => (
                <option key={comp} value={comp}>
                  {BLOOD_COMPONENT_LABELS[comp]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="finder-state" className="block text-xs font-medium text-[#55655C]">
              State / Region
            </label>
            <select
              id="finder-state"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="mt-1.5 block w-full min-h-[38px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-1.5 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
            >
              <option value="">All States</option>
              {INDIAN_STATES_DEMO.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="finder-risk" className="block text-xs font-medium text-[#55655C]">
              Availability Status
            </label>
            <select
              id="finder-risk"
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value as RiskLevel | '')}
              className="mt-1.5 block w-full min-h-[38px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-1.5 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
            >
              <option value="">All Tiers</option>
              {RISK_LEVELS.map((tier) => (
                <option key={tier} value={tier}>
                  {tier === 'LOW'
                    ? 'Healthy Supply'
                    : tier === 'MODERATE'
                      ? 'Moderate Watch'
                      : 'Critical Shortage'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Results Area */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : error ? (
        <ErrorStatePanel message={error} onRetry={loadAvailability} />
      ) : records.length === 0 ? (
        <EmptyStatePanel
          title="No matching demo inventory records"
          description="Try broadening the selected blood group, state, or component filter to inspect available simulated records."
          actionLabel="Clear All Filters"
          onAction={resetFilters}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="clinical-card clinical-card-interactive flex flex-col justify-between rounded-xl p-5"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#55655C]">
                      {rec.facilityType === 'BLOOD_BANK' ? (
                        <Droplets className="h-3.5 w-3.5 text-[#123D2B]" aria-hidden="true" />
                      ) : (
                        <Building2 className="h-3.5 w-3.5 text-[#17231C]" aria-hidden="true" />
                      )}
                      <span>
                        {rec.facilityType === 'BLOOD_BANK' ? 'Licensed Blood Bank' : 'Hospital Center'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[#1D593E]">DEMO DATA</span>
                    </div>
                    <h4 className="mt-1 font-display text-sm font-semibold text-[#17231C] leading-snug">
                      {rec.facilityName}
                    </h4>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#55655C]">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                      {rec.city}, {rec.state}
                    </p>
                  </div>

                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg font-mono-tabular text-sm font-bold shrink-0 ${
                      rec.riskLevel === 'CRITICAL'
                        ? 'bg-[#C93440]/10 text-[#C93440]'
                        : rec.riskLevel === 'MODERATE'
                          ? 'bg-[#B45309]/10 text-[#B45309]'
                          : 'bg-[#F2F5F1] text-[#123D2B]'
                    }`}
                  >
                    {rec.bloodGroup}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-3 text-center">
                  <div>
                    <p className="text-[10px] text-[#55655C]">Units</p>
                    <p className="mt-0.5 font-mono-tabular text-sm font-semibold text-[#17231C]">
                      {rec.unitsAvailable}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#55655C]">Cover</p>
                    <p className="mt-0.5 font-mono-tabular text-sm font-semibold text-[#17231C]">
                      {rec.daysOfCover.toFixed(1)}d
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#55655C]">Exp &lt;72h</p>
                    <p
                      className={`mt-0.5 font-mono-tabular text-sm font-semibold ${
                        rec.expiringWithin72h > 10 ? 'text-[#B45309]' : 'text-[#17231C]'
                      }`}
                    >
                      {rec.expiringWithin72h}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#DCE3DC] pt-3">
                <RiskStatusIndicator level={rec.riskLevel} />
                <button
                  type="button"
                  onClick={() => setDetailRecord(rec)}
                  className="clinical-btn inline-flex items-center gap-1 text-xs font-semibold text-[#123D2B] hover:underline"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  Details
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestClick(rec)}
                  className="clinical-btn inline-flex items-center gap-1 text-xs font-semibold bg-[#123D2B] text-white hover:bg-[#1D593E]"
                >
                  <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  Request
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="clinical-card overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-[#DCE3DC] px-5 py-3 text-xs text-[#55655C]">
            <span>
              Showing {records.length} simulated records · Source Attribution: DEMO DATA
            </span>
            <span className="hidden sm:inline">Table View</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
<thead className="border-b border-[#DCE3DC] bg-[#F2F5F1] text-xs font-medium text-[#55655C]">
                <tr>
                  <th className="px-5 py-3">Facility & Location</th>
                  <th className="px-4 py-3">Group · Component</th>
                  <th className="px-4 py-3 text-right">Units (Demo)</th>
                  <th className="px-4 py-3 text-right">Stock Cover</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
<tbody className="divide-y divide-[#DCE3DC]">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#F2F5F1]/60">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[#17231C]">{rec.facilityName}</p>
                      <p className="text-xs text-[#55655C]">
                        {rec.city}, {rec.state} · DEMO DATA
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono-tabular font-semibold text-[#123D2B]">
                        {rec.bloodGroup}
                      </span>
                      <span className="ml-2 text-xs text-[#55655C]">
                        {BLOOD_COMPONENT_LABELS[rec.component]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono-tabular">
                      <p className="font-semibold text-[#17231C]">{rec.unitsAvailable}</p>
                      <p className="text-xs text-[#55655C]">{rec.expiringWithin72h} exp {'<72h'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono-tabular text-[#17231C]">
                      {rec.daysOfCover.toFixed(1)}d
                    </td>
                    <td className="px-4 py-3.5">
                      <RiskStatusIndicator level={rec.riskLevel} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailRecord(rec)}
                          className="text-xs font-semibold text-[#123D2B] hover:underline"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRequestClick(rec)}
                          className="clinical-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#123D2B] text-white hover:bg-[#1D593E] rounded-lg"
                        >
                          <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          Request
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ClinicalDisclaimerNotice variant="light" />

      {/* Detailed Facility Availability Modal */}
      <ModalDialog
        open={Boolean(detailRecord)}
        onClose={() => setDetailRecord(null)}
        title={detailRecord?.facilityName ?? 'Facility Availability Details'}
        subtitle={
          detailRecord
            ? `${detailRecord.city}, ${detailRecord.state} · Source: ${detailRecord.sourceLabel}`
            : undefined
        }
      >
        {detailRecord ? (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-3">
                <p className="text-[#55655C]">Blood Group</p>
                <p className="mt-1 font-mono-tabular text-base font-bold text-[#123D2B]">
                  {detailRecord.bloodGroup}
                </p>
              </div>
              <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-3">
                <p className="text-[#55655C]">Available</p>
                <p className="mt-1 font-mono-tabular text-base font-bold text-[#17231C]">
                  {detailRecord.unitsAvailable}u
                </p>
              </div>
              <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-3">
                <p className="text-[#55655C]">Cover</p>
                <p className="mt-1 font-mono-tabular text-base font-bold text-[#17231C]">
                  {detailRecord.daysOfCover.toFixed(1)}d
                </p>
              </div>
              <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-3">
                <p className="text-[#55655C]">Exp &lt;72h</p>
                <p className="mt-1 font-mono-tabular text-base font-bold text-[#B45309]">
                  {detailRecord.expiringWithin72h}u
                </p>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-[#DCE3DC] bg-white p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[#55655C]">Component</span>
                <span className="font-medium text-[#17231C]">
                  {BLOOD_COMPONENT_LABELS[detailRecord.component]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#55655C]">Availability Status</span>
                <RiskStatusIndicator level={detailRecord.riskLevel} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#55655C]">Coordination Desk</span>
                <span className="inline-flex items-center gap-1 font-mono-tabular text-[#17231C]">
                  <Phone className="h-3 w-3" aria-hidden="true" />
                  {detailRecord.contactPhone}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#55655C]">Last Updated</span>
                <span className="inline-flex items-center gap-1 font-mono-tabular text-[#55655C]">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {new Date(detailRecord.lastUpdatedAt).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <p className="rounded-lg border border-[#1D593E]/25 bg-[#F2F5F1] p-3 text-[#17231C] leading-relaxed">
              <span className="font-semibold text-[#123D2B]">DEMO DATA Provenance:</span>{' '}
              Availability shown is synthetic demonstration data. Confirm live compatibility and
              unit release directly with the blood center laboratory.
            </p>
          </div>
        ) : null}
      </ModalDialog>

      {/* Blood Request Modal */}
      <ModalDialog
        open={Boolean(requestRecord)}
        onClose={() => setRequestRecord(null)}
        title={isAuthenticated ? 'Create Blood Request' : 'Authentication Required'}
        subtitle={
          requestRecord
            ? `${requestRecord.facilityName} · ${requestRecord.bloodGroup} ${BLOOD_COMPONENT_LABELS[requestRecord.component]}`
            : undefined
        }
      >
        {requestRecord ? (
          <div className="space-y-4 text-xs">
            <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-3">
              <p className="text-[#55655C]">Blood Group</p>
              <p className="mt-1 font-mono-tabular text-base font-bold text-[#123D2B]">
                {requestRecord.bloodGroup}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-3">
                <p className="text-[#55655C]">Component</p>
                <p className="mt-1 font-medium text-[#17231C]">
                  {BLOOD_COMPONENT_LABELS[requestRecord.component]}
                </p>
              </div>
              <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-3">
                <p className="text-[#55655C]">Available Units</p>
                <p className="mt-1 font-mono-tabular text-base font-bold text-[#17231C]">
                  {requestRecord.unitsAvailable}u
                </p>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-[#DCE3DC] bg-white p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[#55655C]">Source Facility</span>
                <span className="font-medium text-[#17231C]">{requestRecord.facilityName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#55655C]">Location</span>
                <span className="font-medium text-[#17231C]">{requestRecord.city}, {requestRecord.state}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#55655C]">Availability Status</span>
                <RiskStatusIndicator level={requestRecord.riskLevel} />
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="space-y-3">
                <p className="rounded-lg border border-[#B45309]/25 bg-[#FEFCE8] p-3 text-[#B45309] leading-relaxed">
                  <span className="font-semibold">Login Required:</span> You must be signed in as a Hospital Coordinator to create blood requests.
                </p>
                <button
                  type="button"
                  onClick={handleLoginForRequest}
                  className="clinical-btn w-full inline-flex items-center justify-center gap-2 min-h-[40px] rounded-lg bg-[#123D2B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D593E]"
                >
                  <Shield className="h-4 w-4" />
                  Sign In as Hospital Coordinator
                </button>
              </div>
            ) : requestSuccess ? (
              <div className="space-y-3">
                <p className="rounded-lg border border-[#1D593E]/25 bg-[#F2F5F1] p-3 text-[#17231C] leading-relaxed">
                  <span className="font-semibold text-[#123D2B]">Request Created Successfully!</span> Your blood request has been submitted and logged in the audit trail. The blood bank will review and respond shortly.
                </p>
                <p className="text-xs font-mono-tabular text-[#55655C]">Closing in 3 seconds...</p>
              </div>
            ) : requestError ? (
              <div className="space-y-3">
                <p className="rounded-lg border border-[#C93440]/25 bg-[#FEF2F2] p-3 text-[#C93440] leading-relaxed">
                  <span className="font-semibold">Error:</span> {requestError}
                </p>
                <button
                  type="button"
                  onClick={handleSubmitRequest}
                  disabled={requestSubmitting}
                  className="clinical-btn w-full inline-flex items-center justify-center gap-2 min-h-[40px] rounded-lg bg-[#C93440] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B02D3A]"
                >
                  <AlertCircle className="h-4 w-4" />
                  Retry Request
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="rounded-lg border border-[#1D593E]/25 bg-[#F2F5F1] p-3 text-[#17231C] leading-relaxed">
                  <span className="font-semibold text-[#123D2B]">Confirm Request:</span> This will create a blood request for {requestRecord.unitsAvailable} units of {requestRecord.bloodGroup} {BLOOD_COMPONENT_LABELS[requestRecord.component]} from {requestRecord.facilityName}.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSubmitRequest}
                    disabled={requestSubmitting}
                    className="clinical-btn flex-1 inline-flex items-center justify-center gap-2 min-h-[40px] rounded-lg bg-[#123D2B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D593E]"
                  >
                    {requestSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4" />
                        Confirm Request
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestRecord(null)}
                    className="clinical-btn inline-flex items-center justify-center gap-2 min-h-[40px] rounded-lg border border-[#DCE3DC] bg-white px-4 py-2 text-sm font-semibold text-[#17231C] hover:bg-[#F2F5F1]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </ModalDialog>
    </div>
  );
}

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Droplets,
  PackageCheck,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import {
  BLOOD_COMPONENTS,
  BLOOD_COMPONENT_LABELS,
  BLOOD_GROUPS,
  STOCK_MOVEMENT_TYPES,
  type BloodComponent,
  type BloodGroup,
  type StockMovementType,
} from '../../../shared/constants/bloodNetwork.ts';
import { BloodStockUpdateSchema } from '../../../shared/schemas/networkSchemas.ts';
import type { DemoSessionUser, DemoStockMovement } from '../../../shared/types/network.ts';
import {
  DEMO_BLOOD_BANK_BATCHES,
  FALLBACK_DEMO_SUMMARY,
} from '../data/demoPortalData.ts';
import {
  fetchStockMovements,
  submitBloodStockUpdate,
} from '../services/networkApi.ts';
import type { AppPage } from '../types/navigation.ts';
import { Magnet } from '../components/motion/MotionPrimitives.tsx';
import {
  ClinicalDisclaimerNotice,
  RiskStatusIndicator,
} from '../components/ui/UiPrimitives.tsx';

const MOVEMENT_LABELS: Record<StockMovementType, string> = {
  ADD_UNITS: 'Add Batch Units (+)',
  UPDATE_STOCK: 'Reconcile Vault Count (+)',
  DONATION_IN: 'Donor Collection Intake (+)',
  DISPATCH_OUT: 'Hospital Dispatch Out (-)',
  EXPIRY_FLAG: 'Expiry Quarantine / Write-Off (-)',
};

export function BankInventoryOverviewView({
  onNavigate,
}: {
  onNavigate: (page: AppPage) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="clinical-card overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE3DC] px-5 py-4">
          <div>
            <h2 className="font-display text-base font-semibold text-[#17231C]">
              Cold-Vault Batch Overview
            </h2>
            <p className="text-xs text-[#55655C]">
              DEMO DATA · Active component storage batches and reserve status
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('bank-update-stock')}
            className="clinical-btn inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#123D2B] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1D593E]"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Update Vault Stock
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#DCE3DC] bg-[#F2F5F1] text-xs font-medium text-[#55655C]">
              <tr>
                <th className="px-5 py-3">Batch Code</th>
                <th className="px-4 py-3">Blood Group · Component</th>
                <th className="px-4 py-3 text-right">Available / Reserved</th>
                <th className="px-4 py-3">Storage Rack</th>
                <th className="px-4 py-3 text-right">Expiry Window</th>
                <th className="px-5 py-3">Status</th>
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
                  <td className="px-4 py-3.5 text-right font-mono-tabular text-xs text-[#17231C]">
                    {batch.unitsAvailable} avail · {batch.unitsReserved} res
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#55655C]">{batch.storageUnit}</td>
                  <td className="px-4 py-3.5 text-right font-mono-tabular text-xs text-[#17231C]">
                    {batch.hoursToExpiry <= 72 ? `${batch.hoursToExpiry}h` : `${Math.round(batch.hoursToExpiry / 24)}d`}
                  </td>
                  <td className="px-5 py-3.5">
                    <RiskStatusIndicator level={batch.riskLevel} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <ClinicalDisclaimerNotice variant="light" />
    </div>
  );
}

export function BankUpdateStockView({ demoUser }: { demoUser: DemoSessionUser }) {
  const [batchCode, setBatchCode] = useState('BATCH-MH-2060 (Demo)');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [component, setComponent] = useState<BloodComponent>('PRBC');
  const [movementType, setMovementType] = useState<StockMovementType>('ADD_UNITS');
  const [unitsDelta, setUnitsDelta] = useState<number>(12);
  const [storageUnit, setStorageUnit] = useState('Cold Vault A-02 (4°C)');
  const [expiryDate, setExpiryDate] = useState('2026-12-20');
  const [counterparty, setCounterparty] = useState('');
  const [notes, setNotes] = useState('');
  const [movements, setMovements] = useState<DemoStockMovement[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAuthorized = demoUser.role === 'BLOOD_BANK_OFFICER';

  useEffect(() => {
    let active = true;
    fetchStockMovements(demoUser)
      .then((rows) => {
        if (active) setMovements(rows);
      })
      .catch(() => {
        // Ignore silent fetch errors
      });
    return () => {
      active = false;
    };
  }, [demoUser]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    const parsed = BloodStockUpdateSchema.safeParse({
      batchCode,
      bloodGroup,
      component,
      movementType,
      unitsDelta,
      storageUnit,
      expiryDate,
      counterparty: counterparty || undefined,
      notes: notes || undefined,
    });

    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message ?? 'Please review the stock update fields.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitBloodStockUpdate(demoUser, parsed.data);
      setMovements((prev) => [result.movement, ...prev]);
      setSuccessMsg(`${result.movement.id}: ${result.message}`);
      setNotes('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Stock update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isAuthorized ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-[#C93440]/30 bg-[#FEF2F2] p-5 text-sm text-[#17231C]"
        >
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#C93440]" aria-hidden="true" />
          <div>
            <p className="font-semibold text-[#C93440]">
              RBAC Access Control: Blood Bank Officer Required
            </p>
            <p className="mt-1 text-xs text-[#55655C]">
              Only licensed Blood Bank Officers can modify cold-vault inventory. Any write attempt
              from other roles is rejected with HTTP 403 and recorded in the security audit trail.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="clinical-card rounded-xl p-6 lg:col-span-5">
          <div className="border-b border-[#DCE3DC] pb-4">
            <h2 className="font-display text-base font-semibold text-[#17231C]">
              Record Blood Stock Movement
            </h2>
            <p className="mt-1 text-xs text-[#55655C]">
              DEMO DATA · Every adjustment generates an immutable movement &amp; audit entry
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="stk-type" className="block text-xs font-medium text-[#17231C]">
                Movement Action
              </label>
              <select
                id="stk-type"
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as StockMovementType)}
                className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
              >
                {STOCK_MOVEMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {MOVEMENT_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="stk-group" className="block text-xs font-medium text-[#17231C]">
                  Blood Group
                </label>
                <select
                  id="stk-group"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="stk-units" className="block text-xs font-medium text-[#17231C]">
                  Units (1–500)
                </label>
                <input
                  id="stk-units"
                  type="number"
                  min={1}
                  max={500}
                  value={unitsDelta}
                  onChange={(e) => setUnitsDelta(Number(e.target.value))}
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 font-mono-tabular text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="stk-comp" className="block text-xs font-medium text-[#17231C]">
                  Component
                </label>
                <select
                  id="stk-comp"
                  value={component}
                  onChange={(e) => setComponent(e.target.value as BloodComponent)}
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
                >
                  {BLOOD_COMPONENTS.map((comp) => (
                    <option key={comp} value={comp}>
                      {BLOOD_COMPONENT_LABELS[comp]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="stk-expiry" className="block text-xs font-medium text-[#17231C]">
                  Expiry Date
                </label>
                <input
                  id="stk-expiry"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 font-mono-tabular text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="stk-batch" className="block text-xs font-medium text-[#17231C]">
                  Batch Code
                </label>
                <input
                  id="stk-batch"
                  type="text"
                  value={batchCode}
                  onChange={(e) => setBatchCode(e.target.value)}
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 font-mono-tabular text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="stk-rack" className="block text-xs font-medium text-[#17231C]">
                  Storage Rack
                </label>
                <input
                  id="stk-rack"
                  type="text"
                  value={storageUnit}
                  onChange={(e) => setStorageUnit(e.target.value)}
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="stk-counterparty" className="block text-xs font-medium text-[#17231C]">
                Donor Camp / Receiving Hospital (Optional)
              </label>
              <input
                id="stk-counterparty"
                type="text"
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                placeholder="e.g., KEM Trauma Unit (Demo) or Red Cross Camp"
                className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="stk-notes" className="block text-xs font-medium text-[#17231C]">
                Audit Remark (Optional)
              </label>
              <input
                id="stk-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Cold-chain seal verified"
                className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
              />
            </div>

            {errorMsg ? (
              <p role="alert" className="text-xs font-medium text-[#C93440]">
                {errorMsg}
              </p>
            ) : null}

            {successMsg ? (
              <div className="flex items-start gap-2 rounded-lg border border-[#1D593E]/30 bg-[#F2F5F1] p-3 text-xs text-[#123D2B]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1D593E]" aria-hidden="true" />
                <span>{successMsg}</span>
              </div>
            ) : null}

            <Magnet className="w-full">
              <button
                type="submit"
                disabled={submitting || !isAuthorized}
                className="clinical-btn flex w-full min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#123D2B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D593E] disabled:opacity-50"
              >
                <PackageCheck className="h-4 w-4" aria-hidden="true" />
                {submitting ? 'Recording Stock Movement...' : 'Commit Vault Stock Update'}
              </button>
            </Magnet>
          </form>
        </section>

        {/* Live Stock Movement History */}
        <section className="clinical-card overflow-hidden rounded-xl lg:col-span-7">
          <div className="flex items-center justify-between border-b border-[#DCE3DC] px-5 py-4">
            <div>
              <h3 className="font-display text-base font-semibold text-[#17231C]">
                Recent Inventory Movement History
              </h3>
              <p className="text-xs text-[#55655C]">
                DEMO DATA · Actor-attributed cold-vault log
              </p>
            </div>
            <span className="font-mono-tabular text-xs text-[#55655C]">
              {movements.length} Entries
            </span>
          </div>

          <div className="divide-y divide-[#DCE3DC]">
            {movements.map((mov) => (
              <div
                key={mov.id}
                className="flex flex-col gap-2 px-5 py-4 hover:bg-[#F2F5F1]/60 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-[#F2F5F1] px-2 py-0.5 font-mono-tabular text-[11px] font-semibold text-[#123D2B]">
                      {mov.movementType}
                    </span>
                    <span className="font-mono-tabular text-xs font-semibold text-[#17231C]">
                      {mov.batchCode}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#55655C]">
                    {mov.actorName} · {mov.institutionName}
                  </p>
                  {mov.notes ? <p className="mt-0.5 text-xs text-[#55655C]">{mov.notes}</p> : null}
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <p
                    className={`font-mono-tabular text-sm font-semibold ${
                      mov.unitsDelta >= 0 ? 'text-[#1D593E]' : 'text-[#C93440]'
                    }`}
                  >
                    {mov.unitsDelta >= 0 ? `+${mov.unitsDelta}` : mov.unitsDelta}u · {mov.bloodGroup}{' '}
                    {mov.component}
                  </p>
                  <p className="mt-0.5 font-mono-tabular text-[11px] text-[#55655C]">
                    Bal: {mov.resultingUnits}u · Exp {mov.expiryDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function BankGroupInventoryView({
  onNavigate,
}: {
  onNavigate: (page: AppPage) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-[#17231C]">
            Blood Group Vault Breakdown
          </h2>
          <p className="text-xs text-[#55655C]">
            DEMO DATA · 8 blood group balance posture vs. institutional safety thresholds
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('bank-update-stock')}
          className="clinical-btn inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#123D2B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D593E]"
        >
          Adjust Group Units
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FALLBACK_DEMO_SUMMARY.bloodGroupOverview.map((group) => {
          const pct = Math.min(
            100,
            Math.round((group.availableUnits / Math.max(1, group.minimumThreshold * 1.4)) * 100),
          );
          return (
            <div key={group.bloodGroup} className="clinical-card clinical-card-interactive rounded-xl p-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#123D2B] font-mono-tabular text-sm font-semibold text-white">
                  {group.bloodGroup}
                </span>
                <RiskStatusIndicator level={group.riskLevel} />
              </div>
              <p className="mt-4 font-mono-tabular text-2xl font-semibold text-[#17231C]">
                {group.availableUnits.toLocaleString('en-IN')}u
              </p>
              <p className="mt-0.5 text-xs text-[#55655C]">
                Threshold {group.minimumThreshold.toLocaleString('en-IN')}u · {group.daysOfCover}d cover
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#DCE3DC]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor:
                      group.riskLevel === 'CRITICAL'
                        ? '#C93440'
                        : group.riskLevel === 'MODERATE'
                          ? '#B45309'
                          : '#1D593E',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BankExpiryManagementView({
  onNavigate,
}: {
  onNavigate: (page: AppPage) => void;
}) {
  const sortedBatches = [...DEMO_BLOOD_BANK_BATCHES].sort(
    (a, b) => a.hoursToExpiry - b.hoursToExpiry,
  );

  return (
    <div className="space-y-6">
      <section className="clinical-card rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-[#B45309]" aria-hidden="true" />
            <div>
              <h2 className="font-display text-base font-semibold text-[#17231C]">
                FEFO Expiry Management Watchlist
              </h2>
              <p className="text-xs text-[#55655C]">
                DEMO DATA · First-Expired-First-Out prioritization for units &le; 72h from expiry
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('bank-update-stock')}
            className="clinical-btn inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3.5 py-1.5 text-xs font-medium text-[#17231C] hover:bg-white"
          >
            Flag / Dispatch Near-Expiry Batch
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sortedBatches.map((batch) => {
          const isUrgent = batch.hoursToExpiry <= 72;
          return (
            <div
              key={batch.batchCode}
              className={`clinical-card rounded-xl p-5 ${
                isUrgent ? 'border-[#B45309]/45' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono-tabular text-xs font-semibold text-[#55655C]">
                    {batch.batchCode}
                  </span>
                  <h3 className="mt-1 font-display text-base font-semibold text-[#17231C]">
                    {batch.bloodGroup} · {BLOOD_COMPONENT_LABELS[batch.component]}
                  </h3>
                  <p className="mt-1 text-xs text-[#55655C]">{batch.storageUnit}</p>
                </div>
                <span
                  className={`rounded-md px-2.5 py-1 font-mono-tabular text-xs font-semibold ${
                    batch.hoursToExpiry <= 48
                      ? 'bg-[#C93440]/10 text-[#C93440]'
                      : isUrgent
                        ? 'bg-[#B45309]/10 text-[#B45309]'
                        : 'bg-[#F2F5F1] text-[#55655C]'
                  }`}
                >
                  {isUrgent ? `${batch.hoursToExpiry}h left` : `${Math.round(batch.hoursToExpiry / 24)}d left`}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#DCE3DC] pt-3 text-xs">
                <span className="font-mono-tabular text-[#17231C]">
                  <strong>{batch.unitsAvailable}u</strong> available · {batch.unitsReserved}u reserved
                </span>
                <span className="text-[#55655C]">Expiry: {batch.expiryDate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BankRecordsView({ demoUser }: { demoUser: DemoSessionUser }) {
  const [movements, setMovements] = useState<DemoStockMovement[]>([]);
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    let active = true;
    fetchStockMovements(demoUser)
      .then((rows) => {
        if (active) setMovements(rows);
      })
      .catch(() => {
        // Ignore silent fetch error
      });
    return () => {
      active = false;
    };
  }, [demoUser]);

  const visible = movements.filter((m) => (filterType ? m.movementType === filterType : true));

  return (
    <div className="space-y-6">
      <section className="clinical-card overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE3DC] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ClipboardList className="h-4 w-4 text-[#123D2B]" aria-hidden="true" />
            <div>
              <h2 className="font-display text-base font-semibold text-[#17231C]">
                Donation &amp; Dispatch Records Ledger
              </h2>
              <p className="text-xs text-[#55655C]">
                DEMO DATA · Immutable cold-chain movement records with user, role &amp; institution attribution
              </p>
            </div>
          </div>

          <select
            aria-label="Filter movement type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="min-h-[36px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-1.5 text-xs text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
          >
            <option value="">All Movements ({movements.length})</option>
            {STOCK_MOVEMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#DCE3DC] bg-[#F2F5F1] text-xs font-medium text-[#55655C]">
              <tr>
                <th className="px-5 py-3">Movement ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Blood &amp; Batch</th>
                <th className="px-4 py-3 text-right">Delta / Balance</th>
                <th className="px-4 py-3">Counterparty</th>
                <th className="px-5 py-3">Actor &amp; Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3DC]">
              {visible.map((mov) => (
                <tr key={mov.id} className="hover:bg-[#F2F5F1]/60">
                  <td className="px-5 py-3.5 font-mono-tabular text-xs font-semibold text-[#17231C]">
                    {mov.id}
                  </td>
                  <td className="px-4 py-3.5 font-mono-tabular text-xs text-[#17231C]">
                    {mov.movementType}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-mono-tabular text-xs font-semibold text-[#123D2B]">
                      {mov.bloodGroup} · {BLOOD_COMPONENT_LABELS[mov.component]}
                    </p>
                    <p className="text-[11px] text-[#55655C]">{mov.batchCode}</p>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono-tabular text-xs">
                    <span
                      className={
                        mov.unitsDelta >= 0
                          ? 'font-semibold text-[#1D593E]'
                          : 'font-semibold text-[#C93440]'
                      }
                    >
                      {mov.unitsDelta >= 0 ? `+${mov.unitsDelta}` : mov.unitsDelta}u
                    </span>
                    <span className="ml-1.5 text-[#55655C]">→ {mov.resultingUnits}u</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#55655C]">
                    {mov.counterparty ?? mov.storageUnit}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#55655C]">
                    <p className="font-medium text-[#17231C]">{mov.actorName}</p>
                    <p className="font-mono-tabular text-[11px]">
                      {new Date(mov.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="flex items-center gap-2 text-xs text-[#55655C]">
        <Droplets className="h-3.5 w-3.5 text-[#123D2B]" aria-hidden="true" />
        <span>All stock edits require an authenticated Blood Bank Officer role on the server API.</span>
      </div>
    </div>
  );
}

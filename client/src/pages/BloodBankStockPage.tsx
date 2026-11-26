import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
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
import type {
  BloodInventoryBatchRecord,
  DemoSessionUser,
  DemoStockMovement,
  InventoryExpiryAlert,
  NetworkSummaryResponse,
} from '../../../shared/types/network.ts';
import { fetchNetworkSummary, fetchStockMovements } from '../services/networkApi.ts';
import {
  fetchInventoryBatches,
  fetchInventoryExpiryAlerts,
  importInventoryBatchesApi,
  submitBloodStockUpdate,
} from '../services/networkApi.ts';
import { parseInventoryImportFile } from '../services/inventoryFileParser.ts';
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
  demoUser,
  onNavigate,
}: {
  demoUser: DemoSessionUser;
  onNavigate: (page: AppPage) => void;
}) {
  const [batches, setBatches] = useState<BloodInventoryBatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    let active = true;
    fetchInventoryBatches(demoUser)
      .then((rows) => {
        if (active) setBatches(rows);
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMsg(error instanceof Error ? error.message : 'Unable to load inventory batches.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [demoUser]);

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setImportMessage(null);
    setImporting(true);
    try {
      const payload = await parseInventoryImportFile(file);
      const saved = await importInventoryBatchesApi(demoUser, payload);
      const refreshed = await fetchInventoryBatches(demoUser);
      setBatches(refreshed);
      setImportMessage(`Imported ${saved.length} validated batch rows into this demo session.`);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Inventory import failed.');
    } finally {
      setImporting(false);
      input.value = '';
    }
  };

  const isAuthorized = demoUser.role === 'BLOOD_BANK_OFFICER';

  return (
    <div className="space-y-6">
      <section className="clinical-card overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE3DC] px-5 py-4">
          <div>
            <h2 className="font-display text-base font-semibold text-[#17231C]">
              Cold-Vault Batch Overview
            </h2>
            <p className="text-xs text-[#55655C]">
              DEMO DATA · Current server-session batches, availability and expiry
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

        <div className="border-b border-[#DCE3DC] bg-[#F2F5F1] px-5 py-4">
          <label htmlFor="inventory-import" className="block text-xs font-semibold text-[#17231C]">
            Import inventory (.csv or .xlsx)
          </label>
          <p className="mt-1 text-[11px] text-[#55655C]">
            Required columns: batchCode, bloodGroup, component, unitsAvailable, expiryDate,
            storageUnit, city, state. Optional: latitude, longitude.
          </p>
          <input
            id="inventory-import"
            type="file"
            accept=".csv,.xlsx"
            disabled={!isAuthorized || importing}
            onChange={handleImportFile}
            className="mt-2 block w-full text-xs text-[#55655C] file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#123D2B] disabled:opacity-50"
          />
          {!isAuthorized ? (
            <p className="mt-1 text-xs text-[#C93440]">Blood Bank Officer role required to import.</p>
          ) : null}
          {importing ? <p className="mt-2 text-xs text-[#55655C]">Validating and importing...</p> : null}
          {importMessage ? <p role="status" className="mt-2 text-xs text-[#1D593E]">{importMessage}</p> : null}
          {errorMsg ? <p role="alert" className="mt-2 text-xs text-[#C93440]">{errorMsg}</p> : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#DCE3DC] bg-[#F2F5F1] text-xs font-medium text-[#55655C]">
              <tr>
                <th className="px-5 py-3">Batch Code</th>
                <th className="px-4 py-3">Blood Group · Component</th>
                <th className="px-4 py-3 text-right">Available / Reserved</th>
                <th className="px-4 py-3">Storage Rack</th>
                <th className="px-4 py-3 text-right">Expiry Date</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3DC]">
              {batches.map((batch) => {
                const hoursToExpiry = Math.floor(
                  (new Date(`${batch.expiryDate}T23:59:59.999Z`).getTime() - Date.now()) /
                    (60 * 60 * 1000),
                );
                const riskLevel = hoursToExpiry <= 72 ? 'CRITICAL' : 'LOW';
                return (
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
                    {batch.unitsAvailable - batch.unitsReserved} avail · {batch.unitsReserved} res
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#55655C]">{batch.storageUnit}</td>
                  <td className="px-4 py-3.5 text-right font-mono-tabular text-xs text-[#17231C]">
                    {batch.expiryDate}
                  </td>
                  <td className="px-5 py-3.5">
                    <RiskStatusIndicator level={riskLevel} />
                  </td>
                </tr>
                );
              })}
              {!loading && batches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-[#55655C]">
                    No inventory batches are registered for this demo organization.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          {loading ? <p className="px-5 py-4 text-xs text-[#55655C]">Loading inventory...</p> : null}
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
  const [city, setCity] = useState(demoUser.city);
  const [state, setState] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
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
      .catch((error: unknown) => {
        if (active) {
          setErrorMsg(error instanceof Error ? error.message : 'Unable to load stock movements.');
        }
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
      city: city || undefined,
      state: state || undefined,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
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
                  Units {movementType === 'UPDATE_STOCK' ? '(0–500)' : '(1–500)'}
                </label>
                <input
                  id="stk-units"
                  type="number"
                  min={movementType === 'UPDATE_STOCK' ? 0 : 1}
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="stk-city" className="block text-xs font-medium text-[#17231C]">
                  City
                </label>
                <input
                  id="stk-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 text-sm text-[#17231C]"
                />
              </div>
              <div>
                <label htmlFor="stk-state" className="block text-xs font-medium text-[#17231C]">
                  State / UT
                </label>
                <input
                  id="stk-state"
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State or Union Territory"
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 text-sm text-[#17231C]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="stk-latitude" className="block text-xs font-medium text-[#17231C]">
                  Latitude (Optional)
                </label>
                <input
                  id="stk-latitude"
                  type="number"
                  min="-90"
                  max="90"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 text-sm text-[#17231C]"
                />
              </div>
              <div>
                <label htmlFor="stk-longitude" className="block text-xs font-medium text-[#17231C]">
                  Longitude (Optional)
                </label>
                <input
                  id="stk-longitude"
                  type="number"
                  min="-180"
                  max="180"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 text-sm text-[#17231C]"
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
  demoUser,
  onNavigate,
}: {
  demoUser: DemoSessionUser;
  onNavigate: (page: AppPage) => void;
}) {
  const [summary, setSummary] = useState<NetworkSummaryResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchNetworkSummary()
      .then((result) => {
        if (active) setSummary(result);
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMsg(error instanceof Error ? error.message : 'Unable to load group inventory.');
        }
      });
    return () => {
      active = false;
    };
  }, [demoUser]);

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

      {errorMsg ? <p role="alert" className="text-sm text-[#C93440]">{errorMsg}</p> : null}
      {!summary && !errorMsg ? <p className="text-sm text-[#55655C]">Loading group inventory...</p> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(summary?.bloodGroupOverview ?? []).map((group) => {
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
  demoUser,
  onNavigate,
}: {
  demoUser: DemoSessionUser;
  onNavigate: (page: AppPage) => void;
}) {
  const [alerts, setAlerts] = useState<InventoryExpiryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchInventoryExpiryAlerts(demoUser)
      .then((rows) => {
        if (active) setAlerts(rows);
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMsg(error instanceof Error ? error.message : 'Unable to load expiry alerts.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [demoUser]);

  const sortedBatches = [...alerts].sort(
    (left, right) => left.hoursUntilExpiry - right.hoursUntilExpiry,
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
                DEMO DATA · Current organization batches expiring within 72 hours or already expired
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

      {errorMsg ? <p role="alert" className="text-sm text-[#C93440]">{errorMsg}</p> : null}
      {loading ? <p className="text-sm text-[#55655C]">Loading expiry alerts...</p> : null}
      {!loading && !errorMsg && sortedBatches.length === 0 ? (
        <p className="rounded-xl border border-[#DCE3DC] bg-white p-5 text-sm text-[#55655C]">
          No expiring or expired batches are recorded for this demo organization.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sortedBatches.map((batch) => {
          const isExpired = batch.status === 'EXPIRED';
          const isUrgent = batch.hoursUntilExpiry <= 72;
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
                    {batch.bloodGroup} ·                     {BLOOD_COMPONENT_LABELS[batch.component]}
                  </h3>
                  <p className="mt-1 text-xs text-[#55655C]">{batch.bloodBankName} · {batch.city}, {batch.state}</p>
                </div>
                <span
                  className={`rounded-md px-2.5 py-1 font-mono-tabular text-xs font-semibold ${
                    isExpired || batch.hoursUntilExpiry <= 48
                      ? 'bg-[#C93440]/10 text-[#C93440]'
                      : isUrgent
                        ? 'bg-[#B45309]/10 text-[#B45309]'
                        : 'bg-[#F2F5F1] text-[#55655C]'
                  }`}
                >
                  {isExpired
                    ? `Expired ${Math.abs(batch.hoursUntilExpiry)}h ago`
                    : `${batch.hoursUntilExpiry}h left`}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#DCE3DC] pt-3 text-xs">
                <span className="font-mono-tabular text-[#17231C]">
                  <strong>{batch.unitsAvailable}u</strong> available
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchStockMovements(demoUser)
      .then((rows) => {
        if (active) setMovements(rows);
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMsg(error instanceof Error ? error.message : 'Unable to load movement history.');
        }
      });
    return () => {
      active = false;
    };
  }, [demoUser]);

  const visible = movements.filter((m) => (filterType ? m.movementType === filterType : true));

  return (
    <div className="space-y-6">
      {errorMsg ? <p role="alert" className="text-sm text-[#C93440]">{errorMsg}</p> : null}
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

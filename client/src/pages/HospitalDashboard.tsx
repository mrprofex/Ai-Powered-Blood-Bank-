import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  PlusCircle,
  Send,
  ShieldAlert,
  Truck,
} from 'lucide-react';
import {
  BLOOD_COMPONENTS,
  BLOOD_COMPONENT_LABELS,
  BLOOD_GROUPS,
} from '../../../shared/constants/bloodNetwork.ts';
import type { BloodComponent, BloodGroup } from '../../../shared/constants/bloodNetwork.ts';
import { DemoRequestValidationSchema } from '../../../shared/schemas/networkSchemas.ts';
import type { DemoHospitalRequestRecord, DemoSessionUser } from '../../../shared/types/network.ts';
import { DEMO_HOSPITAL_REQUESTS } from '../data/demoPortalData.ts';
import {
  createHospitalBloodRequest,
  fetchHospitalRequests,
} from '../services/networkApi.ts';
import type { AppPage } from '../types/navigation.ts';
import { LiveOrderMapTracker } from '../components/maps/LiveOrderMapTracker.tsx';
import { AnimatedCounter, Magnet, SpotlightCard } from '../components/motion/MotionPrimitives.tsx';
import {
  ClinicalDisclaimerNotice,
  RiskStatusIndicator,
} from '../components/ui/UiPrimitives.tsx';

interface HospitalWorkspaceProps {
  demoUser: DemoSessionUser;
  onNavigate: (page: AppPage) => void;
}

const REQUEST_STEPS: Array<DemoHospitalRequestRecord['status']> = [
  'OPEN',
  'MATCHED',
  'ALLOCATED',
  'DISPATCHED',
];

export function HospitalDashboard({ demoUser, onNavigate }: HospitalWorkspaceProps) {
  const [requests, setRequests] = useState<DemoHospitalRequestRecord[]>(DEMO_HOSPITAL_REQUESTS);
  const [trackedRequestId, setTrackedRequestId] = useState<string>(
    DEMO_HOSPITAL_REQUESTS[0]?.id ?? '',
  );

  useEffect(() => {
    let active = true;
    fetchHospitalRequests(demoUser)
      .then((rows) => {
        if (active) {
          setRequests(rows);
          if (rows[0]) setTrackedRequestId((prev) => prev || rows[0].id);
        }
      })
      .catch(() => {
        // Fallback demo requests remain displayed
      });
    return () => {
      active = false;
    };
  }, [demoUser]);

  const criticalCount = requests.filter((r) => r.urgency === 'CRITICAL').length;
  const openOrMatchedCount = requests.filter(
    (r) => r.status === 'OPEN' || r.status === 'MATCHED',
  ).length;
  const avgEta = Math.round(
    requests.reduce((sum, r) => sum + r.etaMinutes, 0) / Math.max(1, requests.length),
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <section className="flex flex-col gap-4 border-b border-[#DCE3DC] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-[#1D593E]">
            Hospital Coordination Workspace · {demoUser.organizationName}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-[#17231C]">
            Welcome back, {demoUser.name.replace(' (Demo)', '')}
          </h2>
          <p className="mt-1 text-sm text-[#55655C]">
            Manage trauma and surgical blood requests, track allocation ETAs, and monitor 7-day hospital demand.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('availability')}
            className="clinical-btn inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-[#DCE3DC] bg-white px-3.5 py-2 text-xs font-medium text-[#17231C] hover:bg-[#F2F5F1] whitespace-nowrap"
          >
            Find Blood Availability
          </button>
          <Magnet>
            <button
              type="button"
              onClick={() => onNavigate('hospital-create-request')}
              className="clinical-btn inline-flex min-h-[38px] items-center gap-2 rounded-lg bg-[var(--bn-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--bn-secondary)] whitespace-nowrap"
            >
              <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Create Blood Request
            </button>
          </Magnet>
        </div>
      </section>

      {/* Hospital Triage KPI Strip */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SpotlightCard className="rounded-xl p-5">
          <p className="text-xs text-[var(--bn-muted)]">Active Triage Queue · DEMO DATA</p>
          <p className="mt-1.5 font-mono-tabular text-2xl font-semibold text-[var(--bn-text)]">
            <AnimatedCounter value={requests.length} /> Requests
          </p>
          <p className="mt-1 text-xs text-[var(--bn-muted)]">
            {openOrMatchedCount} awaiting allocation/dispatch
          </p>
        </SpotlightCard>

        <div className="clinical-card rounded-xl border-[#C93440]/30 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#55655C]">Critical Priority · DEMO DATA</p>
            <ShieldAlert className="h-4 w-4 text-[#C93440]" aria-hidden="true" />
          </div>
          <p className="mt-1.5 font-mono-tabular text-2xl font-semibold text-[#C93440]">
            {criticalCount} Urgent
          </p>
          <p className="mt-1 text-xs text-[#55655C]">Immediate cross-facility matching</p>
        </div>

        <div className="clinical-card rounded-xl p-5">
          <p className="text-xs text-[#55655C]">Mean Matched ETA · DEMO DATA</p>
          <p className="mt-1.5 font-mono-tabular text-2xl font-semibold text-[#123D2B]">
            {avgEta} min
          </p>
          <p className="mt-1 text-xs text-[#55655C]">Simulated metropolitan courier window</p>
        </div>

        <div className="clinical-card rounded-xl p-5">
          <p className="text-xs text-[#55655C]">7-Day Shortage Watch · DEMO DATA</p>
          <p className="mt-1.5 font-mono-tabular text-2xl font-semibold text-[#17231C]">
            O- · A+
          </p>
          <button
            type="button"
            onClick={() => onNavigate('predictions-7d')}
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#123D2B] hover:underline"
          >
            Inspect 7-Day Forecast
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Active Requests Table + Quick Actions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <section className="clinical-card overflow-hidden rounded-xl lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE3DC] px-5 py-4">
            <div>
              <h3 className="font-display text-base font-semibold text-[#17231C]">
                Hospital Transfusion Request Queue
              </h3>
              <p className="text-xs text-[#55655C]">
                DEMO DATA · Live session requests synced via Express API
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('hospital-request-tracking')}
              className="text-xs font-semibold text-[#123D2B] hover:underline"
            >
              Open Full Tracker
            </button>
          </div>

          <div className="divide-y divide-[#DCE3DC]">
            {requests.slice(0, 6).map((req) => (
              <div
                key={req.id}
                onClick={() => setTrackedRequestId(req.id)}
                className={`flex cursor-pointer flex-col gap-2 px-5 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                  trackedRequestId === req.id
                    ? 'bg-[var(--bn-soft-bg)]'
                    : 'hover:bg-[var(--bn-soft-bg)]/60'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-tabular text-xs font-semibold text-[#55655C]">
                      {req.id}
                    </span>
                    <span className="text-[#C2CEC4]" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-sm font-semibold text-[#17231C]">{req.department}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#55655C]">
                    {req.hospitalName} ({req.city}) · Matched: {req.matchedBank}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs shrink-0">
                  <span className="font-mono-tabular font-semibold text-[#17231C]">
                    {req.bloodGroup} · {req.units}u {req.component}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono-tabular text-[#55655C]">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {req.etaMinutes}m
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 font-semibold ${
                      req.urgency === 'CRITICAL'
                        ? 'bg-[#C93440]/10 text-[#C93440]'
                        : req.urgency === 'HIGH'
                          ? 'bg-[#B45309]/10 text-[#B45309]'
                          : 'bg-[#1D593E]/10 text-[#1D593E]'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 lg:col-span-4">
          <div className="clinical-card rounded-xl p-5">
            <h3 className="font-display text-sm font-semibold text-[#17231C]">
              Hospital Coordinator Tools
            </h3>
            <p className="mt-1 text-xs text-[#55655C]">
              RBAC-scoped actions available for your hospital workspace.
            </p>
            <div className="mt-4 space-y-2.5">
              <button
                type="button"
                onClick={() => onNavigate('hospital-create-request')}
                className="clinical-btn flex w-full items-center justify-between rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3.5 py-2.5 text-left text-xs font-medium text-[#17231C] hover:border-[#123D2B]/40 hover:bg-white"
              >
                <span>Submit Emergency Blood Request</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#123D2B]" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('hospital-request-tracking')}
                className="clinical-btn flex w-full items-center justify-between rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3.5 py-2.5 text-left text-xs font-medium text-[#17231C] hover:border-[#123D2B]/40 hover:bg-white"
              >
                <span>Track Allocation &amp; Dispatch Pipeline</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#123D2B]" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('predictions-30d')}
                className="clinical-btn flex w-full items-center justify-between rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3.5 py-2.5 text-left text-xs font-medium text-[#17231C] hover:border-[#123D2B]/40 hover:bg-white"
              >
                <span>Review 30-Day Surgical Demand</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#123D2B]" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="clinical-card rounded-xl border-[#123D2B]/25 bg-[#F2F5F1] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#123D2B]">
              Role Boundary · Read-Only Stock
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#17231C]">
              Hospital Coordinators can create and track blood requests, while physical vault
              stock adjustments remain restricted exclusively to licensed Blood Bank Officers.
            </p>
          </div>
        </section>
      </div>

      {/* Interactive Google Maps Live Order & Cold-Chain Route Tracker */}
      <LiveOrderMapTracker
        requests={requests}
        selectedRequestId={trackedRequestId}
        onSelectRequest={setTrackedRequestId}
      />

      <ClinicalDisclaimerNotice variant="light" />
    </div>
  );
}

export function CreateBloodRequestView({ demoUser, onNavigate }: HospitalWorkspaceProps) {
  const [hospitalName, setHospitalName] = useState(demoUser.organizationName);
  const [department, setDepartment] = useState('Emergency Trauma Bay');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [component, setComponent] = useState<BloodComponent>('PRBC');
  const [unitsNeeded, setUnitsNeeded] = useState<number>(4);
  const [urgency, setUrgency] = useState<'CRITICAL' | 'HIGH' | 'ROUTINE'>('HIGH');
  const [city, setCity] = useState<string>(demoUser.city || 'Bengaluru');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [createdRecord, setCreatedRecord] = useState<DemoHospitalRequestRecord | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setResultMsg(null);
    setErrorMsg(null);
    setCreatedRecord(null);

    const parsed = DemoRequestValidationSchema.safeParse({
      hospitalName,
      department,
      bloodGroup,
      component,
      unitsNeeded,
      urgency,
      city,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      notes: notes || undefined,
    });

    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message ?? 'Please review the request parameters.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createHospitalBloodRequest(demoUser, parsed.data);
      setCreatedRecord(response.record);
      setResultMsg(response.message);
      setNotes('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to submit blood request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="clinical-card rounded-xl p-6 lg:col-span-7">
          <div className="border-b border-[#DCE3DC] pb-4">
            <h2 className="font-display text-lg font-semibold text-[#17231C]">
              Create Emergency Blood Request
            </h2>
            <p className="mt-1 text-xs text-[#55655C]">
              DEMO DATA · Validated against shared Zod contracts and logged to the active demo request queue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="req-hospital" className="block text-xs font-medium text-[#17231C]">
                  Requesting Hospital
                </label>
                <input
                  id="req-hospital"
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="req-dept" className="block text-xs font-medium text-[#17231C]">
                  Clinical Department / Ward
                </label>
                <input
                  id="req-dept"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor="req-group" className="block text-xs font-medium text-[#17231C]">
                  Blood Group
                </label>
                <select
                  id="req-group"
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
                <label htmlFor="req-units" className="block text-xs font-medium text-[#17231C]">
                  Units (1–50)
                </label>
                <input
                  id="req-units"
                  type="number"
                  min={1}
                  max={50}
                  value={unitsNeeded}
                  onChange={(e) => setUnitsNeeded(Number(e.target.value))}
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 font-mono-tabular text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="req-comp" className="block text-xs font-medium text-[#17231C]">
                  Component
                </label>
                <select
                  id="req-comp"
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
                <label htmlFor="req-urgency" className="block text-xs font-medium text-[#17231C]">
                  Priority
                </label>
                <select
                  id="req-urgency"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as 'CRITICAL' | 'HIGH' | 'ROUTINE')}
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="ROUTINE">Routine</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="req-city" className="block text-xs font-medium text-[#17231C]">
                  City
                </label>
                <input
                  id="req-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="req-notes" className="block text-xs font-medium text-[#17231C]">
                  Clinical / Cross-Match Notes (Optional)
                </label>
                <input
                  id="req-notes"
                  type="text"
                  maxLength={300}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Irradiated PRBC preferred if available"
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="req-latitude" className="block text-xs font-medium text-[#17231C]">
                  Latitude (Optional)
                </label>
                <input
                  id="req-latitude"
                  type="number"
                  min="-90"
                  max="90"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="req-longitude" className="block text-xs font-medium text-[#17231C]">
                  Longitude (Optional)
                </label>
                <input
                  id="req-longitude"
                  type="number"
                  min="-180"
                  max="180"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-2 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {errorMsg ? (
              <p role="alert" className="text-xs font-medium text-[#C93440]">
                {errorMsg}
              </p>
            ) : null}

            {resultMsg && createdRecord ? (
              <div className="rounded-lg border border-[#1D593E]/30 bg-[#F2F5F1] p-4 text-xs text-[#17231C]">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1D593E]" aria-hidden="true" />
                  <div className="space-y-1">
                    <p className="font-semibold text-[#123D2B]">
                      {createdRecord.id} Submitted · Status: {createdRecord.status}
                    </p>
                    <p className="text-[#55655C]">{resultMsg}</p>
                    <p className="font-semibold text-[#17231C]">Nearby inventory candidates (demo):</p>
                    {createdRecord.matchingCandidates?.length ? (
                      <ul className="list-disc space-y-1 pl-4 text-[#55655C]">
                        {createdRecord.matchingCandidates.map((match) => (
                          <li key={`${match.bloodBankName}-${match.city}-${match.distanceKm}`}>
                            {match.bloodBankName} — {match.availableUnits}u, {match.distanceKm} km
                            {match.canFulfillRequest ? ' · can fulfill request' : ' · insufficient units'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[#55655C]">
                        No nearby matching stock was found. Unknown city names require explicit coordinates.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => onNavigate('hospital-request-tracking')}
                      className="mt-1 inline-flex items-center gap-1 font-semibold text-[#123D2B] underline"
                    >
                      Track in Request Pipeline
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Magnet>
                <button
                  type="submit"
                  disabled={submitting}
                  className="clinical-btn inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-[#123D2B] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1D593E] disabled:opacity-60"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {submitting ? 'Submitting Demo Request...' : 'Submit Blood Request (Demo)'}
                </button>
              </Magnet>
              <button
                type="button"
                onClick={() => onNavigate('availability')}
                className="clinical-btn inline-flex min-h-[42px] items-center rounded-lg border border-[#DCE3DC] bg-white px-4 py-2 text-xs font-medium text-[#17231C] hover:bg-[#F2F5F1]"
              >
                Check Nearby Inventory First
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-4 lg:col-span-5">
          <div className="clinical-card rounded-xl p-5">
            <h3 className="font-display text-sm font-semibold text-[#17231C]">
              Triage SLA Guidelines (Demo)
            </h3>
            <ul className="mt-3 space-y-2.5 text-xs text-[#55655C]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#C93440] shrink-0" />
                <span>
                  <strong className="text-[#17231C]">Critical:</strong> Immediate regional broadcast
                  targeting matched blood banks within 30 min ETA.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#B45309] shrink-0" />
                <span>
                  <strong className="text-[#17231C]">High:</strong> Priority surgical or oncology
                  cross-match within 45–60 min coordination window.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#1D593E] shrink-0" />
                <span>
                  <strong className="text-[#17231C]">Routine:</strong> Scheduled elective buffer
                  replenishment prioritizing FEFO near-expiry units.
                </span>
              </li>
            </ul>
          </div>

          <ClinicalDisclaimerNotice variant="light" />
        </aside>
      </div>
    </div>
  );
}

export function HospitalRequestTrackingView({ demoUser, onNavigate }: HospitalWorkspaceProps) {
  const [requests, setRequests] = useState<DemoHospitalRequestRecord[]>(DEMO_HOSPITAL_REQUESTS);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [trackedId, setTrackedId] = useState<string>(DEMO_HOSPITAL_REQUESTS[0]?.id ?? '');

  useEffect(() => {
    let active = true;
    fetchHospitalRequests(demoUser)
      .then((rows) => {
        if (active) {
          setRequests(rows);
          if (rows[0]) setTrackedId((prev) => prev || rows[0].id);
        }
      })
      .catch(() => {
        // Keep demo fallback
      });
    return () => {
      active = false;
    };
  }, [demoUser]);

  const visible = requests.filter((req) => (statusFilter ? req.status === statusFilter : true));

  return (
    <div className="space-y-6">
      <LiveOrderMapTracker
        requests={visible.length > 0 ? visible : requests}
        selectedRequestId={trackedId}
        onSelectRequest={setTrackedId}
      />

      <section className="clinical-card flex flex-col gap-4 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-base font-semibold text-[#17231C]">
            Request Fulfillment &amp; Dispatch Tracking
          </h2>
          <p className="text-xs text-[#55655C]">
            DEMO DATA · Real-time stage progression across Open, Matched, Allocated, and Dispatched milestones
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Filter by request status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-[36px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-1.5 text-xs text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
          >
            <option value="">All Statuses ({requests.length})</option>
            {REQUEST_STEPS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onNavigate('hospital-create-request')}
            className="clinical-btn inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#123D2B] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1D593E]"
          >
            <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
            New Request
          </button>
        </div>
      </section>

      <div className="space-y-4">
        {visible.map((req) => {
          const activeStepIdx = REQUEST_STEPS.indexOf(req.status);
          return (
            <article key={req.id} className="clinical-card rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-tabular text-xs font-semibold text-[#123D2B]">
                      {req.id}
                    </span>
                    <span className="text-sm font-semibold text-[#17231C]">
                      {req.hospitalName} · {req.department}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#55655C]">
                    Assigned Blood Bank: <strong className="text-[#17231C]">{req.matchedBank}</strong> ·{' '}
                    {req.city} · Est. Courier ETA {req.etaMinutes} min
                  </p>
                  {req.notes ? (
                    <p className="mt-1 text-xs italic text-[#55655C]">Note: {req.notes}</p>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono-tabular text-xs font-semibold text-[#17231C]">
                    {req.bloodGroup} · {req.units}u {BLOOD_COMPONENT_LABELS[req.component]}
                  </span>
                  <RiskStatusIndicator
                    level={
                      req.urgency === 'CRITICAL'
                        ? 'CRITICAL'
                        : req.urgency === 'HIGH'
                          ? 'MODERATE'
                          : 'LOW'
                    }
                  />
                </div>
              </div>

              {/* 4-step visual timeline */}
              <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4">
                {REQUEST_STEPS.map((step, idx) => {
                  const completed = idx <= activeStepIdx;
                  const isCurrent = idx === activeStepIdx;
                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                        isCurrent
                          ? 'border-[#123D2B] bg-[#123D2B] font-semibold text-white'
                          : completed
                            ? 'border-[#1D593E]/30 bg-[#F2F5F1] text-[#123D2B]'
                            : 'border-[#DCE3DC] bg-white text-[#55655C]'
                      }`}
                    >
                      <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="font-mono-tabular">{step}</span>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      <ClinicalDisclaimerNotice variant="light" />
    </div>
  );
}

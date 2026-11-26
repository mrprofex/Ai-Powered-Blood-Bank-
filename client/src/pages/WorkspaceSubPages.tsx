import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileBarChart2,
  PlusCircle,
  Printer,
  Settings,
} from 'lucide-react';
import {
  BLOOD_COMPONENT_LABELS,
  ROLE_DISPLAY_NAMES,
} from '../../../shared/constants/bloodNetwork.ts';
import type {
  DemoHospitalRequestRecord,
  DemoSessionUser,
} from '../../../shared/types/network.ts';
import {
  DEMO_HOSPITAL_REQUESTS,
  FALLBACK_DEMO_SUMMARY,
} from '../data/demoPortalData.ts';
import {
  fetchHospitalRequests,
  updateHospitalRequestStatusApi,
} from '../services/networkApi.ts';
import type { AppPage } from '../types/navigation.ts';
import {
  BloodGroupInventoryChart,
  ShortageTrendDemoChart,
} from '../components/charts/BloodInventoryCharts.tsx';
import { LiveOrderMapTracker } from '../components/maps/LiveOrderMapTracker.tsx';
import {
  ClinicalDisclaimerNotice,
  RiskStatusIndicator,
} from '../components/ui/UiPrimitives.tsx';

export function EmergencyRequestsView({
  demoUser,
  onNavigate,
}: {
  demoUser: DemoSessionUser;
  onNavigate: (page: AppPage) => void;
}) {
  const [requests, setRequests] = useState<DemoHospitalRequestRecord[]>(DEMO_HOSPITAL_REQUESTS);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const canRespond =
    demoUser.role === 'BLOOD_BANK_OFFICER' || demoUser.role === 'ADMIN';

  useEffect(() => {
    let active = true;
    fetchHospitalRequests(demoUser)
      .then((rows) => {
        if (active) setRequests(rows);
      })
      .catch(() => {
        // Keep demo fallback
      });
    return () => {
      active = false;
    };
  }, [demoUser]);

  const handleAdvanceStatus = async (
    req: DemoHospitalRequestRecord,
    nextStatus: DemoHospitalRequestRecord['status'],
  ) => {
    setUpdatingId(req.id);
    setFeedbackMsg(null);
    try {
      const updated = await updateHospitalRequestStatusApi(demoUser, req.id, {
        status: nextStatus,
        matchedBank:
          req.matchedBank === 'Pending Allocation'
            ? demoUser.organizationName
            : req.matchedBank,
      });
      setRequests((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setFeedbackMsg(`${updated.id} transitioned to ${updated.status} (Demo).`);
    } catch (err) {
      setFeedbackMsg(err instanceof Error ? err.message : 'Unable to update request.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <LiveOrderMapTracker requests={requests} />

      {feedbackMsg ? (
        <div className="flex items-center gap-2 rounded-xl border border-[#1D593E]/30 bg-[#F2F5F1] px-4 py-3 text-xs font-medium text-[#123D2B]">
          <CheckCircle2 className="h-4 w-4 text-[#1D593E] shrink-0" aria-hidden="true" />
          <span>{feedbackMsg}</span>
        </div>
      ) : null}

      <section className="clinical-card overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE3DC] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-[#C93440]" aria-hidden="true" />
            <div>
              <h2 className="font-display text-base font-semibold text-[#17231C]">
                {demoUser.role === 'BLOOD_BANK_OFFICER'
                  ? 'Incoming Hospital Blood Requests'
                  : 'Network Emergency Requests'}
              </h2>
              <p className="text-xs text-[#55655C]">
                DEMO DATA · Priority inter-facility coordination queue synced with Express API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono-tabular text-xs text-[#55655C]">
              {requests.length} Active Demo Requests
            </span>
            {demoUser.role === 'HOSPITAL_COORDINATOR' ? (
              <button
                type="button"
                onClick={() => onNavigate('hospital-create-request')}
                className="clinical-btn inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#123D2B] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1D593E]"
              >
                <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
                New Request
              </button>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#DCE3DC] bg-[#F2F5F1] text-xs font-medium text-[#55655C]">
              <tr>
                <th className="px-5 py-3">Request ID</th>
                <th className="px-4 py-3">Hospital &amp; Unit</th>
                <th className="px-4 py-3">Required Blood</th>
                <th className="px-4 py-3">Matched Blood Bank</th>
                <th className="px-4 py-3 text-right">ETA</th>
                <th className="px-4 py-3">Priority / Status</th>
                {canRespond ? <th className="px-5 py-3 text-right">Fulfillment Action</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3DC]">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-[#F2F5F1]/60">
                  <td className="px-5 py-3.5 font-mono-tabular text-xs font-semibold text-[#17231C]">
                    {req.id}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-[#17231C]">{req.hospitalName}</p>
                    <p className="text-xs text-[#55655C]">
                      {req.department} · {req.city}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 font-mono-tabular text-xs font-medium text-[#17231C]">
                    {req.bloodGroup} · {req.units}u {BLOOD_COMPONENT_LABELS[req.component]}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#55655C]">{req.matchedBank}</td>
                  <td className="px-4 py-3.5 text-right font-mono-tabular text-xs text-[#17231C]">
                    {req.etaMinutes} min
                  </td>
                  <td className="px-4 py-3.5 text-xs font-semibold">
                    <span
                      className={
                        req.urgency === 'CRITICAL'
                          ? 'text-[#C93440]'
                          : req.urgency === 'HIGH'
                            ? 'text-[#B45309]'
                            : 'text-[#1D593E]'
                      }
                    >
                      {req.urgency} · {req.status}
                    </span>
                  </td>
                  {canRespond ? (
                    <td className="px-5 py-3.5 text-right">
                      {req.status === 'OPEN' ? (
                        <button
                          type="button"
                          disabled={updatingId === req.id}
                          onClick={() => handleAdvanceStatus(req, 'MATCHED')}
                          className="rounded border border-[#123D2B]/30 bg-[#123D2B]/10 px-2.5 py-1 text-xs font-semibold text-[#123D2B] hover:bg-[#123D2B]/15 disabled:opacity-50"
                        >
                          Accept &amp; Match
                        </button>
                      ) : req.status === 'MATCHED' ? (
                        <button
                          type="button"
                          disabled={updatingId === req.id}
                          onClick={() => handleAdvanceStatus(req, 'ALLOCATED')}
                          className="rounded border border-[#DCE3DC] bg-[#F2F5F1] px-2.5 py-1 text-xs font-semibold text-[#17231C] hover:bg-[#E7EEE8] disabled:opacity-50"
                        >
                          Allocate Units
                        </button>
                      ) : req.status === 'ALLOCATED' ? (
                        <button
                          type="button"
                          disabled={updatingId === req.id}
                          onClick={() => handleAdvanceStatus(req, 'DISPATCHED')}
                          className="rounded border border-[#1D593E]/30 bg-[#1D593E]/10 px-2.5 py-1 text-xs font-semibold text-[#123D2B] hover:bg-[#1D593E]/20 disabled:opacity-50"
                        >
                          Mark Dispatched
                        </button>
                      ) : (
                        <span className="text-xs text-[#55655C]">Dispatched ✓</span>
                      )}
                    </td>
                  ) : null}
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

export function RoleReportsView({ demoUser }: { demoUser: DemoSessionUser }) {
  const reportTitle =
    demoUser.role === 'HOSPITAL_COORDINATOR'
      ? 'Hospital Transfusion & Fulfillment SLA Report'
      : demoUser.role === 'BLOOD_BANK_OFFICER'
        ? 'Blood Bank Cold-Vault & Expiry Utilization Report'
        : 'National Network Shortage & Governance Report';

  return (
    <div className="space-y-6">
      <section className="clinical-card flex flex-col gap-4 rounded-xl p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#123D2B]/10 text-[#123D2B]">
            <FileBarChart2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-[#17231C]">{reportTitle}</h2>
            <p className="text-xs text-[#55655C]">
              DEMO DATA · Scoped to {ROLE_DISPLAY_NAMES[demoUser.role]} ({demoUser.organizationName})
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="clinical-btn inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-[#DCE3DC] bg-white px-4 py-2 text-xs font-medium text-[#17231C] hover:bg-[#F2F5F1]"
        >
          <Printer className="h-3.5 w-3.5 text-[#123D2B]" aria-hidden="true" />
          Print Summary (Demo)
        </button>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="clinical-card rounded-xl p-5">
          <h3 className="font-display text-sm font-semibold text-[#17231C]">
            Blood Group Balance Snapshot
          </h3>
          <p className="mb-4 text-xs text-[#55655C]">DEMO DATA · Units vs. safety threshold</p>
          <BloodGroupInventoryChart data={FALLBACK_DEMO_SUMMARY.bloodGroupOverview} />
        </div>

        <div className="clinical-card rounded-xl p-5">
          <h3 className="font-display text-sm font-semibold text-[#17231C]">
            7-Day Utilization &amp; Depletion Curve
          </h3>
          <p className="mb-4 text-xs text-[#55655C]">DEMO DATA · Simulated clinical draw-down</p>
          <ShortageTrendDemoChart />
        </div>
      </div>

      <section className="clinical-card rounded-xl p-5">
        <h3 className="font-display text-sm font-semibold text-[#17231C]">
          Key Operational Takeaways (Simulated)
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-4">
            <RiskStatusIndicator level="CRITICAL" />
            <p className="mt-2 text-xs font-semibold text-[#17231C]">O- &amp; B- Group Pressure</p>
            <p className="mt-1 text-xs text-[#55655C]">
              Days-of-cover fell below 2.2 days across Mumbai–Pune and Delhi NCR corridors.
            </p>
          </div>
          <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-4">
            <RiskStatusIndicator level="MODERATE" />
            <p className="mt-2 text-xs font-semibold text-[#17231C]">72h FEFO Platelet Watch</p>
            <p className="mt-1 text-xs text-[#55655C]">
              18u Platelets flagged for early transfer to minimize cold-chain wastage.
            </p>
          </div>
          <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-4">
            <RiskStatusIndicator level="LOW" />
            <p className="mt-2 text-xs font-semibold text-[#17231C]">32-Min Mean Match Time</p>
            <p className="mt-1 text-xs text-[#55655C]">
              Simulated digital triage reduces manual cross-hospital phone calls by 68%.
            </p>
          </div>
        </div>
      </section>

      <ClinicalDisclaimerNotice variant="light" />
    </div>
  );
}

export function RoleSettingsView({
  demoUser,
  onSignOutDemo,
}: {
  demoUser: DemoSessionUser;
  onSignOutDemo: () => void;
}) {
  const [lowStockThresholdDays, setLowStockThresholdDays] = useState(3);
  const [criticalThresholdDays, setCriticalThresholdDays] = useState(2);
  const [savedNotice, setSavedNotice] = useState(false);

  return (
    <div className="space-y-6">
      <section className="clinical-card rounded-xl p-6">
        <div className="flex items-center gap-2.5 border-b border-[#DCE3DC] pb-4">
          <Settings className="h-4 w-4 text-[#123D2B]" aria-hidden="true" />
          <div>
            <h2 className="font-display text-base font-semibold text-[#17231C]">
              {ROLE_DISPLAY_NAMES[demoUser.role]} Preferences
            </h2>
            <p className="text-xs text-[#55655C]">
              Session-scoped preferences for {demoUser.organizationName} ({demoUser.city})
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-4">
            <p className="text-xs font-semibold text-[#17231C]">Active Demo Identity</p>
            <p className="text-sm font-medium text-[#17231C]">{demoUser.name}</p>
            <p className="text-xs text-[#55655C]">{demoUser.email}</p>
            <p className="text-xs text-[#55655C]">
              Role: {ROLE_DISPLAY_NAMES[demoUser.role]} · City: {demoUser.city}
            </p>
          </div>

          <div className="space-y-3 rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-4">
            <p className="text-xs font-semibold text-[#17231C]">Alert Threshold Preview (Demo)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="set-low" className="block text-[11px] text-[#55655C]">
                  Watch Cover (Days)
                </label>
                <input
                  id="set-low"
                  type="number"
                  min={2}
                  max={7}
                  value={lowStockThresholdDays}
                  onChange={(e) => {
                    setLowStockThresholdDays(Number(e.target.value));
                    setSavedNotice(false);
                  }}
                  className="mt-1 block w-full rounded-lg border border-[#DCE3DC] bg-white px-2.5 py-1.5 font-mono-tabular text-xs text-[#17231C]"
                />
              </div>
              <div>
                <label htmlFor="set-crit" className="block text-[11px] text-[#55655C]">
                  Critical Cover (Days)
                </label>
                <input
                  id="set-crit"
                  type="number"
                  min={1}
                  max={4}
                  value={criticalThresholdDays}
                  onChange={(e) => {
                    setCriticalThresholdDays(Number(e.target.value));
                    setSavedNotice(false);
                  }}
                  className="mt-1 block w-full rounded-lg border border-[#DCE3DC] bg-white px-2.5 py-1.5 font-mono-tabular text-xs text-[#17231C]"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSavedNotice(true)}
              className="clinical-btn rounded-lg bg-[#123D2B] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1D593E]"
            >
              Apply Session Thresholds
            </button>
            {savedNotice ? (
              <p className="text-[11px] font-medium text-[#1D593E]">
                Session thresholds updated (non-persistent demo mode).
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#DCE3DC] pt-4">
          <p className="text-xs text-[#55655C]">
            Real password &amp; OAuth account settings activate in Phase 2.
          </p>
          <button
            type="button"
            onClick={onSignOutDemo}
            className="clinical-btn rounded-lg border border-[#DCE3DC] bg-white px-4 py-2 text-xs font-medium text-[#17231C] hover:bg-[#F2F5F1]"
          >
            Sign Out to Landing Page
          </button>
        </div>
      </section>

      <ClinicalDisclaimerNotice variant="light" />
    </div>
  );
}

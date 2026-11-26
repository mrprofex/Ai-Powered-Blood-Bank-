import { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  Droplets,
  FileText,
  Lock,
  Settings,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react';
import {
  ROLE_DISPLAY_NAMES,
  ROLE_PERMISSIONS,
  USER_ROLES,
  type PermissionAction,
} from '../../../shared/constants/bloodNetwork.ts';
import type {
  DemoAuditLogEntry,
  DemoSessionUser,
  DemoVerificationRecord,
  HealthCheckResponse,
} from '../../../shared/types/network.ts';
import {
  fetchAdminDirectoryApi,
  fetchApiHealth,
  fetchAuditLogsApi,
  reviewAdminVerificationApi,
  updateAdminInstitutionStatusApi,
  updateAdminUserStatusApi,
  type AdminDirectoryResponse,
} from '../services/networkApi.ts';
import { ModalDialog } from '../components/ui/ConfirmModal.tsx';
import { ClinicalDisclaimerNotice } from '../components/ui/UiPrimitives.tsx';

function EntityStatusBadge({ status }: { status: 'ACTIVE' | 'SUSPENDED' | 'UNDER_REVIEW' }) {
  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-[#1D593E]/10 px-2 py-0.5 text-xs font-medium text-[#123D2B]">
        Active
      </span>
    );
  }
  if (status === 'SUSPENDED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-[#C93440]/10 px-2 py-0.5 text-xs font-semibold text-[#C93440]">
        Suspended
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-[#B45309]/10 px-2 py-0.5 text-xs font-semibold text-[#B45309]">
      Under Review
    </span>
  );
}

function AdminInstitutionsTable({
  demoUser,
  entityType,
}: {
  demoUser: DemoSessionUser;
  entityType: 'HOSPITAL' | 'BLOOD_BANK';
}) {
  const [directory, setDirectory] = useState<AdminDirectoryResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    name: string;
    nextStatus: 'ACTIVE' | 'SUSPENDED' | 'UNDER_REVIEW';
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const loadDirectory = () => {
    fetchAdminDirectoryApi(demoUser)
      .then((res) => {
        setDirectory(res);
        setErrorMsg(null);
      })
      .catch((err) => {
        setErrorMsg(err instanceof Error ? err.message : 'Unable to load directory.');
      });
  };

  useEffect(() => {
    loadDirectory();
  }, [demoUser]);

  const rows = (directory?.institutions ?? []).filter((item) => item.type === entityType);

  const confirmStatusChange = async () => {
    if (!pendingAction) return;
    setSaving(true);
    try {
      await updateAdminInstitutionStatusApi(demoUser, pendingAction.id, {
        status: pendingAction.nextStatus,
        reason: `Admin governance update via demo console (${pendingAction.nextStatus})`,
      });
      setPendingAction(null);
      loadDirectory();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg ? (
        <div role="alert" className="rounded-xl border border-[#C93440]/30 bg-white p-4 text-xs font-medium text-[#C93440]">
          {errorMsg}
        </div>
      ) : null}

      <section className="clinical-card overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE3DC] px-5 py-4">
          <div className="flex items-center gap-2.5">
            {entityType === 'HOSPITAL' ? (
              <Building2 className="h-4 w-4 text-[#123D2B]" aria-hidden="true" />
            ) : (
              <Droplets className="h-4 w-4 text-[#123D2B]" aria-hidden="true" />
            )}
            <div>
              <h2 className="font-display text-base font-semibold text-[#17231C]">
                {entityType === 'HOSPITAL' ? 'Registered Hospitals Directory' : 'Licensed Blood Banks Directory'}
              </h2>
              <p className="text-xs text-[#55655C]">
                DEMO DATA · Governance lifecycle actions are logged to the immutable audit trail
              </p>
            </div>
          </div>
          <span className="font-mono-tabular text-xs text-[#55655C]">{rows.length} Facilities</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#DCE3DC] bg-[#F2F5F1] text-xs font-medium text-[#55655C]">
              <tr>
                <th className="px-5 py-3">Institution</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">License Reference</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Governance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3DC]">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-[#F2F5F1]/60">
                  <td className="px-5 py-3.5 font-medium text-[#17231C]">{row.name}</td>
                  <td className="px-4 py-3.5 text-xs text-[#55655C]">
                    {row.city}, {row.state}
                  </td>
                  <td className="px-4 py-3.5 font-mono-tabular text-xs text-[#17231C]">
                    {row.licenseRef}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#55655C]">{row.unitsOrBedsLabel}</td>
                  <td className="px-4 py-3.5">
                    <EntityStatusBadge status={row.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      {row.status !== 'ACTIVE' ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPendingAction({ id: row.id, name: row.name, nextStatus: 'ACTIVE' })
                          }
                          className="rounded border border-[#1D593E]/30 bg-[#F2F5F1] px-2.5 py-1 text-xs font-medium text-[#123D2B] hover:bg-[#E7EEE8]"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setPendingAction({ id: row.id, name: row.name, nextStatus: 'SUSPENDED' })
                          }
                          className="rounded border border-[#C93440]/30 bg-[#C93440]/5 px-2.5 py-1 text-xs font-medium text-[#C93440] hover:bg-[#C93440]/10"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ModalDialog
        open={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        title="Confirm Institutional Status Change"
        subtitle="DEMO DATA · Action will be recorded in the Admin Audit Log"
      >
        {pendingAction ? (
          <div className="space-y-4 text-sm text-[#17231C]">
            <p className="text-xs leading-relaxed text-[#55655C]">
              Set <strong className="text-[#17231C]">{pendingAction.name}</strong> status to{' '}
              <strong className="text-[#123D2B]">{pendingAction.nextStatus}</strong>?
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="rounded-lg border border-[#DCE3DC] px-3.5 py-2 text-xs font-medium text-[#17231C] hover:bg-[#F2F5F1]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={confirmStatusChange}
                className="rounded-lg bg-[#123D2B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D593E] disabled:opacity-60"
              >
                {saving ? 'Applying...' : 'Confirm Change'}
              </button>
            </div>
          </div>
        ) : null}
      </ModalDialog>
    </div>
  );
}

export function AdminHospitalsView({ demoUser }: { demoUser: DemoSessionUser }) {
  return <AdminInstitutionsTable demoUser={demoUser} entityType="HOSPITAL" />;
}

export function AdminBloodBanksView({ demoUser }: { demoUser: DemoSessionUser }) {
  return <AdminInstitutionsTable demoUser={demoUser} entityType="BLOOD_BANK" />;
}

export function AdminVerificationView({ demoUser }: { demoUser: DemoSessionUser }) {
  const [verifications, setVerifications] = useState<DemoVerificationRecord[]>([]);
  const [pendingItem, setPendingItem] = useState<{
    record: DemoVerificationRecord;
    decision: 'VERIFIED' | 'REJECTED';
  } | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [saving, setSaving] = useState(false);

  const loadQueue = () => {
    fetchAdminDirectoryApi(demoUser)
      .then((res) => setVerifications(res.verifications))
      .catch(() => {
        // Silent fallback
      });
  };

  useEffect(() => {
    loadQueue();
  }, [demoUser]);

  const submitDecision = async () => {
    if (!pendingItem) return;
    setSaving(true);
    try {
      await reviewAdminVerificationApi(demoUser, pendingItem.record.id, {
        status: pendingItem.decision,
        reviewNote: reviewNote || undefined,
      });
      setPendingItem(null);
      setReviewNote('');
      loadQueue();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="clinical-card overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-[#DCE3DC] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-[#123D2B]" aria-hidden="true" />
            <div>
              <h2 className="font-display text-base font-semibold text-[#17231C]">
                SBTC / CDSCO Institutional Verification Queue
              </h2>
              <p className="text-xs text-[#55655C]">
                DEMO DATA · Approve or reject institutional onboarding licenses
              </p>
            </div>
          </div>
          <span className="font-mono-tabular text-xs text-[#55655C]">
            {verifications.length} Applications
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#DCE3DC] bg-[#F2F5F1] text-xs font-medium text-[#55655C]">
              <tr>
                <th className="px-5 py-3">Organization</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">License Ref (Demo)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Review Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3DC]">
              {verifications.map((item) => (
                <tr key={item.id} className="hover:bg-[#F2F5F1]/60">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-[#17231C]">{item.organizationName}</p>
                    {item.reviewNote ? (
                      <p className="text-[11px] text-[#55655C]">Note: {item.reviewNote}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#55655C]">
                    {item.type === 'HOSPITAL' ? 'Hospital' : 'Blood Bank'}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#55655C]">
                    {item.city}, {item.state}
                  </td>
                  <td className="px-4 py-3.5 font-mono-tabular text-xs text-[#17231C]">
                    {item.licenseNumber}
                  </td>
                  <td className="px-4 py-3.5">
                    {item.status === 'VERIFIED' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1D593E]">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Verified
                      </span>
                    ) : item.status === 'REJECTED' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C93440]">
                        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B45309]">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        Pending Review
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPendingItem({ record: item, decision: 'VERIFIED' })}
                        className="rounded border border-[#1D593E]/30 bg-[#F2F5F1] px-2.5 py-1 text-xs font-medium text-[#123D2B] hover:bg-[#E7EEE8]"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingItem({ record: item, decision: 'REJECTED' })}
                        className="rounded border border-[#C93440]/30 bg-[#C93440]/5 px-2.5 py-1 text-xs font-medium text-[#C93440] hover:bg-[#C93440]/10"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ModalDialog
        open={Boolean(pendingItem)}
        onClose={() => setPendingItem(null)}
        title={`Confirm License ${pendingItem?.decision === 'VERIFIED' ? 'Approval' : 'Rejection'}`}
        subtitle={pendingItem?.record.organizationName}
      >
        {pendingItem ? (
          <div className="space-y-4">
            <p className="text-xs text-[#55655C]">
              License Ref:{' '}
              <strong className="font-mono-tabular text-[#17231C]">
                {pendingItem.record.licenseNumber}
              </strong>
            </p>
            <div>
              <label htmlFor="ver-note" className="block text-xs font-medium text-[#17231C]">
                Reviewer Note (Optional)
              </label>
              <input
                id="ver-note"
                type="text"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="SBTC document check completed"
                className="mt-1.5 block w-full min-h-[38px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-1.5 text-xs text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingItem(null)}
                className="rounded-lg border border-[#DCE3DC] px-3.5 py-2 text-xs font-medium text-[#17231C] hover:bg-[#F2F5F1]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={submitDecision}
                className={`rounded-lg px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 ${
                  pendingItem.decision === 'VERIFIED'
                    ? 'bg-[#123D2B] hover:bg-[#1D593E]'
                    : 'bg-[#C93440] hover:bg-red-700'
                }`}
              >
                {saving ? 'Saving...' : `Confirm ${pendingItem.decision}`}
              </button>
            </div>
          </div>
        ) : null}
      </ModalDialog>
    </div>
  );
}

export function AdminUsersView({ demoUser }: { demoUser: DemoSessionUser }) {
  const [users, setUsers] = useState<AdminDirectoryResponse['users']>([]);
  const [pendingUser, setPendingUser] = useState<{
    id: string;
    name: string;
    nextStatus: 'ACTIVE' | 'SUSPENDED';
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const loadUsers = () => {
    fetchAdminDirectoryApi(demoUser)
      .then((res) => setUsers(res.users))
      .catch(() => {
        // Silent fallback
      });
  };

  useEffect(() => {
    loadUsers();
  }, [demoUser]);

  const confirmUpdate = async () => {
    if (!pendingUser) return;
    setSaving(true);
    try {
      await updateAdminUserStatusApi(demoUser, pendingUser.id, {
        status: pendingUser.nextStatus,
        reason: 'User account governance action',
      });
      setPendingUser(null);
      loadUsers();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="clinical-card overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-[#DCE3DC] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Users className="h-4 w-4 text-[#123D2B]" aria-hidden="true" />
            <div>
              <h2 className="font-display text-base font-semibold text-[#17231C]">
                Platform User Management
              </h2>
              <p className="text-xs text-[#55655C]">
                DEMO DATA · Role assignments and session access governance
              </p>
            </div>
          </div>
          <span className="font-mono-tabular text-xs text-[#55655C]">{users.length} Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#DCE3DC] bg-[#F2F5F1] text-xs font-medium text-[#55655C]">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Institution</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3DC]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#F2F5F1]/60">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-[#17231C]">{u.name}</p>
                    <p className="text-xs text-[#55655C]">{u.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-medium text-[#17231C]">
                    {ROLE_DISPLAY_NAMES[u.role]}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#55655C]">
                    {u.institution} ({u.city})
                  </td>
                  <td className="px-4 py-3.5">
                    <EntityStatusBadge status={u.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {u.status === 'ACTIVE' ? (
                      <button
                        type="button"
                        onClick={() => setPendingUser({ id: u.id, name: u.name, nextStatus: 'SUSPENDED' })}
                        className="rounded border border-[#C93440]/30 bg-[#C93440]/5 px-2.5 py-1 text-xs font-medium text-[#C93440] hover:bg-[#C93440]/10"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPendingUser({ id: u.id, name: u.name, nextStatus: 'ACTIVE' })}
                        className="rounded border border-[#1D593E]/30 bg-[#F2F5F1] px-2.5 py-1 text-xs font-medium text-[#123D2B] hover:bg-[#E7EEE8]"
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ModalDialog
        open={Boolean(pendingUser)}
        onClose={() => setPendingUser(null)}
        title="Confirm User Access Update"
        subtitle={pendingUser?.name}
      >
        {pendingUser ? (
          <div className="space-y-4">
            <p className="text-xs text-[#55655C]">
              Set user account access status to{' '}
              <strong className="text-[#17231C]">{pendingUser.nextStatus}</strong>?
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingUser(null)}
                className="rounded-lg border border-[#DCE3DC] px-3.5 py-2 text-xs font-medium text-[#17231C]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={confirmUpdate}
                className="rounded-lg bg-[#123D2B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D593E] disabled:opacity-60"
              >
                {saving ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        ) : null}
      </ModalDialog>
    </div>
  );
}

const PERMISSION_LABELS: Record<PermissionAction, string> = {
  VIEW_PUBLIC_AVAILABILITY: 'View Public Availability & Nearby Blood Banks',
  CREATE_BLOOD_REQUEST: 'Create Hospital Blood Requests',
  TRACK_HOSPITAL_REQUESTS: 'Track Hospital Request Pipeline',
  VIEW_HOSPITAL_PREDICTIONS: 'View Hospital 7d / 30d Demand Predictions',
  MANAGE_BLOOD_BANK_INVENTORY: 'Modify Blood Bank Vault Inventory (Exclusive)',
  RECORD_DONATIONS_AND_DISPATCHES: 'Log Donations & Dispatches',
  RESPOND_TO_HOSPITAL_REQUESTS: 'Accept / Allocate / Dispatch Hospital Requests',
  VIEW_BANK_PREDICTIONS: 'View Blood Bank Stock & Expiry Predictions',
  VERIFY_INSTITUTIONS: 'Approve / Reject SBTC Institutional Licenses',
  MANAGE_USERS_AND_ROLES: 'Manage Users & Institutional Access',
  VIEW_AUDIT_LOGS: 'Inspect Security & Operational Audit Logs',
  CONFIGURE_PLATFORM: 'Configure System & Network Policies',
};

export function AdminRolesView() {
  const allPermissions = Object.keys(PERMISSION_LABELS) as PermissionAction[];

  return (
    <div className="space-y-6">
      <section className="clinical-card overflow-hidden rounded-xl">
        <div className="flex items-center gap-2.5 border-b border-[#DCE3DC] px-5 py-4">
          <Lock className="h-4 w-4 text-[#123D2B]" aria-hidden="true" />
          <div>
            <h2 className="font-display text-base font-semibold text-[#17231C]">
              Role-Based Access Control (RBAC) Permission Matrix
            </h2>
            <p className="text-xs text-[#55655C]">
              Enforced symmetrically in client route guards and Express API middleware (403 Forbidden + audit log)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE3DC] bg-[#F2F5F1] font-medium text-[#55655C]">
              <tr>
                <th className="px-5 py-3">Capability / Permission</th>
                {USER_ROLES.map((role) => (
                  <th key={role} className="px-4 py-3 text-center">
                    {ROLE_DISPLAY_NAMES[role]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3DC]">
              {allPermissions.map((perm) => (
                <tr key={perm} className="hover:bg-[#F2F5F1]/60">
                  <td className="px-5 py-3 font-medium text-[#17231C]">
                    {PERMISSION_LABELS[perm]}
                  </td>
                  {USER_ROLES.map((role) => {
                    const allowed = ROLE_PERMISSIONS[role].includes(perm);
                    return (
                      <td key={role} className="px-4 py-3 text-center">
                        {allowed ? (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#123D2B]/10 text-[#123D2B] font-bold">
                            ✓
                          </span>
                        ) : (
                          <span className="text-[#C2CEC4]">—</span>
                        )}
                      </td>
                    );
                  })}
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

export function AdminAuditLogsView({ demoUser }: { demoUser: DemoSessionUser }) {
  const [logs, setLogs] = useState<DemoAuditLogEntry[]>([]);
  const [outcomeFilter, setOutcomeFilter] = useState<'ALL' | 'ALLOWED' | 'DENIED'>('ALL');

  useEffect(() => {
    let active = true;
    fetchAuditLogsApi(demoUser)
      .then((rows) => {
        if (active) setLogs(rows);
      })
      .catch(() => {
        // Silent fallback
      });
    return () => {
      active = false;
    };
  }, [demoUser]);

  const visible = logs.filter((l) =>
    outcomeFilter === 'ALL' ? true : l.outcome === outcomeFilter,
  );

  return (
    <div className="space-y-6">
      <section className="clinical-card overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE3DC] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <FileText className="h-4 w-4 text-[#123D2B]" aria-hidden="true" />
            <div>
              <h2 className="font-display text-base font-semibold text-[#17231C]">
                Security &amp; Operations Audit Logs
              </h2>
              <p className="text-xs text-[#55655C]">
                DEMO DATA · Tracks permitted mutations and server-rejected RBAC access attempts
              </p>
            </div>
          </div>

          <select
            aria-label="Filter audit outcome"
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value as 'ALL' | 'ALLOWED' | 'DENIED')}
            className="min-h-[36px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-1.5 text-xs text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Events ({logs.length})</option>
            <option value="ALLOWED">Allowed Only</option>
            <option value="DENIED">Denied (403) Only</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE3DC] bg-[#F2F5F1] font-medium text-[#55655C]">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor &amp; Role</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target &amp; Details</th>
                <th className="px-5 py-3">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3DC]">
              {visible.map((log) => (
                <tr key={log.id} className="hover:bg-[#F2F5F1]/60">
                  <td className="px-5 py-3.5 font-mono-tabular text-[#55655C] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-[#17231C]">{log.actorName}</p>
                    <p className="text-[11px] text-[#55655C]">
                      {ROLE_DISPLAY_NAMES[log.actorRole]} · {log.institutionName}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 font-mono-tabular font-semibold text-[#17231C]">
                    {log.action}
                  </td>
                  <td className="px-4 py-3.5 text-[#55655C]">
                    <p className="font-medium text-[#17231C]">{log.target}</p>
                    <p className="mt-0.5">{log.details}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded px-2 py-0.5 font-mono-tabular font-semibold ${
                        log.outcome === 'ALLOWED'
                          ? 'bg-[#1D593E]/10 text-[#123D2B]'
                          : 'bg-[#C93440]/10 text-[#C93440]'
                      }`}
                    >
                      {log.outcome}
                    </span>
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

export function AdminSystemView({
  onSignOutDemo,
}: {
  demoUser: DemoSessionUser;
  onSignOutDemo: () => void;
}) {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);

  useEffect(() => {
    fetchApiHealth()
      .then(setHealth)
      .catch(() => {
        // Silent
      });
  }, []);

  return (
    <div className="space-y-6">
      <section className="clinical-card rounded-xl p-6">
        <div className="flex items-center gap-2.5 border-b border-[#DCE3DC] pb-4">
          <Settings className="h-4 w-4 text-[#123D2B]" aria-hidden="true" />
          <div>
            <h2 className="font-display text-base font-semibold text-[#17231C]">
              System Configuration &amp; Phase Boundaries
            </h2>
            <p className="text-xs text-[#55655C]">
              Integration readiness status (live external credentials remain unset until their scheduled rollout phase)
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-4 space-y-1.5">
            <p className="text-xs font-semibold text-[#17231C]">Neon PostgreSQL &amp; Prisma ORM</p>
            <p className="text-xs text-[#55655C]">
              Status: {health?.database.configured ? 'Configured' : 'Configuration-Only (Schema Ready)'}
            </p>
          </div>
          <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-4 space-y-1.5">
            <p className="text-xs font-semibold text-[#17231C]">Google OAuth 2.0 Authentication</p>
            <p className="text-xs text-[#55655C]">
              Status: {health?.integrations.googleOAuthConfigured ? 'Enabled' : 'Pending Phase 2 Activation'}
            </p>
          </div>
          <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-4 space-y-1.5">
            <p className="text-xs font-semibold text-[#17231C]">Gemini Predictive Explanations</p>
            <p className="text-xs text-[#55655C]">
              Status: {health?.integrations.geminiConfigured ? 'Configured' : 'Pending Phase 5 Server Proxy'}
            </p>
          </div>
          <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-4 space-y-1.5">
            <p className="text-xs font-semibold text-[#17231C]">MoHFW e-RaktKosh Adapter</p>
            <p className="text-xs text-[#55655C]">
              Status: {health?.integrations.eraktkoshConfigured ? 'Authorized' : 'Awaiting Official Credentials'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#DCE3DC] pt-4">
          <p className="text-xs text-[#55655C]">
            Current session runs strictly in isolated Phase 1 Demo Mode.
          </p>
          <button
            type="button"
            onClick={onSignOutDemo}
            className="clinical-btn rounded-lg border border-[#DCE3DC] bg-white px-4 py-2 text-xs font-medium text-[#17231C] hover:bg-[#F2F5F1]"
          >
            Exit to Public Landing Page
          </button>
        </div>
      </section>
    </div>
  );
}

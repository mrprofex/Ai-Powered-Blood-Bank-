import { useMemo, useState } from 'react';
import { Bell, CheckCheck, Clock, ShieldAlert } from 'lucide-react';
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CATEGORY_LABELS,
  ROLE_DISPLAY_NAMES,
  type NotificationCategory,
  type RiskLevel,
  type UserRole,
} from '../../../shared/constants/bloodNetwork.ts';
import { DEMO_NOTIFICATIONS } from '../data/demoPortalData.ts';
import {
  EmptyStatePanel,
  RiskStatusIndicator,
} from '../components/ui/UiPrimitives.tsx';

interface NotificationsCenterPageProps {
  role: UserRole;
  shortageAlertsOnly?: boolean;
}

export function NotificationsCenterPage({
  role,
  shortageAlertsOnly = false,
}: NotificationsCenterPageProps) {
  const [readIds, setReadIds] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | ''>('');
  const [selectedSeverity, setSelectedSeverity] = useState<RiskLevel | ''>('');

  const baseList = useMemo(() => {
    return DEMO_NOTIFICATIONS.filter((item) => {
      if (!item.targetRoles.includes(role)) return false;
      if (shortageAlertsOnly) {
        return (
          item.category === 'CRITICAL_SHORTAGE' ||
          item.category === 'LOW_STOCK' ||
          item.category === 'EXPIRING_UNITS' ||
          item.severity !== 'LOW'
        );
      }
      return true;
    });
  }, [role, shortageAlertsOnly]);

  const filtered = useMemo(() => {
    return baseList.filter((item) => {
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (selectedSeverity && item.severity !== selectedSeverity) return false;
      return true;
    });
  }, [baseList, selectedCategory, selectedSeverity]);

  const unreadCount = baseList.filter((item) => item.unread && !readIds[item.id]).length;

  const markAllRead = () => {
    const next: Record<string, boolean> = {};
    for (const item of baseList) {
      next[item.id] = true;
    }
    setReadIds(next);
  };

  const toggleRead = (id: string) => {
    setReadIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <section className="clinical-card rounded-xl p-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                shortageAlertsOnly
                  ? 'bg-[#C93440]/10 text-[#C93440]'
                  : 'bg-[#123D2B]/10 text-[#123D2B]'
              }`}
            >
              {shortageAlertsOnly ? (
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Bell className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-[#17231C]">
                {shortageAlertsOnly
                  ? `${ROLE_DISPLAY_NAMES[role]} Shortage & Low-Stock Alerts`
                  : `${ROLE_DISPLAY_NAMES[role]} Notification Center`}
              </h2>
              <p className="mt-0.5 text-xs text-[#55655C]">
                DEMO DATA · Role-scoped alert history ({unreadCount} unread in session)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={markAllRead}
            className="clinical-btn inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-1.5 text-xs font-medium text-[#17231C] hover:bg-[#E7EEE8] self-start"
          >
            <CheckCheck className="h-3.5 w-3.5 text-[#123D2B]" aria-hidden="true" />
            Mark All Read
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 border-t border-[#DCE3DC] pt-3">
          <div>
            <label htmlFor="notif-category" className="block text-xs font-medium text-[#55655C]">
              Alert Category
            </label>
            <select
              id="notif-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as NotificationCategory | '')}
              className="mt-1.5 block w-full min-h-[38px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-1.5 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
            >
              <option value="">All Categories</option>
              {NOTIFICATION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {NOTIFICATION_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="notif-severity" className="block text-xs font-medium text-[#55655C]">
              Severity
            </label>
            <select
              id="notif-severity"
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as RiskLevel | '')}
              className="mt-1.5 block w-full min-h-[38px] rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-1.5 text-sm text-[#17231C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical Alert</option>
              <option value="MODERATE">Moderate / Watch</option>
              <option value="LOW">Informational / Healthy</option>
            </select>
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <EmptyStatePanel
          title="No alerts match the selected filter"
          description="Reset the alert category or severity filter to inspect all notifications for your role."
          actionLabel="Reset Alert Filters"
          onAction={() => {
            setSelectedCategory('');
            setSelectedSeverity('');
          }}
        />
      ) : (
        <section className="clinical-card overflow-hidden rounded-xl">
          <ul className="divide-y divide-[#DCE3DC]">
            {filtered.map((item) => {
              const isUnread = item.unread && !readIds[item.id];
              return (
                <li
                  key={item.id}
                  className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between transition-colors ${
                    isUnread ? 'bg-[#123D2B]/[0.03]' : 'hover:bg-[#F2F5F1]/60'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#55655C]">
                      {isUnread ? (
                        <span className="h-2 w-2 rounded-full bg-[#123D2B]" aria-label="Unread" />
                      ) : null}
                      <span className="font-semibold text-[#17231C]">
                        {NOTIFICATION_CATEGORY_LABELS[item.category]}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.facility}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[#17231C]">{item.title}</p>
                    <p className="mt-0.5 text-xs text-[#55655C]">{item.detail}</p>
                    <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-[#55655C]">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {item.timestamp}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <RiskStatusIndicator level={item.severity} />
                    {item.unread ? (
                      <button
                        type="button"
                        onClick={() => toggleRead(item.id)}
                        className="text-xs font-semibold text-[#123D2B] hover:underline"
                      >
                        {isUnread ? 'Mark read' : 'Mark unread'}
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

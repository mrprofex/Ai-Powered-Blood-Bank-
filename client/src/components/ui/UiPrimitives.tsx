import type { ReactNode } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Info,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import type { RiskLevel } from '../../../../shared/constants/bloodNetwork.ts';

export function DemoNoticeBanner({
  context = 'Phase 1 Foundation Demo',
  compact = false,
  variant = 'light',
}: {
  context?: string;
  compact?: boolean;
  variant?: 'light' | 'forest' | 'dark';
}) {
  const isForest = variant === 'forest' || variant === 'dark';

  return (
    <div
      role="status"
      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border ${
        isForest
          ? 'border-[var(--bn-secondary)]/35 bg-[var(--bn-primary)] text-[var(--bn-sidebar-text)]'
          : 'border-[var(--bn-border)] bg-white text-[var(--bn-muted)] shadow-[0_1px_2px_rgba(14,50,36,0.03)]'
      } ${compact ? 'px-3.5 py-2 text-xs' : 'px-4 py-3 text-sm'}`}
    >
      <div className="flex items-center gap-2.5">
        <Database
          className={`h-4 w-4 shrink-0 ${isForest ? 'text-[var(--bn-sidebar-muted)]' : 'text-[var(--bn-secondary)]'}`}
          aria-hidden="true"
        />
        <p className="leading-snug">
          <span className={`font-semibold ${isForest ? 'text-white' : 'text-[var(--bn-text)]'}`}>
            DEMO DATA:
          </span>{' '}
          All hospital counts, inventory units, shortage indicators, and user sessions are simulated for{' '}
          {context}. Not connected to live clinical databases or e-RaktKosh.
        </p>
      </div>
      <span
        className={`font-mono-tabular text-xs font-medium whitespace-nowrap shrink-0 ${
          isForest ? 'text-[var(--bn-sidebar-muted)]' : 'text-[var(--bn-muted)]'
        }`}
      >
        Phase 1 Preview
      </span>
    </div>
  );
}

export function RiskStatusIndicator({ level }: { level: RiskLevel }) {
  if (level === 'CRITICAL') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C93440] whitespace-nowrap shrink-0">
        <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Critical Shortage
      </span>
    );
  }

  if (level === 'MODERATE') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B45309] whitespace-nowrap shrink-0">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Moderate Watch
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1D593E] whitespace-nowrap shrink-0">
      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      Healthy Supply
    </span>
  );
}

export function ClinicalDisclaimerNotice({
  variant = 'light',
}: {
  variant?: 'light' | 'forest' | 'dark';
}) {
  const isForest = variant === 'forest' || variant === 'dark';

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-xs ${
        isForest
          ? 'border-[#1D593E]/30 bg-[#123D2B] text-[#DCE6DF]'
          : 'border-[#DCE3DC] bg-[#F2F5F1] text-[#55655C]'
      }`}
    >
      <Info
        className={`mt-0.5 h-4 w-4 shrink-0 ${isForest ? 'text-[#A3C4AE]' : 'text-[#123D2B]'}`}
        aria-hidden="true"
      />
      <p className="leading-relaxed">
        <span className={`font-semibold ${isForest ? 'text-white' : 'text-[#17231C]'}`}>
          Clinical Protocol Notice:
        </span>{' '}
        This coordination software provides supply visibility only and never performs blood compatibility
        decisions, crossmatching, or transfusion release approvals. All clinical matching remains strictly
        subject to qualified medical professionals and NACO/NBTC laboratory standards.
      </p>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-[#DCE3DC] rounded-lg border border-[#DCE3DC] bg-white">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="space-y-2 flex-1">
            <div className="h-4 w-1/3 rounded bg-[#E6ECE6]" />
            <div className="h-3 w-1/4 rounded bg-[#F2F5F1]" />
          </div>
          <div className="h-4 w-16 rounded bg-[#E6ECE6]" />
          <div className="h-4 w-24 rounded bg-[#F2F5F1]" />
        </div>
      ))}
    </div>
  );
}

export function EmptyStatePanel({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[#DCE3DC] bg-white px-6 py-14 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] text-[#123D2B]">
        {icon ?? <Info className="h-5 w-5" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-semibold text-[#17231C]">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-[#55655C]">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="clinical-btn mt-5 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#123D2B] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D593E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123D2B] whitespace-nowrap shrink-0"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function ErrorStatePanel({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl border border-[#C93440]/30 bg-[#FEF2F2] px-6 py-10 text-center"
    >
      <ShieldAlert className="mb-2 h-6 w-6 text-[#C93440]" aria-hidden="true" />
      <h3 className="text-base font-semibold text-[#17231C]">Unable to load network records</h3>
      <p className="mt-1 max-w-md text-sm text-[#55655C]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="clinical-btn mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-[#DCE3DC] bg-white px-4 py-2 text-sm font-medium text-[#17231C] hover:bg-[#F2F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123D2B] whitespace-nowrap shrink-0"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Retry Request
      </button>
    </div>
  );
}

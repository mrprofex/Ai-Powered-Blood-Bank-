import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Droplets, Search, ShieldAlert } from 'lucide-react';
import type { BloodGroup } from '../../../../shared/constants/bloodNetwork.ts';
import type { BloodGroupSummaryItem } from '../../../../shared/types/network.ts';
import { RiskStatusIndicator } from '../ui/UiPrimitives.tsx';

const COMPATIBILITY: Record<
  BloodGroup,
  { receiveFrom: BloodGroup[]; donateTo: BloodGroup[]; clinicalNote: string }
> = {
  'O-': {
    receiveFrom: ['O-'],
    donateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    clinicalNote: 'Universal emergency RBC donor; requires tight cold-chain buffer.',
  },
  'O+': {
    receiveFrom: ['O-', 'O+'],
    donateTo: ['O+', 'A+', 'B+', 'AB+'],
    clinicalNote: 'Highest baseline trauma demand across metropolitan hospitals.',
  },
  'A-': {
    receiveFrom: ['O-', 'A-'],
    donateTo: ['A-', 'A+', 'AB-', 'AB+'],
    clinicalNote: 'Moderate surgical sensitivity; cross-corridor balancing active.',
  },
  'A+': {
    receiveFrom: ['O-', 'O+', 'A-', 'A+'],
    donateTo: ['A+', 'AB+'],
    clinicalNote: 'Stable urban blood center reserve across 8 state clusters.',
  },
  'B-': {
    receiveFrom: ['O-', 'B-'],
    donateTo: ['B-', 'B+', 'AB-', 'AB+'],
    clinicalNote: 'Scarce Rh-negative group prioritized for early shortage alerts.',
  },
  'B+': {
    receiveFrom: ['O-', 'O+', 'B-', 'B+'],
    donateTo: ['B+', 'AB+'],
    clinicalNote: 'Broad Indian regional availability with steady replenishment.',
  },
  'AB-': {
    receiveFrom: ['O-', 'A-', 'B-', 'AB-'],
    donateTo: ['AB-', 'AB+'],
    clinicalNote: 'Rare plasma universal donor; monitored for 72h expiry rotation.',
  },
  'AB+': {
    receiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    donateTo: ['AB+'],
    clinicalNote: 'Universal RBC recipient; plasma units prioritized for emergency ICU.',
  },
};

export function BloodCompatibilityExplorer({
  bloodGroups,
  onSearchGroup,
}: {
  bloodGroups: BloodGroupSummaryItem[];
  onSearchGroup: (group: BloodGroup) => void;
}) {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');

  const selectedData =
    bloodGroups.find((item) => item.bloodGroup === selectedGroup) ?? bloodGroups[0];
  const guide = COMPATIBILITY[selectedGroup];
  const coverRatio = Math.min(
    100,
    Math.round(
      ((selectedData?.availableUnits ?? 0) /
        Math.max(1, (selectedData?.minimumThreshold ?? 100) * 1.4)) *
        100,
    ),
  );

  return (
    <div className="clinical-card overflow-hidden rounded-2xl">
      <div className="border-b border-[var(--bn-border)] bg-[var(--bn-surface-elevated)] px-5 py-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--bn-secondary)]">
            Interactive ABO/Rh Supply &amp; Compatibility Matrix
          </p>
          <h3 className="mt-0.5 font-display text-base font-semibold text-[var(--bn-text)]">
            Select a blood group to inspect stock cover &amp; reference compatibility
          </h3>
        </div>

        {/* Segmented Animated Selector Rail */}
        <div
          role="tablist"
          aria-label="Select blood group"
          className="inline-flex flex-wrap gap-1 rounded-xl border border-[var(--bn-border)] bg-[var(--bn-soft-bg)] p-1"
        >
          {bloodGroups.map((item) => {
            const active = item.bloodGroup === selectedGroup;
            return (
              <button
                key={item.bloodGroup}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedGroup(item.bloodGroup)}
                className={`relative rounded-lg px-3 py-1.5 font-mono-tabular text-xs font-semibold transition-colors ${
                  active ? 'text-white' : 'text-[var(--bn-muted)] hover:text-[var(--bn-text)]'
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="blood-group-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-lg bg-[var(--bn-primary)] shadow-xs"
                  />
                ) : null}
                <span className="relative z-10 flex items-center gap-1.5">
                  {item.bloodGroup}
                  {item.riskLevel === 'CRITICAL' ? (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        active ? 'bg-[#FCA5A5]' : 'bg-[#C93440]'
                      }`}
                    />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedGroup}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-12"
        >
          {/* Left: Live Supply & Cover Gauge */}
          <div className="space-y-4 lg:col-span-5 lg:border-r lg:border-[var(--bn-border)] lg:pr-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bn-primary)] text-white font-display text-lg font-bold shadow-sm">
                  {selectedGroup}
                </div>
                <div>
                  <p className="font-mono-tabular text-2xl font-semibold text-[var(--bn-text)]">
                    {(selectedData?.availableUnits ?? 0).toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-[var(--bn-muted)]">units (Demo)</span>
                  </p>
                  <p className="text-xs text-[var(--bn-muted)]">
                    Safety threshold:{' '}
                    <span className="font-mono-tabular font-medium text-[var(--bn-text)]">
                      {selectedData?.minimumThreshold.toLocaleString('en-IN')}u
                    </span>
                  </p>
                </div>
              </div>
              {selectedData ? <RiskStatusIndicator level={selectedData.riskLevel} /> : null}
            </div>

            <div className="rounded-xl border border-[var(--bn-border)] bg-[var(--bn-soft-bg)] p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--bn-muted)]">Days of Stock Cover</span>
                <span className="font-mono-tabular font-semibold text-[var(--bn-primary)]">
                  {selectedData?.daysOfCover ?? 0} days
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white border border-[var(--bn-border)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${coverRatio}%` }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-full rounded-full ${
                    selectedData?.riskLevel === 'CRITICAL'
                      ? 'bg-[#C93440]'
                      : selectedData?.riskLevel === 'MODERATE'
                        ? 'bg-[#B45309]'
                        : 'bg-[var(--bn-secondary)]'
                  }`}
                />
              </div>
              <p className="text-xs leading-relaxed text-[var(--bn-muted)]">
                {guide.clinicalNote}
              </p>
            </div>
          </div>

          {/* Right: Interactive Compatibility Guide */}
          <div className="flex flex-col justify-between gap-4 lg:col-span-7">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--bn-border)] bg-white p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--bn-primary)]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--bn-secondary)]" aria-hidden="true" />
                  Informational: Can Receive RBC From
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {guide.receiveFrom.map((grp) => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setSelectedGroup(grp)}
                      className="rounded-md border border-[var(--bn-border)] bg-[var(--bn-soft-bg)] px-2.5 py-1 font-mono-tabular text-xs font-semibold text-[var(--bn-text)] hover:border-[var(--bn-primary)] transition-colors"
                    >
                      {grp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[var(--bn-border)] bg-white p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--bn-primary)]">
                  <Droplets className="h-3.5 w-3.5 text-[#C93440]" aria-hidden="true" />
                  Informational: Can Donate RBC To
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {guide.donateTo.map((grp) => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setSelectedGroup(grp)}
                      className="rounded-md border border-[var(--bn-border)] bg-[var(--bn-accent-soft)] px-2.5 py-1 font-mono-tabular text-xs font-semibold text-[var(--bn-text)] hover:border-[var(--bn-accent)] transition-colors"
                    >
                      {grp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--bn-border)]">
              <p className="inline-flex items-center gap-1.5 text-[11px] text-[var(--bn-muted)]">
                <ShieldAlert className="h-3.5 w-3.5 text-[var(--bn-accent)] shrink-0" aria-hidden="true" />
                Reference chart only — hospital crossmatching &amp; NBTC release always govern transfusion.
              </p>
              <button
                type="button"
                onClick={() => onSearchGroup(selectedGroup)}
                className="clinical-btn inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[var(--bn-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--bn-secondary)] whitespace-nowrap"
              >
                <Search className="h-3.5 w-3.5" aria-hidden="true" />
                Find {selectedGroup} Units
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

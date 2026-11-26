import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Building2,
  Check,
  ChevronDown,
  Droplets,
  Globe2,
  ShieldCheck,
} from 'lucide-react';
import {
  ROLE_DISPLAY_NAMES,
  USER_ROLES,
  type UserRole,
} from '../../../../shared/constants/bloodNetwork.ts';

interface RoleSwitcherDropdownProps {
  currentRole: UserRole;
  isDemoMode: boolean;
  onSelectRole: (role: UserRole) => void;
}

const ROLE_SUBTITLES: Record<UserRole, string> = {
  PUBLIC: 'Read-only blood availability & bank finder',
  HOSPITAL_COORDINATOR: 'Create requests & monitor hospital forecasts',
  BLOOD_BANK_OFFICER: 'Manage cold-vault stock, expiry & dispatches',
  ADMIN: 'Control users, institutions, audits & system',
};

export function getRoleIcon(role: UserRole) {
  switch (role) {
    case 'PUBLIC':
      return Globe2;
    case 'HOSPITAL_COORDINATOR':
      return Building2;
    case 'BLOOD_BANK_OFFICER':
      return Droplets;
    case 'ADMIN':
      return ShieldCheck;
  }
}

export function RoleSwitcherDropdown({
  currentRole,
  isDemoMode,
  onSelectRole,
}: RoleSwitcherDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isDemoMode) {
    const CurrentIcon = getRoleIcon(currentRole);
    return (
      <div className="inline-flex items-center gap-2 rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-1.5 text-xs font-medium text-[#17231C]">
        <CurrentIcon className="h-3.5 w-3.5 text-[#123D2B]" aria-hidden="true" />
        <span>{ROLE_DISPLAY_NAMES[currentRole]}</span>
      </div>
    );
  }

  const ActiveIcon = getRoleIcon(currentRole);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch active demo workspace role"
        onClick={() => setOpen((prev) => !prev)}
        className="clinical-btn inline-flex min-h-[36px] items-center gap-2.5 rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] px-3 py-1.5 text-left hover:bg-[#E7EEE8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123D2B]"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#123D2B]/10 text-[#123D2B] shrink-0">
          <ActiveIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span className="hidden sm:block leading-tight">
          <span className="block text-xs font-semibold text-[#17231C] whitespace-nowrap">
            {ROLE_DISPLAY_NAMES[currentRole]}
          </span>
          <span className="block text-[10px] text-[#55655C] whitespace-nowrap">
            Demo Session
          </span>
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-[#55655C] transition-transform duration-150 shrink-0 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            role="listbox"
            aria-label="Select demo workspace role"
            className="absolute right-0 mt-2 w-72 rounded-xl border border-[#DCE3DC] bg-white p-1.5 z-50 shadow-[0_14px_36px_rgba(18,61,43,0.12)]"
          >
            <div className="px-2.5 py-1.5 border-b border-[#DCE3DC] mb-1">
              <p className="text-[11px] font-semibold text-[#17231C]">
                Switch Demo Workspace
              </p>
              <p className="text-[11px] text-[#55655C]">
                Authorized demo session role selector
              </p>
            </div>
            <div className="space-y-0.5">
              {USER_ROLES.map((role) => {
                const Icon = getRoleIcon(role);
                const selected = role === currentRole;
                return (
                  <button
                    key={role}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onSelectRole(role);
                      setOpen(false);
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                      selected
                        ? 'bg-[#123D2B]/[0.07] text-[#17231C]'
                        : 'hover:bg-[#F2F5F1] text-[#17231C]'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-md shrink-0 ${
                        selected
                          ? 'bg-[#123D2B] text-white'
                          : 'bg-[#F2F5F1] text-[#55655C]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#17231C]">
                          {ROLE_DISPLAY_NAMES[role]}
                        </span>
                        <span className="font-mono-tabular text-[10px] font-medium text-[#55655C]">
                          DEMO
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[#55655C] leading-snug">
                        {ROLE_SUBTITLES[role]}
                      </span>
                    </span>
                    {selected ? (
                      <Check className="mt-1 h-3.5 w-3.5 text-[#123D2B] shrink-0" aria-hidden="true" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

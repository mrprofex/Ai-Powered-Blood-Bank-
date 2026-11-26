import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  ClipboardCheck,
  Database,
  Droplets,
  FileText,
  HelpCircle,
  Home,
  LayoutDashboard,
  LineChart,
  LogOut,
  MapPin,
  Menu,
  PackagePlus,
  PlusCircle,
  Route,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import {
  ROLE_DISPLAY_NAMES,
  type UserRole,
} from '../../../../shared/constants/bloodNetwork.ts';
import type { DemoSessionUser } from '../../../../shared/types/network.ts';
import { DEMO_NOTIFICATIONS } from '../../data/demoPortalData.ts';
import {
  getNavItemMeta,
  ROLE_NAV_ITEMS,
  type AppPage,
  type NavIconKey,
} from '../../types/navigation.ts';
import { FadeContent } from '../motion/MotionPrimitives.tsx';
import { ModalDialog } from '../ui/ConfirmModal.tsx';
import { PaletteSwitcher } from '../ui/PaletteSwitcher.tsx';
import { RoleSwitcherDropdown } from '../ui/RoleSwitcherDropdown.tsx';
import { DemoNoticeBanner } from '../ui/UiPrimitives.tsx';
import { getPaletteById, type PaletteId } from '../../theme/palettes.ts';

interface AppShellProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  onQuickSearch: (term: string) => void;
  demoUser: DemoSessionUser;
  onSwitchRole: (role: UserRole) => void;
  onSignOutDemo: () => void;
  activePaletteId: PaletteId;
  onChangePalette: (id: PaletteId) => void;
  children: ReactNode;
}

function getNavIcon(key: NavIconKey) {
  switch (key) {
    case 'dashboard':
      return LayoutDashboard;
    case 'availability':
      return Search;
    case 'group-search':
      return Droplets;
    case 'nearby-banks':
      return MapPin;
    case 'emergency':
      return AlertCircle;
    case 'create-request':
      return PlusCircle;
    case 'tracking':
      return Route;
    case 'prediction-7d':
      return LineChart;
    case 'prediction-30d':
      return BarChart3;
    case 'shortage':
      return AlertTriangle;
    case 'notifications':
      return Bell;
    case 'reports':
      return FileText;
    case 'settings':
      return Settings;
    case 'inventory':
      return Database;
    case 'update-stock':
      return PackagePlus;
    case 'expiry':
      return CalendarClock;
    case 'records':
      return ScrollText;
    case 'hospitals':
      return Building2;
    case 'blood-banks':
      return Droplets;
    case 'verification':
      return ClipboardCheck;
    case 'users':
      return Users;
    case 'roles':
      return UserCog;
    case 'audit':
      return ShieldCheck;
  }
}

export function AppShell({
  currentPage,
  onNavigate,
  onQuickSearch,
  demoUser,
  onSwitchRole,
  onSignOutDemo,
  activePaletteId,
  onChangePalette,
  children,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const navItems = ROLE_NAV_ITEMS[demoUser.role];
  const activeMeta = getNavItemMeta(demoUser.role, currentPage);

  const groupedNav = useMemo(() => {
    const groups: Array<{ section: string; items: typeof navItems }> = [];
    for (const item of navItems) {
      const existing = groups.find((g) => g.section === item.section);
      if (existing) existing.items.push(item);
      else groups.push({ section: item.section, items: [item] });
    }
    return groups;
  }, [navItems]);

  const roleNotifications = useMemo(
    () => DEMO_NOTIFICATIONS.filter((n) => n.targetRoles.includes(demoUser.role)),
    [demoUser.role],
  );
  const unreadCount = roleNotifications.filter((n) => n.unread).length;

  const handleNavClick = (page: AppPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setNotifOpen(false);
  };

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    onQuickSearch(searchInput.trim());
    setNotifOpen(false);
  };

  const initials = demoUser.name
    .replace(' (Demo)', '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  const isLightSidebar = getPaletteById(activePaletteId).sidebarMode === 'light';

  return (
    <div className="min-h-screen bg-[var(--bn-soft-bg)] text-[var(--bn-text)] flex flex-col lg:flex-row transition-colors duration-300">
      {/* Theme-Adaptive Luxury Minimal Sidebar (Supports Dark & Crisp Light Airy Sidebar) */}
      <aside
        className={`hidden lg:flex lg:w-[260px] lg:shrink-0 lg:flex-col border-r transition-colors duration-300 ${
          isLightSidebar
            ? 'bg-white text-[var(--bn-text)] border-[var(--bn-border)]'
            : 'bg-[var(--bn-sidebar-bg)] text-white border-black/15'
        }`}
      >
        <div
          className={`flex h-15 items-center justify-between gap-2 border-b px-4 ${
            isLightSidebar ? 'border-[var(--bn-border)]' : 'border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg border shrink-0 ${
                isLightSidebar
                  ? 'bg-[var(--bn-accent-soft)] border-[var(--bn-primary)]/20 text-[var(--bn-primary)]'
                  : 'bg-white/10 border-white/15 text-white'
              }`}
            >
              <Droplets className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <span
                className={`block font-display text-sm font-semibold tracking-tight truncate ${
                  isLightSidebar ? 'text-[var(--bn-text)]' : 'text-white'
                }`}
              >
                Blood Network
              </span>
              <span className="block text-[10px] text-[var(--bn-sidebar-muted)] truncate">
                {ROLE_DISPLAY_NAMES[demoUser.role]}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-4 px-3 py-4 overflow-y-auto" aria-label="Role workspace navigation">
          {groupedNav.map((group) => (
            <div key={group.section}>
              <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--bn-sidebar-muted)]">
                {group.section}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = getNavIcon(item.icon);
                  const active = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`clinical-btn relative flex w-full min-h-[38px] items-center gap-2.5 rounded-xl px-3 py-1.5 text-left text-[13px] font-medium transition-colors whitespace-nowrap ${
                        active
                          ? 'text-[var(--bn-active-pill-text)] font-semibold'
                          : isLightSidebar
                            ? 'text-[var(--bn-sidebar-text)] hover:bg-[var(--bn-soft-bg)] hover:text-[var(--bn-text)]'
                            : 'text-[var(--bn-sidebar-text)] hover:bg-[var(--bn-secondary)] hover:text-white'
                      }`}
                    >
                      {active ? (
                        <motion.span
                          layoutId="sidebar-active-pill"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          style={{ background: 'var(--bn-active-pill)' }}
                          className="absolute inset-0 rounded-xl shadow-[0_6px_16px_-4px_rgba(14,50,36,0.22)]"
                        />
                      ) : null}
                      <Icon
                        className={`relative z-10 h-4 w-4 shrink-0 ${
                          active
                            ? 'text-[var(--bn-active-pill-text)]'
                            : 'text-[var(--bn-sidebar-muted)]'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="relative z-10 truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div
            className={`pt-3 border-t ${
              isLightSidebar ? 'border-[var(--bn-border)]' : 'border-white/10'
            }`}
          >
            <button
              type="button"
              onClick={() => handleNavClick('landing')}
              className={`clinical-btn flex w-full min-h-[38px] items-center gap-2.5 rounded-xl px-3 py-1.5 text-left text-[13px] font-medium transition-colors whitespace-nowrap ${
                isLightSidebar
                  ? 'text-[var(--bn-sidebar-text)] hover:bg-[var(--bn-soft-bg)] hover:text-[var(--bn-text)]'
                  : 'text-[var(--bn-sidebar-text)] hover:bg-[var(--bn-secondary)] hover:text-white'
              }`}
            >
              <Home className="h-4 w-4 shrink-0 text-[var(--bn-sidebar-muted)]" aria-hidden="true" />
              <span>Public Landing Page</span>
            </button>
          </div>
        </nav>

        {/* Clean Profile Summary & Exit Demo */}
        <div
          className={`border-t p-3.5 space-y-3 ${
            isLightSidebar ? 'border-[var(--bn-border)]' : 'border-white/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {!avatarError ? (
              <img
                src="/src/assets/images/avatar_clinical_coordinator_1795668858463.jpg"
                alt={demoUser.name}
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className={`h-8 w-8 rounded-full object-cover border shrink-0 ${
                  isLightSidebar ? 'border-[var(--bn-border)]' : 'border-white/25'
                }`}
              />
            ) : (
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold shrink-0 ${
                  isLightSidebar
                    ? 'bg-[var(--bn-soft-bg)] border-[var(--bn-border)] text-[var(--bn-text)]'
                    : 'bg-white/15 border-white/25 text-white'
                }`}
              >
                {initials || 'BN'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-xs font-semibold ${
                  isLightSidebar ? 'text-[var(--bn-text)]' : 'text-white'
                }`}
              >
                {demoUser.name}
              </p>
              <p className="truncate text-[11px] text-[var(--bn-sidebar-muted)]">
                {demoUser.organizationName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSignOutDemo}
            className={`clinical-btn flex w-full min-h-[34px] items-center justify-center gap-1.5 rounded-lg border bg-transparent px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
              isLightSidebar
                ? 'border-[var(--bn-border)] text-[var(--bn-muted)] hover:bg-[var(--bn-soft-bg)] hover:text-[var(--bn-text)]'
                : 'border-white/20 text-[#DCE6DF] hover:bg-[var(--bn-secondary)] hover:text-white'
            }`}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Exit Demo Session
          </button>
        </div>
      </aside>

      {/* Main Content Area (#F2F5F1 soft green-tinted neutral) */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Crisp White Top Navigation Bar */}
        <header className="sticky top-0 z-30 flex h-15 items-center justify-between gap-4 border-b border-[#DCE3DC] bg-white/95 backdrop-blur-sm px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#DCE3DC] text-[#17231C] hover:bg-[#F2F5F1] lg:hidden shrink-0"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
              <span className="hidden sm:inline text-[#55655C] whitespace-nowrap">
                {ROLE_DISPLAY_NAMES[demoUser.role]}
              </span>
              <span className="hidden sm:inline text-[#C2CEC4]" aria-hidden="true">
                /
              </span>
              <h1 className="font-display text-sm font-semibold text-[#17231C] truncate">
                {activeMeta.breadcrumb}
              </h1>
            </div>
          </div>

          {/* Search, Notifications, Custom Role Dropdown */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
              <Search
                className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[#55655C]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search city, blood group, facility..."
                aria-label="Search blood availability"
                className="h-9 w-48 lg:w-64 rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] pl-8 pr-3 text-xs text-[#17231C] placeholder:text-[#55655C] focus:border-[#123D2B] focus:bg-white focus:outline-none"
              />
            </form>

            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-label="Toggle role notifications"
                className="clinical-btn relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] text-[#17231C] hover:bg-[#E7EEE8] transition-colors"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#C93440] px-1 font-mono-tabular text-[10px] font-semibold text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </button>

              {notifOpen ? (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#DCE3DC] bg-white p-3.5 z-50 shadow-[0_14px_36px_rgba(18,61,43,0.12)]">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DCE3DC]">
                    <p className="text-xs font-semibold text-[#17231C]">
                      {ROLE_DISPLAY_NAMES[demoUser.role]} Alerts
                    </p>
                    <button
                      type="button"
                      onClick={() => handleNavClick('notifications')}
                      className="text-xs font-semibold text-[#123D2B] hover:underline"
                    >
                      Open Center
                    </button>
                  </div>
                  <ul className="divide-y divide-[#DCE3DC]">
                    {roleNotifications.slice(0, 3).map((item) => (
                      <li key={item.id} className="py-2.5 text-xs">
                        <p className="font-medium text-[#17231C]">{item.title}</p>
                        <p className="mt-0.5 text-[#55655C]">
                          {item.facility} · {item.timestamp}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* Theme Palette Studio Selector */}
            <PaletteSwitcher
              activePaletteId={activePaletteId}
              onChangePalette={onChangePalette}
              compact
            />

            {/* Single Clean Custom Role Switcher Dropdown */}
            <RoleSwitcherDropdown
              currentRole={demoUser.role}
              isDemoMode={demoUser.isDemoMode}
              onSelectRole={onSwitchRole}
            />
          </div>
        </header>

        {/* Mobile Navigation Drawer (#123D2B) */}
        {mobileMenuOpen ? (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-[#17231C]/45 backdrop-blur-[1px]"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-[var(--bn-primary)] text-white"
            >
              <div className="flex h-15 items-center justify-between border-b border-white/10 px-4">
                <div>
                  <span className="block font-display text-sm font-semibold text-white">
                    Blood Network
                  </span>
                  <span className="block text-[10px] text-[#B8D0C0]">
                    {ROLE_DISPLAY_NAMES[demoUser.role]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#DCE6DF] hover:bg-[#1D593E]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = getNavIcon(item.icon);
                  const active = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`flex w-full min-h-[42px] items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                        active
                          ? 'bg-white text-[#123D2B] font-semibold'
                          : 'text-[#DCE6DF] hover:bg-[#1D593E]'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${active ? 'text-[#123D2B]' : 'text-[#A3C4AE]'}`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => handleNavClick('landing')}
                  className="flex w-full min-h-[42px] items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#DCE6DF] hover:bg-[#1D593E]"
                >
                  <Home className="h-4 w-4 shrink-0 text-[#A3C4AE]" aria-hidden="true" />
                  <span>Public Landing Page</span>
                </button>
              </nav>
              <div className="border-t border-white/10 p-4 space-y-3">
                <p className="text-xs font-medium text-white">{demoUser.name}</p>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignOutDemo();
                  }}
                  className="w-full min-h-[42px] rounded-md border border-white/20 text-xs font-medium text-[#DCE6DF] hover:bg-[#1D593E]"
                >
                  Exit Demo Session
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          <DemoNoticeBanner compact variant="light" />
          <FadeContent key={`${demoUser.role}-${currentPage}`}>
            {children}
          </FadeContent>
        </main>

        {/* Compact Internal Dashboard Footer */}
        <footer className="border-t border-[#DCE3DC] bg-white px-4 py-3.5 sm:px-6">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-2 text-xs text-[#55655C] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-[#17231C]">
                © 2026 Predictive Emergency Blood Shortage Network
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">v1.0.0-phase1</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[#123D2B]">DEMO DATA MODE</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                className="inline-flex items-center gap-1 hover:text-[#123D2B] transition-colors"
              >
                <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Help &amp; Support
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('landing')}
                className="hover:text-[#123D2B] transition-colors"
              >
                Public Portal
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Help & Support Dialog */}
      <ModalDialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Platform Help & Support"
        subtitle="Predictive Emergency Blood Shortage Network · Phase 1 Foundation"
      >
        <div className="space-y-3 text-xs leading-relaxed text-[#55655C]">
          <p className="text-[#17231C] font-medium">
            Active Role: {ROLE_DISPLAY_NAMES[demoUser.role]} ({demoUser.organizationName})
          </p>
          <p>
            This demonstration platform separates workflows across Public Searchers, Hospital
            Coordinators, Blood Bank Officers, and Network Administrators with server-side RBAC
            checks and immutable demo audit trails.
          </p>
          <div className="rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-3 text-[#17231C]">
            <p className="font-semibold">Support &amp; Clinical Emergency Notice</p>
            <p className="mt-1 text-[#55655C]">
              For real medical emergencies in India, contact national health helpline 104 / 108 or
              authorized C-DAC e-RaktKosh blood banks directly.
            </p>
          </div>
        </div>
      </ModalDialog>
    </div>
  );
}

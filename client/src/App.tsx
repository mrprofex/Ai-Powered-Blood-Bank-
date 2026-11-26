import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import {
  ROLE_DISPLAY_NAMES,
  type UserRole,
} from '../../shared/constants/bloodNetwork.ts';
import type { DemoSessionUser } from '../../shared/types/network.ts';
import { AppShell } from './components/layout/AppShell.tsx';
import { TargetCursor } from './components/motion/MotionPrimitives.tsx';
import { ROLE_DEMO_PERSONAS } from './data/demoPortalData.ts';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import {
  AdminAuditLogsView,
  AdminBloodBanksView,
  AdminHospitalsView,
  AdminRolesView,
  AdminSystemView,
  AdminUsersView,
  AdminVerificationView,
} from './pages/AdminWorkspacePages.tsx';
import { BloodAvailabilityPage } from './pages/BloodAvailabilityPage.tsx';
import { BloodBankDashboard } from './pages/BloodBankDashboard.tsx';
import {
  BankExpiryManagementView,
  BankGroupInventoryView,
  BankInventoryOverviewView,
  BankRecordsView,
  BankUpdateStockView,
} from './pages/BloodBankStockPage.tsx';
import {
  CreateBloodRequestView,
  HospitalDashboard,
  HospitalRequestTrackingView,
} from './pages/HospitalDashboard.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { NotificationsCenterPage } from './pages/NotificationsCenterPage.tsx';
import { PredictionsWorkspace } from './pages/PredictionsWorkspace.tsx';
import {
  BloodGroupSearchView,
  EmergencyInformationView,
  NearbyBloodBanksView,
  PublicDashboardView,
} from './pages/PublicPortalPages.tsx';
import { SignupPage } from './pages/SignupPage.tsx';
import {
  EmergencyRequestsView,
  RoleReportsView,
  RoleSettingsView,
} from './pages/WorkspaceSubPages.tsx';
import {
  getDefaultPageForRole,
  isPageAllowedForRole,
  type AppPage,
} from './types/navigation.ts';
import {
  applyPalette,
  getSavedPaletteId,
  type PaletteId,
} from './theme/palettes.ts';

const VALID_PAGES: AppPage[] = [
  'landing',
  'login',
  'signup',
  'dashboard',
  'public-dashboard',
  'availability',
  'public-group-search',
  'public-nearby-banks',
  'public-emergency-info',
  'hospital',
  'hospital-create-request',
  'requests',
  'hospital-request-tracking',
  'predictions-7d',
  'predictions-30d',
  'shortage-alerts',
  'blood-bank',
  'bank-inventory-overview',
  'bank-update-stock',
  'bank-group-inventory',
  'bank-expiry-management',
  'bank-records',
  'admin',
  'admin-hospitals',
  'admin-blood-banks',
  'predictions',
  'admin-verification',
  'admin-users',
  'admin-roles',
  'admin-audit-logs',
  'admin-system',
  'notifications',
  'reports',
  'settings',
];

function getPageFromHash(): AppPage {
  if (typeof window === 'undefined') return 'landing';
  const hash = window.location.hash.replace('#', '') as AppPage;
  return VALID_PAGES.includes(hash) ? hash : 'landing';
}

export function ClientApp() {
  const [currentPage, setCurrentPage] = useState<AppPage>('landing');
  const [demoUser, setDemoUser] = useState<DemoSessionUser>(
    ROLE_DEMO_PERSONAS.HOSPITAL_COORDINATOR,
  );
  const [loginRole, setLoginRole] = useState<UserRole>('HOSPITAL_COORDINATOR');
  const [availabilitySearch, setAvailabilitySearch] = useState<string>('');
  const [paletteId, setPaletteId] = useState<PaletteId>(getSavedPaletteId);

  useEffect(() => {
    applyPalette(paletteId);
  }, [paletteId]);

  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}`,
      );
    }

    const onHashChange = () => {
      setCurrentPage(getPageFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (page: AppPage) => {
    const resolvedPage =
      page === 'dashboard' ? getDefaultPageForRole(demoUser.role) : page;
    setCurrentPage(resolvedPage);
    if (typeof window !== 'undefined') {
      window.location.hash = resolvedPage === 'landing' ? '' : resolvedPage;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateToRoleSignIn = (role: UserRole) => {
    setLoginRole(role);
    navigate('login');
  };

  const handleQuickSearch = (term: string) => {
    setAvailabilitySearch(term);
    if (isPageAllowedForRole(demoUser.role, 'availability')) {
      navigate('availability');
    } else {
      navigate('bank-inventory-overview');
    }
  };

  const handleDemoAuthenticate = (user: DemoSessionUser, targetPage: AppPage) => {
    setDemoUser(user);
    const resolvedTarget =
      targetPage === 'dashboard' ? getDefaultPageForRole(user.role) : targetPage;
    setCurrentPage(resolvedTarget);
    if (typeof window !== 'undefined') {
      window.location.hash = resolvedTarget;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSwitchRole = (role: UserRole) => {
    const nextPersona = ROLE_DEMO_PERSONAS[role];
    setDemoUser(nextPersona);
    const targetPage = getDefaultPageForRole(role);
    setCurrentPage(targetPage);
    if (typeof window !== 'undefined') {
      window.location.hash = targetPage;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEnterWorkspaceFromLanding = (
    role: UserRole,
    targetPage: AppPage,
    searchQuery?: string,
  ) => {
    const nextPersona = ROLE_DEMO_PERSONAS[role];
    setDemoUser(nextPersona);
    if (typeof searchQuery === 'string') {
      setAvailabilitySearch(searchQuery);
    }
    setCurrentPage(targetPage);
    if (typeof window !== 'undefined') {
      window.location.hash = targetPage;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (currentPage === 'landing') {
    return (
      <>
        <TargetCursor />
        <LandingPage
          onNavigate={navigate}
          onSignInForRole={navigateToRoleSignIn}
          onEnterWorkspaceRole={handleEnterWorkspaceFromLanding}
          activePaletteId={paletteId}
          onChangePalette={setPaletteId}
        />
      </>
    );
  }

  if (currentPage === 'login') {
    return (
      <>
        <TargetCursor />
        <LoginPage
          onNavigate={navigate}
          onDemoAuthenticate={handleDemoAuthenticate}
          initialRole={loginRole}
        />
      </>
    );
  }

  if (currentPage === 'signup') {
    return (
      <>
        <TargetCursor />
        <SignupPage onNavigate={navigate} onDemoAuthenticate={handleDemoAuthenticate} />
      </>
    );
  }

  const effectivePage: AppPage =
    currentPage === 'dashboard' ? getDefaultPageForRole(demoUser.role) : currentPage;
  const routeAllowed = isPageAllowedForRole(demoUser.role, effectivePage);

  return (
    <>
      <TargetCursor />
      <AppShell
        currentPage={effectivePage}
        onNavigate={navigate}
        onQuickSearch={handleQuickSearch}
        demoUser={demoUser}
        onSwitchRole={handleSwitchRole}
        onSignOutDemo={() => navigate('landing')}
        activePaletteId={paletteId}
        onChangePalette={setPaletteId}
      >
        {!routeAllowed ? (
          <section
            role="alert"
            className="clinical-card mx-auto max-w-xl rounded-xl border-[#C93440]/30 p-8 text-center"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#C93440]/10 text-[#C93440]">
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-[#17231C]">
              403 · Workspace Access Restricted
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[#55655C]">
              This route is not permitted for{' '}
              <strong className="text-[#17231C]">{ROLE_DISPLAY_NAMES[demoUser.role]}</strong>. Each
              institutional role is strictly isolated to its authorized tools and API endpoints.
            </p>
            <button
              type="button"
              onClick={() => navigate(getDefaultPageForRole(demoUser.role))}
              className="clinical-btn mt-5 inline-flex min-h-[38px] items-center rounded-lg bg-[#123D2B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D593E]"
            >
              Return to {ROLE_DISPLAY_NAMES[demoUser.role]} Dashboard
            </button>
          </section>
        ) : (
        <>
          {/* Public Searcher Workspace */}
          {effectivePage === 'public-dashboard' && (
            <PublicDashboardView onNavigate={navigate} />
          )}
          {effectivePage === 'public-group-search' && <BloodGroupSearchView />}
          {effectivePage === 'public-nearby-banks' && <NearbyBloodBanksView />}
          {effectivePage === 'public-emergency-info' && <EmergencyInformationView />}

          {/* Shared Scoped Availability */}
          {effectivePage === 'availability' && (
            <BloodAvailabilityPage initialSearch={availabilitySearch} />
          )}

          {/* Hospital Coordinator Workspace */}
          {effectivePage === 'hospital' && (
            <HospitalDashboard demoUser={demoUser} onNavigate={navigate} />
          )}
          {effectivePage === 'hospital-create-request' && (
            <CreateBloodRequestView demoUser={demoUser} onNavigate={navigate} />
          )}
          {effectivePage === 'hospital-request-tracking' && (
            <HospitalRequestTrackingView demoUser={demoUser} onNavigate={navigate} />
          )}

          {/* Blood Bank Officer Workspace */}
          {effectivePage === 'blood-bank' && (
            <BloodBankDashboard demoUser={demoUser} onNavigate={navigate} />
          )}
          {effectivePage === 'bank-inventory-overview' && (
            <BankInventoryOverviewView onNavigate={navigate} />
          )}
          {effectivePage === 'bank-update-stock' && (
            <BankUpdateStockView demoUser={demoUser} />
          )}
          {effectivePage === 'bank-group-inventory' && (
            <BankGroupInventoryView onNavigate={navigate} />
          )}
          {effectivePage === 'bank-expiry-management' && (
            <BankExpiryManagementView onNavigate={navigate} />
          )}
          {effectivePage === 'bank-records' && <BankRecordsView demoUser={demoUser} />}

          {/* Network Admin Workspace */}
          {effectivePage === 'admin' && (
            <AdminDashboard demoUser={demoUser} onNavigate={navigate} />
          )}
          {effectivePage === 'admin-hospitals' && (
            <AdminHospitalsView demoUser={demoUser} />
          )}
          {effectivePage === 'admin-blood-banks' && (
            <AdminBloodBanksView demoUser={demoUser} />
          )}
          {effectivePage === 'admin-verification' && (
            <AdminVerificationView demoUser={demoUser} />
          )}
          {effectivePage === 'admin-users' && <AdminUsersView demoUser={demoUser} />}
          {effectivePage === 'admin-roles' && <AdminRolesView />}
          {effectivePage === 'admin-audit-logs' && (
            <AdminAuditLogsView demoUser={demoUser} />
          )}
          {effectivePage === 'admin-system' && (
            <AdminSystemView
              demoUser={demoUser}
              onSignOutDemo={() => navigate('landing')}
            />
          )}

          {/* Shared Role-Scoped Operations, Forecasting, Alerts, Reports & Settings */}
          {effectivePage === 'requests' && (
            <EmergencyRequestsView demoUser={demoUser} onNavigate={navigate} />
          )}
          {effectivePage === 'predictions' && (
            <PredictionsWorkspace role={demoUser.role} initialPeriod="7d" />
          )}
          {effectivePage === 'predictions-7d' && (
            <PredictionsWorkspace role={demoUser.role} initialPeriod="7d" />
          )}
          {effectivePage === 'predictions-30d' && (
            <PredictionsWorkspace role={demoUser.role} initialPeriod="30d" />
          )}
          {effectivePage === 'shortage-alerts' && (
            <NotificationsCenterPage role={demoUser.role} shortageAlertsOnly />
          )}
          {effectivePage === 'notifications' && (
            <NotificationsCenterPage role={demoUser.role} />
          )}
          {effectivePage === 'reports' && <RoleReportsView demoUser={demoUser} />}
          {effectivePage === 'settings' && (
            <RoleSettingsView
              demoUser={demoUser}
              onSignOutDemo={() => navigate('landing')}
            />
          )}
        </>
        )}
      </AppShell>
    </>
  );
}

export default ClientApp;

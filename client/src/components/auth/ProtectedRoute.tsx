import { useEffect, useState } from 'react';
import { ShieldAlert, LogIn, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext.tsx';
import { ROLE_DISPLAY_NAMES } from '@shared/constants/bloodNetwork.ts';
import type { UserRole, AppPage } from '../types/navigation.ts';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallbackPage?: AppPage;
  onNavigate?: (page: AppPage) => void;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  fallbackPage = 'login',
  onNavigate,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, login } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [requiredRole, setRequiredRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      const firstAllowedRole = allowedRoles?.[0] || 'HOSPITAL_COORDINATOR';
      setRequiredRole(firstAllowedRole);
      setShowLoginPrompt(true);
    }
  }, [isAuthenticated, allowedRoles]);

  const handleLogin = async () => {
    if (requiredRole) {
      await login(requiredRole);
      setShowLoginPrompt(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="clinical-card mx-auto max-w-xl rounded-xl p-8 text-center"
        role="alert"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#C93440]/10 text-[#C93440]">
          <ShieldAlert className="h-8 w-8" aria-hidden="true" />
        </div>
        <h2 className="mt-4 font-display text-lg font-semibold text-[#17231C]">
          Authentication Required
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#55655C]">
          This panel requires institutional authentication. Please sign in as a{' '}
          <strong className="text-[#17231C]">
            {requiredRole ? ROLE_DISPLAY_NAMES[requiredRole] : 'authorized user'}
          </strong>
          to access this workspace.
        </p>
        
        <div className="mt-6 space-y-3">
          {allowedRoles && allowedRoles.length > 1 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#55655C]">Select role to continue:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {allowedRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setRequiredRole(role);
                      handleLogin();
                    }}
                    className="clinical-btn inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-[#C9D8CC] bg-white px-4 py-2 text-sm font-medium text-[#17231C] hover:bg-[#E5EDE8]"
                  >
                    <LogIn className="h-4 w-4" />
                    {ROLE_DISPLAY_NAMES[role]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogin}
              className="clinical-btn mx-auto inline-flex min-h-[38px] items-center gap-2 rounded-lg bg-[#123D2B] px-6 py-2 text-sm font-semibold text-white hover:bg-[#1D593E]"
            >
              <Loader2 className="h-4 w-4" />
              Sign In as {requiredRole ? ROLE_DISPLAY_NAMES[requiredRole] : 'Hospital Coordinator'}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onNavigate?.('landing')}
          className="mt-4 text-sm text-[#55655C] hover:text-[#17231C] underline"
        >
          Return to Public Portal
        </button>
      </motion.section>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="clinical-card mx-auto max-w-xl rounded-xl border-[#C93440]/30 p-8 text-center"
        role="alert"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#C93440]/10 text-[#C93440]">
          <ShieldAlert className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 font-display text-lg font-semibold text-[#17231C]">
          403 · Access Denied
        </h2>
        <p className="mt-2 text-sm text-[#55655C]">
          This workspace is restricted to{' '}
          <strong className="text-[#17231C]">{allowedRoles.map((r) => ROLE_DISPLAY_NAMES[r]).join(' or ')}</strong>.
          You are currently signed in as{' '}
          <strong className="text-[#17231C]">{ROLE_DISPLAY_NAMES[user.role]}</strong>.
        </p>
        <button
          type="button"
          onClick={() => onNavigate?.(fallbackPage)}
          className="clinical-btn mt-5 inline-flex min-h-[38px] items-center gap-2 rounded-lg bg-[#123D2B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1D593E]"
        >
          <LogIn className="h-4 w-4" />
          Switch Role
        </button>
      </motion.section>
    );
  }

  return <>{children}</>;
}
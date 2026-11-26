import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Droplets,
  Eye,
  EyeOff,
  Info,
  Lock,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import type { UserRole } from '../../../shared/constants/bloodNetwork.ts';
import { DemoLoginInputSchema } from '../../../shared/schemas/networkSchemas.ts';
import type { DemoSessionUser } from '../../../shared/types/network.ts';
import { FadeContent, Magnet } from '../components/motion/MotionPrimitives.tsx';
import { ModalDialog } from '../components/ui/ConfirmModal.tsx';
import { ROLE_DEMO_PERSONAS } from '../data/demoPortalData.ts';
import { getDefaultPageForRole, type AppPage } from '../types/navigation.ts';

interface LoginPageProps {
  onNavigate: (page: AppPage) => void;
  onDemoAuthenticate: (user: DemoSessionUser, targetPage: AppPage) => void;
  initialRole: UserRole;
}

const DEMO_PRESETS: Array<{
  label: string;
  role: UserRole;
}> = [
  { label: 'Public Searcher', role: 'PUBLIC' },
  { label: 'Hospital Coordinator', role: 'HOSPITAL_COORDINATOR' },
  { label: 'Blood Bank Officer', role: 'BLOOD_BANK_OFFICER' },
  { label: 'Network Admin', role: 'ADMIN' },
];

export function LoginPage({ onNavigate, onDemoAuthenticate, initialRole }: LoginPageProps) {
  const [email, setEmail] = useState(ROLE_DEMO_PERSONAS[initialRole].email);
  const [password, setPassword] = useState('demo-access-only');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [visualError, setVisualError] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState(ROLE_DEMO_PERSONAS[initialRole].email);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);

    const parsed = DemoLoginInputSchema.safeParse({ email, password, role });
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message ?? 'Please verify your email and passphrase.');
      return;
    }

    const basePersona = ROLE_DEMO_PERSONAS[parsed.data.role];
    onDemoAuthenticate(
      {
        ...basePersona,
        email: parsed.data.email,
      },
      getDefaultPageForRole(parsed.data.role),
    );
  };

  const handleRoleChange = (nextRole: UserRole) => {
    setRole(nextRole);
    setEmail(ROLE_DEMO_PERSONAS[nextRole].email);
    setErrorMsg(null);
  };

  const handleResetRequest = (event: FormEvent) => {
    event.preventDefault();
    if (!resetEmail.includes('@')) return;
    setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bn-soft-bg)] text-[var(--bn-text)] lg:grid lg:grid-cols-12 transition-colors duration-300">
      {/* Left Split-Screen Brand & Visual Panel */}
      <aside className="relative overflow-hidden bg-[var(--bn-primary)] px-6 py-10 text-white lg:col-span-5 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12">
        {!visualError ? (
          <img
            src="/src/assets/images/login_botanical_lab_visual_1795672723756.jpg"
            alt="Clean daylight clinical blood bank laboratory environment"
            referrerPolicy="no-referrer"
            onError={() => setVisualError(true)}
            className="absolute inset-0 h-full w-full object-cover opacity-28 mix-blend-luminosity"
          />
        ) : null}

        {/* Subtle Animated Concentric Geometry Details */}
        <svg
          aria-hidden="true"
          viewBox="0 0 400 400"
          className="pointer-events-none absolute -right-24 -bottom-24 h-[380px] w-[380px] opacity-20"
        >
          <circle
            cx="200"
            cy="200"
            r="165"
            fill="none"
            stroke="#A3C4AE"
            strokeWidth="1"
            strokeDasharray="6 8"
          />
          <circle cx="200" cy="200" r="120" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
          <circle cx="200" cy="200" r="76" fill="none" stroke="#A3C4AE" strokeWidth="1" />
        </svg>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--bn-primary)]/92 via-[var(--bn-primary)]/84 to-[var(--bn-secondary)]/88"
        />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2.5 text-left group"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/12 border border-white/20">
              <Droplets className="h-4 w-4 text-white" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display text-sm font-semibold tracking-tight text-white">
                Blood Network
              </span>
              <span className="block text-[11px] text-[#B8D0C0]">
                Predictive Emergency Coordination
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 text-xs font-medium text-[#DCE6DF] hover:bg-white/10 hover:text-white transition-colors lg:hidden"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Home
          </button>
        </div>

        <div className="relative z-10 my-10 space-y-5 lg:my-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#B8D0C0]">
            Clinical Supply Intelligence
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-[34px] leading-[1.15]">
            Calm precision when every unit matters.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-[#DCE6DF]">
            Sign in to coordinate verified cold-chain inventory, monitor 7-day and 30-day shortage
            forecasts, and isolate expiring blood units across regional corridors.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 max-w-sm">
            <div className="rounded-lg border border-white/15 bg-white/[0.06] p-3.5">
              <p className="font-mono-tabular text-lg font-semibold text-white">4 Workspaces</p>
              <p className="mt-0.5 text-[11px] text-[#B8D0C0]">Strict Role Isolation</p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/[0.06] p-3.5">
              <p className="font-mono-tabular text-lg font-semibold text-white">DEMO DATA</p>
              <p className="mt-0.5 text-[11px] text-[#B8D0C0]">Phase 1 Simulation</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 hidden lg:flex items-center justify-between border-t border-white/15 pt-5 text-xs text-[#B8D0C0]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-white" aria-hidden="true" />
            Zod Validation &amp; RBAC Enforced
          </span>
          <span className="font-mono-tabular">Phase 1 · India</span>
        </div>
      </aside>

      {/* Right Authentication Form Panel */}
      <main className="flex flex-col justify-center bg-white px-5 py-10 sm:px-10 lg:col-span-7 lg:px-16">
        <FadeContent className="mx-auto w-full max-w-md space-y-6">
          <div className="hidden lg:flex items-center justify-between">
            <button
              type="button"
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-2 text-xs font-medium text-[#55655C] hover:text-[#123D2B] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to Landing Page
            </button>
            <span className="font-mono-tabular text-[11px] text-[#55655C]">
              Phase 1 Demo Auth
            </span>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-[#17231C]">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-[#55655C]">
              Enter your institutional credentials or select a demo workspace role to continue.
            </p>
          </div>

          <div
            role="note"
            className="flex items-start gap-2.5 rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-3.5 text-xs text-[#55655C]"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#123D2B]" aria-hidden="true" />
            <p className="leading-relaxed">
              <span className="font-semibold text-[#17231C]">Demo Session Notice:</span> Passphrase
              entry validates against Phase 1 schemas without connecting to live hospital SSO or
              clinical databases.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-[#17231C]">
                Institutional Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-[#DCE3DC] bg-white px-3.5 py-2 text-sm text-[#17231C] placeholder:text-[#7D8C83] focus:border-[#123D2B] focus:outline-none focus:ring-2 focus:ring-[#123D2B]/15"
                placeholder="coordinator@hospital.org"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-[#17231C]"
                >
                  Passphrase
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetSent(false);
                    setForgotOpen(true);
                  }}
                  className="text-xs font-medium text-[#1D593E] hover:text-[#123D2B] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full min-h-[42px] rounded-lg border border-[#DCE3DC] bg-white pl-3.5 pr-10 py-2 text-sm text-[#17231C] placeholder:text-[#7D8C83] focus:border-[#123D2B] focus:outline-none focus:ring-2 focus:ring-[#123D2B]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[#55655C] hover:text-[#123D2B]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="login-role" className="block text-xs font-semibold text-[#17231C]">
                Workspace Role
              </label>
              <select
                id="login-role"
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="mt-1.5 block w-full min-h-[42px] rounded-lg border border-[#DCE3DC] bg-white px-3.5 py-2 text-sm text-[#17231C] focus:border-[#123D2B] focus:outline-none focus:ring-2 focus:ring-[#123D2B]/15"
              >
                <option value="HOSPITAL_COORDINATOR">Hospital Coordinator (Demo)</option>
                <option value="BLOOD_BANK_OFFICER">Blood Bank Officer (Demo)</option>
                <option value="ADMIN">Network Administrator (Demo)</option>
                <option value="PUBLIC">Public Searcher (Demo)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="inline-flex items-center gap-2 text-xs text-[#55655C] select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#DCE3DC] accent-[#123D2B]"
                />
                Remember this demo workstation
              </label>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#55655C]">
                <Lock className="h-3 w-3 text-[#1D593E]" aria-hidden="true" />
                Role-Scoped
              </span>
            </div>

            {errorMsg ? (
              <div
                role="alert"
                className="rounded-lg border border-[#C93440]/30 bg-[#FEF2F2] px-3.5 py-2.5 text-xs font-medium text-[#C93440]"
              >
                {errorMsg}
              </div>
            ) : null}

            <Magnet className="w-full">
              <button
                type="submit"
                className="clinical-btn flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[var(--bn-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--bn-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bn-primary)]"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Sign In to Workspace
              </button>
            </Magnet>
          </form>

          {/* Demo Workspace Role Selection */}
          <div className="border-t border-[#DCE3DC] pt-5">
            <p className="text-xs font-semibold text-[#17231C] mb-2.5">
              Choose a Demo Workspace
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DEMO_PRESETS.map((preset) => (
                <button
                  key={preset.role}
                  type="button"
                  onClick={() => handleRoleChange(preset.role)}
                  aria-pressed={role === preset.role}
                  className={`clinical-card clinical-card-interactive flex min-h-[42px] items-center justify-between rounded-lg px-3 py-2 text-left text-xs ${
                    role === preset.role
                      ? 'border-[var(--bn-primary)] ring-1 ring-[var(--bn-primary)]/20'
                      : ''
                  }`}
                >
                  <span className="font-semibold text-[#17231C]">{preset.label}</span>
                  <span className="font-mono-tabular text-[11px] text-[#55655C]">
                    {role === preset.role ? 'Selected' : 'Select'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-[#55655C]">
            Registering a new hospital or blood bank?{' '}
            <button
              type="button"
              onClick={() => onNavigate('signup')}
              className="font-semibold text-[#123D2B] hover:underline"
            >
              Institutional Onboarding
            </button>
          </p>
        </FadeContent>
      </main>

      {/* Forgot Password Modal */}
      <ModalDialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Reset Institutional Access"
        subtitle="Phase 1 Demo Authentication Guidance"
      >
        {resetSent ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 rounded-lg border border-[#1D593E]/25 bg-[#F2F5F1] p-3.5 text-xs text-[#17231C]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1D593E]" aria-hidden="true" />
              <p className="leading-relaxed">
                Simulated password reset guidance prepared for{' '}
                <strong>{resetEmail}</strong>. In Phase 1 Demo Mode, you may sign in directly using
                passphrase <span className="font-mono-tabular font-semibold">demo-access-only</span>{' '}
                or any Quick Demo Role Launcher.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForgotOpen(false)}
              className="clinical-btn w-full min-h-[40px] rounded-lg bg-[#123D2B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D593E]"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-4">
            <p className="text-xs leading-relaxed text-[#55655C]">
              Enter your registered institutional email to simulate recovery instructions or restore
              default demo credentials.
            </p>
            <div>
              <label htmlFor="reset-email" className="block text-xs font-semibold text-[#17231C]">
                Registered Email
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-white px-3 py-2 text-sm text-[#17231C] focus:border-[#123D2B] focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="min-h-[38px] rounded-lg border border-[#DCE3DC] px-3.5 py-2 text-xs font-medium text-[#55655C] hover:bg-[#F2F5F1]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="clinical-btn min-h-[38px] rounded-lg bg-[#123D2B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D593E]"
              >
                Send Demo Recovery
              </button>
            </div>
          </form>
        )}
      </ModalDialog>
    </div>
  );
}

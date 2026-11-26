import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, Droplets, Info, ShieldCheck } from 'lucide-react';
import { INDIAN_STATES_DEMO } from '../../../shared/constants/bloodNetwork.ts';
import { DemoSignupInputSchema } from '../../../shared/schemas/networkSchemas.ts';
import type { DemoSessionUser } from '../../../shared/types/network.ts';
import { FadeContent, Magnet } from '../components/motion/MotionPrimitives.tsx';
import type { AppPage } from '../types/navigation.ts';

interface SignupPageProps {
  onNavigate: (page: AppPage) => void;
  onDemoAuthenticate: (user: DemoSessionUser, targetPage: AppPage) => void;
}

export function SignupPage({ onNavigate, onDemoAuthenticate }: SignupPageProps) {
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState<string>(INDIAN_STATES_DEMO[0]);
  const [role, setRole] = useState<'HOSPITAL_COORDINATOR' | 'BLOOD_BANK_OFFICER' | 'PUBLIC'>(
    'HOSPITAL_COORDINATOR',
  );
  const [licenseReference, setLicenseReference] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedDemo, setSubmittedDemo] = useState(false);
  const [visualError, setVisualError] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);

    const parsed = DemoSignupInputSchema.safeParse({
      fullName,
      organizationName,
      email,
      city,
      state,
      role,
      licenseReference: licenseReference || undefined,
    });

    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message ?? 'Please review the registration form.');
      return;
    }

    setSubmittedDemo(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bn-soft-bg)] text-[var(--bn-text)] lg:grid lg:grid-cols-12 transition-colors duration-300">
      {/* Left Brand Panel */}
      <aside className="relative overflow-hidden bg-[var(--bn-primary)] px-6 py-10 text-white lg:col-span-5 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12">
        {!visualError ? (
          <img
            src="/src/assets/images/carousel_hospital_triage_1795672724842.jpg"
            alt="Hospital coordinator desk managing regional blood supply"
            referrerPolicy="no-referrer"
            onError={() => setVisualError(true)}
            className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity"
          />
        ) : null}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--bn-primary)]/92 via-[var(--bn-primary)]/86 to-[var(--bn-secondary)]/90"
        />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2.5 text-left"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/12 border border-white/20">
              <Droplets className="h-4 w-4 text-white" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display text-sm font-semibold tracking-tight text-white">
                Blood Network
              </span>
              <span className="block text-[11px] text-[#B8D0C0]">Institutional Onboarding</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 text-xs font-medium text-[#DCE6DF] hover:bg-white/10 lg:hidden"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Home
          </button>
        </div>

        <div className="relative z-10 my-10 space-y-4 lg:my-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#B8D0C0]">
            SBTC &amp; CDSCO Verification Ready
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl leading-[1.15]">
            Register your hospital or licensed blood bank.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-[#DCE6DF]">
            Phase 1 onboarding validates facility details through shared Zod schemas before
            activating your role-isolated demonstration workspace.
          </p>
        </div>

        <div className="relative z-10 hidden lg:flex items-center justify-between border-t border-white/15 pt-5 text-xs text-[#B8D0C0]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-white" aria-hidden="true" />
            Zero PII Persisted in Phase 1
          </span>
          <span className="font-mono-tabular">DEMO MODE</span>
        </div>
      </aside>

      {/* Right Form Panel */}
      <main className="flex flex-col justify-center bg-white px-5 py-10 sm:px-10 lg:col-span-7 lg:px-16">
        <FadeContent className="mx-auto w-full max-w-lg space-y-6">
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
              Phase 1 Onboarding
            </span>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-[#17231C]">
              Institutional Registration
            </h2>
            <p className="mt-1.5 text-sm text-[#55655C]">
              Complete facility metadata below to preview your role workspace.
            </p>
          </div>

          <div
            role="note"
            className="flex items-start gap-2.5 rounded-lg border border-[#DCE3DC] bg-[#F2F5F1] p-3.5 text-xs text-[#55655C]"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#123D2B]" aria-hidden="true" />
            <p className="leading-relaxed">
              <span className="font-semibold text-[#17231C]">Demo Onboarding Notice:</span> Form
              validation uses shared Zod rules without persisting accounts to PostgreSQL. Real
              institutional verification activates in Phases 2 &amp; 6.
            </p>
          </div>

          {submittedDemo ? (
            <div className="space-y-4 rounded-xl border border-[#1D593E]/30 bg-[#F2F5F1] p-6">
              <div className="flex items-center gap-2 text-[#123D2B] font-semibold text-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#1D593E]" aria-hidden="true" />
                Demo Registration Validated
              </div>
              <p className="text-sm text-[#55655C] leading-relaxed">
                <span className="font-semibold text-[#17231C]">{organizationName}</span> ({city},{' '}
                {state}) passed Phase 1 Zod validation. Continue into the demo workspace to preview
                portal workflows.
              </p>
              <Magnet className="w-full">
                <button
                  type="button"
                  onClick={() =>
                    onDemoAuthenticate(
                      {
                        id: 'demo-signup-user',
                        name: fullName,
                        email,
                        role,
                        organizationName: `${organizationName} (Demo)`,
                        city,
                        isDemoMode: true,
                      },
                      role === 'BLOOD_BANK_OFFICER'
                        ? 'blood-bank'
                        : role === 'PUBLIC'
                          ? 'public-dashboard'
                          : 'hospital',
                    )
                  }
                  className="clinical-btn w-full min-h-[44px] rounded-lg bg-[#123D2B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D593E]"
                >
                  Continue to Demo Portal
                </button>
              </Magnet>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="signup-name" className="block text-xs font-semibold text-[#17231C]">
                    Coordinator Full Name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-white px-3 py-2 text-sm text-[#17231C] placeholder:text-[#7D8C83] focus:border-[#123D2B] focus:outline-none focus:ring-2 focus:ring-[#123D2B]/15"
                    placeholder="Dr. Ananya Rao"
                  />
                </div>
                <div>
                  <label htmlFor="signup-role" className="block text-xs font-semibold text-[#17231C]">
                    Facility Role
                  </label>
                  <select
                    id="signup-role"
                    value={role}
                    onChange={(e) =>
                      setRole(
                        e.target.value as 'HOSPITAL_COORDINATOR' | 'BLOOD_BANK_OFFICER' | 'PUBLIC',
                      )
                    }
                    className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-white px-3 py-2 text-sm text-[#17231C] focus:border-[#123D2B] focus:outline-none focus:ring-2 focus:ring-[#123D2B]/15"
                  >
                    <option value="HOSPITAL_COORDINATOR">Hospital Coordinator</option>
                    <option value="BLOOD_BANK_OFFICER">Blood Bank Officer</option>
                    <option value="PUBLIC">Public / Volunteer</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="signup-org" className="block text-xs font-semibold text-[#17231C]">
                  Hospital or Blood Bank Name
                </label>
                <input
                  id="signup-org"
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-white px-3 py-2 text-sm text-[#17231C] placeholder:text-[#7D8C83] focus:border-[#123D2B] focus:outline-none focus:ring-2 focus:ring-[#123D2B]/15"
                  placeholder="City General Trauma Hospital"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="signup-email" className="block text-xs font-semibold text-[#17231C]">
                    Official Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-white px-3 py-2 text-sm text-[#17231C] placeholder:text-[#7D8C83] focus:border-[#123D2B] focus:outline-none focus:ring-2 focus:ring-[#123D2B]/15"
                    placeholder="bloodbank@hospital.org"
                  />
                </div>
                <div>
                  <label htmlFor="signup-license" className="block text-xs font-semibold text-[#17231C]">
                    SBTC / CDSCO License (Optional)
                  </label>
                  <input
                    id="signup-license"
                    type="text"
                    value={licenseReference}
                    onChange={(e) => setLicenseReference(e.target.value)}
                    className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-white px-3 py-2 text-sm text-[#17231C] placeholder:text-[#7D8C83] focus:border-[#123D2B] focus:outline-none focus:ring-2 focus:ring-[#123D2B]/15"
                    placeholder="KA-SBTC-DEMO-102"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="signup-city" className="block text-xs font-semibold text-[#17231C]">
                    City
                  </label>
                  <input
                    id="signup-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-white px-3 py-2 text-sm text-[#17231C] placeholder:text-[#7D8C83] focus:border-[#123D2B] focus:outline-none focus:ring-2 focus:ring-[#123D2B]/15"
                    placeholder="Bengaluru"
                  />
                </div>
                <div>
                  <label htmlFor="signup-state" className="block text-xs font-semibold text-[#17231C]">
                    State / UT
                  </label>
                  <select
                    id="signup-state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="mt-1.5 block w-full min-h-[40px] rounded-lg border border-[#DCE3DC] bg-white px-3 py-2 text-sm text-[#17231C] focus:border-[#123D2B] focus:outline-none focus:ring-2 focus:ring-[#123D2B]/15"
                  >
                    {INDIAN_STATES_DEMO.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
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
                  className="clinical-btn w-full min-h-[44px] rounded-lg bg-[#123D2B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D593E]"
                >
                  Validate Demo Registration
                </button>
              </Magnet>
            </form>
          )}

          <p className="text-center text-xs text-[#55655C]">
            Already exploring?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="font-semibold text-[#123D2B] hover:underline"
            >
              Go to Demo Login
            </button>
          </p>
        </FadeContent>
      </main>
    </div>
  );
}

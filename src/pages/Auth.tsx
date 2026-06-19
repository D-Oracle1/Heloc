import { useState, type FormEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Calendar,
  MapPin,
  Building,
  Briefcase,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { useAuth } from '../data/auth';

type Mode = 'signin' | 'signup';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signup');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  // Step 1 — account & contact
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  // Step 2 — address, identity, linked accounts
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateField, setStateField] = useState('');
  const [zip, setZip] = useState('');
  const [employer, setEmployer] = useState('');
  const [income, setIncome] = useState('');

  function goToStep2() {
    setError(null);
    if (!fullName.trim()) return setError('Please enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Please enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setStep(2);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { needsConfirmation } = await signUp(email.trim(), password, {
          fullName: fullName.trim(),
          phone: phone.trim(),
          dob: dob || undefined,
          addressStreet: street.trim(),
          addressCity: city.trim(),
          addressState: stateField.trim(),
          addressZip: zip.trim(),
          employer: employer.trim(),
          annualIncome: income.trim(),
        });
        if (needsConfirmation) {
          // Email verification is disabled (auto-confirm); sign in directly.
          try {
            await signIn(email.trim(), password);
          } catch {
            setConfirmSent(true);
          }
        }
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === 'signup' ? 'signin' : 'signup');
    setStep(1);
    setError(null);
  }

  if (confirmSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-900 p-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-card-hover">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={30} />
          </span>
          <h1 className="text-xl font-extrabold text-navy-900">Almost there</h1>
          <p className="mt-2 text-sm text-navy-500">
            Your account for <span className="font-semibold text-navy-700">{email}</span> was created. Please sign
            in to continue.
          </p>
          <Button variant="outline" fullWidth className="mt-6" onClick={() => { setConfirmSent(false); setMode('signin'); setStep(1); }}>
            Go to sign in
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-navy-900 lg:flex-row">
      {/* Brand panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-brand-gradient p-12 text-white lg:sticky lg:top-0 lg:flex lg:h-screen">
        <Logo chip className="h-8 self-start" />
        <div>
          <h2 className="max-w-sm text-3xl font-extrabold leading-tight">
            Your home equity, available the moment you need it.
          </h2>
          <p className="mt-3 max-w-sm text-white/70">
            Track your balance, request funds, and review every transaction with bank-grade security.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <ShieldCheck size={18} /> 256-bit encryption · test environment
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-start justify-center p-6 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card-hover">
          <Logo className="mb-6 h-7 lg:hidden" />

          <h1 className="text-2xl font-extrabold text-navy-900">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-navy-500">
            {mode === 'signup'
              ? step === 1
                ? 'Step 1 of 2 — your details & sign-in'
                : 'Step 2 of 2 — address & funding'
              : 'Sign in to access your equity hub.'}
          </p>

          {mode === 'signup' && <Stepper step={step} />}

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* SIGN IN */}
            {mode === 'signin' && (
              <div className="space-y-3">
                <Field icon={<Mail size={18} />} label="Email">
                  <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={inputCls} />
                </Field>
                <Field icon={<Lock size={18} />} label="Password">
                  <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
                </Field>
              </div>
            )}

            {/* SIGN UP — STEP 1 */}
            {mode === 'signup' && step === 1 && (
              <div className="space-y-3">
                <Field icon={<UserIcon size={18} />} label="Full name">
                  <input type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Carter" className={inputCls} />
                </Field>
                <Field icon={<Mail size={18} />} label="Email">
                  <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={inputCls} />
                </Field>
                <Field icon={<Lock size={18} />} label="Password">
                  <input type="password" minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className={inputCls} />
                </Field>
                <Field icon={<Phone size={18} />} label="Phone">
                  <input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" className={inputCls} />
                </Field>
                <Field icon={<Calendar size={18} />} label="Date of birth">
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputCls} />
                </Field>
              </div>
            )}

            {/* SIGN UP — STEP 2 */}
            {mode === 'signup' && step === 2 && (
              <>
                <Group title="Home address">
                  <Field icon={<MapPin size={18} />} label="Street address">
                    <input type="text" autoComplete="street-address" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="128 Maple Crest Ave" className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field icon={<Building size={18} />} label="City">
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Austin" className={inputCls} />
                    </Field>
                    <Field label="State">
                      <input type="text" maxLength={2} value={stateField} onChange={(e) => setStateField(e.target.value.toUpperCase())} placeholder="TX" className={inputCls} />
                    </Field>
                  </div>
                  <Field label="ZIP code">
                    <input type="text" inputMode="numeric" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="78701" className={inputCls} />
                  </Field>
                </Group>

                <Group title="Employment">
                  <Field icon={<Briefcase size={18} />} label="Employer">
                    <input type="text" value={employer} onChange={(e) => setEmployer(e.target.value)} placeholder="Acme Corp" className={inputCls} />
                  </Field>
                  <Field icon={<CreditCard size={18} />} label="Annual income (USD)">
                    <input type="number" min="0" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="85000" className={inputCls} />
                  </Field>
                </Group>
              </>
            )}

            {error && <p className="rounded-xl bg-crimson-50 px-3 py-2 text-sm text-crimson-600">{error}</p>}

            {/* Actions */}
            {mode === 'signin' && (
              <Button type="submit" fullWidth size="lg" loading={loading}>
                Sign in
              </Button>
            )}
            {mode === 'signup' && step === 1 && (
              <Button type="button" fullWidth size="lg" rightIcon={<ArrowRight size={18} />} onClick={goToStep2}>
                Continue
              </Button>
            )}
            {mode === 'signup' && step === 2 && (
              <div className="flex gap-3">
                <Button type="button" variant="outline" size="lg" leftIcon={<ArrowLeft size={18} />} onClick={() => { setStep(1); setError(null); }}>
                  Back
                </Button>
                <Button type="submit" fullWidth size="lg" loading={loading}>
                  Create account
                </Button>
              </div>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-navy-500">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={switchMode} className="font-semibold text-crimson-600 hover:underline focus-ring rounded">
              {mode === 'signup' ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: 1 | 2 }) {
  return (
    <div className="mt-4 flex items-center gap-2">
      <span className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-crimson-500' : 'bg-navy-100'}`} />
      <span className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-crimson-500' : 'bg-navy-100'}`} />
    </div>
  );
}

const inputCls = 'w-full bg-transparent text-navy-900 outline-none placeholder:text-navy-300';

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3 border-t border-navy-100 pt-4">
      <legend className="text-xs font-bold uppercase tracking-wide text-navy-400">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ icon, label, children }: { icon?: ReactNode; label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-navy-600">{label}</span>
      <span className="flex items-center gap-2.5 rounded-2xl border border-navy-200 bg-navy-50/50 px-3.5 py-3 focus-within:border-navy-400 focus-within:bg-white">
        {icon && <span className="text-navy-400">{icon}</span>}
        {children}
      </span>
    </label>
  );
}

import { useState } from 'react';
import {
  ChevronRight,
  Bell,
  Fingerprint,
  CreditCard,
  FileText,
  HelpCircle,
  LogOut,
  Moon,
  Home,
  Mail,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react';
import { TopNav } from '../components/layout/TopNav';
import { PageTransition } from '../components/ui/PageTransition';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BottomSheet } from '../components/ui/BottomSheet';
import { useAppStore } from '../data/store';
import { formatCurrency, formatDate } from '../utils/format';

export default function Profile() {
  const { account, destinations, resetDemo } = useAppStore();
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(true);
  const [darkPref, setDarkPref] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <PageTransition>
      <TopNav title="Profile" subtitle="Account & settings" />

      <div className="space-y-6 px-4 py-5 lg:px-8">
        {/* Identity card */}
        <Card className="overflow-hidden">
          <div className="flex items-center gap-4 bg-brand-gradient p-5 text-white">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/15 text-xl font-extrabold backdrop-blur">
              {account.avatarInitials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">{account.name}</p>
              <p className="flex items-center gap-1.5 truncate text-sm text-white/75">
                <Mail size={14} /> {account.email}
              </p>
              <p className="mt-1 text-xs text-white/60">
                Member since {formatDate(account.memberSince)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-navy-100">
            <Info label="Credit limit" value={formatCurrency(account.creditLimit, { compact: true })} />
            <Info label="Outstanding" value={formatCurrency(account.outstandingBalance, { compact: true })} />
          </div>
          <div className="flex items-start gap-2 border-t border-navy-100 p-4">
            <Home size={18} className="mt-0.5 shrink-0 text-navy-500" />
            <div>
              <p className="text-xs font-medium text-navy-400">Secured property</p>
              <p className="text-sm font-semibold text-navy-800">{account.property}</p>
            </div>
          </div>
        </Card>

        {/* Linked accounts */}
        <Section title="Linked accounts">
          {destinations.map((dest) => (
            <Row key={dest.id} icon={CreditCard} label={dest.label} value={dest.detail} />
          ))}
        </Section>

        {/* Preferences */}
        <Section title="Preferences">
          <ToggleRow
            icon={Bell}
            label="Push notifications"
            checked={notifications}
            onChange={setNotifications}
          />
          <ToggleRow
            icon={Fingerprint}
            label="Biometric login"
            checked={biometrics}
            onChange={setBiometrics}
          />
          <ToggleRow icon={Moon} label="Dark appearance" checked={darkPref} onChange={setDarkPref} />
        </Section>

        {/* Support */}
        <Section title="Support & legal">
          <Row icon={HelpCircle} label="Help center" chevron />
          <Row icon={FileText} label="Statements & documents" chevron />
          <Row icon={FileText} label="Terms & disclosures" chevron />
        </Section>

        <div className="space-y-3">
          <Button
            variant="outline"
            fullWidth
            size="lg"
            leftIcon={<RotateCcw size={18} />}
            onClick={() => setConfirmReset(true)}
          >
            Reset demo data
          </Button>
          <Button variant="ghost" fullWidth size="lg" leftIcon={<LogOut size={18} />} className="!text-crimson-600">
            Sign out
          </Button>
        </div>

        <p className="pb-2 text-center text-xs text-navy-400">HELOC · v1.0.0 · Demo experience</p>
      </div>

      <BottomSheet
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset demo data?"
        description="This restores balances and claim history to their original demo values."
      >
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="flex-1" onClick={() => setConfirmReset(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={() => {
              resetDemo();
              setConfirmReset(false);
            }}
          >
            Reset
          </Button>
        </div>
      </BottomSheet>
    </PageTransition>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 text-center">
      <p className="text-xs font-medium text-navy-400">{label}</p>
      <p className="tabular mt-0.5 text-lg font-bold text-navy-900">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2.5 px-1 text-sm font-bold text-navy-500">{title}</h2>
      <Card className="divide-y divide-navy-50 overflow-hidden">{children}</Card>
    </section>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  chevron,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  chevron?: boolean;
}) {
  return (
    <button className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-navy-50/60 focus-ring">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-600">
        <Icon size={18} />
      </span>
      <span className="flex-1 font-medium text-navy-800">{label}</span>
      {value && <span className="text-sm text-navy-400">{value}</span>}
      {chevron && <ChevronRight size={18} className="text-navy-300" />}
    </button>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-600">
        <Icon size={18} />
      </span>
      <span className="flex-1 font-medium text-navy-800">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-ring ${
          checked ? 'bg-navy-800' : 'bg-navy-200'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-spring ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

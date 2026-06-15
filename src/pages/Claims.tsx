import { useState } from 'react';
import { Landmark, Building2, CreditCard, Zap, ShieldCheck, Clock, type LucideIcon } from 'lucide-react';
import { TopNav } from '../components/layout/TopNav';
import { PageTransition } from '../components/ui/PageTransition';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ClaimFundsSheet } from '../components/claims/ClaimFundsSheet';
import { useAppStore } from '../data/store';
import { formatCurrency } from '../utils/format';

interface Method {
  icon: LucideIcon;
  title: string;
  desc: string;
  eta: string;
  fee: string;
}

const METHODS: Method[] = [
  { icon: Landmark, title: 'Bank transfer (ACH)', desc: 'Send to a linked checking or savings account', eta: '1–2 business days', fee: 'No fee' },
  { icon: Building2, title: 'Wire transfer', desc: 'Domestic or international wire', eta: 'Same business day', fee: '$15' },
  { icon: CreditCard, title: 'Instant to debit', desc: 'Push funds straight to your debit card', eta: 'Within minutes', fee: '1.5%' },
];

export default function Claims() {
  const { account } = useAppStore();
  const [open, setOpen] = useState(false);

  return (
    <PageTransition>
      <TopNav title="Claims" subtitle="Draw from your equity line" />

      <div className="space-y-6 px-4 py-5 lg:px-8">
        {/* Hero claim panel */}
        <Card className="overflow-hidden">
          <div className="bg-brand-gradient p-6 text-white">
            <p className="text-sm font-medium text-white/70">Available to claim</p>
            <p className="tabular mt-1 text-3xl font-extrabold">
              {formatCurrency(account.availableBalance)}
            </p>
            <Button
              variant="danger"
              size="lg"
              fullWidth
              className="mt-5 !bg-white !text-navy-900 hover:!brightness-95"
              leftIcon={<Zap size={19} />}
              onClick={() => setOpen(true)}
            >
              Start a new claim
            </Button>
          </div>
          <div className="grid grid-cols-2 divide-x divide-navy-100">
            <div className="flex items-center gap-2 p-3.5">
              <ShieldCheck size={18} className="text-emerald-600" />
              <span className="text-xs font-medium text-navy-600">Secured & encrypted</span>
            </div>
            <div className="flex items-center gap-2 p-3.5">
              <Clock size={18} className="text-navy-500" />
              <span className="text-xs font-medium text-navy-600">24/7 availability</span>
            </div>
          </div>
        </Card>

        {/* Methods */}
        <section aria-label="Payout methods">
          <h2 className="mb-3 text-base font-bold text-navy-900">Payout methods</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {METHODS.map(({ icon: Icon, title, desc, eta, fee }) => (
              <Card key={title} interactive className="p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700">
                    <Icon size={21} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-navy-900">{title}</p>
                    <p className="mt-0.5 text-sm text-navy-500">{desc}</p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="rounded-full bg-navy-50 px-2 py-0.5 text-xs font-semibold text-navy-600">
                        {eta}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                        {fee}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <p className="px-1 text-center text-xs leading-relaxed text-navy-400">
          Claims are subject to credit availability and verification. Interest accrues on outstanding
          balances at {account.apr}% APR.
        </p>
      </div>

      <ClaimFundsSheet open={open} onClose={() => setOpen(false)} />
    </PageTransition>
  );
}

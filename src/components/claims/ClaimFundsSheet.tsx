import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronRight, Landmark, Building2, CreditCard } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { useAppStore } from '../../data/store';
import { formatCurrency } from '../../utils/format';
import type { Claim, ClaimMethod } from '../../types';

interface ClaimFundsSheetProps {
  open: boolean;
  onClose: () => void;
}

const QUICK_AMOUNTS = [500, 1000, 2500, 5000];

const methodMeta: Record<ClaimMethod, { icon: typeof Landmark; eta: string }> = {
  bank: { icon: Landmark, eta: '1–2 business days' },
  wire: { icon: Building2, eta: 'Same day' },
  card: { icon: CreditCard, eta: 'Instant' },
};

type Step = 'form' | 'review' | 'success';

export function ClaimFundsSheet({ open, onClose }: ClaimFundsSheetProps) {
  const { account, destinations, submitClaim } = useAppStore();
  const [step, setStep] = useState<Step>('form');
  const [amount, setAmount] = useState('');
  const [destinationId, setDestinationId] = useState(destinations[0]?.id ?? '');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Claim | null>(null);
  const [touched, setTouched] = useState(false);

  const numericAmount = Number(amount);
  const selectedDest = destinations.find((d) => d.id === destinationId);

  const error = useMemo(() => {
    if (!amount) return 'Enter an amount to continue';
    if (Number.isNaN(numericAmount) || numericAmount <= 0) return 'Enter a valid amount';
    if (numericAmount < 50) return 'Minimum claim is $50';
    if (numericAmount > account.availableBalance) return 'Amount exceeds available balance';
    return null;
  }, [amount, numericAmount, account.availableBalance]);

  const reset = () => {
    setStep('form');
    setAmount('');
    setNote('');
    setResult(null);
    setTouched(false);
    setDestinationId(destinations[0]?.id ?? '');
  };

  const handleClose = () => {
    onClose();
    // Defer reset so the closing animation isn't janky
    setTimeout(reset, 250);
  };

  const goReview = () => {
    setTouched(true);
    if (error) return;
    setStep('review');
  };

  const confirm = async () => {
    if (!selectedDest) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900)); // simulate network
    const claim = submitClaim({
      amount: numericAmount,
      method: selectedDest.method,
      destinationId,
      note: note.trim() || undefined,
    });
    setResult(claim);
    setSubmitting(false);
    setStep('success');
  };

  const titles: Record<Step, { title: string; description?: string }> = {
    form: { title: 'Claim Funds', description: `${formatCurrency(account.availableBalance)} available` },
    review: { title: 'Review your claim', description: 'Confirm the details below' },
    success: { title: 'Claim submitted', description: 'Your request is on its way' },
  };

  return (
    <BottomSheet open={open} onClose={handleClose} {...titles[step]}>
      {step === 'form' && (
        <div className="space-y-5">
          {/* Amount */}
          <div>
            <label htmlFor="claim-amount" className="mb-1.5 block text-sm font-semibold text-navy-700">
              Amount
            </label>
            <div
              className={`flex items-center rounded-2xl border-2 bg-navy-50/50 px-4 transition-colors ${
                touched && error ? 'border-crimson-300' : 'border-transparent focus-within:border-navy-400'
              }`}
            >
              <span className="text-2xl font-bold text-navy-400">$</span>
              <input
                id="claim-amount"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, '');
                  setAmount(v);
                }}
                onBlur={() => setTouched(true)}
                aria-invalid={!!(touched && error)}
                aria-describedby="claim-amount-error"
                className="tabular w-full bg-transparent py-3.5 pl-1 text-2xl font-bold text-navy-900 outline-none placeholder:text-navy-300"
              />
            </div>
            <div className="mt-1 flex min-h-[18px] items-center justify-between">
              <span id="claim-amount-error" className="text-xs font-medium text-crimson-600">
                {touched && error ? error : ''}
              </span>
              <button
                type="button"
                onClick={() => setAmount(String(account.availableBalance))}
                className="text-xs font-semibold text-navy-500 hover:text-navy-800"
              >
                Use max
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(String(amt))}
                  className="touch-target rounded-full bg-navy-50 px-3.5 py-1.5 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-100 active:scale-95 focus-ring"
                >
                  {formatCurrency(amt, { compact: true })}
                </button>
              ))}
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy-700">Deposit to</label>
            <div className="space-y-2">
              {destinations.map((dest) => {
                const Icon = methodMeta[dest.method].icon;
                const active = dest.id === destinationId;
                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => setDestinationId(dest.id)}
                    aria-pressed={active}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all focus-ring ${
                      active ? 'border-navy-700 bg-navy-50' : 'border-navy-100 hover:border-navy-300'
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                        active ? 'bg-navy-800 text-white' : 'bg-navy-50 text-navy-600'
                      }`}
                    >
                      <Icon size={19} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-navy-900">{dest.label}</p>
                      <p className="text-xs text-navy-400">
                        {dest.detail} · {methodMeta[dest.method].eta}
                      </p>
                    </div>
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                        active ? 'border-navy-800 bg-navy-800' : 'border-navy-200'
                      }`}
                    >
                      {active && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <label htmlFor="claim-note" className="mb-1.5 block text-sm font-semibold text-navy-700">
              Note <span className="font-normal text-navy-400">(optional)</span>
            </label>
            <input
              id="claim-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={60}
              placeholder="e.g. Home renovation"
              className="w-full rounded-2xl border-2 border-transparent bg-navy-50/50 px-4 py-3 text-navy-900 outline-none transition-colors placeholder:text-navy-300 focus:border-navy-400"
            />
          </div>

          <Button fullWidth size="lg" onClick={goReview} rightIcon={<ChevronRight size={20} />}>
            Review claim
          </Button>
        </div>
      )}

      {step === 'review' && selectedDest && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-navy-50 p-5 text-center">
            <p className="text-sm font-medium text-navy-500">You're claiming</p>
            <p className="tabular mt-1 text-4xl font-extrabold text-navy-900">
              {formatCurrency(numericAmount)}
            </p>
          </div>

          <dl className="divide-y divide-navy-100 rounded-2xl border border-navy-100">
            <Row label="Deposit to" value={`${selectedDest.label} ${selectedDest.detail}`} />
            <Row label="Method" value={selectedDest.method.toUpperCase()} />
            <Row label="Estimated arrival" value={methodMeta[selectedDest.method].eta} />
            {note.trim() && <Row label="Note" value={note.trim()} />}
            <Row
              label="Remaining after"
              value={formatCurrency(account.availableBalance - numericAmount)}
            />
          </dl>

          <p className="text-xs leading-relaxed text-navy-400">
            By confirming, you authorize HELOC to draw {formatCurrency(numericAmount)} from your line
            of credit. Standard APR of {account.apr}% applies to outstanding balances.
          </p>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep('form')} className="flex-1">
              Back
            </Button>
            <Button size="lg" onClick={confirm} loading={submitting} className="flex-[1.6]">
              Confirm & claim
            </Button>
          </div>
        </div>
      )}

      {step === 'success' && result && (
        <div className="flex flex-col items-center py-2 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-500 animate-scale-in">
            <CheckCircle2 size={48} strokeWidth={2} />
          </span>
          <p className="tabular mt-4 text-3xl font-extrabold text-navy-900">
            {formatCurrency(result.amount)}
          </p>
          <p className="mt-1 text-sm text-navy-500">is on its way to {result.destination}</p>

          <div className="mt-5 w-full rounded-2xl bg-navy-50 p-4 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-navy-500">Reference</span>
              <span className="font-semibold text-navy-900">{result.reference}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-navy-500">Status</span>
              <span className="font-semibold text-amber-600">Pending review</span>
            </div>
          </div>

          <Button fullWidth size="lg" onClick={handleClose} className="mt-5">
            Done
          </Button>
        </div>
      )}
    </BottomSheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-sm text-navy-500">{label}</dt>
      <dd className="text-right text-sm font-semibold text-navy-900">{value}</dd>
    </div>
  );
}

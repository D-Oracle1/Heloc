import { useMemo, useState } from 'react';
import { ChevronRight, Info } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { useAppStore } from '../../data/store';
import { formatCurrency } from '../../utils/format';
import { US_BANKS, type AccountType } from '../../data/banks';

interface ClaimFundsSheetProps {
  open: boolean;
  onClose: () => void;
}

const QUICK_AMOUNTS = [1000, 5000, 25000, 100000];

type Step = 'form' | 'review' | 'end';

export function ClaimFundsSheet({ open, onClose }: ClaimFundsSheetProps) {
  const { account } = useAppStore();
  const [step, setStep] = useState<Step>('form');

  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState('');
  const [customBank, setCustomBank] = useState('');
  const [holder, setHolder] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('checking');
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const numericAmount = Number(amount);
  const bankName = bank === 'Other' ? customBank.trim() : bank;

  const charges = useMemo(() => {
    const network = account.networkCharge;
    const vat = (numericAmount || 0) * (account.vatRate / 100);
    const processing = account.processingFee;
    return { network, vat, processing, total: network + vat + processing };
  }, [numericAmount, account.networkCharge, account.vatRate, account.processingFee]);

  const error = useMemo(() => {
    if (!amount) return 'Enter an amount to continue';
    if (Number.isNaN(numericAmount) || numericAmount <= 0) return 'Enter a valid amount';
    if (numericAmount < 50) return 'Minimum claim is $50';
    if (numericAmount > account.availableBalance) return 'Amount exceeds available balance';
    if (!bankName) return 'Select the recipient bank';
    if (!holder.trim()) return "Enter the account holder's name";
    return null;
  }, [amount, numericAmount, account.availableBalance, bankName, holder]);

  const reset = () => {
    setStep('form');
    setAmount(''); setBank(''); setCustomBank(''); setHolder('');
    setAccountType('checking'); setNote(''); setTouched(false);
    setSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 250);
  };

  const goReview = () => {
    setTouched(true);
    if (error) return;
    setStep('review');
  };

  const confirm = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setStep('end'); // flow stops here — nothing is processed
  };

  const titles: Record<Step, { title: string; description?: string }> = {
    form: { title: 'Claim Funds', description: `${formatCurrency(account.availableBalance)} available` },
    review: { title: 'Review claim', description: 'Confirm the details below' },
    end: { title: 'Claim request', description: undefined },
  };

  return (
    <BottomSheet open={open} onClose={handleClose} {...titles[step]}>
      {step === 'form' && (
        <div className="space-y-5">
          {/* Amount */}
          <div>
            <label htmlFor="claim-amount" className="mb-1.5 block text-sm font-semibold text-navy-700">Amount</label>
            <div className={`flex items-center rounded-2xl border-2 bg-navy-50/50 px-4 transition-colors ${touched && /amount|valid|Minimum|exceeds/i.test(error ?? '') ? 'border-crimson-300' : 'border-transparent focus-within:border-navy-400'}`}>
              <span className="text-2xl font-bold text-navy-400">$</span>
              <input
                id="claim-amount" type="text" inputMode="decimal" autoComplete="off" placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                className="tabular w-full bg-transparent py-3.5 pl-1 text-2xl font-bold text-navy-900 outline-none placeholder:text-navy-300"
              />
            </div>
            <div className="mt-1 flex items-center justify-end">
              <button type="button" onClick={() => setAmount(String(account.availableBalance))} className="text-xs font-semibold text-navy-500 hover:text-navy-800">Use max</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button key={amt} type="button" onClick={() => setAmount(String(amt))} className="touch-target rounded-full bg-navy-50 px-3.5 py-1.5 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-100 active:scale-95 focus-ring">
                  {formatCurrency(amt, { compact: true })}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient (no account credentials collected) */}
          <div className="space-y-3 border-t border-navy-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-navy-400">Transfer to</p>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-navy-700">Bank</span>
              <select value={bank} onChange={(e) => setBank(e.target.value)} className={selectCls}>
                <option value="" disabled>Select a bank</option>
                {US_BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </label>
            {bank === 'Other' && (
              <input value={customBank} onChange={(e) => setCustomBank(e.target.value)} placeholder="Bank name" className={inputCls} />
            )}

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-navy-700">Account holder name</span>
              <input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Full name on account" className={inputCls} />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-navy-700">Account type</span>
              <select value={accountType} onChange={(e) => setAccountType(e.target.value as AccountType)} className={selectCls}>
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-navy-700">Note <span className="font-normal text-navy-400">(optional)</span></span>
              <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={60} placeholder="e.g. Home renovation" className={inputCls} />
            </label>
          </div>

          {touched && error && <p className="text-sm font-medium text-crimson-600">{error}</p>}

          <Button fullWidth size="lg" onClick={goReview} rightIcon={<ChevronRight size={20} />}>
            Review claim
          </Button>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-navy-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-navy-500">Claiming</span>
              <span className="tabular text-lg font-extrabold text-navy-900">{formatCurrency(numericAmount)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm text-navy-500">To</span>
              <span className="text-sm font-semibold text-navy-900">{bankName} · {holder}</span>
            </div>
          </div>

          {/* Itemized charges (display only) */}
          <div>
            <p className="mb-2 text-sm font-bold text-navy-900">Estimated charges</p>
            <dl className="divide-y divide-navy-100 rounded-2xl border border-navy-100">
              <Row label="Network charges" value={formatCurrency(charges.network)} />
              <Row label={`VAT (${account.vatRate.toFixed(2)}%)`} value={formatCurrency(charges.vat)} />
              <Row label="Processing fee" value={formatCurrency(charges.processing)} />
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-sm font-bold text-navy-900">Total charges</dt>
                <dd className="tabular text-right text-base font-extrabold text-navy-900">{formatCurrency(charges.total)}</dd>
              </div>
            </dl>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-navy-50 px-3 py-2 text-xs text-navy-500">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>No funds are transferred and no payment is taken in this environment.</span>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep('form')} className="flex-1">Back</Button>
            <Button size="lg" onClick={confirm} loading={submitting} className="flex-[1.6]">
              Submit request
            </Button>
          </div>
        </div>
      )}

      {step === 'end' && (
        <div className="flex flex-col items-center py-2 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-navy-50 text-navy-500">
            <Info size={30} />
          </span>
          <p className="mt-4 text-lg font-bold text-navy-900">This is where the claim ends</p>
          <p className="mt-1 text-sm text-navy-500">
            You cannot Proceed beyond this point. payments are not collected within this environment, nothing can be processed beyond this point please contact account manager.
            Account Manager: Michael Brown, Email:michael.brown@pridebankheloc.com
          </p>
          <Button fullWidth size="lg" onClick={handleClose} className="mt-6">Close</Button>
        </div>
      )}
    </BottomSheet>
  );
}

const inputCls =
  'w-full rounded-2xl border border-navy-200 bg-navy-50/50 px-3.5 py-3 text-navy-900 outline-none transition-colors focus:border-navy-400 focus:bg-white placeholder:text-navy-300';
const selectCls =
  'w-full rounded-2xl border border-navy-200 bg-navy-50/50 px-3.5 py-3 text-navy-900 outline-none transition-colors focus:border-navy-400 focus:bg-white';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-sm text-navy-500">{label}</dt>
      <dd className="tabular text-right text-sm font-semibold text-navy-900">{value}</dd>
    </div>
  );
}

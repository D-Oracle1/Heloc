import { useState, type FormEvent } from 'react';
import { Lock, CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { useAppStore } from '../../data/store';
import { formatCurrency } from '../../utils/format';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Simulated processing-fee payment that unlocks fund access. */
export function PayFeeSheet({ open, onClose }: Props) {
  const { account, payFee } = useAppStore();
  const [card, setCard] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  function reset() {
    setCard('');
    setExp('');
    setCvc('');
    setName('');
    setProcessing(false);
    setDone(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setProcessing(true);
    // Simulate a payment processor round-trip.
    setTimeout(() => {
      payFee();
      setProcessing(false);
      setDone(true);
    }, 1400);
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title={done ? undefined : 'Processing fee'}>
      {done ? (
        <div className="flex flex-col items-center py-4 text-center">
          <span className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={34} />
          </span>
          <h2 className="text-xl font-extrabold text-navy-900">Funds unlocked</h2>
          <p className="mt-1 text-sm text-navy-500">
            Your {formatCurrency(account.processingFee)} processing fee was received. You can now claim your
            available balance.
          </p>
          <Button fullWidth size="lg" className="mt-6" onClick={handleClose}>
            Continue
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl bg-navy-900 p-5 text-white">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Lock size={15} /> Amount due
            </div>
            <p className="tabular mt-1 text-3xl font-extrabold">{formatCurrency(account.processingFee)}</p>
            <p className="mt-1 text-xs text-white/60">
              A one-time fee is required before your available balance can be released.
            </p>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-navy-600">Cardholder name</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name on card" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-navy-600">Card number</span>
            <span className="flex items-center gap-2 rounded-2xl border border-navy-200 bg-navy-50/50 px-3.5 py-3 focus-within:border-navy-400 focus-within:bg-white">
              <CreditCard size={18} className="text-navy-400" />
              <input
                required
                inputMode="numeric"
                maxLength={19}
                value={card}
                onChange={(e) => setCard(e.target.value.replace(/[^\d ]/g, ''))}
                placeholder="4242 4242 4242 4242"
                className="w-full bg-transparent outline-none placeholder:text-navy-300"
              />
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-navy-600">Expiry</span>
              <input required value={exp} onChange={(e) => setExp(e.target.value)} placeholder="MM/YY" className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-navy-600">CVC</span>
              <input required inputMode="numeric" maxLength={4} value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))} placeholder="123" className={inputCls} />
            </label>
          </div>

          <Button type="submit" fullWidth size="lg" loading={processing}>
            Pay {formatCurrency(account.processingFee)}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-navy-400">
            <ShieldCheck size={14} /> Secured with 256-bit encryption
          </p>
        </form>
      )}
    </BottomSheet>
  );
}

const inputCls =
  'w-full rounded-2xl border border-navy-200 bg-navy-50/50 px-3.5 py-3 text-navy-900 outline-none focus:border-navy-400 focus:bg-white placeholder:text-navy-300';

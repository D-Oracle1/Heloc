import { useState } from 'react';
import { Eye, EyeOff, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useAppStore } from '../../data/store';
import { formatCurrency } from '../../utils/format';

interface BalanceCardProps {
  onClaim: () => void;
}

export function BalanceCard({ onClaim }: BalanceCardProps) {
  const { account } = useAppStore();
  const [hidden, setHidden] = useState(false);
  const usedPct = Math.min(
    100,
    Math.round((account.outstandingBalance / account.creditLimit) * 100),
  );

  const display = (value: number) => (hidden ? '••••••' : formatCurrency(value));

  return (
    <section
      aria-label="Available equity"
      className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white shadow-card"
    >
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-crimson-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-navy-400/30 blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/70">Available to claim</span>
          <button
            onClick={() => setHidden((h) => !h)}
            aria-label={hidden ? 'Show balance' : 'Hide balance'}
            aria-pressed={hidden}
            className="touch-target grid place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white focus-ring"
          >
            {hidden ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <p className="tabular mt-1 text-4xl font-extrabold tracking-tight sm:text-[42px]">
          {display(account.availableBalance)}
        </p>

        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
          <TrendingUp size={13} />
          {usedPct}% of {formatCurrency(account.creditLimit, { compact: true })} limit drawn
        </div>

        {/* Utilization meter */}
        <div className="mt-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-crimson-300 to-crimson-500 transition-all duration-700 ease-spring"
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-white/65">
            <span className="tabular">Outstanding {display(account.outstandingBalance)}</span>
            <span className="tabular">Limit {formatCurrency(account.creditLimit, { compact: true })}</span>
          </div>
        </div>

        <button
          onClick={onClaim}
          className="touch-target mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-base font-bold text-navy-900 shadow-lg transition-all duration-200 ease-spring hover:brightness-95 active:scale-[0.98] focus-ring"
        >
          Claim Funds
          <ArrowUpRight size={20} strokeWidth={2.4} />
        </button>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { ChevronDown, Eye, EyeOff, ArrowUpRight } from 'lucide-react';
import { useAppStore } from '../../data/store';
import { formatCurrency } from '../../utils/format';

interface BalanceCardProps {
  onClaim: () => void;
}

/** Dark balance card with a circular availability indicator. */
export function BalanceCard({ onClaim }: BalanceCardProps) {
  const { account } = useAppStore();
  const [hidden, setHidden] = useState(false);

  const availablePct = account.creditLimit
    ? Math.min(100, Math.round((account.availableBalance / account.creditLimit) * 100))
    : 0;

  const display = (value: number) => (hidden ? '••••••••' : formatCurrency(value));

  return (
    <section
      aria-label="My balance"
      className="relative overflow-hidden rounded-3xl bg-navy-900 p-6 text-white shadow-card sm:p-7"
    >
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-crimson-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-52 w-52 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background:repeating-radial-gradient(circle_at_80%_20%,#fff_0,#fff_1px,transparent_1px,transparent_22px)]" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          <Ring pct={availablePct} />
          <div className="min-w-0">
            <span className="text-sm font-medium text-white/60">My Balance</span>
            <p className="tabular mt-0.5 truncate text-[28px] font-extrabold leading-none tracking-tight sm:text-4xl">
              {display(account.availableBalance)}
            </p>
            <button
              onClick={() => setHidden((h) => !h)}
              aria-pressed={hidden}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-full text-xs font-medium text-white/55 hover:text-white/80 focus-ring"
            >
              {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
              {hidden ? 'Show balance' : 'Hide balance'}
              <ChevronDown size={13} />
            </button>
          </div>
        </div>

        <button
          onClick={onClaim}
          className="touch-target inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-base font-bold text-navy-900 shadow-lg transition-all duration-200 ease-spring hover:brightness-95 active:scale-[0.98] focus-ring sm:w-auto"
        >
          Claim Now
          <ArrowUpRight size={20} strokeWidth={2.4} />
        </button>
      </div>
    </section>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div className="relative grid h-[76px] w-[76px] shrink-0 place-items-center sm:h-[92px] sm:w-[92px]">
      <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f7c6c2" />
            <stop offset="55%" stopColor="#e8627a" />
            <stop offset="100%" stopColor="#7c5cff" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-spring"
        />
      </svg>
      <span className="tabular absolute text-sm font-bold">{pct}%</span>
    </div>
  );
}

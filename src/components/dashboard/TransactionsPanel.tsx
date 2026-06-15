import { Link } from 'react-router-dom';
import { Building2, CreditCard, Landmark, ArrowDownLeft, type LucideIcon } from 'lucide-react';
import type { Claim, ClaimMethod } from '../../types';
import { formatCurrency, relativeTime } from '../../utils/format';

const methodIcon: Record<ClaimMethod, LucideIcon> = {
  bank: Landmark,
  wire: Building2,
  card: CreditCard,
};

interface Props {
  claims: Claim[];
  onSelect: (claim: Claim) => void;
}

export function TransactionsPanel({ claims, onSelect }: Props) {
  const recent = claims.slice(0, 6);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-base font-bold text-navy-900">Transactions</h2>
          <p className="text-xs text-navy-400">Recent activity</p>
        </div>
        <Link
          to="/history"
          className="rounded-lg text-sm font-semibold text-crimson-600 hover:text-crimson-700 focus-ring"
        >
          See all
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="py-10 text-center text-sm text-navy-400">No transactions yet</p>
      ) : (
        <ul className="mt-3 divide-y divide-navy-50">
          {recent.map((claim) => {
            const incoming = claim.direction === 'in';
            const Icon = incoming ? ArrowDownLeft : methodIcon[claim.method];
            const title = incoming ? `Deposit · ${claim.source ?? 'Bank'}` : claim.destination;
            return (
              <li key={claim.id}>
                <button
                  onClick={() => onSelect(claim)}
                  className="flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:bg-navy-50/50 focus-ring rounded-xl px-1"
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                      incoming ? 'bg-emerald-50 text-emerald-600' : 'bg-navy-50 text-navy-700'
                    }`}
                  >
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-navy-900">{title}</span>
                    <span className="block text-xs text-navy-400">{relativeTime(claim.createdAt)}</span>
                  </span>
                  <span
                    className={`tabular shrink-0 text-sm font-bold ${
                      incoming ? 'text-emerald-600' : 'text-navy-900'
                    }`}
                  >
                    {incoming ? '+' : '−'}
                    {formatCurrency(claim.amount)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import { Building2, CreditCard, Landmark, type LucideIcon } from 'lucide-react';
import type { Claim, ClaimMethod } from '../../types';
import { formatCurrency, relativeTime } from '../../utils/format';
import { StatusBadge } from '../ui/StatusBadge';

const methodIcon: Record<ClaimMethod, LucideIcon> = {
  bank: Landmark,
  wire: Building2,
  card: CreditCard,
};

export function ClaimListItem({ claim, onClick }: { claim: Claim; onClick?: () => void }) {
  const Icon = methodIcon[claim.method];
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left shadow-card transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[0.99] focus-ring"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700">
        <Icon size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-semibold text-navy-900">{claim.destination}</p>
          <p className="tabular shrink-0 font-bold text-navy-900">{formatCurrency(claim.amount)}</p>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="truncate text-xs text-navy-400">
            {claim.reference} · {relativeTime(claim.createdAt)}
          </span>
          <StatusBadge status={claim.status} />
        </div>
      </div>
    </button>
  );
}

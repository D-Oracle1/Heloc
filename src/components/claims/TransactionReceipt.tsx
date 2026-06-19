import {
  Building2,
  CreditCard,
  Landmark,
  ArrowDownLeft,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import type { Claim, ClaimMethod } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { BottomSheet } from '../ui/BottomSheet';
import { StatusBadge } from '../ui/StatusBadge';

const methodIcon: Record<ClaimMethod, LucideIcon> = {
  bank: Landmark,
  wire: Building2,
  card: CreditCard,
};

const methodLabel: Record<ClaimMethod, string> = {
  bank: 'Bank transfer (ACH)',
  wire: 'Wire transfer',
  card: 'Instant to debit',
};

/** Slide-up / modal receipt for a single transaction. */
export function TransactionReceipt({ claim, onClose }: { claim: Claim | null; onClose: () => void }) {
  const incoming = claim?.direction === 'in';
  const Icon = incoming ? ArrowDownLeft : methodIcon[claim?.method ?? 'bank'];

  return (
    <BottomSheet open={!!claim} onClose={onClose} title="Receipt">
      {claim && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <span
              className={`grid h-14 w-14 place-items-center rounded-2xl ${
                incoming ? 'bg-emerald-50 text-emerald-600' : 'bg-navy-50 text-navy-700'
              }`}
            >
              <Icon size={26} />
            </span>
            <p className="mt-3 text-sm font-medium text-navy-500">
              {incoming ? `Deposit from ${claim.source ?? 'Bank'}` : `Claim to ${claim.destination}`}
            </p>
            <p
              className={`tabular mt-1 text-4xl font-extrabold tracking-tight ${
                incoming ? 'text-emerald-600' : 'text-navy-900'
              }`}
            >
              {incoming ? '+' : '−'}
              {formatCurrency(claim.amount)}
            </p>
            <div className="mt-2">
              <StatusBadge status={claim.status} />
            </div>
          </div>

          {/* Perforated divider */}
          <div className="relative flex items-center">
            <span className="absolute -left-7 h-5 w-5 rounded-full bg-navy-950/0 ring-8 ring-white" />
            <div className="w-full border-t-2 border-dashed border-navy-100" />
          </div>

          {/* Detail rows */}
          <dl className="space-y-1">
            <Row label="Reference" value={claim.reference} mono />
            <Row label="Date & time" value={formatDate(claim.createdAt, { withTime: true })} />
            <Row label="Type" value={incoming ? 'Deposit' : 'Funds claim'} />
            <Row label="Method" value={methodLabel[claim.method]} />
            {incoming ? (
              <Row label="From" value={claim.source ?? '—'} />
            ) : (
              <Row label="To" value={claim.destination} />
            )}
            {claim.note && <Row label="Note" value={claim.note} />}
          </dl>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
            <CheckCircle2 size={15} />
            American Pride Bank · transaction receipt
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-sm text-navy-500">{label}</dt>
      <dd className={`text-right text-sm font-semibold text-navy-900 ${mono ? 'tabular' : ''}`}>{value}</dd>
    </div>
  );
}

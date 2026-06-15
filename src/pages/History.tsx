import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Inbox } from 'lucide-react';
import { TopNav } from '../components/layout/TopNav';
import { PageTransition } from '../components/ui/PageTransition';
import { ClaimListItem } from '../components/claims/ClaimListItem';
import { StatusBadge } from '../components/ui/StatusBadge';
import { TransactionReceipt } from '../components/claims/TransactionReceipt';
import { useAppStore } from '../data/store';
import { formatCurrency, formatDate } from '../utils/format';
import type { Claim, ClaimStatus } from '../types';

const FILTERS: { key: ClaimStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'rejected', label: 'Rejected' },
];

export default function History() {
  const { claims } = useAppStore();
  const [filter, setFilter] = useState<ClaimStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Claim | null>(null);

  const filtered = useMemo(() => {
    return claims.filter((c) => {
      const matchesFilter = filter === 'all' || c.status === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.reference.toLowerCase().includes(q) ||
        c.destination.toLowerCase().includes(q) ||
        (c.source ?? '').toLowerCase().includes(q) ||
        (c.note ?? '').toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [claims, filter, query]);

  return (
    <PageTransition>
      <TopNav title="Transactions" subtitle={`${claims.length} total`} />

      <div className="space-y-4 px-4 py-5 lg:px-8">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-2xl border-2 border-transparent bg-white px-4 shadow-card focus-within:border-navy-300">
          <Search size={19} className="text-navy-400" />
          <input
            type="search"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by reference, source or note"
            aria-label="Search transactions"
            className="w-full bg-transparent py-3 text-navy-900 outline-none placeholder:text-navy-300"
          />
        </div>

        {/* Filter chips */}
        <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 no-scrollbar lg:mx-0 lg:px-0">
          <SlidersHorizontal size={18} className="shrink-0 text-navy-400" />
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
              className={`touch-target shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus-ring ${
                filter === key ? 'bg-navy-800 text-white shadow-card' : 'bg-white text-navy-600 hover:bg-navy-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl bg-white py-14 text-center shadow-card">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-navy-50 text-navy-400">
              <Inbox size={26} />
            </span>
            <p className="mt-3 font-semibold text-navy-800">No transactions found</p>
            <p className="mt-1 text-sm text-navy-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Mobile / tablet: compact cards */}
            <div className="space-y-2.5 lg:hidden">
              {filtered.map((claim) => (
                <ClaimListItem key={claim.id} claim={claim} onClick={() => setSelected(claim)} />
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden overflow-hidden rounded-2xl bg-white shadow-card lg:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-navy-100 bg-navy-50/50 text-xs uppercase tracking-wide text-navy-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Reference</th>
                    <th className="px-5 py-3 font-semibold">Description</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 text-right font-semibold">Amount</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50">
                  {filtered.map((claim) => {
                    const incoming = claim.direction === 'in';
                    return (
                      <tr
                        key={claim.id}
                        onClick={() => setSelected(claim)}
                        className="cursor-pointer transition-colors hover:bg-navy-50/60"
                      >
                        <td className="px-5 py-3.5 font-semibold text-navy-900">{claim.reference}</td>
                        <td className="px-5 py-3.5 text-navy-600">
                          {incoming ? `Deposit from ${claim.source ?? 'Bank'}` : claim.destination}
                        </td>
                        <td className="px-5 py-3.5 text-navy-500">{formatDate(claim.createdAt)}</td>
                        <td
                          className={`tabular px-5 py-3.5 text-right font-bold ${
                            incoming ? 'text-emerald-600' : 'text-navy-900'
                          }`}
                        >
                          {incoming ? '+' : '−'}
                          {formatCurrency(claim.amount)}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={claim.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <TransactionReceipt claim={selected} onClose={() => setSelected(null)} />
    </PageTransition>
  );
}

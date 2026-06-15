import { useState } from 'react';
import { Wallet, Percent, TrendingDown, ShieldCheck, Lock } from 'lucide-react';
import { TopNav } from '../components/layout/TopNav';
import { PageTransition } from '../components/ui/PageTransition';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { StatCard } from '../components/dashboard/StatCard';
import { TransactionsPanel } from '../components/dashboard/TransactionsPanel';
import { ClaimFundsSheet } from '../components/claims/ClaimFundsSheet';
import { PayFeeSheet } from '../components/claims/PayFeeSheet';
import { TransactionReceipt } from '../components/claims/TransactionReceipt';
import { BalanceSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import { useAppStore } from '../data/store';
import { formatCurrency } from '../utils/format';
import type { Claim } from '../types';

export default function Dashboard() {
  const { account, claims, ready } = useAppStore();
  const [claimOpen, setClaimOpen] = useState(false);
  const [feeOpen, setFeeOpen] = useState(false);
  const [selected, setSelected] = useState<Claim | null>(null);

  const locked = !account.feePaid;
  const handlePrimary = () => (locked ? setFeeOpen(true) : setClaimOpen(true));

  const deposited = claims
    .filter((c) => c.direction === 'in' && c.status === 'completed')
    .reduce((sum, c) => sum + c.amount, 0);

  const firstName = account.name.split(' ')[0];

  return (
    <PageTransition>
      <TopNav title="Earnings" subtitle={`Welcome back, ${firstName}`} />

      <div className="px-4 py-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main column */}
          <div className="space-y-6">
            {ready && locked && (
              <button
                onClick={() => setFeeOpen(true)}
                className="flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left transition-colors hover:bg-amber-100/70 focus-ring"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
                  <Lock size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-amber-900">Funds locked — action required</span>
                  <span className="block text-xs text-amber-700">
                    Pay the {formatCurrency(account.processingFee)} processing fee to release your balance.
                  </span>
                </span>
                <span className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white">Pay now</span>
              </button>
            )}

            {!ready ? <BalanceSkeleton /> : <BalanceCard onClaim={handlePrimary} />}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {!ready ? (
                <>
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </>
              ) : (
                <>
                  <StatCard
                    label="Available"
                    value={formatCurrency(account.availableBalance, { compact: true })}
                    icon={Wallet}
                    tone="emerald"
                  />
                  <StatCard
                    label="Total deposited"
                    value={formatCurrency(deposited, { compact: true })}
                    icon={ShieldCheck}
                    tone="sky"
                  />
                  <StatCard
                    label="Outstanding"
                    value={formatCurrency(account.outstandingBalance, { compact: true })}
                    icon={TrendingDown}
                    tone="rose"
                  />
                  <StatCard label="Current APR" value={`${account.apr}%`} icon={Percent} tone="amber" hint="Variable rate" />
                </>
              )}
            </div>
          </div>

          {/* Transactions column (stacks below on mobile) */}
          <aside>
            {!ready ? (
              <div className="rounded-3xl bg-white p-5 shadow-card">
                <CardSkeleton />
                <div className="mt-3 space-y-3">
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              </div>
            ) : (
              <TransactionsPanel claims={claims} onSelect={setSelected} />
            )}
          </aside>
        </div>
      </div>

      <ClaimFundsSheet open={claimOpen} onClose={() => setClaimOpen(false)} />
      <PayFeeSheet open={feeOpen} onClose={() => setFeeOpen(false)} />
      <TransactionReceipt claim={selected} onClose={() => setSelected(null)} />
    </PageTransition>
  );
}

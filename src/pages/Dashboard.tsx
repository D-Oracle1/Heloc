import { useState } from 'react';
import { Wallet, Percent, TrendingDown, ShieldCheck } from 'lucide-react';
import { TopNav } from '../components/layout/TopNav';
import { PageTransition } from '../components/ui/PageTransition';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { StatCard } from '../components/dashboard/StatCard';
import { TransactionsPanel } from '../components/dashboard/TransactionsPanel';
import { ClaimFundsSheet } from '../components/claims/ClaimFundsSheet';
import { TransactionReceipt } from '../components/claims/TransactionReceipt';
import { BalanceSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import { useAppStore } from '../data/store';
import { formatCurrency } from '../utils/format';
import type { Claim } from '../types';

export default function Dashboard() {
  const { account, claims, ready } = useAppStore();
  const [claimOpen, setClaimOpen] = useState(false);
  const [selected, setSelected] = useState<Claim | null>(null);

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
          <div className="min-w-0 space-y-6">
            {!ready ? <BalanceSkeleton /> : <BalanceCard onClaim={() => setClaimOpen(true)} />}

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
          <aside className="min-w-0">
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
      <TransactionReceipt claim={selected} onClose={() => setSelected(null)} />
    </PageTransition>
  );
}

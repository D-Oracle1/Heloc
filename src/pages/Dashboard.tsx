import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Percent, Receipt, ShieldCheck, ArrowRight } from 'lucide-react';
import { TopNav } from '../components/layout/TopNav';
import { PageTransition } from '../components/ui/PageTransition';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { StatCard } from '../components/dashboard/StatCard';
import { ClaimListItem } from '../components/claims/ClaimListItem';
import { ClaimFundsSheet } from '../components/claims/ClaimFundsSheet';
import { BalanceSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import { useAppStore } from '../data/store';
import { formatCurrency } from '../utils/format';

export default function Dashboard() {
  const { account, claims } = useAppStore();
  const [claimOpen, setClaimOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  const recent = claims.slice(0, 3);
  const completedTotal = claims
    .filter((c) => c.status === 'completed')
    .reduce((sum, c) => sum + c.amount, 0);

  const firstName = account.name.split(' ')[0];

  return (
    <PageTransition>
      <TopNav title={`Hi, ${firstName}`} subtitle="Welcome back to your equity hub" />

      <div className="space-y-6 px-4 py-5 lg:px-8">
        {loading ? <BalanceSkeleton /> : <BalanceCard onClaim={() => setClaimOpen(true)} />}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                label="Credit limit"
                value={formatCurrency(account.creditLimit, { compact: true })}
                icon={ShieldCheck}
                accent="navy"
              />
              <StatCard
                label="Current APR"
                value={`${account.apr}%`}
                icon={Percent}
                accent="crimson"
                hint="Variable rate"
              />
              <StatCard
                label="Total claimed"
                value={formatCurrency(completedTotal, { compact: true })}
                icon={Receipt}
                accent="emerald"
              />
              <StatCard
                label="Open claims"
                value={String(claims.filter((c) => c.status !== 'completed' && c.status !== 'rejected').length)}
                icon={Receipt}
                accent="navy"
              />
            </>
          )}
        </div>

        {/* Recent activity */}
        <section aria-label="Recent activity">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900">Recent activity</h2>
            <Link
              to="/history"
              className="inline-flex items-center gap-1 text-sm font-semibold text-crimson-600 hover:text-crimson-700 focus-ring rounded-lg"
            >
              See all <ArrowRight size={15} />
            </Link>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              recent.map((claim) => <ClaimListItem key={claim.id} claim={claim} />)
            )}
          </div>
        </section>
      </div>

      <ClaimFundsSheet open={claimOpen} onClose={() => setClaimOpen(false)} />
    </PageTransition>
  );
}

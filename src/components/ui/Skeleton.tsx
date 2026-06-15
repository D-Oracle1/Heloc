interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card" aria-hidden>
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}

export function BalanceSkeleton() {
  return (
    <div className="rounded-3xl bg-navy-800 p-6 shadow-card" aria-hidden>
      <Skeleton className="h-3 w-24 bg-white/20" />
      <Skeleton className="mt-4 h-9 w-48 bg-white/25" />
      <Skeleton className="mt-6 h-3 w-full bg-white/15" />
      <div className="mt-6 flex gap-3">
        <Skeleton className="h-12 flex-1 rounded-2xl bg-white/20" />
        <Skeleton className="h-12 flex-1 rounded-2xl bg-white/20" />
      </div>
    </div>
  );
}

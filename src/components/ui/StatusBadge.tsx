import type { ClaimStatus } from '../../types';

const config: Record<ClaimStatus, { label: string; className: string; dot: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  approved: { label: 'Approved', className: 'bg-navy-50 text-navy-700', dot: 'bg-navy-500' },
  processing: { label: 'Processing', className: 'bg-sky-50 text-sky-700', dot: 'bg-sky-500' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', className: 'bg-crimson-50 text-crimson-700', dot: 'bg-crimson-500' },
};

export function StatusBadge({ status }: { status: ClaimStatus }) {
  const { label, className, dot } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot} ${status === 'processing' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}

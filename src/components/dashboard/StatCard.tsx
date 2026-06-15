import type { LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: 'navy' | 'crimson' | 'emerald';
  hint?: string;
}

const accents = {
  navy: 'bg-navy-50 text-navy-700',
  crimson: 'bg-crimson-50 text-crimson-600',
  emerald: 'bg-emerald-50 text-emerald-600',
};

export function StatCard({ label, value, icon: Icon, accent = 'navy', hint }: StatCardProps) {
  return (
    <Card className="p-4">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${accents[accent]}`}>
        <Icon size={20} />
      </span>
      <p className="mt-3 text-xs font-medium text-navy-500">{label}</p>
      <p className="tabular mt-0.5 text-xl font-bold text-navy-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-navy-400">{hint}</p>}
    </Card>
  );
}

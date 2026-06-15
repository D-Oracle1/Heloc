import type { LucideIcon } from 'lucide-react';

type Tone = 'amber' | 'sky' | 'rose' | 'emerald' | 'violet' | 'navy';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
}

const tones: Record<Tone, { card: string; chip: string }> = {
  amber: { card: 'bg-amber-50', chip: 'bg-amber-100 text-amber-700' },
  sky: { card: 'bg-sky-50', chip: 'bg-sky-100 text-sky-700' },
  rose: { card: 'bg-rose-50', chip: 'bg-rose-100 text-rose-600' },
  emerald: { card: 'bg-emerald-50', chip: 'bg-emerald-100 text-emerald-700' },
  violet: { card: 'bg-violet-50', chip: 'bg-violet-100 text-violet-700' },
  navy: { card: 'bg-navy-50', chip: 'bg-navy-100 text-navy-700' },
};

export function StatCard({ label, value, icon: Icon, tone = 'navy', hint }: StatCardProps) {
  const t = tones[tone];
  return (
    <div className={`rounded-2xl p-4 ${t.card}`}>
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${t.chip}`}>
        <Icon size={18} />
      </span>
      <p className="tabular mt-3 text-xl font-extrabold text-navy-900">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-navy-500">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-navy-400">{hint}</p>}
    </div>
  );
}

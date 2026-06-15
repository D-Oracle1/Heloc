import { Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../data/store';
import { Logo } from '../ui/Logo';

interface TopNavProps {
  title: string;
  subtitle?: string;
}

/** Sticky top navigation bar with branding and quick actions. */
export function TopNav({ title, subtitle }: TopNavProps) {
  const { account } = useAppStore();

  return (
    <header className="sticky top-0 z-20 border-b border-navy-100/70 bg-surface/85 pt-safe backdrop-blur-lg">
      <div className="app-container flex items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <div className="flex items-center gap-2.5">
          <Logo mark className="h-9 lg:hidden" />
          <div>
            <h1 className="text-lg font-extrabold leading-tight tracking-tight text-navy-900">{title}</h1>
            {subtitle && <p className="text-xs text-navy-500">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="Notifications"
            className="touch-target relative grid place-items-center rounded-full text-navy-500 hover:bg-navy-100/60 hover:text-navy-800 focus-ring"
          >
            <Bell size={21} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-crimson-500 ring-2 ring-surface" />
          </button>
          <Link
            to="/profile"
            aria-label="Account & profile"
            className="grid h-9 w-9 place-items-center rounded-full bg-navy-800 text-xs font-bold text-white transition-transform hover:scale-105 active:scale-95 focus-ring"
          >
            {account.avatarInitials || <User size={18} />}
          </Link>
        </div>
      </div>
    </header>
  );
}

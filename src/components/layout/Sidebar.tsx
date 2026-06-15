import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { NAV_ITEMS } from './navItems';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

/** Collapsible left sidebar — the navigation surface on tablet & desktop. */
export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <motion.aside
      aria-label="Primary"
      animate={{ width: collapsed ? 84 : 248 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-navy-100 bg-white px-3 py-5 lg:flex"
    >
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-1`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-sm font-extrabold text-white">
              H
            </span>
            <span className="text-lg font-extrabold tracking-tight text-navy-900">HELOC</span>
          </div>
        )}
        {collapsed && (
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-sm font-extrabold text-white">
            H
          </span>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="touch-target grid place-items-center rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-700 focus-ring"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={onToggle}
          aria-label="Expand sidebar"
          className="touch-target mx-auto mt-3 grid place-items-center rounded-lg text-navy-400 hover:bg-navy-50 hover:text-navy-700 focus-ring"
        >
          <ChevronLeft size={20} className="rotate-180" />
        </button>
      )}

      <nav className="mt-6 flex-1">
        <ul className="space-y-1.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                title={label}
                className={({ isActive }) =>
                  `group relative flex touch-target items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition-colors focus-ring ${
                    isActive
                      ? 'bg-navy-800 text-white shadow-card'
                      : 'text-navy-500 hover:bg-navy-50 hover:text-navy-800'
                  } ${collapsed ? 'justify-center' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={21} strokeWidth={isActive ? 2.3 : 1.9} className="shrink-0" />
                    {!collapsed && <span className="text-[15px]">{label}</span>}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className={`mt-auto flex items-center gap-2 rounded-xl bg-navy-50 p-3 text-navy-600 ${
          collapsed ? 'justify-center' : ''
        }`}
      >
        <ShieldCheck size={20} className="shrink-0 text-emerald-600" />
        {!collapsed && <span className="text-xs font-medium leading-tight">Bank-grade encryption active</span>}
      </div>
    </motion.aside>
  );
}

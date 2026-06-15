import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from './navItems';

/** Fixed bottom navigation — the primary navigation surface on mobile. */
export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-navy-100 bg-white/90 pb-safe backdrop-blur-lg shadow-nav lg:hidden"
    >
      <ul className="app-container flex items-stretch justify-around px-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className="touch-target group relative flex flex-col items-center justify-center gap-1 py-2.5 focus-ring"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="bottom-nav-active"
                      className="absolute -top-px h-0.5 w-8 rounded-full bg-crimson-500"
                      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                    />
                  )}
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.4 : 1.9}
                    className={isActive ? 'text-navy-800' : 'text-navy-400 group-hover:text-navy-600'}
                  />
                  <span
                    className={`text-[11px] font-medium ${
                      isActive ? 'text-navy-800' : 'text-navy-400 group-hover:text-navy-600'
                    }`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

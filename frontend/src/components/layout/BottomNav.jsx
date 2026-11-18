import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Flame, CheckSquare, Timer, Menu } from 'lucide-react';

const MAIN_NAV = [
  { path: '/', icon: LayoutDashboard, label: 'Inicio' },
  { path: '/habits', icon: Flame, label: 'Hábitos' },
  { path: '/tasks', icon: CheckSquare, label: 'Tareas' },
  { path: '/focus', icon: Timer, label: 'Focus' },
];

export default function BottomNav({ onOpenMenu }) {
  const location = useLocation();
  const isMainTab = MAIN_NAV.some(item => item.path === location.pathname);

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 z-40 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-1 h-16">
        {MAIN_NAV.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Menu button to open the full Drawer */}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menú completo"
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 rounded-xl transition-all active:scale-95 ${
            !isMainTab
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <div className={`relative p-1 rounded-xl transition-all ${!isMainTab ? 'bg-indigo-50 dark:bg-indigo-950/60' : ''}`}>
            <Menu className="w-5 h-5" />
            {!isMainTab && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight truncate">Más</span>
        </button>
      </div>
    </nav>
  );
}

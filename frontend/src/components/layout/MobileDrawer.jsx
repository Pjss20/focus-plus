import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  X, LayoutDashboard, Flame, CheckSquare, Target, GraduationCap, Calendar,
  Clock, Timer, BarChart2, Trophy, StickyNote, User, LogOut, Sun, Moon, Zap, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../ui/Avatar';

const SECTIONS = [
  {
    title: 'Principal',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Inicio' },
      { path: '/habits', icon: Flame, label: 'Mis hábitos' },
      { path: '/tasks', icon: CheckSquare, label: 'Mis tareas' },
      { path: '/goals', icon: Target, label: 'Mis objetivos' },
    ]
  },
  {
    title: 'Estudio & Tiempo',
    items: [
      { path: '/academic', icon: GraduationCap, label: 'Espacio académico' },
      { path: '/calendar', icon: Calendar, label: 'Calendario' },
      { path: '/planner', icon: Clock, label: 'Planificador diario' },
      { path: '/focus', icon: Timer, label: 'Temporizador Pomodoro' },
    ]
  },
  {
    title: 'Progreso & Notas',
    items: [
      { path: '/statistics', icon: BarChart2, label: 'Estadísticas' },
      { path: '/achievements', icon: Trophy, label: 'Logros' },
      { path: '/notes', icon: StickyNote, label: 'Notas' },
      { path: '/profile', icon: User, label: 'Mi perfil & Ajustes' },
    ]
  }
];

export default function MobileDrawer({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        aria-hidden="true"
      />

      {/* Drawer content */}
      <aside className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col z-10 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                FOCUS+
              </span>
              <span className="block text-[10px] text-gray-400 font-medium">Móvil</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-4 mx-3 my-2.5 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100/80 dark:border-indigo-900/40 rounded-2xl flex items-center gap-3">
            <Avatar name={user.name} src={user.avatar_url} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100/70 dark:bg-indigo-900/60 px-1.5 py-0.5 rounded-md">
                  Nivel {user.level || 1}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {user.experience_points || 0} XP
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {section.title}
              </p>
              <nav className="space-y-0.5">
                {section.items.map(({ path, icon: Icon, label }) => (
                  <NavLink
                    key={path}
                    to={path}
                    end={path === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.99]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 opacity-60" />
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1 bg-gray-50/50 dark:bg-gray-900/50">
          <button
            onClick={toggle}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
              <span>{isDark ? 'Tema Claro' : 'Tema Oscuro'}</span>
            </div>
            <span className="text-xs text-gray-400 font-normal">{isDark ? 'Activado' : 'Desactivado'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </div>
  );
}

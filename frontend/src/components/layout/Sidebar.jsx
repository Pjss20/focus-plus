import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Flame, CheckSquare, Target, GraduationCap, Calendar,
  Clock, Timer, BarChart2, Trophy, StickyNote, User, LogOut, Sun, Moon,
  ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../ui/Avatar';

const NAV = [
  { path: '/', icon: LayoutDashboard, label: 'Inicio' },
  { path: '/habits', icon: Flame, label: 'Mis hábitos' },
  { path: '/tasks', icon: CheckSquare, label: 'Mis tareas' },
  { path: '/goals', icon: Target, label: 'Mis objetivos' },
  { path: '/academic', icon: GraduationCap, label: 'Espacio académico' },
  { path: '/calendar', icon: Calendar, label: 'Calendario' },
  { path: '/planner', icon: Clock, label: 'Planificador' },
  { path: '/focus', icon: Timer, label: 'Temporizador' },
  { path: '/statistics', icon: BarChart2, label: 'Estadísticas' },
  { path: '/achievements', icon: Trophy, label: 'Logros' },
  { path: '/notes', icon: StickyNote, label: 'Notas' },
  { path: '/profile', icon: User, label: 'Perfil' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { toggle, isDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className={`hidden md:flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} flex-shrink-0`}>
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 h-16 border-b border-gray-100 dark:border-gray-800`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">FOCUS+</span>
          </div>
        )}
        {collapsed && <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center"><Zap className="w-4 h-4 text-white" /></div>}
        <button onClick={() => setCollapsed(!collapsed)} className={`${collapsed ? 'hidden' : ''} p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}>
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path} end={path === '/'}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? label : ''}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: theme + user */}
      <div className={`p-3 border-t border-gray-100 dark:border-gray-800 space-y-1`}>
        <button onClick={toggle} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${collapsed ? 'justify-center' : ''}`}>
          {isDark ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
          {!collapsed && <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>}
        </button>
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <Avatar name={user.name} src={user.avatar_url} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
            <button onClick={handleLogout} title="Cerrar sesión" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
        {collapsed && (
          <button onClick={handleLogout} title="Cerrar sesión" className="w-full flex items-center justify-center p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
}

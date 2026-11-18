import { Menu, Sun, Moon, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../ui/Avatar';

export default function MobileHeader({ onOpenMenu }) {
  const { user } = useAuth();
  const { isDark, toggle } = useTheme();

  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenMenu}
          aria-label="Abrir menú de navegación"
          className="p-2 -ml-1 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            FOCUS+
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={toggle}
          aria-label="Alternar tema"
          className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
        {user && (
          <Link to="/profile" className="ml-1 p-0.5 rounded-full hover:ring-2 hover:ring-indigo-500/50 transition-all">
            <Avatar name={user.name} src={user.avatar_url} size="sm" />
          </Link>
        )}
      </div>
    </header>
  );
}

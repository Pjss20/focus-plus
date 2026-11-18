import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from '../../utils/formatters';
export default function StatCard({ icon: Icon, label, value, change, color = 'indigo', className }) {
  const colors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  };
  return (
    <div className={clsx('bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3.5 sm:p-5 shadow-sm', className)}>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className={clsx('w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center', colors[color] || colors.indigo)}>
          {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>
        {change !== undefined && (
          <span className={clsx('flex items-center gap-1 text-[11px] sm:text-xs font-medium', change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400')}>
            {change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{label}</p>
    </div>
  );
}

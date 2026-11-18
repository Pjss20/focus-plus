import { clsx } from '../../utils/formatters';
export default function ProgressBar({ value = 0, max = 100, color = 'indigo', label, showPercent, className }) {
  const pct = Math.min(100, Math.round((value / (max || 1)) * 100));
  const colors = { indigo: 'bg-indigo-600', emerald: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-red-500', blue: 'bg-blue-500', purple: 'bg-purple-500' };
  return (
    <div className={clsx('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>}
          {showPercent && <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{pct}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
        <div className={clsx('h-2 rounded-full transition-all duration-500', colors[color] || 'bg-indigo-600')} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

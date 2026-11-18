import { Flame } from 'lucide-react';
export default function StreakBadge({ count, best }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full">
        <Flame className="w-4 h-4" />
        <span className="text-sm font-bold">{count}</span>
        <span className="text-xs">días</span>
      </div>
      {best !== undefined && best > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Mejor: <span className="font-semibold text-gray-700 dark:text-gray-300">{best}</span>
        </div>
      )}
    </div>
  );
}

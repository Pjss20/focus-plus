import { Trophy, Lock, Star, Zap } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { getAchievements } from '../../services/achievements.service';
import { formatDate } from '../../utils/dateHelpers';
import Spinner from '../ui/Spinner';

const RARITY_STYLES = {
  common:    { label: 'Común',     bg: 'bg-gray-100 dark:bg-gray-800',     text: 'text-gray-600 dark:text-gray-400',   glow: '' },
  rare:      { label: 'Raro',      bg: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-600 dark:text-blue-400',   glow: 'shadow-blue-200 dark:shadow-blue-900' },
  epic:      { label: 'Épico',     bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', glow: 'shadow-purple-200 dark:shadow-purple-900' },
  legendary: { label: 'Legendario', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', glow: 'shadow-amber-200 dark:shadow-amber-900' },
};

export default function AchievementsPage() {
  const { data, loading } = useApi(getAchievements, []);
  const achievements = data || [];

  const unlocked = achievements.filter(a => a.unlocked_at);
  const locked = achievements.filter(a => !a.unlocked_at);
  const totalPoints = unlocked.reduce((acc, a) => acc + (a.points || 0), 0);

  if (loading) return <div className="flex-1 flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Logros</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{unlocked.length} desbloqueados de {achievements.length}</p>
      </div>

      {/* Points summary */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-2.5 sm:p-4 text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{totalPoints}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Puntos totales</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-2.5 sm:p-4 text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{unlocked.length}</p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Desbloqueados</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-2.5 sm:p-4 text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{Math.round((unlocked.length / (achievements.length || 1)) * 100)}%</p>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Completado</p>
        </div>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">🏆 Desbloqueados</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {unlocked.map(ach => {
              const rarity = RARITY_STYLES[ach.rarity] || RARITY_STYLES.common;
              return (
                <div key={ach.id} className={`${rarity.bg} rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center shadow-md ${rarity.glow}`}>
                  <div className="text-3xl mb-2">{ach.icon || '🏅'}</div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{ach.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{ach.description}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white dark:bg-gray-900 ${rarity.text}`}>{rarity.label}</span>
                    <span className="text-xs text-amber-500 font-medium">+{ach.points}pts</span>
                  </div>
                  {ach.unlocked_at && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(ach.unlocked_at)}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">🔒 Por desbloquear</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {locked.map(ach => (
              <div key={ach.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center opacity-60">
                <div className="text-3xl mb-2 grayscale">{ach.icon || '🏅'}</div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-0.5">{ach.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">{ach.description}</p>
                <div className="flex items-center justify-center gap-1 text-gray-400 dark:text-gray-600">
                  <Lock className="w-3 h-3" />
                  <span className="text-xs">+{ach.points}pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {achievements.length === 0 && (
        <div className="text-center py-16">
          <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Los logros aparecerán aquí cuando los desbloquees</p>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { BarChart2, Flame, CheckSquare, Timer, Target } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApi } from '../../hooks/useApi';
import { getStats } from '../../services/statistics.service';
import StatCard from '../ui/StatCard';
import StreakBadge from '../ui/StreakBadge';
import Spinner from '../ui/Spinner';
import { formatDuration } from '../../utils/formatters';

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: '3months', label: 'Últimos 3 meses' },
];

const PIE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

export default function StatisticsPage() {
  const [period, setPeriod] = useState('month');
  const { data: stats, loading } = useApi(() => getStats(period), [period]);

  if (loading) return <div className="flex-1 flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const habitData = stats?.habits?.daily_completion || [];
  const focusData = stats?.focus?.by_day || [];
  const tasksByCat = stats?.tasks?.by_category || [];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Estadísticas</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Tu rendimiento y progreso real</p>
        </div>
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto">
          {PERIOD_OPTIONS.map(({ value, label }) => (
            <button key={value} onClick={() => setPeriod(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === value ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Flame} label="Hábitos completados" value={stats?.habits?.completed_count || 0} color="amber" />
        <StatCard icon={CheckSquare} label="Tareas terminadas" value={stats?.tasks?.completed_count || 0} color="emerald" />
        <StatCard icon={Timer} label="Tiempo de foco" value={formatDuration(stats?.focus?.total_minutes || 0)} color="indigo" />
        <StatCard icon={Target} label="Objetivos logrados" value={stats?.goals?.completed_count || 0} color="purple" />
      </div>

      {/* Streaks */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Rachas</h2>
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Racha actual</p>
            <StreakBadge count={stats?.habits?.current_streak || 0} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Mejor racha</p>
            <StreakBadge count={stats?.habits?.best_streak || 0} />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">% Cumplimiento hábitos</p>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats?.habits?.completion_rate || 0}%</span>
          </div>
        </div>
      </div>

      {/* Habit completion chart */}
      {habitData.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Cumplimiento de hábitos (diario)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={habitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={d => d?.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} domain={[0, 100]} unit="%" />
              <Tooltip formatter={v => [`${v}%`, 'Cumplimiento']} />
              <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Focus time by day */}
        {focusData.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Tiempo de concentración</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={focusData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} unit="min" />
                <Tooltip formatter={v => [`${v} min`, 'Foco']} />
                <Bar dataKey="minutes" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tasks by category */}
        {tasksByCat.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Tareas por categoría</h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={tasksByCat} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {tasksByCat.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* No data */}
      {!stats && (
        <div className="text-center py-16">
          <BarChart2 className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Empieza a registrar actividades para ver tus estadísticas</p>
        </div>
      )}
    </div>
  );
}

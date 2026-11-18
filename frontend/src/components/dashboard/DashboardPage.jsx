import { useState, useEffect, useCallback } from 'react';
import { Flame, CheckSquare, Target, Timer } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getGreeting } from '../../utils/dateHelpers';
import { formatDuration, percentage } from '../../utils/formatters';
import StatCard from '../ui/StatCard';
import ProgressBar from '../ui/ProgressBar';
import Spinner from '../ui/Spinner';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats]   = useState(null);
  const [habits, setHabits] = useState([]);
  const [tasks,  setTasks]  = useState([]);
  const [goals,  setGoals]  = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, hRes, tRes, gRes] = await Promise.all([
        api.get('/statistics'),
        api.get('/habits'),
        api.get('/tasks', { params: { status: 'pending', sort: 'due_date', limit: 5 } }),
        api.get('/goals', { params: { status: 'active', limit: 4 } }),
      ]);
      setStats(sRes.data.data);
      setHabits(hRes.data.data || []);
      setTasks(tRes.data.data || []);
      setGoals(gRes.data.data || []);
    } catch { toast.error('Error al cargar el dashboard'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleHabit = async (habit) => {
    try {
      if (habit.completed_today) await api.delete(`/habits/${habit.id}/complete`);
      else await api.post(`/habits/${habit.id}/complete`);
      setHabits(hs => hs.map(h => h.id === habit.id ? { ...h, completed_today: !h.completed_today } : h));
    } catch (err) { toast.error(err?.response?.data?.message || 'Error'); }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const today = format(new Date(), "EEEE d 'de' MMMM", { locale: es });
  const todayHabits = habits.filter(h => h.is_active);
  const completedToday = todayHabits.filter(h => h.completed_today).length;
  const weekData = stats?.weekly_activity || [];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">{today}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Flame} label="Hábitos hoy" value={`${completedToday}/${todayHabits.length}`} color="amber" />
        <StatCard icon={CheckSquare} label="Tareas pendientes" value={stats?.tasks?.pending || 0} color="blue" />
        <StatCard icon={Flame} label="Racha actual" value={`${stats?.habits?.current_streak || 0} días`} color="indigo" />
        <StatCard icon={Timer} label="Foco hoy" value={formatDuration(stats?.focus?.today_minutes || 0)} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Hábitos de hoy</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">{completedToday}/{todayHabits.length}</span>
          </div>
          {todayHabits.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No tienes hábitos activos</p>
          ) : (
            <div className="space-y-2">
              {todayHabits.slice(0, 6).map(habit => (
                <div key={habit.id} className="flex items-center gap-3">
                  <button onClick={() => toggleHabit(habit)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${habit.completed_today ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'}`}>
                    {habit.completed_today && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  <p className={`text-sm font-medium truncate flex-1 ${habit.completed_today ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{habit.name}</p>
                  {habit.current_streak > 0 && <span className="flex items-center gap-0.5 text-xs text-orange-500 font-medium flex-shrink-0"><Flame className="w-3 h-3" /> {habit.current_streak}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Tareas próximas</h2>
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">Sin tareas pendientes</p>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${task.priority === 'urgent' ? 'bg-red-500' : task.priority === 'high' ? 'bg-amber-500' : task.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{task.title}</p>
                    {task.due_date && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{format(new Date(task.due_date), 'd MMM', { locale: es })}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Objetivos activos</h2>
          {goals.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No tienes objetivos activos</p>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 4).map(goal => (
                <div key={goal.id}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[70%]">{goal.title}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {goal.type === 'quantifiable' ? `${goal.current_value}/${goal.target_value} ${goal.unit || ''}` : `${percentage(goal.current_value, goal.target_value)}%`}
                    </span>
                  </div>
                  <ProgressBar value={goal.current_value} max={goal.target_value || 100} color="indigo" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {weekData.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Progreso semanal</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} domain={[0, 100]} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, 'Cumplimiento']} />
              <Bar dataKey="completion_rate" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

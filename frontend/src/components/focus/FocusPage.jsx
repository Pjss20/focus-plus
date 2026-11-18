import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Timer, Coffee, Moon, Link as LinkIcon } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';
import { useApi } from '../../hooks/useApi';
import { getFocusSessions, createSession, updateSession } from '../../services/focus.service';
import { getTasks } from '../../services/tasks.service';
import { formatDuration } from '../../utils/formatters';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import toast from 'react-hot-toast';
import api from '../../services/api';

const MODES = [
  { key: 'focus', label: 'Concentración', icon: Timer, color: '#6366F1' },
  { key: 'short_break', label: 'Descanso corto', icon: Coffee, color: '#10B981' },
  { key: 'long_break', label: 'Descanso largo', icon: Moon, color: '#8B5CF6' },
];

export default function FocusPage() {
  const [settings, setSettings] = useState({ workMinutes: 25, shortBreak: 5, longBreak: 15, cycles: 4 });
  const [linkedTask, setLinkedTask] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const { data: tasks } = useApi(() => getTasks({ status: 'pending' }), []);
  const { data: sessions, loading: loadSessions, refetch: refetchSessions } = useApi(getFocusSessions, []);
  const sessionStartRef = useRef(null);

  const onComplete = async (completedMode) => {
    if (currentSessionId) {
      try {
        await updateSession(currentSessionId, { is_completed: true, ended_at: new Date().toISOString() });
        refetchSessions();
        toast.success(completedMode === 'focus' ? '¡Sesión completada! 🎉' : '¡Descanso terminado!');
      } catch { /* ignore */ }
      setCurrentSessionId(null);
    }
  };

  const { mode, isRunning, timeLeft, totalSeconds, cycleCount, start, pause, reset, skip, changeMode } = useTimer({ ...settings, onComplete });

  const handleStart = async () => {
    if (!isRunning && mode === 'focus' && !currentSessionId) {
      try {
        const res = await createSession({
          task_id: linkedTask || null,
          duration_minutes: settings.workMinutes,
          type: 'focus',
          started_at: new Date().toISOString(),
        });
        setCurrentSessionId(res.data.id);
      } catch { /* ignore */ }
    }
    start();
  };

  const handlePause = () => pause();
  const handleReset = () => { reset(); setCurrentSessionId(null); };

  const circumference = 2 * Math.PI * 90;
  const progress = timeLeft / totalSeconds;
  const offset = circumference * (1 - progress);

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  const modeInfo = MODES.find(m => m.key === mode);

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Temporizador Pomodoro</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Sesión {cycleCount + 1} · Mantén el foco</p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 justify-center mb-8">
        {MODES.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => changeMode(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${mode === key ? 'text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
            style={mode === key ? { backgroundColor: modeInfo.color } : {}}>
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <svg width="220" height="220" className="-rotate-90">
            <circle cx="110" cy="110" r="90" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-800" />
            <circle cx="110" cy="110" r="90" fill="none" stroke={modeInfo.color} strokeWidth="8"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
              className="transition-all duration-1000 ease-linear" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold tabular-nums text-gray-900 dark:text-white">{minutes}:{seconds}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">{modeInfo.label}</span>
            {isRunning && <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button onClick={handleReset} className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <RotateCcw className="w-5 h-5" />
        </button>
        <button onClick={isRunning ? handlePause : handleStart}
          className="w-16 h-16 rounded-2xl text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ backgroundColor: modeInfo.color }}>
          {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
        </button>
        <button onClick={skip} className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Link task */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <LinkIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vincular tarea</span>
        </div>
        <select value={linkedTask} onChange={e => setLinkedTask(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Sin tarea vinculada</option>
          {(tasks || []).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </div>

      {/* Pomodoro settings */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Configuración</h3>
        <div className="grid grid-cols-3 gap-3">
          {[['workMinutes','Concentración','min'],['shortBreak','Descanso corto','min'],['longBreak','Descanso largo','min']].map(([key, label, unit]) => (
            <div key={key}>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
              <div className="flex items-center gap-1">
                <input type="number" min={1} max={120} value={settings[key]}
                  onChange={e => setSettings(s => ({ ...s, [key]: parseInt(e.target.value) || 1 }))}
                  className="w-full px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <span className="text-xs text-gray-500 flex-shrink-0">{unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent sessions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Sesiones recientes</h3>
        {loadSessions ? <div className="flex justify-center py-4"><Spinner /></div> :
          (sessions || []).length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No hay sesiones registradas aún</p>
          ) : (
            <div className="space-y-2">
              {(sessions || []).slice(0, 8).map(s => (
                <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.is_completed ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{s.type === 'focus' ? 'Concentración' : s.type === 'short_break' ? 'Descanso corto' : 'Descanso largo'}</p>
                    {s.task_title && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">📌 {s.task_title}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatDuration(s.duration_minutes)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{s.started_at ? format(new Date(s.started_at), 'dd/MM HH:mm') : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

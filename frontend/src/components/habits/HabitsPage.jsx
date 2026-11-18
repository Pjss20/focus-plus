import { useState, useCallback } from 'react';
import { Plus, Flame, MoreVertical, Check, Pause, Play, Trash2, Edit2, Calendar } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { getHabits, createHabit, updateHabit, deleteHabit, completeHabit, uncompleteHabit } from '../../services/habits.service';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import { CATEGORIES, COLORS } from '../../utils/constants';
import toast from 'react-hot-toast';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function HabitForm({ habit, onSave, onClose }) {
  const [form, setForm] = useState({
    name: habit?.name || '',
    description: habit?.description || '',
    category_id: habit?.category_id || '',
    frequency: habit?.frequency || 'daily',
    custom_days: habit?.custom_days || [],
    reminder_time: habit?.reminder_time || '',
    color: habit?.color || '#6366F1',
  });
  const [loading, setLoading] = useState(false);

  const toggleDay = (i) => {
    setForm(f => ({ ...f, custom_days: f.custom_days.includes(i) ? f.custom_days.filter(d => d !== i) : [...f.custom_days, i] }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return; }
    setLoading(true);
    try {
      const payload = { ...form, category_id: form.category_id || null };
      if (habit?.id) await updateHabit(habit.id, payload);
      else await createHabit(payload);
      onSave();
      onClose();
      toast.success(habit?.id ? 'Hábito actualizado' : 'Hábito creado');
    } catch (err) { toast.error(err?.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <Input label="Nombre del hábito *" placeholder="Ej: Leer 30 minutos" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      <Textarea label="Descripción" placeholder="¿Por qué quieres este hábito?" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      <Select label="Categoría" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
        <option value="">Sin categoría</option>
        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </Select>
      <Select label="Frecuencia" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
        <option value="daily">Diario</option>
        <option value="custom">Días específicos</option>
      </Select>
      {form.frequency === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Días de la semana</label>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((d, i) => (
              <button key={i} type="button" onClick={() => toggleDay(i + 1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.custom_days.includes(i + 1) ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
      <Input label="Recordatorio" type="time" value={form.reminder_time} onChange={e => setForm(f => ({ ...f, reminder_time: e.target.value }))} />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.slice(0, 8).map(c => (
            <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
              className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900 scale-110' : ''}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} loading={loading}>{habit?.id ? 'Actualizar' : 'Crear hábito'}</Button>
      </div>
    </div>
  );
}

export default function HabitsPage() {
  const { data, loading, refetch } = useApi(getHabits, []);
  const habits = data || [];
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null); // null | 'create' | habit object
  const [menuOpen, setMenuOpen] = useState(null);

  const filtered = habits.filter(h => filter === 'all' ? true : filter === 'active' ? h.is_active : !h.is_active);

  const toggle = async (habit) => {
    try {
      if (habit.completed_today) await uncompleteHabit(habit.id);
      else await completeHabit(habit.id);
      refetch();
    } catch (err) { toast.error(err?.response?.data?.message || 'Error'); }
  };

  const toggleActive = async (habit) => {
    try {
      await updateHabit(habit.id, { is_active: !habit.is_active });
      refetch();
      toast.success(habit.is_active ? 'Hábito pausado' : 'Hábito reactivado');
    } catch { toast.error('Error'); }
    setMenuOpen(null);
  };

  const remove = async (id) => {
    if (!confirm('¿Eliminar este hábito?')) return;
    try { await deleteHabit(id); refetch(); toast.success('Hábito eliminado'); }
    catch { toast.error('Error'); }
    setMenuOpen(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Mis hábitos</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{habits.filter(h => h.is_active).length} activos</p>
        </div>
        <Button icon={Plus} onClick={() => setModal('create')}>Crear hábito</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[['all','Todos'], ['active','Activos'], ['paused','Pausados']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === v ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Flame} title="Sin hábitos" description="Crea tu primer hábito y empieza a construir tu mejor versión." action={() => setModal('create')} actionLabel="Crear hábito" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(habit => (
            <div key={habit.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 relative">
              {/* Color bar */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ backgroundColor: habit.color || '#6366F1' }} />
              <div className="flex items-start justify-between mb-3 mt-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{habit.name}</h3>
                  {habit.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{habit.description}</p>}
                </div>
                <div className="relative ml-2">
                  <button onClick={() => setMenuOpen(menuOpen === habit.id ? null : habit.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {menuOpen === habit.id && (
                    <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 py-1 w-40">
                      <button onClick={() => { setModal(habit); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Edit2 className="w-4 h-4" /> Editar
                      </button>
                      <button onClick={() => toggleActive(habit)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        {habit.is_active ? <><Pause className="w-4 h-4" /> Pausar</> : <><Play className="w-4 h-4" /> Reactivar</>}
                      </button>
                      <button onClick={() => remove(habit.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Streak */}
              {habit.current_streak > 0 && (
                <div className="flex items-center gap-1 mb-3">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-orange-500">{habit.current_streak}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">días seguidos</span>
                </div>
              )}

              {/* Week mini-calendar */}
              <div className="flex gap-1.5 mb-4">
                {DAYS.map((d, i) => {
                  const done = habit.week_completions?.includes(i + 1);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] text-gray-400 uppercase">{d[0]}</span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${done ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        {done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Complete button */}
              {habit.is_active && (
                <button onClick={() => toggle(habit)}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    habit.completed_today
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}>
                  {habit.completed_today ? <><Check className="w-4 h-4" /> Completado</> : '¡Marcar hoy!'}
                </button>
              )}
              {!habit.is_active && <Badge className="mt-1">Pausado</Badge>}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Crear hábito' : 'Editar hábito'} size="md">
        <HabitForm habit={modal === 'create' ? null : modal} onSave={refetch} onClose={() => setModal(null)} />
      </Modal>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Target, MoreVertical, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { getGoals, createGoal, updateGoal, deleteGoal, addProgress } from '../../services/goals.service';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import ProgressBar from '../ui/ProgressBar';
import { CATEGORIES, GOAL_TYPES, COLORS } from '../../utils/constants';
import { formatDate, daysUntil } from '../../utils/dateHelpers';
import { percentage } from '../../utils/formatters';
import toast from 'react-hot-toast';

function GoalForm({ goal, onSave, onClose }) {
  const [form, setForm] = useState({
    title: goal?.title || '', description: goal?.description || '',
    type: goal?.type || 'quantifiable', category_id: goal?.category_id || '',
    target_value: goal?.target_value || '', unit: goal?.unit || '',
    start_date: goal?.start_date || new Date().toISOString().slice(0,10),
    end_date: goal?.end_date || '', color: goal?.color || '#6366F1',
  });
  const [loading, setLoading] = useState(false);
  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return; }
    setLoading(true);
    try {
      const payload = { ...form, category_id: form.category_id || null, target_value: form.target_value || null, end_date: form.end_date || null };
      if (goal?.id) await updateGoal(goal.id, payload);
      else await createGoal(payload);
      onSave(); onClose(); toast.success(goal?.id ? 'Objetivo actualizado' : 'Objetivo creado');
    } catch (err) { toast.error(err?.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-4">
      <Input label="Título *" placeholder="¿Qué quieres lograr?" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      <Textarea label="Descripción" placeholder="Describe tu objetivo..." rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Tipo" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
          {Object.entries(GOAL_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </Select>
        <Select label="Categoría" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
          <option value="">Sin categoría</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </div>
      {form.type === 'quantifiable' && (
        <div className="grid grid-cols-2 gap-3">
          <Input label="Meta" type="number" placeholder="300" value={form.target_value} onChange={e => setForm(f => ({ ...f, target_value: e.target.value }))} />
          <Input label="Unidad" placeholder="páginas, km, S/..." value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Input label="Fecha inicio" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
        <Input label="Fecha límite" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.slice(0,8).map(c => (
            <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
              className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900' : ''}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} loading={loading}>{goal?.id ? 'Actualizar' : 'Crear objetivo'}</Button>
      </div>
    </div>
  );
}

function ProgressModal({ goal, onSave, onClose }) {
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const handleAdd = async () => {
    if (!value) { toast.error('Ingresa un valor'); return; }
    setLoading(true);
    try { await addProgress(goal.id, { value: parseFloat(value), notes }); onSave(); onClose(); toast.success('Avance registrado'); }
    catch (err) { toast.error(err?.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">Registra tu avance en <span className="font-semibold text-gray-900 dark:text-white">{goal.title}</span></p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Actual: <span className="font-semibold">{goal.current_value} {goal.unit}</span> / Meta: <span className="font-semibold">{goal.target_value} {goal.unit}</span></p>
      <Input label={`Nuevo valor (${goal.unit || 'unidades'})`} type="number" placeholder="Ingresa el nuevo total acumulado" value={value} onChange={e => setValue(e.target.value)} />
      <Textarea label="Notas (opcional)" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleAdd} loading={loading}>Registrar avance</Button>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const { data, loading, refetch } = useApi(getGoals, []);
  const goals = data || [];
  const [filter, setFilter] = useState('active');
  const [modal, setModal] = useState(null);
  const [progressGoal, setProgressGoal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  const filtered = goals.filter(g => filter === 'all' ? true : g.status === filter);

  const remove = async (id) => {
    if (!confirm('¿Eliminar este objetivo?')) return;
    try { await deleteGoal(id); refetch(); toast.success('Objetivo eliminado'); }
    catch { toast.error('Error'); }
    setMenuOpen(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Mis objetivos</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{goals.filter(g => g.status === 'active').length} activos</p>
        </div>
        <Button icon={Plus} onClick={() => setModal('create')}>Nuevo objetivo</Button>
      </div>
      <div className="flex gap-2 mb-6">
        {[['active','Activos'],['completed','Completados'],['paused','Pausados'],['all','Todos']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === v ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Target} title="Sin objetivos" description="Define metas claras y cuantificables para alcanzar lo que deseas." action={() => setModal('create')} actionLabel="Crear objetivo" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(goal => {
            const pct = percentage(goal.current_value, goal.target_value);
            const days = goal.end_date ? daysUntil(goal.end_date) : null;
            const goalType = GOAL_TYPES[goal.type];
            return (
              <div key={goal.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 relative">
                <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl" style={{ backgroundColor: goal.color || '#6366F1' }} />
                <div className="flex items-start justify-between mb-3 mt-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{goal.title}</h3>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${goalType?.color}`}>{goalType?.label}</span>
                  </div>
                  <div className="relative ml-2">
                    <button onClick={() => setMenuOpen(menuOpen === goal.id ? null : goal.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpen === goal.id && (
                      <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 py-1 w-36">
                        <button onClick={() => { setModal(goal); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><Edit2 className="w-4 h-4" /> Editar</button>
                        <button onClick={() => remove(goal.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /> Eliminar</button>
                      </div>
                    )}
                  </div>
                </div>
                {goal.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">{goal.description}</p>}
                {goal.type === 'quantifiable' && goal.target_value && (
                  <div className="mb-3">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{goal.current_value} <span className="text-xs font-normal text-gray-500">{goal.unit}</span></span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">de {goal.target_value} {goal.unit}</span>
                    </div>
                    <ProgressBar value={goal.current_value} max={goal.target_value} showPercent color="indigo" />
                  </div>
                )}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    {days !== null && (
                      <span className={days < 0 ? 'text-red-500' : days <= 7 ? 'text-amber-500' : ''}>
                        {days < 0 ? `${Math.abs(days)} días tarde` : days === 0 ? 'Vence hoy' : `${days} días restantes`}
                      </span>
                    )}
                  </div>
                  {goal.type === 'quantifiable' && goal.status === 'active' && (
                    <Button size="sm" variant="secondary" icon={TrendingUp} onClick={() => setProgressGoal(goal)}>Registrar avance</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Nuevo objetivo' : 'Editar objetivo'} size="md">
        <GoalForm goal={modal === 'create' ? null : modal} onSave={refetch} onClose={() => setModal(null)} />
      </Modal>
      <Modal isOpen={!!progressGoal} onClose={() => setProgressGoal(null)} title="Registrar avance" size="sm">
        {progressGoal && <ProgressModal goal={progressGoal} onSave={refetch} onClose={() => setProgressGoal(null)} />}
      </Modal>
    </div>
  );
}

import { useState } from 'react';
import { Plus, CheckSquare, MoreVertical, Edit2, Trash2, Check, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useApi } from '../../hooks/useApi';
import { getTasks, createTask, updateTask, deleteTask, completeTask } from '../../services/tasks.service';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import ProgressBar from '../ui/ProgressBar';
import { CATEGORIES, PRIORITIES, TASK_STATUSES } from '../../utils/constants';
import { isOverdue, isToday } from '../../utils/dateHelpers';
import toast from 'react-hot-toast';

function TaskForm({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    category_id: task?.category_id || '',
    due_date: task?.due_date ? task.due_date.slice(0, 16) : '',
    subtasks: task?.subtasks?.map(s => s.title) || [],
  });
  const [newSub, setNewSub] = useState('');
  const [loading, setLoading] = useState(false);

  const addSub = () => {
    if (!newSub.trim()) return;
    setForm(f => ({ ...f, subtasks: [...f.subtasks, newSub.trim()] }));
    setNewSub('');
  };

  const removeSub = (i) => setForm(f => ({ ...f, subtasks: f.subtasks.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return; }
    setLoading(true);
    try {
      const payload = { ...form, category_id: form.category_id || null, due_date: form.due_date || null };
      if (task?.id) await updateTask(task.id, payload);
      else await createTask(payload);
      onSave(); onClose();
      toast.success(task?.id ? 'Tarea actualizada' : 'Tarea creada');
    } catch (err) { toast.error(err?.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <Input label="Título *" placeholder="¿Qué necesitas hacer?" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      <Textarea label="Descripción" placeholder="Detalles adicionales..." rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Prioridad" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
          {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </Select>
        <Select label="Categoría" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
          <option value="">Sin categoría</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </div>
      <Input label="Fecha límite" type="datetime-local" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subtareas</label>
        <div className="space-y-2 mb-2">
          {form.subtasks.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{s}</span>
              <button onClick={() => removeSub(i)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newSub} onChange={e => setNewSub(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSub()}
            placeholder="Añadir subtarea..." className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <Button size="sm" variant="secondary" onClick={addSub}>Añadir</Button>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} loading={loading}>{task?.id ? 'Actualizar' : 'Crear tarea'}</Button>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [params, setParams] = useState({ status: '', priority: '', search: '' });
  const { data, loading, refetch } = useApi(() => getTasks(params), [JSON.stringify(params)]);
  const tasks = data || [];
  const [modal, setModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  const complete = async (task) => {
    try { await completeTask(task.id); refetch(); toast.success('¡Tarea completada!'); }
    catch { toast.error('Error'); }
    setMenuOpen(null);
  };

  const remove = async (id) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    try { await deleteTask(id); refetch(); toast.success('Tarea eliminada'); }
    catch { toast.error('Error'); }
    setMenuOpen(null);
  };

  const getDueDateColor = (date, status) => {
    if (status === 'completed') return 'text-gray-400';
    if (!date) return 'text-gray-500 dark:text-gray-400';
    if (isOverdue(date)) return 'text-red-500';
    if (isToday(date)) return 'text-amber-500';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Mis tareas</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{tasks.filter(t => t.status !== 'completed').length} pendientes</p>
        </div>
        <Button icon={Plus} onClick={() => setModal('create')}>Nueva tarea</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 mb-6">
        <input value={params.search} onChange={e => setParams(p => ({ ...p, search: e.target.value }))}
          placeholder="Buscar tareas..." className="w-full sm:flex-1 min-w-0 sm:min-w-48 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <div className="flex gap-2">
          <select value={params.status} onChange={e => setParams(p => ({ ...p, status: e.target.value }))}
            className="flex-1 sm:flex-initial px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-300">
            <option value="">Todos los estados</option>
            {Object.entries(TASK_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={params.priority} onChange={e => setParams(p => ({ ...p, priority: e.target.value }))}
            className="flex-1 sm:flex-initial px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-300">
            <option value="">Todas las prioridades</option>
            {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : tasks.length === 0 ? (
        <EmptyState icon={CheckSquare} title="Sin tareas" description="Organiza tu trabajo creando tu primera tarea." action={() => setModal('create')} actionLabel="Nueva tarea" />
      ) : (
        <div className="space-y-2">
          {tasks.map(task => {
            const priority = PRIORITIES[task.priority];
            const status = TASK_STATUSES[task.status];
            const subtotalDone = task.subtasks_completed || 0;
            const subtotalAll = task.subtasks_count || 0;
            return (
              <div key={task.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-start gap-4 group">
                <button onClick={() => task.status !== 'completed' && complete(task)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'}`}>
                  {task.status === 'completed' && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{task.title}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priority?.bg}`}>
                      {priority?.label}
                    </span>
                    {status && <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>}
                  </div>
                  {task.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{task.description}</p>}
                  <div className="flex items-center gap-4 mt-2">
                    {task.due_date && (
                      <span className={`text-xs flex items-center gap-1 ${getDueDateColor(task.due_date, task.status)}`}>
                        {isOverdue(task.due_date) && task.status !== 'completed' ? '⚠ ' : ''}
                        {format(new Date(task.due_date), "d MMM, HH:mm", { locale: es })}
                      </span>
                    )}
                    {subtotalAll > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{subtotalDone}/{subtotalAll}</span>
                        <ProgressBar value={subtotalDone} max={subtotalAll} className="w-20" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="relative ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setMenuOpen(menuOpen === task.id ? null : task.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {menuOpen === task.id && (
                    <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 py-1 w-36">
                      <button onClick={() => { setModal(task); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Edit2 className="w-4 h-4" /> Editar
                      </button>
                      <button onClick={() => remove(task.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Nueva tarea' : 'Editar tarea'} size="md">
        <TaskForm task={modal === 'create' ? null : modal} onSave={refetch} onClose={() => setModal(null)} />
      </Modal>
    </div>
  );
}

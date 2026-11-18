import { useState, useEffect } from 'react';
import { Plus, Clock, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { format, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useApi } from '../../hooks/useApi';
import { getPlannerEvents, createPlannerEvent, updatePlannerEvent, deletePlannerEvent } from '../../services/users.service';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import { COLORS } from '../../utils/constants';
import toast from 'react-hot-toast';

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6:00 to 23:00
const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const TODAY_DOW = getDay(new Date()); // 0=Sun

function EventForm({ event, onSave, onClose }) {
  const [form, setForm] = useState({
    title: event?.title || '',
    start_time: event?.start_time || '09:00',
    end_time: event?.end_time || '10:00',
    day_of_week: event?.day_of_week ?? TODAY_DOW,
    is_recurring: event?.is_recurring || false,
    color: event?.color || '#6366F1',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.title) { toast.error('El título es obligatorio'); return; }
    if (form.start_time >= form.end_time) { toast.error('La hora de fin debe ser posterior al inicio'); return; }
    setLoading(true);
    try {
      if (event?.id) await updatePlannerEvent(event.id, form);
      else await createPlannerEvent(form);
      onSave(); onClose(); toast.success(event?.id ? 'Actualizado' : 'Actividad creada');
    } catch (err) { toast.error(err?.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <Input label="Título *" placeholder="Nombre de la actividad" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Hora inicio" type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
        <Input label="Hora fin" type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
      </div>
      <Select label="Día de la semana" value={form.day_of_week} onChange={e => setForm(f => ({ ...f, day_of_week: parseInt(e.target.value) }))}>
        {DAYS_SHORT.map((d, i) => <option key={i} value={i}>{d}</option>)}
      </Select>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.is_recurring} onChange={e => setForm(f => ({ ...f, is_recurring: e.target.checked }))} className="rounded" />
        <span className="text-sm text-gray-700 dark:text-gray-300">Repetir semanalmente</span>
      </label>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.slice(0, 8).map(c => (
            <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
              className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900' : ''}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} loading={loading}>{event?.id ? 'Actualizar' : 'Crear'}</Button>
      </div>
    </div>
  );
}

export default function PlannerPage() {
  const [selectedDay, setSelectedDay] = useState(TODAY_DOW);
  const { data, loading, refetch } = useApi(() => getPlannerEvents({ day_of_week: selectedDay }), [selectedDay]);
  const events = data || [];
  const [modal, setModal] = useState(null);

  const hasOverlap = (evs) => {
    const sorted = [...evs].sort((a, b) => a.start_time.localeCompare(b.start_time));
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].end_time > sorted[i + 1].start_time) return true;
    }
    return false;
  };

  const overlapping = hasOverlap(events);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta actividad?')) return;
    try { await deletePlannerEvent(id); refetch(); toast.success('Eliminado'); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Planificador</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Organiza tu horario semanal</p>
        </div>
        <Button icon={Plus} onClick={() => setModal('create')}>Añadir actividad</Button>
      </div>

      {/* Day selector */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {DAYS_SHORT.map((d, i) => (
          <button key={i} onClick={() => setSelectedDay(i)}
            className={`flex-1 min-w-16 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedDay === i ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'} ${i === TODAY_DOW ? 'ring-2 ring-indigo-300 dark:ring-indigo-700' : ''}`}>
            {d}
            {i === TODAY_DOW && <span className="block text-[9px] opacity-70">Hoy</span>}
          </button>
        ))}
      </div>

      {overlapping && (
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3 mb-4 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">Hay actividades con horarios superpuestos</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : events.length === 0 ? (
        <EmptyState icon={Clock} title={`Sin actividades el ${DAYS_SHORT[selectedDay]}`} description="Añade actividades para organizar tu día." action={() => setModal('create')} actionLabel="Añadir actividad" />
      ) : (
        <div className="space-y-3">
          {[...events].sort((a, b) => a.start_time.localeCompare(b.start_time)).map(event => (
            <div key={event.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4">
              <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: event.color || '#6366F1' }} />
              <div className="flex-shrink-0 text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{event.start_time?.slice(0,5)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{event.end_time?.slice(0,5)}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                {event.is_recurring && <p className="text-xs text-gray-500 dark:text-gray-400">🔁 Semanal</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => setModal(event)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(event.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Nueva actividad' : 'Editar actividad'} size="md">
        <EventForm event={modal === 'create' ? null : modal} onSave={refetch} onClose={() => setModal(null)} />
      </Modal>
    </div>
  );
}

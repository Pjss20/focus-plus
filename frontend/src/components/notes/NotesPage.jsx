import { useState } from 'react';
import { Plus, Pin, PinOff, Edit2, Trash2, Search, StickyNote } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { getNotes, createNote, updateNote, deleteNote, togglePin } from '../../services/notes.service';
import { useDebounce } from '../../hooks/useDebounce';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import { truncateText } from '../../utils/formatters';
import { formatDate } from '../../utils/dateHelpers';
import toast from 'react-hot-toast';

const NOTE_COLORS = [
  { value: '#FFFFFF', label: 'Blanco' },
  { value: '#FEF9C3', label: 'Amarillo' },
  { value: '#DCFCE7', label: 'Verde' },
  { value: '#DBEAFE', label: 'Azul' },
  { value: '#FCE7F3', label: 'Rosa' },
  { value: '#EDE9FE', label: 'Morado' },
  { value: '#FEF3C7', label: 'Naranja' },
  { value: '#F3F4F6', label: 'Gris' },
];

function NoteEditor({ note, onSave, onClose }) {
  const [form, setForm] = useState({
    title: note?.title || '',
    content: note?.content || '',
    color: note?.color || '#FFFFFF',
    is_pinned: note?.is_pinned || false,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (note?.id) await updateNote(note.id, form);
      else await createNote(form);
      onSave();
      onClose();
      toast.success(note?.id ? 'Nota actualizada' : 'Nota creada');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input label="Título (opcional)" placeholder="Título de la nota" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contenido</label>
        <textarea rows={8} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          placeholder="Escribe tu nota aquí..." className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
        <div className="flex gap-2 flex-wrap">
          {NOTE_COLORS.map(c => (
            <button key={c.value} type="button" onClick={() => setForm(f => ({ ...f, color: c.value }))}
              className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${form.color === c.value ? 'border-indigo-500 scale-110' : 'border-gray-200 dark:border-gray-700'}`}
              style={{ backgroundColor: c.value }} title={c.label} />
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.is_pinned} onChange={e => setForm(f => ({ ...f, is_pinned: e.target.checked }))} className="rounded" />
        <span className="text-sm text-gray-700 dark:text-gray-300">Fijar nota</span>
      </label>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} loading={loading}>{note?.id ? 'Guardar' : 'Crear nota'}</Button>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data, loading, refetch } = useApi(() => getNotes(debouncedSearch), [debouncedSearch]);
  const notes = data || [];
  const [modal, setModal] = useState(null);

  const handlePin = async (note) => {
    try {
      await togglePin(note.id);
      refetch();
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta nota?')) return;
    try { await deleteNote(id); refetch(); toast.success('Nota eliminada'); }
    catch { toast.error('Error'); }
  };

  const pinned = notes.filter(n => n.is_pinned);
  const unpinned = notes.filter(n => !n.is_pinned);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Notas</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{notes.length} notas</p>
        </div>
        <Button icon={Plus} onClick={() => setModal('create')}>Nueva nota</Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar notas..." className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : notes.length === 0 ? (
        <EmptyState icon={StickyNote} title="Sin notas" description="Captura ideas, apuntes y pensamientos importantes." action={() => setModal('create')} actionLabel="Nueva nota" />
      ) : (
        <div className="space-y-6">
          {/* Pinned */}
          {pinned.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5" /> Fijadas
              </h2>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {pinned.map(note => <NoteCard key={note.id} note={note} onEdit={() => setModal(note)} onPin={() => handlePin(note)} onDelete={() => handleDelete(note.id)} />)}
              </div>
            </div>
          )}
          {/* Others */}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Otras</h2>}
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {unpinned.map(note => <NoteCard key={note.id} note={note} onEdit={() => setModal(note)} onPin={() => handlePin(note)} onDelete={() => handleDelete(note.id)} />)}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Nueva nota' : 'Editar nota'} size="md">
        <NoteEditor note={modal === 'create' ? null : modal} onSave={refetch} onClose={() => setModal(null)} />
      </Modal>
    </div>
  );
}

function NoteCard({ note, onEdit, onPin, onDelete }) {
  const isDark = note.color === '#FFFFFF' || note.color === '#F3F4F6';
  return (
    <div className="break-inside-avoid rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer group transition-shadow hover:shadow-md"
      style={{ backgroundColor: note.color || '#FFFFFF' }}>
      <div className="flex items-start justify-between mb-2">
        {note.title && <h3 className="font-semibold text-gray-900 text-sm flex-1 mr-2">{note.title}</h3>}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
          <button onClick={(e) => { e.stopPropagation(); onPin(); }} className="p-1 rounded-lg hover:bg-black/10 text-gray-500">
            {note.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 rounded-lg hover:bg-black/10 text-gray-500">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 rounded-lg hover:bg-red-100 text-gray-500 hover:text-red-600">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {note.content && <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed line-clamp-6">{note.content}</p>}
      <p className="text-xs text-gray-500 mt-3">{formatDate(note.updated_at || note.created_at)}</p>
    </div>
  );
}

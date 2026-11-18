import { useState } from 'react';
import { Plus, GraduationCap, BookOpen, FileText, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useApi } from '../../hooks/useApi';
import { getSubjects, createSubject, updateSubject, deleteSubject, getExams, createExam, updateExam, deleteExam, getAssignments, createAssignment, updateAssignment, deleteAssignment } from '../../services/academic.service';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import { COLORS } from '../../utils/constants';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'subjects', label: 'Asignaturas', icon: BookOpen },
  { id: 'exams', label: 'Exámenes', icon: GraduationCap },
  { id: 'assignments', label: 'Trabajos', icon: FileText },
];

export default function AcademicPage() {
  const [tab, setTab] = useState('subjects');
  const { data: subjects, loading: loadSub, refetch: refetchSub } = useApi(getSubjects, []);
  const { data: exams, loading: loadExam, refetch: refetchExam } = useApi(getExams, []);
  const { data: assignments, loading: loadAssign, refetch: refetchAssign } = useApi(getAssignments, []);
  const [modal, setModal] = useState(null);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Espacio académico</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gestiona tus asignaturas y actividades</p>
        </div>
        <Button icon={Plus} onClick={() => setModal({ type: tab })}>Añadir</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 max-w-full overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${tab === id ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Subjects */}
      {tab === 'subjects' && (
        loadSub ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> :
        (subjects || []).length === 0 ? <EmptyState icon={BookOpen} title="Sin asignaturas" description="Añade tus materias para organizar tus estudios." action={() => setModal({ type: 'subjects' })} actionLabel="Añadir asignatura" /> :
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(subjects || []).map(sub => (
            <SubjectCard key={sub.id} subject={sub} onEdit={(s) => setModal({ type: 'subjects', data: s })} onDelete={async (id) => {
              if (!confirm('¿Eliminar esta asignatura?')) return;
              try { await deleteSubject(id); refetchSub(); toast.success('Asignatura eliminada'); }
              catch { toast.error('Error'); }
            }} />
          ))}
        </div>
      )}

      {/* Exams */}
      {tab === 'exams' && (
        loadExam ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> :
        (exams || []).length === 0 ? <EmptyState icon={GraduationCap} title="Sin exámenes" description="Registra tus próximos exámenes para prepararte a tiempo." action={() => setModal({ type: 'exams' })} actionLabel="Añadir examen" /> :
        <div className="space-y-3">
          {(exams || []).map(exam => (
            <ExamRow key={exam.id} exam={exam} subjects={subjects || []} onEdit={(e) => setModal({ type: 'exams', data: e })} onDelete={async (id) => {
              if (!confirm('¿Eliminar este examen?')) return;
              try { await deleteExam(id); refetchExam(); toast.success('Examen eliminado'); }
              catch { toast.error('Error'); }
            }} />
          ))}
        </div>
      )}

      {/* Assignments */}
      {tab === 'assignments' && (
        loadAssign ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> :
        (assignments || []).length === 0 ? <EmptyState icon={FileText} title="Sin trabajos" description="Registra tus tareas y trabajos académicos." action={() => setModal({ type: 'assignments' })} actionLabel="Añadir trabajo" /> :
        <div className="space-y-3">
          {(assignments || []).map(a => (
            <AssignmentRow key={a.id} assignment={a} subjects={subjects || []} onEdit={(item) => setModal({ type: 'assignments', data: item })} onDelete={async (id) => {
              if (!confirm('¿Eliminar?')) return;
              try { await deleteAssignment(id); refetchAssign(); toast.success('Eliminado'); }
              catch { toast.error('Error'); }
            }} />
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={
        modal?.type === 'subjects' ? (modal?.data ? 'Editar asignatura' : 'Nueva asignatura') :
        modal?.type === 'exams' ? (modal?.data ? 'Editar examen' : 'Nuevo examen') :
        modal?.data ? 'Editar trabajo' : 'Nuevo trabajo'
      } size="md">
        {modal?.type === 'subjects' && <SubjectForm subject={modal.data} onSave={() => { refetchSub(); setModal(null); }} onClose={() => setModal(null)} />}
        {modal?.type === 'exams' && <ExamForm exam={modal.data} subjects={subjects || []} onSave={() => { refetchExam(); setModal(null); }} onClose={() => setModal(null)} />}
        {modal?.type === 'assignments' && <AssignmentForm assignment={modal.data} subjects={subjects || []} onSave={() => { refetchAssign(); setModal(null); }} onClose={() => setModal(null)} />}
      </Modal>
    </div>
  );
}

function SubjectCard({ subject, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="h-20 flex items-center justify-center" style={{ backgroundColor: subject.color || '#6366F1' }}>
        <span className="text-4xl">{subject.icon || '📚'}</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{subject.name}</h3>
            {subject.teacher && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subject.teacher}</p>}
          </div>
          <div className="flex gap-1 ml-2">
            <button onClick={() => onEdit(subject)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400"><Edit2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => onDelete(subject.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        {subject.classroom && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Aula: {subject.classroom}</p>}
      </div>
    </div>
  );
}

function ExamRow({ exam, subjects, onEdit, onDelete }) {
  const sub = subjects.find(s => s.id === exam.subject_id);
  const statusColors = { upcoming: 'bg-blue-100 text-blue-700', completed: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-gray-100 text-gray-500' };
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (sub?.color || '#6366F1') + '22' }}>
        <GraduationCap className="w-5 h-5" style={{ color: sub?.color || '#6366F1' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate">{exam.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub?.name} · {format(new Date(exam.exam_date), "d 'de' MMMM, HH:mm", { locale: es })}</p>
        {exam.location && <p className="text-xs text-gray-500 dark:text-gray-400">📍 {exam.location}</p>}
      </div>
      <div className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusColors[exam.status]}`}>{exam.status === 'upcoming' ? 'Próximo' : exam.status === 'completed' ? 'Realizado' : 'Cancelado'}</div>
      <div className="flex gap-1">
        <button onClick={() => onEdit(exam)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400"><Edit2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => onDelete(exam.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

function AssignmentRow({ assignment, subjects, onEdit, onDelete }) {
  const sub = subjects.find(s => s.id === assignment.subject_id);
  const statusLabels = { pending: 'Pendiente', submitted: 'Entregado', graded: 'Calificado', late: 'Atrasado' };
  const statusColors = { pending: 'bg-amber-100 text-amber-700', submitted: 'bg-blue-100 text-blue-700', graded: 'bg-emerald-100 text-emerald-700', late: 'bg-red-100 text-red-700' };
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (sub?.color || '#6366F1') + '22' }}>
        <FileText className="w-5 h-5" style={{ color: sub?.color || '#6366F1' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate">{assignment.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub?.name} · Entrega: {assignment.due_date ? format(new Date(assignment.due_date), "d 'de' MMMM", { locale: es }) : '—'}</p>
      </div>
      <div className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusColors[assignment.status]}`}>{statusLabels[assignment.status]}</div>
      <div className="flex gap-1">
        <button onClick={() => onEdit(assignment)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400"><Edit2 className="w-3.5 h-3.5" /></button>
        <button onClick={() => onDelete(assignment.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

function SubjectForm({ subject, onSave, onClose }) {
  const [form, setForm] = useState({ name: subject?.name || '', color: subject?.color || '#6366F1', icon: subject?.icon || '📚', teacher: subject?.teacher || '', classroom: subject?.classroom || '' });
  const [loading, setLoading] = useState(false);
  const handleSave = async () => {
    if (!form.name) { toast.error('El nombre es obligatorio'); return; }
    setLoading(true);
    try {
      if (subject?.id) await updateSubject(subject.id, form);
      else await createSubject(form);
      onSave(); toast.success(subject?.id ? 'Actualizado' : 'Asignatura creada');
    } catch (err) { toast.error(err?.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-4">
      <Input label="Nombre *" placeholder="Matemáticas, Historia..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Profesor" placeholder="Nombre del profesor" value={form.teacher} onChange={e => setForm(f => ({ ...f, teacher: e.target.value }))} />
        <Input label="Aula" placeholder="Aula 101" value={form.classroom} onChange={e => setForm(f => ({ ...f, classroom: e.target.value }))} />
      </div>
      <Input label="Icono (emoji)" placeholder="📚" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
        <div className="flex gap-2 flex-wrap">{COLORS.slice(0,8).map(c => (
          <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))} className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`} style={{ backgroundColor: c }} />
        ))}</div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} loading={loading}>{subject?.id ? 'Actualizar' : 'Crear'}</Button>
      </div>
    </div>
  );
}

function ExamForm({ exam, subjects, onSave, onClose }) {
  const [form, setForm] = useState({ title: exam?.title || '', subject_id: exam?.subject_id || '', exam_date: exam?.exam_date ? exam.exam_date.slice(0,16) : '', location: exam?.location || '', description: exam?.description || '' });
  const [loading, setLoading] = useState(false);
  const handleSave = async () => {
    if (!form.title || !form.exam_date) { toast.error('Título y fecha son obligatorios'); return; }
    setLoading(true);
    try {
      if (exam?.id) await updateExam(exam.id, form);
      else await createExam(form);
      onSave(); toast.success(exam?.id ? 'Actualizado' : 'Examen creado');
    } catch (err) { toast.error(err?.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-4">
      <Input label="Título *" placeholder="Examen parcial de..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      <Select label="Asignatura" value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}>
        <option value="">Sin asignatura</option>
        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </Select>
      <Input label="Fecha y hora *" type="datetime-local" value={form.exam_date} onChange={e => setForm(f => ({ ...f, exam_date: e.target.value }))} />
      <Input label="Lugar" placeholder="Aula 203, Online..." value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
      <Textarea label="Notas" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} loading={loading}>{exam?.id ? 'Actualizar' : 'Crear'}</Button>
      </div>
    </div>
  );
}

function AssignmentForm({ assignment, subjects, onSave, onClose }) {
  const [form, setForm] = useState({ title: assignment?.title || '', subject_id: assignment?.subject_id || '', due_date: assignment?.due_date ? assignment.due_date.slice(0,16) : '', description: assignment?.description || '', status: assignment?.status || 'pending' });
  const [loading, setLoading] = useState(false);
  const handleSave = async () => {
    if (!form.title) { toast.error('El título es obligatorio'); return; }
    setLoading(true);
    try {
      if (assignment?.id) await updateAssignment(assignment.id, form);
      else await createAssignment(form);
      onSave(); toast.success(assignment?.id ? 'Actualizado' : 'Trabajo creado');
    } catch (err) { toast.error(err?.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-4">
      <Input label="Título *" placeholder="Trabajo de..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      <Select label="Asignatura" value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}>
        <option value="">Sin asignatura</option>
        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </Select>
      <Input label="Fecha de entrega" type="datetime-local" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
      <Select label="Estado" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
        <option value="pending">Pendiente</option>
        <option value="submitted">Entregado</option>
        <option value="graded">Calificado</option>
        <option value="late">Atrasado</option>
      </Select>
      <Textarea label="Descripción" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} loading={loading}>{assignment?.id ? 'Actualizar' : 'Crear'}</Button>
      </div>
    </div>
  );
}

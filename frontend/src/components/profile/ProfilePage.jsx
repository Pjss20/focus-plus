import { useState, useEffect } from 'react';
import { User, Settings, Shield, Download, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getSettings, updateSettings, updateProfile, changePassword } from '../../services/users.service';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Toggle from '../ui/Toggle';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';
import toast from 'react-hot-toast';
import api from '../../services/api';

const TABS = [
  { id: 'account', label: 'Mi cuenta', icon: User },
  { id: 'preferences', label: 'Preferencias', icon: Settings },
  { id: 'security', label: 'Seguridad', icon: Shield },
  { id: 'export', label: 'Exportar', icon: Download },
];

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [tab, setTab] = useState('account');

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Mi perfil</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gestiona tu cuenta y preferencias</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === id ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'account' && <AccountTab user={user} updateUser={updateUser} />}
      {tab === 'preferences' && <PreferencesTab theme={theme} toggleTheme={toggleTheme} />}
      {tab === 'security' && <SecurityTab logout={logout} />}
      {tab === 'export' && <ExportTab />}
    </div>
  );
}

function AccountTab({ user, updateUser }) {
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateProfile(form);
      updateUser(res.data);
      toast.success('Perfil actualizado');
    } catch (err) { toast.error(err?.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <Avatar name={user?.name} src={user?.avatar_url} size="xl" />
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Nivel {user?.level || 1} · {user?.experience_points || 0} XP</p>
        </div>
      </div>
      <div className="space-y-4">
        <Input label="Nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Correo electrónico</label>
          <input disabled value={user?.email || ''} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed" />
          <p className="mt-1 text-xs text-gray-400">El correo no puede modificarse</p>
        </div>
        <Textarea label="Biografía" placeholder="Cuéntanos un poco sobre ti..." rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={loading}>Guardar cambios</Button>
      </div>
    </div>
  );
}

function PreferencesTab({ theme, toggleTheme }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then(r => setSettings(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const save = async (data) => {
    setSaving(true);
    try { await updateSettings(data); toast.success('Guardado'); }
    catch { toast.error('Error'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">Modo oscuro</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Cambia entre modo claro y oscuro</p>
        </div>
        <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
      </div>
      {settings && (
        <>
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <p className="font-medium text-gray-900 dark:text-white mb-4">Pomodoro</p>
            <div className="grid grid-cols-2 gap-4">
              {[['pomodoro_work_minutes','Concentración (min)'],['pomodoro_short_break','Descanso corto (min)'],['pomodoro_long_break','Descanso largo (min)'],['pomodoro_cycles','Ciclos por sesión']].map(([k, l]) => (
                <div key={k}>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{l}</label>
                  <input type="number" min={1} max={120} value={settings[k] || 25}
                    onChange={e => setSettings(s => ({ ...s, [k]: parseInt(e.target.value) || 1 }))}
                    onBlur={() => save({ [k]: settings[k] })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SecurityTab({ logout }) {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleChange = async () => {
    if (form.new_password !== form.confirm) { toast.error('Las contraseñas no coinciden'); return; }
    if (form.new_password.length < 8) { toast.error('Mínimo 8 caracteres'); return; }
    setLoading(true);
    try {
      await changePassword({ current_password: form.current_password, new_password: form.new_password });
      setForm({ current_password: '', new_password: '', confirm: '' });
      toast.success('Contraseña actualizada');
    } catch (err) { toast.error(err?.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('⚠️ Esta acción es irreversible. ¿Deseas eliminar tu cuenta y todos tus datos?')) return;
    if (!confirm('¿Estás completamente seguro? Todos tus hábitos, tareas y objetivos serán eliminados.')) return;
    setDeleting(true);
    try {
      await api.delete('/users/account');
      logout();
      toast.success('Cuenta eliminada');
    } catch (err) { toast.error(err?.response?.data?.message || 'Error'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Cambiar contraseña</h2>
        <Input label="Contraseña actual" type="password" value={form.current_password} onChange={e => setForm(f => ({ ...f, current_password: e.target.value }))} />
        <Input label="Nueva contraseña" type="password" value={form.new_password} onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))} />
        <Input label="Confirmar nueva contraseña" type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
        <div className="flex justify-end">
          <Button onClick={handleChange} loading={loading}>Actualizar contraseña</Button>
        </div>
      </div>
      <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 p-6">
        <h2 className="font-semibold text-red-800 dark:text-red-400 mb-2">Zona de peligro</h2>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">Eliminar tu cuenta es permanente e irreversible. Todos tus datos serán eliminados.</p>
        <Button variant="danger" onClick={handleDeleteAccount} loading={deleting}>Eliminar mi cuenta</Button>
      </div>
    </div>
  );
}

function ExportTab() {
  const [loading, setLoading] = useState(null);
  const exportData = async (type) => {
    setLoading(type);
    try {
      const res = await api.get(`/users/export/${type}`);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `focusplus_${type}_${new Date().toISOString().slice(0,10)}.json`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('Exportación completada');
    } catch { toast.error('Error al exportar'); }
    finally { setLoading(null); }
  };

  const exportItems = [
    { type: 'habits', label: 'Hábitos', desc: 'Historial completo de hábitos y cumplimientos' },
    { type: 'tasks', label: 'Tareas', desc: 'Todas tus tareas y subtareas' },
    { type: 'goals', label: 'Objetivos', desc: 'Metas y registro de avances' },
    { type: 'notes', label: 'Notas', desc: 'Todas tus notas personales' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
      <div>
        <h2 className="font-semibold text-gray-900 dark:text-white">Exportar información</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Descarga tus datos en formato JSON</p>
      </div>
      <div className="space-y-3">
        {exportItems.map(({ type, label, desc }) => (
          <div key={type} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
            <Button size="sm" variant="secondary" icon={Download} onClick={() => exportData(type)} loading={loading === type}>
              Exportar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

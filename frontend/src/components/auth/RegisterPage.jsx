import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Zap } from 'lucide-react';
import * as authSvc from '../../services/auth.service';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = (p) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const s = strength(form.password);
  const strengthLabel = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'][s];
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'][s];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Las contraseñas no coinciden'); return; }
    if (form.password.length < 8) { toast.error('La contraseña debe tener al menos 8 caracteres'); return; }
    setLoading(true);
    try {
      const res = await authSvc.register(form.name, form.email, form.password);
      localStorage.setItem('token', res.data.token);
      toast.success('¡Cuenta creada exitosamente!');
      window.location.href = '/';
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">FOCUS+</span>
          </div>
          <h1 className="text-xl font-semibold text-white">Crea tu cuenta</h1>
          <p className="text-sm text-gray-400 mt-1">Empieza gratis hoy</p>
        </div>
        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nombre completo" type="text" placeholder="Tu nombre" icon={User}
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <Input label="Correo electrónico" type="email" placeholder="tu@email.com" icon={Mail}
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required autoComplete="email" />
            <div>
              <Input label="Contraseña" type={showPass ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" icon={Lock}
                iconRight={<button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-400 hover:text-gray-300"><EyeOff className="w-4 h-4" /></button>}
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= s ? strengthColor : 'bg-gray-700'}`} />)}
                  </div>
                  <p className="text-xs text-gray-400">Contraseña: <span className="font-medium text-gray-300">{strengthLabel}</span></p>
                </div>
              )}
            </div>
            <Input label="Confirmar contraseña" type={showPass ? 'text' : 'password'} placeholder="Repite la contraseña" icon={Lock}
              value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />
            <Button type="submit" loading={loading} className="w-full justify-center">Crear cuenta</Button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-5">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

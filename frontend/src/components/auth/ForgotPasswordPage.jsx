import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Zap, ArrowLeft } from 'lucide-react';
import * as authSvc from '../../services/auth.service';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authSvc.forgotPassword(email);
      setSent(true);
      toast.success('Revisa tu correo');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al enviar el correo');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center"><Zap className="w-6 h-6 text-white" /></div>
            <span className="text-2xl font-bold text-white">FOCUS+</span>
          </div>
          <h1 className="text-xl font-semibold text-white">Recuperar contraseña</h1>
          <p className="text-sm text-gray-400 mt-1">Te enviaremos un enlace de recuperación</p>
        </div>
        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-6 shadow-2xl">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><Mail className="w-7 h-7 text-emerald-400" /></div>
              <p className="text-white font-medium mb-1">Correo enviado</p>
              <p className="text-sm text-gray-400 mb-5">Revisa tu bandeja de entrada en <span className="text-white">{email}</span></p>
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">Volver al inicio de sesión</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Correo electrónico" type="email" placeholder="tu@email.com" icon={Mail} value={email} onChange={e => setEmail(e.target.value)} required />
              <Button type="submit" loading={loading} className="w-full justify-center">Enviar enlace</Button>
            </form>
          )}
          <div className="mt-4 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-300 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

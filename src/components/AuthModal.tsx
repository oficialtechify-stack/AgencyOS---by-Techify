import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Briefcase,
  LogIn,
  UserPlus,
  Sparkles,
  AlertCircle,
  Globe,
} from 'lucide-react';
import {
  loginWithEmailOrFirestoreCredentials,
  signUpWithEmailOrFirestore,
  loginWithGoogle,
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg('');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Informe um e-mail válido.');
      return;
    }

    try {
      setLoading(true);

      if (mode === 'signup') {
        await signUpWithEmailOrFirestore(cleanEmail, password, agencyName.trim(), name.trim());
      } else {
        await loginWithEmailOrFirestoreCredentials(cleanEmail, password);
      }

      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      setLoading(false);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setErrorMsg('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Este e-mail já está cadastrado. Tente fazer login.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Formato de e-mail inválido.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg('Muitas tentativas falhas. Aguarde alguns instantes e tente novamente.');
      } else {
        setErrorMsg(err.message || 'Ocorreu um erro ao tentar autenticar.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithGoogle();
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Google auth error:', err);
      setLoading(false);
      setErrorMsg('Erro ao autenticar com a conta Google.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f111a] border border-[#22c55e]/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(34,197,94,0.15)] relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1c2030] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Headers */}
        <div className="flex bg-[#141724] p-1 rounded-2xl border border-[#202538]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
              mode === 'login'
                ? 'bg-[#22c55e] text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" /> Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
              mode === 'signup'
                ? 'bg-[#22c55e] text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Criar Conta (14 dias)
          </button>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-white">
            {mode === 'login' ? 'Acesse seu Dashboard Individual' : 'Inicie seu Teste Grátis de 14 Dias'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {mode === 'login'
              ? 'Seus dados e relatórios estão salvos no seu banco de dados individual.'
              : 'Sem cartão de crédito necessário. Acesso completo liberado.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs font-semibold text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Seu Nome</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    className="w-full bg-[#151824] border border-[#242a3d] focus:border-[#22c55e] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Nome da sua Agência</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="Ex: Techify Digital"
                    className="w-full bg-[#151824] border border-[#242a3d] focus:border-[#22c55e] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">E-mail Comercial</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@agencia.com"
                className="w-full bg-[#151824] border border-[#242a3d] focus:border-[#22c55e] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#151824] border border-[#242a3d] focus:border-[#22c55e] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#1eb054] text-black font-extrabold text-xs shadow-lg shadow-[#22c55e]/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Autenticando...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" /> Entrar no Meu Dashboard
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Criar Conta & Iniciar Teste (14 Dias)
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#1d2235] w-full"></div>
          <span className="bg-[#0f111a] px-3 text-[11px] text-gray-500 font-semibold absolute">OU</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-[#171a29] hover:bg-[#202538] border border-[#282f45] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Globe className="w-4 h-4 text-[#22c55e]" /> Entrar com Google
        </button>
      </div>
    </div>
  );
};

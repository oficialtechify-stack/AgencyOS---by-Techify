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
  ArrowRight,
} from 'lucide-react';
import {
  loginWithEmailOrFirestoreCredentials,
  signUpWithEmailOrFirestore,
  loginWithGoogle,
  loginOrCreateAccountWithGoogleEmail,
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
  const [showGoogleFallback, setShowGoogleFallback] = useState(false);
  const [googleFallbackEmail, setGoogleFallbackEmail] = useState('');

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
      if (err?.code === 'auth/unauthorized-domain' || err?.code === 'auth/popup-blocked') {
        setShowGoogleFallback(true);
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('A janela de login do Google foi fechada.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Tentativa de login cancelada.');
      } else {
        setErrorMsg(err?.message || 'Erro ao autenticar com a conta Google.');
      }
    }
  };

  const handleGoogleFallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanG = googleFallbackEmail.trim().toLowerCase();
    if (!cleanG || !cleanG.includes('@')) {
      setErrorMsg('Informe um e-mail Google válido.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await loginOrCreateAccountWithGoogleEmail(cleanG);
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Erro ao autenticar com e-mail Google.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Selector */}
        <div className="flex bg-neutral-900 p-1 rounded-2xl border border-neutral-800">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
              setShowGoogleFallback(false);
            }}
            className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" /> Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
              setShowGoogleFallback(false);
            }}
            className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Cadastrar Empresa
          </button>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-white">
            {mode === 'login' ? 'Acesse seu Dashboard' : 'Cadastrar sua Empresa'}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            {mode === 'login'
              ? 'Digite suas credenciais ou continue com o Google.'
              : 'As empresas podem criar sua conta pelo Google ou com e-mail e senha.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs font-semibold text-neutral-200 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-white" />
            {mode === 'login' ? 'Entrar com Google' : 'Criar Conta com Google'}
          </button>

          {showGoogleFallback && (
            <form onSubmit={handleGoogleFallbackSubmit} className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
              <label className="block text-[11px] font-semibold text-neutral-300">
                Informe seu e-mail Google:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={googleFallbackEmail}
                  onChange={(e) => setGoogleFallbackEmail(e.target.value)}
                  placeholder="empresa@gmail.com"
                  className="flex-1 bg-neutral-900 border border-neutral-700 focus:border-white rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !googleFallbackEmail}
                  className="px-3 py-1.5 bg-white hover:bg-neutral-200 text-black font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  Continuar <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[10px] text-neutral-500">
                * Se já possui conta, você entrará diretamente. Se for nova empresa, sua conta será criada no banco de dados.
              </p>
            </form>
          )}
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-800 w-full"></div>
          <span className="bg-[#0e0e0e] px-3 text-[11px] text-neutral-500 font-semibold absolute">OU COM E-MAIL E SENHA</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Seu Nome</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-white rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Nome da Empresa</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="Ex: Techify Digital"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-white rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-white rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-white rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Autenticando...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" /> Entrar no Dashboard
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" /> Criar Conta da Empresa
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

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
} from '../lib/firebase';
import {
  loginWithGoogle as authServiceLoginWithGoogle,
} from '../lib/authService';
import { PlanType } from '../types/auth';

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
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('professional');
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
      // Only the Firebase Auth Google popup can prove ownership of a Google account.
      await authServiceLoginWithGoogle(selectedPlan);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Erro no login Google:', err);
      if (err?.code === 'auth/unauthorized-domain') {
        setErrorMsg('Este domínio não está autorizado no Firebase. Adicione agency-os-by-techify.vercel.app em Authentication > Settings > Authorized domains.');
      } else if (err?.code === 'auth/popup-blocked') {
        setErrorMsg('O navegador bloqueou a janela do Google. Autorize pop-ups para este site e tente novamente.');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('O login do Google foi cancelado.');
      } else {
        setErrorMsg(err?.message || 'Não foi possível entrar com o Google.');
      }
    } finally {
      setLoading(false);
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
              ? 'Entre com uma conta autenticada pelo Google ou com seu e-mail e senha.'
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

        {/* Plan selection on signup for 14-day trial */}
        {mode === 'signup' && (
          <div className="space-y-1.5 p-3 bg-neutral-900/60 border border-neutral-800 rounded-2xl">
            <label className="text-[11px] font-semibold text-neutral-300 block">
              Plano com 14 Dias de Teste Grátis:
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
              {(['starter', 'professional', 'enterprise'] as PlanType[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPlan(p)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                    selectedPlan === p
                      ? 'bg-lime-400 text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-lime-400/90 font-medium">
              ✓ 14 dias de acesso completo sem cartão de crédito.
            </p>
          </div>
        )}

        {/* Google Authentication Option (Available for both Login and Signup) */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-white" />
            {mode === 'login' ? 'Entrar com Conta Google' : 'Criar Conta com Conta Google'}
          </button>


        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-800 w-full"></div>
          <span className="bg-[#0e0e0e] px-3 text-[11px] text-neutral-500 font-semibold absolute">
            OU COM E-MAIL E SENHA
          </span>
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
            <label className="block text-xs font-semibold text-neutral-300 mb-1">E-mail Cadastrado</label>
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
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-neutral-300">
                Senha
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'login' ? 'Sua senha' : 'Mínimo 6 caracteres'}
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

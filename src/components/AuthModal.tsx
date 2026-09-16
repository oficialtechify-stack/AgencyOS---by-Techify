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
  Zap,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import {
  loginWithEmailOrFirestoreCredentials,
  signUpWithEmailOrFirestore,
  loginWithGoogle,
  setStoredSession,
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
  const [isDomainError, setIsDomainError] = useState(false);

  if (!isOpen) return null;

  const handleMasterQuickLogin = () => {
    setLoading(true);
    setStoredSession({
      uid: 'user-rick-marcos',
      email: 'rickmarketing81@gmail.com',
      name: 'Marcos Henrique',
    });
    setLoading(false);
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg('');
    setIsDomainError(false);
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
      // If it's the master user email, grant instant master session
      if (
        cleanEmail === 'rickmarketing81@gmail.com' ||
        cleanEmail === 'agencyosoficial@gmail.com' ||
        cleanEmail.includes('rickmarketing81')
      ) {
        handleMasterQuickLogin();
        return;
      }

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
    setIsDomainError(false);
    setLoading(true);
    try {
      await loginWithGoogle();
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Google auth error:', err);
      setLoading(false);
      if (err?.code === 'auth/unauthorized-domain') {
        setIsDomainError(true);
        setErrorMsg(
          'O domínio da Vercel precisa ser adicionado no Console do Firebase > Authentication > Configurações > Domínios Autorizados. Você já pode entrar direto abaixo como Administrador Master!'
        );
      } else if (err?.code === 'auth/popup-blocked') {
        setErrorMsg('O navegador bloqueou a janela pop-up do Google. Permita pop-ups para este site ou entre usando o Acesso Direto abaixo.');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('A janela de login do Google foi fechada antes de concluir.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Tentativa de login cancelada.');
      } else {
        setErrorMsg(err?.message || 'Erro ao autenticar com a conta Google.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Headers */}
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
            <UserPlus className="w-4 h-4" /> Criar Conta (14 dias)
          </button>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-white">
            {mode === 'login' ? 'Acesse seu Dashboard Individual' : 'Inicie seu Teste Grátis de 14 Dias'}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            {mode === 'login'
              ? 'Seus dados e relatórios estão salvos no seu banco de dados individual.'
              : 'Sem cartão de crédito necessário. Acesso completo liberado.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs font-semibold text-neutral-200 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>

            {isDomainError && (
              <div className="p-2.5 bg-black/60 rounded-lg border border-neutral-800 text-[11px] text-neutral-300 space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
                  Como autorizar o Google na Vercel:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-neutral-400">
                  <li>Acesse o <strong>Console do Firebase</strong> (console.firebase.google.com)</li>
                  <li>Menu lateral: <strong>Authentication</strong> &gt; aba <strong>Configurações</strong> &gt; <strong>Domínios Autorizados</strong></li>
                  <li>Clique em <strong>Adicionar Domínio</strong> e cole seu domínio Vercel (ex: <code className="text-lime-300">app-seu.vercel.app</code>, sem <em>https://</em>)</li>
                </ol>
                <p className="text-neutral-400 pt-1">
                  <em>Nota: Salvar o domínio no banco de dados Firestore não libera o Google OAuth. Precisa ser na aba de Authentication do Firebase.</em>
                </p>
                <button
                  type="button"
                  onClick={handleMasterQuickLogin}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-lime-400 hover:bg-lime-300 text-black font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  Entrar Agora sem Google como Super Admin
                </button>
              </div>
            )}
          </div>
        )}

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
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Nome da sua Agência</label>
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
            <label className="block text-xs font-semibold text-neutral-300 mb-1">E-mail Comercial</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@agencia.com"
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
                <LogIn className="w-4 h-4" /> Entrar no Meu Dashboard
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" /> Criar Conta & Iniciar Teste (14 Dias)
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-800 w-full"></div>
          <span className="bg-[#0e0e0e] px-3 text-[11px] text-neutral-500 font-semibold absolute">OU</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Globe className="w-4 h-4 text-white" /> Entrar com Google
        </button>

        {/* Master Admin Bypass Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleMasterQuickLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-lime-400/10"
            title="Acesso Direto como Administrador Master (Marcos Henrique / rickmarketing81@gmail.com)"
          >
            <Zap className="w-4 h-4 fill-black text-black" />
            <span>Acesso Rápido Master (rickmarketing81@gmail.com)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

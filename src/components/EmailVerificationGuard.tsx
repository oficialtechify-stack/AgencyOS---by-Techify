import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertTriangle, RefreshCw, LogOut, ShieldCheck, Send } from 'lucide-react';
import { User } from 'firebase/auth';
import { auth, sendUserVerificationEmail, logoutUser } from '../lib/firebase';

interface EmailVerificationGuardProps {
  user: User;
  onVerificationSuccess: () => void;
}

export const EmailVerificationGuard: React.FC<EmailVerificationGuardProps> = ({
  user,
  onVerificationSuccess,
}) => {
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCheckVerification = async () => {
    setChecking(true);
    setMessage(null);
    try {
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified) {
        setMessage({
          type: 'success',
          text: 'E-mail verificado com sucesso! Redirecionando para o painel...',
        });
        setTimeout(() => {
          onVerificationSuccess();
        }, 1200);
      } else {
        setMessage({
          type: 'error',
          text: 'Seu e-mail ainda não foi verificado. Por favor, clique no link recebido em sua caixa de entrada e tente novamente.',
        });
      }
    } catch (err: any) {
      console.error('Error checking verification:', err);
      setMessage({
        type: 'error',
        text: 'Erro ao verificar status do e-mail. Tente novamente.',
      });
    } finally {
      setChecking(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    setMessage(null);
    try {
      await sendUserVerificationEmail(auth.currentUser);
      setMessage({
        type: 'success',
        text: `Link de verificação reenviado para ${user.email}. Verifique também a pasta de spam.`,
      });
    } catch (err: any) {
      console.error('Error resending verification:', err);
      setMessage({
        type: 'error',
        text: err.message || 'Erro ao reenviar o e-mail de verificação.',
      });
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-neutral-200 relative animate-fade-in text-center">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white mx-auto mb-4">
          <Mail className="w-8 h-8" />
        </div>

        {/* Security Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs font-bold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-white" /> Verificação de E-mail Obrigatória
        </div>

        {/* Title & Description */}
        <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
          Confirme seu e-mail para continuar
        </h2>

        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-4">
          Enviamos uma mensagem de confirmação para o e-mail:
        </p>

        <div className="bg-neutral-900 border border-neutral-700 px-4 py-2.5 rounded-xl font-mono text-sm text-white font-bold mb-5 break-all">
          {user.email}
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed mb-6">
          Para garantir a segurança da sua agência e desbloquear o acesso completo ao dashboard AgencyOS, acesse sua caixa de entrada (e pasta de spam) e clique no link de confirmação.
        </p>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold mb-5 flex items-center gap-2.5 text-left border ${
              message.type === 'success'
                ? 'bg-neutral-900 border-neutral-700 text-white'
                : 'bg-neutral-900 border-neutral-700 text-neutral-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-neutral-400" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Primary & Secondary Actions */}
        <div className="space-y-3">
          <button
            onClick={handleCheckVerification}
            disabled={checking}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {checking ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Verificando status...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Já verifiquei meu e-mail / Liberar Acesso
              </>
            )}
          </button>

          <button
            onClick={handleResendEmail}
            disabled={resending}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {resending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-neutral-400" /> Reenviando...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-neutral-400" /> Reenviar E-mail de Verificação
              </>
            )}
          </button>
        </div>

        {/* Footer Logout */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <span>Cadastrou o e-mail errado?</span>
          <button
            onClick={handleLogout}
            className="text-neutral-400 hover:text-white font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
};

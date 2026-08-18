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
    <div className="fixed inset-0 z-50 bg-[#090b10]/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111420] border border-[#22283a] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-gray-200 relative animate-fade-in text-center">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
          <Mail className="w-8 h-8" />
        </div>

        {/* Security Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> Verificação de E-mail Obrigatória
        </div>

        {/* Title & Description */}
        <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
          Confirme seu e-mail para continuar
        </h2>

        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
          Enviamos uma mensagem de confirmação para o e-mail:
        </p>

        <div className="bg-[#181d2e] border border-[#283048] px-4 py-2.5 rounded-xl font-mono text-sm text-[#a3e635] font-bold mb-5 break-all">
          {user.email}
        </div>

        <p className="text-xs text-gray-400 leading-relaxed mb-6">
          Para garantir a segurança da sua agência e desbloquear o acesso completo ao dashboard AgencyOS, acesse sua caixa de entrada (e pasta de spam) e clique no link de confirmação.
        </p>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold mb-5 flex items-center gap-2.5 text-left border ${
              message.type === 'success'
                ? 'bg-[#12281b] border-[#22c55e]/30 text-[#22c55e]'
                : 'bg-[#2d1418] border-red-500/30 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Primary & Secondary Actions */}
        <div className="space-y-3">
          <button
            onClick={handleCheckVerification}
            disabled={checking}
            className="w-full py-3 px-4 rounded-xl bg-[#a3e635] hover:bg-[#bef264] text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#a3e635]/20 transition-all disabled:opacity-50"
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
            className="w-full py-2.5 px-4 rounded-xl bg-[#1a1f30] hover:bg-[#232a40] text-gray-200 border border-[#2b344d] font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {resending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> Reenviando...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-amber-400" /> Reenviar E-mail de Verificação
              </>
            )}
          </button>
        </div>

        {/* Footer Logout */}
        <div className="mt-6 pt-4 border-t border-[#1e2436] flex items-center justify-between text-xs text-gray-500">
          <span>Cadastrou o e-mail errado?</span>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-400 font-bold flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
};

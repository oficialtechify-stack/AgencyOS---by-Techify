import React, { useState } from 'react';
import { Zap, Check, ArrowLeft, Clock } from 'lucide-react';
import { ViewMode, UserProfile } from '../types';

interface TrialSignupViewProps {
  onStartTrial: (data: { name: string; email: string; agencyName: string }) => void;
  onNavigate?: (view: ViewMode) => void;
  onBackToLanding?: () => void;
}

export const TrialSignupView: React.FC<TrialSignupViewProps> = ({
  onStartTrial,
  onNavigate,
  onBackToLanding,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agencyName, setAgencyName] = useState('Techify Agency');

  const handleBack = () => {
    if (onNavigate) onNavigate('landing');
    else if (onBackToLanding) onBackToLanding();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onStartTrial({
      name: name.trim(),
      email: email.trim(),
      agencyName: agencyName.trim() || 'Sua Agência',
    });
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-200 font-sans flex items-center justify-center p-4 relative selection:bg-[#22c55e] selection:text-black">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#22c55e]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-[#11131c] border border-[#22c55e]/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10 space-y-6">
        {/* Back Link */}
        <button
          onClick={handleBack}
          className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o site
        </button>

        {/* Top Header & Badge */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#1a381c] border border-[#22c55e] flex items-center justify-center text-[#22c55e] mx-auto shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <Zap className="w-8 h-8 fill-[#22c55e]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#183218] border border-[#22c55e]/40 text-xs font-bold text-[#22c55e]">
            <Clock className="w-3.5 h-3.5" />
            <span>14 dias gratuitos — sem cartão</span>
          </div>

          <h1 className="text-2xl font-black text-white">Comece seu trial grátis</h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            Acesse todos os módulos por 14 dias sem pagar nada. Após o período, escolha o plano
            ideal.
          </p>
        </div>

        {/* Features Checklist */}
        <div className="p-4 rounded-2xl bg-[#161824] border border-[#22283a] space-y-2 text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#22c55e] shrink-0" />
            <span>Dashboard Financeiro completo</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#22c55e] shrink-0" />
            <span>Fluxo de Caixa</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#22c55e] shrink-0" />
            <span>Agenda inteligente</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#22c55e] shrink-0" />
            <span>Kanban de projetos</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#22c55e] shrink-0" />
            <span>Calculadora de ROI</span>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Seu Nome Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Marcos Henrique"
              className="w-full bg-[#181a26] border border-[#2a2f44] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Seu Email Corporativo
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rickmarketing81@gmail.com"
              className="w-full bg-[#181a26] border border-[#2a2f44] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e] transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:opacity-90 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>Iniciar 14 dias grátis →</span>
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={handleBack}
            className="text-xs text-gray-400 hover:text-white underline decoration-gray-600 transition-colors"
          >
            Já tem uma conta? Ver planos pagos
          </button>
        </div>
      </div>
    </div>
  );
};

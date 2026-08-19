import React, { useState } from 'react';
import { Zap, Check, ArrowLeft, Clock } from 'lucide-react';
import { ViewMode } from '../types';

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
    <div className="min-h-screen bg-[#070707] text-neutral-200 font-sans flex items-center justify-center p-4 relative selection:bg-white selection:text-black">
      <div className="w-full max-w-md bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Back Link */}
        <button
          onClick={handleBack}
          className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o site
        </button>

        {/* Top Header & Badge */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-black mx-auto shadow-lg">
            <Zap className="w-8 h-8 fill-black" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-xs font-bold text-neutral-200">
            <Clock className="w-3.5 h-3.5" />
            <span>14 dias gratuitos — sem cartão</span>
          </div>

          <h1 className="text-2xl font-black text-white">Comece seu trial grátis</h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Acesse todos os módulos por 14 dias sem pagar nada. Após o período, escolha o plano ideal.
          </p>
        </div>

        {/* Features Checklist */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-white shrink-0" />
            <span>Dashboard Financeiro completo</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-white shrink-0" />
            <span>Fluxo de Caixa</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-white shrink-0" />
            <span>Agenda inteligente</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-white shrink-0" />
            <span>Kanban de projetos</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-white shrink-0" />
            <span>Calculadora de ROI</span>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5">
              Seu Nome Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Marcos Henrique"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5">
              Seu Email Corporativo
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rickmarketing81@gmail.com"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>Iniciar 14 dias grátis →</span>
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={handleBack}
            className="text-xs text-neutral-400 hover:text-white underline decoration-neutral-600 transition-colors cursor-pointer"
          >
            Já tem uma conta? Ver planos pagos
          </button>
        </div>
      </div>
    </div>
  );
};

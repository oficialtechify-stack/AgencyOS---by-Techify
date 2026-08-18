import React, { useState } from 'react';
import { Lock, Check, Zap, Sparkles, Shield, CreditCard, QrCode, CheckCircle2, ArrowRight } from 'lucide-react';
import { FirestoreUserProfile, updateUserProfile } from '../lib/firebase';

interface TrialPaywallOverlayProps {
  userProfile: FirestoreUserProfile | null;
  isOpen: boolean;
  isForceLocked?: boolean;
  onClose: () => void;
  onPlanActivated?: (newPlan: 'Starter' | 'Pro' | 'Agency') => void;
}

export const TrialPaywallOverlay: React.FC<TrialPaywallOverlayProps> = ({
  userProfile,
  isOpen,
  isForceLocked = false,
  onClose,
  onPlanActivated,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'Starter' | 'Pro' | 'Agency'>('Pro');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen && !isForceLocked) return null;

  const handleConfirmSubscription = async () => {
    if (!userProfile) return;
    setIsProcessing(true);

    // Simulate instant gateway processing
    await new Promise((res) => setTimeout(res, 1200));

    try {
      await updateUserProfile(userProfile.uid, {
        plan: selectedPlan,
        status: 'active',
      });

      setSuccessMsg(true);
      if (onPlanActivated) {
        onPlanActivated(selectedPlan);
      }

      setTimeout(() => {
        setSuccessMsg(false);
        setIsProcessing(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Erro ao ativar plano:', err);
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: 'Starter',
      name: 'Starter',
      price: '97',
      period: '/mês',
      description: 'Ideal para freelancers e gestores de tráfego solo.',
      features: [
        'Até 10 clientes ativos',
        'Controle de Fluxo de Caixa',
        'Gestão de Campanhas Meta & Google',
        'Agenda de Reuniões Básica',
        'Suporte por e-mail',
      ],
      isPopular: false,
    },
    {
      id: 'Pro',
      name: 'Pro Agency',
      price: '197',
      period: '/mês',
      description: 'O mais completo para agências em crescimento rápido.',
      features: [
        'Clientes Ilimitados',
        'Google Maps Scraper B2B Ilimitado',
        'I.A. Consultora (Gemini 3.6)',
        'Social Hub & Gerador de Posts I.A.',
        'Kanban de Tarefas & Estoque',
        'Relatórios Executivos em TXT e PDF',
      ],
      isPopular: true,
    },
    {
      id: 'Agency',
      name: 'Agency Scale',
      price: '397',
      period: '/mês',
      description: 'Para grandes operações com múltiplos times e white-label.',
      features: [
        'Tudo do Plano Pro',
        'Multi-Usuários & Acesso Equipe',
        'Relatórios White-Label com Logotipo',
        'Suporte VIP Prioritário WhatsApp',
        'Consultoria Mensal de Processos',
      ],
      isPopular: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#0f111a] border border-[#22c55e]/40 rounded-3xl p-6 sm:p-10 shadow-[0_0_80px_rgba(34,197,94,0.25)] relative my-8 space-y-8">
        {!isForceLocked && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white text-sm font-bold bg-[#1a1d2d] px-3 py-1.5 rounded-xl border border-gray-700 transition-colors"
          >
            Fechar
          </button>
        )}

        {/* Header Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          {isForceLocked ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 text-xs font-black uppercase tracking-wider animate-pulse">
              <Lock className="w-4 h-4" /> Período de Teste de 14 Dias Expirado
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#183a1b] border border-[#22c55e]/50 text-[#39e01e] text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Faça Upgrade e Desbloqueie Todo o Potencial
            </div>
          )}

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {isForceLocked
              ? 'Escolha seu plano para continuar acessando o AgencyOS'
              : 'Evolua sua agência para o próximo nível'}
          </h2>
          <p className="text-sm text-gray-400">
            Acesso imediato a todos os módulos: CRM B2B Scraper, I.A. Consultora, Tráfego Pago, Fluxo de Caixa e Kanban.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isSelected = selectedPlan === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id as any)}
                className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-200 border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#141a29] border-[#22c55e] shadow-[0_0_30px_rgba(34,197,94,0.3)] scale-[1.02]'
                    : 'bg-[#121420] border-[#1f2436] hover:border-gray-600'
                }`}
              >
                {p.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                    Mais Popular 🔥
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#22c55e] bg-[#22c55e]' : 'border-gray-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-black font-extrabold" />}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mb-4 min-h-[36px]">{p.description}</p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-xs font-semibold text-gray-400">R$</span>
                    <span className="text-3xl font-black text-white">{p.price}</span>
                    <span className="text-xs text-gray-400 font-medium">{p.period}</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-gray-300 border-t border-[#1d2235] pt-4">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1d2235]">
                  <div
                    className={`w-full py-2.5 rounded-xl font-extrabold text-xs text-center transition-all ${
                      isSelected
                        ? 'bg-[#22c55e] text-black shadow-md'
                        : 'bg-[#1b1f2e] text-gray-300 hover:bg-[#252b3f]'
                    }`}
                  >
                    {isSelected ? 'Plano Selecionado' : 'Selecionar Plano'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment & Instant Activation Section */}
        <div className="bg-[#131624] border border-[#22c55e]/30 rounded-2xl p-6 space-y-4 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#20263b] pb-4">
            <div>
              <h4 className="font-bold text-white text-sm">Forma de Pagamento para Liberação Instantânea</h4>
              <p className="text-xs text-gray-400">Ativação imediata no seu banco de dados</p>
            </div>

            <div className="flex items-center gap-2 bg-[#0c0e17] p-1 rounded-xl border border-gray-800">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  paymentMethod === 'pix'
                    ? 'bg-[#22c55e] text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" /> Pix Instantâneo
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cartao')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  paymentMethod === 'cartao'
                    ? 'bg-[#22c55e] text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" /> Cartão de Crédito
              </button>
            </div>
          </div>

          {successMsg ? (
            <div className="p-4 bg-[#143217] border border-[#22c55e] rounded-xl flex items-center justify-center gap-3 text-[#39e01e] font-extrabold text-sm animate-fade-in">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
              <span>Plano {selectedPlan} ativado com sucesso! Desbloqueando plataforma...</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Shield className="w-4 h-4 text-[#22c55e]" />
                <span>Garantia incondicional de 7 dias • Cancele quando quiser</span>
              </div>

              <button
                onClick={handleConfirmSubscription}
                disabled={isProcessing}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:opacity-90 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(34,197,94,0.4)] transition-all hover:scale-105 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Processando Ativação...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-black" />
                    <span>Ativar Plano {selectedPlan} Agora</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

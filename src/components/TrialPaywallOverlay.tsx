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
      price: '197',
      period: '/mês',
      description: 'Ideal para freelancers e prestadores solo.',
      features: [
        'Dashboard Financeiro (MRR, LTV, CAC)',
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
      price: '497',
      period: '/mês',
      description: 'O mais completo para agências em escala.',
      features: [
        'Clientes Ilimitados',
        'Google Maps Scraper B2B Ilimitado',
        'I.A. Consultora Copilot',
        'Social Hub & Gerador de Posts I.A.',
        'Kanban de Tarefas & Estoque',
        'Relatórios Executivos em TXT e PDF',
      ],
      isPopular: true,
    },
    {
      id: 'Agency',
      name: 'Agency Enterprise',
      price: '997',
      period: '/mês',
      description: 'Para grandes operações e redes de agências.',
      features: [
        'Tudo do Plano Pro',
        'Multi-Usuários Ilimitados',
        'Relatórios White-Label com Logotipo',
        'Suporte VIP Prioritário WhatsApp',
        'Gerente de Contas Dedicado',
      ],
      isPopular: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative my-8 space-y-8">
        {!isForceLocked && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-neutral-400 hover:text-white text-sm font-bold bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-700 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        )}

        {/* Header Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          {isForceLocked ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-700 text-white text-xs font-black uppercase tracking-wider">
              <Lock className="w-4 h-4" /> Período de Teste de 14 Dias Expirado
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-white" /> Faça Upgrade e Desbloqueie Todo o Potencial
            </div>
          )}

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {isForceLocked
              ? 'Escolha seu plano para continuar acessando o AgencyOS'
              : 'Evolua sua agência para o próximo nível'}
          </h2>
          <p className="text-sm text-neutral-400">
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
                    ? 'bg-neutral-900 border-white shadow-xl scale-[1.02]'
                    : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600'
                }`}
              >
                {p.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                    Mais Escolhido
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-white bg-white text-black' : 'border-neutral-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-black font-extrabold" />}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 mb-4 min-h-[36px]">{p.description}</p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-xs font-semibold text-neutral-400">R$</span>
                    <span className="text-3xl font-black text-white">{p.price}</span>
                    <span className="text-xs text-neutral-400 font-medium">{p.period}</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-neutral-300 border-t border-neutral-800 pt-4">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-white shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800">
                  <div
                    className={`w-full py-2.5 rounded-xl font-extrabold text-xs text-center transition-all ${
                      isSelected
                        ? 'bg-white text-black shadow-md'
                        : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
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
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 space-y-4 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <h4 className="font-bold text-white text-sm">Forma de Pagamento para Liberação Instantânea</h4>
              <p className="text-xs text-neutral-400">Ativação imediata no seu banco de dados</p>
            </div>

            <div className="flex items-center gap-2 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'pix'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" /> Pix Instantâneo
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cartao')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'cartao'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" /> Cartão de Crédito
              </button>
            </div>
          </div>

          {successMsg ? (
            <div className="p-4 bg-neutral-900 border border-white rounded-xl flex items-center justify-center gap-3 text-white font-extrabold text-sm animate-fade-in">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
              <span>Plano {selectedPlan} ativado com sucesso! Desbloqueando plataforma...</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Shield className="w-4 h-4 text-white" />
                <span>Garantia incondicional de 7 dias • Cancele quando quiser</span>
              </div>

              <button
                onClick={handleConfirmSubscription}
                disabled={isProcessing}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
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

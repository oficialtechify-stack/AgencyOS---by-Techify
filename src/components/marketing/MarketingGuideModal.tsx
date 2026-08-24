import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Target,
  Megaphone,
  Calendar,
  Layers,
  Mail,
  FileText,
  Calculator,
  Sparkles,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface MarketingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tab: 'campanhas' | 'editorial' | 'funis' | 'emails' | 'copywriting' | 'ferramentas') => void;
}

const GUIDE_STEPS = [
  {
    id: 'overview',
    tab: 'campanhas' as const,
    badge: 'Visão Geral',
    icon: Target,
    iconColor: 'text-[#22c55e]',
    title: 'Bem-vindo ao Hub de Marketing & Lançamentos',
    subtitle: 'Sua central completa de aquisição de clientes, mídia paga, conteúdo e automações.',
    description:
      'O Hub de Marketing da AgencyOS foi projetado para unificar toda a operação de tráfego, nutrição e conversão da sua agência em um único ecossistema estratégico de alta performance.',
    highlights: [
      {
        title: 'Métricas em Tempo Real',
        desc: 'Acompanhe Leads Totais, Custo por Lead (CPL), Investimento, Faturamento Atribuído e ROAS Global.',
      },
      {
        title: 'Sem Dados Poluídos',
        desc: 'Seu painel começa 100% limpo e pronto para receber suas próprias campanhas e clientes.',
      },
      {
        title: 'Sincronização Nuvem',
        desc: 'Todos os cadastros e alterações são salvos automaticamente e compartilhados com sua equipe.',
      },
    ],
    proTip: 'Dica: Você pode acessar este guia a qualquer momento clicando no botão "Guia & Dicas" no cabeçalho.',
  },
  {
    id: 'campanhas',
    tab: 'campanhas' as const,
    badge: 'Mídia & Aquisição',
    icon: Megaphone,
    iconColor: 'text-[#22c55e]',
    title: '1. Campanhas & Lançamentos de Tráfego',
    subtitle: 'Gerencie orçamentos, metas de captação e retorno financeiro por canal.',
    description:
      'Cadastre campanhas de Inbound, Outbound, Lançamentos High-Ticket ou Remarketing em múltiplos canais (Meta Ads, Google Ads, TikTok Ads, LinkedIn Ads, etc.).',
    highlights: [
      {
        title: 'Metas e Captação',
        desc: 'Defina a meta de leads e acompanhe o percentual atingido com barra de progresso visual.',
      },
      {
        title: 'Cálculo de ROAS e CPL',
        desc: 'O sistema calcula automaticamente o Retorno sobre Investimento (ROAS) e Custo por Lead real.',
      },
      {
        title: 'Status Operacional',
        desc: 'Alterne rapidamente entre Planejamento, Ativa, Em Otimização, Pausada ou Concluída.',
      },
    ],
    proTip: 'Mantenha o CPL sempre abaixo do seu CAC alvo para garantir margens de lucro saudáveis.',
  },
  {
    id: 'editorial',
    tab: 'editorial' as const,
    badge: 'Produção de Conteúdo',
    icon: Calendar,
    iconColor: 'text-blue-400',
    title: '2. Calendário & Esteira Editorial',
    subtitle: 'Planeje pautas, carrosséis, vídeos e artigos por etapa do funil.',
    description:
      'Organize o cronograma de publicações de cada cliente, atribuindo responsáveis, personas, formatos e estágios estratégicos do funil de vendas.',
    highlights: [
      {
        title: 'Etapas do Funil',
        desc: 'Classifique cada conteúdo como Topo (Atração), Meio (Nutrição) ou Fundo (Conversão).',
      },
      {
        title: 'Esteira de Status',
        desc: 'Controle o fluxo desde a Ideia, Em Redação, Design / Revisão, Agendado até Publicado.',
      },
      {
        title: 'Estrutura & Cópia Rápida',
        desc: 'Guarde roteiros e copys no próprio card com botão de copiar em um clique.',
      },
    ],
    proTip: 'Equilibre sua grade editorial: 60% Topo de Funil (alcance), 30% Meio (autoridade) e 10% Fundo (venda direta).',
  },
  {
    id: 'funis',
    tab: 'funis' as const,
    badge: 'Jornada do Cliente',
    icon: Layers,
    iconColor: 'text-purple-400',
    title: '3. Estruturação de Funis de Conversão',
    subtitle: 'Mapeie as 5 etapas da jornada de compra de ponta a ponta.',
    description:
      'Visualize onde estão os gargalos da sua esteira comercial através de um fluxo linear estruturado: Visitantes → Leads → MQLs → SQLs → Vendas Fechadas.',
    highlights: [
      {
        title: 'Taxas de Conversão Entre Etapas',
        desc: 'Veja o percentual de retenção de uma etapa para outra para otimizar pontos de atrito.',
      },
      {
        title: 'Ticket Médio & Receita Total',
        desc: 'Projete o faturamento bruto multiplicando o número de vendas pelo ticket médio do produto.',
      },
      {
        title: 'Conversão Global',
        desc: 'Descubra a taxa exata de conversão de visitantes únicos em clientes pagantes.',
      },
    ],
    proTip: 'Se a taxa de Lead para MQL estiver abaixo de 20%, revise a promessa do seu anúncio ou qualificação da página.',
  },
  {
    id: 'emails',
    tab: 'emails' as const,
    badge: 'Nutrição Automática',
    icon: Mail,
    iconColor: 'text-amber-400',
    title: '4. E-mails & Réguas de Automação',
    subtitle: 'Engaje sua base com sequências automáticas baseadas em eventos.',
    description:
      'Monitore sequências de boas-vindas, onboarding de novos clientes, recuperação de carrinhos e nutrição de leads inativos.',
    highlights: [
      {
        title: 'Gatilhos de Disparo',
        desc: 'Vincule automações a eventos como "Cadastro no Formulário", "Download de Ebook" ou "Lead sem Contato".',
      },
      {
        title: 'Métricas de Engajamento',
        desc: 'Acompanhe Taxa de Abertura (Open Rate), Taxa de Cliques (CTR) e Taxa de Conversão final.',
      },
      {
        title: 'Número de Passos',
        desc: 'Controle a cadência e profundidade de cada fluxo (ex: 5 passos em 14 dias).',
      },
    ],
    proTip: 'Taxas de abertura saudáveis em B2B ficam entre 35% e 50%. Use assuntos personalizados e sem termos spam.',
  },
  {
    id: 'copywriting',
    tab: 'copywriting' as const,
    badge: 'Persuasão & Vendas',
    icon: FileText,
    iconColor: 'text-emerald-400',
    title: '5. Acervo de Copywriting & Scripts',
    subtitle: 'Sua biblioteca de ganchos virais, headlines e chamadas para ação.',
    description:
      'Armazene scripts comprovados de anúncios, cartas de vendas (VSL), posts de redes sociais e CTAs matadores para reaproveitar com velocidade.',
    highlights: [
      {
        title: 'Categorias Estratégicas',
        desc: 'Organize por Ganchos/Hooks, Headlines Matadoras, Scripts de VSL, Carrosséis ou CTAs.',
      },
      {
        title: 'Público-Alvo & Avaliação',
        desc: 'Indique a persona de destino e atribua notas em estrelas (1 a 5) para os melhores scripts.',
      },
      {
        title: 'Cópia Instantânea',
        desc: 'Copie apenas o gancho, apenas o CTA ou o roteiro completo formatado em um clique.',
      },
    ],
    proTip: 'O gancho nos primeiros 3 segundos de um vídeo ou na 1ª linha do texto é responsável por 80% do sucesso da copy.',
  },
  {
    id: 'ferramentas',
    tab: 'ferramentas' as const,
    badge: 'Simulação & IA',
    icon: Calculator,
    iconColor: 'text-yellow-400',
    title: '6. Simulador de ROI & Assistente de IA',
    subtitle: 'Valide a viabilidade financeira e gere copies inteligentes em segundos.',
    description:
      'Utilize calculadoras financeiras preditivas para simular orçamento, CPC, CAC e lucro esperado antes de colocar dinheiro em anúncios, além de gerar copys usando IA.',
    highlights: [
      {
        title: 'Simulador Preditivo de ROI',
        desc: 'Insira o investimento pretendido e taxa de conversão para estimar receita e retorno líquido.',
      },
      {
        title: 'Ponto de Equilíbrio (Break-Even)',
        desc: 'Descubra quantas vendas você precisa fazer para cobrir 100% dos custos de tráfego.',
      },
      {
        title: 'Gerador de Copy com IA',
        desc: 'Crie headlines e estruturas persuasivas instantaneamente e salve diretamente no seu acervo.',
      },
    ],
    proTip: 'Nunca inicie uma campanha sem antes rodar uma simulação de ROI para validar o ticket e a meta de vendas!',
  },
];

export const MarketingGuideModal: React.FC<MarketingGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = GUIDE_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === GUIDE_STEPS.length - 1;
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleGoToTab = () => {
    if (onSelectTab && currentStep.tab) {
      onSelectTab(currentStep.tab);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0c0e16] border border-[#1b2133] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header with Step Progress */}
        <div className="px-6 pt-5 pb-4 border-b border-[#161a25] flex items-center justify-between bg-[#0e111a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#141a29] border border-[#20273c] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[#22c55e]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#22c55e]">
                  Manual Interativo
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  Etapa {currentStepIndex + 1} de {GUIDE_STEPS.length}
                </span>
              </div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Guia Completo do Hub de Marketing
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Fechar Guia"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#121520] h-1.5 overflow-hidden">
          <div
            className="h-full bg-[#22c55e] transition-all duration-300 ease-out"
            style={{
              width: `${((currentStepIndex + 1) / GUIDE_STEPS.length) * 100}%`,
            }}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
          {/* Step Badge & Title */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-[#132219] text-[#22c55e] border border-[#22c55e]/30">
                {currentStep.badge}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-[#121726] border border-[#1d253a] shrink-0 mt-0.5">
                <Icon className={`w-6 h-6 ${currentStep.iconColor}`} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
                  {currentStep.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {currentStep.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Main Description */}
          <p className="text-xs text-gray-300 leading-relaxed bg-[#10131d] p-3.5 rounded-2xl border border-[#1a1f2e]">
            {currentStep.description}
          </p>

          {/* Highlights List */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Recursos & Funcionalidades:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentStep.highlights.map((h, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[#0f121d] border border-[#1b2133] space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                    <span>{h.title}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{h.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tip Box */}
          <div className="p-3.5 rounded-2xl bg-[#122116] border border-[#22c55e]/30 flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-200/90 leading-relaxed font-medium">
              {currentStep.proTip}
            </p>
          </div>
        </div>

        {/* Step Navigation Dots & Footer Actions */}
        <div className="px-6 py-4 border-t border-[#161a25] bg-[#0e111a] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Step Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {GUIDE_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 bg-[#22c55e]'
                    : 'w-2 bg-[#1b2133] hover:bg-gray-600'
                }`}
                title={`Ir para etapa ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="px-3 py-2 rounded-xl bg-[#141824] hover:bg-[#1f2638] text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            )}

            {!isLastStep && currentStep.tab && (
              <button
                onClick={handleGoToTab}
                className="px-3 py-2 rounded-xl bg-[#121622] hover:bg-[#1a2030] text-gray-300 text-xs font-medium border border-[#202738] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Explorar Esta Aba</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-[#22c55e] hover:bg-[#1eb054] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,197,94,0.3)] cursor-pointer transition-all"
            >
              <span>{isLastStep ? 'Concluir & Começar' : 'Próximo'}</span>
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

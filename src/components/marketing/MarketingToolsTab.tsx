import React, { useState } from 'react';
import {
  Sparkles,
  Calculator,
  DollarSign,
  TrendingUp,
  Target,
  ArrowRight,
  Copy,
  Check,
  Plus,
  Zap,
  Wand2,
} from 'lucide-react';
import { MarketingCopyScript } from '../../types';
import { TabGuideBanner } from './TabGuideBanner';

interface MarketingToolsTabProps {
  onAddCopyScript?: (copy: Omit<MarketingCopyScript, 'id'>) => Promise<void>;
  showToast: (msg: string) => void;
  onOpenFullGuide?: () => void;
}

export const MarketingToolsTab: React.FC<MarketingToolsTabProps> = ({
  onAddCopyScript,
  showToast,
  onOpenFullGuide,
}) => {
  const [toolView, setToolView] = useState<'simulador' | 'gerador-ia'>('simulador');

  // Simulator state
  const [budget, setBudget] = useState<number>(5000);
  const [cpc, setCpc] = useState<number>(2.5);
  const [lpConvRate, setLpConvRate] = useState<number>(15); // %
  const [salesConvRate, setSalesConvRate] = useState<number>(10); // %
  const [ticket, setTicket] = useState<number>(1997);

  // Computed projections
  const estimatedClicks = cpc > 0 ? Math.floor(budget / cpc) : 0;
  const estimatedLeads = Math.floor(estimatedClicks * (lpConvRate / 100));
  const estimatedSales = Math.floor(estimatedLeads * (salesConvRate / 100));
  const estimatedRevenue = estimatedSales * ticket;
  const estimatedProfit = estimatedRevenue - budget;
  const estimatedROAS = budget > 0 ? (estimatedRevenue / budget).toFixed(2) : '0.00';
  const estimatedCAC = estimatedSales > 0 ? (budget / estimatedSales).toFixed(2) : '0.00';
  const estimatedCPL = estimatedLeads > 0 ? (budget / estimatedLeads).toFixed(2) : '0.00';

  // Break-even sales
  const breakEvenSales = ticket > 0 ? Math.ceil(budget / ticket) : 0;

  // AI Generator state
  const [generatorNiche, setGeneratorNiche] = useState('Marketing Digital e Serviços B2B');
  const [generatorGoal, setGeneratorGoal] = useState('Captação de Clientes High-Ticket');
  const [generatedCopies, setGeneratedCopies] = useState<
    Array<{
      title: string;
      category: MarketingCopyScript['category'];
      hookText: string;
      bodyText: string;
      ctaText: string;
    }>
  >([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerateCopyTemplates = () => {
    const templates: typeof generatedCopies = [
      {
        title: `Gancho de Quebra de Objeção: ${generatorNiche}`,
        category: 'Gancho / Hook',
        hookText: `Se você ainda gasta mais de 3 horas por dia apagando incêndios operacionais em ${generatorNiche}, você tem um emprego e não uma empresa.`,
        bodyText: `A maioria dos empresários tenta escalar injetando mais esforço manual, quando a única alavanca real de lucro é processo validado e previsibilidade comercial.`,
        ctaText: `Toque no link da bio e receba nosso mapa gratuito de escala para ${generatorGoal}.`,
      },
      {
        title: `Headline Matadora de Alto Impacto`,
        category: 'Headline Matadora',
        hookText: `Como bater metas agressivas de ${generatorGoal} em 30 dias sem queimar verba de anúncios em leads desqualificados.`,
        bodyText: `Descubra a metodologia exata de posicionamento e conversão utilizada pelas agências que mais faturam no mercado.`,
        ctaText: `Agende agora sua sessão estratégica gratuita de diagnóstico.`,
      },
      {
        title: `Anúncio Meta Ads Direto ao Ponto`,
        category: 'Anúncio Meta',
        hookText: `Atenção: Se o seu CAC subiu e as vendas estagnaram este mês, pare de culpar o algoritmo.`,
        bodyText: `O problema quase nunca é o tráfego, e sim o funil desalinhado. Quando sua oferta fala diretamente com a dor aguda do tomador de decisão, o custo por lead cai pela metade.`,
        ctaText: `Clique em "Saiba Mais" e baixe a planilha de auditoria completa de tráfego.`,
      },
    ];
    setGeneratedCopies(templates);
    showToast('Novos scripts estratégicos gerados com sucesso!');
  };

  const handleSaveGeneratedToLibrary = async (template: (typeof generatedCopies)[0]) => {
    if (!onAddCopyScript) {
      showToast('Copy copiada para a área de transferência!');
      navigator.clipboard.writeText(`${template.hookText}\n\n${template.bodyText}\n\n${template.ctaText}`);
      return;
    }
    try {
      await onAddCopyScript({
        title: template.title,
        clientName: 'Gerador Estratégico',
        category: template.category,
        targetAudience: generatorNiche,
        hookText: template.hookText,
        bodyText: template.bodyText,
        ctaText: template.ctaText,
        rating: 5,
        createdAt: new Date().toISOString().split('T')[0],
      });
      showToast(`"${template.title}" adicionado ao acervo de Copywriting!`);
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar script no acervo.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Guide Banner */}
      <TabGuideBanner
        title="Simulação Financeira & Inteligência de Copy"
        badge="Ferramentas & Viabilidade"
        description="Calcule a viabilidade de campanhas antes de investir e gere ganchos de alta conversão para acelerar sua esteira de criação."
        tips={[
          {
            label: '1. Validação Prévia',
            text: 'Descubra quantas vendas precisa fechar (Break-Even) para pagar o tráfego investido.',
          },
          {
            label: '2. Estimativas Realistas',
            text: 'Ajuste CPC, taxa de conversão da Landing Page e taxa de fechamento comercial para testar cenários pessimistas e otimistas.',
          },
          {
            label: '3. Exportação para Acervo',
            text: 'Gere ideias de copy por IA e salve diretamente no seu Acervo com 1 clique.',
          },
        ]}
        benchmark="Trabalhe sempre com meta de CAC no máximo igual a 30% do LTV (Life-Time Value) do cliente."
        onOpenFullGuide={onOpenFullGuide}
      />

      {/* Sub-toolbar */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        <button
          onClick={() => setToolView('simulador')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            toolView === 'simulador'
              ? 'bg-white text-black shadow-sm'
              : 'bg-[#0e0e0e] text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Simulador de ROI & Metas de Vendas</span>
        </button>

        <button
          onClick={() => setToolView('gerador-ia')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            toolView === 'gerador-ia'
              ? 'bg-white text-black shadow-sm'
              : 'bg-[#0e0e0e] text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>Gerador Inteligente de Head/Hooks</span>
        </button>
      </div>

      {toolView === 'simulador' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
              <Target className="w-4 h-4 text-white" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Variáveis da Campanha
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between text-neutral-300 font-medium mb-1">
                  <span>Orçamento de Mídia (Investimento)</span>
                  <span className="text-white font-bold">
                    R$ {budget.toLocaleString('pt-BR')}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="100000"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-neutral-300 font-medium mb-1">
                  <span>Custo por Clique Médio (CPC)</span>
                  <span className="text-white font-bold">R$ {cpc.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={cpc}
                  onChange={(e) => setCpc(parseFloat(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-neutral-300 font-medium mb-1">
                  <span>Taxa de Conversão da Página (LP)</span>
                  <span className="text-white font-bold">{lpConvRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={lpConvRate}
                  onChange={(e) => setLpConvRate(parseFloat(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-neutral-300 font-medium mb-1">
                  <span>Taxa de Conversão Comercial (Vendas)</span>
                  <span className="text-white font-bold">{salesConvRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={salesConvRate}
                  onChange={(e) => setSalesConvRate(parseFloat(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-neutral-300 font-medium mb-1">
                  <span>Ticket Médio do Produto / Serviço</span>
                  <span className="text-white font-bold">
                    R$ {ticket.toLocaleString('pt-BR')}
                  </span>
                </div>
                <input
                  type="number"
                  value={ticket}
                  onChange={(e) => setTicket(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-[#141414] border border-neutral-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-neutral-600"
                />
              </div>
            </div>
          </div>

          {/* Projections Display */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-[#0e0e0e] border border-neutral-800 space-y-1">
                <div className="text-[10px] text-neutral-400 font-bold uppercase">Cliques Estimados</div>
                <div className="text-lg font-extrabold text-white">{estimatedClicks.toLocaleString('pt-BR')}</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0e0e0e] border border-neutral-800 space-y-1">
                <div className="text-[10px] text-neutral-300 font-bold uppercase">Leads Estimados</div>
                <div className="text-lg font-extrabold text-white">{estimatedLeads.toLocaleString('pt-BR')}</div>
                <div className="text-[10px] text-neutral-500">CPL R$ {estimatedCPL}</div>
              </div>
              <div className="p-4 rounded-xl bg-[#0e0e0e] border border-neutral-800 space-y-1">
                <div className="text-[10px] text-neutral-300 font-bold uppercase">Vendas Estimadas</div>
                <div className="text-lg font-extrabold text-white">{estimatedSales.toLocaleString('pt-BR')}</div>
                <div className="text-[10px] text-neutral-500">CAC R$ {estimatedCAC}</div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 space-y-1">
                <div className="text-[10px] text-white font-bold uppercase">Break-Even (Mín.)</div>
                <div className="text-lg font-extrabold text-white">{breakEvenSales} vendas</div>
              </div>
            </div>

            {/* Financial Return Big Box */}
            <div className="p-6 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase text-neutral-400 tracking-wider">
                    Retorno Financeiro Estimado
                  </div>
                  <div className="text-3xl font-extrabold text-white mt-1">
                    R$ {estimatedRevenue.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-400 font-medium">ROAS Projetado</div>
                  <div className="text-2xl font-extrabold text-white">{estimatedROAS}x</div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-medium">Lucro Líquido Operacional Previsto:</span>
                <span className={`font-extrabold text-base ${estimatedProfit >= 0 ? 'text-white' : 'text-red-400'}`}>
                  R$ {estimatedProfit.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {toolView === 'gerador-ia' && (
        <div className="p-6 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white" />
                Gerador Estratégico de Ângulos & Copies
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Crie ganchos de alta conversão para anúncios, posts e páginas com 1 clique.
              </p>
            </div>
            <button
              onClick={handleGenerateCopyTemplates}
              className="px-5 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 cursor-pointer shadow-sm transition-all"
            >
              <Zap className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Gerar Scripts & Ganchos</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">Nicho / Segmento</label>
              <input
                type="text"
                value={generatorNiche}
                onChange={(e) => setGeneratorNiche(e.target.value)}
                className="w-full bg-[#141414] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-neutral-600"
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">Objetivo da Campanha</label>
              <input
                type="text"
                value={generatorGoal}
                onChange={(e) => setGeneratorGoal(e.target.value)}
                className="w-full bg-[#141414] border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-neutral-600"
              />
            </div>
          </div>

          {generatedCopies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {generatedCopies.map((tmpl, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#121212] border border-neutral-800 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 border border-neutral-700">
                      {tmpl.category}
                    </span>
                    <h4 className="text-sm font-bold text-white">{tmpl.title}</h4>
                    <p className="text-xs text-neutral-300 italic bg-[#181818] p-2.5 rounded-xl border border-neutral-700/60">
                      "{tmpl.hookText}"
                    </p>
                    <p className="text-xs text-neutral-400 leading-relaxed">{tmpl.bodyText}</p>
                    <p className="text-xs text-white font-semibold">{tmpl.ctaText}</p>
                  </div>

                  <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleSaveGeneratedToLibrary(tmpl)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white border border-neutral-700 text-xs font-bold flex items-center gap-1.5 hover:bg-neutral-800 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Salvar no Acervo</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${tmpl.hookText}\n\n${tmpl.bodyText}\n\n${tmpl.ctaText}`
                        );
                        setCopiedIndex(idx);
                        setTimeout(() => setCopiedIndex(null), 2000);
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-700 cursor-pointer"
                      title="Copiar"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

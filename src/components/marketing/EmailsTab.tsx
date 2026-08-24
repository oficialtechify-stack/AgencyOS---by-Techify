import React from 'react';
import { MarketingEmailFlow } from '../../types';
import { Mail, Search, Plus, Edit3, Trash2, Send, Users, MousePointer, TrendingUp, Sparkles } from 'lucide-react';
import { TabGuideBanner } from './TabGuideBanner';

interface EmailsTabProps {
  emailFlows: MarketingEmailFlow[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenNewModal: () => void;
  onEditEmailFlow: (flow: MarketingEmailFlow) => void;
  onDeleteEmailFlow: (flow: MarketingEmailFlow) => void;
  onOpenFullGuide?: () => void;
}

export const EmailsTab: React.FC<EmailsTabProps> = ({
  emailFlows,
  searchTerm,
  onSearchChange,
  onOpenNewModal,
  onEditEmailFlow,
  onDeleteEmailFlow,
  onOpenFullGuide,
}) => {
  const filtered = emailFlows.filter(
    (flow) =>
      flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.triggerEvent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Tab Guide Banner */}
      <TabGuideBanner
        title="Automações de E-mail & Réguas de Nutrição"
        badge="Automação & Retenção"
        description="Acompanhe sequências de nutrição, fluxos de boas-vindas, onboarding e reengajamento de leads monitorando aberturas e cliques."
        tips={[
          {
            label: '1. Evento Gatilho',
            text: 'Defina claramente o evento disparador (ex: Cadastro no Formulário, Download de Material, Compra Concluída).',
          },
          {
            label: '2. Passos do Fluxo',
            text: 'Indique quantos e-mails compõem a sequência (ex: régua de 5 e-mails ao longo de 10 dias).',
          },
          {
            label: '3. Métricas de Conversão',
            text: 'Acompanhe a Taxa de Abertura (Open Rate), Taxa de Cliques (CTR) e Conversão final dos inscritos.',
          },
        ]}
        benchmark="Médias saudáveis: Abertura > 35%, Cliques > 12%, Conversão em Venda > 3%."
        onOpenFullGuide={onOpenFullGuide}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar fluxos de e-mail por nome, cliente ou gatilho..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#0e0e0e] border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
          />
        </div>
        <button
          onClick={onOpenNewModal}
          className="px-4 py-2 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 text-black stroke-[2.5]" />
          <span>Nova Automação de E-mail</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((flow) => (
          <div
            key={flow.id}
            className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 border border-neutral-700 font-mono">
                      {flow.stepsCount} Passos
                    </span>
                    <span className="text-xs text-neutral-400">
                      Cliente: <strong className="text-neutral-200">{flow.clientName || 'Interno'}</strong>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight mt-1.5">{flow.name}</h3>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEditEmailFlow(flow)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Editar Automação"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteEmailFlow(flow)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Excluir Automação"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 text-xs text-neutral-400 bg-[#141414] p-2.5 rounded-xl border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold uppercase block">Gatilho de Disparo:</span>
                <span className="text-neutral-200 font-semibold">{flow.triggerEvent || 'Cadastro direto'}</span>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-800/80 text-center">
              <div className="p-2 rounded-xl bg-[#121212] border border-neutral-800">
                <div className="text-[10px] text-neutral-500">Taxa de Abertura</div>
                <div className="text-sm font-extrabold text-white">{flow.openRate}%</div>
              </div>
              <div className="p-2 rounded-xl bg-[#121212] border border-neutral-800">
                <div className="text-[10px] text-neutral-500">Taxa de Clique</div>
                <div className="text-sm font-extrabold text-white">{flow.clickRate}%</div>
              </div>
              <div className="p-2 rounded-xl bg-[#121212] border border-neutral-800">
                <div className="text-[10px] text-neutral-500">Conversão Final</div>
                <div className="text-sm font-extrabold text-white">{flow.conversionRate}%</div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700 mx-auto flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Nenhum fluxo de e-mail configurado</h4>
              <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                Cadastre réguas de e-mail, sequências de boas-vindas e automações de nutrição para seus leads.
              </p>
            </div>
            <button
              onClick={onOpenNewModal}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Criar Primeira Automação</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

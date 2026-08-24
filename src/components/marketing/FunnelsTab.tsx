import React from 'react';
import { MarketingFunnel } from '../../types';
import { Layers, Plus, Search, Edit3, Trash2, TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { TabGuideBanner } from './TabGuideBanner';

interface FunnelsTabProps {
  funnels: MarketingFunnel[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenNewModal: () => void;
  onEditFunnel: (funnel: MarketingFunnel) => void;
  onDeleteFunnel: (funnel: MarketingFunnel) => void;
  onOpenFullGuide?: () => void;
}

export const FunnelsTab: React.FC<FunnelsTabProps> = ({
  funnels,
  searchTerm,
  onSearchChange,
  onOpenNewModal,
  onEditFunnel,
  onDeleteFunnel,
  onOpenFullGuide,
}) => {
  const filtered = funnels.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.trafficSource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Tab Guide Banner */}
      <TabGuideBanner
        title="Mapeamento e Diagnóstico de Funis de Conversão"
        badge="Jornada & Conversão"
        description="Mapeie o fluxo das 5 etapas da jornada de compra (Visitantes → Leads → MQLs → SQLs → Vendas) para identificar gargalos e otimizar taxas de passagem."
        tips={[
          {
            label: '1. As 5 Etapas do Funil',
            text: 'Alimente o número de Visitantes, Leads gerados, MQLs (qualificados por marketing), SQLs (oportunidades comerciais) e Vendas.',
          },
          {
            label: '2. Taxas de Passagem',
            text: 'O AgencyOS calcula automaticamente a conversão de cada etapa e a taxa global de visitantes em clientes.',
          },
          {
            label: '3. Ticket Médio & Faturamento',
            text: 'Insira o Ticket Médio para ver o faturamento bruto atribuído gerado pelo funil.',
          },
        ]}
        benchmark="Taxas ideais: Visitante para Lead (10-20%), Lead para MQL (30-40%), MQL para SQL (25-35%), SQL para Venda (20-30%)."
        onOpenFullGuide={onOpenFullGuide}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar funis por nome, cliente ou origem..."
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
          <span>Estruturar Novo Funil</span>
        </button>
      </div>

      <div className="space-y-4">
        {filtered.map((funnel) => {
          const leadRate = funnel.visitors > 0 ? ((funnel.leads / funnel.visitors) * 100).toFixed(1) : '0';
          const mqlRate = funnel.leads > 0 ? ((funnel.mqls / funnel.leads) * 100).toFixed(1) : '0';
          const sqlRate = funnel.mqls > 0 ? ((funnel.sqls / funnel.mqls) * 100).toFixed(1) : '0';
          const salesRate = funnel.sqls > 0 ? ((funnel.sales / funnel.sqls) * 100).toFixed(1) : '0';
          const totalRevenue = funnel.sales * funnel.averageTicket;
          const globalConversion = funnel.visitors > 0 ? ((funnel.sales / funnel.visitors) * 100).toFixed(2) : '0';

          return (
            <div
              key={funnel.id}
              className="p-6 rounded-2xl bg-[#0e0e0e] border border-neutral-800 hover:border-neutral-700 transition-all space-y-5 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 border border-neutral-700 font-mono">
                      {funnel.trafficSource}
                    </span>
                    <span className="text-xs text-neutral-400">
                      Cliente: <strong className="text-neutral-200">{funnel.clientName || 'Interno'}</strong>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight mt-1">{funnel.name}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right mr-2 hidden sm:block">
                    <div className="text-[10px] text-neutral-500">Faturamento Previsto</div>
                    <div className="text-sm font-extrabold text-white">
                      R$ {totalRevenue.toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <button
                    onClick={() => onEditFunnel(funnel)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Editar Funil"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteFunnel(funnel)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Excluir Funil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Funnel 5 Stages Pipeline */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* 1. Visitantes */}
                <div className="p-3.5 rounded-xl bg-[#121212] border border-neutral-800 space-y-1">
                  <div className="text-[10px] text-neutral-400 font-bold uppercase">1. Visitantes (Topo)</div>
                  <div className="text-base font-extrabold text-white">{funnel.visitors.toLocaleString('pt-BR')}</div>
                  <div className="text-[10px] text-neutral-500">100% tráfego total</div>
                </div>

                {/* 2. Leads */}
                <div className="p-3.5 rounded-xl bg-[#121212] border border-neutral-800 space-y-1">
                  <div className="text-[10px] text-neutral-300 font-bold uppercase">2. Leads (Captação)</div>
                  <div className="text-base font-extrabold text-white">{funnel.leads.toLocaleString('pt-BR')}</div>
                  <div className="text-[10px] text-neutral-400">{leadRate}% conversão</div>
                </div>

                {/* 3. MQLs */}
                <div className="p-3.5 rounded-xl bg-[#121212] border border-neutral-800 space-y-1">
                  <div className="text-[10px] text-neutral-300 font-bold uppercase">3. MQLs (Meio)</div>
                  <div className="text-base font-extrabold text-white">{funnel.mqls.toLocaleString('pt-BR')}</div>
                  <div className="text-[10px] text-neutral-400">{mqlRate}% qualificados</div>
                </div>

                {/* 4. SQLs */}
                <div className="p-3.5 rounded-xl bg-[#121212] border border-neutral-800 space-y-1">
                  <div className="text-[10px] text-neutral-300 font-bold uppercase">4. SQLs / Oport.</div>
                  <div className="text-base font-extrabold text-white">{funnel.sqls.toLocaleString('pt-BR')}</div>
                  <div className="text-[10px] text-neutral-400">{sqlRate}% agendados</div>
                </div>

                {/* 5. Vendas */}
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-700 space-y-1">
                  <div className="text-[10px] text-white font-bold uppercase">5. Vendas Fechadas</div>
                  <div className="text-base font-extrabold text-white">{funnel.sales.toLocaleString('pt-BR')}</div>
                  <div className="text-[10px] text-neutral-300">{salesRate}% fechamento ({globalConversion}% geral)</div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700 mx-auto flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Nenhum funil cadastrado</h4>
              <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                Estruture seu primeiro funil para mapear a jornada de compra e prever faturamento com precisão.
              </p>
            </div>
            <button
              onClick={onOpenNewModal}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Estruturar Primeiro Funil</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

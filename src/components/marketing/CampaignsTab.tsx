import React from 'react';
import { MarketingCampaign } from '../../types';
import {
  Megaphone,
  Trash2,
  Edit3,
  CheckCircle2,
  TrendingUp,
  Search,
  Plus,
  Target,
  Sparkles,
} from 'lucide-react';
import { TabGuideBanner } from './TabGuideBanner';

interface CampaignsTabProps {
  campaigns: MarketingCampaign[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenNewModal: () => void;
  onEditCampaign: (camp: MarketingCampaign) => void;
  onDeleteCampaign: (camp: MarketingCampaign) => void;
  onQuickStatusChange: (id: string, newStatus: MarketingCampaign['status']) => void;
  onOpenFullGuide?: () => void;
}

export const CampaignsTab: React.FC<CampaignsTabProps> = ({
  campaigns,
  searchTerm,
  onSearchChange,
  onOpenNewModal,
  onEditCampaign,
  onDeleteCampaign,
  onQuickStatusChange,
  onOpenFullGuide,
}) => {
  const filtered = campaigns.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.channel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Interactive Guide Banner */}
      <TabGuideBanner
        title="Gestão de Mídia Paga, Tráfego & Lançamentos"
        badge="Mídia & Aquisição"
        description="Planeje orçamentos de mídia paga, defina metas de captação de leads e acompanhe o retorno financeiro real (ROAS e CPL) por canal de aquisição."
        tips={[
          {
            label: '1. Orçamento e Metas',
            text: 'Defina o orçamento total previsto e a meta de captação de leads para calcular o CPL alvo.',
          },
          {
            label: '2. Acompanhamento Contínuo',
            text: 'Alimente o valor gasto e a receita gerada periodicamente para monitorar o ROAS em tempo real.',
          },
          {
            label: '3. Status Ágil',
            text: 'Alterne entre Planejamento, Ativa, Em Otimização e Concluída diretamente no card da campanha.',
          },
        ]}
        benchmark="Campanhas de Inbound de alta conversão costumam operar com ROAS acima de 3.0x e captação > 80% da meta."
        onOpenFullGuide={onOpenFullGuide}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar campanha por nome, cliente ou canal..."
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
          <span>Nova Campanha</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((camp) => {
          const leadProgress =
            camp.leadsGoal > 0
              ? Math.min(100, Math.round((camp.leadsGenerated / camp.leadsGoal) * 100))
              : 0;
          const roas = camp.spent > 0 ? (camp.revenue / camp.spent).toFixed(2) : '0.00';
          const cpl = camp.leadsGenerated > 0 ? (camp.spent / camp.leadsGenerated).toFixed(2) : '0.00';

          return (
            <div
              key={camp.id}
              className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 border border-neutral-700">
                        {camp.type}
                      </span>
                      <span className="text-[10px] font-semibold text-neutral-400 font-mono">
                        {camp.channel}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight mt-1.5">
                      {camp.title}
                    </h3>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      Cliente: <strong className="text-neutral-200">{camp.clientName || 'Interno'}</strong>
                      {camp.responsible && (
                        <span className="ml-2 text-neutral-500">· Resp: {camp.responsible}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditCampaign(camp)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Editar Campanha"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCampaign(camp)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="Excluir Campanha"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Status Selector */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 text-[11px]">Status Operacional:</span>
                  <select
                    value={camp.status}
                    onChange={(e) => onQuickStatusChange(camp.id, e.target.value as any)}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg border bg-neutral-900 border-neutral-700 text-white cursor-pointer focus:outline-none"
                  >
                    <option value="Planejamento">Planejamento</option>
                    <option value="Ativa">Ativa</option>
                    <option value="Em Otimização">Em Otimização</option>
                    <option value="Pausada">Pausada</option>
                    <option value="Concluída">Concluída</option>
                  </select>
                </div>

                {camp.notes && (
                  <p className="text-xs text-neutral-400 mt-3 leading-relaxed bg-[#141414] p-2.5 rounded-xl border border-neutral-800">
                    {camp.notes}
                  </p>
                )}
              </div>

              {/* Progress & Financials */}
              <div className="space-y-3 pt-3 border-t border-neutral-800/80">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-400">Captação de Leads</span>
                    <span className="font-bold text-white font-mono">
                      {camp.leadsGenerated} / {camp.leadsGoal} ({leadProgress}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all"
                      style={{ width: `${leadProgress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-lg bg-[#121212] border border-neutral-800">
                    <div className="text-[10px] text-neutral-500">Investido</div>
                    <div className="text-xs font-bold text-neutral-200">
                      R$ {camp.spent.toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#121212] border border-neutral-800">
                    <div className="text-[10px] text-neutral-500">Receita</div>
                    <div className="text-xs font-bold text-white">
                      R$ {camp.revenue.toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#121212] border border-neutral-800">
                    <div className="text-[10px] text-neutral-500">ROAS</div>
                    <div className="text-xs font-bold text-white">{roas}x</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#121212] border border-neutral-800">
                    <div className="text-[10px] text-neutral-500">CPL</div>
                    <div className="text-xs font-bold text-neutral-200">R$ {cpl}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700 mx-auto flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Nenhuma campanha cadastrada</h4>
              <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                Comece planejando sua primeira campanha de tráfego, lançamento ou captação de leads.
              </p>
            </div>
            <button
              onClick={onOpenNewModal}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Criar Primeira Campanha</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

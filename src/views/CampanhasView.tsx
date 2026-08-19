import React, { useState } from 'react';
import { Megaphone, Plus, Trash2, TrendingUp, DollarSign, MousePointer, Target } from 'lucide-react';
import { AdCampaign } from '../types';

interface CampanhasViewProps {
  campaigns?: AdCampaign[];
  onAddCampaign?: (campaign: Omit<AdCampaign, 'id'>) => void;
  onDeleteCampaign?: (id: string) => void;
}

export const CampanhasView: React.FC<CampanhasViewProps> = ({
  campaigns = [],
  onAddCampaign,
  onDeleteCampaign,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<'Meta Ads' | 'Google Ads' | 'TikTok Ads' | 'LinkedIn Ads'>('Meta Ads');
  const [spend, setSpend] = useState('');
  const [revenue, setRevenue] = useState('');
  const [clicks, setClicks] = useState('');
  const [conversions, setConversions] = useState('');

  const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + c.revenue, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0);
  const avgRoas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '0.00';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const sp = parseFloat(spend) || 0;
    const rev = parseFloat(revenue) || 0;
    const clk = parseInt(clicks) || 0;
    const conv = parseInt(conversions) || 0;
    const roasCalc = sp > 0 ? parseFloat((rev / sp).toFixed(2)) : 0;

    if (onAddCampaign) {
      onAddCampaign({
        name: name.trim(),
        platform,
        spend: sp,
        revenue: rev,
        roas: roasCalc,
        clicks: clk,
        conversions: conv,
        status: 'Ativa',
      });
    }

    setShowModal(false);
    setName('');
    setSpend('');
    setRevenue('');
    setClicks('');
    setConversions('');
  };

  return (
    <div className="space-y-6 text-neutral-200 font-sans max-w-7xl mx-auto pb-16">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400">
            <span>INVESTIMENTO</span>
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-black text-white">
            R$ {totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-neutral-500">Gasto em mídia paga</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400">
            <span>RECEITA GERADA</span>
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-black text-white">
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-neutral-500">Retorno de vendas</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400">
            <span>ROAS MÉDIO</span>
            <Target className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-black text-white">{avgRoas}x</div>
          <p className="text-[10px] text-neutral-500">Multiplicador do investimento</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400">
            <span>TOTAL CLIQUES</span>
            <MousePointer className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-black text-white">{totalClicks.toLocaleString('pt-BR')}</div>
          <p className="text-[10px] text-neutral-500">Tráfego enviado aos funis</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400">
            <span>CONVERSÕES</span>
            <Target className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-black text-white">{totalConversions.toLocaleString('pt-BR')}</div>
          <p className="text-[10px] text-neutral-500">Leads & compras</p>
        </div>
      </div>

      {/* Main Campaign List Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-white" /> Gestão de Anúncios & Performance
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" /> + Nova Campanha
        </button>
      </div>

      {/* Campaign Cards Table */}
      <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800">
        {campaigns.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            Nenhuma campanha cadastrada. Clique em "+ Nova Campanha" para registrar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-neutral-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-lg">Nome da Campanha</th>
                  <th className="p-3">Plataforma</th>
                  <th className="p-3">Gasto (R$)</th>
                  <th className="p-3">Retorno (R$)</th>
                  <th className="p-3">ROAS</th>
                  <th className="p-3">Cliques</th>
                  <th className="p-3">Conversões</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right rounded-r-lg">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-3 font-bold text-white">{c.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900 border border-neutral-700 text-neutral-200">
                        {c.platform}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-neutral-300">
                      R$ {c.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 font-bold text-white">
                      R$ {c.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 font-extrabold text-white">{c.roas}x</td>
                    <td className="p-3 text-neutral-300">{c.clicks.toLocaleString('pt-BR')}</td>
                    <td className="p-3 text-neutral-300">{c.conversions.toLocaleString('pt-BR')}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900 border border-neutral-700 text-white">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeleteCampaign && onDeleteCampaign(c.id)}
                        className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                        title="Excluir campanha"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e0e0e] border border-neutral-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Cadastrar Campanha de Tráfego</h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">Nome da Campanha</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Meta Ads Conversão Whatsapp"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Plataforma</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-white"
                >
                  <option value="Meta Ads">Meta Ads (Instagram / Facebook)</option>
                  <option value="Google Ads">Google Ads (Pesquisa / YouTube)</option>
                  <option value="TikTok Ads">TikTok Ads</option>
                  <option value="LinkedIn Ads">LinkedIn Ads</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Investimento (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={spend}
                    onChange={(e) => setSpend(e.target.value)}
                    placeholder="1500.00"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Retorno (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    placeholder="8500.00"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Total de Cliques</label>
                  <input
                    type="number"
                    value={clicks}
                    onChange={(e) => setClicks(e.target.value)}
                    placeholder="1200"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Conversões / Leads</label>
                  <input
                    type="number"
                    value={conversions}
                    onChange={(e) => setConversions(e.target.value)}
                    placeholder="85"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold cursor-pointer"
                >
                  Salvar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

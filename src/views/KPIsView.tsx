import React, { useState } from 'react';
import { DollarSign, Plus, Trash2, Download, TrendingUp, Users, TrendingDown } from 'lucide-react';
import { KPIPeriod } from '../types';

interface KPIsViewProps {
  periods?: KPIPeriod[];
  kpiPeriods?: KPIPeriod[];
  onAddPeriod?: (period: Omit<KPIPeriod, 'id'>) => void;
  onDeletePeriod?: (id: string) => void;
  onExportReport?: () => void;
}

export const KPIsView: React.FC<KPIsViewProps> = ({
  periods,
  kpiPeriods,
  onAddPeriod,
  onDeletePeriod,
  // onExportReport: legado — a exportação agora é feita aqui dentro
  // (exportKPIReport); o App.tsx pode deixar de passar a prop (ver DIFFS-A.md).
}) => {
  const periodList = kpiPeriods || periods || [];

  // Ordena por mês (MM/AAAA) decrescente: o "último período" é o mês mais
  // recente, não o último inserido.
  const monthKey = (s: string) => {
    const [m, y] = (s || '').split('/').map(Number);
    return (y || 0) * 12 + (m || 0);
  };
  const sortedPeriods = [...periodList].sort((a, b) => monthKey(b.monthYear) - monthKey(a.monthYear));
  const latest = sortedPeriods[0] ?? null;

  const currentMonthYear = (() => {
    const now = new Date();
    return `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  })();

  const [showModal, setShowModal] = useState(false);
  const [monthYear, setMonthYear] = useState(currentMonthYear);
  const [mrr, setMrr] = useState('');
  const [arr, setArr] = useState('');
  const [ltv, setLtv] = useState('');
  const [cac, setCac] = useState('');
  const [churnRate, setChurnRate] = useState('');
  const [activeClients, setActiveClients] = useState('');

  // Exportação real do relatório de KPIs (download .txt, mesmo formato da
  // Central de Relatórios). Não apenas navega para outra tela.
  const exportKPIReport = () => {
    let text = `=========================================\n`;
    text += `   RELATÓRIO DE KPIs - AGENCYOS\n`;
    text += `   Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    text += `=========================================\n\n`;

    if (latest) {
      text += `PERÍODO MAIS RECENTE (${latest.monthYear}):\n`;
      text += `- MRR: R$ ${latest.mrr.toLocaleString('pt-BR')}\n`;
      text += `- ARR: R$ ${latest.arr.toLocaleString('pt-BR')}\n`;
      text += `- LTV: R$ ${latest.ltv.toLocaleString('pt-BR')}\n`;
      text += `- CAC: R$ ${latest.cac.toLocaleString('pt-BR')}\n`;
      text += `- Churn Rate: ${latest.churnRate}%\n`;
      text += `- Clientes Ativos: ${latest.activeClients}\n\n`;
    } else {
      text += `Nenhum período registrado.\n\n`;
    }

    text += `HISTÓRICO DE PERÍODOS (${sortedPeriods.length}):\n`;
    sortedPeriods.forEach((p, i) => {
      text += `${i + 1}. ${p.monthYear} | MRR: R$ ${p.mrr.toLocaleString('pt-BR')} | ARR: R$ ${p.arr.toLocaleString('pt-BR')} | LTV: R$ ${p.ltv.toLocaleString('pt-BR')} | CAC: R$ ${p.cac.toLocaleString('pt-BR')} | Churn: ${p.churnRate}% | Clientes: ${p.activeClients}\n`;
    });

    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `relatorio_kpis_agencyos_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddPeriod) {
      onAddPeriod({
        monthYear,
        mrr: parseFloat(mrr) || 0,
        arr: parseFloat(arr) || (parseFloat(mrr) || 0) * 12,
        ltv: parseFloat(ltv) || 0,
        cac: parseFloat(cac) || 0,
        churnRate: parseFloat(churnRate) || 0,
        activeClients: parseInt(activeClients) || 0,
      });
    }
    setShowModal(false);
    setMrr('');
    setArr('');
    setLtv('');
    setCac('');
    setChurnRate('');
    setActiveClients('');
  };

  return (
    <div className="space-y-6 text-neutral-200 font-sans max-w-7xl mx-auto pb-16">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e0e0e] border border-neutral-800">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-700 text-xs font-bold text-white">
          <span>● {periodList.length} meses registrados</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={exportKPIReport}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Exportar Relatório</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Período</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* MRR */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
            <span>MRR (Receita Recorrente Mensal)</span>
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div className="text-3xl font-black text-white">
            {latest ? `R$ ${latest.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
          </div>
          <p className="text-[10px] text-neutral-500">Métrica base do mês atual</p>
        </div>

        {/* ARR */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
            <span>ARR (Receita Recorrente Anual)</span>
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div className="text-3xl font-black text-white">
            {latest ? `R$ ${latest.arr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
          </div>
          <p className="text-[10px] text-neutral-500">Projeção anual de faturamento</p>
        </div>

        {/* LTV */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
            <span>LTV (Valor do Cliente)</span>
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="text-3xl font-black text-white">
            {latest ? `R$ ${latest.ltv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
          </div>
          <p className="text-[10px] text-neutral-500">Lucro médio por cliente retido</p>
        </div>

        {/* CAC */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
            <span>CAC (Custo de Aquisição)</span>
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div className="text-3xl font-black text-white">
            {latest ? `R$ ${latest.cac.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
          </div>
          <p className="text-[10px] text-neutral-500">Custo médio para atrair 1 cliente</p>
        </div>

        {/* Churn Rate */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
            <span>Churn Rate</span>
            <TrendingDown className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {latest ? `${latest.churnRate.toFixed(1)}%` : '—'}
          </div>
          <p className="text-[10px] text-neutral-500">Percentual de perda de clientes</p>
        </div>

        {/* Clientes Ativos */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
            <span>Clientes Ativos</span>
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="text-3xl font-black text-white">{latest ? latest.activeClients : '—'}</div>
          <p className="text-[10px] text-neutral-500">Total de contratos vigentes</p>
        </div>
      </div>

      {/* History Table */}
      <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-4">
        <h3 className="font-bold text-white text-base">Histórico de Períodos Registrados</h3>

        {periodList.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            Nenhum período registrado. Clique em "+ Adicionar Período" para registrar seus dados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-neutral-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-lg">Mês/Ano</th>
                  <th className="p-3">MRR</th>
                  <th className="p-3">ARR</th>
                  <th className="p-3">LTV</th>
                  <th className="p-3">CAC</th>
                  <th className="p-3">Churn</th>
                  <th className="p-3">Clientes</th>
                  <th className="p-3 text-right rounded-r-lg">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {sortedPeriods.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-3 font-bold text-white">{p.monthYear}</td>
                    <td className="p-3 font-semibold text-white">
                      R$ {p.mrr.toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3 text-neutral-300">R$ {p.arr.toLocaleString('pt-BR')}</td>
                    <td className="p-3 text-neutral-300">R$ {p.ltv.toLocaleString('pt-BR')}</td>
                    <td className="p-3 text-neutral-300">R$ {p.cac.toLocaleString('pt-BR')}</td>
                    <td className="p-3 font-semibold text-neutral-300">{p.churnRate}%</td>
                    <td className="p-3 text-neutral-300">{p.activeClients}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeletePeriod && onDeletePeriod(p.id)}
                        className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                        title="Excluir período"
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

      {/* Add Period Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e0e0e] border border-neutral-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Adicionar Novo Período Financeiro</h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">Mês/Ano</label>
                <input
                  type="text"
                  required
                  value={monthYear}
                  onChange={(e) => setMonthYear(e.target.value)}
                  placeholder="Ex: 08/2026"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">MRR (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={mrr}
                    onChange={(e) => setMrr(e.target.value)}
                    placeholder="15000"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">ARR (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={arr}
                    onChange={(e) => setArr(e.target.value)}
                    placeholder="Auto se vazio"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">LTV (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ltv}
                    onChange={(e) => setLtv(e.target.value)}
                    placeholder="12000"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">CAC (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cac}
                    onChange={(e) => setCac(e.target.value)}
                    placeholder="800"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Churn Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={churnRate}
                    onChange={(e) => setChurnRate(e.target.value)}
                    placeholder="2.5"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Clientes Ativos</label>
                  <input
                    type="number"
                    value={activeClients}
                    onChange={(e) => setActiveClients(e.target.value)}
                    placeholder="12"
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
                  Salvar Período
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { TrendingUp, ArrowDownRight, ArrowUpRight, DollarSign, Plus, Trash2, Search } from 'lucide-react';
import { CashTransaction } from '../types';

interface FluxoCaixaViewProps {
  transactions?: CashTransaction[];
  onAddTransaction?: (t: Omit<CashTransaction, 'id'>) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const FluxoCaixaView: React.FC<FluxoCaixaViewProps> = ({
  transactions = [],
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const [type, setType] = useState<'Entrada' | 'Saída'>('Entrada');
  const [category, setCategory] = useState('Receita Recorrente');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'Todos' | 'Entrada' | 'Saída'>('Todos');

  const totalEntradas = transactions
    .filter((t) => t.type === 'Entrada')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSaidas = transactions
    .filter((t) => t.type === 'Saída')
    .reduce((acc, t) => acc + t.amount, 0);

  const saldo = totalEntradas - totalSaidas;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;
    onAddTransaction({
      type,
      category,
      description: description.trim(),
      amount: parseFloat(amount) || 0,
      date,
    });
    setDescription('');
    setAmount('');
  };

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'Todos' || t.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 text-gray-200">
      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Entradas */}
        <div className="p-5 rounded-2xl bg-[#12141c] border border-[#1e2332] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400">
            <span>TOTAL ENTRADAS</span>
            <ArrowDownRight className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div className="text-3xl font-black text-[#22c55e]">
            R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-gray-500">Receitas brutas registradas</p>
        </div>

        {/* Saídas */}
        <div className="p-5 rounded-2xl bg-[#12141c] border border-[#1e2332] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400">
            <span>TOTAL SAÍDAS</span>
            <ArrowUpRight className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-black text-red-400">
            R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-gray-500">Despesas operacionais e custos</p>
        </div>

        {/* Saldo */}
        <div className="p-5 rounded-2xl bg-[#12141c] border border-[#1e2332] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400">
            <span>SALDO ATUAL</span>
            <DollarSign className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div className={`text-3xl font-black ${saldo >= 0 ? 'text-[#22c55e]' : 'text-red-400'}`}>
            R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-gray-500">Lucro líquido acumulado</p>
        </div>
      </div>

      {/* Register New Transaction Form */}
      <div className="p-5 rounded-2xl bg-[#12141c] border border-[#1e2332] space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#22c55e]" /> Registrar Nova Transação
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block text-gray-400 font-bold mb-1">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-[#181a26] border border-[#2a2f44] rounded-xl px-3 py-2 text-white font-bold"
            >
              <option value="Entrada">🟢 Entrada</option>
              <option value="Saída">🔴 Saída</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 font-bold mb-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#181a26] border border-[#2a2f44] rounded-xl px-3 py-2 text-white"
            >
              <option value="Receita Recorrente">Receita Recorrente</option>
              <option value="Serviço Pontual">Serviço Pontual</option>
              <option value="Custo Fixo">Custo Fixo</option>
              <option value="Tráfego Pago">Tráfego Pago</option>
              <option value="Softwares & Licenças">Softwares & Licenças</option>
              <option value="Equipe & Pro-Labore">Equipe & Pro-Labore</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-gray-400 font-bold mb-1">Descrição</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Mensalidade Cliente Alpha"
              className="w-full bg-[#181a26] border border-[#2a2f44] rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-bold mb-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="2500.00"
              className="w-full bg-[#181a26] border border-[#2a2f44] rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-bold mb-1">Data</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#181a26] border border-[#2a2f44] rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-6 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#1eb054] text-black font-extrabold text-xs shadow-md transition-all"
            >
              + Registrar Transação
            </button>
          </div>
        </form>
      </div>

      {/* Transactions History */}
      <div className="p-5 rounded-2xl bg-[#12141c] border border-[#1e2332] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="font-bold text-white text-base">Histórico de Transações</h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#181a26] border border-[#2b3145] rounded-xl text-xs text-white"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-[#181a26] border border-[#2b3145] rounded-xl px-3 py-1.5 text-xs text-white"
            >
              <option value="Todos">Todos</option>
              <option value="Entrada">Entradas</option>
              <option value="Saída">Saídas</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            Nenhuma transação encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181b26] text-gray-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-lg">Tipo</th>
                  <th className="p-3">Descrição</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Data</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3 text-right rounded-r-lg">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1d2232]">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-[#161824] transition-colors">
                    <td className="p-3 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          t.type === 'Entrada'
                            ? 'bg-[#183a1d] text-[#22c55e]'
                            : 'bg-red-950/60 text-red-400'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">{t.description}</td>
                    <td className="p-3 text-gray-400">{t.category}</td>
                    <td className="p-3 text-gray-400">{t.date}</td>
                    <td
                      className={`p-3 font-bold ${
                        t.type === 'Entrada' ? 'text-[#22c55e]' : 'text-red-400'
                      }`}
                    >
                      {t.type === 'Entrada' ? '+' : '-'} R${' '}
                      {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
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
    </div>
  );
};

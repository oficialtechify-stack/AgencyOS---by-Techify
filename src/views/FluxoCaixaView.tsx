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
    if (onAddTransaction) {
      onAddTransaction({
        type,
        category,
        description: description.trim(),
        amount: parseFloat(amount) || 0,
        date,
      });
    }
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
    <div className="space-y-6 text-neutral-200 font-sans max-w-7xl mx-auto pb-16">
      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Entradas */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
            <span>TOTAL ENTRADAS</span>
            <ArrowDownRight className="w-4 h-4 text-white" />
          </div>
          <div className="text-3xl font-black text-white">
            R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-neutral-500">Receitas brutas registradas</p>
        </div>

        {/* Saídas */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
            <span>TOTAL SAÍDAS</span>
            <ArrowUpRight className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-3xl font-black text-neutral-300">
            R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-neutral-500">Despesas operacionais e custos</p>
        </div>

        {/* Saldo */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
            <span>SALDO ATUAL</span>
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div className="text-3xl font-black text-white">
            R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-neutral-500">Lucro líquido acumulado</p>
        </div>
      </div>

      {/* Register New Transaction Form */}
      <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Plus className="w-4 h-4 text-white" /> Registrar Nova Transação
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block text-neutral-400 font-bold mb-1">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold"
            >
              <option value="Entrada">● Entrada</option>
              <option value="Saída">○ Saída</option>
            </select>
          </div>

          <div>
            <label className="block text-neutral-400 font-bold mb-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white"
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
            <label className="block text-neutral-400 font-bold mb-1">Descrição</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Mensalidade Cliente Alpha"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-neutral-400 font-bold mb-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="2500.00"
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-neutral-400 font-bold mb-1">Data</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-6 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              + Registrar Transação
            </button>
          </div>
        </form>
      </div>

      {/* Transactions History */}
      <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="font-bold text-white text-base">Histórico de Transações</h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white"
            >
              <option value="Todos">Todos</option>
              <option value="Entrada">Entradas</option>
              <option value="Saída">Saídas</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            Nenhuma transação encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-neutral-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-lg">Tipo</th>
                  <th className="p-3">Descrição</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Data</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3 text-right rounded-r-lg">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-3 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          t.type === 'Entrada'
                            ? 'bg-neutral-900 text-white border border-neutral-700'
                            : 'bg-neutral-950 text-neutral-400 border border-neutral-800'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">{t.description}</td>
                    <td className="p-3 text-neutral-400">{t.category}</td>
                    <td className="p-3 text-neutral-400">{t.date}</td>
                    <td
                      className={`p-3 font-bold ${
                        t.type === 'Entrada' ? 'text-white' : 'text-neutral-300'
                      }`}
                    >
                      {t.type === 'Entrada' ? '+' : '-'} R${' '}
                      {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeleteTransaction && onDeleteTransaction(t.id)}
                        className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                        title="Excluir transação"
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

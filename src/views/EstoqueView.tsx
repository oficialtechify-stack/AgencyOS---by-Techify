import React, { useState } from 'react';
import { Package, Plus, Trash2, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { StockItem } from '../types';

interface EstoqueViewProps {
  items?: StockItem[];
  onAddItem?: (item: Omit<StockItem, 'id'>) => void;
  onDeleteItem?: (id: string) => void;
}

export const EstoqueView: React.FC<EstoqueViewProps> = ({ items = [], onAddItem, onDeleteItem }) => {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'Todos' | 'Estoque Baixo' | 'Ativos' | 'Esgotados'>('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Geral');
  const [quantity, setQuantity] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const lowStockCount = items.filter((i) => i.quantity > 0 && i.quantity <= i.minQuantity).length;
  const outOfStockCount = items.filter((i) => i.quantity === 0).length;
  const totalValue = items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const q = parseInt(quantity) || 0;
    const minQ = parseInt(minQuantity) || 5;

    let status: 'Ativo' | 'Estoque Baixo' | 'Esgotado' = 'Ativo';
    if (q === 0) status = 'Esgotado';
    else if (q <= minQ) status = 'Estoque Baixo';

    if (onAddItem) {
      onAddItem({
        name: name.trim(),
        category: category.trim() || 'Geral',
        quantity: q,
        minQuantity: minQ,
        unitPrice: parseFloat(unitPrice) || 0,
        status,
      });
    }

    setShowModal(false);
    setName('');
    setQuantity('');
    setMinQuantity('');
    setUnitPrice('');
  };

  const filteredItems = items.filter((i) => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'Estoque Baixo') return i.quantity > 0 && i.quantity <= i.minQuantity;
    if (filter === 'Esgotados') return i.quantity === 0;
    if (filter === 'Ativos') return i.quantity > i.minQuantity;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 text-neutral-200 font-sans max-w-7xl mx-auto pb-16">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
            <span>TOTAL DE ITENS</span>
            <Package className="w-4 h-4 text-white" />
          </div>
          <div className="text-3xl font-black text-white">{totalItems}</div>
          <p className="text-[10px] text-neutral-500">Unidades em almoxarifado</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
            <span>ESTOQUE BAIXO</span>
            <AlertTriangle className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-3xl font-black text-neutral-300">{lowStockCount}</div>
          <p className="text-[10px] text-neutral-500">Necessitam de reposição</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
            <span>SEM ESTOQUE</span>
            <AlertTriangle className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-3xl font-black text-neutral-400">{outOfStockCount}</div>
          <p className="text-[10px] text-neutral-500">Itens zerados</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
            <span>VALOR TOTAL</span>
            <Package className="w-4 h-4 text-white" />
          </div>
          <div className="text-3xl font-black text-white">
            R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-neutral-500">Ativo imobilizado em produtos</p>
        </div>
      </div>

      {/* Main Table Block */}
      <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar item..."
                className="pl-9 pr-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white"
            >
              <option value="Todos">Todos</option>
              <option value="Ativos">Ativos</option>
              <option value="Estoque Baixo">Estoque Baixo</option>
              <option value="Esgotados">Esgotados</option>
            </select>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> + Novo Item
          </button>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            Nenhum item de estoque cadastrado. Clique em "+ Novo Item" para cadastrar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-neutral-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-lg">Item</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Qtd em Estoque</th>
                  <th className="p-3">Qtd Mínima</th>
                  <th className="p-3">Preço Unitário</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right rounded-r-lg">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="p-3 font-bold text-white">{item.name}</td>
                    <td className="p-3 text-neutral-400">{item.category}</td>
                    <td className="p-3 font-bold text-white">{item.quantity} un</td>
                    <td className="p-3 text-neutral-400">{item.minQuantity} un</td>
                    <td className="p-3 text-neutral-300">
                      R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'Ativo'
                            ? 'bg-neutral-900 border border-neutral-700 text-white'
                            : item.status === 'Estoque Baixo'
                            ? 'bg-neutral-950 border border-neutral-800 text-neutral-400'
                            : 'bg-neutral-950 border border-neutral-800 text-neutral-500'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeleteItem && onDeleteItem(item.id)}
                        className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
                        title="Excluir item"
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

      {/* New Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0e0e0e] border border-neutral-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Cadastrar Item no Estoque</h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">Nome do Item / Produto</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Camiseta Branded AgencyOS"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Categoria</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Brindes, Periféricos, Material de Escritório"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Quantidade Inicial</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="20"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Mínimo Alerta</label>
                  <input
                    type="number"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    placeholder="5"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Preço Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="45.00"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
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
                  Cadastrar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

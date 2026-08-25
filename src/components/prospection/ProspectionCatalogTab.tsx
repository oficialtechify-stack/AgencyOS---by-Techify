import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Share2,
  Layers,
  Search,
  DollarSign,
  Zap,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { TechifyPackageOption, UserProfile } from '../../types';
import { TECHIFY_PACKAGES, TECHIFY_INDIVIDUAL_SERVICES } from '../../data/techifyPackages';

interface ProspectionCatalogTabProps {
  packages?: TechifyPackageOption[];
  currentUser?: UserProfile | null;
  onSavePackage: (pkg: TechifyPackageOption) => void;
  onDeletePackage: (id: string) => void;
  onUseInDemand: (packageName: string) => void;
  onShareInChat?: (pkg: TechifyPackageOption) => void;
}

export const ProspectionCatalogTab: React.FC<ProspectionCatalogTabProps> = ({
  packages = [],
  currentUser,
  onSavePackage,
  onDeletePackage,
  onUseInDemand,
  onShareInChat,
}) => {
  // Merge default packages with any saved custom packages from state
  const effectivePackages =
    packages.length > 0 ? packages : [...TECHIFY_PACKAGES, ...TECHIFY_INDIVIDUAL_SERVICES];

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'pacote' | 'servico'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TechifyPackageOption | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<TechifyPackageOption | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Form states for creating / editing package
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'pacote' | 'servico'>('pacote');
  const [description, setDescription] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState(2500);
  const [priceType, setPriceType] = useState<'Mensal Recorrente (MRR)' | 'Pontual / Projeto Único'>('Mensal Recorrente (MRR)');
  const [badge, setBadge] = useState('Destaque Comercial');
  const [featuresText, setFeaturesText] = useState('');
  const [popular, setPopular] = useState(false);

  const openCreateModal = () => {
    setEditingPackage(null);
    setName('');
    setCategory('pacote');
    setDescription('');
    setSuggestedPrice(2500);
    setPriceType('Mensal Recorrente (MRR)');
    setBadge('Solução Completa');
    setFeaturesText('Gestão de Tráfego Pago\nDesign e Criativos Mensais\nLanding Page de Alta Conversão\nAutomação e Relatórios');
    setPopular(false);
    setIsEditModalOpen(true);
  };

  const openEditModal = (pkg: TechifyPackageOption) => {
    setEditingPackage(pkg);
    setName(pkg.name);
    setCategory(pkg.category);
    setDescription(pkg.description);
    setSuggestedPrice(pkg.suggestedPrice);
    setPriceType(pkg.priceType);
    setBadge(pkg.badge || 'Destaque Comercial');
    setFeaturesText((pkg.features || []).join('\n'));
    setPopular(!!pkg.popular);
    setIsEditModalOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const features = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const savedItem: TechifyPackageOption = {
      id: editingPackage ? editingPackage.id : `pkg-${Date.now()}`,
      name: name.trim(),
      category,
      description: description.trim(),
      suggestedPrice: Number(suggestedPrice) || 0,
      priceType,
      badge: badge.trim() || (category === 'pacote' ? 'Pacote Estruturado' : 'Serviço Individual'),
      features: features.length > 0 ? features : ['Consultoria Especializada', 'Entrega e Suporte'],
      popular,
    };

    onSavePackage(savedItem);
    setIsEditModalOpen(false);
    setFeedbackMessage(`Pacote/Serviço "${savedItem.name}" salvo com sucesso no catálogo!`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const confirmDelete = (pkg: TechifyPackageOption) => {
    onDeletePackage(pkg.id);
    setPackageToDelete(null);
    setFeedbackMessage(`Item "${pkg.name}" removido do catálogo.`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const filteredItems = effectivePackages.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchBadge = (item.badge || '').toLowerCase().includes(q);
      const matchFeatures = (item.features || []).some((f) => f.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchBadge && !matchFeatures) return false;
    }
    return true;
  });

  const structuredPackages = filteredItems.filter((i) => i.category === 'pacote');
  const individualServices = filteredItems.filter((i) => i.category === 'servico');

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-neutral-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Actions & Search */}
      <div className="p-6 rounded-2xl bg-[#0e0e0e] border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-lg shadow-purple-500/10">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              Catálogo Oficial de Soluções & Pacotes Techify
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                {effectivePackages.length} Itens
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Cadastre, edite e personalize os entregáveis e valores sugeridos para guiar o time comercial e os contratos fechados.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar ao Catálogo</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0a0a0a] p-3 rounded-2xl border border-neutral-800">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              categoryFilter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Todos ({effectivePackages.length})
          </button>
          <button
            onClick={() => setCategoryFilter('pacote')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              categoryFilter === 'pacote'
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Pacotes Estruturados ({effectivePackages.filter((i) => i.category === 'pacote').length})
          </button>
          <button
            onClick={() => setCategoryFilter('servico')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              categoryFilter === 'servico'
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Serviços Individuais ({effectivePackages.filter((i) => i.category === 'servico').length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por pacote, entregável ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>
      </div>

      {/* Grid of Packages */}
      {categoryFilter !== 'servico' && structuredPackages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-black text-neutral-300 uppercase tracking-wider">
              Pacotes Estruturados Techify (Soluções Completas & Recorrência)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {structuredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-6 rounded-2xl bg-[#0e0e0e] border border-neutral-800 hover:border-purple-500/40 transition-all flex flex-col justify-between group relative shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase">
                      {pkg.badge || 'Pacote Estruturado'}
                    </span>
                    <span className="text-xs font-semibold text-neutral-400">{pkg.priceType}</span>
                  </div>

                  <h3 className="text-base font-black text-white leading-tight group-hover:text-purple-300 transition-colors">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">{pkg.description}</p>

                  <div className="mt-4 pt-4 border-t border-neutral-800/80 space-y-2">
                    <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                      Entregáveis Inclusos ({pkg.features?.length || 0}):
                    </span>
                    <ul className="space-y-1.5">
                      {(pkg.features || []).map((feat, idx) => (
                        <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-bold block">Valor Sugerido</span>
                      <div className="text-lg font-black text-purple-400">
                        R$ {pkg.suggestedPrice.toLocaleString('pt-BR')}
                        <span className="text-xs text-neutral-400 font-normal">
                          {pkg.priceType.includes('MRR') ? ' / mês' : ' / setup'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(pkg)}
                        className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-bold transition-all cursor-pointer"
                        title="Editar Pacote"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {onShareInChat && (
                        <button
                          onClick={() => onShareInChat(pkg)}
                          className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold transition-all cursor-pointer"
                          title="Compartilhar no Chat da Equipe"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => setPackageToDelete(pkg)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                        title="Excluir do Catálogo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => onUseInDemand(pkg.name)}
                    className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-purple-500/30 hover:border-purple-600"
                  >
                    <span>Usar na Criação de Demanda</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Individual Services */}
      {categoryFilter !== 'pacote' && individualServices.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black text-neutral-300 uppercase tracking-wider">
              Serviços Individuais & Setup Único
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {individualServices.map((serv) => (
              <div
                key={serv.id}
                className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between group shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase">
                      {serv.badge || 'Serviço Individual'}
                    </span>
                    <span className="text-[11px] font-semibold text-neutral-400">{serv.priceType}</span>
                  </div>

                  <h4 className="text-sm font-black text-white leading-tight group-hover:text-emerald-300 transition-colors">
                    {serv.name}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{serv.description}</p>

                  <div className="mt-3 pt-3 border-t border-neutral-800/80 space-y-1">
                    <ul className="space-y-1">
                      {(serv.features || []).map((feat, idx) => (
                        <li key={idx} className="text-[11px] text-neutral-300 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-neutral-500 uppercase font-bold block">Valor</span>
                    <strong className="text-base font-black text-emerald-400">
                      R$ {serv.suggestedPrice.toLocaleString('pt-BR')}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(serv)}
                      className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs transition-all cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setPackageToDelete(serv)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs transition-all cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onUseInDemand(serv.name)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Usar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create or Edit Package */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in custom-scrollbar">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-[#0e0e0e] z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white">
                  {editingPackage ? 'Editar Pacote / Serviço do Catálogo' : 'Adicionar Novo Pacote ao Catálogo'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Nome do Pacote / Serviço *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Techify Scale 360 (Solução Completa)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as 'pacote' | 'servico')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="pacote">Pacote Estruturado</option>
                    <option value="servico">Serviço Individual</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Badge de Destaque
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mais Completo, Alta Performance"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Valor Sugerido (R$) *
                  </label>
                  <div className="relative">
                    <span className="text-xs text-neutral-500 font-bold absolute left-3.5 top-1/2 -translate-y-1/2">
                      R$
                    </span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={suggestedPrice}
                      onChange={(e) => setSuggestedPrice(Number(e.target.value))}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white font-bold focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Tipo de Cobrança
                  </label>
                  <select
                    value={priceType}
                    onChange={(e) =>
                      setPriceType(e.target.value as 'Mensal Recorrente (MRR)' | 'Pontual / Projeto Único')
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Mensal Recorrente (MRR)">Mensal Recorrente (MRR)</option>
                    <option value="Pontual / Projeto Único">Pontual / Projeto Único</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Descrição Comercial
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Explicação resumida do benefício e público deste pacote..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Entregáveis Inclusos (Um por linha)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Gestão Meta Ads e Google Ads&#10;30 Criativos Mensais&#10;Landing Page de Conversão&#10;Automação de WhatsApp"
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Cada linha será exibida como um item com ícone de verificação no card.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition-all shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingPackage ? 'Salvar Alterações' : 'Cadastrar Pacote'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete */}
      {packageToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 animate-fade-in shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-white">Excluir do Catálogo?</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Deseja remover <strong>"{packageToDelete.name}"</strong>? O item deixará de aparecer no catálogo comercial.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPackageToDelete(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmDelete(packageToDelete)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black cursor-pointer shadow-lg shadow-rose-600/30"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

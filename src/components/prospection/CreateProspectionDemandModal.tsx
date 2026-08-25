import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  Instagram,
  Phone,
  MapPin,
  Building2,
  Calendar,
  AlertCircle,
  Package,
  Layers,
  Sparkles,
  Check,
  Plus,
} from 'lucide-react';
import { ProspectionDemand, UserProfile } from '../../types';
import { TECHIFY_PACKAGES, TECHIFY_INDIVIDUAL_SERVICES } from '../../data/techifyPackages';

interface CreateProspectionDemandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (demand: Omit<ProspectionDemand, 'id' | 'createdAt'>) => void;
  currentUser?: UserProfile | null;
  editingDemand?: ProspectionDemand | null;
}

export const CreateProspectionDemandModal: React.FC<CreateProspectionDemandModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  editingDemand,
}) => {
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [segment, setSegment] = useState('Estética & Beleza');
  const [city, setCity] = useState('Recife / PE');
  const [phone, setPhone] = useState('');
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [customPackageInput, setCustomPackageInput] = useState('');
  const [approachBriefing, setApproachBriefing] = useState('');
  const [priority, setPriority] = useState<'Baixa' | 'Média' | 'Alta' | 'Urgente'>('Alta');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState<string | null>(null);

  const quickSegments = [
    'Estética & Harmonização',
    'Gastronomia & Restaurantes',
    'Odontologia & Clínicas',
    'Barbearias & Salões',
    'Moda, Roupas & E-commerce',
    'Imobiliárias & Corretores',
    'Energia Solar & Engenharia',
    'Nutrição & Saúde',
    'Academias & Crossfit',
    'Advocacia & Contabilidade',
    'Pet Shop & Veterinária',
    'Arquitetura & Design de Interiores',
  ];

  useEffect(() => {
    if (editingDemand) {
      setTitle(editingDemand.title || '');
      setCompanyName(editingDemand.companyName || '');
      setInstagram(editingDemand.instagram || '');
      setSegment(editingDemand.segment || 'Estética & Beleza');
      setCity(editingDemand.city || '');
      setPhone(editingDemand.phone || '');
      setSelectedPackages(editingDemand.targetPackages || []);
      setApproachBriefing(editingDemand.approachBriefing || '');
      setPriority(editingDemand.priority || 'Alta');
      setDeadline(editingDemand.deadline || '');
    } else {
      setTitle('');
      setCompanyName('');
      setInstagram('');
      setSegment('Estética & Harmonização');
      setCity('Recife / PE');
      setPhone('');
      setSelectedPackages(['Techify Scale 360 (Solução Completa)', 'Techify Tráfego & Performance']);
      setApproachBriefing('');
      setPriority('Alta');
      // Default deadline to +4 days
      const d = new Date();
      d.setDate(d.getDate() + 4);
      setDeadline(d.toISOString().split('T')[0]);
    }
    setError(null);
  }, [editingDemand, isOpen]);

  if (!isOpen) return null;

  const handleTogglePackage = (pkgName: string) => {
    setSelectedPackages((prev) =>
      prev.includes(pkgName) ? prev.filter((p) => p !== pkgName) : [...prev, pkgName]
    );
  };

  const handleAddCustomPackage = () => {
    if (customPackageInput.trim() && !selectedPackages.includes(customPackageInput.trim())) {
      setSelectedPackages((prev) => [...prev, customPackageInput.trim()]);
      setCustomPackageInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Informe o nome da empresa ou estabelecimento alvo.');
      return;
    }
    if (!instagram.trim()) {
      setError('Informe o perfil do Instagram (ex: @empresa).');
      return;
    }
    if (selectedPackages.length === 0) {
      setError('Selecione pelo menos 1 pacote ou serviço Techify indicado para esta abordagem.');
      return;
    }
    if (!approachBriefing.trim()) {
      setError('Escreva um breve roteiro/orientação de abordagem para orientar a equipe de prospecção.');
      return;
    }

    const finalTitle = title.trim() || `Prospecção - ${companyName.trim()}`;
    const cleanInsta = instagram.trim().startsWith('@')
      ? instagram.trim()
      : instagram.trim().includes('instagram.com')
      ? instagram.trim()
      : `@${instagram.trim()}`;

    onSubmit({
      title: finalTitle,
      companyName: companyName.trim(),
      instagram: cleanInsta,
      segment: segment.trim(),
      city: city.trim() || 'Brasil',
      phone: phone.trim() || undefined,
      targetPackages: selectedPackages,
      approachBriefing: approachBriefing.trim(),
      priority,
      deadline: deadline || undefined,
      createdBy: currentUser?.name ? `${currentUser.name} (${currentUser.role || 'Gestor'})` : 'Gestor Master Techify',
      createdEmail: currentUser?.email || 'gestor@techify.com',
      status: editingDemand?.status || 'Pendente',
      assignedTo: editingDemand?.assignedTo,
      assignedEmail: editingDemand?.assignedEmail,
      assignedRole: editingDemand?.assignedRole,
      claimedAt: editingDemand?.claimedAt,
      historyNotes: editingDemand?.historyNotes || [
        {
          id: `note-${Date.now()}`,
          author: currentUser?.name || 'Gestor',
          authorEmail: currentUser?.email || '',
          text: 'Demanda de prospecção publicada no mural. Disponível para a equipe assumir.',
          date: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
        },
      ],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0e0e0e] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                {editingDemand ? 'Editar Demanda de Prospecção' : 'Criar Nova Demanda para a Equipe de Prospecção'}
              </h2>
              <p className="text-xs text-neutral-400">
                Cadastre o lead com Instagram, segmento e pacotes da Techify recomendados para o time comercial pegar e abordar.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Dados Principais do Alvo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Nome da Empresa / Estabelecimento <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    if (!title) setTitle(`Prospecção - ${e.target.value}`);
                  }}
                  placeholder="Ex: Studio Bella Estética Avançada"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Instagram Oficial da Empresa <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <Instagram className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Ex: @studiobellarecife ou link do perfil"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-pink-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Segmento / Nicho <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                placeholder="Ex: Estética & Harmonização"
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Cidade & Estado <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Recife / PE (Boa Viagem)"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                WhatsApp / Telefone (Opcional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-green-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: (81) 99874-3321"
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-green-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Quick Segment Tags */}
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 mb-1.5 block">
              Sugestões Rápidas de Nicho:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickSegments.map((sg) => (
                <button
                  key={sg}
                  type="button"
                  onClick={() => setSegment(sg)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    segment === sg
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                  }`}
                >
                  {sg}
                </button>
              ))}
            </div>
          </div>

          {/* Pacotes Techify que a Agência Vende (Seleção para Abordagem) */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Package className="w-4 h-4 text-blue-400" /> Pacotes Techify Indicados para Venda <span className="text-blue-400">*</span>
              </label>
              <span className="text-[11px] text-neutral-400">
                Selecione as soluções que o colaborador deve ofertar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TECHIFY_PACKAGES.map((pkg) => {
                const isSelected = selectedPackages.includes(pkg.name);
                return (
                  <div
                    key={pkg.id}
                    onClick={() => handleTogglePackage(pkg.name)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500/70 text-white shadow-md shadow-blue-500/10'
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                        isSelected
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'border-neutral-700 bg-neutral-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white truncate">{pkg.name}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-neutral-800 text-blue-400 shrink-0">
                          R$ {pkg.suggestedPrice.toLocaleString('pt-BR')}/mês
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {pkg.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Individual Services */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-neutral-400 block mb-1.5">
                Ou Serviços Individuais Techify:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {TECHIFY_INDIVIDUAL_SERVICES.map((serv) => {
                  const isSelected = selectedPackages.includes(serv.name);
                  return (
                    <button
                      key={serv.id}
                      type="button"
                      onClick={() => handleTogglePackage(serv.name)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'bg-blue-950/40 border-blue-500 text-white'
                          : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                          isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'border-neutral-700'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span className="text-[11px] font-medium truncate">{serv.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Package Input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customPackageInput}
                onChange={(e) => setCustomPackageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomPackage();
                  }
                }}
                placeholder="Adicionar pacote personalizado..."
                className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomPackage}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
          </div>

          {/* Roteiro e Instruções de Abordagem */}
          <div className="space-y-1 pt-2 border-t border-neutral-800">
            <label className="block text-xs font-bold text-white">
              Instruções de Abordagem & Pontos de Dor do Lead <span className="text-blue-400">*</span>
            </label>
            <p className="text-[11px] text-neutral-400">
              Descreva os pontos fortes e fracos identificados no Instagram do cliente, o gancho inicial e o script recomendado para o SDR/closer.
            </p>
            <textarea
              rows={4}
              value={approachBriefing}
              onChange={(e) => setApproachBriefing(e.target.value)}
              placeholder="Ex: Identifiquei que o perfil possui 15k seguidores mas baixa retenção em stories e não possuem anúncios ativos na biblioteca do Meta. Abordagem: Elogiar os resultados atuais e oferecer uma análise gratuita de escala para procedimentos de alto ticket com foco no pacote Techify Scale 360..."
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500 rounded-xl p-3 text-xs text-white outline-none transition-colors leading-relaxed"
            />
          </div>

          {/* Prioridade e Prazo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Prioridade da Demanda
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Baixa', 'Média', 'Alta', 'Urgente'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center ${
                      priority === p
                        ? p === 'Urgente'
                          ? 'bg-red-600 text-white'
                          : p === 'Alta'
                          ? 'bg-amber-600 text-white'
                          : p === 'Média'
                          ? 'bg-blue-600 text-white'
                          : 'bg-neutral-700 text-white'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Data Limite para Abordagem
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-neutral-900/80 -mx-6 -mb-6 mt-6 border-t border-neutral-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{editingDemand ? 'Salvar Alterações' : 'Publicar Demanda no Mural'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

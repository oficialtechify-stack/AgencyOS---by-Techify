import React, { useState } from 'react';
import {
  Target,
  Plus,
  Search,
  Filter,
  Instagram,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Clock,
  User,
  Package,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Zap,
  Check,
  ChevronRight,
  Trash2,
  Edit2,
  Users,
  Flame,
} from 'lucide-react';
import { ProspectionDemand, ProspectionDemandStatus, UserProfile } from '../../types';
import { CreateProspectionDemandModal } from './CreateProspectionDemandModal';
import { InspectProspectionDemandModal } from './InspectProspectionDemandModal';

interface ProspectionDemandsTabProps {
  demands: ProspectionDemand[];
  currentUser?: UserProfile | null;
  onAddDemand: (demand: Omit<ProspectionDemand, 'id' | 'createdAt'>) => void;
  onUpdateDemand: (id: string, updatedData: Partial<ProspectionDemand>) => void;
  onDeleteDemand: (id: string) => void;
  onClaimDemand: (id: string) => void;
  onConvertToContract: (demand: ProspectionDemand) => void;
}

export const ProspectionDemandsTab: React.FC<ProspectionDemandsTabProps> = ({
  demands = [],
  currentUser,
  onAddDemand,
  onUpdateDemand,
  onDeleteDemand,
  onClaimDemand,
  onConvertToContract,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todas');
  const [segmentFilter, setSegmentFilter] = useState<string>('Todos');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDemand, setEditingDemand] = useState<ProspectionDemand | null>(null);
  const [inspectingDemand, setInspectingDemand] = useState<ProspectionDemand | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const isMasterOrLeader =
    currentUser?.email === 'rickmarketing81@gmail.com' ||
    currentUser?.leadershipRole === 'lider_geral' ||
    currentUser?.leadershipRole === 'lider_prospeccao' ||
    currentUser?.role?.toLowerCase().includes('gestor') ||
    currentUser?.role?.toLowerCase().includes('líder') ||
    currentUser?.role?.toLowerCase().includes('lider');

  // Stats calculation
  const totalDemands = demands.length;
  const pendingDemands = demands.filter((d) => d.status === 'Pendente').length;
  const claimedDemands = demands.filter(
    (d) => d.status === 'Assumida' || d.status === 'Em Abordagem' || d.status === 'Reunião Agendada'
  ).length;
  const closedDemands = demands.filter((d) => d.status === 'Contrato Fechado').length;

  const myClaimedDemandsCount = demands.filter(
    (d) => currentUser?.email && d.assignedEmail && d.assignedEmail.toLowerCase() === currentUser.email.toLowerCase()
  ).length;

  // Extract unique segments for filter
  const uniqueSegments = Array.from(new Set(demands.map((d) => d.segment).filter(Boolean)));

  // Filtered Demands
  const filteredDemands = demands.filter((demand) => {
    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchCompany = demand.companyName.toLowerCase().includes(q);
      const matchTitle = demand.title.toLowerCase().includes(q);
      const matchInsta = (demand.instagram || '').toLowerCase().includes(q);
      const matchCity = demand.city.toLowerCase().includes(q);
      const matchSegment = demand.segment.toLowerCase().includes(q);
      const matchAssigned = (demand.assignedTo || '').toLowerCase().includes(q);
      if (!matchCompany && !matchTitle && !matchInsta && !matchCity && !matchSegment && !matchAssigned) {
        return false;
      }
    }

    // Status Filter
    if (statusFilter === 'Disponíveis') {
      if (demand.status !== 'Pendente') return false;
    } else if (statusFilter === 'Minhas') {
      if (!currentUser?.email || !demand.assignedEmail) return false;
      if (demand.assignedEmail.toLowerCase() !== currentUser.email.toLowerCase()) return false;
    } else if (statusFilter !== 'Todas') {
      if (demand.status !== statusFilter) return false;
    }

    // Segment Filter
    if (segmentFilter !== 'Todos') {
      if (demand.segment !== segmentFilter) return false;
    }

    return true;
  });

  const getInstagramUrl = (handleOrUrl: string) => {
    if (!handleOrUrl) return '#';
    const clean = handleOrUrl.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    const cleanHandle = clean.replace(/^@+/, '').replace(/^instagram\.com\//, '').replace(/\/$/, '');
    return `https://www.instagram.com/${cleanHandle}/`;
  };

  const handleClaim = (demandId: string, companyName: string) => {
    onClaimDemand(demandId);
    setFeedbackMessage(`🔥 Demanda "${companyName}" assumida com sucesso por ${currentUser?.name || 'você'}!`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleAddNoteToDemand = (demandId: string, text: string) => {
    const demand = demands.find((d) => d.id === demandId);
    if (!demand) return;
    const newNote = {
      id: `note-${Date.now()}`,
      author: currentUser?.name || 'Membro da Prospecção',
      authorEmail: currentUser?.email || '',
      text,
      date: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
    };
    onUpdateDemand(demandId, {
      historyNotes: [...(demand.historyNotes || []), newNote],
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border border-blue-500/50 text-white text-xs font-bold shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-yellow-300 animate-bounce" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-white/70 hover:text-white text-xs px-2 py-1"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Header com Métricas & CTA */}
      <div className="p-6 rounded-2xl bg-[#0e0e0e] border border-neutral-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Target className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-white">Mural de Demandas & Distribuição de Prospecção</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-[10px] font-bold text-blue-300">
              Pipeline Ativo
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Área de distribuição de frentes comerciais: o gestor cadastra empresas com Instagram, segmento e pacotes da Techify, e a equipe de prospecção pega a demanda com 1 clique para abordar e fechar.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={() => {
              setEditingDemand(null);
              setIsCreateModalOpen(true);
            }}
            className="w-full lg:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Demanda de Prospecção</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0e0e0e] border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total de Demandas</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalDemands}</div>
          <span className="text-[10px] text-neutral-500 font-medium">Cadastradas no mural</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e0e0e] border border-amber-900/30 bg-amber-950/10">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Disponíveis p/ Pegar</span>
            <Zap className="w-4 h-4 text-yellow-300" />
          </div>
          <div className="text-2xl font-black text-amber-300">{pendingDemands}</div>
          <span className="text-[10px] text-amber-400/70 font-medium">Aguardando responsável</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e0e0e] border border-blue-900/30 bg-blue-950/10">
          <div className="flex items-center justify-between text-blue-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Em Andamento</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-300">{claimedDemands}</div>
          <span className="text-[10px] text-blue-400/70 font-medium">
            {myClaimedDemandsCount > 0 ? `${myClaimedDemandsCount} sob sua responsabilidade` : 'Assumidas pela equipe'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e0e0e] border border-green-900/30 bg-green-950/10">
          <div className="flex items-center justify-between text-green-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Convertidas em Venda</span>
            <Sparkles className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-black text-green-300">{closedDemands}</div>
          <span className="text-[10px] text-green-400/70 font-medium">Contratos fechados</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0e0e0e] border border-neutral-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {[
            { label: 'Todas', val: 'Todas', count: totalDemands },
            { label: '⚡ Disponíveis para Pegar', val: 'Disponíveis', count: pendingDemands },
            { label: '👤 Minhas Demandas', val: 'Minhas', count: myClaimedDemandsCount },
            { label: 'Assumidas', val: 'Assumida' },
            { label: 'Em Abordagem', val: 'Em Abordagem' },
            { label: 'Reunião Agendada', val: 'Reunião Agendada' },
            { label: 'Contrato Fechado', val: 'Contrato Fechado' },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setStatusFilter(tab.val)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.val
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    statusFilter === tab.val ? 'bg-black/30 text-white' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search and Segment select */}
        <div className="flex items-center gap-2">
          {uniqueSegments.length > 0 && (
            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 rounded-xl px-3 py-2.5 outline-none font-medium"
            >
              <option value="Todos">Todos os Nichos</option>
              {uniqueSegments.map((sg) => (
                <option key={sg} value={sg}>
                  {sg}
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por empresa, instagram, cidade..."
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid of Demands */}
      {filteredDemands.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Nenhuma demanda encontrada</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Não há demandas correspondentes aos filtros selecionados. Clique em "+ Nova Demanda de Prospecção" para adicionar um novo lead para a equipe comercial.
          </p>
          <button
            onClick={() => {
              setEditingDemand(null);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-2 mt-2"
          >
            <Plus className="w-4 h-4" /> Criar Demanda Agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDemands.map((demand) => {
            const isAssigned = !!demand.assignedTo;
            const isAssignedToMe =
              currentUser?.email &&
              demand.assignedEmail &&
              currentUser.email.toLowerCase() === demand.assignedEmail.toLowerCase();

            return (
              <div
                key={demand.id}
                className={`p-5 rounded-2xl bg-[#0e0e0e] border transition-all flex flex-col justify-between group ${
                  demand.status === 'Pendente'
                    ? 'border-amber-500/30 hover:border-amber-500/60 shadow-lg shadow-amber-500/5'
                    : demand.status === 'Contrato Fechado'
                    ? 'border-green-500/40 bg-green-950/5'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  {/* Top Bar: Priority & Actions */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          demand.priority === 'Urgente'
                            ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                            : demand.priority === 'Alta'
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                            : demand.priority === 'Média'
                            ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                            : 'bg-neutral-800 border border-neutral-700 text-neutral-400'
                        }`}
                      >
                        {demand.priority}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          demand.status === 'Pendente'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : demand.status === 'Assumida'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : demand.status === 'Em Abordagem'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : demand.status === 'Reunião Agendada'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : demand.status === 'Contrato Fechado'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/40 font-black'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {demand.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isMasterOrLeader && (
                        <>
                          <button
                            onClick={() => {
                              setEditingDemand(demand);
                              setIsCreateModalOpen(true);
                            }}
                            title="Editar Demanda"
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteDemand(demand.id)}
                            title="Excluir Demanda"
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Company Name & Segment */}
                  <div>
                    <h3
                      onClick={() => setInspectingDemand(demand)}
                      className="text-sm font-black text-white hover:text-blue-400 cursor-pointer transition-colors line-clamp-1"
                    >
                      {demand.companyName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-300">
                        <Building2 className="w-3 h-3 text-neutral-500" /> {demand.segment}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <MapPin className="w-3 h-3 text-neutral-500" /> {demand.city}
                      </span>
                    </div>
                  </div>

                  {/* Instagram Direct Link */}
                  <div className="mt-3">
                    <a
                      href={getInstagramUrl(demand.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-pink-950/30 border border-pink-500/30 hover:border-pink-500 text-pink-300 text-xs font-bold transition-all group/insta"
                    >
                      <Instagram className="w-3.5 h-3.5 text-pink-400 group-hover/insta:scale-110 transition-transform" />
                      <span>{demand.instagram}</span>
                      <ExternalLink className="w-3 h-3 text-pink-400 opacity-60 group-hover/insta:opacity-100" />
                    </a>
                  </div>

                  {/* Target Packages Badges */}
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                      Pacotes Sugeridos Techify:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {demand.targetPackages && demand.targetPackages.length > 0 ? (
                        demand.targetPackages.slice(0, 2).map((pkg, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-blue-950/40 border border-blue-500/30 text-[10px] font-semibold text-blue-300 truncate max-w-[200px]"
                          >
                            {pkg}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-neutral-500">Geral</span>
                      )}
                      {demand.targetPackages && demand.targetPackages.length > 2 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-neutral-800 text-[10px] text-neutral-400">
                          +{demand.targetPackages.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Briefing Snippet */}
                  <div className="mt-3 p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-900 text-[11px] text-neutral-300 line-clamp-2 leading-relaxed">
                    {demand.approachBriefing}
                  </div>
                </div>

                {/* Card Footer: Responsible & Action Button */}
                <div className="mt-4 pt-3 border-t border-neutral-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    {isAssigned ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {demand.assignedTo?.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <span className="text-[10px] text-neutral-500 block">Assumido por:</span>
                          <strong className="text-white text-xs truncate block">{demand.assignedTo}</strong>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                        <Zap className="w-3.5 h-3.5 text-yellow-300" />
                        <span>Disponível</span>
                      </div>
                    )}

                    <button
                      onClick={() => setInspectingDemand(demand)}
                      className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Ver Tudo</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick Action Button */}
                  {!isAssigned ? (
                    <button
                      onClick={() => handleClaim(demand.id, demand.companyName)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                    >
                      <Zap className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Pegar Demanda (Preencher Meu Nome)</span>
                    </button>
                  ) : demand.status !== 'Contrato Fechado' ? (
                    <button
                      onClick={() => {
                        onConvertToContract(demand);
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Registrar Fechamento com Este Lead</span>
                    </button>
                  ) : (
                    <div className="p-2 rounded-xl bg-green-950/40 border border-green-500/30 text-green-300 text-xs font-black flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span>Contrato Convertido com Sucesso!</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modais de Demanda */}
      <CreateProspectionDemandModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingDemand(null);
        }}
        onSubmit={(demandData) => {
          if (editingDemand) {
            onUpdateDemand(editingDemand.id, demandData);
            setFeedbackMessage('Demanda atualizada com sucesso!');
          } else {
            onAddDemand(demandData);
            setFeedbackMessage('Demanda publicada no mural de prospecção!');
          }
          setTimeout(() => setFeedbackMessage(null), 4000);
        }}
        currentUser={currentUser}
        editingDemand={editingDemand}
      />

      <InspectProspectionDemandModal
        isOpen={!!inspectingDemand}
        demand={inspectingDemand}
        onClose={() => setInspectingDemand(null)}
        currentUser={currentUser}
        onClaimDemand={(id) => {
          onClaimDemand(id);
          setInspectingDemand((prev) =>
            prev
              ? {
                  ...prev,
                  status: 'Assumida',
                  assignedTo: currentUser?.name || 'Membro da Prospecção',
                  assignedEmail: currentUser?.email,
                  claimedAt: new Date().toISOString(),
                }
              : null
          );
        }}
        onUpdateStatus={(id, status) => {
          onUpdateDemand(id, { status });
          setInspectingDemand((prev) => (prev ? { ...prev, status } : null));
        }}
        onAddNote={handleAddNoteToDemand}
        onConvertToContract={(dem) => {
          setInspectingDemand(null);
          onConvertToContract(dem);
        }}
      />
    </div>
  );
};

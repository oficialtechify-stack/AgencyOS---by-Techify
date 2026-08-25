import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Instagram,
  Phone,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  User,
  Package,
  ExternalLink,
  Video,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit2,
  Trophy,
  TrendingUp,
  Image as ImageIcon,
  ChevronRight,
  Filter,
  Check,
} from 'lucide-react';
import {
  ProspectionClosedContract,
  ProspectionContractStatus,
  ProspectionDemand,
  UserProfile,
} from '../../types';
import { CreateProspectionContractModal } from './CreateProspectionContractModal';
import { InspectProspectionContractModal } from './InspectProspectionContractModal';

interface ProspectionContractsTabProps {
  contracts: ProspectionClosedContract[];
  currentUser?: UserProfile | null;
  onAddContract: (contract: Omit<ProspectionClosedContract, 'id' | 'createdAt'>) => void;
  onUpdateContract: (id: string, updatedData: Partial<ProspectionClosedContract>) => void;
  onDeleteContract: (id: string) => void;
  sourceDemand?: ProspectionDemand | null;
  onClearSourceDemand?: () => void;
}

export const ProspectionContractsTab: React.FC<ProspectionContractsTabProps> = ({
  contracts = [],
  currentUser,
  onAddContract,
  onUpdateContract,
  onDeleteContract,
  sourceDemand,
  onClearSourceDemand,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [employeeFilter, setEmployeeFilter] = useState<string>('todos');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<ProspectionClosedContract | null>(null);
  const [inspectingContract, setInspectingContract] = useState<ProspectionClosedContract | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Auto-open create modal if navigated from a source demand
  React.useEffect(() => {
    if (sourceDemand) {
      setEditingContract(null);
      setIsCreateModalOpen(true);
    }
  }, [sourceDemand]);

  const isMaster =
    currentUser?.email === 'rickmarketing81@gmail.com' ||
    currentUser?.leadershipRole === 'lider_geral' ||
    currentUser?.leadershipRole === 'lider_prospeccao';

  // Stats Calculations
  const totalValue = useMemo(() => {
    return contracts.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);
  }, [contracts]);

  const totalClosedContracts = useMemo(() => {
    return contracts.filter(
      (c) => c.status === 'contrato_fechado' || c.status === 'onboarding_iniciado'
    ).length;
  }, [contracts]);

  const avgTicket = useMemo(() => {
    return contracts.length > 0 ? totalValue / contracts.length : 0;
  }, [contracts, totalValue]);

  // Ranking by Employee (Leaderboard)
  const employeeLeaderboard = useMemo(() => {
    const map: Record<
      string,
      { name: string; email: string; role: string; count: number; totalAmount: number }
    > = {};

    contracts.forEach((c) => {
      const key = (c.closingEmployeeEmail || c.closingEmployeeName).toLowerCase();
      if (!map[key]) {
        map[key] = {
          name: c.closingEmployeeName,
          email: c.closingEmployeeEmail,
          role: c.closingEmployeeRole,
          count: 0,
          totalAmount: 0,
        };
      }
      map[key].count += 1;
      map[key].totalAmount += c.dealValue || 0;
    });

    return Object.values(map).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [contracts]);

  // Unique Employees for Filter
  const uniqueEmployees = useMemo(() => {
    const list: string[] = [];
    contracts.forEach((c) => {
      if (c.closingEmployeeName && !list.includes(c.closingEmployeeName)) {
        list.push(c.closingEmployeeName);
      }
    });
    return list;
  }, [contracts]);

  // Filtered Contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = contract.clientName.toLowerCase().includes(q);
        const matchInsta = (contract.instagram || '').toLowerCase().includes(q);
        const matchEmp = (contract.closingEmployeeName || '').toLowerCase().includes(q);
        const matchPkg = (contract.packageName || '').toLowerCase().includes(q);
        const matchServ = (contract.individualService || '').toLowerCase().includes(q);
        const matchCity = (contract.city || '').toLowerCase().includes(q);
        if (!matchName && !matchInsta && !matchEmp && !matchPkg && !matchServ && !matchCity) {
          return false;
        }
      }

      // Status Filter
      if (statusFilter !== 'todos') {
        if (contract.status !== statusFilter) return false;
      }

      // Employee Filter
      if (employeeFilter !== 'todos') {
        if (contract.closingEmployeeName !== employeeFilter) return false;
      }

      return true;
    });
  }, [contracts, searchTerm, statusFilter, employeeFilter]);

  const getInstagramUrl = (handleOrUrl: string) => {
    if (!handleOrUrl) return '#';
    const clean = handleOrUrl.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    const cleanHandle = clean.replace(/^@+/, '').replace(/^instagram\.com\//, '').replace(/\/$/, '');
    return `https://www.instagram.com/${cleanHandle}/`;
  };

  const getStatusBadge = (st: ProspectionContractStatus) => {
    switch (st) {
      case 'contatado':
        return { label: '📞 Contatado', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'em_analise':
        return { label: '🔍 Em Análise', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'fazer_reuniao':
        return { label: '📅 Fazer Reunião', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      case 'proposta_enviada':
        return { label: '📑 Proposta Enviada', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'contrato_fechado':
        return { label: '💎 Contrato Fechado', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-black' };
      case 'onboarding_iniciado':
        return { label: '🚀 Onboarding', bg: 'bg-green-500/20 text-green-300 border-green-500/40 font-black' };
      default:
        return { label: st, bg: 'bg-neutral-800 text-neutral-300' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900/90 to-green-900/90 border border-emerald-500/50 text-white text-xs font-bold shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-bounce" />
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
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-white">Central de Contratos Fechados & Conversões da Prospecção</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] font-bold text-emerald-300">
              Tempo Real
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Acompanhe em tempo real quais clientes e pacotes cada funcionário da prospecção converteu, com Instagram, valores, reuniões agendadas e comprovantes.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingContract(null);
            setIsCreateModalOpen(true);
          }}
          className="w-full lg:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Registrar Novo Contrato Fechado</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0e0e0e] border border-emerald-900/40 bg-emerald-950/10">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Volume Total Gerado</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-400/80 font-medium">Contratos registrados</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e0e0e] border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total de Negócios</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{contracts.length}</div>
          <span className="text-[10px] text-neutral-500 font-medium">Na esteira comercial</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e0e0e] border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Ticket Médio</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            R$ {avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-neutral-500 font-medium">Por cliente convertido</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e0e0e] border border-green-900/40 bg-green-950/10">
          <div className="flex items-center justify-between text-green-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Contratos Ativos / Ganho</span>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-black text-green-300">{totalClosedContracts}</div>
          <span className="text-[10px] text-green-400/80 font-medium">Em implantação / entregas</span>
        </div>
      </div>

      {/* Ranking / Leaderboard dos Funcionários da Prospecção */}
      {employeeLeaderboard.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Desempenho Comercial por Funcionário da Prospecção (Tempo Real)
              </h3>
            </div>
            <span className="text-[11px] text-neutral-400">
              Ranking de faturamento gerado
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {employeeLeaderboard.map((emp, idx) => (
              <div
                key={emp.email || emp.name}
                onClick={() => setEmployeeFilter(employeeFilter === emp.name ? 'todos' : emp.name)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  employeeFilter === emp.name
                    ? 'bg-blue-950/40 border-blue-500 text-white shadow-md'
                    : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      idx === 0
                        ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20'
                        : idx === 1
                        ? 'bg-neutral-300 text-black'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <strong className="text-xs text-white block truncate">{emp.name}</strong>
                    <span className="text-[10px] text-neutral-400 block truncate">{emp.role}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-emerald-400">
                    R$ {emp.totalAmount.toLocaleString('pt-BR')}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-semibold">
                    {emp.count} {emp.count === 1 ? 'contrato' : 'contratos'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0e0e0e] border border-neutral-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Stage Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {[
            { val: 'todos', label: 'Todos os Contratos' },
            { val: 'contatado', label: '📞 Contatado' },
            { val: 'em_analise', label: '🔍 Em Análise' },
            { val: 'fazer_reuniao', label: '📅 Fazer Reunião' },
            { val: 'proposta_enviada', label: '📑 Proposta Enviada' },
            { val: 'contrato_fechado', label: '💎 Contrato Fechado' },
            { val: 'onboarding_iniciado', label: '🚀 Onboarding' },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setStatusFilter(tab.val)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.val
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter by Employee & Search */}
        <div className="flex items-center gap-2">
          {uniqueEmployees.length > 0 && (
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 rounded-xl px-3 py-2.5 outline-none font-medium"
            >
              <option value="todos">Todos os Funcionários</option>
              {uniqueEmployees.map((emp) => (
                <option key={emp} value={emp}>
                  👤 {emp}
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1 md:w-60">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente, insta, vendedor..."
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid of Contracts */}
      {filteredContracts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Nenhum contrato encontrado</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Não há contratos correspondentes aos filtros selecionados. Clique em "+ Registrar Novo Contrato Fechado" para cadastrar uma nova conversão comercial.
          </p>
          <button
            onClick={() => {
              setEditingContract(null);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-2 mt-2"
          >
            <Plus className="w-4 h-4" /> Registrar Contrato
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContracts.map((contract) => {
            const badge = getStatusBadge(contract.status);

            return (
              <div
                key={contract.id}
                className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Status Badge & Actions */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-[10px] font-semibold text-neutral-300">
                        {contract.recurringType === 'Mensal Recorrente (MRR)' ? 'MRR' : 'Pontual'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingContract(contract);
                          setIsCreateModalOpen(true);
                        }}
                        title="Editar Contrato"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {isMaster && (
                        <button
                          onClick={() => onDeleteContract(contract.id)}
                          title="Excluir Contrato"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Client Info & Image Thumbnail */}
                  <div className="flex items-start gap-3">
                    {contract.contractImageUrl ? (
                      <img
                        src={contract.contractImageUrl}
                        alt={contract.clientName}
                        onClick={() => setInspectingContract(contract)}
                        className="w-12 h-12 rounded-xl object-cover border border-neutral-700 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3
                        onClick={() => setInspectingContract(contract)}
                        className="text-sm font-black text-white hover:text-emerald-400 cursor-pointer transition-colors line-clamp-1"
                      >
                        {contract.clientName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                        <span className="text-[11px] text-neutral-300 truncate">{contract.segment}</span>
                        <span>•</span>
                        <span className="text-[11px] text-neutral-400">{contract.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Instagram Direct Link */}
                  <div className="mt-3">
                    <a
                      href={getInstagramUrl(contract.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-950/30 border border-pink-500/30 hover:border-pink-500 text-pink-300 text-xs font-bold transition-all group/insta"
                    >
                      <Instagram className="w-3.5 h-3.5 text-pink-400 group-hover/insta:scale-110 transition-transform" />
                      <span>{contract.instagram}</span>
                      <ExternalLink className="w-3 h-3 text-pink-400 opacity-60 group-hover/insta:opacity-100" />
                    </a>
                  </div>

                  {/* Solution / Package Details */}
                  <div className="mt-3 p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-1">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                      Solução Contratada:
                    </span>
                    <strong className="text-xs text-white block truncate">
                      {contract.contractType === 'Pacote Completo' ? contract.packageName : contract.individualService}
                    </strong>
                  </div>

                  {/* Reunião Marcada Snippet */}
                  {contract.meetingDate && (
                    <div className="mt-2.5 p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-300">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Video className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-[11px] truncate">
                          Reunião: {new Date(contract.meetingDate).toLocaleDateString('pt-BR')}{' '}
                          {contract.meetingTime ? `às ${contract.meetingTime}` : ''}
                        </span>
                      </div>
                      {contract.meetingLink && (
                        <a
                          href={contract.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold underline hover:text-white shrink-0 ml-1"
                        >
                          Meet
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer: Value & Closing Employee */}
                <div className="mt-4 pt-3 border-t border-neutral-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-bold block">Valor Fechado</span>
                      <div className="text-base font-black text-emerald-400">
                        R$ {contract.dealValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold block">Convertido por</span>
                      <div className="flex items-center gap-1.5 justify-end mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                          {contract.closingEmployeeName.slice(0, 1).toUpperCase()}
                        </div>
                        <strong className="text-xs text-white max-w-[110px] truncate">
                          {contract.closingEmployeeName}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setInspectingContract(contract)}
                    className="w-full py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer border border-neutral-800"
                  >
                    <span>Ver Detalhes do Fechamento</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modais de Contrato */}
      <CreateProspectionContractModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingContract(null);
          if (onClearSourceDemand) onClearSourceDemand();
        }}
        onSubmit={(contractData) => {
          if (editingContract) {
            onUpdateContract(editingContract.id, contractData);
            setFeedbackMessage('Contrato atualizado com sucesso!');
          } else {
            onAddContract(contractData);
            setFeedbackMessage(`💎 Contrato com "${contractData.clientName}" registrado com sucesso por ${contractData.closingEmployeeName}!`);
          }
          if (onClearSourceDemand) onClearSourceDemand();
          setTimeout(() => setFeedbackMessage(null), 4000);
        }}
        currentUser={currentUser}
        editingContract={editingContract}
        sourceDemand={sourceDemand}
      />

      <InspectProspectionContractModal
        isOpen={!!inspectingContract}
        contract={inspectingContract}
        onClose={() => setInspectingContract(null)}
        currentUser={currentUser}
        onUpdateStatus={(id, status) => {
          onUpdateContract(id, { status });
          setInspectingContract((prev) => (prev ? { ...prev, status } : null));
        }}
        onEdit={(contr) => {
          setEditingContract(contr);
          setIsCreateModalOpen(true);
        }}
      />
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  Target,
  Instagram,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Clock,
  User,
  Package,
  ExternalLink,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Check,
} from 'lucide-react';
import { ProspectionDemand, ProspectionDemandStatus, UserProfile } from '../../types';

interface InspectProspectionDemandModalProps {
  demand: ProspectionDemand | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onClaimDemand: (demandId: string) => void;
  onUpdateStatus: (demandId: string, status: ProspectionDemandStatus) => void;
  onAddNote: (demandId: string, noteText: string) => void;
  onConvertToContract: (demand: ProspectionDemand) => void;
}

export const InspectProspectionDemandModal: React.FC<InspectProspectionDemandModalProps> = ({
  demand,
  isOpen,
  onClose,
  currentUser,
  onClaimDemand,
  onUpdateStatus,
  onAddNote,
  onConvertToContract,
}) => {
  const [newNote, setNewNote] = useState('');

  if (!isOpen || !demand) return null;

  const isAssigned = !!demand.assignedTo;
  const isAssignedToMe =
    currentUser?.email && demand.assignedEmail && currentUser.email.toLowerCase() === demand.assignedEmail.toLowerCase();
  const isMaster =
    currentUser?.email === 'rickmarketing81@gmail.com' ||
    currentUser?.leadershipRole === 'lider_geral' ||
    currentUser?.leadershipRole === 'lider_prospeccao';

  const getInstagramUrl = (handleOrUrl: string) => {
    if (!handleOrUrl) return '#';
    const clean = handleOrUrl.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    const cleanHandle = clean.replace(/^@+/, '').replace(/^instagram\.com\//, '').replace(/\/$/, '');
    return `https://www.instagram.com/${cleanHandle}/`;
  };

  const getWhatsAppUrl = (phone?: string, companyName?: string) => {
    if (!phone) return '#';
    const digits = phone.replace(/\D/g, '');
    const fullNumber = digits.startsWith('55') ? digits : `55${digits}`;
    const text = encodeURIComponent(
      `Olá! Sou da Techify Agency e gostaria de falar sobre a estratégia de captação de clientes para a ${companyName || 'empresa'}.`
    );
    return `https://wa.me/${fullNumber}?text=${text}`;
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(demand.id, newNote.trim());
    setNewNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0e0e0e] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-start justify-between bg-neutral-900/60">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    demand.priority === 'Urgente'
                      ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                      : demand.priority === 'Alta'
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                      : demand.priority === 'Média'
                      ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                      : 'bg-neutral-800 border border-neutral-700 text-neutral-300'
                  }`}
                >
                  Prioridade {demand.priority}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    demand.status === 'Pendente'
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                      : demand.status === 'Assumida'
                      ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                      : demand.status === 'Em Abordagem'
                      ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                      : demand.status === 'Reunião Agendada'
                      ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                      : demand.status === 'Contrato Fechado'
                      ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {demand.status}
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-1">{demand.companyName}</h2>
              <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-neutral-500" /> {demand.segment}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" /> {demand.city}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Quick Action Links: Instagram & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={getInstagramUrl(demand.instagram)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-gradient-to-r from-pink-950/40 to-purple-950/40 border border-pink-500/30 hover:border-pink-500 flex items-center justify-between text-pink-300 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-pink-400 uppercase font-black block">Instagram Oficial</span>
                  <span className="text-xs font-bold text-white group-hover:underline">{demand.instagram}</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-pink-400 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {demand.phone ? (
              <a
                href={getWhatsAppUrl(demand.phone, demand.companyName)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-gradient-to-r from-green-950/40 to-emerald-950/40 border border-green-500/30 hover:border-green-500 flex items-center justify-between text-green-300 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-green-400 uppercase font-black block">WhatsApp / Telefone</span>
                    <span className="text-xs font-bold text-white group-hover:underline">{demand.phone}</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-green-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
            ) : (
              <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center gap-2.5 text-neutral-400">
                <Phone className="w-4 h-4 text-neutral-600" />
                <span className="text-xs">Telefone não informado (Abordar via Instagram Direct)</span>
              </div>
            )}
          </div>

          {/* Quem Pegou / Status da Demanda */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                  isAssigned ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {isAssigned ? demand.assignedTo?.slice(0, 2).toUpperCase() : '?'}
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block font-semibold">Responsável pela Prospecção:</span>
                {isAssigned ? (
                  <div className="flex items-center gap-2">
                    <strong className="text-xs text-white">{demand.assignedTo}</strong>
                    <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30 text-[10px] text-blue-300 font-bold">
                      {demand.assignedRole || 'Equipe de Prospecção'}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-amber-400">Ninguém pegou ainda (Disponível)</span>
                )}
              </div>
            </div>

            {!isAssigned ? (
              <button
                onClick={() => onClaimDemand(demand.id)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>Pegar Esta Demanda Agora</span>
              </button>
            ) : (
              (isAssignedToMe || isMaster) && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={demand.status}
                    onChange={(e) => onUpdateStatus(demand.id, e.target.value as ProspectionDemandStatus)}
                    className="bg-neutral-900 border border-neutral-700 text-xs text-white rounded-xl px-3 py-2 outline-none font-bold"
                  >
                    <option value="Assumida">Status: Assumida</option>
                    <option value="Em Abordagem">Status: Em Abordagem</option>
                    <option value="Reunião Agendada">Status: Reunião Agendada</option>
                    <option value="Contrato Fechado">Status: Contrato Fechado</option>
                    <option value="Desqualificado">Status: Desqualificado</option>
                  </select>
                </div>
              )
            )}
          </div>

          {/* Pacotes Techify Sugeridos para a Venda */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-blue-400" /> Pacotes Techify Indicados para Oferta
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demand.targetPackages && demand.targetPackages.length > 0 ? (
                demand.targetPackages.map((pkg, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 flex items-center gap-2.5 text-xs text-white font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{pkg}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-500">Nenhum pacote específico pré-selecionado.</p>
              )}
            </div>
          </div>

          {/* Roteiro e Instruções de Abordagem */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-purple-400" /> Roteiro e Instruções de Abordagem
            </h3>
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 leading-relaxed whitespace-pre-line font-medium">
              {demand.approachBriefing}
            </div>
          </div>

          {/* Meta & Criador */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400">
            <div>
              <span className="block text-[10px] text-neutral-500 font-bold uppercase">Cadastrado por:</span>
              <strong className="text-white">{demand.createdBy}</strong>
            </div>
            <div>
              <span className="block text-[10px] text-neutral-500 font-bold uppercase">Data de Publicação:</span>
              <span className="text-neutral-300">
                {new Date(demand.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-neutral-500 font-bold uppercase">Prazo de Abordagem:</span>
              <span className="text-amber-400 font-bold">
                {demand.deadline ? new Date(demand.deadline).toLocaleDateString('pt-BR') : 'Sem prazo fixo'}
              </span>
            </div>
          </div>

          {/* Histórico de Anotações & Andamento Comercial */}
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-green-400" /> Histórico de Contato & Evolução da Negociação
            </h3>

            {demand.historyNotes && demand.historyNotes.length > 0 ? (
              <div className="space-y-2">
                {demand.historyNotes.map((note) => (
                  <div key={note.id} className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                      <strong className="text-blue-400">{note.author}</strong>
                      <span>{note.date}</span>
                    </div>
                    <p className="text-neutral-200 leading-relaxed">{note.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500">Nenhuma anotação registrada ainda.</p>
            )}

            {/* Input para adicionar nova anotação */}
            {(isAssignedToMe || isMaster) && (
              <form onSubmit={handleAddNoteSubmit} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Escreva uma atualização (Ex: Cliente respondeu no WhatsApp, pediu proposta de Tráfego...)"
                  className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer transition-colors shrink-0"
                >
                  Registrar
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-900/80 border-t border-neutral-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onConvertToContract(demand);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs shadow-lg shadow-green-600/30 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Registrar Fechamento / Contrato Ganho</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

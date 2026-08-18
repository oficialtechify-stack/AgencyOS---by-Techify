import React from 'react';
import {
  FileText,
  Plus,
  Sparkles,
  ExternalLink,
  Trash2,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { DesignBriefingDemand } from '../../types';
import { FirestoreUserProfile } from '../../lib/firebase';

interface BriefingsTabProps {
  userProfile: FirestoreUserProfile | null;
  designBriefings: DesignBriefingDemand[];
  onOpenNewBriefingModal: () => void;
  onClaimBriefing: (briefing: DesignBriefingDemand) => void;
  onDeleteBriefing?: (id: string) => Promise<void>;
  showToast: (msg: string) => void;
}

export const BriefingsTab: React.FC<BriefingsTabProps> = ({
  userProfile,
  designBriefings,
  onOpenNewBriefingModal,
  onClaimBriefing,
  onDeleteBriefing,
  showToast,
}) => {
  const isExecutiveOrAdmin = Boolean(
    userProfile?.email === 'rickmarketing81@gmail.com' ||
    userProfile?.role?.toLowerCase().includes('executiv') ||
    userProfile?.role?.toLowerCase().includes('gerente') ||
    userProfile?.role?.toLowerCase().includes('admin') ||
    userProfile?.role?.toLowerCase().includes('master') ||
    userProfile?.role?.toLowerCase().includes('diretor') ||
    userProfile?.role?.toLowerCase().includes('gestor') ||
    !userProfile?.role ||
    userProfile?.role === 'Administrador' ||
    userProfile?.role === 'Master Admin' ||
    userProfile?.role === 'Executivo'
  );

  const handleOpenModal = () => {
    if (!isExecutiveOrAdmin) {
      showToast('Apenas Executivos e Gerentes de Contas podem cadastrar novos briefings de clientes.');
      return;
    }
    onOpenNewBriefingModal();
  };

  return (
    <div className="space-y-5">
      {/* Header bar for Executive Briefings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e111a] border border-[#1b2030] p-5 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Esteira de Briefings & Demandas do Executivo
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-950/80 border border-blue-600/40 text-blue-300 flex items-center gap-1">
              <Lock className="w-3 h-3 text-blue-400" /> Exclusivo do Executivo
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Apenas executivos e gerentes de contas cadastram o que os clientes solicitaram. Os designers podem assumir as demandas diretamente na esteira de produção.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className={`px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shrink-0 cursor-pointer shadow-lg transition-all ${
            isExecutiveOrAdmin
              ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
          title={isExecutiveOrAdmin ? 'Cadastrar Demanda' : 'Restrito a Executivos e Gerentes'}
        >
          {isExecutiveOrAdmin ? (
            <>
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Cadastrar Novo Briefing</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Novo Briefing (Apenas Executivo)</span>
            </>
          )}
        </button>
      </div>

      {/* Briefings List */}
      {designBriefings.length === 0 ? (
        <div className="bg-[#0c0e16] border border-[#1a1f2e] rounded-3xl p-10 text-center space-y-3">
          <FileText className="w-10 h-10 text-gray-500 mx-auto" />
          <h4 className="text-sm font-bold text-white">Nenhum briefing pendente no momento</h4>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            A esteira de demandas está limpa. Executivos e gerentes de contas podem registrar novos briefings de clientes para a equipe de design.
          </p>
          {isExecutiveOrAdmin && (
            <button
              onClick={onOpenNewBriefingModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Cadastrar Primeiro Briefing
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {designBriefings.map((briefing) => (
            <div
              key={briefing.id}
              className="bg-[#0e111a] border border-[#1b2030] hover:border-[#2b354d] rounded-2xl p-5 space-y-3.5 shadow-lg flex flex-col justify-between transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-950/60 border border-blue-600/40 text-blue-400">
                    {briefing.channel}
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        briefing.priority === 'Urgente'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : briefing.priority === 'Alta'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-gray-800 text-gray-300'
                      }`}
                    >
                      Prioridade: {briefing.priority}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        briefing.status === 'Assumido'
                          ? 'bg-[#142816] text-[#22c55e] border border-[#22c55e]/40'
                          : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                      }`}
                    >
                      {briefing.status}
                    </span>

                    {onDeleteBriefing && (
                      <button
                        onClick={async () => {
                          if (window.confirm(`Deseja apagar o briefing "${briefing.title}"?`)) {
                            await onDeleteBriefing(briefing.id);
                            showToast(`Briefing "${briefing.title}" excluído.`);
                          }
                        }}
                        className="p-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 cursor-pointer ml-1"
                        title="Excluir Briefing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-amber-400">🏢 {briefing.clientName}</span>
                  <h4 className="text-sm font-black text-white mt-0.5">{briefing.title}</h4>
                </div>

                <p className="text-xs text-gray-300 bg-[#121522] p-3 rounded-xl border border-[#1e2538] leading-relaxed whitespace-pre-wrap">
                  {briefing.description}
                </p>

                {briefing.referencesUrl && (
                  <div className="text-xs flex items-center gap-1.5 text-blue-400 hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <a href={briefing.referencesUrl} target="_blank" rel="noreferrer">
                      Ver link de referências visuais
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#1b2030] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-gray-400 text-[11px]">
                  <div>
                    Executivo: <span className="text-gray-200 font-bold">{briefing.executiveName}</span>
                  </div>
                  <div>
                    Prazo: <span className="text-gray-200 font-mono">{briefing.deadline}</span>
                  </div>
                </div>

                {briefing.status === 'Pendente' ? (
                  <button
                    onClick={() => onClaimBriefing(briefing)}
                    className="px-4 py-2 rounded-xl bg-[#22c55e] hover:bg-[#1eb054] text-black font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#22c55e]/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Assumir & Iniciar Arte
                  </button>
                ) : (
                  <div className="text-[11px] text-[#22c55e] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Assumido por {briefing.claimedBy || 'Designer'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

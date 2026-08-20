import React, { useState } from 'react';
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
  Instagram,
  Image as ImageIcon,
  Link as LinkIcon,
  Maximize2,
  X,
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
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  const isExecutiveOrAdmin = Boolean(
    userProfile?.email === 'rickmarketing81@gmail.com' ||
    userProfile?.role?.toLowerCase().includes('executiv') ||
    userProfile?.role?.toLowerCase().includes('gerente') ||
    userProfile?.role?.toLowerCase().includes('admin') ||
    userProfile?.role?.toLowerCase().includes('master') ||
    userProfile?.role?.toLowerCase().includes('diretor') ||
    userProfile?.role?.toLowerCase().includes('gestor') ||
    userProfile?.role?.toLowerCase().includes('lider') ||
    userProfile?.role?.toLowerCase().includes('líder') ||
    userProfile?.userType === 'employee' ||
    !userProfile?.role ||
    userProfile?.role === 'Administrador' ||
    userProfile?.role === 'Master Admin' ||
    userProfile?.role === 'Executivo'
  );

  const handleOpenModal = () => {
    onOpenNewBriefingModal();
  };

  const formatInstagramUrl = (handleOrUrl: string) => {
    if (handleOrUrl.startsWith('http://') || handleOrUrl.startsWith('https://')) {
      return handleOrUrl;
    }
    const clean = handleOrUrl.replace(/^@/, '').trim();
    return `https://instagram.com/${clean}`;
  };

  return (
    <div className="space-y-5">
      {/* Header bar for Demands & Briefings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e111a] border border-[#1b2030] p-5 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Esteira de Demandas, Briefings & Exemplos Visuais
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-950/80 border border-blue-600/40 text-blue-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Workspace Integrado da Equipe
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Cadastre demandas com imagens de referência, perfis/posts do Instagram e links. Seus funcionários visualizam e assumem as artes diretamente em tempo real.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shrink-0 cursor-pointer shadow-lg bg-blue-600 hover:bg-blue-500 shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Cadastrar Demanda / Briefing</span>
        </button>
      </div>

      {/* Briefings List */}
      {designBriefings.length === 0 ? (
        <div className="bg-[#0c0e16] border border-[#1a1f2e] rounded-3xl p-10 text-center space-y-3">
          <FileText className="w-10 h-10 text-gray-500 mx-auto" />
          <h4 className="text-sm font-bold text-white">Nenhuma demanda ou briefing cadastrado no momento</h4>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            A esteira está pronta para receber solicitações. Você ou sua equipe podem cadastrar novos briefings com links, imagens e referências do Instagram.
          </p>
          <button
            onClick={onOpenNewBriefingModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Cadastrar Primeira Demanda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {designBriefings.map((briefing) => (
            <div
              key={briefing.id}
              className="bg-[#0e111a] border border-[#1b2030] hover:border-[#2b354d] rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
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
                          if (window.confirm(`Deseja apagar a demanda "${briefing.title}"?`)) {
                            await onDeleteBriefing(briefing.id);
                            showToast(`Demanda "${briefing.title}" excluída.`);
                          }
                        }}
                        className="p-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 cursor-pointer ml-1"
                        title="Excluir Demanda"
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

                {/* Briefing text */}
                <p className="text-xs text-gray-300 bg-[#121522] p-3 rounded-xl border border-[#1e2538] leading-relaxed whitespace-pre-wrap">
                  {briefing.description}
                </p>

                {/* Exemplos de Imagens Anexadas */}
                {briefing.referenceImages && briefing.referenceImages.length > 0 && (
                  <div className="space-y-1.5 bg-[#090b12] p-2.5 rounded-xl border border-[#1b2030]">
                    <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> Imagens de Exemplo ({briefing.referenceImages.length}):
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {briefing.referenceImages.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedPreviewImage(img)}
                          className="relative group w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-neutral-700 bg-black cursor-pointer hover:border-emerald-400 transition-all"
                        >
                          <img
                            src={img}
                            alt={`Exemplo ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Maximize2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Referências do Instagram */}
                {((briefing.instagramProfiles && briefing.instagramProfiles.length > 0) ||
                  (briefing.instagramPosts && briefing.instagramPosts.length > 0)) && (
                  <div className="space-y-1.5 bg-[#090b12] p-2.5 rounded-xl border border-[#1b2030]">
                    <div className="text-[10px] font-bold text-pink-400 flex items-center gap-1">
                      <Instagram className="w-3 h-3" /> Referências do Instagram:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {briefing.instagramProfiles?.map((handle, idx) => (
                        <a
                          key={`prof-${idx}`}
                          href={formatInstagramUrl(handle)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-950/60 border border-pink-600/40 text-pink-300 hover:bg-pink-900 text-[10px] font-bold transition-colors"
                        >
                          <Instagram className="w-3 h-3 text-pink-400" />
                          <span>{handle}</span>
                          <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70" />
                        </a>
                      ))}

                      {briefing.instagramPosts?.map((postUrl, idx) => (
                        <a
                          key={`post-${idx}`}
                          href={postUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-950/40 border border-pink-800/40 text-pink-200 hover:bg-pink-900 text-[10px] transition-colors"
                        >
                          <ExternalLink className="w-2.5 h-2.5 text-pink-400" />
                          <span>Post Instagram {idx + 1}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links de Referência Web */}
                {((briefing.referenceLinks && briefing.referenceLinks.length > 0) || briefing.referencesUrl) && (
                  <div className="space-y-1.5 bg-[#090b12] p-2.5 rounded-xl border border-[#1b2030]">
                    <div className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" /> Links de Referência & Inspiração:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {briefing.referencesUrl && !briefing.referenceLinks?.includes(briefing.referencesUrl) && (
                        <a
                          href={briefing.referencesUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-600/40 text-blue-300 hover:bg-blue-900 text-[10px] font-bold transition-colors truncate max-w-full"
                        >
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{briefing.referencesUrl}</span>
                        </a>
                      )}

                      {briefing.referenceLinks?.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-600/40 text-blue-300 hover:bg-blue-900 text-[10px] font-bold transition-colors truncate max-w-full"
                        >
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{link}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#1b2030] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-gray-400 text-[11px]">
                  <div>
                    Solicitante: <span className="text-gray-200 font-bold">{briefing.executiveName}</span>
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

      {/* Lightbox / Zoom Preview Modal for Reference Images */}
      {selectedPreviewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] bg-[#0c0e16] border border-neutral-800 rounded-2xl overflow-hidden p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPreviewImage}
              alt="Exemplo ampliado"
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl mx-auto"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

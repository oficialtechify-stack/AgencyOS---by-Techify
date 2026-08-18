import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Palette,
  Package,
} from 'lucide-react';
import { DesignProject, DesignComment, DesignStatus } from '../../types';
import { FirestoreUserProfile } from '../../lib/firebase';

interface ChatTabProps {
  userProfile: FirestoreUserProfile | null;
  designProjects: DesignProject[];
  designComments: DesignComment[];
  activeChatProjectId: string | null;
  setActiveChatProjectId: (id: string) => void;
  onAddComment?: (comment: Omit<DesignComment, 'id'>) => Promise<void>;
  onDeleteComment?: (id: string) => Promise<void>;
  showToast: (msg: string) => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  userProfile,
  designProjects,
  designComments,
  activeChatProjectId,
  setActiveChatProjectId,
  onAddComment,
  onDeleteComment,
  showToast,
}) => {
  const [chatMessageInput, setChatMessageInput] = useState('');

  const currentChatProject =
    designProjects.find((p) => p.id === (activeChatProjectId || designProjects[0]?.id)) ||
    designProjects[0];

  const handleSendComment = async (e: React.FormEvent, projectId: string) => {
    e.preventDefault();
    if (!chatMessageInput.trim()) return;

    try {
      if (onAddComment) {
        await onAddComment({
          projectId,
          authorName: userProfile?.name || 'Designer',
          authorEmail: userProfile?.email || 'usuario@agencia.com',
          authorRole:
            userProfile?.email === 'rickmarketing81@gmail.com' ? 'lider' : 'designer',
          text: chatMessageInput.trim(),
          timestamp: new Date().toISOString(),
        });
      }
      setChatMessageInput('');
    } catch (err) {
      console.error(err);
      showToast('Erro ao enviar mensagem.');
    }
  };

  const renderStatusBadge = (status: DesignStatus, approved?: boolean) => {
    switch (status) {
      case 'aprovado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-[#16301e] text-[#22c55e] border border-[#22c55e]/40 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" /> Aprovado
          </span>
        );
      case 'revisao':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#332a12] text-[#facc15] border border-[#facc15]/40 shadow-sm animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Em Revisão (Líder)
          </span>
        );
      case 'ajustes':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#381a1a] text-[#f87171] border border-[#f87171]/40 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5" /> Ajustes Solicitados
          </span>
        );
      case 'producao':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#142238] text-[#60a5fa] border border-[#60a5fa]/40 shadow-sm">
            <Palette className="w-3.5 h-3.5" /> Em Produção
          </span>
        );
      case 'entregue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#261438] text-[#c084fc] border border-[#c084fc]/40 shadow-sm">
            <Package className="w-3.5 h-3.5" /> Entregue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1d212f] text-gray-300 border border-[#2e354a]">
            {status}
          </span>
        );
    }
  };

  if (designProjects.length === 0) {
    return (
      <div className="bg-[#0c0e16] border border-[#1a1f2e] rounded-3xl p-12 text-center space-y-3">
        <MessageSquare className="w-10 h-10 text-gray-500 mx-auto" />
        <h4 className="text-sm font-bold text-white">Nenhuma conversa ativa</h4>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          As conversas e feedbacks são vinculados aos criativos da esteira. Quando você criar novos designs, os canais de mensagens aparecerão aqui.
        </p>
      </div>
    );
  }

  const projectComments = currentChatProject
    ? designComments.filter((c) => c.projectId === currentChatProject.id)
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Projects List on the Left */}
      <div className="bg-[#0e111a] border border-[#1b2030] rounded-2xl p-4 space-y-3 h-[600px] flex flex-col">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#22c55e]" />
          Conversas por Criativo
        </h3>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {designProjects.map((p) => {
            const isSelected = (activeChatProjectId || designProjects[0]?.id) === p.id;
            const commentsForThis = designComments.filter((c) => c.projectId === p.id);
            return (
              <div
                key={p.id}
                onClick={() => setActiveChatProjectId(p.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#18231c] border-[#22c55e]/50 text-white'
                    : 'bg-[#121522] border-[#1e2438] text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="truncate">{p.title}</span>
                  <span className="text-[10px] text-gray-400 font-mono shrink-0 ml-2">
                    {commentsForThis.length} msg
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 mt-1 flex items-center justify-between">
                  <span>🏢 {p.clientName}</span>
                  <span className="text-[#22c55e]">{p.assignedTo}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Chat Thread on the Right */}
      <div className="lg:col-span-2 bg-[#0e111a] border border-[#1b2030] rounded-2xl p-5 flex flex-col h-[600px]">
        {currentChatProject ? (
          <>
            {/* Chat Header */}
            <div className="pb-4 border-b border-[#1b2030] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-white">{currentChatProject.title}</h4>
                <p className="text-xs text-gray-400">
                  🏢 {currentChatProject.clientName} • Designer: {currentChatProject.assignedTo}
                </p>
              </div>

              <div>{renderStatusBadge(currentChatProject.status, currentChatProject.approved)}</div>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
              {projectComments.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  Nenhuma mensagem ou feedback registrado neste criativo ainda. Envie uma mensagem abaixo para a equipe!
                </div>
              ) : (
                projectComments.map((comment) => {
                  const isLeader = comment.authorRole === 'lider';
                  return (
                    <div
                      key={comment.id}
                      className={`p-3.5 rounded-2xl max-w-[85%] text-xs space-y-1 relative group ${
                        isLeader
                          ? 'ml-auto bg-[#1b2a1e] border border-[#22c55e]/40 text-gray-100'
                          : 'mr-auto bg-[#141824] border border-[#232b3f] text-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] font-bold">
                        <span className={isLeader ? 'text-[#22c55e]' : 'text-blue-400'}>
                          {comment.authorName} ({isLeader ? 'Líder / Aprovação' : 'Designer'})
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 font-mono">
                            {new Date(comment.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          {onDeleteComment && (
                            <button
                              onClick={async () => {
                                await onDeleteComment(comment.id);
                                showToast('Comentário removido.');
                              }}
                              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-0.5 cursor-pointer transition-opacity"
                              title="Excluir mensagem"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => handleSendComment(e, currentChatProject.id)}
              className="pt-3 border-t border-[#1b2030] flex items-center gap-2"
            >
              <input
                type="text"
                value={chatMessageInput}
                onChange={(e) => setChatMessageInput(e.target.value)}
                placeholder="Escreva uma mensagem, sugestão ou ajuste..."
                className="flex-1 bg-[#141824] border border-[#232b3f] rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#1eb054] text-black font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#22c55e]/20"
              >
                <Send className="w-3.5 h-3.5" /> Enviar
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-xs">
            Selecione um projeto para ver a conversa.
          </div>
        )}
      </div>
    </div>
  );
};

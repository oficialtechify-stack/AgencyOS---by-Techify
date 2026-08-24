import React from 'react';
import {
  MarketingCampaign,
  MarketingEditorialItem,
  MarketingFunnel,
  MarketingEmailFlow,
  MarketingCopyScript,
} from '../../types';
import {
  Megaphone,
  Calendar,
  Layers,
  Mail,
  FileText,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface MarketingModalsProps {
  // Campaign Modals
  isNewCampaignModalOpen: boolean;
  onCloseNewCampaignModal: () => void;
  newCampaign: Omit<MarketingCampaign, 'id'>;
  onNewCampaignChange: (camp: Omit<MarketingCampaign, 'id'>) => void;
  onSaveNewCampaign: (e: React.FormEvent) => void;

  editingCampaign: MarketingCampaign | null;
  onCloseEditCampaignModal: () => void;
  onEditingCampaignChange: (camp: MarketingCampaign) => void;
  onSaveEditCampaign: (e: React.FormEvent) => void;

  // Editorial Modals
  isNewEditorialModalOpen: boolean;
  onCloseNewEditorialModal: () => void;
  newEditorial: Omit<MarketingEditorialItem, 'id'>;
  onNewEditorialChange: (item: Omit<MarketingEditorialItem, 'id'>) => void;
  onSaveNewEditorial: (e: React.FormEvent) => void;

  editingEditorial: MarketingEditorialItem | null;
  onCloseEditEditorialModal: () => void;
  onEditingEditorialChange: (item: MarketingEditorialItem) => void;
  onSaveEditEditorial: (e: React.FormEvent) => void;

  // Funnel Modals
  isNewFunnelModalOpen: boolean;
  onCloseNewFunnelModal: () => void;
  newFunnel: Omit<MarketingFunnel, 'id'>;
  onNewFunnelChange: (funnel: Omit<MarketingFunnel, 'id'>) => void;
  onSaveNewFunnel: (e: React.FormEvent) => void;

  editingFunnel: MarketingFunnel | null;
  onCloseEditFunnelModal: () => void;
  onEditingFunnelChange: (funnel: MarketingFunnel) => void;
  onSaveEditFunnel: (e: React.FormEvent) => void;

  // Email Flow Modals
  isNewEmailModalOpen: boolean;
  onCloseNewEmailModal: () => void;
  newEmailFlow: Omit<MarketingEmailFlow, 'id'>;
  onNewEmailFlowChange: (flow: Omit<MarketingEmailFlow, 'id'>) => void;
  onSaveNewEmailFlow: (e: React.FormEvent) => void;

  editingEmailFlow: MarketingEmailFlow | null;
  onCloseEditEmailModal: () => void;
  onEditingEmailFlowChange: (flow: MarketingEmailFlow) => void;
  onSaveEditEmailFlow: (e: React.FormEvent) => void;

  // Copy Modals
  isNewCopyModalOpen: boolean;
  onCloseNewCopyModal: () => void;
  newCopy: Omit<MarketingCopyScript, 'id'>;
  onNewCopyChange: (copy: Omit<MarketingCopyScript, 'id'>) => void;
  onSaveNewCopy: (e: React.FormEvent) => void;

  editingCopy: MarketingCopyScript | null;
  onCloseEditCopyModal: () => void;
  onEditingCopyChange: (copy: MarketingCopyScript) => void;
  onSaveEditCopy: (e: React.FormEvent) => void;

  // Confirmation Modals
  itemToDelete: {
    type: 'campanha' | 'editorial' | 'funil' | 'email' | 'copy';
    id: string;
    title: string;
  } | null;
  onCloseDeleteModal: () => void;
  onConfirmDelete: () => void;

  isClearAllModalOpen: boolean;
  onCloseClearAllModal: () => void;
  onConfirmClearAll: () => void;
}

export const MarketingModals: React.FC<MarketingModalsProps> = ({
  isNewCampaignModalOpen,
  onCloseNewCampaignModal,
  newCampaign,
  onNewCampaignChange,
  onSaveNewCampaign,
  editingCampaign,
  onCloseEditCampaignModal,
  onEditingCampaignChange,
  onSaveEditCampaign,
  isNewEditorialModalOpen,
  onCloseNewEditorialModal,
  newEditorial,
  onNewEditorialChange,
  onSaveNewEditorial,
  editingEditorial,
  onCloseEditEditorialModal,
  onEditingEditorialChange,
  onSaveEditEditorial,
  isNewFunnelModalOpen,
  onCloseNewFunnelModal,
  newFunnel,
  onNewFunnelChange,
  onSaveNewFunnel,
  editingFunnel,
  onCloseEditFunnelModal,
  onEditingFunnelChange,
  onSaveEditFunnel,
  isNewEmailModalOpen,
  onCloseNewEmailModal,
  newEmailFlow,
  onNewEmailFlowChange,
  onSaveNewEmailFlow,
  editingEmailFlow,
  onCloseEditEmailModal,
  onEditingEmailFlowChange,
  onSaveEditEmailFlow,
  isNewCopyModalOpen,
  onCloseNewCopyModal,
  newCopy,
  onNewCopyChange,
  onSaveNewCopy,
  editingCopy,
  onCloseEditCopyModal,
  onEditingCopyChange,
  onSaveEditCopy,
  itemToDelete,
  onCloseDeleteModal,
  onConfirmDelete,
  isClearAllModalOpen,
  onCloseClearAllModal,
  onConfirmClearAll,
}) => {
  return (
    <>
      {/* 1. Modal: Nova Campanha */}
      {isNewCampaignModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-[#202738] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-[#1b2030] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#22c55e]" />
                Nova Campanha de Marketing
              </h3>
              <button onClick={onCloseNewCampaignModal} className="text-gray-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={onSaveNewCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Título da Campanha *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lançamento Q3 - Tráfego Direto & Remarketing"
                  value={newCampaign.title}
                  onChange={(e) => onNewCampaignChange({ ...newCampaign, title: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Cliente / Marca</label>
                  <input
                    type="text"
                    placeholder="Ex: Techify Agência"
                    value={newCampaign.clientName}
                    onChange={(e) => onNewCampaignChange({ ...newCampaign, clientName: e.target.value })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Responsável</label>
                  <input
                    type="text"
                    placeholder="Ex: Gestor de Tráfego"
                    value={newCampaign.responsible}
                    onChange={(e) => onNewCampaignChange({ ...newCampaign, responsible: e.target.value })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Tipo de Estratégia</label>
                  <select
                    value={newCampaign.type}
                    onChange={(e) => onNewCampaignChange({ ...newCampaign, type: e.target.value as any })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Lançamento">Lançamento</option>
                    <option value="Inbound">Inbound</option>
                    <option value="Outbound">Outbound</option>
                    <option value="Branding">Branding</option>
                    <option value="Perpétuo">Perpétuo</option>
                    <option value="Tráfego Direto">Tráfego Direto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Canal Principal</label>
                  <select
                    value={newCampaign.channel}
                    onChange={(e) => onNewCampaignChange({ ...newCampaign, channel: e.target.value as any })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Multi-Canal">Multi-Canal</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Email + CRM">Email + CRM</option>
                    <option value="TikTok Ads">TikTok Ads</option>
                    <option value="Orgânico / SEO">Orgânico / SEO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Orçamento Previsto (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={newCampaign.budget}
                    onChange={(e) => onNewCampaignChange({ ...newCampaign, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Meta de Leads (Qtd)</label>
                  <input
                    type="number"
                    min="0"
                    value={newCampaign.leadsGoal}
                    onChange={(e) => onNewCampaignChange({ ...newCampaign, leadsGoal: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Anotações / Estrutura</label>
                <textarea
                  rows={2}
                  placeholder="Gatilhos, públicos testados, links de criativos..."
                  value={newCampaign.notes}
                  onChange={(e) => onNewCampaignChange({ ...newCampaign, notes: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2030]">
                <button
                  type="button"
                  onClick={onCloseNewCampaignModal}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-black font-extrabold hover:bg-[#1eb054] cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                >
                  Criar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Editar Campanha (Funcionários e Líderes) */}
      {editingCampaign && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-[#202738] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-[#1b2030] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#22c55e]" />
                Editar Métricas & Status da Campanha
              </h3>
              <button onClick={onCloseEditCampaignModal} className="text-gray-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={onSaveEditCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Título da Campanha *</label>
                <input
                  type="text"
                  required
                  value={editingCampaign.title}
                  onChange={(e) => onEditingCampaignChange({ ...editingCampaign, title: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Cliente / Marca</label>
                  <input
                    type="text"
                    value={editingCampaign.clientName}
                    onChange={(e) => onEditingCampaignChange({ ...editingCampaign, clientName: e.target.value })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Status</label>
                  <select
                    value={editingCampaign.status}
                    onChange={(e) => onEditingCampaignChange({ ...editingCampaign, status: e.target.value as any })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Planejamento">Planejamento</option>
                    <option value="Ativa">Ativa</option>
                    <option value="Em Otimização">Em Otimização</option>
                    <option value="Pausada">Pausada</option>
                    <option value="Concluída">Concluída</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Orçamento (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCampaign.budget}
                    onChange={(e) => onEditingCampaignChange({ ...editingCampaign, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Gasto Atual (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCampaign.spent}
                    onChange={(e) => onEditingCampaignChange({ ...editingCampaign, spent: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Receita Gerada (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCampaign.revenue}
                    onChange={(e) => onEditingCampaignChange({ ...editingCampaign, revenue: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Meta Leads</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCampaign.leadsGoal}
                    onChange={(e) => onEditingCampaignChange({ ...editingCampaign, leadsGoal: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Leads Obtidos</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCampaign.leadsGenerated}
                    onChange={(e) => onEditingCampaignChange({ ...editingCampaign, leadsGenerated: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Anotações Estratégicas</label>
                <textarea
                  rows={2}
                  value={editingCampaign.notes || ''}
                  onChange={(e) => onEditingCampaignChange({ ...editingCampaign, notes: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2030]">
                <button
                  type="button"
                  onClick={onCloseEditCampaignModal}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-black font-extrabold hover:bg-[#1eb054] cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Novo Editorial */}
      {isNewEditorialModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-[#202738] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-[#1b2030] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Novo Conteúdo Editorial
              </h3>
              <button onClick={onCloseNewEditorialModal} className="text-gray-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={onSaveNewEditorial} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Título / Pauta da Postagem *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Como Reduzir o CAC em 40% em 30 Dias"
                  value={newEditorial.title}
                  onChange={(e) => onNewEditorialChange({ ...newEditorial, title: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Canal de Publicação</label>
                  <select
                    value={newEditorial.channel}
                    onChange={(e) => onNewEditorialChange({ ...newEditorial, channel: e.target.value as any })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Blog / SEO">Blog / SEO</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Email Newsletter">Email Newsletter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Formato</label>
                  <select
                    value={newEditorial.contentType}
                    onChange={(e) => onNewEditorialChange({ ...newEditorial, contentType: e.target.value as any })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Carrossel">Carrossel</option>
                    <option value="Reels / Shorts">Reels / Shorts</option>
                    <option value="Artigo Longo">Artigo Longo</option>
                    <option value="Vídeo VSL">Vídeo VSL</option>
                    <option value="Post Estático">Post Estático</option>
                    <option value="Infográfico">Infográfico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Etapa do Funil</label>
                  <select
                    value={newEditorial.funnelStage}
                    onChange={(e) => onNewEditorialChange({ ...newEditorial, funnelStage: e.target.value as any })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Topo (Atração)">Topo (Atração)</option>
                    <option value="Meio (Nutrição)">Meio (Nutrição)</option>
                    <option value="Fundo (Conversão)">Fundo (Conversão)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Data Prevista</label>
                  <input
                    type="date"
                    value={newEditorial.publishDate}
                    onChange={(e) => onNewEditorialChange({ ...newEditorial, publishDate: e.target.value })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Estrutura / Resumo da Copy</label>
                <textarea
                  rows={3}
                  placeholder="Ganchos, tópicos de cada slide ou pontos principais do artigo..."
                  value={newEditorial.copyOutline}
                  onChange={(e) => onNewEditorialChange({ ...newEditorial, copyOutline: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2030]">
                <button
                  type="button"
                  onClick={onCloseNewEditorialModal}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-black font-extrabold hover:bg-[#1eb054] cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                >
                  Salvar Conteúdo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Editar Editorial */}
      {editingEditorial && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-[#202738] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-[#1b2030] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Editar Conteúdo Editorial
              </h3>
              <button onClick={onCloseEditEditorialModal} className="text-gray-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={onSaveEditEditorial} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Título / Pauta *</label>
                <input
                  type="text"
                  required
                  value={editingEditorial.title}
                  onChange={(e) => onEditingEditorialChange({ ...editingEditorial, title: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Status</label>
                  <select
                    value={editingEditorial.status}
                    onChange={(e) => onEditingEditorialChange({ ...editingEditorial, status: e.target.value as any })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Ideia">Ideia</option>
                    <option value="Em Redação">Em Redação</option>
                    <option value="Design / Revisão">Design / Revisão</option>
                    <option value="Agendado">Agendado</option>
                    <option value="Publicado">Publicado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Data Publicação</label>
                  <input
                    type="date"
                    value={editingEditorial.publishDate}
                    onChange={(e) => onEditingEditorialChange({ ...editingEditorial, publishDate: e.target.value })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Estrutura / Copy</label>
                <textarea
                  rows={4}
                  value={editingEditorial.copyOutline || ''}
                  onChange={(e) => onEditingEditorialChange({ ...editingEditorial, copyOutline: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2030]">
                <button
                  type="button"
                  onClick={onCloseEditEditorialModal}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-black font-extrabold hover:bg-[#1eb054] cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Novo Funil */}
      {isNewFunnelModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-[#202738] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-[#1b2030] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                Estruturar Novo Funil de Aquisição
              </h3>
              <button onClick={onCloseNewFunnelModal} className="text-gray-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={onSaveNewFunnel} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Nome do Funil *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Funil Principal de Aquisição High-Ticket"
                  value={newFunnel.name}
                  onChange={(e) => onNewFunnelChange({ ...newFunnel, name: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Origem de Tráfego</label>
                  <input
                    type="text"
                    placeholder="Ex: Meta Ads + Search"
                    value={newFunnel.trafficSource}
                    onChange={(e) => onNewFunnelChange({ ...newFunnel, trafficSource: e.target.value })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Ticket Médio (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={newFunnel.averageTicket}
                    onChange={(e) => onNewFunnelChange({ ...newFunnel, averageTicket: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Visitantes</label>
                  <input
                    type="number"
                    min="0"
                    value={newFunnel.visitors}
                    onChange={(e) => onNewFunnelChange({ ...newFunnel, visitors: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Leads (Topo)</label>
                  <input
                    type="number"
                    min="0"
                    value={newFunnel.leads}
                    onChange={(e) => onNewFunnelChange({ ...newFunnel, leads: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">MQLs (Meio)</label>
                  <input
                    type="number"
                    min="0"
                    value={newFunnel.mqls}
                    onChange={(e) => onNewFunnelChange({ ...newFunnel, mqls: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">SQLs / Oportunidades</label>
                  <input
                    type="number"
                    min="0"
                    value={newFunnel.sqls}
                    onChange={(e) => onNewFunnelChange({ ...newFunnel, sqls: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Vendas Concluídas</label>
                  <input
                    type="number"
                    min="0"
                    value={newFunnel.sales}
                    onChange={(e) => onNewFunnelChange({ ...newFunnel, sales: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2030]">
                <button
                  type="button"
                  onClick={onCloseNewFunnelModal}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-black font-extrabold hover:bg-[#1eb054] cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                >
                  Salvar Funil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Editar Funil */}
      {editingFunnel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-[#202738] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-[#1b2030] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                Editar Métricas do Funil
              </h3>
              <button onClick={onCloseEditFunnelModal} className="text-gray-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={onSaveEditFunnel} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Nome do Funil *</label>
                <input
                  type="text"
                  required
                  value={editingFunnel.name}
                  onChange={(e) => onEditingFunnelChange({ ...editingFunnel, name: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Ticket Médio (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingFunnel.averageTicket}
                    onChange={(e) => onEditingFunnelChange({ ...editingFunnel, averageTicket: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Status</label>
                  <select
                    value={editingFunnel.status}
                    onChange={(e) => onEditingFunnelChange({ ...editingFunnel, status: e.target.value as any })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Testando">Testando</option>
                    <option value="Pausado">Pausado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Visitantes</label>
                  <input
                    type="number"
                    min="0"
                    value={editingFunnel.visitors}
                    onChange={(e) => onEditingFunnelChange({ ...editingFunnel, visitors: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Leads (Topo)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingFunnel.leads}
                    onChange={(e) => onEditingFunnelChange({ ...editingFunnel, leads: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">MQLs (Meio)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingFunnel.mqls}
                    onChange={(e) => onEditingFunnelChange({ ...editingFunnel, mqls: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">SQLs / Oportunidades</label>
                  <input
                    type="number"
                    min="0"
                    value={editingFunnel.sqls}
                    onChange={(e) => onEditingFunnelChange({ ...editingFunnel, sqls: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Vendas Concluídas</label>
                  <input
                    type="number"
                    min="0"
                    value={editingFunnel.sales}
                    onChange={(e) => onEditingFunnelChange({ ...editingFunnel, sales: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2030]">
                <button
                  type="button"
                  onClick={onCloseEditFunnelModal}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-black font-extrabold hover:bg-[#1eb054] cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal: Nova Automação de E-mail */}
      {isNewEmailModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-[#202738] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#1b2030] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-400" />
                Nova Automação de E-mail
              </h3>
              <button onClick={onCloseNewEmailModal} className="text-gray-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={onSaveNewEmailFlow} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Nome do Fluxo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sequência de Reengajamento para Leads Frios"
                  value={newEmailFlow.name}
                  onChange={(e) => onNewEmailFlowChange({ ...newEmailFlow, name: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Gatilho de Disparo</label>
                <input
                  type="text"
                  placeholder="Ex: Lead baixou E-book ou Solicitou Orçamento"
                  value={newEmailFlow.triggerEvent}
                  onChange={(e) => onNewEmailFlowChange({ ...newEmailFlow, triggerEvent: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Qtd. de E-mails / Passos</label>
                  <input
                    type="number"
                    min="1"
                    value={newEmailFlow.stepsCount}
                    onChange={(e) => onNewEmailFlowChange({ ...newEmailFlow, stepsCount: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Status</label>
                  <select
                    value={newEmailFlow.status}
                    onChange={(e) => onNewEmailFlowChange({ ...newEmailFlow, status: e.target.value as any })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Rascunho">Rascunho</option>
                    <option value="Pausado">Pausado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2030]">
                <button
                  type="button"
                  onClick={onCloseNewEmailModal}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-black font-extrabold hover:bg-[#1eb054] cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                >
                  Salvar Fluxo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Modal: Editar Automação de E-mail */}
      {editingEmailFlow && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-[#202738] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#1b2030] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-400" />
                Editar Fluxo de E-mail
              </h3>
              <button onClick={onCloseEditEmailModal} className="text-gray-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={onSaveEditEmailFlow} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Nome do Fluxo *</label>
                <input
                  type="text"
                  required
                  value={editingEmailFlow.name}
                  onChange={(e) => onEditingEmailFlowChange({ ...editingEmailFlow, name: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Abertura (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={editingEmailFlow.openRate}
                    onChange={(e) => onEditingEmailFlowChange({ ...editingEmailFlow, openRate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Cliques (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={editingEmailFlow.clickRate}
                    onChange={(e) => onEditingEmailFlowChange({ ...editingEmailFlow, clickRate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Conversão (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={editingEmailFlow.conversionRate}
                    onChange={(e) => onEditingEmailFlowChange({ ...editingEmailFlow, conversionRate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2030]">
                <button
                  type="button"
                  onClick={onCloseEditEmailModal}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-black font-extrabold hover:bg-[#1eb054] cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Modal: Novo Script / Copy */}
      {isNewCopyModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-[#202738] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-[#1b2030] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Cadastrar Novo Script / Copywriting
              </h3>
              <button onClick={onCloseNewCopyModal} className="text-gray-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={onSaveNewCopy} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Título do Script *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gancho de Quebra de Padrão para Clínicas"
                  value={newCopy.title}
                  onChange={(e) => onNewCopyChange({ ...newCopy, title: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Categoria</label>
                  <select
                    value={newCopy.category}
                    onChange={(e) => onNewCopyChange({ ...newCopy, category: e.target.value as any })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Gancho / Hook">Gancho / Hook</option>
                    <option value="Headline Matadora">Headline Matadora</option>
                    <option value="Script de VSL">Script de VSL</option>
                    <option value="Email de Vendas">Email de Vendas</option>
                    <option value="Anúncio Meta">Anúncio Meta</option>
                    <option value="Página de Captura">Página de Captura</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-medium mb-1">Público / Nicho</label>
                  <input
                    type="text"
                    placeholder="Ex: E-commerce, B2B"
                    value={newCopy.targetAudience}
                    onChange={(e) => onNewCopyChange({ ...newCopy, targetAudience: e.target.value })}
                    className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Gancho Inicial (Hook) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Primeiros 3 segundos que capturam atenção..."
                  value={newCopy.hookText}
                  onChange={(e) => onNewCopyChange({ ...newCopy, hookText: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Desenvolvimento</label>
                <textarea
                  rows={3}
                  placeholder="Problema, agitação e quebra de objeções..."
                  value={newCopy.bodyText}
                  onChange={(e) => onNewCopyChange({ ...newCopy, bodyText: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Chamada para Ação (CTA)</label>
                <input
                  type="text"
                  placeholder="Ex: Toque no link abaixo e agende seu diagnóstico."
                  value={newCopy.ctaText}
                  onChange={(e) => onNewCopyChange({ ...newCopy, ctaText: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2030]">
                <button
                  type="button"
                  onClick={onCloseNewCopyModal}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-black font-extrabold hover:bg-[#1eb054] cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                >
                  Salvar no Acervo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. Modal: Editar Script / Copy */}
      {editingCopy && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-[#202738] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-[#1b2030] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                Editar Script / Copywriting
              </h3>
              <button onClick={onCloseEditCopyModal} className="text-gray-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={onSaveEditCopy} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={editingCopy.title}
                  onChange={(e) => onEditingCopyChange({ ...editingCopy, title: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Gancho Inicial (Hook)</label>
                <textarea
                  rows={2}
                  required
                  value={editingCopy.hookText}
                  onChange={(e) => onEditingCopyChange({ ...editingCopy, hookText: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Desenvolvimento / Argumentação</label>
                <textarea
                  rows={4}
                  value={editingCopy.bodyText}
                  onChange={(e) => onEditingCopyChange({ ...editingCopy, bodyText: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Chamada para Ação (CTA)</label>
                <input
                  type="text"
                  value={editingCopy.ctaText}
                  onChange={(e) => onEditingCopyChange({ ...editingCopy, ctaText: e.target.value })}
                  className="w-full bg-[#141824] border border-[#22283a] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b2030]">
                <button
                  type="button"
                  onClick={onCloseEditCopyModal}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] text-black font-extrabold hover:bg-[#1eb054] cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. Modal: Confirmar Exclusão */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-red-900/40 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Confirmar Exclusão</h3>
              <p className="text-xs text-gray-400 mt-1">
                Deseja realmente apagar <span className="text-white font-bold">"{itemToDelete.title}"</span>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onCloseDeleteModal}
                className="px-4 py-2 rounded-xl bg-[#141824] hover:bg-[#1c2233] text-gray-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold cursor-pointer transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]"
              >
                Apagar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. Modal: Limpar Tudo */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e111a] border border-red-900/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Limpar Painel de Marketing</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Esta ação apagará todas as campanhas, editoriais, funis, fluxos de e-mail e copies de marketing da sua base, deixando tudo 100% zerado e limpo.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={onCloseClearAllModal}
                className="px-4 py-2.5 rounded-xl bg-[#141824] hover:bg-[#1c2233] text-gray-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirmClearAll}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold cursor-pointer transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]"
              >
                Sim, Limpar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

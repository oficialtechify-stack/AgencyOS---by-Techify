import React, { useState } from 'react';
import {
  X,
  Palette,
  FileText,
  Folder,
  Package,
  ShieldCheck,
  UploadCloud,
  Copy,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Trash2,
  Lock,
  Image as ImageIcon,
} from 'lucide-react';
import {
  DesignProject,
  DesignFolder,
  DesignBriefingDemand,
  DesignPackage,
  DesignStatus,
  DesignChannel,
  DesignCategory,
} from '../../types';
import { FirestoreUserProfile } from '../../lib/firebase';

interface DesignerModalsProps {
  userProfile: FirestoreUserProfile | null;
  channels: DesignChannel[];
  categories: DesignCategory[];
  designFolders: DesignFolder[];

  // Modals visibility
  isNewProjectModalOpen: boolean;
  setIsNewProjectModalOpen: (open: boolean) => void;
  isNewBriefingModalOpen: boolean;
  setIsNewBriefingModalOpen: (open: boolean) => void;
  isNewFolderModalOpen: boolean;
  setIsNewFolderModalOpen: (open: boolean) => void;
  isNewPackageModalOpen: boolean;
  setIsNewPackageModalOpen: (open: boolean) => void;
  selectedProjectForDetail: DesignProject | null;
  setSelectedProjectForDetail: (p: DesignProject | null) => void;
  selectedProjectForApproval: DesignProject | null;
  setSelectedProjectForApproval: (p: DesignProject | null) => void;
  folderToDelete: DesignFolder | null;
  setFolderToDelete: (f: DesignFolder | null) => void;
  isClearAllModalOpen: boolean;
  setIsClearAllModalOpen: (open: boolean) => void;

  // Handlers
  onAddProject?: (project: Omit<DesignProject, 'id'>) => Promise<void>;
  onUpdateProject?: (id: string, data: Partial<DesignProject>) => Promise<void>;
  onAddFolder?: (folder: Omit<DesignFolder, 'id'>) => Promise<void>;
  onDeleteFolder?: (id: string) => Promise<void>;
  onAddBriefing?: (briefing: Omit<DesignBriefingDemand, 'id'>) => Promise<void>;
  onAddPackage?: (pkg: Omit<DesignPackage, 'id'>) => Promise<void>;
  onAddComment?: (comment: any) => Promise<void>;
  onClearAllData?: () => Promise<void>;
  onOpenChatForProject: (projectId: string) => void;
  showToast: (msg: string) => void;
}

export const DesignerModals: React.FC<DesignerModalsProps> = ({
  userProfile,
  channels,
  categories,
  designFolders,
  isNewProjectModalOpen,
  setIsNewProjectModalOpen,
  isNewBriefingModalOpen,
  setIsNewBriefingModalOpen,
  isNewFolderModalOpen,
  setIsNewFolderModalOpen,
  isNewPackageModalOpen,
  setIsNewPackageModalOpen,
  selectedProjectForDetail,
  setSelectedProjectForDetail,
  selectedProjectForApproval,
  setSelectedProjectForApproval,
  folderToDelete,
  setFolderToDelete,
  isClearAllModalOpen,
  setIsClearAllModalOpen,
  onAddProject,
  onUpdateProject,
  onAddFolder,
  onDeleteFolder,
  onAddBriefing,
  onAddPackage,
  onAddComment,
  onClearAllData,
  onOpenChatForProject,
  showToast,
}) => {
  // Form State: New Design Project
  const [newProject, setNewProject] = useState({
    title: '',
    clientName: '',
    folderId: '',
    category: 'Instagram' as DesignCategory,
    channel: 'Instagram Feed' as DesignChannel,
    status: 'producao' as DesignStatus,
    assignedTo: userProfile?.name || 'Vitória Designer',
    assignedEmail: userProfile?.email || 'vitoriajob02@gmail.com',
    createdBy: userProfile?.name || 'Executivo de Contas',
    briefing: '',
    copyText: '',
    hashtags: '',
    imageUrl: '',
    version: 1,
    deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    dimensions: '1080x1350 (4:5)',
    packageName: '',
  });

  // Form State: New Briefing (Executive Only)
  const [newBriefing, setNewBriefing] = useState({
    title: '',
    clientName: '',
    executiveName: userProfile?.name || 'Executivo de Contas',
    executiveEmail: userProfile?.email || '',
    priority: 'Alta' as 'Baixa' | 'Média' | 'Alta' | 'Urgente',
    channel: 'Instagram Feed' as DesignChannel,
    description: '',
    referencesUrl: '',
    deadline: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
  });

  // Form State: New Folder
  const [newFolder, setNewFolder] = useState({
    name: '',
    clientName: '',
    category: 'Empresa / Cliente' as DesignCategory,
    color: '#22c55e',
  });

  // Form State: New Package
  const [newPackage, setNewPackage] = useState({
    packageName: '',
    clientName: '',
    itemsCount: 12,
    deliveredCount: 0,
    driveLink: '',
    figmaLink: '',
    notes: '',
    deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });

  // Approval state
  const [approvalFeedback, setApprovalFeedback] = useState('');
  const [approvalDecision, setApprovalDecision] = useState<'aprovar' | 'ajustes'>('aprovar');

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Aviso: Imagem maior que 2MB. Recomendamos comprimir.');
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setNewProject((prev) => ({ ...prev, imageUrl: result }));
      showToast('Imagem carregada com sucesso!');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim() || !newProject.clientName.trim()) {
      showToast('Preencha o título e o nome da empresa.');
      return;
    }

    const selectedFolder = designFolders.find((f) => f.id === newProject.folderId);

    const projectData: Omit<DesignProject, 'id'> = {
      title: newProject.title.trim(),
      clientName: newProject.clientName.trim(),
      folderId: newProject.folderId || undefined,
      folderName: selectedFolder ? selectedFolder.name : undefined,
      category: newProject.category,
      channel: newProject.channel,
      status: newProject.status,
      assignedTo: newProject.assignedTo.trim(),
      assignedEmail: newProject.assignedEmail.trim(),
      createdBy: newProject.createdBy.trim(),
      createdEmail: userProfile?.email,
      briefing: newProject.briefing.trim(),
      copyText: newProject.copyText.trim(),
      hashtags: newProject.hashtags.trim(),
      imageUrl: newProject.imageUrl.trim(),
      version: Number(newProject.version) || 1,
      deadline: newProject.deadline,
      dimensions: newProject.dimensions,
      packageName: newProject.packageName.trim() || undefined,
      approved: newProject.status === 'aprovado',
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (onAddProject) {
        await onAddProject(projectData);
      }
      showToast(`Design "${projectData.title}" adicionado com sucesso!`);
      setIsNewProjectModalOpen(false);
      setNewProject({
        title: '',
        clientName: '',
        folderId: '',
        category: 'Instagram',
        channel: 'Instagram Feed',
        status: 'producao',
        assignedTo: userProfile?.name || 'Vitória Designer',
        assignedEmail: userProfile?.email || 'vitoriajob02@gmail.com',
        createdBy: userProfile?.name || 'Executivo de Contas',
        briefing: '',
        copyText: '',
        hashtags: '',
        imageUrl: '',
        version: 1,
        deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        dimensions: '1080x1350 (4:5)',
        packageName: '',
      });
    } catch (err) {
      console.error(err);
      showToast('Erro ao criar design.');
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolder.name.trim() || !newFolder.clientName.trim()) {
      showToast('Preencha o nome da pasta e da empresa.');
      return;
    }

    try {
      if (onAddFolder) {
        await onAddFolder({
          name: newFolder.name.trim(),
          clientName: newFolder.clientName.trim(),
          category: newFolder.category,
          color: newFolder.color,
          designsCount: 0,
          createdAt: new Date().toLocaleDateString('pt-BR'),
        });
      }
      showToast(`Pasta "${newFolder.name}" criada com sucesso!`);
      setIsNewFolderModalOpen(false);
      setNewFolder({
        name: '',
        clientName: '',
        category: 'Empresa / Cliente',
        color: '#22c55e',
      });
    } catch (err) {
      console.error(err);
      showToast('Erro ao criar pasta.');
    }
  };

  const handleCreateBriefing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBriefing.title.trim() || !newBriefing.clientName.trim()) {
      showToast('Preencha o título da demanda e da empresa.');
      return;
    }

    try {
      if (onAddBriefing) {
        await onAddBriefing({
          title: newBriefing.title.trim(),
          clientName: newBriefing.clientName.trim(),
          executiveName: newBriefing.executiveName.trim(),
          executiveEmail: newBriefing.executiveEmail.trim(),
          priority: newBriefing.priority,
          channel: newBriefing.channel,
          description: newBriefing.description.trim(),
          referencesUrl: newBriefing.referencesUrl.trim(),
          deadline: newBriefing.deadline,
          status: 'Pendente',
          createdAt: new Date().toISOString(),
        });
      }
      showToast('Briefing cadastrado pelo Executivo!');
      setIsNewBriefingModalOpen(false);
      setNewBriefing({
        title: '',
        clientName: '',
        executiveName: userProfile?.name || 'Executivo de Contas',
        executiveEmail: userProfile?.email || '',
        priority: 'Alta',
        channel: 'Instagram Feed',
        description: '',
        referencesUrl: '',
        deadline: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      });
    } catch (err) {
      console.error(err);
      showToast('Erro ao cadastrar briefing.');
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackage.packageName.trim() || !newPackage.clientName.trim()) {
      showToast('Preencha o nome do pacote e da empresa.');
      return;
    }

    try {
      if (onAddPackage) {
        await onAddPackage({
          packageName: newPackage.packageName.trim(),
          clientName: newPackage.clientName.trim(),
          itemsCount: Number(newPackage.itemsCount) || 1,
          deliveredCount: Number(newPackage.deliveredCount) || 0,
          driveLink: newPackage.driveLink.trim(),
          figmaLink: newPackage.figmaLink.trim(),
          status: 'Em Produção',
          notes: newPackage.notes.trim(),
          deliveryDate: newPackage.deliveryDate,
          createdAt: new Date().toISOString(),
        });
      }
      showToast(`Pacote "${newPackage.packageName}" registrado!`);
      setIsNewPackageModalOpen(false);
      setNewPackage({
        packageName: '',
        clientName: '',
        itemsCount: 12,
        deliveredCount: 0,
        driveLink: '',
        figmaLink: '',
        notes: '',
        deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      });
    } catch (err) {
      console.error(err);
      showToast('Erro ao criar pacote.');
    }
  };

  const handleLeaderApproval = async () => {
    if (!selectedProjectForApproval) return;
    const isApproved = approvalDecision === 'aprovar';
    const leaderName = userProfile?.name || 'Líder de Design';

    try {
      if (onUpdateProject) {
        await onUpdateProject(selectedProjectForApproval.id, {
          status: isApproved ? 'aprovado' : 'ajustes',
          approved: isApproved,
          reviewFeedback: approvalFeedback.trim(),
          reviewedBy: leaderName,
          reviewedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      if (approvalFeedback.trim() && onAddComment) {
        await onAddComment({
          projectId: selectedProjectForApproval.id,
          authorName: leaderName,
          authorEmail: userProfile?.email || 'lider@agencia.com',
          authorRole: 'lider',
          text: `[${isApproved ? 'APROVAÇÃO ✅' : 'SOLICITAÇÃO DE AJUSTE ⚠️'}] ${approvalFeedback.trim()}`,
          timestamp: new Date().toISOString(),
        });
      }

      showToast(
        isApproved
          ? `Design "${selectedProjectForApproval.title}" APROVADO com sucesso!`
          : `Ajustes solicitados para "${selectedProjectForApproval.title}".`
      );
      setSelectedProjectForApproval(null);
      setApprovalFeedback('');
    } catch (err) {
      console.error(err);
      showToast('Erro ao processar aprovação.');
    }
  };

  const handleConfirmDeleteFolder = async () => {
    if (!folderToDelete || !onDeleteFolder) return;
    try {
      await onDeleteFolder(folderToDelete.id);
      showToast(`Pasta "${folderToDelete.name}" foi apagada totalmente.`);
      setFolderToDelete(null);
    } catch (err) {
      console.error(err);
      showToast('Erro ao excluir pasta.');
    }
  };

  const handleConfirmClearAll = async () => {
    if (!onClearAllData) return;
    try {
      await onClearAllData();
      showToast('Painel de Design zerado e limpo com sucesso!');
      setIsClearAllModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Erro ao limpar dados.');
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* MODAL 1: NOVO CRIATIVO / DESIGN */}
      {/* ========================================================================= */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e1018] border border-[#22283a] rounded-3xl p-6 sm:p-7 w-full max-w-2xl shadow-2xl text-gray-200 relative my-8 animate-scale-up">
            <button
              onClick={() => setIsNewProjectModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
                <Palette className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Cadastrar Novo Design / Criativo</h3>
                <p className="text-xs text-gray-400">
                  Adicione a arte na esteira, atribua ao designer e escreva a copy/legenda.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Título da Arte *</label>
                  <input
                    type="text"
                    required
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="ex: Carrossel 5 Dicas de Harmonização"
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Nome da Empresa / Cliente *</label>
                  <input
                    type="text"
                    required
                    value={newProject.clientName}
                    onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                    placeholder="ex: Dra. Camila Odontologia"
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Canal / Formato</label>
                  <select
                    value={newProject.channel}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        channel: e.target.value as DesignChannel,
                        dimensions:
                          e.target.value === 'Instagram Stories'
                            ? '1080x1920 (9:16)'
                            : e.target.value === 'Carrossel' || e.target.value === 'Instagram Feed'
                            ? '1080x1350 (4:5)'
                            : '1080x1080 (1:1)',
                      })
                    }
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    {channels.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Pasta de Destino</label>
                  <select
                    value={newProject.folderId}
                    onChange={(e) => setNewProject({ ...newProject, folderId: e.target.value })}
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="">Sem pasta (Geral)</option>
                    {designFolders.map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Designer Responsável *</label>
                  <input
                    type="text"
                    required
                    value={newProject.assignedTo}
                    onChange={(e) => setNewProject({ ...newProject, assignedTo: e.target.value })}
                    placeholder="ex: Vitória Designer"
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              {/* Image Upload or URL */}
              <div className="p-3.5 rounded-2xl bg-[#121522] border border-[#1e2438] space-y-2">
                <label className="block text-gray-300 font-bold">Imagem / Arte do Criativo</label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={newProject.imageUrl}
                    onChange={(e) => setNewProject({ ...newProject, imageUrl: e.target.value })}
                    placeholder="Cole a URL da imagem ou anexe o arquivo ao lado..."
                    className="flex-1 bg-[#181c2c] border border-[#2b334d] rounded-xl px-3.5 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                  />

                  <label className="px-3.5 py-2 rounded-xl bg-[#1f2538] hover:bg-[#28314a] border border-[#313c58] text-gray-200 font-bold cursor-pointer flex items-center gap-1.5 shrink-0">
                    <UploadCloud className="w-4 h-4 text-[#22c55e]" />
                    <span>Upload de Imagem</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {newProject.imageUrl && (
                  <div className="pt-2 flex items-center gap-3">
                    <img
                      src={newProject.imageUrl}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-[#28324a]"
                    />
                    <span className="text-[11px] text-[#22c55e] font-bold">✓ Imagem carregada</span>
                  </div>
                )}
              </div>

              {/* Copy & Hashtags */}
              <div className="space-y-1.5">
                <label className="block text-gray-300 font-bold">Legenda / Copy / Texto do Post</label>
                <textarea
                  rows={3}
                  value={newProject.copyText}
                  onChange={(e) => setNewProject({ ...newProject, copyText: e.target.value })}
                  placeholder="Escreva a legenda completa que será publicada junto com o post..."
                  className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Hashtags</label>
                  <input
                    type="text"
                    value={newProject.hashtags}
                    onChange={(e) => setNewProject({ ...newProject, hashtags: e.target.value })}
                    placeholder="#marketing #design #branding"
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Status Inicial</label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value as DesignStatus })}
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="producao">Em Produção</option>
                    <option value="revisao">Em Revisão (Líder)</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="ajustes">Precisa de Ajustes</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2438]">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#181b28] hover:bg-[#202538] text-gray-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#1eb054] text-black font-black cursor-pointer shadow-lg shadow-[#22c55e]/25"
                >
                  Salvar Criativo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: NOVO BRIEFING (EXCLUSIVO DO EXECUTIVO) */}
      {/* ========================================================================= */}
      {isNewBriefingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e1018] border border-[#22283a] rounded-3xl p-6 sm:p-7 w-full max-w-xl shadow-2xl text-gray-200 relative my-8 animate-scale-up">
            <button
              onClick={() => setIsNewBriefingModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <FileText className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">Cadastrar Demanda / Briefing</h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-950 text-blue-300 border border-blue-800/40">
                    Área do Executivo
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Descreva o que o cliente solicitou para que os designers possam assumir e produzir a arte.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateBriefing} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Título da Demanda *</label>
                <input
                  type="text"
                  required
                  value={newBriefing.title}
                  onChange={(e) => setNewBriefing({ ...newBriefing, title: e.target.value })}
                  placeholder="ex: Anúncio de Implantes Dentários com Oferta"
                  className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Empresa / Cliente *</label>
                  <input
                    type="text"
                    required
                    value={newBriefing.clientName}
                    onChange={(e) => setNewBriefing({ ...newBriefing, clientName: e.target.value })}
                    placeholder="ex: Dra. Camila Odontologia"
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Executivo Solicitante *</label>
                  <input
                    type="text"
                    required
                    value={newBriefing.executiveName}
                    onChange={(e) => setNewBriefing({ ...newBriefing, executiveName: e.target.value })}
                    placeholder="ex: Marcos Executivo"
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Prioridade</label>
                  <select
                    value={newBriefing.priority}
                    onChange={(e) => setNewBriefing({ ...newBriefing, priority: e.target.value as any })}
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente 🔥</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Formato</label>
                  <select
                    value={newBriefing.channel}
                    onChange={(e) => setNewBriefing({ ...newBriefing, channel: e.target.value as DesignChannel })}
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                  >
                    {channels.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Prazo de Entrega</label>
                  <input
                    type="date"
                    value={newBriefing.deadline}
                    onChange={(e) => setNewBriefing({ ...newBriefing, deadline: e.target.value })}
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Descrição do Briefing *</label>
                <textarea
                  rows={4}
                  required
                  value={newBriefing.description}
                  onChange={(e) => setNewBriefing({ ...newBriefing, description: e.target.value })}
                  placeholder="Explique o objetivo do cliente, textos essenciais, cores recomendadas, etc..."
                  className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Link de Referência Visual (Opcional)</label>
                <input
                  type="url"
                  value={newBriefing.referencesUrl}
                  onChange={(e) => setNewBriefing({ ...newBriefing, referencesUrl: e.target.value })}
                  placeholder="https://pinterest.com/... ou https://instagram.com/..."
                  className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3.5 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2438]">
                <button
                  type="button"
                  onClick={() => setIsNewBriefingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#181b28] hover:bg-[#202538] text-gray-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black cursor-pointer shadow-lg shadow-blue-600/25"
                >
                  Enviar Demanda para Design
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: NOVA PASTA */}
      {/* ========================================================================= */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1018] border border-[#22283a] rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl text-gray-200 relative animate-scale-up space-y-4">
            <button
              onClick={() => setIsNewFolderModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Folder className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Criar Nova Pasta</h3>
                <p className="text-xs text-gray-400">Organize os criativos por empresa ou canal.</p>
              </div>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Nome da Pasta *</label>
                <input
                  type="text"
                  required
                  value={newFolder.name}
                  onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                  placeholder="ex: Dra. Camila - Conteúdo Instagram"
                  className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Empresa / Cliente *</label>
                <input
                  type="text"
                  required
                  value={newFolder.clientName}
                  onChange={(e) => setNewFolder({ ...newFolder, clientName: e.target.value })}
                  placeholder="ex: Dra. Camila Odontologia"
                  className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Categoria</label>
                  <select
                    value={newFolder.category}
                    onChange={(e) => setNewFolder({ ...newFolder, category: e.target.value as DesignCategory })}
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Cor da Pasta</label>
                  <input
                    type="color"
                    value={newFolder.color}
                    onChange={(e) => setNewFolder({ ...newFolder, color: e.target.value })}
                    className="w-full h-9 bg-[#151827] border border-[#252c42] rounded-xl px-2 py-1 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#181b28] text-gray-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-black cursor-pointer shadow-lg shadow-amber-600/20"
                >
                  Criar Pasta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: NOVO PACOTE DE ENTREGA */}
      {/* ========================================================================= */}
      {isNewPackageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1018] border border-[#22283a] rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl text-gray-200 relative animate-scale-up space-y-4">
            <button
              onClick={() => setIsNewPackageModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Package className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Criar Pacote de Entrega</h3>
                <p className="text-xs text-gray-400">Agrupe criativos para entregar em lote ao cliente.</p>
              </div>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Nome do Pacote *</label>
                <input
                  type="text"
                  required
                  value={newPackage.packageName}
                  onChange={(e) => setNewPackage({ ...newPackage, packageName: e.target.value })}
                  placeholder="ex: Pack Mensal 12 Posts - Dra. Camila"
                  className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Empresa / Cliente *</label>
                <input
                  type="text"
                  required
                  value={newPackage.clientName}
                  onChange={(e) => setNewPackage({ ...newPackage, clientName: e.target.value })}
                  placeholder="ex: Dra. Camila Odontologia"
                  className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Total de Artes</label>
                  <input
                    type="number"
                    min={1}
                    value={newPackage.itemsCount}
                    onChange={(e) => setNewPackage({ ...newPackage, itemsCount: Number(e.target.value) })}
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Data Limite</label>
                  <input
                    type="date"
                    value={newPackage.deliveryDate}
                    onChange={(e) => setNewPackage({ ...newPackage, deliveryDate: e.target.value })}
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Link da Pasta Google Drive</label>
                <input
                  type="url"
                  value={newPackage.driveLink}
                  onChange={(e) => setNewPackage({ ...newPackage, driveLink: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Link do Figma (Opcional)</label>
                <input
                  type="url"
                  value={newPackage.figmaLink}
                  onChange={(e) => setNewPackage({ ...newPackage, figmaLink: e.target.value })}
                  placeholder="https://figma.com/file/..."
                  className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPackageModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#181b28] text-gray-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black cursor-pointer shadow-lg shadow-purple-600/20"
                >
                  Registrar Pacote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DETALHES DO DESIGN & LEGENDA */}
      {/* ========================================================================= */}
      {selectedProjectForDetail && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e1018] border border-[#22283a] rounded-3xl w-full max-w-4xl shadow-2xl text-gray-200 relative my-8 animate-scale-up overflow-hidden">
            <button
              onClick={() => setSelectedProjectForDetail(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/80 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-[#06080d] p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#1b2030] relative min-h-[350px]">
                {selectedProjectForDetail.imageUrl ? (
                  <img
                    src={selectedProjectForDetail.imageUrl}
                    alt={selectedProjectForDetail.title}
                    className="max-h-[480px] w-auto rounded-xl object-contain shadow-2xl border border-[#22293d]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-gray-500 flex flex-col items-center">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                    <span>Nenhuma imagem anexada</span>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2 flex-wrap justify-center">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#141824] border border-[#252c40] text-gray-300">
                    {selectedProjectForDetail.channel}
                  </span>
                  {selectedProjectForDetail.dimensions && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#141824] border border-[#252c40] text-gray-300">
                      {selectedProjectForDetail.dimensions}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#16291a] text-[#22c55e] border border-[#22c55e]/40">
                    Versão {selectedProjectForDetail.version}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4 flex flex-col justify-between overflow-y-auto max-h-[560px]">
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-400">
                      🏢 {selectedProjectForDetail.clientName}
                    </span>
                    <h3 className="text-lg font-black text-white">{selectedProjectForDetail.title}</h3>
                  </div>

                  <div className="bg-[#121522] p-3 rounded-2xl border border-[#1e2538] text-xs grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-400 text-[10px] block font-bold">DESIGNER:</span>
                      <strong className="text-white">{selectedProjectForDetail.assignedTo}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block font-bold">SOLICITANTE:</span>
                      <strong className="text-white">{selectedProjectForDetail.createdBy}</strong>
                    </div>
                  </div>

                  {selectedProjectForDetail.reviewFeedback && (
                    <div className="bg-[#1b1e2e] p-3 rounded-2xl border border-[#29324a] text-xs space-y-1">
                      <div className="text-[10px] font-bold text-[#22c55e] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Feedback da Líder:
                      </div>
                      <p className="text-gray-200 italic">{selectedProjectForDetail.reviewFeedback}</p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-300 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-[#22c55e]" /> Legenda / Copy:
                      </span>
                      {selectedProjectForDetail.copyText && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${selectedProjectForDetail.copyText}\n\n${selectedProjectForDetail.hashtags || ''}`
                            );
                            showToast('Legenda copiada com sucesso!');
                          }}
                          className="text-[#22c55e] hover:underline text-xs flex items-center gap-1 cursor-pointer font-bold"
                        >
                          <Copy className="w-3 h-3" /> Copiar Texto
                        </button>
                      )}
                    </div>

                    <div className="bg-[#121522] border border-[#1e2538] rounded-2xl p-3.5 text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {selectedProjectForDetail.copyText || 'Nenhuma legenda registrada.'}
                    </div>

                    {selectedProjectForDetail.hashtags && (
                      <div className="text-[11px] text-blue-400 font-mono">
                        {selectedProjectForDetail.hashtags}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1b2030] flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      const proj = selectedProjectForDetail;
                      setSelectedProjectForDetail(null);
                      onOpenChatForProject(proj.id);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#141824] hover:bg-[#1e2436] border border-[#28324a] text-xs font-bold text-gray-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Abrir Chat
                  </button>

                  <button
                    onClick={() => {
                      const proj = selectedProjectForDetail;
                      setSelectedProjectForDetail(null);
                      setSelectedProjectForApproval(proj);
                    }}
                    className="px-5 py-2 rounded-xl bg-[#22c55e] hover:bg-[#1eb054] text-black font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#22c55e]/20"
                  >
                    <ShieldCheck className="w-4 h-4 stroke-[2.5]" /> Avaliar / Aprovar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: AVALIAÇÃO & APROVAÇÃO DA LÍDER */}
      {/* ========================================================================= */}
      {selectedProjectForApproval && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1018] border border-[#22283a] rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl text-gray-200 relative animate-scale-up space-y-4">
            <button
              onClick={() => setSelectedProjectForApproval(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Avaliação da Líder de Criação</h3>
                <p className="text-xs text-gray-400">
                  Aprovar arte para publicação ou solicitar ajustes pontuais.
                </p>
              </div>
            </div>

            <div className="bg-[#141824] p-3 rounded-xl border border-[#232b3f] text-xs">
              <span className="text-amber-400 font-bold block">🏢 {selectedProjectForApproval.clientName}</span>
              <strong className="text-white text-sm">{selectedProjectForApproval.title}</strong>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setApprovalDecision('aprovar')}
                className={`p-3 rounded-2xl border text-center font-bold text-xs cursor-pointer transition-all ${
                  approvalDecision === 'aprovar'
                    ? 'bg-[#16301e] border-[#22c55e] text-[#22c55e] shadow-lg shadow-[#22c55e]/20'
                    : 'bg-[#141824] border-[#252c40] text-gray-400 hover:text-white'
                }`}
              >
                <div className="text-base mb-1">✅</div>
                Aprovar Design
              </button>

              <button
                type="button"
                onClick={() => setApprovalDecision('ajustes')}
                className={`p-3 rounded-2xl border text-center font-bold text-xs cursor-pointer transition-all ${
                  approvalDecision === 'ajustes'
                    ? 'bg-[#381a1a] border-[#f87171] text-[#f87171] shadow-lg shadow-red-500/20'
                    : 'bg-[#141824] border-[#252c40] text-gray-400 hover:text-white'
                }`}
              >
                <div className="text-base mb-1">⚠️</div>
                Pedir Ajustes
              </button>
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-gray-300 font-bold">Feedback / Comentários da Avaliação:</label>
              <textarea
                rows={3}
                value={approvalFeedback}
                onChange={(e) => setApprovalFeedback(e.target.value)}
                placeholder="ex: Cores e contraste aprovados para veiculação no Meta Ads!"
                className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedProjectForApproval(null)}
                className="px-4 py-2 rounded-xl bg-[#181b28] text-gray-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleLeaderApproval}
                className="px-5 py-2 rounded-xl bg-[#22c55e] hover:bg-[#1eb054] text-black font-black text-xs cursor-pointer shadow-lg shadow-[#22c55e]/25"
              >
                Confirmar Decisão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: CONFIRMAR APAGAR PASTA TOTALMENTE */}
      {/* ========================================================================= */}
      {folderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1018] border border-red-900/50 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl text-gray-200 relative animate-scale-up space-y-4">
            <button
              onClick={() => setFolderToDelete(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Trash2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Apagar Pasta Totalmente</h3>
                <p className="text-xs text-gray-400">Exclusão permanente da pasta selecionada.</p>
              </div>
            </div>

            <div className="bg-[#191118] border border-red-900/40 p-3.5 rounded-2xl text-xs space-y-1">
              <p className="text-gray-300">
                Deseja apagar a pasta <strong className="text-white">"{folderToDelete.name}"</strong> da empresa{' '}
                <strong className="text-amber-400">{folderToDelete.clientName}</strong>?
              </p>
              <p className="text-[11px] text-gray-400">
                Esta ação removerá a pasta do seu painel e desvinculará as artes associadas a ela.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFolderToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#181b28] text-gray-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteFolder}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-red-600/30 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Apagar Pasta Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: CONFIRMAR LIMPAR TODO O PAINEL DE DESIGN */}
      {/* ========================================================================= */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1018] border border-red-900/50 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl text-gray-200 relative animate-scale-up space-y-4">
            <button
              onClick={() => setIsClearAllModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Trash2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Limpar e Zerar o Painel</h3>
                <p className="text-xs text-gray-400">Remover dados e deixar a área limpa.</p>
              </div>
            </div>

            <div className="bg-[#191118] border border-red-900/40 p-3.5 rounded-2xl text-xs space-y-1">
              <p className="text-gray-300 font-bold">
                Tem certeza que deseja apagar todas as demonstrações do Hub do Designer?
              </p>
              <p className="text-[11px] text-gray-400">
                Todas as artes, pastas, briefings de executivo, pacotes e comentários de demonstração serão excluídos, deixando o painel 100% limpo e pronto para uso real.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#181b28] text-gray-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-red-600/30 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Sim, Deixar Painel Limpo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

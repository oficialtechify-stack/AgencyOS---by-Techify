import React, { useState, useMemo } from 'react';
import {
  DesignProject,
  DesignFolder,
  DesignBriefingDemand,
  DesignPackage,
  DesignComment,
  DesignChannel,
  DesignCategory,
  ViewType,
} from '../types';
import { FirestoreUserProfile } from '../lib/firebase';
import { DesignerHeader } from '../components/designer/DesignerHeader';
import { CreativesTab } from '../components/designer/CreativesTab';
import { BriefingsTab } from '../components/designer/BriefingsTab';
import { FoldersTab } from '../components/designer/FoldersTab';
import { PackagesTab } from '../components/designer/PackagesTab';
import { ChatTab } from '../components/designer/ChatTab';
import { DesignerModals } from '../components/designer/DesignerModals';

interface DesignerHubViewProps {
  userProfile: FirestoreUserProfile | null;
  designProjects?: DesignProject[];
  designFolders?: DesignFolder[];
  designBriefings?: DesignBriefingDemand[];
  designPackages?: DesignPackage[];
  designComments?: DesignComment[];
  onAddProject?: (project: Omit<DesignProject, 'id'>) => Promise<void>;
  onUpdateProject?: (id: string, data: Partial<DesignProject>) => Promise<void>;
  onDeleteProject?: (id: string) => Promise<void>;
  onAddFolder?: (folder: Omit<DesignFolder, 'id'>) => Promise<void>;
  onDeleteFolder?: (id: string) => Promise<void>;
  onAddBriefing?: (briefing: Omit<DesignBriefingDemand, 'id'>) => Promise<void>;
  onUpdateBriefing?: (id: string, data: Partial<DesignBriefingDemand>) => Promise<void>;
  onDeleteBriefing?: (id: string) => Promise<void>;
  onAddPackage?: (pkg: Omit<DesignPackage, 'id'>) => Promise<void>;
  onUpdatePackage?: (id: string, data: Partial<DesignPackage>) => Promise<void>;
  onDeletePackage?: (id: string) => Promise<void>;
  onAddComment?: (comment: Omit<DesignComment, 'id'>) => Promise<void>;
  onDeleteComment?: (id: string) => Promise<void>;
  onClearAllData?: () => Promise<void>;
  onNavigate?: (view: ViewType) => void;
}

const CHANNELS: DesignChannel[] = [
  'Instagram Feed',
  'Instagram Stories',
  'Carrossel',
  'Meta Ads',
  'Google Display',
  'Banner Web',
  'Identidade Visual',
  'Impresso',
  'Outro',
];

const CATEGORIES: DesignCategory[] = [
  'Instagram',
  'Anúncios / Tráfego',
  'Empresa / Cliente',
  'Branding',
  'Pessoal / Agência',
  'Eventos',
  'Outros',
];

export const DesignerHubView: React.FC<DesignerHubViewProps> = ({
  userProfile,
  designProjects = [],
  designFolders = [],
  designBriefings = [],
  designPackages = [],
  designComments = [],
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onAddFolder,
  onDeleteFolder,
  onAddBriefing,
  onUpdateBriefing,
  onDeleteBriefing,
  onAddPackage,
  onUpdatePackage,
  onDeletePackage,
  onAddComment,
  onDeleteComment,
  onClearAllData,
  onNavigate,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'criativos' | 'briefings' | 'pastas' | 'pacotes' | 'mensagens'
  >('criativos');

  // Filter state for folders in CreativesTab
  const [folderFilter, setFolderFilter] = useState<string>('todas');

  // Modals & Drawers state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<DesignProject | null>(null);
  const [projectToPost, setProjectToPost] = useState<DesignProject | null>(null);
  const [isNewBriefingModalOpen, setIsNewBriefingModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [isNewPackageModalOpen, setIsNewPackageModalOpen] = useState(false);
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<DesignProject | null>(null);
  const [selectedProjectForApproval, setSelectedProjectForApproval] = useState<DesignProject | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<DesignFolder | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Active Project for Chat
  const [activeChatProjectId, setActiveChatProjectId] = useState<string | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stats Counters
  const stats = useMemo(() => {
    const total = designProjects.length;
    const producao = designProjects.filter((p) => p.status === 'producao').length;
    const revisao = designProjects.filter((p) => p.status === 'revisao').length;
    const aprovados = designProjects.filter((p) => p.status === 'aprovado').length;
    const ajustes = designProjects.filter((p) => p.status === 'ajustes').length;
    const briefingsPendentes = designBriefings.filter((b) => b.status === 'Pendente').length;

    return { total, producao, revisao, aprovados, ajustes, briefingsPendentes };
  }, [designProjects, designBriefings]);

  const handleClaimBriefing = async (briefing: DesignBriefingDemand) => {
    const designerName = userProfile?.name || 'Designer Responsável';
    try {
      if (onUpdateBriefing) {
        await onUpdateBriefing(briefing.id, {
          status: 'Assumido',
          claimedBy: designerName,
          claimedAt: new Date().toISOString(),
        });
      }

      if (onAddProject) {
        await onAddProject({
          title: `Arte: ${briefing.title}`,
          clientName: briefing.clientName,
          category: 'Instagram',
          channel: briefing.channel,
          status: 'producao',
          assignedTo: designerName,
          assignedEmail: userProfile?.email || '',
          createdBy: briefing.executiveName,
          createdEmail: briefing.executiveEmail,
          briefing: briefing.description,
          copyText: '',
          imageUrl: '',
          images: [],
          version: 1,
          deadline: briefing.deadline,
          dimensions:
            briefing.channel === 'Instagram Stories'
              ? '1080x1920 (9:16)'
              : briefing.channel === 'Carrossel' || briefing.channel === 'Instagram Feed'
              ? '1080x1350 (4:5)'
              : '1080x1080 (1:1)',
          approved: false,
          postStatus: 'nao_postado',
          commentsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      showToast(`Demanda "${briefing.title}" assumida com sucesso! Arte inserida na esteira.`);
      setActiveTab('criativos');
    } catch (err) {
      console.error(err);
      showToast('Erro ao assumir demanda.');
    }
  };

  const handleSelectFolder = (folderId: string) => {
    setFolderFilter(folderId);
    setActiveTab('criativos');
  };

  const handleOpenChatForProject = (projectId: string) => {
    setActiveChatProjectId(projectId);
    setActiveTab('mensagens');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-white text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header & KPI Summary */}
      <DesignerHeader
        userProfile={userProfile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        designProjectsCount={designProjects.length}
        designBriefingsCount={designBriefings.length}
        designFoldersCount={designFolders.length}
        designPackagesCount={designPackages.length}
        designCommentsCount={designComments.length}
        onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
        onOpenClearAllModal={() => setIsClearAllModalOpen(true)}
      />

      {/* Tab Content */}
      {activeTab === 'criativos' && (
        <CreativesTab
          userProfile={userProfile}
          designProjects={designProjects}
          designFolders={designFolders}
          channels={CHANNELS}
          folderFilter={folderFilter}
          setFolderFilter={setFolderFilter}
          onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
          onSelectProjectForDetail={(p) => setSelectedProjectForDetail(p)}
          onSelectProjectForApproval={(p) => setSelectedProjectForApproval(p)}
          onEditProject={(p) => setProjectToEdit(p)}
          onPostProject={(p) => setProjectToPost(p)}
          onOpenChatForProject={handleOpenChatForProject}
          onDeleteProject={onDeleteProject}
          showToast={showToast}
        />
      )}

      {activeTab === 'briefings' && (
        <BriefingsTab
          userProfile={userProfile}
          designBriefings={designBriefings}
          onOpenNewBriefingModal={() => setIsNewBriefingModalOpen(true)}
          onClaimBriefing={handleClaimBriefing}
          onDeleteBriefing={onDeleteBriefing}
          showToast={showToast}
        />
      )}

      {activeTab === 'pastas' && (
        <FoldersTab
          designFolders={designFolders}
          designProjects={designProjects}
          onOpenNewFolderModal={() => setIsNewFolderModalOpen(true)}
          onSelectFolder={handleSelectFolder}
          onRequestDeleteFolder={(folder) => setFolderToDelete(folder)}
        />
      )}

      {activeTab === 'pacotes' && (
        <PackagesTab
          designPackages={designPackages}
          onOpenNewPackageModal={() => setIsNewPackageModalOpen(true)}
          onUpdatePackage={onUpdatePackage}
          onDeletePackage={onDeletePackage}
          showToast={showToast}
        />
      )}

      {activeTab === 'mensagens' && (
        <ChatTab
          userProfile={userProfile}
          designProjects={designProjects}
          designComments={designComments}
          activeChatProjectId={activeChatProjectId}
          setActiveChatProjectId={setActiveChatProjectId}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
          showToast={showToast}
        />
      )}

      {/* All Modals */}
      <DesignerModals
        userProfile={userProfile}
        channels={CHANNELS}
        categories={CATEGORIES}
        designFolders={designFolders}
        isNewProjectModalOpen={isNewProjectModalOpen}
        setIsNewProjectModalOpen={setIsNewProjectModalOpen}
        projectToEdit={projectToEdit}
        setProjectToEdit={setProjectToEdit}
        projectToPost={projectToPost}
        setProjectToPost={setProjectToPost}
        isNewBriefingModalOpen={isNewBriefingModalOpen}
        setIsNewBriefingModalOpen={setIsNewBriefingModalOpen}
        isNewFolderModalOpen={isNewFolderModalOpen}
        setIsNewFolderModalOpen={setIsNewFolderModalOpen}
        isNewPackageModalOpen={isNewPackageModalOpen}
        setIsNewPackageModalOpen={setIsNewPackageModalOpen}
        selectedProjectForDetail={selectedProjectForDetail}
        setSelectedProjectForDetail={setSelectedProjectForDetail}
        selectedProjectForApproval={selectedProjectForApproval}
        setSelectedProjectForApproval={setSelectedProjectForApproval}
        folderToDelete={folderToDelete}
        setFolderToDelete={setFolderToDelete}
        isClearAllModalOpen={isClearAllModalOpen}
        setIsClearAllModalOpen={setIsClearAllModalOpen}
        onAddProject={onAddProject}
        onUpdateProject={onUpdateProject}
        onAddFolder={onAddFolder}
        onDeleteFolder={onDeleteFolder}
        onAddBriefing={onAddBriefing}
        onAddPackage={onAddPackage}
        onAddComment={onAddComment}
        onClearAllData={onClearAllData}
        onOpenChatForProject={handleOpenChatForProject}
        showToast={showToast}
      />
    </div>
  );
};

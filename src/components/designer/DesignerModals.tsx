import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Send,
  Calendar,
  Share2,
  Download,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Plus,
  Layers,
  Maximize2,
  Check,
  Instagram,
  Link as LinkIcon,
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
import {
  canUserEditDesigns,
  canUserApproveDesigns,
  canUserPublishPosts,
  canUserDeleteDesigns,
} from '../../lib/permissions';

interface DesignerModalsProps {
  userProfile: FirestoreUserProfile | null;
  channels: DesignChannel[];
  categories: DesignCategory[];
  designFolders: DesignFolder[];

  // Modals visibility
  isNewProjectModalOpen: boolean;
  setIsNewProjectModalOpen: (open: boolean) => void;
  projectToEdit: DesignProject | null;
  setProjectToEdit: (p: DesignProject | null) => void;
  projectToPost: DesignProject | null;
  setProjectToPost: (p: DesignProject | null) => void;
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
  projectToEdit,
  setProjectToEdit,
  projectToPost,
  setProjectToPost,
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
  // ==========================================
  // Form State: New Design Project (Multi-Image)
  // ==========================================
  const [newProject, setNewProject] = useState({
    title: '',
    clientName: '',
    folderId: '',
    category: 'Instagram' as DesignCategory,
    channel: 'Instagram Feed' as DesignChannel,
    status: 'producao' as DesignStatus,
    assignedTo: userProfile?.name || 'Designer Responsável',
    assignedEmail: userProfile?.email || '',
    createdBy: userProfile?.name || 'Executivo / Líder',
    briefing: '',
    copyText: '',
    hashtags: '',
    imageUrl: '',
    images: [] as string[],
    urlInput: '',
    version: 1,
    deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    dimensions: '1080x1350 (4:5)',
    packageName: '',
  });

  // ==========================================
  // Form State: Edit Design Project
  // ==========================================
  const [editForm, setEditForm] = useState({
    title: '',
    clientName: '',
    folderId: '',
    category: 'Instagram' as DesignCategory,
    channel: 'Instagram Feed' as DesignChannel,
    status: 'producao' as DesignStatus,
    assignedTo: '',
    assignedEmail: '',
    briefing: '',
    copyText: '',
    hashtags: '',
    imageUrl: '',
    images: [] as string[],
    urlInput: '',
    version: 1,
    deadline: '',
    dimensions: '1080x1350 (4:5)',
    packageName: '',
  });

  // When projectToEdit changes, prefill the edit form
  useEffect(() => {
    if (projectToEdit) {
      const initialImages = projectToEdit.images && projectToEdit.images.length > 0
        ? [...projectToEdit.images]
        : projectToEdit.imageUrl
        ? [projectToEdit.imageUrl]
        : [];

      setEditForm({
        title: projectToEdit.title || '',
        clientName: projectToEdit.clientName || '',
        folderId: projectToEdit.folderId || '',
        category: projectToEdit.category || 'Instagram',
        channel: projectToEdit.channel || 'Instagram Feed',
        status: projectToEdit.status || 'producao',
        assignedTo: projectToEdit.assignedTo || '',
        assignedEmail: projectToEdit.assignedEmail || '',
        briefing: projectToEdit.briefing || '',
        copyText: projectToEdit.copyText || '',
        hashtags: projectToEdit.hashtags || '',
        imageUrl: projectToEdit.imageUrl || (initialImages[0] || ''),
        images: initialImages,
        urlInput: '',
        version: projectToEdit.version || 1,
        deadline: projectToEdit.deadline || new Date().toISOString().split('T')[0],
        dimensions: projectToEdit.dimensions || '1080x1350 (4:5)',
        packageName: projectToEdit.packageName || '',
      });
    }
  }, [projectToEdit]);

  // ==========================================
  // Form State: Post / Publish Flow
  // ==========================================
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Instagram']);
  const [postMode, setPostMode] = useState<'agora' | 'agendar'>('agora');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState('18:00');
  const [isPosting, setIsPosting] = useState(false);

  // Detail Modal Carousel Index
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Reset active slide when detail modal changes
  useEffect(() => {
    setActiveSlideIndex(0);
  }, [selectedProjectForDetail]);

  // Form State: New Briefing (Executive / Leaders / Team)
  const [newBriefing, setNewBriefing] = useState({
    title: '',
    clientName: '',
    executiveName: userProfile?.name || 'Executivo de Contas',
    executiveEmail: userProfile?.email || '',
    priority: 'Alta' as 'Baixa' | 'Média' | 'Alta' | 'Urgente',
    channel: 'Instagram Feed' as DesignChannel,
    description: '',
    referencesUrl: '',
    referenceLinks: [] as string[],
    referenceImages: [] as string[],
    instagramProfiles: [] as string[],
    instagramPosts: [] as string[],
    newLinkInput: '',
    newImageUrlInput: '',
    newInstagramProfileInput: '',
    newInstagramPostInput: '',
    deadline: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
  });

  // Form State: New Folder
  const [newFolder, setNewFolder] = useState({
    name: '',
    clientName: '',
    category: 'Empresa / Cliente' as DesignCategory,
    color: '#ffffff',
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

  // ==========================================
  // Multi-Image Upload Handlers (New Project)
  // ==========================================
  const handleMultipleImageUploadNew = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    let loadedCount = 0;
    const newImages: string[] = [];

    fileList.forEach((file: File) => {
      if (file.size > 3 * 1024 * 1024) {
        showToast(`Imagem "${file.name}" é maior que 3MB. Recomendamos comprimir.`);
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        newImages.push(result);
        loadedCount++;

        if (loadedCount === fileList.length) {
          setNewProject((prev) => {
            const combined = [...prev.images, ...newImages];
            return {
              ...prev,
              images: combined,
              imageUrl: combined[0] || '',
            };
          });
          showToast(`${fileList.length} imagem(ns) adicionada(s)!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrlImageNew = () => {
    if (!newProject.urlInput.trim()) return;
    setNewProject((prev) => {
      const combined = [...prev.images, prev.urlInput.trim()];
      return {
        ...prev,
        images: combined,
        imageUrl: combined[0] || '',
        urlInput: '',
      };
    });
    showToast('Imagem adicionada via URL!');
  };

  const handleRemoveImageNew = (index: number) => {
    setNewProject((prev) => {
      const updated = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: updated,
        imageUrl: updated[0] || '',
      };
    });
  };

  const handleSetCoverImageNew = (index: number) => {
    setNewProject((prev) => {
      const item = prev.images[index];
      const rest = prev.images.filter((_, i) => i !== index);
      const reordered = [item, ...rest];
      return {
        ...prev,
        images: reordered,
        imageUrl: item,
      };
    });
    showToast('Definida como imagem principal (Capa)!');
  };

  // ==========================================
  // Multi-Image Upload Handlers (Edit Project)
  // ==========================================
  const handleMultipleImageUploadEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    let loadedCount = 0;
    const newImages: string[] = [];

    fileList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        newImages.push(result);
        loadedCount++;

        if (loadedCount === fileList.length) {
          setEditForm((prev) => {
            const combined = [...prev.images, ...newImages];
            return {
              ...prev,
              images: combined,
              imageUrl: combined[0] || '',
            };
          });
          showToast(`${fileList.length} imagem(ns) anexada(s)!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrlImageEdit = () => {
    if (!editForm.urlInput.trim()) return;
    setEditForm((prev) => {
      const combined = [...prev.images, prev.urlInput.trim()];
      return {
        ...prev,
        images: combined,
        imageUrl: combined[0] || '',
        urlInput: '',
      };
    });
    showToast('Imagem adicionada via URL!');
  };

  const handleRemoveImageEdit = (index: number) => {
    setEditForm((prev) => {
      const updated = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: updated,
        imageUrl: updated[0] || '',
      };
    });
  };

  const handleSetCoverImageEdit = (index: number) => {
    setEditForm((prev) => {
      const item = prev.images[index];
      const rest = prev.images.filter((_, i) => i !== index);
      const reordered = [item, ...rest];
      return {
        ...prev,
        images: reordered,
        imageUrl: item,
      };
    });
    showToast('Definida como imagem principal (Capa)!');
  };

  // ==========================================
  // Submit: Create Project
  // ==========================================
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim() || !newProject.clientName.trim()) {
      showToast('Preencha o título e o nome da empresa.');
      return;
    }

    const selectedFolder = designFolders.find((f) => f.id === newProject.folderId);
    const finalImages = newProject.images.length > 0
      ? newProject.images
      : newProject.imageUrl.trim()
      ? [newProject.imageUrl.trim()]
      : [];

    const projectData: Omit<DesignProject, 'id'> = {
      title: newProject.title.trim(),
      clientName: newProject.clientName.trim(),
      folderId: newProject.folderId || undefined,
      folderName: selectedFolder ? selectedFolder.name : undefined,
      category: newProject.category,
      channel: newProject.channel,
      status: newProject.status,
      assignedTo: newProject.assignedTo.trim(),
      assignedEmail: newProject.assignedEmail.trim() || userProfile?.email,
      createdBy: newProject.createdBy.trim(),
      createdEmail: userProfile?.email,
      briefing: newProject.briefing.trim(),
      copyText: newProject.copyText.trim(),
      hashtags: newProject.hashtags.trim(),
      imageUrl: finalImages[0] || '',
      images: finalImages,
      version: Number(newProject.version) || 1,
      deadline: newProject.deadline,
      dimensions: newProject.dimensions,
      packageName: newProject.packageName.trim() || undefined,
      approved: newProject.status === 'aprovado',
      postStatus: 'nao_postado',
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (onAddProject) {
        await onAddProject(projectData);
      }
      showToast(`Design "${projectData.title}" adicionado com ${finalImages.length} imagem(ns)!`);
      setIsNewProjectModalOpen(false);
      setNewProject({
        title: '',
        clientName: '',
        folderId: '',
        category: 'Instagram',
        channel: 'Instagram Feed',
        status: 'producao',
        assignedTo: userProfile?.name || 'Designer Responsável',
        assignedEmail: userProfile?.email || '',
        createdBy: userProfile?.name || 'Executivo / Líder',
        briefing: '',
        copyText: '',
        hashtags: '',
        imageUrl: '',
        images: [],
        urlInput: '',
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

  // ==========================================
  // Submit: Edit Project
  // ==========================================
  const handleSaveEditedProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectToEdit) return;

    if (!editForm.title.trim() || !editForm.clientName.trim()) {
      showToast('Preencha o título e o nome da empresa.');
      return;
    }

    const selectedFolder = designFolders.find((f) => f.id === editForm.folderId);
    const finalImages = editForm.images.length > 0
      ? editForm.images
      : editForm.imageUrl.trim()
      ? [editForm.imageUrl.trim()]
      : [];

    const updatedData: Partial<DesignProject> = {
      title: editForm.title.trim(),
      clientName: editForm.clientName.trim(),
      folderId: editForm.folderId || undefined,
      folderName: selectedFolder ? selectedFolder.name : undefined,
      category: editForm.category,
      channel: editForm.channel,
      status: editForm.status,
      assignedTo: editForm.assignedTo.trim(),
      assignedEmail: editForm.assignedEmail.trim(),
      briefing: editForm.briefing.trim(),
      copyText: editForm.copyText.trim(),
      hashtags: editForm.hashtags.trim(),
      imageUrl: finalImages[0] || '',
      images: finalImages,
      version: Number(editForm.version) || 1,
      deadline: editForm.deadline,
      dimensions: editForm.dimensions,
      packageName: editForm.packageName.trim() || undefined,
      approved: editForm.status === 'aprovado',
      updatedAt: new Date().toISOString(),
    };

    try {
      if (onUpdateProject) {
        await onUpdateProject(projectToEdit.id, updatedData);
      }
      showToast(`Arte "${updatedData.title}" atualizada com sucesso!`);
      setProjectToEdit(null);
      if (selectedProjectForDetail && selectedProjectForDetail.id === projectToEdit.id) {
        setSelectedProjectForDetail({
          ...selectedProjectForDetail,
          ...updatedData,
        } as DesignProject);
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar arte.');
    }
  };

  // ==========================================
  // Submit: Post / Publish
  // ==========================================
  const handleConfirmPost = async () => {
    if (!projectToPost) return;
    setIsPosting(true);

    try {
      const isNow = postMode === 'agora';
      const postUpdates: Partial<DesignProject> = {
        postStatus: isNow ? 'postado' : 'agendado',
        status: isNow ? 'entregue' : projectToPost.status,
        postPlatforms: selectedPlatforms,
        postedAt: isNow ? new Date().toISOString() : undefined,
        postedBy: userProfile?.name || 'Equipe de Marketing',
        scheduledPostDate: isNow ? undefined : scheduledDate,
        scheduledPostTime: isNow ? undefined : scheduledTime,
        updatedAt: new Date().toISOString(),
      };

      if (onUpdateProject) {
        await onUpdateProject(projectToPost.id, postUpdates);
      }

      if (onAddComment) {
        await onAddComment({
          projectId: projectToPost.id,
          authorName: userProfile?.name || 'Sistema de Publicação',
          authorEmail: userProfile?.email || '',
          authorRole: 'designer',
          text: isNow
            ? `🚀 [POST PUBLICADO] Arte postada em: ${selectedPlatforms.join(', ')} por ${userProfile?.name || 'Equipe'}`
            : `📅 [POST AGENDADO] Agendado para ${scheduledDate} às ${scheduledTime} em: ${selectedPlatforms.join(', ')}`,
          timestamp: new Date().toISOString(),
        });
      }

      showToast(
        isNow
          ? `Arte "${projectToPost.title}" publicada com sucesso em ${selectedPlatforms.join(', ')}!`
          : `Arte "${projectToPost.title}" agendada para ${scheduledDate} às ${scheduledTime}!`
      );

      if (selectedProjectForDetail && selectedProjectForDetail.id === projectToPost.id) {
        setSelectedProjectForDetail({
          ...selectedProjectForDetail,
          ...postUpdates,
        } as DesignProject);
      }

      setProjectToPost(null);
    } catch (err) {
      console.error(err);
      showToast('Erro ao publicar post.');
    } finally {
      setIsPosting(false);
    }
  };

  // Quick Action: Download image / all images
  const handleDownloadImages = (project: DesignProject) => {
    const imagesToDownload = project.images && project.images.length > 0
      ? project.images
      : project.imageUrl
      ? [project.imageUrl]
      : [];

    if (imagesToDownload.length === 0) {
      showToast('Nenhuma imagem para baixar.');
      return;
    }

    imagesToDownload.forEach((url, idx) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.clientName.replace(/\s+/g, '_')}_${project.title.replace(/\s+/g, '_')}_slide_${idx + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    showToast(`${imagesToDownload.length} imagem(ns) baixada(s)!`);
  };

  // Quick Action: Share to WhatsApp
  const handleShareWhatsApp = (project: DesignProject) => {
    const text = `🎨 *${project.title}* - ${project.clientName}\n\n📝 *Legenda:*\n${project.copyText || ''}\n\n🏷️ ${project.hashtags || ''}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // ==========================================
  // Handlers for Folders, Briefings, Packages
  // ==========================================
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
        color: '#ffffff',
      });
    } catch (err) {
      console.error(err);
      showToast('Erro ao criar pasta.');
    }
  };

  // ==========================================
  // Briefing Example & Reference Handlers
  // ==========================================
  const handleBriefingFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    let loadedCount = 0;
    const newImages: string[] = [];

    fileList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        newImages.push(result);
        loadedCount++;

        if (loadedCount === fileList.length) {
          setNewBriefing((prev) => ({
            ...prev,
            referenceImages: [...prev.referenceImages, ...newImages],
          }));
          showToast(`${fileList.length} imagem(ns) de exemplo anexada(s)!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddBriefingImageUrl = () => {
    if (!newBriefing.newImageUrlInput.trim()) return;
    setNewBriefing((prev) => ({
      ...prev,
      referenceImages: [...prev.referenceImages, prev.newImageUrlInput.trim()],
      newImageUrlInput: '',
    }));
    showToast('Imagem de exemplo adicionada via URL!');
  };

  const handleRemoveBriefingImage = (index: number) => {
    setNewBriefing((prev) => ({
      ...prev,
      referenceImages: prev.referenceImages.filter((_, i) => i !== index),
    }));
  };

  const handleAddBriefingLink = () => {
    if (!newBriefing.newLinkInput.trim()) return;
    let url = newBriefing.newLinkInput.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    setNewBriefing((prev) => ({
      ...prev,
      referenceLinks: [...prev.referenceLinks, url],
      newLinkInput: '',
    }));
    showToast('Link de referência adicionado!');
  };

  const handleRemoveBriefingLink = (index: number) => {
    setNewBriefing((prev) => ({
      ...prev,
      referenceLinks: prev.referenceLinks.filter((_, i) => i !== index),
    }));
  };

  const handleAddBriefingInstagramProfile = () => {
    if (!newBriefing.newInstagramProfileInput.trim()) return;
    let profile = newBriefing.newInstagramProfileInput.trim();
    // Normalize handle or url
    if (!profile.startsWith('@') && !profile.includes('instagram.com')) {
      profile = `@${profile}`;
    }
    setNewBriefing((prev) => ({
      ...prev,
      instagramProfiles: [...prev.instagramProfiles, profile],
      newInstagramProfileInput: '',
    }));
    showToast('Perfil do Instagram adicionado!');
  };

  const handleRemoveBriefingInstagramProfile = (index: number) => {
    setNewBriefing((prev) => ({
      ...prev,
      instagramProfiles: prev.instagramProfiles.filter((_, i) => i !== index),
    }));
  };

  const handleAddBriefingInstagramPost = () => {
    if (!newBriefing.newInstagramPostInput.trim()) return;
    let url = newBriefing.newInstagramPostInput.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    setNewBriefing((prev) => ({
      ...prev,
      instagramPosts: [...prev.instagramPosts, url],
      newInstagramPostInput: '',
    }));
    showToast('Post de referência do Instagram adicionado!');
  };

  const handleRemoveBriefingInstagramPost = (index: number) => {
    setNewBriefing((prev) => ({
      ...prev,
      instagramPosts: prev.instagramPosts.filter((_, i) => i !== index),
    }));
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
          referencesUrl: newBriefing.referencesUrl.trim() || (newBriefing.referenceLinks[0] || undefined),
          referenceLinks: newBriefing.referenceLinks,
          referenceImages: newBriefing.referenceImages,
          instagramProfiles: newBriefing.instagramProfiles,
          instagramPosts: newBriefing.instagramPosts,
          deadline: newBriefing.deadline,
          status: 'Pendente',
          createdAt: new Date().toISOString(),
        });
      }
      showToast('Demanda e referências cadastradas para a equipe!');
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
        referenceLinks: [],
        referenceImages: [],
        instagramProfiles: [],
        instagramPosts: [],
        newLinkInput: '',
        newImageUrlInput: '',
        newInstagramProfileInput: '',
        newInstagramPostInput: '',
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

  // Helper to extract all images of a project
  const getProjectImages = (p: DesignProject | null): string[] => {
    if (!p) return [];
    if (p.images && p.images.length > 0) return p.images;
    if (p.imageUrl) return [p.imageUrl];
    return [];
  };

  const currentDetailImages = getProjectImages(selectedProjectForDetail);

  return (
    <>
      {/* ========================================================================= */}
      {/* MODAL 1: NOVO CRIATIVO / DESIGN (COM MULTI-IMAGEM & CARROSSEL) */}
      {/* ========================================================================= */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-7 w-full max-w-3xl shadow-2xl text-neutral-200 relative my-8">
            <button
              onClick={() => setIsNewProjectModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                <Palette className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Cadastrar Novo Design / Criativo</h3>
                <p className="text-xs text-neutral-400">
                  Adicione arte única ou carrossel com múltiplas imagens, copy/legenda e atribua ao funcionário.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Título da Arte / Post *</label>
                  <input
                    type="text"
                    required
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="ex: Carrossel 5 Segredos do Tráfego Pago"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Nome da Empresa / Cliente *</label>
                  <input
                    type="text"
                    required
                    value={newProject.clientName}
                    onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                    placeholder="ex: Dra. Camila Odontologia"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Canal / Formato</label>
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
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    {channels.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Pasta do Cliente</label>
                  <select
                    value={newProject.folderId}
                    onChange={(e) => setNewProject({ ...newProject, folderId: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="">Sem pasta (Geral)</option>
                    {designFolders.map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name} ({f.clientName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Funcionário / Designer *</label>
                  <input
                    type="text"
                    required
                    value={newProject.assignedTo}
                    onChange={(e) => setNewProject({ ...newProject, assignedTo: e.target.value })}
                    placeholder="ex: Lucas Designer / Vitória"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* ================================================= */}
              {/* MULTI-IMAGE UPLOAD ZONE */}
              {/* ================================================= */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-white" />
                    <label className="text-neutral-200 font-bold text-xs">
                      Anexar Imagens / Slides do Carrossel ({newProject.images.length} anexadas)
                    </label>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    Você pode selecionar vários arquivos de uma vez
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold cursor-pointer flex items-center justify-center gap-2 shrink-0 transition-colors">
                    <UploadCloud className="w-4 h-4 stroke-[2.5]" />
                    <span>Selecionar Várias Imagens</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultipleImageUploadNew}
                      className="hidden"
                    />
                  </label>

                  <div className="w-full sm:flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={newProject.urlInput}
                      onChange={(e) => setNewProject({ ...newProject, urlInput: e.target.value })}
                      placeholder="Ou cole a URL de uma imagem..."
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrlImageNew}
                      className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                {/* Thumbnails Gallery Strip */}
                {newProject.images.length > 0 ? (
                  <div className="pt-2">
                    <div className="text-[11px] text-neutral-400 font-bold mb-2">
                      Galeria de Imagens (A primeira imagem será a capa):
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto p-1 bg-neutral-950 rounded-xl border border-neutral-800">
                      {newProject.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className={`relative aspect-square rounded-lg overflow-hidden border group ${
                            idx === 0 ? 'border-white ring-2 ring-white/30' : 'border-neutral-800'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Slide ${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-black text-white">
                            #{idx + 1} {idx === 0 && '⭐ Capa'}
                          </div>

                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverImageNew(idx)}
                                className="px-2 py-0.5 rounded bg-white text-black text-[10px] font-bold cursor-pointer hover:bg-neutral-200"
                              >
                                Tornar Capa
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImageNew(idx)}
                              className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold cursor-pointer hover:bg-red-500"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-neutral-800 text-center text-neutral-400 text-[11px]">
                    Nenhuma imagem anexada. Clique em "Selecionar Várias Imagens" ou cole uma URL.
                  </div>
                )}
              </div>

              {/* Copy & Legenda */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-neutral-300 font-bold">Legenda / Copy / Texto do Post</label>
                  <span className="text-neutral-400 text-[11px]">
                    {newProject.copyText.length} caracteres
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={newProject.copyText}
                  onChange={(e) => setNewProject({ ...newProject, copyText: e.target.value })}
                  placeholder="Escreva a legenda completa que será publicada junto com o post..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Hashtags</label>
                  <input
                    type="text"
                    value={newProject.hashtags}
                    onChange={(e) => setNewProject({ ...newProject, hashtags: e.target.value })}
                    placeholder="#marketing #design #agencia"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Status Inicial</label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value as DesignStatus })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="producao">Em Produção</option>
                    <option value="revisao">Em Revisão (Líder)</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="ajustes">Precisa de Ajustes</option>
                    <option value="entregue">Pronto para Postar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Prazo de Entrega</label>
                  <input
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-black cursor-pointer shadow-lg transition-colors"
                >
                  Salvar Criativo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDITAR CRIATIVO / DESIGN (PERMISSÃO DE EDIÇÃO) */}
      {/* ========================================================================= */}
      {projectToEdit && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-7 w-full max-w-3xl shadow-2xl text-neutral-200 relative my-8">
            <button
              onClick={() => setProjectToEdit(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                <Edit3 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Editar Criativo / Design</h3>
                <p className="text-xs text-neutral-400">
                  Modifique títulos, imagens anexadas, status, legenda ou reatribua para outro funcionário.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEditedProject} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Título da Arte *</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Empresa / Cliente *</label>
                  <input
                    type="text"
                    required
                    value={editForm.clientName}
                    onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Canal / Formato</label>
                  <select
                    value={editForm.channel}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        channel: e.target.value as DesignChannel,
                      })
                    }
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    {channels.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Pasta</label>
                  <select
                    value={editForm.folderId}
                    onChange={(e) => setEditForm({ ...editForm, folderId: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="">Sem pasta (Geral)</option>
                    {designFolders.map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name} ({f.clientName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Funcionário Responsável</label>
                  <input
                    type="text"
                    value={editForm.assignedTo}
                    onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Multi-Image Edit Section */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-white" />
                    <label className="text-neutral-200 font-bold text-xs">
                      Imagens Anexadas ({editForm.images.length})
                    </label>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    Adicione mais fotos ou remova existentes
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold cursor-pointer flex items-center justify-center gap-2 shrink-0 transition-colors">
                    <UploadCloud className="w-4 h-4 stroke-[2.5]" />
                    <span>Anexar Mais Imagens</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultipleImageUploadEdit}
                      className="hidden"
                    />
                  </label>

                  <div className="w-full sm:flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editForm.urlInput}
                      onChange={(e) => setEditForm({ ...editForm, urlInput: e.target.value })}
                      placeholder="Ou adicione via URL..."
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrlImageEdit}
                      className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                {/* Thumbnails */}
                {editForm.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto p-1 bg-neutral-950 rounded-xl border border-neutral-800">
                    {editForm.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-square rounded-lg overflow-hidden border group ${
                          idx === 0 ? 'border-white ring-2 ring-white/30' : 'border-neutral-800'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Slide ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-black text-white">
                          #{idx + 1} {idx === 0 && '⭐ Capa'}
                        </div>

                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetCoverImageEdit(idx)}
                              className="px-2 py-0.5 rounded bg-white text-black text-[10px] font-bold cursor-pointer hover:bg-neutral-200"
                            >
                              Capa
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImageEdit(idx)}
                            className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold cursor-pointer hover:bg-red-500"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Copy / Legenda */}
              <div className="space-y-1.5">
                <label className="block text-neutral-300 font-bold">Legenda / Copy / Texto</label>
                <textarea
                  rows={3}
                  value={editForm.copyText}
                  onChange={(e) => setEditForm({ ...editForm, copyText: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Hashtags</label>
                  <input
                    type="text"
                    value={editForm.hashtags}
                    onChange={(e) => setEditForm({ ...editForm, hashtags: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Status do Design</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as DesignStatus })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="producao">Em Produção</option>
                    <option value="revisao">Em Revisão (Líder)</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="ajustes">Precisa de Ajustes</option>
                    <option value="entregue">Pronto / Postado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Versão</label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.version}
                    onChange={(e) => setEditForm({ ...editForm, version: Number(e.target.value) || 1 })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setProjectToEdit(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-black cursor-pointer shadow-lg transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PUBLICAR / POSTAR NAS REDES */}
      {/* ========================================================================= */}
      {projectToPost && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-7 w-full max-w-xl shadow-2xl text-neutral-200 relative my-8 space-y-4">
            <button
              onClick={() => setProjectToPost(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                <Send className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Publicar / Agendar Postagem</h3>
                <p className="text-xs text-neutral-400">
                  Transfira a arte e a legenda diretamente para as redes sociais ou agende a postagem.
                </p>
              </div>
            </div>

            {/* Post Summary Card */}
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center gap-3">
              {getProjectImages(projectToPost)[0] ? (
                <img
                  src={getProjectImages(projectToPost)[0]}
                  alt={projectToPost.title}
                  className="w-14 h-14 rounded-xl object-cover border border-neutral-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-neutral-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold text-neutral-400 block">
                  🏢 {projectToPost.clientName}
                </span>
                <h4 className="text-sm font-black text-white truncate">{projectToPost.title}</h4>
                <span className="text-[11px] text-neutral-400">
                  {getProjectImages(projectToPost).length} imagem(ns) anexadas
                </span>
              </div>
            </div>

            {/* Select Destination Platforms */}
            <div className="space-y-2">
              <label className="block text-neutral-300 font-bold text-xs">
                Selecione as Redes de Destino:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Instagram Feed',
                  'Instagram Stories',
                  'Facebook',
                  'LinkedIn',
                  'TikTok',
                  'WhatsApp',
                ].map((plat) => {
                  const isSelected = selectedPlatforms.includes(plat);
                  return (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => {
                        setSelectedPlatforms((prev) =>
                          isSelected ? prev.filter((p) => p !== plat) : [...prev, plat]
                        );
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-neutral-800 border-white text-white'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                          isSelected ? 'bg-white border-white text-black' : 'border-neutral-700'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                      </div>
                      <span>{plat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode: Post Now vs Schedule */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPostMode('agora')}
                className={`p-3 rounded-2xl border text-center font-bold text-xs cursor-pointer transition-all ${
                  postMode === 'agora'
                    ? 'bg-neutral-800 border-white text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="text-sm mb-0.5">⚡ Postar Agora</div>
                <span className="text-[10px] text-neutral-400 font-normal">
                  Marcar como publicado imediatamente
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPostMode('agendar')}
                className={`p-3 rounded-2xl border text-center font-bold text-xs cursor-pointer transition-all ${
                  postMode === 'agendar'
                    ? 'bg-neutral-800 border-white text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="text-sm mb-0.5">📅 Agendar Publicação</div>
                <span className="text-[10px] text-neutral-400 font-normal">
                  Definir data e horário futuro
                </span>
              </button>
            </div>

            {postMode === 'agendar' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-950 rounded-2xl border border-neutral-800">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1 text-[11px]">Data</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-bold mb-1 text-[11px]">Horário</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            )}

            {/* Quick Action Helpers */}
            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-2">
              <div className="text-[11px] text-neutral-400 font-bold">Ferramentas de Disparo Rápido:</div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${projectToPost.copyText || ''}\n\n${projectToPost.hashtags || ''}`
                    );
                    showToast('Legenda e hashtags copiadas!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-white" />
                  <span>Copiar Legenda</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadImages(projectToPost)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Baixar Imagens</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShareWhatsApp(projectToPost)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-white" />
                  <span>Disparar WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.open('https://www.instagram.com', '_blank')}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                  <span>Abrir Instagram</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setProjectToPost(null)}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPosting || selectedPlatforms.length === 0}
                onClick={handleConfirmPost}
                className="px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-black text-xs cursor-pointer shadow-lg flex items-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>{postMode === 'agora' ? 'Confirmar Publicação' : 'Confirmar Agendamento'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DETALHES DO DESIGN, CARROSSEL MULTI-IMAGEM & AÇÕES */}
      {/* ========================================================================= */}
      {selectedProjectForDetail && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-3xl w-full max-w-4xl shadow-2xl text-neutral-200 relative my-8 overflow-hidden">
            <button
              onClick={() => setSelectedProjectForDetail(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/80 text-neutral-300 hover:text-white flex items-center justify-center cursor-pointer border border-neutral-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Column: Interactive Multi-Image Carousel */}
              <div className="bg-neutral-950 p-6 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-neutral-800 relative min-h-[380px]">
                <div className="w-full flex-1 flex flex-col items-center justify-center relative">
                  {currentDetailImages.length > 0 ? (
                    <div className="relative w-full flex items-center justify-center">
                      <img
                        src={currentDetailImages[activeSlideIndex] || currentDetailImages[0]}
                        alt={selectedProjectForDetail.title}
                        className="max-h-[380px] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-neutral-800"
                        referrerPolicy="no-referrer"
                      />

                      {/* Navigation Arrows for Carousel */}
                      {currentDetailImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveSlideIndex((prev) =>
                                prev === 0 ? currentDetailImages.length - 1 : prev - 1
                              )
                            }
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/80 hover:bg-white hover:text-black text-white border border-neutral-700 flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveSlideIndex((prev) =>
                                prev === currentDetailImages.length - 1 ? 0 : prev + 1
                              )
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/80 hover:bg-white hover:text-black text-white border border-neutral-700 flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-neutral-500 flex flex-col items-center py-12">
                      <ImageIcon className="w-12 h-12 mb-2 opacity-50 text-white" />
                      <span>Nenhuma imagem anexada</span>
                    </div>
                  )}

                  {/* Slide Counter Indicator */}
                  {currentDetailImages.length > 1 && (
                    <div className="mt-3 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300">
                      Slide {activeSlideIndex + 1} de {currentDetailImages.length} (Carrossel)
                    </div>
                  )}

                  {/* Thumbnail Strip */}
                  {currentDetailImages.length > 1 && (
                    <div className="mt-3 flex items-center gap-1.5 overflow-x-auto max-w-full p-1 bg-neutral-900 rounded-xl border border-neutral-800">
                      {currentDetailImages.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveSlideIndex(idx)}
                          className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 border cursor-pointer ${
                            idx === activeSlideIndex
                              ? 'border-white ring-2 ring-white/30'
                              : 'border-neutral-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Thumb ${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 flex-wrap justify-center w-full pt-3 border-t border-neutral-900">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-900 border border-neutral-800 text-neutral-300">
                    {selectedProjectForDetail.channel}
                  </span>
                  {selectedProjectForDetail.dimensions && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">
                      {selectedProjectForDetail.dimensions}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-900 text-white border border-neutral-700">
                    v{selectedProjectForDetail.version}
                  </span>
                  {selectedProjectForDetail.postStatus === 'postado' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-900 text-white border border-white flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Postado
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Information, Copy & Actions */}
              <div className="p-6 space-y-4 flex flex-col justify-between overflow-y-auto max-h-[580px]">
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-neutral-400">
                      🏢 {selectedProjectForDetail.clientName}
                    </span>
                    <h3 className="text-lg font-black text-white">{selectedProjectForDetail.title}</h3>
                  </div>

                  <div className="bg-neutral-900 p-3 rounded-2xl border border-neutral-800 text-xs grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-neutral-400 text-[10px] block font-bold">FUNCIONÁRIO:</span>
                      <strong className="text-white">{selectedProjectForDetail.assignedTo}</strong>
                    </div>
                    <div>
                      <span className="text-neutral-400 text-[10px] block font-bold">STATUS:</span>
                      <strong className="text-white capitalize">{selectedProjectForDetail.status}</strong>
                    </div>
                  </div>

                  {selectedProjectForDetail.reviewFeedback && (
                    <div className="bg-neutral-900 p-3 rounded-2xl border border-neutral-800 text-xs space-y-1">
                      <div className="text-[10px] font-bold text-white flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Feedback da Líder:
                      </div>
                      <p className="text-neutral-200 italic">{selectedProjectForDetail.reviewFeedback}</p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-neutral-300 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-white" /> Legenda / Copy:
                      </span>
                      {selectedProjectForDetail.copyText && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${selectedProjectForDetail.copyText}\n\n${selectedProjectForDetail.hashtags || ''}`
                            );
                            showToast('Legenda copiada com sucesso!');
                          }}
                          className="text-white hover:underline text-xs flex items-center gap-1 cursor-pointer font-bold"
                        >
                          <Copy className="w-3 h-3" /> Copiar Texto
                        </button>
                      )}
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">
                      {selectedProjectForDetail.copyText || 'Nenhuma legenda registrada.'}
                    </div>

                    {selectedProjectForDetail.hashtags && (
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {selectedProjectForDetail.hashtags}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-neutral-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {canUserEditDesigns(userProfile, userProfile?.email) && (
                      <button
                        onClick={() => {
                          const proj = selectedProjectForDetail;
                          setSelectedProjectForDetail(null);
                          setProjectToEdit(proj);
                        }}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Editar Arte</span>
                      </button>
                    )}

                    {canUserPublishPosts(userProfile, userProfile?.email) && (
                      <button
                        onClick={() => {
                          const proj = selectedProjectForDetail;
                          setSelectedProjectForDetail(null);
                          setProjectToPost(proj);
                        }}
                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-700 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Publicar / Postar</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        const proj = selectedProjectForDetail;
                        setSelectedProjectForDetail(null);
                        onOpenChatForProject(proj.id);
                      }}
                      className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-neutral-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-white" /> Abrir Chat
                    </button>

                    {canUserApproveDesigns(userProfile, userProfile?.email) && (
                      <button
                        onClick={() => {
                          const proj = selectedProjectForDetail;
                          setSelectedProjectForDetail(null);
                          setSelectedProjectForApproval(proj);
                        }}
                        className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-neutral-700"
                      >
                        <ShieldCheck className="w-4 h-4 stroke-[2.5]" /> Avaliar / Aprovar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: AVALIAÇÃO & APROVAÇÃO DA LÍDER */}
      {/* ========================================================================= */}
      {selectedProjectForApproval && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl text-neutral-200 relative space-y-4">
            <button
              onClick={() => setSelectedProjectForApproval(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Avaliação da Líder de Criação</h3>
                <p className="text-xs text-neutral-400">
                  Aprovar arte para publicação ou solicitar ajustes para o funcionário.
                </p>
              </div>
            </div>

            <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 text-xs">
              <span className="text-neutral-400 font-bold block">🏢 {selectedProjectForApproval.clientName}</span>
              <strong className="text-white text-sm">{selectedProjectForApproval.title}</strong>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setApprovalDecision('aprovar')}
                className={`p-3 rounded-2xl border text-center font-bold text-xs cursor-pointer transition-all ${
                  approvalDecision === 'aprovar'
                    ? 'bg-neutral-800 border-white text-white shadow-lg'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
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
                    ? 'bg-neutral-800 border-white text-white shadow-lg'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="text-base mb-1">⚠️</div>
                Pedir Ajustes
              </button>
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-neutral-300 font-bold">Feedback da Avaliação:</label>
              <textarea
                rows={3}
                value={approvalFeedback}
                onChange={(e) => setApprovalFeedback(e.target.value)}
                placeholder="ex: Cores e contraste aprovados para veiculação!"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedProjectForApproval(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleLeaderApproval}
                className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-xs cursor-pointer shadow-lg transition-colors"
              >
                Confirmar Decisão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: NOVO BRIEFING */}
      {/* ========================================================================= */}
      {isNewBriefingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-7 w-full max-w-xl shadow-2xl text-neutral-200 relative my-8">
            <button
              onClick={() => setIsNewBriefingModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                <FileText className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Cadastrar Demanda / Briefing</h3>
                <p className="text-xs text-neutral-400">
                  Descreva o que o cliente solicitou para que os funcionários possam assumir a arte.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateBriefing} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">Título da Demanda *</label>
                <input
                  type="text"
                  required
                  value={newBriefing.title}
                  onChange={(e) => setNewBriefing({ ...newBriefing, title: e.target.value })}
                  placeholder="ex: Anúncio de Implantes Dentários com Oferta"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Empresa / Cliente *</label>
                  <input
                    type="text"
                    required
                    value={newBriefing.clientName}
                    onChange={(e) => setNewBriefing({ ...newBriefing, clientName: e.target.value })}
                    placeholder="ex: Dra. Camila Odontologia"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Solicitante / Executivo *</label>
                  <input
                    type="text"
                    required
                    value={newBriefing.executiveName}
                    onChange={(e) => setNewBriefing({ ...newBriefing, executiveName: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Canal / Formato</label>
                  <select
                    value={newBriefing.channel}
                    onChange={(e) => setNewBriefing({ ...newBriefing, channel: e.target.value as DesignChannel })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    {channels.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Prioridade</label>
                  <select
                    value={newBriefing.priority}
                    onChange={(e) =>
                      setNewBriefing({
                        ...newBriefing,
                        priority: e.target.value as 'Baixa' | 'Média' | 'Alta' | 'Urgente',
                      })
                    }
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">🚨 Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Prazo de Entrega</label>
                  <input
                    type="date"
                    value={newBriefing.deadline}
                    onChange={(e) => setNewBriefing({ ...newBriefing, deadline: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Descrição do Briefing *</label>
                <textarea
                  rows={3}
                  required
                  value={newBriefing.description}
                  onChange={(e) => setNewBriefing({ ...newBriefing, description: e.target.value })}
                  placeholder="Explique o objetivo do cliente, textos essenciais, mensagem principal, etc..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
              </div>

              {/* ========================================================= */}
              {/* SEÇÃO: EXEMPLOS & REFERÊNCIAS VISUAIS (IMAGENS, LINKS, INSTAGRAM) */}
              {/* ========================================================= */}
              <div className="bg-[#12141c] border border-neutral-800/90 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-xs border-b border-neutral-800 pb-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Exemplos & Inspirações para o Designer (Imagens, Links e Instagram)</span>
                </div>

                {/* 1. Imagens de Exemplo */}
                <div className="space-y-2">
                  <label className="block text-neutral-300 font-bold text-[11px] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Imagens de Referência / Exemplos
                    </span>
                    <span className="text-[10px] text-neutral-400 font-normal">
                      {newBriefing.referenceImages.length} anexo(s)
                    </span>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="flex-1 border-2 border-dashed border-neutral-700 hover:border-white bg-neutral-900/60 rounded-xl p-2.5 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 text-neutral-300 hover:text-white">
                      <UploadCloud className="w-4 h-4 text-emerald-400" />
                      <span className="text-[11px] font-bold">Carregar Imagens do Computador</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleBriefingFileUpload}
                        className="hidden"
                      />
                    </label>

                    <div className="flex items-center gap-1 sm:w-1/2">
                      <input
                        type="url"
                        value={newBriefing.newImageUrlInput}
                        onChange={(e) => setNewBriefing({ ...newBriefing, newImageUrlInput: e.target.value })}
                        placeholder="Ou colar URL da imagem..."
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-2 text-[11px] text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddBriefingImageUrl}
                        className="px-2.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-[11px] cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {newBriefing.referenceImages.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                      {newBriefing.referenceImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-neutral-700 bg-neutral-900 aspect-square">
                          <img
                            src={imgUrl}
                            alt={`Exemplo ${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveBriefingImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Remover imagem"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Instagram de Referência (Perfis & Posts) */}
                <div className="space-y-2 pt-2 border-t border-neutral-800/60">
                  <label className="block text-neutral-300 font-bold text-[11px] flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-400" /> Referências do Instagram (Perfis e Posts)
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Perfil Instagram */}
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={newBriefing.newInstagramProfileInput}
                        onChange={(e) => setNewBriefing({ ...newBriefing, newInstagramProfileInput: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddBriefingInstagramProfile();
                          }
                        }}
                        placeholder="Perfil ex: @nomedamarca"
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-[11px] text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddBriefingInstagramProfile}
                        className="px-2.5 py-1.5 rounded-xl bg-pink-950/80 hover:bg-pink-900 border border-pink-700/60 text-pink-300 font-bold text-[11px] cursor-pointer shrink-0"
                      >
                        + Perfil
                      </button>
                    </div>

                    {/* Post Instagram */}
                    <div className="flex items-center gap-1">
                      <input
                        type="url"
                        value={newBriefing.newInstagramPostInput}
                        onChange={(e) => setNewBriefing({ ...newBriefing, newInstagramPostInput: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddBriefingInstagramPost();
                          }
                        }}
                        placeholder="Link post: instagram.com/p/..."
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-[11px] text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddBriefingInstagramPost}
                        className="px-2.5 py-1.5 rounded-xl bg-pink-950/80 hover:bg-pink-900 border border-pink-700/60 text-pink-300 font-bold text-[11px] cursor-pointer shrink-0"
                      >
                        + Post
                      </button>
                    </div>
                  </div>

                  {/* List of added Instagram references */}
                  {(newBriefing.instagramProfiles.length > 0 || newBriefing.instagramPosts.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {newBriefing.instagramProfiles.map((prof, idx) => (
                        <span
                          key={`prof-${idx}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-pink-950/60 border border-pink-600/40 text-pink-300 text-[10px] font-bold"
                        >
                          <Instagram className="w-3 h-3" />
                          {prof}
                          <button
                            type="button"
                            onClick={() => handleRemoveBriefingInstagramProfile(idx)}
                            className="text-pink-400 hover:text-white cursor-pointer ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}

                      {newBriefing.instagramPosts.map((postUrl, idx) => (
                        <span
                          key={`post-${idx}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-pink-950/40 border border-pink-800/40 text-pink-200 text-[10px]"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          Post {idx + 1}
                          <button
                            type="button"
                            onClick={() => handleRemoveBriefingInstagramPost(idx)}
                            className="text-pink-400 hover:text-white cursor-pointer ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Links Gerais de Referência (Pinterest, Behance, Drive, Canva, Web) */}
                <div className="space-y-2 pt-2 border-t border-neutral-800/60">
                  <label className="block text-neutral-300 font-bold text-[11px] flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-blue-400" /> Links de Inspiração (Pinterest, Behance, Drive, Canva, etc.)
                  </label>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      value={newBriefing.newLinkInput}
                      onChange={(e) => setNewBriefing({ ...newBriefing, newLinkInput: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddBriefingLink();
                        }
                      }}
                      placeholder="https://pinterest.com/... ou behance.net/... ou drive.google.com/..."
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-[11px] text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddBriefingLink}
                      className="px-3 py-1.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-600/50 text-blue-300 font-bold text-[11px] cursor-pointer shrink-0"
                    >
                      + Adicionar Link
                    </button>
                  </div>

                  {newBriefing.referenceLinks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {newBriefing.referenceLinks.map((link, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/50 border border-blue-700/40 text-blue-300 text-[10px] max-w-[280px] truncate"
                        >
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{link}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBriefingLink(idx)}
                            className="text-blue-400 hover:text-white cursor-pointer ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsNewBriefingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-black cursor-pointer shadow-lg transition-colors"
                >
                  Enviar Demanda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: NOVA PASTA */}
      {/* ========================================================================= */}
      {isNewFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl text-neutral-200 relative space-y-4">
            <button
              onClick={() => setIsNewFolderModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                <Folder className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Criar Nova Pasta</h3>
                <p className="text-xs text-neutral-400">Organize os criativos por empresa ou canal.</p>
              </div>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">Nome da Pasta *</label>
                <input
                  type="text"
                  required
                  value={newFolder.name}
                  onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                  placeholder="ex: Dra. Camila - Conteúdo Instagram"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Empresa / Cliente *</label>
                <input
                  type="text"
                  required
                  value={newFolder.clientName}
                  onChange={(e) => setNewFolder({ ...newFolder, clientName: e.target.value })}
                  placeholder="ex: Dra. Camila Odontologia"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-black cursor-pointer shadow-lg transition-colors"
                >
                  Criar Pasta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: NOVO PACOTE */}
      {/* ========================================================================= */}
      {isNewPackageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl text-neutral-200 relative space-y-4">
            <button
              onClick={() => setIsNewPackageModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                <Package className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Criar Pacote de Entrega</h3>
                <p className="text-xs text-neutral-400">Agrupe criativos para entregar em lote ao cliente.</p>
              </div>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">Nome do Pacote *</label>
                <input
                  type="text"
                  required
                  value={newPackage.packageName}
                  onChange={(e) => setNewPackage({ ...newPackage, packageName: e.target.value })}
                  placeholder="ex: Pack Mensal 12 Posts"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Empresa / Cliente *</label>
                <input
                  type="text"
                  required
                  value={newPackage.clientName}
                  onChange={(e) => setNewPackage({ ...newPackage, clientName: e.target.value })}
                  placeholder="ex: Dra. Camila Odontologia"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPackageModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-black cursor-pointer shadow-lg transition-colors"
                >
                  Registrar Pacote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 9: CONFIRMAR APAGAR PASTA */}
      {/* ========================================================================= */}
      {folderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl text-neutral-200 relative space-y-4">
            <button
              onClick={() => setFolderToDelete(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                <Trash2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Apagar Pasta</h3>
                <p className="text-xs text-neutral-400">Exclusão da pasta selecionada.</p>
              </div>
            </div>

            <p className="text-neutral-300 text-xs">
              Deseja apagar a pasta <strong className="text-white">"{folderToDelete.name}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFolderToDelete(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteFolder}
                className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-xs cursor-pointer shadow-lg"
              >
                Apagar Pasta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 10: CONFIRMAR LIMPAR TUDO */}
      {/* ========================================================================= */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl text-neutral-200 relative space-y-4">
            <button
              onClick={() => setIsClearAllModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                <Trash2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Limpar e Zerar o Painel</h3>
                <p className="text-xs text-neutral-400">Remover dados e deixar a área limpa.</p>
              </div>
            </div>

            <p className="text-neutral-300 text-xs">
              Tem certeza que deseja apagar todas as demonstrações do Hub do Designer?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-xs cursor-pointer shadow-lg"
              >
                Limpar Painel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Palette,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
  Eye,
  FileText,
  Package,
  ShieldCheck,
  Plus,
  Trash2,
  Image as ImageIcon,
  Edit3,
  Send,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  DesignProject,
  DesignFolder,
  DesignStatus,
  DesignChannel,
} from '../../types';
import { FirestoreUserProfile } from '../../lib/firebase';
import {
  canUserEditDesigns,
  canUserApproveDesigns,
  canUserPublishPosts,
  canUserDeleteDesigns,
} from '../../lib/permissions';

interface CreativesTabProps {
  userProfile?: FirestoreUserProfile | null;
  designProjects: DesignProject[];
  designFolders: DesignFolder[];
  channels: DesignChannel[];
  folderFilter: string;
  setFolderFilter: (f: string) => void;
  onOpenNewProjectModal: () => void;
  onSelectProjectForDetail: (p: DesignProject) => void;
  onSelectProjectForApproval: (p: DesignProject) => void;
  onEditProject?: (p: DesignProject) => void;
  onPostProject?: (p: DesignProject) => void;
  onOpenChatForProject: (projectId: string) => void;
  onDeleteProject?: (id: string) => Promise<void>;
  showToast: (msg: string) => void;
}

export const CreativesTab: React.FC<CreativesTabProps> = ({
  userProfile,
  designProjects,
  designFolders,
  channels,
  folderFilter,
  setFolderFilter,
  onOpenNewProjectModal,
  onSelectProjectForDetail,
  onSelectProjectForApproval,
  onEditProject,
  onPostProject,
  onOpenChatForProject,
  onDeleteProject,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [postFilter, setPostFilter] = useState<string>('todos');
  const [channelFilter, setChannelFilter] = useState<string>('todos');
  const [designerFilter, setDesignerFilter] = useState<string>('todos');

  // Active slide tracker per card
  const [cardSlideIndex, setCardSlideIndex] = useState<{ [id: string]: number }>({});

  // Unique list of designers for filter dropdown
  const uniqueDesigners = useMemo(() => {
    const set = new Set<string>();
    designProjects.forEach((p) => {
      if (p.assignedTo) set.add(p.assignedTo);
    });
    return Array.from(set);
  }, [designProjects]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return designProjects.filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.copyText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.hashtags && p.hashtags.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'todos' || p.status === statusFilter;
      const matchesPost =
        postFilter === 'todos' ||
        (postFilter === 'postado' && p.postStatus === 'postado') ||
        (postFilter === 'agendado' && p.postStatus === 'agendado') ||
        (postFilter === 'nao_postado' && (!p.postStatus || p.postStatus === 'nao_postado'));

      const matchesChannel = channelFilter === 'todos' || p.channel === channelFilter;
      const matchesFolder = folderFilter === 'todas' || p.folderId === folderFilter;
      const matchesDesigner = designerFilter === 'todos' || p.assignedTo === designerFilter;

      return matchesSearch && matchesStatus && matchesPost && matchesChannel && matchesFolder && matchesDesigner;
    });
  }, [designProjects, searchQuery, statusFilter, postFilter, channelFilter, folderFilter, designerFilter]);

  const renderStatusBadge = (p: DesignProject) => {
    if (p.postStatus === 'postado') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-neutral-900 text-white border border-white">
          <CheckCircle2 className="w-3 h-3" /> Postado
        </span>
      );
    }
    if (p.postStatus === 'agendado') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-neutral-900 text-neutral-300 border border-neutral-700">
          <Calendar className="w-3 h-3" /> Agendado
        </span>
      );
    }

    switch (p.status) {
      case 'aprovado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-neutral-900 text-white border border-neutral-600">
            <CheckCircle2 className="w-3 h-3" /> Aprovado
          </span>
        );
      case 'revisao':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900 text-neutral-300 border border-neutral-700">
            <Clock className="w-3 h-3" /> Em Revisão (Líder)
          </span>
        );
      case 'ajustes':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900 text-neutral-400 border border-neutral-800">
            <AlertTriangle className="w-3 h-3" /> Precisa Ajustes
          </span>
        );
      case 'entregue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900 text-white border border-neutral-700">
            <CheckCircle2 className="w-3 h-3" /> Pronto / Finalizado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900 text-neutral-400 border border-neutral-800">
            <Palette className="w-3 h-3" /> Em Produção
          </span>
        );
    }
  };

  const getImages = (p: DesignProject) => {
    if (p.images && p.images.length > 0) return p.images;
    if (p.imageUrl) return [p.imageUrl];
    return [];
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e0e0e] border border-neutral-800 p-4 sm:p-5 rounded-3xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por arte, legenda, empresa..."
              className="bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white w-56 sm:w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-white"
          >
            <option value="todos">Status: Todos</option>
            <option value="producao">Em Produção</option>
            <option value="revisao">Em Revisão (Líder)</option>
            <option value="aprovado">Aprovados</option>
            <option value="ajustes">Precisa de Ajustes</option>
            <option value="entregue">Prontos</option>
          </select>

          <select
            value={postFilter}
            onChange={(e) => setPostFilter(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-white"
          >
            <option value="todos">Postagem: Todas</option>
            <option value="postado">✅ Postados</option>
            <option value="agendado">📅 Agendados</option>
            <option value="nao_postado">⏳ Não Postados</option>
          </select>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-white"
          >
            <option value="todos">Formato: Todos</option>
            {channels.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>

          {uniqueDesigners.length > 0 && (
            <select
              value={designerFilter}
              onChange={(e) => setDesignerFilter(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-white"
            >
              <option value="todos">Funcionário: Todos</option>
              {uniqueDesigners.map((d) => (
                <option key={d} value={d}>
                  👤 {d}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={onOpenNewProjectModal}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Cadastrar Novo Design</span>
        </button>
      </div>

      {/* Grid of Creatives / Posts */}
      {filteredProjects.length === 0 ? (
        <div className="bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-12 text-center text-neutral-400 space-y-3">
          <Palette className="w-12 h-12 mx-auto text-neutral-600" />
          <h4 className="text-base font-bold text-white">Nenhum criativo encontrado</h4>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Cadastre um novo design, anexe várias imagens para criar um carrossel, preencha a legenda e envie para aprovação ou postagem.
          </p>
          <button
            onClick={onOpenNewProjectModal}
            className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs cursor-pointer shadow-md inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Cadastrar Agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProjects.map((project) => {
            const images = getImages(project);
            const activeIdx = cardSlideIndex[project.id] || 0;
            const currentImg = images[activeIdx] || images[0];

            return (
              <div
                key={project.id}
                className="bg-[#0e0e0e] border border-neutral-800 hover:border-neutral-700 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between transition-all group"
              >
                {/* Visual Image / Carousel Header */}
                <div className="relative aspect-4/5 bg-neutral-950 overflow-hidden">
                  {currentImg ? (
                    <img
                      src={currentImg}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 gap-2">
                      <ImageIcon className="w-10 h-10 opacity-40 text-white" />
                      <span className="text-[11px]">Sem imagem anexada</span>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 pointer-events-none">
                    <div className="pointer-events-auto">
                      {renderStatusBadge(project)}
                    </div>

                    {images.length > 1 && (
                      <div className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-neutral-700 text-[10px] font-black text-white flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>{images.length} Imagens (Carrossel)</span>
                      </div>
                    )}
                  </div>

                  {/* Carousel Left / Right Arrows on Hover */}
                  {images.length > 1 && (
                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCardSlideIndex((prev) => ({
                            ...prev,
                            [project.id]: activeIdx === 0 ? images.length - 1 : activeIdx - 1,
                          }));
                        }}
                        className="w-7 h-7 rounded-full bg-black/80 hover:bg-white hover:text-black text-white border border-neutral-700 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCardSlideIndex((prev) => ({
                            ...prev,
                            [project.id]: activeIdx === images.length - 1 ? 0 : activeIdx + 1,
                          }));
                        }}
                        className="w-7 h-7 rounded-full bg-black/80 hover:bg-white hover:text-black text-white border border-neutral-700 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Quick Action Overlay On Click */}
                  <div
                    onClick={() => onSelectProjectForDetail(project)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                  >
                    <div className="px-3.5 py-1.5 rounded-xl bg-white text-black font-black text-xs flex items-center gap-1.5 shadow-xl">
                      <Eye className="w-3.5 h-3.5" /> Ver Detalhes
                    </div>
                  </div>

                  {/* Channel Tag at Bottom of Image */}
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[10px] font-bold text-neutral-300 border border-neutral-800">
                    {project.channel}
                  </div>
                </div>

                {/* Card Content Info */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-neutral-400 block truncate">
                      🏢 {project.clientName}
                    </span>
                    <h4
                      onClick={() => onSelectProjectForDetail(project)}
                      className="text-xs font-black text-white hover:text-neutral-300 cursor-pointer line-clamp-1"
                    >
                      {project.title}
                    </h4>

                    {project.copyText && (
                      <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                        {project.copyText}
                      </p>
                    )}
                  </div>

                  {/* Metadata Row */}
                  <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="truncate">👤 {project.assignedTo || 'Designer'}</span>
                    <span>v{project.version}</span>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-2 border-t border-neutral-900 grid grid-cols-4 gap-1.5">
                    {/* View Details */}
                    <button
                      onClick={() => onSelectProjectForDetail(project)}
                      title="Ver Detalhes e Carrossel"
                      className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Project (Role-Controlled) */}
                    {canUserEditDesigns(userProfile, userProfile?.email) ? (
                      <button
                        onClick={() => onEditProject && onEditProject(project)}
                        title="Editar Arte e Imagens"
                        className="p-2 rounded-xl bg-neutral-900 hover:bg-white hover:text-black text-neutral-200 border border-neutral-800 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="p-2 rounded-xl bg-neutral-950 opacity-40 border border-neutral-900 flex items-center justify-center cursor-not-allowed">
                        <Edit3 className="w-3.5 h-3.5 text-neutral-600" />
                      </div>
                    )}

                    {/* Post / Publish (Role-Controlled) */}
                    {canUserPublishPosts(userProfile, userProfile?.email) ? (
                      <button
                        onClick={() => onPostProject && onPostProject(project)}
                        title="Postar / Publicar nas Redes"
                        className="p-2 rounded-xl bg-neutral-900 hover:bg-white hover:text-black text-neutral-200 border border-neutral-800 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="p-2 rounded-xl bg-neutral-950 opacity-40 border border-neutral-900 flex items-center justify-center cursor-not-allowed">
                        <Send className="w-3.5 h-3.5 text-neutral-600" />
                      </div>
                    )}

                    {/* Chat */}
                    <button
                      onClick={() => onOpenChatForProject(project.id)}
                      title="Abrir Chat da Arte"
                      className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

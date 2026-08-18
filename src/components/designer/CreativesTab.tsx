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
} from 'lucide-react';
import {
  DesignProject,
  DesignFolder,
  DesignStatus,
  DesignChannel,
} from '../../types';

interface CreativesTabProps {
  designProjects: DesignProject[];
  designFolders: DesignFolder[];
  channels: DesignChannel[];
  folderFilter: string;
  setFolderFilter: (f: string) => void;
  onOpenNewProjectModal: () => void;
  onSelectProjectForDetail: (p: DesignProject) => void;
  onSelectProjectForApproval: (p: DesignProject) => void;
  onOpenChatForProject: (projectId: string) => void;
  onDeleteProject?: (id: string) => Promise<void>;
  showToast: (msg: string) => void;
}

export const CreativesTab: React.FC<CreativesTabProps> = ({
  designProjects,
  designFolders,
  channels,
  folderFilter,
  setFolderFilter,
  onOpenNewProjectModal,
  onSelectProjectForDetail,
  onSelectProjectForApproval,
  onOpenChatForProject,
  onDeleteProject,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [channelFilter, setChannelFilter] = useState<string>('todos');
  const [designerFilter, setDesignerFilter] = useState<string>('todos');

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
      const matchesChannel = channelFilter === 'todos' || p.channel === channelFilter;
      const matchesFolder = folderFilter === 'todas' || p.folderId === folderFilter;
      const matchesDesigner = designerFilter === 'todos' || p.assignedTo === designerFilter;

      return matchesSearch && matchesStatus && matchesChannel && matchesFolder && matchesDesigner;
    });
  }, [designProjects, searchQuery, statusFilter, channelFilter, folderFilter, designerFilter]);

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

  return (
    <div className="space-y-5">
      {/* Filter Bar */}
      <div className="bg-[#0e111a] border border-[#1c2234] rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        <div className="flex-1 flex flex-wrap items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar arte, empresa, legenda ou hashtag..."
              className="w-full bg-[#161a28] border border-[#283148] rounded-xl pl-9 pr-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#161a28] border border-[#283148] rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-[#22c55e]"
          >
            <option value="todos">Todos os Status</option>
            <option value="producao">Em Produção</option>
            <option value="revisao">Em Revisão (Líder)</option>
            <option value="aprovado">Aprovados</option>
            <option value="ajustes">Precisa de Ajustes</option>
            <option value="entregue">Entregues</option>
          </select>

          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="bg-[#161a28] border border-[#283148] rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-[#22c55e]"
          >
            <option value="todos">Todos os Formatos</option>
            {channels.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>

          {/* Folder / Company Filter */}
          <select
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
            className="bg-[#161a28] border border-[#283148] rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-[#22c55e]"
          >
            <option value="todas">Todas as Pastas / Clientes</option>
            {designFolders.map((f) => (
              <option key={f.id} value={f.id}>
                📁 {f.name} ({f.clientName})
              </option>
            ))}
          </select>

          {/* Designer Filter */}
          {uniqueDesigners.length > 0 && (
            <select
              value={designerFilter}
              onChange={(e) => setDesignerFilter(e.target.value)}
              className="bg-[#161a28] border border-[#283148] rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-[#22c55e]"
            >
              <option value="todos">Todos os Designers</option>
              {uniqueDesigners.map((d) => (
                <option key={d} value={d}>
                  👤 {d}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Clear filters or count */}
        <div className="flex items-center gap-2 justify-end">
          <span className="text-gray-400 text-xs font-mono">
            {filteredProjects.length} de {designProjects.length} artes
          </span>
          {(statusFilter !== 'todos' ||
            channelFilter !== 'todos' ||
            folderFilter !== 'todas' ||
            designerFilter !== 'todos' ||
            searchQuery !== '') && (
            <button
              onClick={() => {
                setStatusFilter('todos');
                setChannelFilter('todos');
                setFolderFilter('todas');
                setDesignerFilter('todos');
                setSearchQuery('');
              }}
              className="px-2 py-1 text-[11px] text-[#22c55e] hover:underline font-bold cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-[#0c0e16] border border-[#1a1f2e] rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#141824] border border-[#22293d] flex items-center justify-center mx-auto text-gray-400">
            <Palette className="w-8 h-8 text-[#22c55e]" />
          </div>
          <h3 className="text-base font-bold text-white">Nenhum criativo cadastrado ainda</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Sua esteira de design está limpa. Clique no botão abaixo para adicionar a primeira arte ou aguarde os briefings de clientes.
          </p>
          <button
            onClick={onOpenNewProjectModal}
            className="px-4 py-2 rounded-xl bg-[#22c55e] text-black font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#22c55e]/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Criar Primeiro Criativo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-[#0e111a] border border-[#1b2030] hover:border-[#2e3750] rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col group relative"
            >
              {/* Image Preview Container */}
              <div
                onClick={() => onSelectProjectForDetail(project)}
                className="relative aspect-[4/3] bg-[#080a10] overflow-hidden cursor-pointer"
              >
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                    <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-[11px]">Sem imagem anexada</span>
                  </div>
                )}

                {/* Badges on Top of Image */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
                  <div className="pointer-events-auto">
                    {renderStatusBadge(project.status, project.approved)}
                  </div>

                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-black/70 backdrop-blur-sm text-gray-300 border border-white/10">
                    v{project.version}
                  </span>
                </div>

                {/* Channel & Dimension Pill */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-bold text-white pointer-events-none">
                  <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-white/10">
                    {project.channel}
                  </span>
                  {project.dimensions && (
                    <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-white/10 font-mono text-gray-300">
                      {project.dimensions}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-400 truncate max-w-[170px]">
                      🏢 {project.clientName}
                    </span>
                    {project.folderName && (
                      <span className="text-[10px] text-gray-400 font-mono truncate max-w-[100px]">
                        📁 {project.folderName}
                      </span>
                    )}
                  </div>

                  <h4
                    onClick={() => onSelectProjectForDetail(project)}
                    className="text-sm font-bold text-white group-hover:text-[#22c55e] transition-colors line-clamp-2 cursor-pointer"
                  >
                    {project.title}
                  </h4>

                  {/* Copy preview snippet */}
                  {project.copyText && (
                    <p className="text-[11px] text-gray-400 line-clamp-2 italic bg-[#121522] p-2 rounded-lg border border-[#1e2538]">
                      "{project.copyText}"
                    </p>
                  )}
                </div>

                {/* Footer Metadata & Action Buttons */}
                <div className="pt-2.5 border-t border-[#1a1f2e] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                      <strong className="text-gray-200">{project.assignedTo}</strong>
                    </span>
                    {project.deadline && (
                      <span className="font-mono text-gray-400 text-[10px]">
                        Prazo: {project.deadline}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectProjectForDetail(project)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1f2538] text-gray-300 hover:text-white border border-[#252c40] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Ver Imagem e Legenda Completa"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#22c55e]" />
                        <span>Ver Arte</span>
                      </button>

                      <button
                        onClick={() => onOpenChatForProject(project.id)}
                        className="p-1.5 rounded-lg bg-[#141824] hover:bg-[#1f2538] text-gray-300 hover:text-white border border-[#252c40] cursor-pointer transition-colors"
                        title="Abrir Chat do Design"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onSelectProjectForApproval(project)}
                        className="p-1.5 rounded-lg bg-[#16291a] hover:bg-[#1e3b25] text-[#22c55e] border border-[#22c55e]/40 cursor-pointer transition-colors"
                        title="Avaliação & Aprovação da Líder"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>

                      {onDeleteProject && (
                        <button
                          onClick={async () => {
                            if (window.confirm(`Deseja excluir a arte "${project.title}"?`)) {
                              await onDeleteProject(project.id);
                              showToast(`Arte "${project.title}" excluída.`);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 cursor-pointer transition-colors"
                          title="Excluir Arte"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

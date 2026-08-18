import React from 'react';
import {
  Folder,
  Plus,
  Trash2,
  ChevronRight,
  FolderPlus,
} from 'lucide-react';
import { DesignFolder, DesignProject } from '../../types';

interface FoldersTabProps {
  designFolders: DesignFolder[];
  designProjects: DesignProject[];
  onOpenNewFolderModal: () => void;
  onSelectFolder: (folderId: string) => void;
  onRequestDeleteFolder: (folder: DesignFolder) => void;
}

export const FoldersTab: React.FC<FoldersTabProps> = ({
  designFolders,
  designProjects,
  onOpenNewFolderModal,
  onSelectFolder,
  onRequestDeleteFolder,
}) => {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e111a] border border-[#1b2030] p-5 rounded-2xl">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-amber-400" />
            Pastas de Empresas, Clientes & Canais
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Organize todos os designs por empresa, canal de publicação ou campanha. Você pode criar novas pastas ou apagá-las totalmente a qualquer momento.
          </p>
        </div>
        <button
          onClick={onOpenNewFolderModal}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-black text-xs flex items-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-amber-600/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Criar Nova Pasta
        </button>
      </div>

      {/* Grid of Folders */}
      {designFolders.length === 0 ? (
        <div className="bg-[#0c0e16] border border-[#1a1f2e] rounded-3xl p-10 text-center space-y-3">
          <FolderPlus className="w-10 h-10 text-gray-500 mx-auto" />
          <h4 className="text-sm font-bold text-white">Nenhuma pasta cadastrada no momento</h4>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Sua organização de pastas está limpa. Crie pastas dedicadas para cada cliente ou canal para organizar os criativos.
          </p>
          <button
            onClick={onOpenNewFolderModal}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-black text-xs inline-flex items-center gap-1.5 cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Criar Primeira Pasta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {designFolders.map((folder) => {
            const countInFolder = designProjects.filter((p) => p.folderId === folder.id).length;
            return (
              <div
                key={folder.id}
                className="bg-[#0e111a] border border-[#1b2030] hover:border-amber-500/50 rounded-2xl p-5 space-y-3 transition-all hover:scale-[1.01] group relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div
                      onClick={() => onSelectFolder(folder.id)}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer"
                      style={{ backgroundColor: `${folder.color}20`, color: folder.color }}
                    >
                      <Folder className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-white">
                        {countInFolder} artes
                      </span>

                      {/* Delete folder button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestDeleteFolder(folder);
                        }}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-800/40 hover:border-red-600 cursor-pointer transition-colors"
                        title="Apagar Pasta Totalmente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div
                    onClick={() => onSelectFolder(folder.id)}
                    className="cursor-pointer mt-3"
                  >
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      {folder.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">🏢 {folder.clientName}</p>
                  </div>
                </div>

                <div
                  onClick={() => onSelectFolder(folder.id)}
                  className="pt-2 border-t border-[#1a1f2e] flex items-center justify-between text-[11px] text-gray-400 cursor-pointer"
                >
                  <span className="px-2 py-0.5 rounded-md bg-[#161a28]">{folder.category}</span>
                  <span className="text-[#22c55e] font-bold flex items-center gap-0.5">
                    Abrir <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

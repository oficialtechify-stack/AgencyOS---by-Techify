import React from 'react';
import {
  Palette,
  Folder,
  Plus,
  FileText,
  Package,
  MessageSquare,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  Wand2,
} from 'lucide-react';
import { DesignProject, DesignFolder, DesignBriefingDemand, DesignPackage, DesignComment } from '../../types';
import { FirestoreUserProfile } from '../../lib/firebase';

interface DesignerHeaderProps {
  userProfile: FirestoreUserProfile | null;
  activeTab: 'canva' | 'criativos' | 'briefings' | 'pastas' | 'pacotes' | 'mensagens';
  setActiveTab: (tab: 'canva' | 'criativos' | 'briefings' | 'pastas' | 'pacotes' | 'mensagens') => void;
  stats: {
    total: number;
    producao: number;
    revisao: number;
    aprovados: number;
    ajustes: number;
    briefingsPendentes: number;
  };
  designProjectsCount: number;
  designBriefingsCount: number;
  designFoldersCount: number;
  designPackagesCount: number;
  designCommentsCount: number;
  onOpenNewProjectModal: () => void;
  onOpenClearAllModal: () => void;
}

export const DesignerHeader: React.FC<DesignerHeaderProps> = ({
  userProfile,
  activeTab,
  setActiveTab,
  stats,
  designProjectsCount,
  designBriefingsCount,
  designFoldersCount,
  designPackagesCount,
  designCommentsCount,
  onOpenNewProjectModal,
  onOpenClearAllModal,
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

  const hasAnyData =
    designProjectsCount > 0 ||
    designBriefingsCount > 0 ||
    designFoldersCount > 0 ||
    designPackagesCount > 0 ||
    designCommentsCount > 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Palette className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Hub do Designer & Studio Criativo
              </h2>
            </div>
            <p className="text-xs text-neutral-400 max-w-2xl">
              Crie artes completas no <strong>Studio Canva integrado</strong>, gerencie a esteira de produção visual, aprovação por líderes, pastas de clientes e entrega de pacotes.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setActiveTab('canva')}
              className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                activeTab === 'canva'
                  ? 'bg-blue-600 text-white shadow-blue-600/30'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Abrir Studio Canva</span>
            </button>

            {hasAnyData && (
              <button
                onClick={onOpenClearAllModal}
                className="px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                title="Apagar dados e deixar o painel limpo"
              >
                <Trash2 className="w-4 h-4 text-neutral-400" />
                <span>Limpar Painel</span>
              </button>
            )}

            <button
              onClick={onOpenNewProjectModal}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Novo Criativo / Upload</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-neutral-800">
          <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl">
            <div className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Total de Artes</div>
            <div className="text-xl font-black text-white mt-1">{stats.total}</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl">
            <div className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Em Produção</div>
            <div className="text-xl font-black text-white mt-1">{stats.producao}</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl">
            <div className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Aguardando Líder</div>
            <div className="text-xl font-black text-white mt-1">{stats.revisao}</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl">
            <div className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Aprovados</div>
            <div className="text-xl font-black text-white mt-1">{stats.aprovados}</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl">
            <div className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Ajustes</div>
            <div className="text-xl font-black text-white mt-1">{stats.ajustes}</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl">
            <div className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Briefings Pendentes</div>
            <div className="text-xl font-black text-white mt-1">{stats.briefingsPendentes}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Sticky & Isolated Scrolling) */}
      <div className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-md py-2.5 -mx-1 px-1 border-b border-neutral-800/80">
        <div className="flex items-center gap-2 overflow-x-auto overscroll-x-contain scrollbar-none py-0.5">
          {/* Dedicated Canva Studio Tab */}
          <button
            onClick={() => setActiveTab('canva')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'canva'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-blue-400 hover:text-white hover:bg-neutral-900 border border-blue-900/40 hover:border-blue-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>🎨 Studio Canva (Editor Completo)</span>
          </button>

          <button
            onClick={() => setActiveTab('criativos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'criativos'
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Mural de Criativos & Artes ({designProjectsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('briefings')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'briefings'
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Demandas do Executivo ({designBriefingsCount})</span>
            {stats.briefingsPendentes > 0 && (
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                activeTab === 'briefings' ? 'bg-black text-white' : 'bg-neutral-800 text-white'
              }`}>
                {stats.briefingsPendentes}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('pastas')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'pastas'
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Pastas por Empresa ({designFoldersCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('pacotes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'pacotes'
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Entrega de Pacotes ({designPackagesCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('mensagens')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'mensagens'
                ? 'bg-white text-black shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat & Ajustes ({designCommentsCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

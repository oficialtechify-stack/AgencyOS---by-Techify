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
} from 'lucide-react';
import { DesignProject, DesignFolder, DesignBriefingDemand, DesignPackage, DesignComment } from '../../types';
import { FirestoreUserProfile } from '../../lib/firebase';

interface DesignerHeaderProps {
  userProfile: FirestoreUserProfile | null;
  activeTab: 'criativos' | 'briefings' | 'pastas' | 'pacotes' | 'mensagens';
  setActiveTab: (tab: 'criativos' | 'briefings' | 'pastas' | 'pacotes' | 'mensagens') => void;
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
      <div className="bg-[#0e111a] border border-[#1b2030] rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#22c55e]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
                <Palette className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Hub do Designer & Produção Criativa
              </h2>
            </div>
            <p className="text-xs text-gray-400 max-w-2xl">
              Esteira de produção visual, aprovação por líderes, pastas por empresa, entrega de pacotes e gestão de briefings de executivos.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {hasAnyData && (
              <button
                onClick={onOpenClearAllModal}
                className="px-3.5 py-2.5 rounded-xl bg-[#161a28] hover:bg-red-950/50 text-gray-300 hover:text-red-400 border border-[#283148] hover:border-red-800/60 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                title="Apagar dados e deixar o painel limpo"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Limpar / Zerar Painel</span>
              </button>
            )}

            <button
              onClick={onOpenNewProjectModal}
              className="px-5 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#1eb054] text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-[#22c55e]/25 hover:scale-105 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Novo Criativo / Arte</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-[#1e263a]">
          <div className="bg-[#121624]/80 border border-[#1e2438] p-3 rounded-2xl">
            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Total de Artes</div>
            <div className="text-xl font-black text-white mt-1">{stats.total}</div>
          </div>
          <div className="bg-[#121624]/80 border border-[#1e2438] p-3 rounded-2xl">
            <div className="text-[11px] text-blue-400 font-bold uppercase tracking-wider">Em Produção</div>
            <div className="text-xl font-black text-blue-400 mt-1">{stats.producao}</div>
          </div>
          <div className="bg-[#121624]/80 border border-[#1e2438] p-3 rounded-2xl">
            <div className="text-[11px] text-yellow-400 font-bold uppercase tracking-wider">Aguardando Líder</div>
            <div className="text-xl font-black text-yellow-400 mt-1">{stats.revisao}</div>
          </div>
          <div className="bg-[#121624]/80 border border-[#1e2438] p-3 rounded-2xl">
            <div className="text-[11px] text-[#22c55e] font-bold uppercase tracking-wider">Aprovados ✅</div>
            <div className="text-xl font-black text-[#22c55e] mt-1">{stats.aprovados}</div>
          </div>
          <div className="bg-[#121624]/80 border border-[#1e2438] p-3 rounded-2xl">
            <div className="text-[11px] text-red-400 font-bold uppercase tracking-wider">Ajustes ⚠️</div>
            <div className="text-xl font-black text-red-400 mt-1">{stats.ajustes}</div>
          </div>
          <div className="bg-[#121624]/80 border border-[#1e2438] p-3 rounded-2xl">
            <div className="text-[11px] text-purple-400 font-bold uppercase tracking-wider">Briefings Pendentes</div>
            <div className="text-xl font-black text-purple-400 mt-1">{stats.briefingsPendentes}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1b2030] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('criativos')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'criativos'
              ? 'bg-[#22c55e] text-black shadow-md shadow-[#22c55e]/20'
              : 'text-gray-400 hover:text-white hover:bg-[#151928]'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Mural de Criativos & Artes ({designProjectsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('briefings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'briefings'
              ? 'bg-[#22c55e] text-black shadow-md shadow-[#22c55e]/20'
              : 'text-gray-400 hover:text-white hover:bg-[#151928]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Demandas do Executivo ({designBriefingsCount})</span>
          {stats.briefingsPendentes > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
              {stats.briefingsPendentes}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('pastas')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'pastas'
              ? 'bg-[#22c55e] text-black shadow-md shadow-[#22c55e]/20'
              : 'text-gray-400 hover:text-white hover:bg-[#151928]'
          }`}
        >
          <Folder className="w-4 h-4" />
          <span>Pastas por Empresa ({designFoldersCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('pacotes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'pacotes'
              ? 'bg-[#22c55e] text-black shadow-md shadow-[#22c55e]/20'
              : 'text-gray-400 hover:text-white hover:bg-[#151928]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Entrega de Pacotes ({designPackagesCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('mensagens')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'mensagens'
              ? 'bg-[#22c55e] text-black shadow-md shadow-[#22c55e]/20'
              : 'text-gray-400 hover:text-white hover:bg-[#151928]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat & Ajustes ({designCommentsCount})</span>
        </button>
      </div>
    </div>
  );
};

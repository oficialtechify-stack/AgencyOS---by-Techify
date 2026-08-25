import React, { useState } from 'react';
import {
  Target,
  FileText,
  Package,
} from 'lucide-react';
import {
  ProspectionDemand,
  ProspectionClosedContract,
  TechifyPackageOption,
  UserProfile,
} from '../types';
import { ProspectionDemandsTab } from '../components/prospection/ProspectionDemandsTab';
import { ProspectionContractsTab } from '../components/prospection/ProspectionContractsTab';
import { ProspectionCatalogTab } from '../components/prospection/ProspectionCatalogTab';

interface ProspectionViewProps {
  demands: ProspectionDemand[];
  contracts: ProspectionClosedContract[];
  packages?: TechifyPackageOption[];
  currentUser?: UserProfile | null;
  onAddDemand: (demand: Omit<ProspectionDemand, 'id' | 'createdAt'>) => void;
  onUpdateDemand: (id: string, updatedData: Partial<ProspectionDemand>) => void;
  onDeleteDemand: (id: string) => void;
  onClaimDemand: (id: string) => void;
  onAddContract: (contract: Omit<ProspectionClosedContract, 'id' | 'createdAt'>) => void;
  onUpdateContract: (id: string, updatedData: Partial<ProspectionClosedContract>) => void;
  onDeleteContract: (id: string) => void;
  onSavePackage?: (pkg: TechifyPackageOption) => void;
  onDeletePackage?: (id: string) => void;
  onShareInChat?: (pkg: TechifyPackageOption) => void;
}

export const ProspectionView: React.FC<ProspectionViewProps> = ({
  demands = [],
  contracts = [],
  packages = [],
  currentUser,
  onAddDemand,
  onUpdateDemand,
  onDeleteDemand,
  onClaimDemand,
  onAddContract,
  onUpdateContract,
  onDeleteContract,
  onSavePackage = () => {},
  onDeletePackage = () => {},
  onShareInChat,
}) => {
  const [activeTab, setActiveTab] = useState<'demands' | 'contracts' | 'catalog'>('demands');
  const [sourceDemandForContract, setSourceDemandForContract] = useState<ProspectionDemand | null>(null);

  const pendingDemandsCount = demands.filter((d) => d.status === 'Pendente').length;
  const totalRevenue = contracts.reduce((sum, c) => sum + (c.dealValue || 0), 0);

  const handleConvertToContract = (demand: ProspectionDemand) => {
    setSourceDemandForContract(demand);
    setActiveTab('contracts');
  };

  const handleUseInDemand = (_packageName: string) => {
    setActiveTab('demands');
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Módulo Comercial & Prospecção Techify
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-[10px] font-black text-blue-400 uppercase tracking-wider">
                Vendas & Conversão
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Gestão de demandas comerciais, distribuição de leads por Instagram, esteira de fechamentos e acompanhamento de contratos em tempo real.
            </p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-neutral-400">Faturamento Fechado:</span>
            <strong className="text-emerald-400 font-black">
              R$ {totalRevenue.toLocaleString('pt-BR')}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Module Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('demands')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'demands'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Demandas de Prospecção</span>
          {pendingDemandsCount > 0 && (
            <span className="px-2 py-0.2 rounded-full bg-amber-400 text-black text-[10px] font-black">
              {pendingDemandsCount} abertas
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'contracts'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Contratos Fechados & Conversões</span>
          <span className="px-2 py-0.2 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
            {contracts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Catálogo de Pacotes Techify</span>
        </button>
      </div>

      {/* Tab 1: Demandas */}
      {activeTab === 'demands' && (
        <ProspectionDemandsTab
          demands={demands}
          currentUser={currentUser}
          onAddDemand={onAddDemand}
          onUpdateDemand={onUpdateDemand}
          onDeleteDemand={onDeleteDemand}
          onClaimDemand={onClaimDemand}
          onConvertToContract={handleConvertToContract}
        />
      )}

      {/* Tab 2: Contratos Fechados */}
      {activeTab === 'contracts' && (
        <ProspectionContractsTab
          contracts={contracts}
          currentUser={currentUser}
          onAddContract={onAddContract}
          onUpdateContract={onUpdateContract}
          onDeleteContract={onDeleteContract}
          sourceDemand={sourceDemandForContract}
          onClearSourceDemand={() => setSourceDemandForContract(null)}
        />
      )}

      {/* Tab 3: Catálogo Oficial de Pacotes Techify com CRUD */}
      {activeTab === 'catalog' && (
        <ProspectionCatalogTab
          packages={packages}
          currentUser={currentUser}
          onSavePackage={onSavePackage}
          onDeletePackage={onDeletePackage}
          onUseInDemand={handleUseInDemand}
          onShareInChat={onShareInChat}
        />
      )}
    </div>
  );
};

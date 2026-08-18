import React from 'react';
import {
  Package,
  Plus,
  ExternalLink,
  Check,
  Trash2,
  PackagePlus,
} from 'lucide-react';
import { DesignPackage } from '../../types';

interface PackagesTabProps {
  designPackages: DesignPackage[];
  onOpenNewPackageModal: () => void;
  onUpdatePackage?: (id: string, data: Partial<DesignPackage>) => Promise<void>;
  onDeletePackage?: (id: string) => Promise<void>;
  showToast: (msg: string) => void;
}

export const PackagesTab: React.FC<PackagesTabProps> = ({
  designPackages,
  onOpenNewPackageModal,
  onUpdatePackage,
  onDeletePackage,
  showToast,
}) => {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e111a] border border-[#1b2030] p-5 rounded-2xl">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-400" />
            Entrega de Pacotes de Criativos
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Gerencie entregas em lote (Packs de posts, Criativos Meta Ads, etc.) com links do Drive, Figma e controle de status.
          </p>
        </div>
        <button
          onClick={onOpenNewPackageModal}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-purple-600/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Novo Pacote de Entrega
        </button>
      </div>

      {designPackages.length === 0 ? (
        <div className="bg-[#0c0e16] border border-[#1a1f2e] rounded-3xl p-10 text-center space-y-3">
          <PackagePlus className="w-10 h-10 text-gray-500 mx-auto" />
          <h4 className="text-sm font-bold text-white">Nenhum pacote de entrega registrado</h4>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Sua área de pacotes está limpa. Registre entregas em lote com links de pastas do Google Drive e arquivos do Figma.
          </p>
          <button
            onClick={onOpenNewPackageModal}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Registrar Primeiro Pacote
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {designPackages.map((pkg) => {
            const progress = Math.min(100, Math.round((pkg.deliveredCount / (pkg.itemsCount || 1)) * 100));
            return (
              <div
                key={pkg.id}
                className="bg-[#0e111a] border border-[#1b2030] rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-purple-400">🏢 {pkg.clientName}</span>
                      <h4 className="text-base font-black text-white mt-0.5">{pkg.packageName}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          pkg.status === 'Entregue' || pkg.status === 'Aprovado pelo Cliente'
                            ? 'bg-[#142816] text-[#22c55e] border border-[#22c55e]/40'
                            : 'bg-purple-950/70 text-purple-300 border border-purple-800/40'
                        }`}
                      >
                        {pkg.status}
                      </span>

                      {onDeletePackage && (
                        <button
                          onClick={async () => {
                            if (window.confirm(`Deseja excluir o pacote "${pkg.packageName}"?`)) {
                              await onDeletePackage(pkg.id);
                              showToast(`Pacote "${pkg.packageName}" excluído.`);
                            }
                          }}
                          className="p-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 cursor-pointer"
                          title="Excluir Pacote"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Progresso do Pacote:</span>
                      <span className="font-bold text-white font-mono">
                        {pkg.deliveredCount} de {pkg.itemsCount} artes concluídas ({progress}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#161a28] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-[#22c55e] rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {pkg.driveLink && (
                      <a
                        href={pkg.driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1f2538] border border-[#232b40] text-blue-400 font-bold flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Pasta Google Drive
                      </a>
                    )}
                    {pkg.figmaLink && (
                      <a
                        href={pkg.figmaLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1f2538] border border-[#232b40] text-pink-400 font-bold flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Arquivo Figma
                      </a>
                    )}
                  </div>

                  {pkg.notes && (
                    <p className="text-xs text-gray-300 bg-[#121522] p-2.5 rounded-xl border border-[#1e2538]">
                      {pkg.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#1a1f2e] flex items-center justify-between text-xs">
                  <span className="text-gray-400 text-[11px]">
                    Data limite de entrega: <strong className="text-white font-mono">{pkg.deliveryDate}</strong>
                  </span>

                  {pkg.status !== 'Entregue' && onUpdatePackage && (
                    <button
                      onClick={async () => {
                        await onUpdatePackage(pkg.id, {
                          status: 'Entregue',
                          deliveredCount: pkg.itemsCount,
                        });
                        showToast(`Pacote "${pkg.packageName}" marcado como Entregue!`);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#22c55e] text-black font-black text-xs hover:bg-[#1eb054] cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Marcar como Entregue
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Lock, ShieldAlert, ArrowLeft, Mail, ShieldCheck, Zap } from 'lucide-react';
import { ViewType } from '../types';
import { ALL_SYSTEM_MODULES } from '../lib/permissions';
import { FirestoreUserProfile } from '../lib/firebase';

interface LockedModuleViewProps {
  moduleId: ViewType;
  userProfile?: FirestoreUserProfile | null;
  onNavigateHome: () => void;
}

export const LockedModuleView: React.FC<LockedModuleViewProps> = ({
  moduleId,
  userProfile,
  onNavigateHome,
}) => {
  const currentModule = ALL_SYSTEM_MODULES.find((m) => m.id === moduleId) || {
    name: moduleId,
    description: 'Módulo do sistema AgencyOS',
    category: 'Módulo',
  };

  const allowedModulesList = userProfile?.allowedModules || [];
  const allowedNames = ALL_SYSTEM_MODULES.filter((m) =>
    allowedModulesList.includes(m.id)
  );

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden text-center space-y-6">
        {/* Lock Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white relative">
          <Lock className="w-10 h-10 stroke-[2.2]" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-neutral-950 border border-neutral-700 flex items-center justify-center">
            <ShieldAlert className="w-3.5 h-3.5 text-neutral-400" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs font-black uppercase tracking-wider">
            <span>Acesso Restrito</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Módulo {currentModule.name} Bloqueado
          </h2>

          <p className="text-neutral-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Seu usuário (<span className="text-white font-semibold">{userProfile?.email || 'atual'}</span>) não possui permissão concedida pelo administrador para visualizar ou operar este módulo.
          </p>
        </div>

        {/* Allowed Modules Summary */}
        {allowedNames.length > 0 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-left space-y-2">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
              <span>Módulos liberados para o seu perfil:</span>
              <span className="text-white font-black">{allowedNames.length} ativos</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {allowedNames.map((mod) => (
                <span
                  key={mod.id}
                  className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-white" />
                  {mod.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onNavigateHome}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            Voltar para o Dashboard
          </button>

          <a
            href="mailto:suporte@agencyos.com.br?subject=Solicitação%20de%20Acesso%20a%20Módulo%20AgencyOS"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Mail className="w-4 h-4 text-neutral-400" />
            Solicitar Acesso ao Admin
          </a>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Bell, Menu, X, Sparkles } from 'lucide-react';
import { SystemUpdate, ViewType } from '../types';
import { FirestoreUserProfile } from '../lib/firebase';
import { TrialCountdownWidget } from './TrialCountdownWidget';
import { ALL_SYSTEM_MODULES } from '../lib/permissions';

interface HeaderNavProps {
  title?: string;
  subtitle?: string;
  agencyName?: string;
  trialDaysRemaining?: number;
  activeView?: string;
  updates?: SystemUpdate[];
  userProfile?: FirestoreUserProfile | null;
  onOpenDocs: () => void;
  onOpenUpgradeModal?: () => void;
  onOpenAuthModal?: () => void;
  onToggleSidebar?: () => void;
}

const defaultUpdates: SystemUpdate[] = [
  {
    id: 'up-1',
    title: 'Hub do Designer & Produção Criativa',
    description: 'Esteira de design completa com aprovações da líder, legendas, pastas de empresas e entrega de pacotes.',
    date: '2026-03-01',
    version: 'v2.6',
    type: 'Novidade',
  },
  {
    id: 'up-2',
    title: 'Módulo Social Hub & Maps Scraper',
    description: 'Lançamento oficial da extração de leads do Google Maps e gerador de legendas com IA.',
    date: '2026-02-28',
    version: 'v2.5',
    type: 'Novidade',
  },
];

export const HeaderNav: React.FC<HeaderNavProps> = ({
  title,
  subtitle,
  agencyName,
  activeView,
  updates,
  userProfile,
  onOpenDocs: _onOpenDocs,
  onOpenUpgradeModal = () => {},
  onOpenAuthModal: _onOpenAuthModal = () => {},
  onToggleSidebar,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const updatesList = updates || defaultUpdates;

  // Resolve current module title and subtitle dynamically
  const currentModule = ALL_SYSTEM_MODULES.find((m) => m.id === activeView);
  const displayTitle = title || currentModule?.name || 'Dashboard Geral';
  const displaySubtitle = subtitle || currentModule?.description || 'Visão 360° da sua agência';

  return (
    <header className="h-16 border-b border-neutral-800 bg-[#0a0a0a] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 font-sans backdrop-blur-md">
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-700 transition-all cursor-pointer shrink-0"
            aria-label="Abrir Menu Lateral"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0 truncate">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight truncate">
              {displayTitle}
            </h1>
            {agencyName && (
              <span className="hidden xl:inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-900 text-neutral-300 border border-neutral-700">
                🏢 {agencyName}
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-neutral-400 font-normal leading-tight mt-0.5 truncate hidden sm:block">
            {displaySubtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Real-time 14-Day Trial Timer */}
        {userProfile && (
          <div className="hidden lg:block">
            <TrialCountdownWidget
              userProfile={userProfile}
              onOpenUpgradeModal={onOpenUpgradeModal}
            />
          </div>
        )}

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white transition-colors relative cursor-pointer"
            title="Atualizações do Sistema"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white" />
          </button>

          {/* Notifications Dropdown Popup */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-4 z-50 text-xs text-neutral-300 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-white" /> Atualizações da Plataforma
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {updatesList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white text-xs leading-snug">{item.title}</span>
                      <span className="text-[10px] font-bold text-white bg-neutral-800 px-1.5 py-0.5 rounded-md border border-neutral-700 shrink-0">
                        {item.version}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="text-[10px] text-neutral-500 font-mono pt-1">{item.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live status badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200">
          <span className="w-2 h-2 rounded-full bg-white shrink-0" />
          <span className="text-[11px] font-bold hidden sm:inline">Sistema online</span>
        </div>
      </div>
    </header>
  );
};

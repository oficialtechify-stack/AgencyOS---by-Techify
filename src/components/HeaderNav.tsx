import React, { useState } from 'react';
import { Bell, Menu, CheckCircle2, X } from 'lucide-react';
import { SystemUpdate } from '../types';
import { FirestoreUserProfile } from '../lib/firebase';
import { TrialCountdownWidget } from './TrialCountdownWidget';

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
    title: 'Versão 2.5 - Módulo Social Hub & Maps Scraper',
    description: 'Lançamento oficial da extração de leads do Google Maps e gerador de legendas com IA.',
    date: '2026-03-01',
    version: 'v2.5',
    type: 'Novidade',
  },
  {
    id: 'up-2',
    title: 'Otimização do Motor de IA (Gemini 3.6 Flash)',
    description: 'Respostas mais rápidas e análises financeiras mais profundas na IA Consultora.',
    date: '2026-02-28',
    version: 'v2.4',
    type: 'Melhoria',
  },
];

export const HeaderNav: React.FC<HeaderNavProps> = ({
  title = 'Dashboard Geral',
  subtitle = 'Visão 360° do seu negócio',
  agencyName: _agencyName,
  updates,
  userProfile,
  onOpenDocs: _onOpenDocs,
  onOpenUpgradeModal = () => {},
  onOpenAuthModal: _onOpenAuthModal = () => {},
  onToggleSidebar,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const updatesList = updates || defaultUpdates;

  return (
    <header className="h-16 border-b border-[#151822] bg-[#07080c] px-6 flex items-center justify-between sticky top-0 z-20 font-sans">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#12141d]"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 leading-tight">
            {title}
          </h1>
          <p className="text-xs text-gray-400 font-normal leading-tight mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
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
            className="p-2 rounded-lg bg-transparent text-gray-400 hover:text-white transition-colors relative cursor-pointer"
            title="Atualizações do Sistema"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown Popup */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0d0f17] border border-[#1e2332] rounded-xl shadow-2xl p-4 z-50 text-xs text-gray-300 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-[#1f2332] pb-2 mb-3">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-[#22c55e]" /> Atualizações do Sistema
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {updatesList.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-[#141824] border border-[#202738] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{item.title}</span>
                      <span className="text-[10px] font-bold text-[#22c55e] bg-[#1a3318] px-1.5 py-0.5 rounded">
                        {item.version}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="text-[9px] text-gray-500">{item.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live status badge: Green Dot + Sistema ativo */}
        <div className="flex items-center gap-2 pl-1">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] shrink-0" />
          <span className="text-xs font-medium text-gray-300">Sistema ativo</span>
        </div>
      </div>
    </header>
  );
};


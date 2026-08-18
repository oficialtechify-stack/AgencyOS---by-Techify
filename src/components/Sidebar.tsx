import React from 'react';
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Megaphone,
  Calendar,
  MapPin,
  Palette,
  Share2,
  Package,
  Kanban,
  FileText,
  Calculator,
  Bot,
  Shield,
  ShieldCheck,
  LogOut,
  Zap,
  ChevronRight,
  User as UserIcon,
  Lock,
} from 'lucide-react';
import { ViewMode, UserProfile } from '../types';
import { hasModuleAccess, isUserMasterAdmin } from '../lib/permissions';
import { FirestoreUserProfile } from '../lib/firebase';

interface SidebarProps {
  currentView?: ViewMode;
  activeView?: ViewMode;
  onNavigate?: (view: ViewMode) => void;
  onSelectView?: (view: ViewMode) => void;
  userProfile?: FirestoreUserProfile | UserProfile | null;
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  activeView,
  onNavigate,
  onSelectView,
  userProfile,
  onLogout,
  isOpen,
  onClose,
}) => {
  const active = activeView || currentView || 'dashboard';
  const handleNav = (view: ViewMode) => {
    if (onNavigate) onNavigate(view);
    else if (onSelectView) onSelectView(view);
    if (onClose) onClose();
  };

  const profile = userProfile || {
    name: 'Marcos Henrique',
    email: 'rickmarketing81@gmail.com',
    plan: 'Pro',
    status: 'active',
    createdAt: '2026-01-01',
  };

  const isMaster = isUserMasterAdmin(userProfile as any);
  const canAccessAdmin = hasModuleAccess('admin', userProfile as any);

  const handleExit = onLogout || (() => handleNav('landing'));

  const menuSections = [
    {
      title: 'PRINCIPAL',
      items: [{ id: 'dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      title: 'FINANCEIRO',
      items: [
        { id: 'kpis' as ViewMode, label: 'KPIs', icon: DollarSign },
        { id: 'fluxo-caixa' as ViewMode, label: 'Fluxo de Caixa', icon: TrendingUp },
      ],
    },
    {
      title: 'TRÁFEGO',
      items: [{ id: 'campanhas' as ViewMode, label: 'Campanhas', icon: Megaphone }],
    },
    {
      title: 'GESTÃO',
      items: [{ id: 'agenda' as ViewMode, label: 'Agenda', icon: Calendar }],
    },
    {
      title: 'PROSPECÇÃO',
      items: [{ id: 'maps-scraper' as ViewMode, label: 'Maps Scraper', icon: MapPin }],
    },
    {
      title: 'CRIAÇÃO & DESIGN',
      items: [
        { id: 'designer' as ViewMode, label: 'Área do Designer', icon: Palette },
        { id: 'social-hub' as ViewMode, label: 'Social Hub', icon: Share2 },
      ],
    },
    {
      title: 'ESTOQUE',
      items: [{ id: 'estoque' as ViewMode, label: 'Estoque', icon: Package }],
    },
    {
      title: 'PROJETOS',
      items: [
        { id: 'kanban' as ViewMode, label: 'Kanban', icon: Kanban },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-64 bg-[#07080c] border-r border-[#151822] flex flex-col h-screen sticky top-0 shrink-0 text-gray-300 font-sans select-none transition-all duration-200 ${
          isOpen ? 'fixed inset-y-0 left-0 z-50 shadow-2xl block' : 'hidden md:flex z-30'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 px-5 flex items-center justify-between border-b border-[#151822]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#22c55e] flex items-center justify-center text-black shadow-[0_0_15px_rgba(34,197,94,0.35)] shrink-0">
              <Zap className="w-5 h-5 fill-black text-black" />
            </div>
            <div>
              <div className="font-extrabold text-white text-base tracking-tight leading-none">
                AgencyOS
              </div>
              <div className="text-[9px] font-extrabold text-[#22c55e] tracking-wider uppercase mt-1">
                BY TECHIFY
              </div>
            </div>
          </div>

          {/* Close button on mobile drawer */}
          {isOpen && onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#151824] cursor-pointer"
            >
              <LogOut className="w-4 h-4 rotate-180" />
            </button>
          )}
        </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 custom-scrollbar">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1.5">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                const isAllowed = hasModuleAccess(item.id, userProfile as any);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    title={!isAllowed ? 'Módulo bloqueado pelo administrador' : undefined}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-[#152e18] text-[#22c55e] font-bold border border-[#22c55e]/40 shadow-[0_0_12px_rgba(34,197,94,0.15)]'
                        : isAllowed
                        ? 'text-gray-400 hover:text-white hover:bg-[#10131c] font-medium'
                        : 'text-gray-600 hover:text-gray-400 hover:bg-[#0c0e14] opacity-70 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? 'text-[#22c55e]'
                            : isAllowed
                            ? 'text-gray-400'
                            : 'text-gray-600'
                        }`}
                      />
                      <span
                        className={
                          isActive
                            ? 'text-[#22c55e]'
                            : isAllowed
                            ? 'text-gray-300'
                            : 'text-gray-500'
                        }
                      >
                        {item.label}
                      </span>
                    </div>

                    {isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 text-[#22c55e]" />
                    ) : !isAllowed ? (
                      <Lock className="w-3 h-3 text-gray-600" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Agency Badge & Admin Section */}
        <div className="pt-2 space-y-1">
          <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#142816] border border-[#22c55e]/50 text-xs font-bold text-[#22c55e]">
            <Shield className="w-3.5 h-3.5 text-[#22c55e]" />
            <span>Agency</span>
          </div>

          <button
            onClick={() => handleNav('admin')}
            title={!canAccessAdmin ? 'Painel restrito a administradores' : undefined}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
              active === 'admin'
                ? 'bg-[#152e18] text-[#22c55e] font-bold border border-[#22c55e]/40'
                : canAccessAdmin
                ? 'text-gray-400 hover:text-white hover:bg-[#10131c] font-medium'
                : 'text-gray-600 hover:text-gray-400 hover:bg-[#0c0e14] opacity-70 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className={`w-4 h-4 ${canAccessAdmin ? 'text-gray-400' : 'text-gray-600'}`} />
              <span>Admin — Assinaturas</span>
            </div>
            {!canAccessAdmin && <Lock className="w-3 h-3 text-gray-600" />}
          </button>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 px-4 border-t border-[#151822] bg-[#07080c] flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-[#142816] border border-[#22c55e]/40 flex items-center justify-center text-xs font-bold text-[#22c55e] shrink-0">
            <UserIcon className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate flex items-center gap-1">
              <span>{profile.name || 'Marcos Henrique'}</span>
              {isMaster && (
                <span className="text-[9px] bg-[#22c55e]/20 text-[#22c55e] px-1 rounded font-black">
                  ADMIN
                </span>
              )}
            </div>
            <div className="text-[10px] text-gray-400 truncate">
              {profile.email || 'rickmarketing81@gmail.com'}
            </div>
          </div>
        </div>
        <button
          onClick={handleExit}
          title="Sair / Encerrar Sessão"
          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-colors shrink-0 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
    </>
  );
};


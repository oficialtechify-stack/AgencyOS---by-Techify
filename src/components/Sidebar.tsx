import React, { useState } from 'react';
import {
  LayoutDashboard,
  Crown,
  Clock,
  DollarSign,
  TrendingUp,
  Megaphone,
  Target,
  Calendar,
  MapPin,
  Palette,
  Wand2,
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
  MessageSquare,
  UserCircle,
  Lock,
  Building2,
  Users,
  Folder,
  BarChart3,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { ViewMode, UserProfile } from '../types';
import { hasModuleAccess, isUserMasterAdmin, isCompanyOwnerOrCEO } from '../lib/permissions';
import { FirestoreUserProfile, cleanAvatarUrl, resolveUserAvatar } from '../lib/firebase';

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
  const [showMoreModules, setShowMoreModules] = useState(false);
  const active = activeView || currentView || 'dashboard';
  const handleNav = (view: ViewMode) => {
    if (onNavigate) onNavigate(view);
    else if (onSelectView) onSelectView(view);
    if (onClose) onClose();
  };

  const effectiveEmail = userProfile?.email || '';
  const isMaster = isUserMasterAdmin(userProfile, effectiveEmail);
  const isCompanyCEO = isCompanyOwnerOrCEO(userProfile, effectiveEmail);
  const canAccessAdmin = isMaster || isCompanyCEO || hasModuleAccess('admin', userProfile, effectiveEmail);

  const profile = userProfile || {
    name: 'Usuário',
    email: '',
    role: 'Membro',
    agencyName: 'AgencyOS',
  };

  const handleExit = onLogout || (() => handleNav('landing'));

  // Primary menu items matching screenshot exactly
  const primaryMenuItems = [
    { id: 'dashboard' as ViewMode, label: 'Visão geral', icon: LayoutDashboard },
    { id: 'prospection' as ViewMode, label: 'Clientes', icon: Users },
    { id: 'kanban' as ViewMode, label: 'Projetos', icon: Folder },
    { id: 'fluxo-caixa' as ViewMode, label: 'Financeiro', icon: DollarSign },
    { id: 'campanhas' as ViewMode, label: 'Campanhas', icon: BarChart3 },
    { id: 'lideranca' as ViewMode, label: 'Equipe', icon: Users },
    { id: 'relatorios' as ViewMode, label: 'Relatórios', icon: FileText },
    { id: 'profile' as ViewMode, label: 'Configurações', icon: Settings },
  ];

  // Secondary tools accessible in sub-list
  const extraModules = [
    { id: 'ia-consultora' as ViewMode, label: 'IA Consultora Gemini', icon: Bot },
    { id: 'maps-scraper' as ViewMode, label: 'Maps Scraper Leads', icon: MapPin },
    { id: 'social-hub' as ViewMode, label: 'Social Hub (Instagram/Zap)', icon: Share2 },
    { id: 'designer' as ViewMode, label: 'Área do Designer', icon: Palette },
    { id: 'ponto' as ViewMode, label: 'Ponto Seguro', icon: Clock },
    { id: 'marketing' as ViewMode, label: 'Funis & Lançamentos', icon: Target },
    { id: 'kpis' as ViewMode, label: 'KPIs Estratégicos', icon: TrendingUp },
    { id: 'agenda' as ViewMode, label: 'Agenda & Reuniões', icon: Calendar },
    { id: 'estoque' as ViewMode, label: 'Estoque de Recursos', icon: Package },
    { id: 'calculadora-roi' as ViewMode, label: 'Calculadora ROI', icon: Calculator },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-60 bg-[#080E21] border-r border-[#15234A] flex flex-col h-full shrink-0 text-slate-300 font-sans select-none transition-all duration-200 ${
          isOpen ? 'fixed inset-y-0 left-0 z-50 shadow-2xl block' : 'hidden md:flex z-20'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-[#15234A] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <span className="text-base font-black leading-none">▲</span>
            </div>
            <div>
              <div className="font-extrabold text-white text-lg tracking-tight leading-none">
                AgencyOS
              </div>
            </div>
          </div>

          {/* Close button on mobile drawer */}
          {isOpen && onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <LogOut className="w-4 h-4 rotate-180" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar">
          {primaryMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              active === item.id ||
              (item.id === 'prospection' && (active === 'maps-scraper' || active === 'prospection')) ||
              (item.id === 'fluxo-caixa' && active === 'kpis') ||
              (item.id === 'lideranca' && active === 'ponto') ||
              (item.id === 'profile' && active === 'admin');

            const isAllowed = hasModuleAccess(item.id, userProfile as any);

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                title={!isAllowed ? 'Módulo bloqueado pelo administrador' : undefined}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer group ${
                  isActive
                    ? 'bg-[#13244F] text-white font-semibold border border-blue-500/30 shadow-md shadow-blue-950/40'
                    : 'text-slate-400 hover:text-white hover:bg-[#0E1B3D]/70 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
              </button>
            );
          })}

          {/* Collapsible Advanced Modules */}
          <div className="pt-2 border-t border-[#15234A]/80">
            <button
              onClick={() => setShowMoreModules(!showMoreModules)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer rounded-lg hover:bg-[#0E1B3D]/50 transition-colors"
            >
              <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">
                Mais Ferramentas
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                  showMoreModules ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showMoreModules && (
              <div className="mt-1 space-y-1 pl-1">
                {extraModules.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#13244F] text-blue-300 font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-[#0E1B3D]/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Admin Panel Link */}
          {canAccessAdmin && (
            <div className="pt-1">
              <button
                onClick={() => handleNav('admin')}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                  active === 'admin'
                    ? 'bg-[#13244F] text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-[#0E1B3D]/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Painel Admin</span>
                </div>
                {isMaster && (
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-bold">
                    MASTER
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Promo Growth Card (Direct from Screenshot) */}
        <div className="p-3.5 mx-3 mb-3 bg-[#0B142B] border border-[#182955] rounded-2xl space-y-1.5 shrink-0 shadow-lg">
          <div className="w-7 h-7 rounded-lg bg-blue-900/40 border border-blue-700/40 flex items-center justify-center text-blue-400">
            <Crown className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xs font-bold text-white leading-tight">
            Seu crescimento em primeiro lugar.
          </div>
          <div className="text-[11px] text-slate-400 leading-snug">
            AgencyOS. Mais resultado para sua agência.
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 px-4 border-t border-[#15234A] bg-[#070D1E] flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleNav('profile')}
            className="flex items-center gap-2.5 overflow-hidden text-left hover:opacity-80 transition-opacity cursor-pointer group flex-1 mr-2"
            title="Ver Meu Perfil"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 border border-blue-400/30 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
              {resolveUserAvatar(profile) ? (
                <img
                  src={resolveUserAvatar(profile)}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                'AG'
              )}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1 group-hover:text-blue-300 transition-colors">
                <span>{profile.agencyName || 'Agência Demo'}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">Conta Principal</div>
            </div>
          </button>
          <button
            onClick={handleExit}
            title="Sair / Encerrar Sessão"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};

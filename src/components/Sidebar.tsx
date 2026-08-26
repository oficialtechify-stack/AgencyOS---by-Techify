import React from 'react';
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
      title: 'COMUNICAÇÃO & PESSOAS',
      items: [
        { id: 'chat' as ViewMode, label: 'Chat da Empresa', icon: MessageSquare },
        { id: 'profile' as ViewMode, label: 'Meu Perfil', icon: UserCircle },
        { id: 'ponto' as ViewMode, label: 'Ponto Seguro', icon: Clock },
      ],
    },
    {
      title: 'PRINCIPAL',
      items: [
        { id: 'dashboard' as ViewMode, label: 'Dashboard Geral', icon: LayoutDashboard },
        { id: 'lideranca' as ViewMode, label: 'Painel de Liderança', icon: Crown },
      ],
    },
    {
      title: 'FINANCEIRO',
      items: [
        { id: 'kpis' as ViewMode, label: 'KPIs', icon: DollarSign },
        { id: 'fluxo-caixa' as ViewMode, label: 'Fluxo de Caixa', icon: TrendingUp },
      ],
    },
    {
      title: 'TRÁFEGO & MARKETING',
      items: [
        { id: 'campanhas' as ViewMode, label: 'Campanhas', icon: Megaphone },
        { id: 'marketing' as ViewMode, label: 'Marketing & Lançamentos', icon: Target },
      ],
    },
    {
      title: 'PROSPECÇÃO & VENDAS',
      items: [
        { id: 'prospection' as ViewMode, label: 'Demandas & Catálogo', icon: Target },
        { id: 'maps-scraper' as ViewMode, label: 'Maps Scraper', icon: MapPin },
      ],
    },
    {
      title: 'CRIAÇÃO & DESIGN',
      items: [
        { id: 'studio-agency' as ViewMode, label: 'Studio Agency (Canva)', icon: Wand2 },
        { id: 'designer' as ViewMode, label: 'Área do Designer', icon: Palette },
        { id: 'social-hub' as ViewMode, label: 'Social Hub (Instagram & WhatsApp)', icon: Share2 },
      ],
    },
    {
      title: 'OPERAÇÕES & AGENDA',
      items: [
        { id: 'agenda' as ViewMode, label: 'Agenda', icon: Calendar },
        { id: 'estoque' as ViewMode, label: 'Estoque de Recursos', icon: Package },
        { id: 'kanban' as ViewMode, label: 'Kanban de Projetos', icon: Kanban },
        { id: 'relatorios' as ViewMode, label: 'Relatórios', icon: FileText },
      ],
    },
    {
      title: 'ESTRATÉGIA & IA',
      items: [
        { id: 'calculadora-roi' as ViewMode, label: 'Calculadora ROI', icon: Calculator },
        { id: 'ia-consultora' as ViewMode, label: 'IA Consultora', icon: Bot },
      ],
    },
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
        className={`w-64 bg-[#0a0a0a] border-r border-neutral-800 flex flex-col h-full shrink-0 text-neutral-300 font-sans select-none transition-all duration-200 ${
          isOpen ? 'fixed inset-y-0 left-0 z-50 shadow-2xl block' : 'hidden md:flex z-20'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 px-5 flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black shrink-0 font-black">
              <Zap className="w-4 h-4 fill-black text-black" />
            </div>
            <div>
              <div className="font-extrabold text-white text-base tracking-tight leading-none">
                AgencyOS
              </div>
              <div className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase mt-1">
                BY TECHIFY
              </div>
            </div>
          </div>

          {/* Close button on mobile drawer */}
          {isOpen && onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              <LogOut className="w-4 h-4 rotate-180" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 custom-scrollbar">
          {menuSections.map((section, idx) => (
            <div key={idx}>
              <div className="px-3 text-[10px] font-bold text-neutral-500 tracking-wider uppercase mb-1.5">
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
                          ? 'bg-white text-black font-extrabold shadow-sm'
                          : isAllowed
                          ? 'text-neutral-400 hover:text-white hover:bg-neutral-900 font-medium'
                          : 'text-neutral-600 hover:text-neutral-400 hover:bg-neutral-950 opacity-70 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive
                              ? 'text-black'
                              : isAllowed
                              ? 'text-neutral-400'
                              : 'text-neutral-600'
                          }`}
                        />
                        <span
                          className={
                            isActive
                              ? 'text-black'
                              : isAllowed
                              ? 'text-neutral-300'
                              : 'text-neutral-500'
                          }
                        >
                          {item.label}
                        </span>
                      </div>

                      {isActive ? (
                        <ChevronRight className="w-3.5 h-3.5 text-black" />
                      ) : !isAllowed ? (
                        <Lock className="w-3 h-3 text-neutral-600" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Agency Badge & Admin Section */}
          <div className="pt-2 space-y-1">
            <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-bold text-neutral-200">
              <Shield className="w-3.5 h-3.5 text-white" />
              <span>Agency</span>
            </div>

            <button
              onClick={() => handleNav('admin')}
              title={!canAccessAdmin ? 'Painel restrito a administradores' : undefined}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                active === 'admin'
                  ? 'bg-white text-black font-extrabold shadow-sm'
                  : canAccessAdmin
                  ? 'text-neutral-400 hover:text-white hover:bg-neutral-900 font-medium'
                  : 'text-neutral-600 hover:text-neutral-400 hover:bg-neutral-950 opacity-70 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className={`w-4 h-4 ${canAccessAdmin ? 'text-neutral-400' : 'text-neutral-600'}`} />
                <span>Admin — Assinaturas</span>
              </div>
              {!canAccessAdmin && <Lock className="w-3 h-3 text-neutral-600" />}
            </button>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 px-4 border-t border-neutral-800 bg-[#0a0a0a] flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleNav('profile')}
            className="flex items-center gap-2.5 overflow-hidden text-left hover:opacity-80 transition-opacity cursor-pointer group flex-1 mr-2"
            title="Ver Meu Perfil & Crachá Digital"
          >
            <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1 group-hover:text-purple-400 transition-colors">
                <span>{profile.name || 'Marcos Henrique'}</span>
                {isMaster && (
                  <span className="text-[9px] bg-white text-black px-1 rounded font-black">
                    ADMIN
                  </span>
                )}
              </div>
              <div className="text-[10px] text-neutral-400 truncate">
                {profile.email || 'rickmarketing81@gmail.com'}
              </div>
            </div>
          </button>
          <button
            onClick={handleExit}
            title="Sair / Encerrar Sessão"
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-md transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};

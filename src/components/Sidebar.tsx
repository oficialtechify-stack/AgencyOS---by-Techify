import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Bot,
  CalendarDays,
  Calculator,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Folder,
  LayoutDashboard,
  LogOut,
  MapPin,
  Megaphone,
  Package,
  Palette,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { ViewMode, UserProfile } from '../types';
import { hasModuleAccess, isCompanyOwnerOrCEO, isUserMasterAdmin } from '../lib/permissions';
import { FirestoreUserProfile, resolveUserAvatar } from '../lib/firebase';

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

type NavItem = {
  id: ViewMode;
  label: string;
  icon: LucideIcon;
  description?: string;
};

type NavigationGroup = {
  id: string;
  title: string;
  icon: LucideIcon;
  items: NavItem[];
};

// Navigation categories are about user tasks, not individual internal modules.
// Changing grouping must never change a route, stored record, or permission.
const navigationGroups: NavigationGroup[] = [
  {
    id: 'clientes',
    title: 'Clientes e vendas',
    icon: Users,
    items: [
      { id: 'prospection', label: 'Clientes e prospecção', icon: Users, description: 'Contatos, propostas e contratos' },
      { id: 'maps-scraper', label: 'Encontrar clientes', icon: MapPin, description: 'Buscar novos leads no Maps' },
      { id: 'agenda', label: 'Agenda e reuniões', icon: CalendarDays },
    ],
  },
  {
    id: 'operacao',
    title: 'Projetos e equipe',
    icon: Folder,
    items: [
      { id: 'kanban', label: 'Projetos e tarefas', icon: Folder },
      { id: 'lideranca', label: 'Equipe e liderança', icon: Users },
      { id: 'ponto', label: 'Registro de ponto', icon: Clock },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing e conteúdo',
    icon: Megaphone,
    items: [
      { id: 'campanhas', label: 'Campanhas de anúncios', icon: BarChart3 },
      { id: 'marketing', label: 'Estratégias e funis', icon: Target },
      { id: 'social-hub', label: 'Redes sociais', icon: Share2 },
      { id: 'designer', label: 'Designer e aprovações', icon: Palette },
    ],
  },
  {
    id: 'financeiro',
    title: 'Financeiro e resultados',
    icon: DollarSign,
    items: [
      { id: 'fluxo-caixa', label: 'Fluxo de caixa', icon: DollarSign },
      { id: 'kpis', label: 'Indicadores (KPIs)', icon: TrendingUp },
      { id: 'relatorios', label: 'Relatórios', icon: FileText },
      { id: 'calculadora-roi', label: 'Calculadora de ROI', icon: Calculator },
    ],
  },
  {
    id: 'ferramentas',
    title: 'IA e ferramentas',
    icon: Bot,
    items: [
      { id: 'ia-consultora', label: 'Consultora de IA', icon: Bot },
      { id: 'estoque', label: 'Estoque e recursos', icon: Package },
    ],
  },
  {
    id: 'conta',
    title: 'Conta e configurações',
    icon: Settings,
    items: [
      { id: 'profile', label: 'Meu perfil', icon: Settings },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  activeView,
  onNavigate,
  onSelectView,
  userProfile,
  onLogout,
  isOpen = false,
  onClose,
}) => {
  const active = activeView || currentView || 'dashboard';
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const email = userProfile?.email || '';
  const isMaster = isUserMasterAdmin(userProfile as FirestoreUserProfile | null, email);
  const canOpenAdmin =
    isMaster ||
    isCompanyOwnerOrCEO(userProfile as FirestoreUserProfile | null, email) ||
    hasModuleAccess('admin', userProfile as FirestoreUserProfile | null, email);

  const groups = useMemo(() => navigationGroups.map((group) => ({
    ...group,
    items: [
      ...group.items,
      ...(group.id === 'conta' && canOpenAdmin
        ? [{ id: 'admin' as ViewMode, label: 'Administração da empresa', icon: ShieldCheck }]
        : []),
    ].filter((item) => hasModuleAccess(item.id, userProfile as FirestoreUserProfile | null, email)),
  })).filter((group) => group.items.length > 0), [userProfile, email, canOpenAdmin]);

  // Automatically reveal the currently selected page, even when navigation
  // originates from a dashboard shortcut or a different component.
  useEffect(() => {
    const parent = groups.find((group) => group.items.some((item) => item.id === active));
    setExpandedGroup(parent?.id || null);
  }, [active, groups]);

  const matchesSearch = searchQuery.trim().toLocaleLowerCase('pt-BR');
  const searchResults = groups.flatMap((group) =>
    group.items.filter((item) =>
      (item.label + ' ' + (item.description || '') + ' ' + group.title)
        .toLocaleLowerCase('pt-BR').includes(matchesSearch)
    )
  );

  const handleNav = (view: ViewMode) => {
    if (onNavigate) onNavigate(view);
    else onSelectView?.(view);
    setSearchQuery('');
    onClose?.();
  };

  const profileName = userProfile?.name?.trim() || userProfile?.email || 'Usuário';
  const profileRole = userProfile?.role || 'Minha conta';
  const initials = profileName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U';
  const avatar = userProfile ? resolveUserAvatar(userProfile) : '';

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const selected = active === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleNav(item.id)}
        aria-current={selected ? 'page' : undefined}
        title={item.description || item.label}
        className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${selected
          ? 'bg-[#142C60] text-white font-semibold shadow-sm ring-1 ring-blue-500/30'
          : 'text-slate-400 hover:text-white hover:bg-[#13244B]'}`}
      >
        <Icon className={`h-4 w-4 shrink-0 ${selected ? 'text-blue-400' : 'text-slate-500'}`} />
        <span className="flex-1 min-w-0 truncate">{item.label}</span>
        {selected && <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" aria-hidden="true" />}
      </button>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden"
          aria-hidden="true"
        />
      )}
      <aside
        aria-label="Menu principal"
        className={`w-64 bg-[#080E21] border-r border-[#15234A] flex flex-col h-full shrink-0 text-slate-200 font-sans transition-all duration-200 ${isOpen
          ? 'fixed inset-y-0 left-0 z-50 shadow-2xl'
          : 'hidden md:flex z-20'}`}
      >
        <div className="h-[68px] px-4 flex items-center justify-between border-b border-[#15234A] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/25" aria-hidden="true">
              <span className="text-base font-black leading-none">▲</span>
            </div>
            <div>
              <div className="font-extrabold text-white text-lg tracking-tight leading-none">AgencyOS</div>
              <span className="text-[10px] text-slate-500">Painel de gestão</span>
            </div>
          </div>
          {isOpen && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar menu"
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#13244B]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="px-3 pt-4 pb-3 shrink-0">
          <label className="sr-only" htmlFor="agencyos-sidebar-search">Buscar funcionalidade</label>
          <div className="flex items-center gap-2 rounded-xl border border-[#243560] bg-[#0D1834] px-3 focus-within:border-blue-500 transition-colors">
            <Search className="h-4 w-4 text-slate-500 shrink-0" />
            <input
              id="agencyos-sidebar-search"
              type="search"
              placeholder="Buscar ferramenta..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Escape') setSearchQuery(''); }}
              className="w-full min-w-0 bg-transparent py-2.5 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto px-3 pb-4 space-y-1.5 custom-scrollbar" aria-label="Navegação do AgencyOS">
          {matchesSearch ? (
            <>
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Resultados ({searchResults.length})
              </p>
              {('visão geral dashboard início'.includes(matchesSearch) || 'visão geral'.includes(matchesSearch)) &&
                hasModuleAccess('dashboard', userProfile as FirestoreUserProfile | null, email) &&
                renderItem({ id: 'dashboard', label: 'Visão geral', icon: LayoutDashboard })}
              {searchResults.map(renderItem)}
              {searchResults.length === 0 && !('visão geral dashboard início'.includes(matchesSearch)) && (
                <p className="px-3 py-4 text-xs text-slate-400">Nenhuma ferramenta encontrada.</p>
              )}
            </>
          ) : (
            <>
              {hasModuleAccess('dashboard', userProfile as FirestoreUserProfile | null, email) &&
                <div className="pb-2">{renderItem({ id: 'dashboard', label: 'Visão geral', icon: LayoutDashboard })}</div>}
              <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.14em] text-slate-500 font-semibold">Áreas de trabalho</p>
              {groups.map((group) => {
                const Icon = group.icon;
                const isExpanded = expandedGroup === group.id;
                const containsActive = group.items.some((item) => item.id === active);
                return (
                  <div key={group.id}>
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={`agencyos-group-${group.id}`}
                      onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${containsActive
                        ? 'bg-[#101D3B] text-slate-100'
                        : 'text-slate-400 hover:text-white hover:bg-[#101D3B]'}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${containsActive ? 'text-blue-400' : 'text-slate-500'}`} />
                      <span className="flex-1 text-left truncate">{group.title}</span>
                      <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div id={`agencyos-group-${group.id}`} className="ml-4 pl-2 py-1 border-l border-[#22345D] space-y-0.5">
                        {group.items.map(renderItem)}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </nav>

        <div className="border-t border-[#15234A] bg-[#070D1E] p-3 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleNav('profile')}
            title="Abrir meu perfil"
            className="flex-1 flex items-center gap-2.5 min-w-0 text-left rounded-lg hover:bg-[#13244B] p-1.5 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 border border-blue-400/30 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
              {avatar
                ? <img src={avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : <span>{initials}</span>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{profileName}</div>
              <div className="text-[10px] text-slate-400 truncate">{profileRole}</div>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
          </button>
          <button
            type="button"
            onClick={onLogout || (() => handleNav('landing'))}
            title="Sair da conta"
            aria-label="Sair da conta"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#13244B] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};

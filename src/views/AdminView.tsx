import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Crown,
  Zap,
  Star,
  TrendingUp,
  Plus,
  RefreshCw,
  Search,
  Pencil,
  Trash2,
  Ban,
  ShieldCheck,
  Shield,
  X,
  UserPlus,
  Sliders,
  Bell,
  BarChart2,
  Check,
  Briefcase,
  AlertCircle,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  FirestoreUserProfile,
  subscribeAllUsers,
  deleteUserFromFirestore,
  createUserWithAuthAndPermissions,
  updateUserInFirestore,
  updateUserPermissionsInFirestore,
} from '../lib/firebase';
import { ViewType } from '../types';
import {
  ALL_SYSTEM_MODULES,
  ALL_OPERATIONAL_MODULE_IDS,
  PERMISSION_PRESETS,
  SystemModuleInfo,
  isUserMasterAdmin,
} from '../lib/permissions';

interface AdminViewProps {
  currentUser?: FirestoreUserProfile | null;
}

// Initial mock list to seed Firestore if empty
const INITIAL_DEMO_USERS: Array<Omit<FirestoreUserProfile, 'uid'>> = [
  {
    name: 'Aigera Kabane',
    email: 'aigerakabane81983521523@gmail.com',
    agencyName: 'Techify Agency 1',
    role: 'Gestor de Tráfego',
    plan: 'Trial Gratuito',
    status: 'Trial Expirado',
    trialStartDate: new Date('2026-07-13').getTime(),
    trialEndsAt: new Date('2026-07-27').getTime(),
    createdAt: '13/07/2026',
    notes: '',
    allowedModules: ['dashboard', 'campanhas', 'calculadora-roi', 'relatorios'],
    tempPasswordHint: 'Aigera@2026!',
  },
  {
    name: 'Techify Master',
    email: 'oficialtechify@gmail.com',
    agencyName: 'Techify Brasil',
    role: 'Admin Geral',
    plan: 'Agency',
    status: 'active',
    trialStartDate: new Date('2026-07-04').getTime(),
    trialEndsAt: new Date('2026-07-18').getTime(),
    createdAt: '04/07/2026',
    notes: 'Conta Master com Acesso Total',
    allowedModules: ALL_OPERATIONAL_MODULE_IDS,
    tempPasswordHint: 'Techify@2026Master',
  },
  {
    name: 'Carlos Oliveira',
    email: 'carlos.mkt@midiadigital.com',
    agencyName: 'Mídia Digital SP',
    role: 'Estrategista de Growth',
    plan: 'Agency',
    status: 'active',
    trialStartDate: new Date('2026-06-01').getTime(),
    trialEndsAt: new Date('2026-06-15').getTime(),
    createdAt: '01/06/2026',
    notes: 'Plano anual fechado',
    allowedModules: ALL_OPERATIONAL_MODULE_IDS,
    tempPasswordHint: 'Mkt@Digital2026',
  },
  {
    name: 'Mariana Santos',
    email: 'mariana.santos@agenciapro.com.br',
    agencyName: 'Agência Pro Performance',
    role: 'Analista de CRM',
    plan: 'Pro',
    status: 'active',
    trialStartDate: new Date('2026-06-10').getTime(),
    trialEndsAt: new Date('2026-06-24').getTime(),
    createdAt: '10/06/2026',
    notes: 'Acesso focado em CRM e Prospecção',
    allowedModules: ['dashboard', 'maps-scraper', 'agenda', 'social-hub', 'relatorios'],
    tempPasswordHint: 'Mariana@Pro2026',
  },
  {
    name: 'Lucas Ferreira',
    email: 'lucas.ferreira@growthlabs.io',
    agencyName: 'Growth Labs Digital',
    role: 'Gestor de Ads',
    plan: 'Pro',
    status: 'active',
    trialStartDate: new Date('2026-06-15').getTime(),
    trialEndsAt: new Date('2026-06-29').getTime(),
    createdAt: '15/06/2026',
    notes: '',
    allowedModules: ['dashboard', 'campanhas', 'calculadora-roi', 'relatorios', 'ia-consultora'],
    tempPasswordHint: 'Growth@Lucas2026',
  },
  {
    name: 'Beatriz Costa',
    email: 'beatriz@scaleup.com',
    agencyName: 'ScaleUp Mídia',
    role: 'Coordenadora Financeira',
    plan: 'Starter',
    status: 'cancelled',
    trialStartDate: new Date('2026-05-20').getTime(),
    trialEndsAt: new Date('2026-06-03').getTime(),
    createdAt: '20/05/2026',
    notes: 'Módulo financeiro e KPIs',
    allowedModules: ['dashboard', 'kpis', 'fluxo-caixa', 'relatorios'],
    tempPasswordHint: 'Beatriz@Scale2026',
  },
];

export const AdminView: React.FC<AdminViewProps> = () => {
  const [users, setUsers] = useState<FirestoreUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Assinaturas' | 'Planos' | 'Atualizações' | 'Estatísticas'>('Assinaturas');
  const [filterCategory, setFilterCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<FirestoreUserProfile | null>(null);
  const [permissionsModalUser, setPermissionsModalUser] = useState<FirestoreUserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<FirestoreUserProfile | null>(null);

  // Password visibility toggles
  const [showAddPassword, setShowAddPassword] = useState(true);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // Form state for Adding/Inviting User with Password & Granular Permissions
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'AgencyOS@2026!',
    role: 'Gestor de Tráfego',
    agencyName: 'Agência Digital',
    plan: 'Pro' as FirestoreUserProfile['plan'],
    status: 'active' as FirestoreUserProfile['status'],
    notes: '',
    allowedModules: [...ALL_OPERATIONAL_MODULE_IDS] as ViewType[],
  });

  // State for permissions modal
  const [currentSelectedModules, setCurrentSelectedModules] = useState<ViewType[]>([]);

  // Subscribe to real-time users from Firestore
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeAllUsers((fetchedUsers) => {
      setUsers(fetchedUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const handleCopyCredentials = (email: string, pass?: string) => {
    const credText = `🔐 CREDENCIAIS DE ACESSO AGENCYOS\n\n🔗 Acesso: https://agencyos.techify.com.br\n📧 E-mail: ${email}\n🔑 Senha: ${pass || 'Configurada pelo administrador'}\n\n⚠️ Ao entrar, você terá acesso aos módulos liberados para o seu perfil.`;
    navigator.clipboard.writeText(credText);
    setCopiedUid(email);
    showToast('📋 Credenciais de acesso copiadas para a área de transferência!');
    setTimeout(() => setCopiedUid(null), 2500);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let pass = 'AgOS@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  // Seed demo data if database is empty
  const handleSeedDemoData = async () => {
    try {
      for (const demoUser of INITIAL_DEMO_USERS) {
        await createUserWithAuthAndPermissions(demoUser);
      }
      showToast('Dados de usuários inicializados com permissões no Firestore!');
    } catch (err) {
      console.error('Erro ao popular demonstração:', err);
      showToast('Erro ao criar usuários de teste.');
    }
  };

  // Filter logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.agencyName?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterCategory === 'Todos') return true;
    if (filterCategory === 'active') return u.status === 'active';
    if (filterCategory === 'Trial Gratuito') return u.plan === 'Trial Gratuito';
    if (filterCategory === 'Starter') return u.plan === 'Starter';
    if (filterCategory === 'Pro') return u.plan === 'Pro';
    if (filterCategory === 'Agency') return u.plan === 'Agency';
    if (filterCategory === 'cancelled') return u.status === 'cancelled';
    if (filterCategory === 'blocked') return u.status === 'blocked';

    return true;
  });

  // Statistics calculation
  const totalUsersCount = users.length;
  const activeCount = users.filter((u) => u.status === 'active').length;
  const trialCount = users.filter((u) => u.plan === 'Trial Gratuito' || u.status === 'Trial Expirado').length;
  const paidCount = users.filter((u) => u.plan === 'Starter' || u.plan === 'Pro' || u.plan === 'Agency').length;
  const starterCount = users.filter((u) => u.plan === 'Starter').length;
  const proCount = users.filter((u) => u.plan === 'Pro').length;
  const agencyCount = users.filter((u) => u.plan === 'Agency').length;

  const mrrEst = starterCount * 99 + proCount * 199 + agencyCount * 499 + 1293;

  // Actions
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await deleteUserFromFirestore(deletingUser.uid);
      showToast(`Usuário ${deletingUser.email} foi excluído com sucesso!`);
      setDeletingUser(null);
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      showToast('Erro ao tentar excluir usuário.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newUser.email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Por favor, informe um e-mail válido.');
      return;
    }

    if (!newUser.password || newUser.password.length < 6) {
      showToast('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newUser.allowedModules.length === 0) {
      showToast('Selecione ao menos 1 módulo para liberar acesso.');
      return;
    }

    if (isCreatingUser) return;
    setIsCreatingUser(true);

    try {
      await createUserWithAuthAndPermissions({
        name: newUser.name.trim() || cleanEmail.split('@')[0],
        email: cleanEmail,
        password: newUser.password.trim(),
        agencyName: newUser.agencyName.trim() || 'Agência Digital',
        role: newUser.role.trim() || 'Gestor de Tráfego',
        plan: newUser.plan,
        status: newUser.status,
        allowedModules: newUser.allowedModules,
        notes: newUser.notes.trim(),
      });

      showToast(`Usuário ${cleanEmail} cadastrado e liberado com sucesso!`);
      setIsAddModalOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: generateRandomPassword(),
        role: 'Gestor de Tráfego',
        agencyName: 'Agência Digital',
        plan: 'Pro',
        status: 'active',
        notes: '',
        allowedModules: [...ALL_OPERATIONAL_MODULE_IDS],
      });
    } catch (err: any) {
      console.error('Erro ao criar usuário:', err);
      showToast(err.message || 'Erro ao cadastrar usuário com credenciais.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await updateUserInFirestore(editingUser.uid, {
        name: editingUser.name || '',
        email: editingUser.email || '',
        role: editingUser.role || 'Gestor de Tráfego',
        agencyName: editingUser.agencyName || '',
        plan: editingUser.plan,
        status: editingUser.status,
        notes: editingUser.notes || '',
        allowedModules: editingUser.allowedModules || ALL_OPERATIONAL_MODULE_IDS,
        tempPasswordHint: editingUser.tempPasswordHint,
      });

      showToast(`Usuário ${editingUser.email} atualizado com sucesso!`);
      setEditingUser(null);
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      showToast('Erro ao salvar alterações.');
    }
  };

  const handleOpenPermissionsModal = (user: FirestoreUserProfile) => {
    setPermissionsModalUser(user);
    let existing = user.allowedModules;
    if (!existing || existing.length === 0) {
      if (user.role?.toLowerCase().includes('design') || user.email?.toLowerCase().includes('job') || user.email?.toLowerCase().includes('design')) {
        existing = ['dashboard', 'designer', 'social-hub', 'kanban', 'agenda', 'relatorios'];
      } else {
        existing = ALL_OPERATIONAL_MODULE_IDS;
      }
    }
    setCurrentSelectedModules(existing);
  };

  const handleSavePermissions = async () => {
    if (!permissionsModalUser) return;
    try {
      await updateUserPermissionsInFirestore(permissionsModalUser.uid, currentSelectedModules);
      showToast(`Permissões de ${permissionsModalUser.email} salvas (${currentSelectedModules.length} módulos liberados)!`);
      setPermissionsModalUser(null);
    } catch (err) {
      console.error('Erro ao salvar permissões:', err);
      showToast('Erro ao salvar permissões no banco.');
    }
  };

  const toggleModuleSelection = (moduleId: ViewType, currentList: ViewType[], setList: (l: ViewType[]) => void) => {
    if (currentList.includes(moduleId)) {
      setList(currentList.filter((id) => id !== moduleId));
    } else {
      setList([...currentList, moduleId]);
    }
  };

  const handleQuickChangePlan = async (user: FirestoreUserProfile, newPlan: FirestoreUserProfile['plan']) => {
    try {
      await updateUserInFirestore(user.uid, { plan: newPlan, status: 'active' });
      showToast(`Plano de ${user.email} alterado para ${newPlan}`);
    } catch (err) {
      console.error(err);
      showToast('Erro ao alterar plano.');
    }
  };

  const handleToggleBlock = async (user: FirestoreUserProfile) => {
    try {
      const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
      await updateUserInFirestore(user.uid, { status: newStatus });
      showToast(`Status de ${user.email} alterado para ${newStatus}`);
    } catch (err) {
      console.error(err);
      showToast('Erro ao alterar status.');
    }
  };

  const handleSelectRow = (uid: string) => {
    if (selectedUserIds.includes(uid)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== uid));
    } else {
      setSelectedUserIds([...selectedUserIds, uid]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.uid));
    }
  };

  return (
    <div className="space-y-6 text-gray-200 font-sans max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#122818] border border-[#22c55e] text-[#22c55e] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#161a25] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Painel Administrativo & Controle de Acessos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400">
            Cadastre e-mail e senha para novos usuários e controle exatamente quais módulos cada usuário pode acessar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setNewUser((prev) => ({ ...prev, password: generateRandomPassword() }));
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#1eb054] text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-[#22c55e]/20 transition-all hover:scale-105 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            Adicionar Usuário com Senha
          </button>
        </div>
      </div>

      {/* 4 TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Usuários */}
        <div className="p-5 rounded-2xl bg-[#0c0e16] border border-[#161a25] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">Total Usuários</span>
            <div className="p-2 rounded-xl bg-[#141824] text-blue-400 border border-[#1f2638]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{totalUsersCount}</div>
          <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5">
            <span className="text-[#22c55e] font-bold">● {activeCount} ativos</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">{trialCount} em trial</span>
          </div>
        </div>

        {/* Assinaturas Ativas */}
        <div className="p-5 rounded-2xl bg-[#0c0e16] border border-[#161a25] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">Assinaturas Ativas</span>
            <div className="p-2 rounded-xl bg-[#12281a] text-[#22c55e] border border-[#1e3d28]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{activeCount}</div>
          <div className="text-[11px] text-gray-400 font-medium">
            {paidCount} planos pagos (Starter/Pro/Agency)
          </div>
        </div>

        {/* Em Trial Gratuito */}
        <div className="p-5 rounded-2xl bg-[#0c0e16] border border-[#161a25] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">Em Trial (14 dias)</span>
            <div className="p-2 rounded-xl bg-[#2b1f14] text-amber-400 border border-[#3d2c1c]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{trialCount}</div>
          <div className="text-[11px] text-amber-500 font-medium">
            Avaliações com permissões configuráveis
          </div>
        </div>

        {/* MRR Estimado */}
        <div className="p-5 rounded-2xl bg-[#0c0e16] border border-[#161a25] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">MRR Estimado</span>
            <div className="p-2 rounded-xl bg-[#28142b] text-purple-400 border border-[#3b1d40]">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            R$ {mrrEst.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-purple-400 font-medium">
            Pro: {proCount} • Agency: {agencyCount}
          </div>
        </div>
      </div>

      {/* ACCESS CONTROL EXPLANATION BANNER */}
      <div className="p-4 rounded-2xl bg-[#0e121d] border border-[#1e2538] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] shrink-0">
            <Lock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Como funciona o Controle de Acessos Granular</span>
              <span className="text-[10px] bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-full font-black">
                Ativo
              </span>
            </h4>
            <p className="text-xs text-gray-400 leading-snug">
              Cadastre e-mail e senha para o usuário. Ele conseguirá logar normalmente, mas{' '}
              <strong className="text-white">só poderá ver e clicar nos módulos liberados</strong>. O resto fica trancado com aviso de restrição.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setNewUser((prev) => ({ ...prev, password: generateRandomPassword() }));
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 bg-[#171d2c] hover:bg-[#20283d] border border-[#28334e] text-[#22c55e] text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0"
        >
          <Key className="w-3.5 h-3.5" />
          <span>Criar Usuário + Permissões</span>
        </button>
      </div>

      {/* TABS & SEARCH BAR */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[#0c0e16] p-1 rounded-xl border border-[#161a25]">
            {(['Assinaturas', 'Planos', 'Atualizações', 'Estatísticas'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#18211a] text-[#22c55e] border border-[#22c55e]/40 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#121520]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por e-mail, nome ou cargo..."
              className="w-full bg-[#0c0e16] border border-[#161a25] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'Todos', label: `Todos (${totalUsersCount})` },
            { id: 'active', label: `Ativos (${activeCount})` },
            { id: 'Trial Gratuito', label: `Trial (14 dias) (${trialCount})` },
            { id: 'Starter', label: `Starter (${starterCount})` },
            { id: 'Pro', label: `Pro (${proCount})` },
            { id: 'Agency', label: `Agency (${agencyCount})` },
            { id: 'blocked', label: 'Bloqueados' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterCategory(f.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterCategory === f.id
                  ? 'bg-[#22c55e] text-black shadow-md'
                  : 'bg-[#0c0e16] border border-[#161a25] text-gray-400 hover:text-white hover:bg-[#141824]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* USERS & PERMISSIONS TABLE */}
      <div className="bg-[#0c0e16] border border-[#161a25] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#161a25] text-gray-400 text-[11px] uppercase tracking-wider font-bold bg-[#080a10]">
                <th className="p-3.5 text-center w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length
                    }
                    onChange={handleSelectAll}
                    className="rounded bg-[#1a1e2c] border-[#2b3145] text-[#22c55e] focus:ring-0"
                  />
                </th>
                <th className="p-3.5">Usuário / Credenciais</th>
                <th className="p-3.5">Cargo</th>
                <th className="p-3.5">Plano</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Módulos Liberados</th>
                <th className="p-3.5">Cadastro</th>
                <th className="p-3.5 text-right">Ações & Permissões</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#131622] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#22c55e] mb-2" />
                    Carregando usuários do Firestore...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 space-y-2">
                    <Users className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                    <p className="font-bold text-gray-400">Nenhum usuário encontrado</p>
                    <p className="text-xs text-gray-500">
                      Tente alterar os filtros de busca ou adicione um novo usuário com senha.
                    </p>
                    <button
                      onClick={handleSeedDemoData}
                      className="mt-3 px-4 py-2 bg-[#18211a] text-[#22c55e] font-bold text-xs rounded-xl hover:bg-[#202e23] border border-[#22c55e]/30"
                    >
                      Restaurar Usuários com Permissões de Demonstração
                    </button>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user.uid);
                  const isMaster = isUserMasterAdmin(user);
                  const allowedList = user.allowedModules || (isMaster ? ALL_OPERATIONAL_MODULE_IDS : ALL_OPERATIONAL_MODULE_IDS);
                  const allowedCount = isMaster ? ALL_OPERATIONAL_MODULE_IDS.length : allowedList.length;

                  return (
                    <tr
                      key={user.uid}
                      className={`hover:bg-[#10131e] transition-colors ${
                        isSelected ? 'bg-[#141824]' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(user.uid)}
                          className="rounded bg-[#1a1e2c] border-[#2b3145] text-[#22c55e] focus:ring-0"
                        />
                      </td>

                      {/* User Email + Password Hint + Copy */}
                      <td className="p-3.5">
                        <div className="font-bold text-gray-100 flex items-center gap-1.5">
                          <span className="truncate max-w-[220px]">{user.email}</span>
                          {isMaster && (
                            <span className="text-[9px] bg-[#22c55e]/20 text-[#22c55e] px-1.5 py-0.5 rounded font-black border border-[#22c55e]/30">
                              ADMIN
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          {user.name && user.name !== user.email.split('@')[0] && (
                            <span className="text-[11px] text-gray-400">
                              {user.name} • {user.agencyName}
                            </span>
                          )}

                          {user.tempPasswordHint && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-mono text-gray-400 bg-[#161a27] px-1.5 py-0.5 rounded border border-[#22283a]">
                                Senha: {user.tempPasswordHint}
                              </span>
                              <button
                                onClick={() => handleCopyCredentials(user.email, user.tempPasswordHint)}
                                title="Copiar credenciais de login"
                                className="p-0.5 text-gray-400 hover:text-[#22c55e] cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Cargo */}
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-gray-300 bg-[#121520] border border-[#1c2234] px-2.5 py-1 rounded-lg text-[11px] font-bold">
                          <Briefcase className="w-3 h-3 text-[#22c55e]" />
                          {user.role || 'Gestor de Tráfego'}
                        </span>
                      </td>

                      {/* Plano */}
                      <td className="p-3.5">
                        {user.plan === 'Trial Gratuito' && (
                          <span className="px-2.5 py-1 rounded-lg bg-[#141e2b] text-cyan-400 font-bold text-[11px] border border-cyan-500/30">
                            Trial (14d)
                          </span>
                        )}
                        {user.plan === 'Starter' && (
                          <span className="px-2.5 py-1 rounded-lg bg-[#141b2e] text-blue-400 font-bold text-[11px] border border-blue-500/30">
                            Starter
                          </span>
                        )}
                        {user.plan === 'Pro' && (
                          <span className="px-2.5 py-1 rounded-lg bg-[#221633] text-purple-400 font-bold text-[11px] border border-purple-500/30">
                            Pro
                          </span>
                        )}
                        {user.plan === 'Agency' && (
                          <span className="px-2.5 py-1 rounded-lg bg-[#2e1f14] text-amber-400 font-bold text-[11px] border border-amber-500/30">
                            Agency
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {user.status === 'active' && (
                          <span className="px-2.5 py-1 rounded-lg bg-[#12281a] text-[#22c55e] font-bold text-[11px] border border-[#22c55e]/30">
                            Ativo
                          </span>
                        )}
                        {user.status === 'Trial Expirado' && (
                          <span className="px-2.5 py-1 rounded-lg bg-[#2d1b12] text-amber-500 font-bold text-[11px] border border-amber-500/30">
                            Expirado
                          </span>
                        )}
                        {user.status === 'blocked' && (
                          <span className="px-2.5 py-1 rounded-lg bg-[#2d1216] text-red-400 font-bold text-[11px] border border-red-500/30">
                            Bloqueado
                          </span>
                        )}
                        {user.status === 'cancelled' && (
                          <span className="px-2.5 py-1 rounded-lg bg-[#1c1f2b] text-gray-400 font-bold text-[11px] border border-gray-600/30">
                            Cancelado
                          </span>
                        )}
                      </td>

                      {/* Módulos Liberados / Permissões Badge */}
                      <td className="p-3.5">
                        <button
                          onClick={() => handleOpenPermissionsModal(user)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#131b26] hover:bg-[#1a2536] border border-[#233047] text-gray-200 text-[11px] font-bold transition-all cursor-pointer group"
                        >
                          <Lock className="w-3 h-3 text-[#22c55e] group-hover:scale-110 transition-transform" />
                          <span>
                            {isMaster
                              ? 'Acesso Total (12/12)'
                              : `${allowedCount}/${ALL_OPERATIONAL_MODULE_IDS.length} liberados`}
                          </span>
                        </button>
                      </td>

                      {/* Cadastro */}
                      <td className="p-3.5 text-gray-400 font-mono text-[11px]">
                        {user.createdAt || '13/07/2026'}
                      </td>

                      {/* Actions Column */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Permissões Button */}
                          <button
                            onClick={() => handleOpenPermissionsModal(user)}
                            title="Gerenciar Módulos e Permissões de Acesso"
                            className="px-2.5 py-1.5 rounded-lg bg-[#18211a] hover:bg-[#203022] text-[#22c55e] font-bold text-[11px] border border-[#22c55e]/40 flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Shield className="w-3 h-3" />
                            <span>Permissões</span>
                          </button>

                          {/* Edit User */}
                          <button
                            onClick={() => setEditingUser(user)}
                            title="Editar Dados do Usuário"
                            className="p-1.5 rounded-lg bg-[#141824] hover:bg-[#1e2436] text-gray-300 hover:text-white transition-all border border-[#20273c] cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Block Button */}
                          <button
                            onClick={() => handleToggleBlock(user)}
                            title={user.status === 'blocked' ? 'Desbloquear usuário' : 'Bloquear usuário'}
                            className={`p-1.5 rounded-lg transition-all border cursor-pointer ${
                              user.status === 'blocked'
                                ? 'bg-red-900/40 text-red-400 border-red-500/50'
                                : 'bg-[#141824] hover:bg-red-950/40 text-amber-500 hover:text-red-400 border-[#20273c]'
                            }`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeletingUser(user)}
                            title="Excluir usuário permanentemente"
                            className="p-1.5 rounded-lg bg-[#2b1418] hover:bg-red-600 text-red-400 hover:text-white transition-all border border-red-500/30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MODAL: ADICIONAR / CONVIDAR USUÁRIO COM SENHA E PERMISSÕES GRANULARES */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e1018] border border-[#22283a] rounded-3xl p-6 sm:p-7 w-full max-w-2xl shadow-2xl text-gray-200 relative my-8 animate-scale-up">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
                <UserPlus className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Cadastrar Usuário com Senha & Permissões</h3>
                <p className="text-xs text-gray-400">
                  Crie o login com e-mail e senha e defina exatamente quais módulos o usuário poderá acessar.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-[#121522] border border-[#1e2438]">
                {/* Email */}
                <div>
                  <label className="block text-gray-300 font-bold mb-1.5">E-mail de Login *</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="ex: gestor@suaagencia.com.br"
                    className="w-full bg-[#181c2c] border border-[#2b334d] rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-gray-300 font-bold">Senha de Acesso *</label>
                    <button
                      type="button"
                      onClick={() => setNewUser({ ...newUser, password: generateRandomPassword() })}
                      className="text-[10px] text-[#22c55e] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Gerar Senha
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showAddPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-[#181c2c] border border-[#2b334d] rounded-xl pl-3.5 pr-10 py-2.5 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showAddPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Name, Role & Agency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="ex: Ricardo Silva"
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Cargo / Função *</label>
                  <input
                    type="text"
                    required
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    placeholder="ex: Gestor de Tráfego"
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Agência</label>
                  <input
                    type="text"
                    value={newUser.agencyName}
                    onChange={(e) => setNewUser({ ...newUser, agencyName: e.target.value })}
                    placeholder="ex: Techify Agência"
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              {/* Plan & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Plano Atribuído *</label>
                  <select
                    value={newUser.plan}
                    onChange={(e) => setNewUser({ ...newUser, plan: e.target.value as any })}
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Trial Gratuito">Trial Gratuito (14 dias)</option>
                    <option value="Starter">Starter</option>
                    <option value="Pro">Pro</option>
                    <option value="Agency">Agency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Status da Conta *</label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value as any })}
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="active">Ativo (Permite Login)</option>
                    <option value="blocked">Bloqueado</option>
                    <option value="Trial Expirado">Trial Expirado</option>
                  </select>
                </div>
              </div>

              {/* GRANULAR PERMISSIONS SECTION */}
              <div className="p-4 rounded-2xl bg-[#121522] border border-[#1e2438] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-black text-white text-xs flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-[#22c55e]" />
                      <span>Módulos Liberados para este Usuário</span>
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Os módulos não marcados ficarão totalmente trancados para este login.
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-[#22c55e] bg-[#1a261d] px-2.5 py-1 rounded-lg border border-[#22c55e]/30 self-start sm:self-auto">
                    {newUser.allowedModules.length} de {ALL_OPERATIONAL_MODULE_IDS.length} liberados
                  </span>
                </div>

                {/* Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">
                    Presets rápidos:
                  </span>
                  {PERMISSION_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setNewUser({ ...newUser, allowedModules: [...preset.modules] })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${preset.color}`}
                    >
                      {preset.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewUser({ ...newUser, allowedModules: [] })}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-red-500/30 text-red-400 bg-red-950/40 hover:bg-red-900/60 cursor-pointer"
                  >
                    Desmarcar Todos
                  </button>
                </div>

                {/* Grid of Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 max-h-52 overflow-y-auto pr-1">
                  {ALL_SYSTEM_MODULES.filter((m) => m.id !== 'admin').map((mod) => {
                    const isChecked = newUser.allowedModules.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() =>
                          toggleModuleSelection(mod.id, newUser.allowedModules, (l) =>
                            setNewUser({ ...newUser, allowedModules: l })
                          )
                        }
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked
                            ? 'bg-[#18231c] border-[#22c55e] text-white shadow-[0_0_12px_rgba(34,197,94,0.15)]'
                            : 'bg-[#151824] border-[#202738] text-gray-400 hover:border-gray-500 hover:bg-[#191d2c]'
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${
                            isChecked
                              ? 'bg-[#22c55e] border-[#22c55e] text-black'
                              : 'bg-[#1a1e2c] border-[#3b435c] text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs flex items-center justify-between">
                            <span className={isChecked ? 'text-[#22c55e]' : 'text-gray-300'}>
                              {mod.name}
                            </span>
                            {mod.id === 'designer' && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30 font-bold">
                                Novo
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 truncate">{mod.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#22283a]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#181b28] hover:bg-[#222738] text-gray-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="px-6 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#1eb054] text-black font-black flex items-center gap-2 shadow-lg shadow-[#22c55e]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isCreatingUser ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Cadastrando no Banco...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 stroke-[2.5]" /> Criar Login & Liberar Acessos
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODAL DEDICADO: GERENCIAR PERMISSÕES DE UM USUÁRIO ESPECÍFICO */}
      {/* ========================================================================= */}
      {permissionsModalUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1018] border border-[#22283a] rounded-3xl p-6 sm:p-7 w-full max-w-xl shadow-2xl text-gray-200 relative animate-scale-up space-y-4">
            <button
              onClick={() => setPermissionsModalUser(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Permissões de Módulos</h3>
                <p className="text-xs text-gray-400 font-mono">{permissionsModalUser.email}</p>
              </div>
            </div>

            {/* Preset Buttons */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Atalhos de perfil:
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PERMISSION_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setCurrentSelectedModules([...preset.modules])}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${preset.color}`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Modules Checkbox Grid */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                <span>Módulos do Sistema:</span>
                <span className="text-[#22c55e] font-black">
                  {currentSelectedModules.length} de {ALL_OPERATIONAL_MODULE_IDS.length} liberados
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {ALL_SYSTEM_MODULES.filter((m) => m.id !== 'admin').map((mod) => {
                  const isChecked = currentSelectedModules.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() =>
                        toggleModuleSelection(mod.id, currentSelectedModules, setCurrentSelectedModules)
                      }
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-[#18231c] border-[#22c55e] text-white shadow-[0_0_12px_rgba(34,197,94,0.15)]'
                          : 'bg-[#121522] border-[#1e2438] text-gray-400 hover:border-gray-500 hover:bg-[#161a2b]'
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${
                          isChecked
                            ? 'bg-[#22c55e] border-[#22c55e] text-black'
                            : 'bg-[#1a1e2c] border-[#3b435c] text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span className={isChecked ? 'text-[#22c55e]' : 'text-gray-300'}>
                            {mod.name}
                          </span>
                          {mod.id === 'designer' && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30 font-bold">
                              Novo
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 truncate">{mod.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#22283a]">
              <button
                type="button"
                onClick={() =>
                  handleCopyCredentials(
                    permissionsModalUser.email,
                    permissionsModalUser.tempPasswordHint
                  )
                }
                className="px-3 py-2 rounded-xl bg-[#141824] hover:bg-[#1e2436] border border-[#252c42] text-gray-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#22c55e]" />
                Copiar Dados de Acesso
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPermissionsModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-[#181b28] hover:bg-[#222738] text-gray-300 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  className="px-5 py-2 rounded-xl bg-[#22c55e] hover:bg-[#1eb054] text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-[#22c55e]/20 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" /> Salvar Permissões
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL: EDITAR USUÁRIO */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e1018] border border-[#22283a] rounded-3xl p-6 sm:p-7 w-full max-w-xl shadow-2xl text-gray-200 relative my-8 animate-scale-up space-y-4">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Editar Dados & Acessos</h3>
                <p className="text-xs text-gray-400 font-mono">{editingUser.email}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={editingUser.name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Cargo / Função</label>
                  <input
                    type="text"
                    value={editingUser.role || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Plano</label>
                  <select
                    value={editingUser.plan}
                    onChange={(e) => setEditingUser({ ...editingUser, plan: e.target.value as any })}
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="Trial Gratuito">Trial Gratuito</option>
                    <option value="Starter">Starter</option>
                    <option value="Pro">Pro</option>
                    <option value="Agency">Agency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="active">Ativo</option>
                    <option value="Trial Expirado">Trial Expirado</option>
                    <option value="cancelled">Cancelado</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                </div>
              </div>

              {/* Password Hint / Update */}
              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  Senha / Credencial de Login
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editingUser.tempPasswordHint || ''}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, tempPasswordHint: e.target.value })
                    }
                    placeholder="Digite nova senha para o usuário..."
                    className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Notas / Observações</label>
                <textarea
                  rows={2}
                  value={editingUser.notes || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                  className="w-full bg-[#151827] border border-[#252c42] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#22283a]">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-[#181b28] hover:bg-[#222738] text-gray-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] hover:bg-[#1eb054] text-black font-black flex items-center gap-2 shadow-lg shadow-[#22c55e]/20 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" /> Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: EXCLUIR USUÁRIO */}
      {/* ========================================================================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141014] border border-red-500/40 rounded-3xl p-6 w-full max-w-md shadow-2xl text-gray-200 relative animate-scale-up">
            <button
              onClick={() => setDeletingUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Excluir Usuário</h3>
                <p className="text-xs text-red-400 font-bold">Esta ação é irreversível</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 mb-6 leading-relaxed">
              Tem certeza que deseja excluir permanentemente o usuário{' '}
              <strong className="text-white bg-[#221618] px-2 py-0.5 rounded border border-red-500/30 font-mono">
                {deletingUser.email}
              </strong>{' '}
              do sistema? O perfil e as permissões serão removidos.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl bg-[#1d1b22] hover:bg-[#282530] text-gray-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Shield,
  Trash2,
  Lock,
  Unlock,
  Key,
  Copy,
  Sparkles,
  Briefcase,
  AlertCircle,
  Eye,
  EyeOff,
  Pencil,
  Ban,
  CheckCircle2,
  Clock,
  Crown,
  LayoutDashboard,
  Megaphone,
  Palette,
  Share2,
  Kanban,
  FileText,
  Calendar,
  Layers,
  Check,
  X,
  RefreshCw,
  Zap,
  Building2,
  DollarSign,
  UserCheck,
  SlidersHorizontal,
  ArrowRightLeft,
  ChevronRight,
  TrendingUp,
  Target,
  MapPin,
  Rocket,
} from 'lucide-react';
import { ViewType } from '../types';
import {
  FirestoreUserProfile,
  subscribeAllUsers,
  createUserWithAuthAndPermissions,
  updateUserPermissionsInFirestore,
  updateUserInFirestore,
  deleteUserFromFirestore,
  AGENCY_REGISTERED_TEAM_MEMBERS,
} from '../lib/firebase';
import {
  ALL_SYSTEM_MODULES,
  ALL_OPERATIONAL_MODULE_IDS,
  PERMISSION_PRESETS,
  isUserMasterAdmin,
} from '../lib/permissions';

interface AdminViewProps {
  currentUser?: FirestoreUserProfile | null;
}

// Initial Registered Team Seed Data
const INITIAL_DEMO_USERS: Partial<FirestoreUserProfile & { password?: string }>[] = AGENCY_REGISTERED_TEAM_MEMBERS;

export const AdminView: React.FC<AdminViewProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<FirestoreUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('Todos');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  // Primary Tabs
  const [activeTab, setActiveTab] = useState<'Equipe' | 'Clientes' | 'Planos' | 'Atualizações' | 'Estatísticas'>('Equipe');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addUserTypeSelection, setAddUserTypeSelection] = useState<'employee' | 'client'>('employee');
  const [editingUser, setEditingUser] = useState<FirestoreUserProfile | null>(null);
  const [permissionsModalUser, setPermissionsModalUser] = useState<FirestoreUserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<FirestoreUserProfile | null>(null);

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'AgOS@' + Math.random().toString(36).slice(-5),
    role: 'Líder de Design',
    leadershipRole: 'lider_design' as 'lider_geral' | 'lider_marketing' | 'lider_prospeccao' | 'lider_design' | 'membro',
    userType: 'employee' as 'employee' | 'client',
    agencyName: 'Agência Digital',
    plan: 'Gratuito / Equipe' as FirestoreUserProfile['plan'],
    status: 'active' as FirestoreUserProfile['status'],
    notes: '',
    designRole: 'lider' as 'admin' | 'lider' | 'designer' | 'funcionario' | 'cliente',
    canEditDesigns: true,
    canCreateDesigns: true,
    canApproveDesigns: true,
    canPublishPosts: true,
    canDeleteDesigns: true,
    allowedModules: ['dashboard', 'designer', 'studio-agency', 'social-hub', 'kanban', 'agenda', 'relatorios'] as ViewType[],
  });

  const [currentSelectedModules, setCurrentSelectedModules] = useState<ViewType[]>([
    ...ALL_OPERATIONAL_MODULE_IDS,
  ]);

  // Specific Creative & Posting Permissions for Permissions Modal
  const [permDesignRole, setPermDesignRole] = useState<'admin' | 'lider' | 'designer' | 'funcionario' | 'cliente'>('funcionario');
  const [permLeadershipRole, setPermLeadershipRole] = useState<'lider_geral' | 'lider_marketing' | 'lider_prospeccao' | 'lider_design' | 'membro'>('membro');
  const [permCanEditDesigns, setPermCanEditDesigns] = useState(true);
  const [permCanCreateDesigns, setPermCanCreateDesigns] = useState(true);
  const [permCanApproveDesigns, setPermCanApproveDesigns] = useState(false);
  const [permCanPublishPosts, setPermCanPublishPosts] = useState(true);
  const [permCanDeleteDesigns, setPermCanDeleteDesigns] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const unsubscribe = subscribeAllUsers(
      (data) => {
        if (data.length === 0) {
          setUsers(
            INITIAL_DEMO_USERS.map((u, i) => ({
              ...u,
              uid: `demo-user-${i}`,
            })) as FirestoreUserProfile[]
          );
        } else {
          setUsers(data);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Erro na escuta de usuários:', error);
        setUsers(
          INITIAL_DEMO_USERS.map((u, i) => ({
            ...u,
            uid: `demo-user-${i}`,
          })) as FirestoreUserProfile[]
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCopyCredentials = (email: string, pass?: string) => {
    const text = `Acesso AgencyOS:\nE-mail: ${email}\nSenha: ${pass || 'Definida pelo usuário'}\nLink: https://agencyos.digital`;
    navigator.clipboard.writeText(text);
    setCopiedUid(email);
    showToast('Credenciais de acesso copiadas para a área de transferência!');
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

  const handleSeedDemoData = async () => {
    try {
      for (const demoUser of INITIAL_DEMO_USERS) {
        await createUserWithAuthAndPermissions(demoUser as any);
      }
      showToast('Dados de usuários inicializados com permissões no Firestore!');
    } catch (err) {
      console.error('Erro ao popular demonstração:', err);
      showToast('Erro ao criar usuários de teste.');
    }
  };

  // User Categorization Helper: Is Employee vs Is Client
  const isEmployeeUser = (u: FirestoreUserProfile) => {
    if (u.userType === 'employee') return true;
    if (u.userType === 'client') return false;
    
    // Auto-detection fallback for older records
    if (isUserMasterAdmin(u, u.email)) return true;
    const roleLow = (u.role || '').toLowerCase();
    if (
      roleLow.includes('designer') ||
      roleLow.includes('lider') ||
      roleLow.includes('líder') ||
      roleLow.includes('gestor') ||
      roleLow.includes('editor') ||
      roleLow.includes('diretor') ||
      roleLow.includes('copy') ||
      roleLow.includes('colaborador') ||
      roleLow.includes('funcionario') ||
      roleLow.includes('funcionário') ||
      roleLow.includes('estagiário') ||
      roleLow.includes('equipe') ||
      roleLow.includes('sdr') ||
      roleLow.includes('closer') ||
      roleLow.includes('prospec') ||
      roleLow.includes('marketing')
    ) {
      return true;
    }
    if (u.plan === 'Gratuito / Equipe') return true;
    return false;
  };

  const employeeUsers = users.filter(isEmployeeUser);
  const clientUsers = users.filter((u) => !isEmployeeUser(u));

  // Current List based on Active Tab
  const currentTabUsers = activeTab === 'Equipe' ? employeeUsers : clientUsers;

  const filteredUsers = currentTabUsers.filter((u) => {
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
    if (filterCategory === 'Gratuito / Equipe') return u.plan === 'Gratuito / Equipe';
    if (filterCategory === 'lideres') {
      return u.leadershipRole?.startsWith('lider') || u.designRole === 'lider' || u.role?.toLowerCase().includes('lider') || u.role?.toLowerCase().includes('líder');
    }
    if (filterCategory === 'lider_marketing') {
      return u.leadershipRole === 'lider_marketing' || u.role?.toLowerCase().includes('marketing');
    }
    if (filterCategory === 'lider_prospeccao') {
      return u.leadershipRole === 'lider_prospeccao' || u.role?.toLowerCase().includes('prospec') || u.role?.toLowerCase().includes('sdr') || u.role?.toLowerCase().includes('closer');
    }
    if (filterCategory === 'lider_design') {
      return u.leadershipRole === 'lider_design' || (u.designRole === 'lider' && !u.role?.toLowerCase().includes('marketing') && !u.role?.toLowerCase().includes('prospec'));
    }
    if (filterCategory === 'designer') return u.designRole === 'designer' || u.role?.toLowerCase().includes('designer');
    if (filterCategory === 'gestor') return u.role?.toLowerCase().includes('gestor') || u.role?.toLowerCase().includes('tráfego');
    if (filterCategory === 'cancelled') return u.status === 'cancelled';
    if (filterCategory === 'blocked') return u.status === 'blocked';

    return true;
  });

  // Metrics
  const totalEmployeesCount = employeeUsers.length;
  const activeEmployeesCount = employeeUsers.filter((u) => u.status === 'active').length;

  const totalClientsCount = clientUsers.length;
  const activeClientsCount = clientUsers.filter((u) => u.status === 'active').length;
  const clientTrialCount = clientUsers.filter((u) => u.plan === 'Trial Gratuito' || u.status === 'Trial Expirado').length;

  const clientPaidStarter = clientUsers.filter((u) => u.plan === 'Starter' && u.status === 'active').length;
  const clientPaidPro = clientUsers.filter((u) => u.plan === 'Pro' && u.status === 'active').length;
  const clientPaidAgency = clientUsers.filter((u) => u.plan === 'Agency' && u.status === 'active').length;
  const clientTotalPaid = clientPaidStarter + clientPaidPro + clientPaidAgency;

  // Real MRR calculated STRICTLY on active paying clients
  const mrrEst = clientPaidStarter * 99 + clientPaidPro * 199 + clientPaidAgency * 499;

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

  const handleOpenAddModal = (type: 'employee' | 'client') => {
    setAddUserTypeSelection(type);
    if (type === 'employee') {
      setNewUser({
        name: '',
        email: '',
        password: generateRandomPassword(),
        role: 'Designer Gráfico',
        userType: 'employee',
        agencyName: currentUser?.agencyName || 'Agência Digital',
        plan: 'Gratuito / Equipe',
        status: 'active',
        notes: 'Membro da equipe com acesso compartilhado às demandas',
        designRole: 'designer',
        canEditDesigns: true,
        canCreateDesigns: true,
        canApproveDesigns: false,
        canPublishPosts: true,
        canDeleteDesigns: false,
        allowedModules: ['dashboard', 'designer', 'social-hub', 'kanban', 'agenda', 'relatorios'],
      });
    } else {
      setNewUser({
        name: '',
        email: '',
        password: generateRandomPassword(),
        role: 'Cliente AgencyOS',
        userType: 'client',
        agencyName: 'Cliente Digital',
        plan: 'Pro',
        status: 'active',
        notes: 'Assinante SaaS com workspace independente',
        designRole: 'cliente',
        canEditDesigns: false,
        canCreateDesigns: false,
        canApproveDesigns: true,
        canPublishPosts: false,
        canDeleteDesigns: false,
        allowedModules: ['dashboard', 'campanhas', 'marketing', 'social-hub', 'relatorios'],
      });
    }
    setIsAddModalOpen(true);
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
        userType: newUser.userType,
        agencyOwnerUid: newUser.userType === 'employee' ? (currentUser?.uid || 'agency-master-owner') : undefined,
        agencyName: newUser.agencyName.trim() || (newUser.userType === 'employee' ? 'Agência Digital' : 'Cliente Digital'),
        role: newUser.role.trim() || (newUser.userType === 'employee' ? 'Designer Gráfico' : 'Cliente AgencyOS'),
        leadershipRole: newUser.leadershipRole,
        plan: newUser.userType === 'employee' ? 'Gratuito / Equipe' : newUser.plan,
        status: newUser.status,
        designRole: newUser.designRole,
        canEditDesigns: newUser.canEditDesigns,
        canCreateDesigns: newUser.canCreateDesigns,
        canApproveDesigns: newUser.canApproveDesigns,
        canPublishPosts: newUser.canPublishPosts,
        canDeleteDesigns: newUser.canDeleteDesigns,
        allowedModules: newUser.allowedModules,
        notes: newUser.notes.trim(),
      });

      const label = newUser.userType === 'employee' ? 'Funcionário/Membro da Equipe' : 'Cliente do AgencyOS';
      showToast(`${label} ${cleanEmail} cadastrado com sucesso!`);
      setIsAddModalOpen(false);
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
        userType: editingUser.userType,
        role: editingUser.role || 'Gestor de Tráfego',
        leadershipRole: editingUser.leadershipRole || (editingUser.role?.toLowerCase().includes('marketing') ? 'lider_marketing' : editingUser.role?.toLowerCase().includes('prospec') ? 'lider_prospeccao' : editingUser.role?.toLowerCase().includes('lider') ? 'lider_geral' : 'membro'),
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

  const handleToggleUserType = async (user: FirestoreUserProfile) => {
    const isNowEmployee = isEmployeeUser(user);
    const newType = isNowEmployee ? 'client' : 'employee';
    const newPlan = newType === 'employee' ? 'Gratuito / Equipe' : 'Pro';
    const newRole = newType === 'employee' ? 'Designer Gráfico' : 'Cliente AgencyOS';

    try {
      await updateUserInFirestore(user.uid, {
        userType: newType,
        plan: newPlan,
        role: user.role === 'Cliente AgencyOS' ? 'Designer Gráfico' : user.role,
        designRole: newType === 'employee' ? 'designer' : 'cliente',
      });
      showToast(`Usuário movido para ${newType === 'employee' ? '👥 Minha Equipe' : '💼 Clientes AgencyOS'}!`);
    } catch (err) {
      console.error('Erro ao alternar tipo de usuário:', err);
      showToast('Erro ao alternar tipo de conta.');
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

    // Creative & Leadership roles/permissions
    const isLeader = Boolean(user.leadershipRole?.startsWith('lider') || user.designRole === 'lider' || user.role?.toLowerCase().includes('lider') || user.role?.toLowerCase().includes('líder') || user.role?.toLowerCase().includes('gerente') || user.role?.toLowerCase().includes('admin'));
    const isClient = Boolean(user.designRole === 'cliente' || user.role?.toLowerCase().includes('cliente') || user.role?.toLowerCase().includes('convidado'));

    setPermLeadershipRole(user.leadershipRole || (user.role?.toLowerCase().includes('marketing') ? 'lider_marketing' : user.role?.toLowerCase().includes('prospec') ? 'lider_prospeccao' : isLeader ? 'lider_geral' : 'membro'));
    setPermDesignRole(
      user.designRole ||
      (isLeader ? 'lider' : isClient ? 'cliente' : 'funcionario')
    );
    setPermCanEditDesigns(user.canEditDesigns !== undefined ? user.canEditDesigns : !isClient);
    setPermCanCreateDesigns(user.canCreateDesigns !== undefined ? user.canCreateDesigns : !isClient);
    setPermCanApproveDesigns(user.canApproveDesigns !== undefined ? user.canApproveDesigns : isLeader);
    setPermCanPublishPosts(user.canPublishPosts !== undefined ? user.canPublishPosts : !isClient);
    setPermCanDeleteDesigns(user.canDeleteDesigns !== undefined ? user.canDeleteDesigns : isLeader);
  };

  const handleSavePermissions = async () => {
    if (!permissionsModalUser) return;

    try {
      await updateUserPermissionsInFirestore(
        permissionsModalUser.uid,
        currentSelectedModules,
        {
          designRole: permDesignRole,
          leadershipRole: permLeadershipRole,
          canEditDesigns: permCanEditDesigns,
          canCreateDesigns: permCanCreateDesigns,
          canApproveDesigns: permCanApproveDesigns,
          canPublishPosts: permCanPublishPosts,
          canDeleteDesigns: permCanDeleteDesigns,
        }
      );
      showToast(`Permissões e acessos de ${permissionsModalUser.email} atualizados com sucesso!`);
      setPermissionsModalUser(null);
    } catch (err) {
      console.error('Erro ao atualizar permissões:', err);
      showToast('Erro ao salvar permissões no banco de dados.');
    }
  };

  const handleToggleBlock = async (user: FirestoreUserProfile) => {
    const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
    try {
      await updateUserInFirestore(user.uid, { status: newStatus });
      showToast(`Usuário ${user.email} foi ${newStatus === 'blocked' ? 'bloqueado' : 'desbloqueado'}.`);
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      showToast('Erro ao atualizar status do usuário.');
    }
  };

  const handleSelectRow = (uid: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.uid));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-neutral-200 pb-16">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-black font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-neutral-200 animate-slide-up text-xs">
          <Sparkles className="w-4 h-4 text-black" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-white text-black">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Gestão de Equipe & Clientes
            </h1>
            <span className="text-[10px] bg-neutral-900 border border-neutral-700 px-2 py-0.5 rounded-full text-neutral-300 font-bold">
              AgencyOS Master
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400">
            Separe sua equipe interna (gratuita e colaborativa) dos clientes assinantes com workspaces independentes.
          </p>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleOpenAddModal('employee')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-xs flex items-center gap-2 shadow-lg transition-all hover:scale-105 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            Adicionar Funcionário (Equipe)
          </button>
          <button
            onClick={() => handleOpenAddModal('client')}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-2 border border-neutral-700 transition-all hover:scale-105 cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            Cadastrar Cliente AgencyOS
          </button>
        </div>
      </div>

      {/* 4 TOP METRIC CARDS - ACCURATELY SEPARATING TEAM VS PAID CLIENTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Minha Equipe */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400">Minha Equipe</span>
            <div className="p-2 rounded-xl bg-neutral-900 text-white border border-neutral-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{totalEmployeesCount}</div>
          <div className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5">
            <span className="text-white font-bold">● {activeEmployeesCount} ativos</span>
            <span>•</span>
            <span className="text-neutral-400">Sem cobrança (Equipe)</span>
          </div>
        </div>

        {/* Clientes do AgencyOS */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400">Clientes AgencyOS</span>
            <div className="p-2 rounded-xl bg-neutral-900 text-white border border-neutral-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{totalClientsCount}</div>
          <div className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5">
            <span className="text-white font-bold">● {activeClientsCount} ativos</span>
            <span>•</span>
            <span className="text-neutral-400">{clientTrialCount} em trial</span>
          </div>
        </div>

        {/* Assinaturas SaaS Ativas */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400">Assinaturas Clientes</span>
            <div className="p-2 rounded-xl bg-neutral-900 text-white border border-neutral-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{clientTotalPaid}</div>
          <div className="text-[11px] text-neutral-400 font-medium">
            Starter: {clientPaidStarter} • Pro: {clientPaidPro} • Agency: {clientPaidAgency}
          </div>
        </div>

        {/* MRR Real dos Clientes */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400">MRR Real (Clientes)</span>
            <div className="p-2 rounded-xl bg-neutral-900 text-white border border-neutral-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            R$ {mrrEst.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-400 font-medium">
            {clientTotalPaid > 0 ? 'Faturamento mensal de clientes ativos' : 'Cadastre clientes pagantes na aba Clientes'}
          </div>
        </div>
      </div>

      {/* EXPLANATORY WORKSPACE SEPARATION BANNER */}
      {activeTab === 'Equipe' ? (
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white shrink-0">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Minha Equipe • Workspace Compartilhado da Agência</span>
                <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded-full font-black">
                  Colaboração em Tempo Real
                </span>
              </h4>
              <p className="text-xs text-neutral-400 leading-snug">
                Seus funcionários <strong className="text-white">não pagam nada no sistema</strong>. Todas as demandas de design, criativos, briefings e tarefas postadas pela agência aparecem instantaneamente para eles trabalharem.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenAddModal('employee')}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Adicionar Funcionário</span>
          </button>
        </div>
      ) : activeTab === 'Clientes' ? (
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white shrink-0">
              <Building2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Clientes do AgencyOS • Workspaces 100% Independentes</span>
                <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded-full font-black">
                  Assinantes SaaS
                </span>
              </h4>
              <p className="text-xs text-neutral-400 leading-snug">
                Clientes possuem planos faturados e <strong className="text-white">sistema único e isolado</strong>. Eles não têm acesso às demandas internas da sua agência nem aos seus funcionários.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenAddModal('client')}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Novo Cliente AgencyOS</span>
          </button>
        </div>
      ) : null}

      {/* PRIMARY TAB SWITCHER & SEARCH BAR */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Main Tabs */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1.5 rounded-2xl border border-neutral-800 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('Equipe');
                setFilterCategory('Todos');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'Equipe'
                  ? 'bg-white text-black shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Minha Equipe & Funcionários</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'Equipe' ? 'bg-black text-white' : 'bg-neutral-900 text-neutral-400'
              }`}>
                {totalEmployeesCount}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('Clientes');
                setFilterCategory('Todos');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'Clientes'
                  ? 'bg-white text-black shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Clientes do AgencyOS</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'Clientes' ? 'bg-black text-white' : 'bg-neutral-900 text-neutral-400'
              }`}>
                {totalClientsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('Planos')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'Planos'
                  ? 'bg-white text-black shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              Planos & Preços SaaS
            </button>

            <button
              onClick={() => setActiveTab('Atualizações')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'Atualizações'
                  ? 'bg-white text-black shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              Atualizações
            </button>

            <button
              onClick={() => setActiveTab('Estatísticas')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'Estatísticas'
                  ? 'bg-white text-black shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              Estatísticas
            </button>
          </div>

          {/* Search Input */}
          {(activeTab === 'Equipe' || activeTab === 'Clientes') && (
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'Equipe' ? 'Buscar funcionário por nome, email ou cargo...' : 'Buscar cliente ou empresa...'}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
              />
            </div>
          )}
        </div>

        {/* Filter Pills based on active tab */}
        {activeTab === 'Equipe' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'Todos', label: `Todos da Equipe (${totalEmployeesCount})` },
              { id: 'lideres', label: `👑 Todos os Líderes` },
              { id: 'lider_marketing', label: `🎯 Líderes de Marketing` },
              { id: 'lider_prospeccao', label: `📍 Líderes de Prospecção` },
              { id: 'lider_design', label: `🎨 Líderes de Design` },
              { id: 'designer', label: `Designers` },
              { id: 'gestor', label: `Gestores de Tráfego` },
              { id: 'active', label: `Ativos (${activeEmployeesCount})` },
              { id: 'blocked', label: 'Bloqueados' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterCategory(f.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filterCategory === f.id
                    ? 'bg-white text-black shadow-md'
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'Clientes' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'Todos', label: `Todos os Clientes (${totalClientsCount})` },
              { id: 'active', label: `Ativos (${activeClientsCount})` },
              { id: 'Trial Gratuito', label: `Trial (14 dias) (${clientTrialCount})` },
              { id: 'Starter', label: `Starter (${clientPaidStarter})` },
              { id: 'Pro', label: `Pro (${clientPaidPro})` },
              { id: 'Agency', label: `Agency (${clientPaidAgency})` },
              { id: 'cancelled', label: 'Cancelados' },
              { id: 'blocked', label: 'Bloqueados' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterCategory(f.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filterCategory === f.id
                    ? 'bg-white text-black shadow-md'
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. ABA: MINHA EQUIPE & FUNCIONÁRIOS */}
      {/* ========================================================================= */}
      {activeTab === 'Equipe' && (
        <div className="bg-[#0e0e0e] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 text-[11px] uppercase tracking-wider font-bold bg-neutral-950">
                  <th className="p-3.5 text-center w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length
                      }
                      onChange={handleSelectAll}
                      className="rounded bg-neutral-900 border-neutral-700 text-white focus:ring-0"
                    />
                  </th>
                  <th className="p-3.5">Membro da Equipe / Acesso</th>
                  <th className="p-3.5">Cargo Interno</th>
                  <th className="p-3.5">Permissões Criativas</th>
                  <th className="p-3.5">Módulos Liberados</th>
                  <th className="p-3.5">Faturamento</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-neutral-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-white mb-2" />
                      Carregando equipe do Firestore...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-neutral-500 space-y-2">
                      <Users className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
                      <p className="font-bold text-neutral-300">Nenhum funcionário encontrado nesta categoria</p>
                      <p className="text-xs text-neutral-500">
                        Adicione um novo membro para que ele possa acessar e colaborar nas demandas da agência.
                      </p>
                      <button
                        onClick={() => handleOpenAddModal('employee')}
                        className="mt-3 px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-neutral-200 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 inline mr-1.5" />
                        Adicionar Funcionário
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedUserIds.includes(user.uid);
                    const isMaster = isUserMasterAdmin(user);
                    const allowedList = user.allowedModules || ALL_OPERATIONAL_MODULE_IDS;
                    const allowedCount = isMaster ? ALL_OPERATIONAL_MODULE_IDS.length : allowedList.length;

                    const isMarketingLeader = user.leadershipRole === 'lider_marketing' || user.role?.toLowerCase().includes('marketing');
                    const isProspectingLeader = user.leadershipRole === 'lider_prospeccao' || user.role?.toLowerCase().includes('prospec') || user.role?.toLowerCase().includes('sdr') || user.role?.toLowerCase().includes('closer');
                    const isDesignLeader = user.leadershipRole === 'lider_design' || (user.designRole === 'lider' && !isMarketingLeader && !isProspectingLeader);
                    const isGeneralLeader = user.leadershipRole === 'lider_geral' || (!isMarketingLeader && !isProspectingLeader && !isDesignLeader && (user.role?.toLowerCase().includes('lider') || user.role?.toLowerCase().includes('líder') || user.role?.toLowerCase().includes('gerente') || user.role?.toLowerCase().includes('diretor')));

                    return (
                      <tr
                        key={user.uid}
                        className={`hover:bg-neutral-900/40 transition-colors ${
                          isSelected ? 'bg-neutral-900/60' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(user.uid)}
                            className="rounded bg-neutral-900 border-neutral-700 text-white focus:ring-0"
                          />
                        </td>

                        {/* User Email + Password Hint + Copy */}
                        <td className="p-3.5">
                          <div className="font-bold text-neutral-100 flex items-center gap-1.5 flex-wrap">
                            <span className="truncate max-w-[200px]">{user.name || user.email.split('@')[0]}</span>
                            {isMaster && (
                              <span className="text-[9px] bg-white text-black px-1.5 py-0.5 rounded font-black">
                                ADMIN
                              </span>
                            )}
                            {isMarketingLeader && !isMaster && (
                              <span className="text-[9px] bg-emerald-400 text-black px-1.5 py-0.5 rounded font-black flex items-center gap-0.5 shadow-sm">
                                <Target className="w-2.5 h-2.5" /> LÍDER MARKETING
                              </span>
                            )}
                            {isProspectingLeader && !isMaster && (
                              <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-black flex items-center gap-0.5 shadow-sm">
                                <MapPin className="w-2.5 h-2.5" /> LÍDER PROSPECÇÃO
                              </span>
                            )}
                            {isDesignLeader && !isMaster && (
                              <span className="text-[9px] bg-sky-400 text-black px-1.5 py-0.5 rounded font-black flex items-center gap-0.5 shadow-sm">
                                <Palette className="w-2.5 h-2.5" /> LÍDER DESIGN
                              </span>
                            )}
                            {isGeneralLeader && !isMarketingLeader && !isProspectingLeader && !isDesignLeader && !isMaster && (
                              <span className="text-[9px] bg-amber-300 text-black px-1.5 py-0.5 rounded font-black flex items-center gap-0.5 shadow-sm">
                                <Crown className="w-2.5 h-2.5" /> LÍDER GERAL
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-neutral-400 font-mono mt-0.5 flex items-center gap-2">
                            <span>{user.email}</span>
                            {user.tempPasswordHint && (
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-mono text-neutral-300 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
                                  {user.tempPasswordHint}
                                </span>
                                <button
                                  onClick={() => handleCopyCredentials(user.email, user.tempPasswordHint)}
                                  title="Copiar credenciais"
                                  className="text-neutral-400 hover:text-white cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Cargo Interno */}
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                            isMarketingLeader
                              ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                              : isProspectingLeader
                              ? 'bg-amber-950/60 border-amber-800/80 text-amber-300'
                              : isDesignLeader
                              ? 'bg-sky-950/60 border-sky-800/80 text-sky-300'
                              : isGeneralLeader
                              ? 'bg-purple-950/60 border-purple-800/80 text-purple-300'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                          }`}>
                            {isMarketingLeader ? (
                              <Target className="w-3 h-3 text-emerald-400" />
                            ) : isProspectingLeader ? (
                              <MapPin className="w-3 h-3 text-amber-400" />
                            ) : isDesignLeader ? (
                              <Palette className="w-3 h-3 text-sky-400" />
                            ) : isGeneralLeader ? (
                              <Crown className="w-3 h-3 text-purple-400" />
                            ) : (
                              <Briefcase className="w-3 h-3 text-neutral-400" />
                            )}
                            {user.role || 'Membro da Equipe'}
                          </span>
                        </td>

                        {/* Permissões Criativas (Edição, Criação, Aprovação, Postagem) */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              user.canEditDesigns !== false
                                ? 'bg-neutral-900 text-white border border-neutral-700'
                                : 'bg-neutral-950 text-neutral-600 border border-neutral-900 line-through'
                            }`}>
                              Editar
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              user.canCreateDesigns !== false
                                ? 'bg-neutral-900 text-white border border-neutral-700'
                                : 'bg-neutral-950 text-neutral-600 border border-neutral-900 line-through'
                            }`}>
                              Criar
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              user.canApproveDesigns
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-neutral-950 text-neutral-600 border border-neutral-900'
                            }`}>
                              {user.canApproveDesigns ? 'Aprovar ✓' : 'Sem Aprovação'}
                            </span>
                          </div>
                        </td>

                        {/* Módulos Liberados */}
                        <td className="p-3.5">
                          <button
                            onClick={() => handleOpenPermissionsModal(user)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-200 text-[11px] font-bold transition-all cursor-pointer group"
                          >
                            <Lock className="w-3 h-3 text-white group-hover:scale-110 transition-transform" />
                            <span>
                              {isMaster
                                ? 'Acesso Total (12/12)'
                                : `${allowedCount}/${ALL_OPERATIONAL_MODULE_IDS.length} liberados`}
                            </span>
                          </button>
                        </td>

                        {/* Faturamento */}
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-950 text-neutral-400 border border-neutral-800 text-[10px] font-bold">
                            R$ 0,00 • Gratuito (Equipe)
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          {user.status === 'active' ? (
                            <span className="px-2.5 py-1 rounded-lg bg-neutral-900 text-white font-bold text-[11px] border border-neutral-700">
                              Ativo
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-neutral-950 text-neutral-400 font-bold text-[11px] border border-neutral-800">
                              Bloqueado
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Permissões Button */}
                            <button
                              onClick={() => handleOpenPermissionsModal(user)}
                              title="Gerenciar Permissões e Módulos"
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[11px] border border-neutral-700 flex items-center gap-1 cursor-pointer transition-all"
                            >
                              <Shield className="w-3 h-3" />
                              <span>Permissões</span>
                            </button>

                            {/* Move to Client Toggle */}
                            <button
                              onClick={() => handleToggleUserType(user)}
                              title="Mudar para Cliente AgencyOS"
                              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all border border-neutral-700 cursor-pointer"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => setEditingUser(user)}
                              title="Editar Dados"
                              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all border border-neutral-700 cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Block Toggle */}
                            <button
                              onClick={() => handleToggleBlock(user)}
                              title={user.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeletingUser(user)}
                              title="Excluir"
                              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 cursor-pointer"
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
      )}

      {/* ========================================================================= */}
      {/* 2. ABA: CLIENTES DO AGENCYOS (ASSINANTES SAAS) */}
      {/* ========================================================================= */}
      {activeTab === 'Clientes' && (
        <div className="bg-[#0e0e0e] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 text-[11px] uppercase tracking-wider font-bold bg-neutral-950">
                  <th className="p-3.5 text-center w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length
                      }
                      onChange={handleSelectAll}
                      className="rounded bg-neutral-900 border-neutral-700 text-white focus:ring-0"
                    />
                  </th>
                  <th className="p-3.5">Cliente / Empresa</th>
                  <th className="p-3.5">Plano Contratado</th>
                  <th className="p-3.5">Valor Mensal</th>
                  <th className="p-3.5">Status Assinatura</th>
                  <th className="p-3.5">Workspace</th>
                  <th className="p-3.5">Cadastro</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-neutral-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-white mb-2" />
                      Carregando clientes do Firestore...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-neutral-500 space-y-2">
                      <Building2 className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
                      <p className="font-bold text-neutral-300">Nenhum cliente cadastrado nesta categoria</p>
                      <p className="text-xs text-neutral-500">
                        Cadastre clientes do seu SaaS AgencyOS com planos ativos e sistema 100% independente do seu.
                      </p>
                      <button
                        onClick={() => handleOpenAddModal('client')}
                        className="mt-3 px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-neutral-200 cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5 inline mr-1.5" />
                        Cadastrar Novo Cliente
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedUserIds.includes(user.uid);
                    
                    let planPrice = 0;
                    if (user.plan === 'Starter') planPrice = 99;
                    if (user.plan === 'Pro') planPrice = 199;
                    if (user.plan === 'Agency') planPrice = 499;

                    return (
                      <tr
                        key={user.uid}
                        className={`hover:bg-neutral-900/40 transition-colors ${
                          isSelected ? 'bg-neutral-900/60' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(user.uid)}
                            className="rounded bg-neutral-900 border-neutral-700 text-white focus:ring-0"
                          />
                        </td>

                        {/* Cliente / Empresa */}
                        <td className="p-3.5">
                          <div className="font-bold text-neutral-100 flex items-center gap-1.5">
                            <span className="truncate max-w-[220px]">{user.agencyName || user.name || 'Cliente'}</span>
                            <span className="text-[9px] bg-neutral-900 text-neutral-300 border border-neutral-700 px-1.5 py-0.5 rounded font-bold">
                              CLIENTE SAAS
                            </span>
                          </div>

                          <div className="text-[11px] text-neutral-400 font-mono mt-0.5 flex items-center gap-2">
                            <span>{user.email}</span>
                            {user.tempPasswordHint && (
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-mono text-neutral-300 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
                                  {user.tempPasswordHint}
                                </span>
                                <button
                                  onClick={() => handleCopyCredentials(user.email, user.tempPasswordHint)}
                                  title="Copiar credenciais"
                                  className="text-neutral-400 hover:text-white cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Plano Contratado */}
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-lg font-black text-[11px] border ${
                            user.plan === 'Agency'
                              ? 'bg-amber-400/10 text-amber-300 border-amber-500/30'
                              : user.plan === 'Pro'
                              ? 'bg-white text-black border-white'
                              : 'bg-neutral-950 text-neutral-200 border-neutral-800'
                          }`}>
                            {user.plan}
                          </span>
                        </td>

                        {/* Valor Mensal */}
                        <td className="p-3.5 font-bold text-neutral-200">
                          {planPrice > 0 ? (
                            <span>R$ {planPrice},00 / mês</span>
                          ) : (
                            <span className="text-neutral-400">Trial Gratuito (14d)</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          {user.status === 'active' && (
                            <span className="px-2.5 py-1 rounded-lg bg-neutral-900 text-white font-bold text-[11px] border border-neutral-700">
                              Ativo
                            </span>
                          )}
                          {user.status === 'Trial Expirado' && (
                            <span className="px-2.5 py-1 rounded-lg bg-neutral-950 text-neutral-400 font-bold text-[11px] border border-neutral-800">
                              Trial Expirado
                            </span>
                          )}
                          {user.status === 'cancelled' && (
                            <span className="px-2.5 py-1 rounded-lg bg-neutral-950 text-neutral-500 font-bold text-[11px] border border-neutral-800">
                              Cancelado
                            </span>
                          )}
                          {user.status === 'blocked' && (
                            <span className="px-2.5 py-1 rounded-lg bg-neutral-950 text-neutral-400 font-bold text-[11px] border border-neutral-800">
                              Bloqueado
                            </span>
                          )}
                        </td>

                        {/* Workspace Isolado */}
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 text-[11px] font-bold">
                            <Lock className="w-3 h-3 text-emerald-400" />
                            Independente & Único
                          </span>
                        </td>

                        {/* Cadastro */}
                        <td className="p-3.5 text-neutral-400 font-mono text-[11px]">
                          {user.createdAt || '13/07/2026'}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Move to Employee */}
                            <button
                              onClick={() => handleToggleUserType(user)}
                              title="Mudar para Membro da Equipe"
                              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all border border-neutral-700 cursor-pointer"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => setEditingUser(user)}
                              title="Editar Dados e Plano"
                              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all border border-neutral-700 cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Block Toggle */}
                            <button
                              onClick={() => handleToggleBlock(user)}
                              title={user.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeletingUser(user)}
                              title="Excluir Cliente"
                              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 cursor-pointer"
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
      )}

      {/* ========================================================================= */}
      {/* 3. ABA: PLANOS & PREÇOS SAAS */}
      {/* ========================================================================= */}
      {activeTab === 'Planos' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto py-2">
            <h3 className="text-lg font-black text-white">Planos Comerciais para Clientes do AgencyOS</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Estes são os planos e limites aplicados para clientes externos cadastrados no sistema.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="p-6 rounded-3xl bg-[#0e0e0e] border border-neutral-800 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-400">Starter</span>
                  <span className="px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-300 text-[10px] font-bold border border-neutral-800">
                    Autônomos
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">R$ 99</span>
                  <span className="text-xs text-neutral-500">/mês</span>
                </div>
                <p className="text-xs text-neutral-400">Para profissionais autônomos e pequenas agências iniciando no mercado.</p>
                <ul className="space-y-2 text-xs text-neutral-300 pt-2 border-t border-neutral-800/80">
                  <li className="flex items-center gap-2">✓ 1 Workspace Exclusivo</li>
                  <li className="flex items-center gap-2">✓ Dashboard Geral & Relatórios</li>
                  <li className="flex items-center gap-2">✓ Gestão de Tráfego & Campanhas</li>
                  <li className="flex items-center gap-2">✓ Suporte via E-mail</li>
                </ul>
              </div>
              <div className="text-xs font-bold text-neutral-400 text-center bg-neutral-950 py-2.5 rounded-xl border border-neutral-800">
                {clientPaidStarter} Clientes Ativos
              </div>
            </div>

            {/* Pro */}
            <div className="p-6 rounded-3xl bg-[#0e0e0e] border border-white flex flex-col justify-between space-y-6 relative shadow-2xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black font-black text-[10px] px-3 py-0.5 rounded-full tracking-wider uppercase">
                Mais Popular
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300">Pro</span>
                  <span className="px-2 py-0.5 rounded-full bg-neutral-900 text-white text-[10px] font-bold border border-neutral-700">
                    Agências em Alta
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">R$ 199</span>
                  <span className="text-xs text-neutral-500">/mês</span>
                </div>
                <p className="text-xs text-neutral-400">Para agências completas com alta demanda de tráfego, social media e design.</p>
                <ul className="space-y-2 text-xs text-neutral-300 pt-2 border-t border-neutral-800/80">
                  <li className="flex items-center gap-2">✓ Todos os Módulos Operacionais</li>
                  <li className="flex items-center gap-2">✓ Social Media Hub & IA Integrada</li>
                  <li className="flex items-center gap-2">✓ Maps Scraper & CRM Pro</li>
                  <li className="flex items-center gap-2">✓ Suporte Prioritário WhatsApp</li>
                </ul>
              </div>
              <div className="text-xs font-bold text-white text-center bg-neutral-900 py-2.5 rounded-xl border border-neutral-700">
                {clientPaidPro} Clientes Ativos
              </div>
            </div>

            {/* Agency */}
            <div className="p-6 rounded-3xl bg-[#0e0e0e] border border-neutral-800 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-400">Agency</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                    Enterprise
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">R$ 499</span>
                  <span className="text-xs text-neutral-500">/mês</span>
                </div>
                <p className="text-xs text-neutral-400">Para grandes operações com múltiplos sub-workspaces e suporte dedicado 24/7.</p>
                <ul className="space-y-2 text-xs text-neutral-300 pt-2 border-t border-neutral-800/80">
                  <li className="flex items-center gap-2">✓ Tudo do plano Pro ilimitado</li>
                  <li className="flex items-center gap-2">✓ Exportação de Dados em Alta Escala</li>
                  <li className="flex items-center gap-2">✓ Gestor de Contas Dedicado</li>
                  <li className="flex items-center gap-2">✓ SLA 99.9% Garantido</li>
                </ul>
              </div>
              <div className="text-xs font-bold text-neutral-400 text-center bg-neutral-950 py-2.5 rounded-xl border border-neutral-800">
                {clientPaidAgency} Clientes Ativos
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ABA: ATUALIZAÇÕES */}
      {/* ========================================================================= */}
      {activeTab === 'Atualizações' && (
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="p-6 rounded-3xl bg-[#0e0e0e] border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold bg-white text-black px-2.5 py-1 rounded-full font-black">
                v2.6.0 • Recente
              </span>
              <span className="text-xs text-neutral-500 font-mono">Agosto 2026</span>
            </div>
            <h3 className="text-base font-black text-white">Divisão Completa: Minha Equipe vs Clientes AgencyOS</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Implementada a separação total entre os membros internos da equipe e os clientes assinantes do SaaS.
              Os funcionários não geram faturamento ($0) e compartilham o workspace da agência em tempo real para visualizar e executar as demandas postadas. Os clientes contam com sistemas 100% independentes e planos ativos faturados.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e0e0e] border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold bg-neutral-900 text-neutral-300 px-2.5 py-1 rounded-full border border-neutral-700">
                v2.5.0
              </span>
              <span className="text-xs text-neutral-500 font-mono">Agosto 2026</span>
            </div>
            <h3 className="text-base font-black text-white">Carrossel Multi-Imagens & Permissões Criativas Granulares</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Suporte a uploads de múltiplas imagens por criativo, publicação com legendas, fluxo de aprovação com status e permissões para Líderes, Designers e Gestores.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ABA: ESTATÍSTICAS */}
      {/* ========================================================================= */}
      {activeTab === 'Estatísticas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-[#0e0e0e] border border-neutral-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4" /> Distribuição da Equipe Interna
              </h4>
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Total de Membros da Equipe</span>
                  <span className="font-bold text-white">{totalEmployeesCount}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Líderes & Gestores</span>
                  <span className="font-bold text-white">
                    {employeeUsers.filter((u) => u.designRole === 'lider' || u.role?.toLowerCase().includes('lider')).length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Designers & Operacionais</span>
                  <span className="font-bold text-white">
                    {employeeUsers.filter((u) => u.designRole === 'designer' || u.role?.toLowerCase().includes('designer')).length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-400">Custo Total de Usuários de Equipe</span>
                  <span className="font-bold text-emerald-400">R$ 0,00 (Gratuito)</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#0e0e0e] border border-neutral-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Distribuição de Clientes SaaS
              </h4>
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Total de Clientes Cadastrados</span>
                  <span className="font-bold text-white">{totalClientsCount}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Assinaturas Ativas Pagas</span>
                  <span className="font-bold text-white">{clientTotalPaid}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Clientes em Período de Teste</span>
                  <span className="font-bold text-white">{clientTrialCount}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-400">MRR Total dos Clientes</span>
                  <span className="font-bold text-white">
                    R$ {mrrEst.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADICIONAR USUÁRIO (EQUIPE OU CLIENTE) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-7 w-full max-w-2xl shadow-2xl text-neutral-200 relative my-8 animate-scale-up">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* User Type Switcher */}
            <div className="flex items-center gap-2 p-1.5 bg-neutral-950 border border-neutral-800 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => handleOpenAddModal('employee')}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  newUser.userType === 'employee'
                    ? 'bg-white text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Membro da Equipe (Funcionário)</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenAddModal('client')}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  newUser.userType === 'client'
                    ? 'bg-white text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Cliente do AgencyOS (Assinante SaaS)</span>
              </button>
            </div>

            {/* Modal Title & Note */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white shrink-0">
                {newUser.userType === 'employee' ? (
                  <Users className="w-6 h-6 stroke-[2.2]" />
                ) : (
                  <Building2 className="w-6 h-6 stroke-[2.2]" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {newUser.userType === 'employee'
                    ? 'Cadastrar Funcionário / Membro da Equipe'
                    : 'Cadastrar Novo Cliente do AgencyOS'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {newUser.userType === 'employee'
                    ? 'Acesso gratuito ao workspace compartilhado para visualizar e executar as demandas da agência.'
                    : 'Workspace independente e isolado com plano faturado para este cliente.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              {/* Name & Agency/Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1.5">
                    {newUser.userType === 'employee' ? 'Nome do Funcionário *' : 'Nome do Responsável *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder={newUser.userType === 'employee' ? 'ex: Vitória Designer' : 'ex: Lucas Silva'}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1.5">
                    {newUser.userType === 'employee' ? 'Nome da Agência' : 'Empresa / Agência do Cliente *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.agencyName}
                    onChange={(e) => setNewUser({ ...newUser, agencyName: e.target.value })}
                    placeholder="ex: Agência Digital"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1.5">E-mail de Login *</label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="ex: colaborador@empresa.com"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-neutral-300 font-bold">Senha de Acesso *</label>
                    <button
                      type="button"
                      onClick={() => setNewUser({ ...newUser, password: generateRandomPassword() })}
                      className="text-[10px] text-neutral-300 hover:text-white underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Gerar Senha
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showAddPassword ? 'text' : 'password'}
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Mínimo 6 dígitos"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      {showAddPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role & Plan Fields */}
              {newUser.userType === 'employee' ? (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-neutral-300 font-bold mb-1.5">Cargo Interno / Liderança</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => {
                          const r = e.target.value;
                          let leadership: 'lider_geral' | 'lider_marketing' | 'lider_prospeccao' | 'lider_design' | 'membro' = 'membro';
                          let dRole: 'admin' | 'lider' | 'designer' | 'funcionario' | 'cliente' = 'funcionario';
                          let approve = false;
                          let mods: ViewType[] = [...ALL_OPERATIONAL_MODULE_IDS];

                          if (r === 'Líder Geral') {
                            leadership = 'lider_geral';
                            dRole = 'lider';
                            approve = true;
                            mods = [...ALL_OPERATIONAL_MODULE_IDS];
                          } else if (r === 'Líder de Marketing') {
                            leadership = 'lider_marketing';
                            dRole = 'lider';
                            approve = true;
                            mods = ['dashboard', 'marketing', 'campanhas', 'social-hub', 'designer', 'studio-agency', 'calculadora-roi', 'relatorios', 'ia-consultora', 'agenda'];
                          } else if (r === 'Líder de Prospecção') {
                            leadership = 'lider_prospeccao';
                            dRole = 'lider';
                            approve = false;
                            mods = ['dashboard', 'maps-scraper', 'agenda', 'relatorios', 'campanhas', 'social-hub', 'ia-consultora', 'calculadora-roi'];
                          } else if (r === 'Líder de Design') {
                            leadership = 'lider_design';
                            dRole = 'lider';
                            approve = true;
                            mods = ['dashboard', 'designer', 'studio-agency', 'social-hub', 'kanban', 'agenda', 'relatorios'];
                          } else if (r === 'Gestor de Tráfego') {
                            leadership = 'membro';
                            dRole = 'designer';
                            approve = false;
                            mods = ['dashboard', 'campanhas', 'marketing', 'calculadora-roi', 'relatorios', 'ia-consultora', 'agenda'];
                          } else if (r === 'Closer / SDR de Prospecção') {
                            leadership = 'membro';
                            dRole = 'funcionario';
                            approve = false;
                            mods = ['dashboard', 'maps-scraper', 'agenda', 'relatorios', 'ia-consultora'];
                          } else if (r === 'Designer Gráfico') {
                            leadership = 'membro';
                            dRole = 'designer';
                            approve = false;
                            mods = ['dashboard', 'designer', 'studio-agency', 'social-hub', 'kanban', 'agenda'];
                          } else {
                            leadership = 'membro';
                            dRole = 'funcionario';
                            approve = false;
                            mods = ['dashboard', 'kanban', 'agenda'];
                          }

                          setNewUser({
                            ...newUser,
                            role: r,
                            leadershipRole: leadership,
                            designRole: dRole,
                            canApproveDesigns: approve,
                            canDeleteDesigns: approve,
                            allowedModules: mods,
                          });
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-white"
                      >
                        <optgroup label="👑 Cargos de Liderança da Agência">
                          <option value="Líder Geral">👑 Líder Geral (Gestão Total)</option>
                          <option value="Líder de Marketing">🎯 Líder de Marketing (Estratégia, Ads & Social)</option>
                          <option value="Líder de Prospecção">📍 Líder de Prospecção (Comercial, SDR & Vendas)</option>
                          <option value="Líder de Design">🎨 Líder de Design (Direção de Arte & Aprovações)</option>
                        </optgroup>
                        <optgroup label="👥 Equipe Operacional">
                          <option value="Designer Gráfico">🎨 Designer Gráfico (Criação de Artes)</option>
                          <option value="Gestor de Tráfego">🚀 Gestor de Tráfego (Meta & Google Ads)</option>
                          <option value="Closer / SDR de Prospecção">💼 Closer / SDR de Prospecção (CRM & Leads)</option>
                          <option value="Editor de Vídeo">🎬 Editor de Vídeo</option>
                          <option value="Copywriter / Redator">✍️ Copywriter / Redator</option>
                          <option value="Social Media Manager">📱 Social Media Manager</option>
                          <option value="Colaborador">👔 Colaborador Geral</option>
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-bold mb-1.5">Tipo de Faturamento</label>
                      <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 font-bold flex items-center justify-between">
                        <span>Gratuito (Equipe)</span>
                        <span className="text-[10px] bg-neutral-900 px-2 py-0.5 rounded text-white border border-neutral-700 font-bold">
                          R$ 0,00
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Preset Buttons for New Employee */}
                  <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                    <span className="text-[11px] font-bold text-neutral-400 block">⚡ Aplicar Perfil & Módulos Recomendados:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: '👑 Líder Geral', role: 'Líder Geral', leadership: 'lider_geral' as const, designRole: 'lider' as const, approve: true, mods: [...ALL_OPERATIONAL_MODULE_IDS] },
                        { label: '🎯 Líder Marketing', role: 'Líder de Marketing', leadership: 'lider_marketing' as const, designRole: 'lider' as const, approve: true, mods: ['dashboard', 'marketing', 'campanhas', 'social-hub', 'designer', 'studio-agency', 'calculadora-roi', 'relatorios', 'ia-consultora', 'agenda'] as ViewType[] },
                        { label: '📍 Líder Prospecção', role: 'Líder de Prospecção', leadership: 'lider_prospeccao' as const, designRole: 'lider' as const, approve: false, mods: ['dashboard', 'maps-scraper', 'agenda', 'relatorios', 'campanhas', 'social-hub', 'ia-consultora', 'calculadora-roi'] as ViewType[] },
                        { label: '🎨 Líder Design', role: 'Líder de Design', leadership: 'lider_design' as const, designRole: 'lider' as const, approve: true, mods: ['dashboard', 'designer', 'studio-agency', 'social-hub', 'kanban', 'agenda', 'relatorios'] as ViewType[] },
                        { label: '🚀 Gestor Tráfego', role: 'Gestor de Tráfego', leadership: 'membro' as const, designRole: 'designer' as const, approve: false, mods: ['dashboard', 'campanhas', 'marketing', 'calculadora-roi', 'relatorios', 'ia-consultora', 'agenda'] as ViewType[] },
                        { label: '💼 Closer / SDR', role: 'Closer / SDR de Prospecção', leadership: 'membro' as const, designRole: 'funcionario' as const, approve: false, mods: ['dashboard', 'maps-scraper', 'agenda', 'relatorios', 'ia-consultora'] as ViewType[] },
                        { label: '🎨 Designer', role: 'Designer Gráfico', leadership: 'membro' as const, designRole: 'designer' as const, approve: false, mods: ['dashboard', 'designer', 'studio-agency', 'social-hub', 'kanban', 'agenda'] as ViewType[] },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setNewUser({
                              ...newUser,
                              role: preset.role,
                              leadershipRole: preset.leadership,
                              designRole: preset.designRole,
                              canApproveDesigns: preset.approve,
                              canDeleteDesigns: preset.approve,
                              allowedModules: preset.mods,
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-white hover:text-black border border-neutral-700 text-[10px] font-bold text-neutral-300 transition-all cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-neutral-300 font-bold mb-1.5">Plano Contratado</label>
                    <select
                      value={newUser.plan}
                      onChange={(e) => setNewUser({ ...newUser, plan: e.target.value as any })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white"
                    >
                      <option value="Starter">Starter (R$ 99/mês)</option>
                      <option value="Pro">Pro (R$ 199/mês)</option>
                      <option value="Agency">Agency (R$ 499/mês)</option>
                      <option value="Trial Gratuito">Trial Gratuito (14 dias)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-bold mb-1.5">Status da Assinatura</label>
                    <select
                      value={newUser.status}
                      onChange={(e) => setNewUser({ ...newUser, status: e.target.value as any })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-white"
                    >
                      <option value="active">Ativo (Liberado)</option>
                      <option value="Trial Gratuito">Em Teste</option>
                      <option value="blocked">Bloqueado</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Module Permissions */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-neutral-300 font-bold">Módulos Liberados para este Usuário</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNewUser({ ...newUser, allowedModules: [...ALL_OPERATIONAL_MODULE_IDS] })}
                      className="text-[10px] text-neutral-300 hover:text-white font-bold underline cursor-pointer"
                    >
                      Marcar Todos
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setNewUser({ ...newUser, allowedModules: ['dashboard', 'designer', 'social-hub'] })}
                      className="text-[10px] text-neutral-300 hover:text-white font-bold underline cursor-pointer"
                    >
                      Apenas Criação
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-2.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                  {ALL_SYSTEM_MODULES.filter((m) => m.id !== 'admin').map((mod) => {
                    const isChecked = newUser.allowedModules.includes(mod.id);
                    return (
                      <label
                        key={mod.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-neutral-900 border-white text-white'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setNewUser({
                                ...newUser,
                                allowedModules: newUser.allowedModules.filter((id) => id !== mod.id),
                              });
                            } else {
                              setNewUser({
                                ...newUser,
                                allowedModules: [...newUser.allowedModules, mod.id],
                              });
                            }
                          }}
                          className="rounded bg-neutral-900 border-neutral-700 text-white focus:ring-0"
                        />
                        <span className="truncate">{mod.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-black flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {isCreatingUser ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      Salvar e Liberar Acesso
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GERENCIAR PERMISSÕES GRANULARES */}
      {/* ========================================================================= */}
      {permissionsModalUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-7 w-full max-w-2xl shadow-2xl text-neutral-200 relative my-8 animate-scale-up">
            <button
              onClick={() => setPermissionsModalUser(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white shrink-0">
                <Shield className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Controle de Permissões & Módulos</h3>
                <p className="text-xs text-neutral-400 font-mono">
                  {permissionsModalUser.email} ({permissionsModalUser.name})
                </p>
              </div>
            </div>

            <div className="space-y-5 text-xs">
              {/* Quick Presets for Permissions */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="text-[11px] font-bold text-neutral-400 block">⚡ Aplicar Modelo de Cargo & Permissões Instantâneo:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    {
                      label: '👑 Líder Geral',
                      leadership: 'lider_geral' as const,
                      design: 'lider' as const,
                      canEdit: true,
                      canApprove: true,
                      canPublish: true,
                      canDelete: true,
                      mods: [...ALL_OPERATIONAL_MODULE_IDS],
                    },
                    {
                      label: '🎯 Líder de Marketing',
                      leadership: 'lider_marketing' as const,
                      design: 'lider' as const,
                      canEdit: true,
                      canApprove: true,
                      canPublish: true,
                      canDelete: true,
                      mods: ['dashboard', 'marketing', 'campanhas', 'social-hub', 'designer', 'studio-agency', 'calculadora-roi', 'relatorios', 'ia-consultora', 'agenda'] as ViewType[],
                    },
                    {
                      label: '📍 Líder de Prospecção',
                      leadership: 'lider_prospeccao' as const,
                      design: 'lider' as const,
                      canEdit: true,
                      canApprove: false,
                      canPublish: true,
                      canDelete: false,
                      mods: ['dashboard', 'maps-scraper', 'agenda', 'relatorios', 'campanhas', 'social-hub', 'ia-consultora', 'calculadora-roi'] as ViewType[],
                    },
                    {
                      label: '🎨 Líder de Design',
                      leadership: 'lider_design' as const,
                      design: 'lider' as const,
                      canEdit: true,
                      canApprove: true,
                      canPublish: true,
                      canDelete: true,
                      mods: ['dashboard', 'designer', 'studio-agency', 'social-hub', 'kanban', 'agenda', 'relatorios'] as ViewType[],
                    },
                    {
                      label: '🚀 Gestor de Tráfego',
                      leadership: 'membro' as const,
                      design: 'designer' as const,
                      canEdit: true,
                      canApprove: false,
                      canPublish: true,
                      canDelete: false,
                      mods: ['dashboard', 'campanhas', 'marketing', 'calculadora-roi', 'relatorios', 'ia-consultora', 'agenda'] as ViewType[],
                    },
                    {
                      label: '💼 Closer / SDR',
                      leadership: 'membro' as const,
                      design: 'funcionario' as const,
                      canEdit: false,
                      canApprove: false,
                      canPublish: false,
                      canDelete: false,
                      mods: ['dashboard', 'maps-scraper', 'agenda', 'relatorios', 'ia-consultora'] as ViewType[],
                    },
                    {
                      label: '🎨 Designer',
                      leadership: 'membro' as const,
                      design: 'designer' as const,
                      canEdit: true,
                      canApprove: false,
                      canPublish: true,
                      canDelete: false,
                      mods: ['dashboard', 'designer', 'studio-agency', 'social-hub', 'kanban', 'agenda'] as ViewType[],
                    },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setPermLeadershipRole(p.leadership);
                        setPermDesignRole(p.design);
                        setPermCanEditDesigns(p.canEdit);
                        setPermCanApproveDesigns(p.canApprove);
                        setPermCanPublishPosts(p.canPublish);
                        setPermCanDeleteDesigns(p.canDelete);
                        setCurrentSelectedModules(p.mods);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-white hover:text-black border border-neutral-700 text-[10px] font-bold text-neutral-300 transition-all cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leadership Role Selector */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Designação de Liderança na Agência</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 font-bold mb-1">Nível / Cargo de Líder</label>
                    <select
                      value={permLeadershipRole}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setPermLeadershipRole(val);
                        if (val !== 'membro') {
                          setPermDesignRole('lider');
                          setPermCanApproveDesigns(true);
                        }
                      }}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none"
                    >
                      <option value="lider_geral">👑 Líder Geral (Gestão & Acesso Amplo)</option>
                      <option value="lider_marketing">🎯 Líder de Marketing (Comando de Campanhas & Social)</option>
                      <option value="lider_prospeccao">📍 Líder de Prospecção (Comando Comercial & CRM)</option>
                      <option value="lider_design">🎨 Líder de Design (Direção Criativa & Aprovações)</option>
                      <option value="membro">👔 Membro / Sem Cargo de Liderança</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-bold mb-1">Papel na Equipe Criativa</label>
                    <select
                      value={permDesignRole}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setPermDesignRole(val);
                        if (val === 'lider' || val === 'admin') {
                          setPermCanEditDesigns(true);
                          setPermCanCreateDesigns(true);
                          setPermCanApproveDesigns(true);
                          setPermCanPublishPosts(true);
                          setPermCanDeleteDesigns(true);
                        } else if (val === 'cliente') {
                          setPermCanEditDesigns(false);
                          setPermCanCreateDesigns(false);
                          setPermCanApproveDesigns(true);
                          setPermCanPublishPosts(false);
                          setPermCanDeleteDesigns(false);
                        }
                      }}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none"
                    >
                      <option value="lider">👑 Líder / Gerente Criativo (Poder Total)</option>
                      <option value="designer">🎨 Designer / Criador (Cria e Edita)</option>
                      <option value="funcionario">👔 Funcionário Geral</option>
                      <option value="cliente">💼 Cliente (Apenas Aprovação)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-neutral-800">
                  <label className="flex items-center gap-2 font-bold text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permCanEditDesigns}
                      onChange={(e) => setPermCanEditDesigns(e.target.checked)}
                      className="rounded bg-neutral-900 border-neutral-700 text-white focus:ring-0"
                    />
                    <span>Pode Criar/Editar</span>
                  </label>

                  <label className="flex items-center gap-2 font-bold text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permCanApproveDesigns}
                      onChange={(e) => setPermCanApproveDesigns(e.target.checked)}
                      className="rounded bg-neutral-900 border-neutral-700 text-white focus:ring-0"
                    />
                    <span>Pode Aprovar Artes</span>
                  </label>

                  <label className="flex items-center gap-2 font-bold text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permCanPublishPosts}
                      onChange={(e) => setPermCanPublishPosts(e.target.checked)}
                      className="rounded bg-neutral-900 border-neutral-700 text-white focus:ring-0"
                    />
                    <span>Pode Agendar Posts</span>
                  </label>
                </div>
              </div>

              {/* Module Access Checkboxes */}
              <div className="space-y-2">
                <label className="text-neutral-300 font-bold block">Acesso aos Módulos do Sistema</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                  {ALL_SYSTEM_MODULES.filter((m) => m.id !== 'admin').map((mod) => {
                    const isChecked = currentSelectedModules.includes(mod.id);
                    return (
                      <label
                        key={mod.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border font-bold cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-neutral-900 border-white text-white'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setCurrentSelectedModules(currentSelectedModules.filter((id) => id !== mod.id));
                            } else {
                              setCurrentSelectedModules([...currentSelectedModules, mod.id]);
                            }
                          }}
                          className="rounded bg-neutral-900 border-neutral-700 text-white focus:ring-0"
                        />
                        <span className="truncate">{mod.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setPermissionsModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-black flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  Salvar Permissões
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR USUÁRIO */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 w-full max-w-md shadow-2xl text-neutral-200 relative my-8 animate-scale-up">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white mb-4">Editar Dados do Usuário</h3>

            <form onSubmit={handleUpdateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">E-mail</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Tipo de Usuário</label>
                  <select
                    value={editingUser.userType || (isEmployeeUser(editingUser) ? 'employee' : 'client')}
                    onChange={(e) => {
                      const t = e.target.value as 'employee' | 'client';
                      setEditingUser({
                        ...editingUser,
                        userType: t,
                        plan: t === 'employee' ? 'Gratuito / Equipe' : (editingUser.plan === 'Gratuito / Equipe' ? 'Pro' : editingUser.plan),
                      });
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="employee">👥 Equipe (Gratuito)</option>
                    <option value="client">💼 Cliente (SaaS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Cargo / Posição</label>
                  <input
                    type="text"
                    value={editingUser.role || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {editingUser.userType === 'employee' && (
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Nível de Liderança na Agência</label>
                  <select
                    value={editingUser.leadershipRole || (editingUser.role?.toLowerCase().includes('marketing') ? 'lider_marketing' : editingUser.role?.toLowerCase().includes('prospec') ? 'lider_prospeccao' : editingUser.role?.toLowerCase().includes('lider') ? 'lider_geral' : 'membro')}
                    onChange={(e) => {
                      const lRole = e.target.value as any;
                      setEditingUser({
                        ...editingUser,
                        leadershipRole: lRole,
                        designRole: lRole !== 'membro' ? 'lider' : (editingUser.designRole || 'designer'),
                      });
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-white"
                  >
                    <option value="lider_geral">👑 Líder Geral</option>
                    <option value="lider_marketing">🎯 Líder de Marketing</option>
                    <option value="lider_prospeccao">📍 Líder de Prospecção</option>
                    <option value="lider_design">🎨 Líder de Design</option>
                    <option value="membro">👔 Membro da Equipe</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Plano</label>
                  <select
                    value={editingUser.plan}
                    onChange={(e) => setEditingUser({ ...editingUser, plan: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="Gratuito / Equipe">Gratuito / Equipe</option>
                    <option value="Trial Gratuito">Trial Gratuito</option>
                    <option value="Starter">Starter</option>
                    <option value="Pro">Pro</option>
                    <option value="Agency">Agency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="active">Ativo</option>
                    <option value="Trial Expirado">Trial Expirado</option>
                    <option value="cancelled">Cancelado</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Senha de Acesso</label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editingUser.tempPasswordHint || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, tempPasswordHint: e.target.value })}
                    placeholder="Digite nova senha..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-black flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EXCLUIR USUÁRIO */}
      {/* ========================================================================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 w-full max-w-md shadow-2xl text-neutral-200 relative animate-scale-up">
            <button
              onClick={() => setDeletingUser(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Excluir Usuário</h3>
                <p className="text-xs text-neutral-400 font-bold">Esta ação é irreversível</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 mb-6 leading-relaxed">
              Tem certeza que deseja excluir permanentemente o usuário{' '}
              <strong className="text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700 font-mono">
                {deletingUser.email}
              </strong>{' '}
              do sistema?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-xs flex items-center gap-2 shadow-md cursor-pointer"
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

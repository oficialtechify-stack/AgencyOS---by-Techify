import React, { useState, useEffect } from 'react';
import { ViewType, AppState } from './types';
import { loadState, saveState } from './lib/storage';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  auth,
  FirestoreUserProfile,
  subscribeToUserProfile,
  subscribeToUserCollection,
  getOrCreateUserProfile,
  addCollectionItem,
  deleteCollectionItem,
  updateCollectionItem,
  updateUserInFirestore,
  batchDeleteCollectionItems,
  resolvePrimaryAgencyOwnerUid,
  getStoredSession,
  logoutUser,
} from './lib/firebase';

// Components
import { Sidebar } from './components/Sidebar';
import { HeaderNav } from './components/HeaderNav';
import { AIAssistantWidget } from './components/AIAssistantWidget';
import { TechnicalDocsModal } from './components/TechnicalDocsModal';
import { AuthModal } from './components/AuthModal';
import { TrialPaywallOverlay } from './components/TrialPaywallOverlay';
import { EmailVerificationGuard } from './components/EmailVerificationGuard';
import { LockedModuleView } from './components/LockedModuleView';
import { hasModuleAccess, ALL_OPERATIONAL_MODULE_IDS } from './lib/permissions';

// Views
import { LandingView } from './views/LandingView';
import { TrialSignupView } from './views/TrialSignupView';
import { DashboardGeralView } from './views/DashboardGeralView';
import { KPIsView } from './views/KPIsView';
import { FluxoCaixaView } from './views/FluxoCaixaView';
import { MapsScraperView } from './views/MapsScraperView';
import { SocialHubView } from './views/SocialHubView';
import { EstoqueView } from './views/EstoqueView';
import { KanbanView } from './views/KanbanView';
import { RelatoriosView } from './views/RelatoriosView';
import { CampanhasView } from './views/CampanhasView';
import { AgendaView } from './views/AgendaView';
import { CalculadoraROIView } from './views/CalculadoraROIView';
import { IAConsultoraView } from './views/IAConsultoraView';
import { AdminView } from './views/AdminView';
import { DesignerHubView } from './views/DesignerHubView';
import { StudioAgencyView } from './views/StudioAgencyView';
import { MarketingHubView } from './views/MarketingHubView';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);

  // Firebase Auth & Realtime Firestore State
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<FirestoreUserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Sync with localStorage as fallback
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Unified Auth Listener & Realtime Firestore Sync
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const clearSubscriptions = () => {
      unsubs.forEach((fn) => {
        try {
          fn();
        } catch (e) {
          console.warn('Error clearing sub:', e);
        }
      });
      unsubs = [];
    };

    let activeDataUnsubs: (() => void)[] = [];

    const initDataSubscriptions = (dataOwnerUid: string) => {
      activeDataUnsubs.forEach((u) => u());
      activeDataUnsubs = [];

      const unsubKPIs = subscribeToUserCollection(dataOwnerUid, 'kpiPeriods', (kpiPeriods) => {
        setState((prev) => ({ ...prev, kpiPeriods }));
      });
      const unsubTX = subscribeToUserCollection(dataOwnerUid, 'transactions', (transactions) => {
        setState((prev) => ({ ...prev, transactions }));
      });
      const unsubCamp = subscribeToUserCollection(dataOwnerUid, 'campaigns', (campaigns) => {
        setState((prev) => ({ ...prev, campaigns }));
      });
      const unsubLeads = subscribeToUserCollection(dataOwnerUid, 'leads', (leads) => {
        setState((prev) => ({ ...prev, leads }));
      });
      const unsubTasks = subscribeToUserCollection(dataOwnerUid, 'tasks', (tasks) => {
        setState((prev) => ({ ...prev, tasks }));
      });
      const unsubStock = subscribeToUserCollection(dataOwnerUid, 'stockItems', (stockItems) => {
        setState((prev) => ({ ...prev, stockItems }));
      });
      const unsubEvents = subscribeToUserCollection(dataOwnerUid, 'events', (events) => {
        setState((prev) => ({ ...prev, events }));
      });
      const unsubSocial = subscribeToUserCollection(dataOwnerUid, 'socialPosts', (socialPosts) => {
        setState((prev) => ({ ...prev, socialPosts }));
      });
      const unsubDesignProjects = subscribeToUserCollection(dataOwnerUid, 'designProjects', (designProjects) => {
        setState((prev) => ({ ...prev, designProjects }));
      });
      const unsubDesignFolders = subscribeToUserCollection(dataOwnerUid, 'designFolders', (designFolders) => {
        setState((prev) => ({ ...prev, designFolders }));
      });
      const unsubDesignBriefings = subscribeToUserCollection(dataOwnerUid, 'designBriefings', (designBriefings) => {
        setState((prev) => ({ ...prev, designBriefings }));
      });
      const unsubDesignPackages = subscribeToUserCollection(dataOwnerUid, 'designPackages', (designPackages) => {
        setState((prev) => ({ ...prev, designPackages }));
      });
      const unsubDesignComments = subscribeToUserCollection(dataOwnerUid, 'designComments', (designComments) => {
        setState((prev) => ({ ...prev, designComments }));
      });
      const unsubMktCamp = subscribeToUserCollection(dataOwnerUid, 'marketingCampaigns', (marketingCampaigns) => {
        setState((prev) => ({ ...prev, marketingCampaigns }));
      });
      const unsubMktEd = subscribeToUserCollection(dataOwnerUid, 'marketingEditorials', (marketingEditorials) => {
        setState((prev) => ({ ...prev, marketingEditorials }));
      });
      const unsubMktFun = subscribeToUserCollection(dataOwnerUid, 'marketingFunnels', (marketingFunnels) => {
        setState((prev) => ({ ...prev, marketingFunnels }));
      });
      const unsubMktEmails = subscribeToUserCollection(dataOwnerUid, 'marketingEmailFlows', (marketingEmailFlows) => {
        setState((prev) => ({ ...prev, marketingEmailFlows }));
      });
      const unsubMktCopies = subscribeToUserCollection(dataOwnerUid, 'marketingCopies', (marketingCopies) => {
        setState((prev) => ({ ...prev, marketingCopies }));
      });

      activeDataUnsubs.push(
        unsubKPIs,
        unsubTX,
        unsubCamp,
        unsubLeads,
        unsubTasks,
        unsubStock,
        unsubEvents,
        unsubSocial,
        unsubDesignProjects,
        unsubDesignFolders,
        unsubDesignBriefings,
        unsubDesignPackages,
        unsubDesignComments,
        unsubMktCamp,
        unsubMktEd,
        unsubMktFun,
        unsubMktEmails,
        unsubMktCopies
      );
    };

    const resolveActiveUser = async () => {
      clearSubscriptions();
      activeDataUnsubs.forEach((u) => u());
      activeDataUnsubs = [];

      const currentAuthUser = auth.currentUser;
      const stored = getStoredSession();

      let activeUid: string | null = null;
      let activeUserObj: any = null;

      if (currentAuthUser) {
        activeUid = currentAuthUser.uid;
        activeUserObj = currentAuthUser;
      } else if (stored && stored.uid) {
        activeUid = stored.uid;
        activeUserObj = {
          uid: stored.uid,
          email: stored.email,
          displayName: stored.name || stored.email?.split('@')[0] || 'Usuário',
          emailVerified: true,
        };
      }

      setUser(activeUserObj);

      if (activeUid) {
        let lastSubscribedDataUid = '';

        // Realtime subscription to User Profile with loop guard
        let hasResolvedOwner = false;
        const unsubProfile = subscribeToUserProfile(activeUid, async (p) => {
          if (p) {
            setUserProfile(p);
            
            // Check if user is an employee
            const isEmployee =
              p.userType === 'employee' ||
              p.plan === 'Gratuito / Equipe' ||
              Boolean(p.designRole && p.designRole !== 'cliente');

            let targetWorkspace = activeUid!;

            if (isEmployee) {
              if (p.agencyOwnerUid && p.agencyOwnerUid !== 'agency-master-owner') {
                targetWorkspace = p.agencyOwnerUid;
              } else if (!hasResolvedOwner) {
                hasResolvedOwner = true;
                // Proactively resolve and bind the agency owner's UID once
                const ownerUid = await resolvePrimaryAgencyOwnerUid();
                if (ownerUid && ownerUid !== activeUid) {
                  targetWorkspace = ownerUid;
                  if (p.agencyOwnerUid !== ownerUid) {
                    await updateUserInFirestore(activeUid!, {
                      agencyOwnerUid: ownerUid,
                      userType: 'employee',
                    });
                  }
                }
              }
            }

            if (targetWorkspace !== lastSubscribedDataUid) {
              lastSubscribedDataUid = targetWorkspace;
              initDataSubscriptions(targetWorkspace);
            }
          } else if (activeUserObj) {
            // Default active profile state if doc is not initialized
            setUserProfile({
              uid: activeUid!,
              name: activeUserObj.displayName || activeUserObj.email?.split('@')[0] || 'Usuário',
              email: activeUserObj.email || '',
              agencyName: 'Agência Digital',
              plan: 'Pro',
              status: 'active',
              trialStartDate: Date.now(),
              trialEndsAt: Date.now() + 14 * 24 * 60 * 60 * 1000,
              createdAt: new Date().toLocaleDateString('pt-BR'),
              allowedModules: ALL_OPERATIONAL_MODULE_IDS,
            });
            if (activeUid !== lastSubscribedDataUid) {
              lastSubscribedDataUid = activeUid!;
              initDataSubscriptions(activeUid!);
            }
          }
        });
        unsubs.push(unsubProfile, () => activeDataUnsubs.forEach((u) => u()));
      } else {
        setUserProfile(null);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, () => {
      resolveActiveUser();
    });

    const handleCustomSessionChange = () => {
      resolveActiveUser();
    };

    window.addEventListener('agencyos_session_changed', handleCustomSessionChange);
    // Initial evaluation
    resolveActiveUser();

    return () => {
      unsubscribeAuth();
      window.removeEventListener('agencyos_session_changed', handleCustomSessionChange);
      clearSubscriptions();
    };
  }, []);

  // Determine if Trial is expired
  const isTrialExpired =
    userProfile?.plan === 'Trial Gratuito' &&
    userProfile?.trialEndsAt &&
    Date.now() >= userProfile.trialEndsAt;

  const setView = (view: ViewType) => {
    setState((prev) => ({ ...prev, activeView: view }));
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  const handleStartTrial = async (data: { name: string; email: string; agencyName: string }) => {
    // If user is logged in, update agencyName directly
    if (user) {
      await getOrCreateUserProfile(user, data.agencyName);
      setView('dashboard');
    } else {
      // Open signup auth modal
      handleOpenAuth('signup');
    }
  };

  // Helper to resolve workspace UID (shared for agency staff, isolated for SaaS clients)
  const getWorkspaceTargetUid = () => {
    const isEmployee =
      userProfile?.userType === 'employee' ||
      userProfile?.plan === 'Gratuito / Equipe' ||
      Boolean(
        userProfile?.role &&
          (userProfile.role.toLowerCase().includes('designer') ||
            userProfile.role.toLowerCase().includes('lider') ||
            userProfile.role.toLowerCase().includes('líder') ||
            userProfile.role.toLowerCase().includes('gestor') ||
            userProfile.role.toLowerCase().includes('equipe') ||
            userProfile.role.toLowerCase().includes('funcionario') ||
            userProfile.role.toLowerCase().includes('funcionário')) &&
          userProfile?.userType !== 'client'
      );

    if (isEmployee && userProfile?.agencyOwnerUid && userProfile.agencyOwnerUid !== 'agency-master-owner') {
      return userProfile.agencyOwnerUid;
    }
    return userProfile?.agencyOwnerUid || userProfile?.uid || user?.uid || null;
  };

  // Realtime Firestore CRUD Handlers
  const handleAddKPIPeriod = async (period: any) => {
    const newItem = { ...period, id: period.id || `kpi-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      kpiPeriods: [...prev.kpiPeriods, newItem],
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await addCollectionItem(targetUid, 'kpiPeriods', newItem);
    }
  };

  const handleDeleteKPIPeriod = async (id: string) => {
    setState((prev) => ({
      ...prev,
      kpiPeriods: prev.kpiPeriods.filter((k) => k.id !== id),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await deleteCollectionItem(targetUid, 'kpiPeriods', id);
    }
  };

  const handleAddTransaction = async (t: any) => {
    const newItem = { ...t, id: t.id || `tx-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      transactions: [newItem, ...prev.transactions],
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await addCollectionItem(targetUid, 'transactions', newItem);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await deleteCollectionItem(targetUid, 'transactions', id);
    }
  };

  const handleAddCampaign = async (c: any) => {
    const newItem = { ...c, id: c.id || `camp-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      campaigns: [...prev.campaigns, newItem],
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await addCollectionItem(targetUid, 'campaigns', newItem);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    setState((prev) => ({
      ...prev,
      campaigns: prev.campaigns.filter((c) => c.id !== id),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await deleteCollectionItem(targetUid, 'campaigns', id);
    }
  };

  const handleAddSocialPost = async (post: any) => {
    const newItem = { ...post, id: post.id || `post-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      socialPosts: [newItem, ...prev.socialPosts],
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await addCollectionItem(targetUid, 'socialPosts', newItem);
    }
  };

  const handleDeleteSocialPost = async (id: string) => {
    setState((prev) => ({
      ...prev,
      socialPosts: prev.socialPosts.filter((p) => p.id !== id),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await deleteCollectionItem(targetUid, 'socialPosts', id);
    }
  };

  const handleAddStockItem = async (item: any) => {
    const newItem = { ...item, id: item.id || `stock-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      stockItems: [...prev.stockItems, newItem],
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await addCollectionItem(targetUid, 'stockItems', newItem);
    }
  };

  const handleDeleteStockItem = async (id: string) => {
    setState((prev) => ({
      ...prev,
      stockItems: prev.stockItems.filter((i) => i.id !== id),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await deleteCollectionItem(targetUid, 'stockItems', id);
    }
  };

  const handleAddTask = async (task: any) => {
    const newItem = { ...task, id: task.id || `task-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newItem],
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await addCollectionItem(targetUid, 'tasks', newItem);
    }
  };

  const handleUpdateTaskStatus = async (id: string, status: any) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await updateCollectionItem(targetUid, 'tasks', id, { status });
    }
  };

  const handleDeleteTask = async (id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await deleteCollectionItem(targetUid, 'tasks', id);
    }
  };

  const handleAddLead = async (lead: any) => {
    const newItem = { ...lead, id: lead.id || `lead-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      leads: [newItem, ...prev.leads],
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await addCollectionItem(targetUid, 'leads', newItem);
    }
  };

  const handleUpdateLeadStatus = async (id: string, status: any) => {
    setState((prev) => ({
      ...prev,
      leads: prev.leads.map((l) => (l.id === id ? { ...l, status } : l)),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await updateCollectionItem(targetUid, 'leads', id, { status });
    }
  };

  const handleDeleteLead = async (id: string) => {
    setState((prev) => ({
      ...prev,
      leads: prev.leads.filter((l) => l.id !== id),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await deleteCollectionItem(targetUid, 'leads', id);
    }
  };

  const handleAddEvent = async (ev: any) => {
    const newItem = { ...ev, id: ev.id || `ev-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      events: [...prev.events, newItem],
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await addCollectionItem(targetUid, 'events', newItem);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await deleteCollectionItem(targetUid, 'events', id);
    }
  };

  // Design Hub Handlers
  const handleAddDesignProject = async (proj: any) => {
    const newItem = { ...proj, id: proj.id || `des-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      designProjects: [newItem, ...(prev.designProjects || [])],
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await addCollectionItem(targetUid, 'designProjects', newItem);
    }
  };

  const handleUpdateDesignProject = async (id: string, data: any) => {
    setState((prev) => ({
      ...prev,
      designProjects: (prev.designProjects || []).map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await updateCollectionItem(targetUid, 'designProjects', id, data);
    }
  };

  const handleDeleteDesignProject = async (id: string) => {
    setState((prev) => ({
      ...prev,
      designProjects: (prev.designProjects || []).filter((p) => p.id !== id),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await deleteCollectionItem(targetUid, 'designProjects', id);
    }
  };

  const handleAddDesignFolder = async (folder: any) => {
    const newItem = { ...folder, id: folder.id || `fold-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      designFolders: [newItem, ...(prev.designFolders || [])],
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await addCollectionItem(targetUid, 'designFolders', newItem);
    }
  };

  const handleAddDesignBriefing = async (briefing: any) => {
    const newItem = { ...briefing, id: briefing.id || `brief-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      designBriefings: [newItem, ...(prev.designBriefings || [])],
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await addCollectionItem(targetUid, 'designBriefings', newItem);
    }
  };

  const handleUpdateDesignBriefing = async (id: string, data: any) => {
    setState((prev) => ({
      ...prev,
      designBriefings: (prev.designBriefings || []).map((b) =>
        b.id === id ? { ...b, ...data } : b
      ),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await updateCollectionItem(targetUid, 'designBriefings', id, data);
    }
  };

  const handleAddDesignPackage = async (pkg: any) => {
    const newItem = { ...pkg, id: pkg.id || `pack-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      designPackages: [newItem, ...(prev.designPackages || [])],
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await addCollectionItem(targetUid, 'designPackages', newItem);
    }
  };

  const handleUpdateDesignPackage = async (id: string, data: any) => {
    setState((prev) => ({
      ...prev,
      designPackages: (prev.designPackages || []).map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await updateCollectionItem(targetUid, 'designPackages', id, data);
    }
  };

  const handleAddDesignComment = async (comment: any) => {
    const newItem = { ...comment, id: comment.id || `com-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      designComments: [...(prev.designComments || []), newItem],
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await addCollectionItem(targetUid, 'designComments', newItem);
    }
  };

  const handleDeleteDesignFolder = async (id: string) => {
    setState((prev) => ({
      ...prev,
      designFolders: (prev.designFolders || []).filter((f) => f.id !== id),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await deleteCollectionItem(targetUid, 'designFolders', id);
    }
  };

  const handleDeleteDesignBriefing = async (id: string) => {
    setState((prev) => ({
      ...prev,
      designBriefings: (prev.designBriefings || []).filter((b) => b.id !== id),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await deleteCollectionItem(targetUid, 'designBriefings', id);
    }
  };

  const handleDeleteDesignPackage = async (id: string) => {
    setState((prev) => ({
      ...prev,
      designPackages: (prev.designPackages || []).filter((p) => p.id !== id),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await deleteCollectionItem(targetUid, 'designPackages', id);
    }
  };

  const handleDeleteDesignComment = async (id: string) => {
    setState((prev) => ({
      ...prev,
      designComments: (prev.designComments || []).filter((c) => c.id !== id),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await deleteCollectionItem(targetUid, 'designComments', id);
    }
  };

  const handleClearAllDesignData = async () => {
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      if (state.designProjects && state.designProjects.length > 0) {
        await batchDeleteCollectionItems(targetUid, 'designProjects', state.designProjects.map((p) => p.id));
      }
      if (state.designFolders && state.designFolders.length > 0) {
        await batchDeleteCollectionItems(targetUid, 'designFolders', state.designFolders.map((f) => f.id));
      }
      if (state.designBriefings && state.designBriefings.length > 0) {
        await batchDeleteCollectionItems(targetUid, 'designBriefings', state.designBriefings.map((b) => b.id));
      }
      if (state.designPackages && state.designPackages.length > 0) {
        await batchDeleteCollectionItems(targetUid, 'designPackages', state.designPackages.map((pkg) => pkg.id));
      }
      if (state.designComments && state.designComments.length > 0) {
        await batchDeleteCollectionItems(targetUid, 'designComments', state.designComments.map((c) => c.id));
      }
    }
    setState((prev) => ({
      ...prev,
      designProjects: [],
      designFolders: [],
      designBriefings: [],
      designPackages: [],
      designComments: [],
    }));
  };

  // Marketing Hub Handlers
  const handleAddMarketingCampaign = async (campaign: any) => {
    const newItem = { ...campaign, id: campaign.id || `mkt-c-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      marketingCampaigns: [newItem, ...(prev.marketingCampaigns || [])],
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await addCollectionItem(targetUid, 'marketingCampaigns', newItem);
    }
  };

  const handleUpdateMarketingCampaign = async (id: string, data: any) => {
    setState((prev) => ({
      ...prev,
      marketingCampaigns: (prev.marketingCampaigns || []).map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await updateCollectionItem(targetUid, 'marketingCampaigns', id, data);
    }
  };

  const handleDeleteMarketingCampaign = async (id: string) => {
    setState((prev) => ({
      ...prev,
      marketingCampaigns: (prev.marketingCampaigns || []).filter((c) => c.id !== id),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await deleteCollectionItem(targetUid, 'marketingCampaigns', id);
    }
  };

  const handleAddMarketingEditorial = async (item: any) => {
    const newItem = { ...item, id: item.id || `mkt-e-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      marketingEditorials: [newItem, ...(prev.marketingEditorials || [])],
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await addCollectionItem(targetUid, 'marketingEditorials', newItem);
    }
  };

  const handleUpdateMarketingEditorial = async (id: string, data: any) => {
    setState((prev) => ({
      ...prev,
      marketingEditorials: (prev.marketingEditorials || []).map((e) =>
        e.id === id ? { ...e, ...data } : e
      ),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await updateCollectionItem(targetUid, 'marketingEditorials', id, data);
    }
  };

  const handleDeleteMarketingEditorial = async (id: string) => {
    setState((prev) => ({
      ...prev,
      marketingEditorials: (prev.marketingEditorials || []).filter((e) => e.id !== id),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await deleteCollectionItem(targetUid, 'marketingEditorials', id);
    }
  };

  const handleAddMarketingFunnel = async (funnel: any) => {
    const newItem = { ...funnel, id: funnel.id || `mkt-f-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      marketingFunnels: [newItem, ...(prev.marketingFunnels || [])],
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await addCollectionItem(targetUid, 'marketingFunnels', newItem);
    }
  };

  const handleUpdateMarketingFunnel = async (id: string, data: any) => {
    setState((prev) => ({
      ...prev,
      marketingFunnels: (prev.marketingFunnels || []).map((f) =>
        f.id === id ? { ...f, ...data } : f
      ),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await updateCollectionItem(targetUid, 'marketingFunnels', id, data);
    }
  };

  const handleDeleteMarketingFunnel = async (id: string) => {
    setState((prev) => ({
      ...prev,
      marketingFunnels: (prev.marketingFunnels || []).filter((f) => f.id !== id),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await deleteCollectionItem(targetUid, 'marketingFunnels', id);
    }
  };

  const handleAddMarketingEmailFlow = async (flow: any) => {
    const newItem = { ...flow, id: flow.id || `mkt-ef-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      marketingEmailFlows: [newItem, ...(prev.marketingEmailFlows || [])],
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await addCollectionItem(targetUid, 'marketingEmailFlows', newItem);
    }
  };

  const handleUpdateMarketingEmailFlow = async (id: string, data: any) => {
    setState((prev) => ({
      ...prev,
      marketingEmailFlows: (prev.marketingEmailFlows || []).map((ef) =>
        ef.id === id ? { ...ef, ...data } : ef
      ),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await updateCollectionItem(targetUid, 'marketingEmailFlows', id, data);
    }
  };

  const handleDeleteMarketingEmailFlow = async (id: string) => {
    setState((prev) => ({
      ...prev,
      marketingEmailFlows: (prev.marketingEmailFlows || []).filter((ef) => ef.id !== id),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await deleteCollectionItem(targetUid, 'marketingEmailFlows', id);
    }
  };

  const handleAddMarketingCopyScript = async (copy: any) => {
    const newItem = { ...copy, id: copy.id || `mkt-cp-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      marketingCopies: [newItem, ...(prev.marketingCopies || [])],
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await addCollectionItem(targetUid, 'marketingCopies', newItem);
    }
  };

  const handleUpdateMarketingCopyScript = async (id: string, data: any) => {
    setState((prev) => ({
      ...prev,
      marketingCopies: (prev.marketingCopies || []).map((cp) =>
        cp.id === id ? { ...cp, ...data } : cp
      ),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await updateCollectionItem(targetUid, 'marketingCopies', id, data);
    }
  };

  const handleDeleteMarketingCopyScript = async (id: string) => {
    setState((prev) => ({
      ...prev,
      marketingCopies: (prev.marketingCopies || []).filter((cp) => cp.id !== id),
    }));
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      await deleteCollectionItem(targetUid, 'marketingCopies', id);
    }
  };

  const handleClearAllMarketingData = async () => {
    const targetUid = getWorkspaceTargetUid();
    if (targetUid) {
      if (state.marketingCampaigns && state.marketingCampaigns.length > 0) {
        await batchDeleteCollectionItems(targetUid, 'marketingCampaigns', state.marketingCampaigns.map((c) => c.id));
      }
      if (state.marketingEditorials && state.marketingEditorials.length > 0) {
        await batchDeleteCollectionItems(targetUid, 'marketingEditorials', state.marketingEditorials.map((e) => e.id));
      }
      if (state.marketingFunnels && state.marketingFunnels.length > 0) {
        await batchDeleteCollectionItems(targetUid, 'marketingFunnels', state.marketingFunnels.map((f) => f.id));
      }
      if (state.marketingEmailFlows && state.marketingEmailFlows.length > 0) {
        await batchDeleteCollectionItems(targetUid, 'marketingEmailFlows', state.marketingEmailFlows.map((ef) => ef.id));
      }
      if (state.marketingCopies && state.marketingCopies.length > 0) {
        await batchDeleteCollectionItems(targetUid, 'marketingCopies', state.marketingCopies.map((cp) => cp.id));
      }
    }
    setState((prev) => ({
      ...prev,
      marketingCampaigns: [],
      marketingEditorials: [],
      marketingFunnels: [],
      marketingEmailFlows: [],
      marketingCopies: [],
    }));
  };

  // Render Public Landing View
  if (state.activeView === 'landing') {
    return (
      <>
        <LandingView
          onStartTrial={() => handleOpenAuth('signup')}
          onOpenLogin={() => handleOpenAuth('login')}
          onOpenDocs={() => setShowDocsModal(true)}
        />
        {showDocsModal && <TechnicalDocsModal onClose={() => setShowDocsModal(false)} />}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authModalMode}
          onSuccess={() => setView('dashboard')}
        />
      </>
    );
  }

  // Render Trial Signup Form View
  if (state.activeView === 'trial-signup') {
    return (
      <>
        <TrialSignupView
          onStartTrial={handleStartTrial}
          onBackToLanding={() => setView('landing')}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authModalMode}
          onSuccess={() => setView('dashboard')}
        />
      </>
    );
  }

  // Render Internal App Workspace
  return (
    <div className="h-screen bg-[#06070a] text-gray-100 flex flex-col font-sans overflow-hidden selection:bg-[#22c55e] selection:text-black">
      {/* Top Header */}
      <HeaderNav
        agencyName={userProfile?.agencyName || state.organization.agencyName}
        userProfile={userProfile}
        activeView={state.activeView}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenDocs={() => setShowDocsModal(true)}
        onOpenUpgradeModal={() => setShowUpgradeModal(true)}
        onOpenAuthModal={() => handleOpenAuth('login')}
      />

      <div className="flex flex-1 relative overflow-hidden min-h-0">
        {/* Sidebar */}
        <Sidebar
          activeView={state.activeView}
          userProfile={userProfile}
          onSelectView={setView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={async () => {
            await logoutUser();
            setView('landing');
          }}
        />

        {/* Main Content View Area */}
        <main
          className={`flex-1 h-full overflow-y-auto min-h-0 ${
            state.activeView === 'studio-agency'
              ? 'p-0 max-w-none w-full overflow-x-hidden'
              : 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full'
          }`}
        >
          {!hasModuleAccess(state.activeView, userProfile) ? (
            <LockedModuleView
              moduleId={state.activeView}
              userProfile={userProfile}
              onNavigateHome={() => setView('dashboard')}
            />
          ) : (
            <>
              {state.activeView === 'dashboard' && (
                <DashboardGeralView
                  userProfile={userProfile}
                  kpiPeriods={state.kpiPeriods}
                  transactions={state.transactions}
                  campaigns={state.campaigns}
                  leads={state.leads}
                  stockItems={state.stockItems}
                  onNavigate={setView}
                />
              )}

              {state.activeView === 'kpis' && (
                <KPIsView
                  periods={state.kpiPeriods}
                  kpiPeriods={state.kpiPeriods}
                  onAddPeriod={handleAddKPIPeriod}
                  onDeletePeriod={handleDeleteKPIPeriod}
                  onExportReport={() => setView('relatorios')}
                />
              )}

              {state.activeView === 'fluxo-caixa' && (
                <FluxoCaixaView
                  transactions={state.transactions}
                  onAddTransaction={handleAddTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              )}

              {state.activeView === 'maps-scraper' && (
                <MapsScraperView
                  leads={state.leads}
                  onAddLead={handleAddLead}
                  onUpdateLeadStatus={handleUpdateLeadStatus}
                  onDeleteLead={handleDeleteLead}
                />
              )}

              {state.activeView === 'social-hub' && (
                <SocialHubView
                  posts={state.socialPosts}
                  onAddPost={handleAddSocialPost}
                  onDeletePost={handleDeleteSocialPost}
                />
              )}

              {state.activeView === 'estoque' && (
                <EstoqueView
                  items={state.stockItems}
                  onAddItem={handleAddStockItem}
                  onDeleteItem={handleDeleteStockItem}
                />
              )}

              {state.activeView === 'kanban' && (
                <KanbanView
                  tasks={state.tasks}
                  onAddTask={handleAddTask}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onDeleteTask={handleDeleteTask}
                />
              )}

              {state.activeView === 'relatorios' && (
                <RelatoriosView
                  kpiPeriods={state.kpiPeriods}
                  transactions={state.transactions}
                  campaigns={state.campaigns}
                  leads={state.leads}
                  stockItems={state.stockItems}
                />
              )}

              {state.activeView === 'campanhas' && (
                <CampanhasView
                  campaigns={state.campaigns}
                  onAddCampaign={handleAddCampaign}
                  onDeleteCampaign={handleDeleteCampaign}
                />
              )}

              {state.activeView === 'marketing' && (
                <MarketingHubView
                  userProfile={userProfile}
                  marketingCampaigns={state.marketingCampaigns}
                  marketingEditorials={state.marketingEditorials}
                  marketingFunnels={state.marketingFunnels}
                  marketingEmailFlows={state.marketingEmailFlows}
                  marketingCopies={state.marketingCopies}
                  onAddCampaign={handleAddMarketingCampaign}
                  onUpdateCampaign={handleUpdateMarketingCampaign}
                  onDeleteCampaign={handleDeleteMarketingCampaign}
                  onAddEditorial={handleAddMarketingEditorial}
                  onUpdateEditorial={handleUpdateMarketingEditorial}
                  onDeleteEditorial={handleDeleteMarketingEditorial}
                  onAddFunnel={handleAddMarketingFunnel}
                  onUpdateFunnel={handleUpdateMarketingFunnel}
                  onDeleteFunnel={handleDeleteMarketingFunnel}
                  onAddEmailFlow={handleAddMarketingEmailFlow}
                  onUpdateEmailFlow={handleUpdateMarketingEmailFlow}
                  onDeleteEmailFlow={handleDeleteMarketingEmailFlow}
                  onAddCopyScript={handleAddMarketingCopyScript}
                  onUpdateCopyScript={handleUpdateMarketingCopyScript}
                  onDeleteCopyScript={handleDeleteMarketingCopyScript}
                  onClearAllMarketingData={handleClearAllMarketingData}
                  onNavigate={setView}
                />
              )}

              {state.activeView === 'agenda' && (
                <AgendaView
                  events={state.events}
                  onAddEvent={handleAddEvent}
                  onDeleteEvent={handleDeleteEvent}
                />
              )}

              {state.activeView === 'calculadora-roi' && <CalculadoraROIView />}

              {state.activeView === 'ia-consultora' && <IAConsultoraView />}

              {state.activeView === 'designer' && (
                <DesignerHubView
                  userProfile={userProfile}
                  designProjects={state.designProjects}
                  designFolders={state.designFolders}
                  designBriefings={state.designBriefings}
                  designPackages={state.designPackages}
                  designComments={state.designComments}
                  onAddProject={handleAddDesignProject}
                  onUpdateProject={handleUpdateDesignProject}
                  onDeleteProject={handleDeleteDesignProject}
                  onAddFolder={handleAddDesignFolder}
                  onDeleteFolder={handleDeleteDesignFolder}
                  onAddBriefing={handleAddDesignBriefing}
                  onUpdateBriefing={handleUpdateDesignBriefing}
                  onDeleteBriefing={handleDeleteDesignBriefing}
                  onAddPackage={handleAddDesignPackage}
                  onUpdatePackage={handleUpdateDesignPackage}
                  onDeletePackage={handleDeleteDesignPackage}
                  onAddComment={handleAddDesignComment}
                  onDeleteComment={handleDeleteDesignComment}
                  onClearAllData={handleClearAllDesignData}
                  onNavigate={setView}
                />
              )}

              {state.activeView === 'studio-agency' && (
                <StudioAgencyView
                  userProfile={userProfile}
                  designProjects={state.designProjects}
                  designFolders={state.designFolders}
                  onAddProject={handleAddDesignProject}
                  onNavigate={setView}
                />
              )}

              {state.activeView === 'admin' && (
                <AdminView
                  currentUser={userProfile}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating AI Assistant Widget */}
      <AIAssistantWidget />

      {/* Technical Documentation Modal */}
      {showDocsModal && <TechnicalDocsModal onClose={() => setShowDocsModal(false)} />}

      {/* Auth Modal for Login and Signup */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
        onSuccess={() => setView('dashboard')}
      />

      {/* 14-Day Trial Paywall Overlay */}
      <TrialPaywallOverlay
        userProfile={userProfile}
        isOpen={showUpgradeModal}
        isForceLocked={isTrialExpired}
        onClose={() => setShowUpgradeModal(false)}
        onPlanActivated={(newPlan) => {
          if (userProfile) {
            setUserProfile({ ...userProfile, plan: newPlan, status: 'active' });
          }
        }}
      />

      {/* Firebase Email Verification Guard */}
      {user && !user.emailVerified && !user.providerData.some((p) => p.providerId === 'google.com') && (
        <EmailVerificationGuard
          user={user}
          onVerificationSuccess={() => {
            if (auth.currentUser) {
              setUser({ ...auth.currentUser });
            }
          }}
        />
      )}
    </div>
  );
}

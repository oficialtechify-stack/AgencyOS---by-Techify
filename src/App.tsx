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

    const resolveActiveUser = async () => {
      clearSubscriptions();

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
        // Realtime subscription to User Profile
        const unsubProfile = subscribeToUserProfile(activeUid, (p) => {
          if (p) {
            setUserProfile(p);
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
          }
        });
        unsubs.push(unsubProfile);

        // Realtime subscriptions to User Subcollections
        const unsubKPIs = subscribeToUserCollection(activeUid, 'kpiPeriods', (kpiPeriods) => {
          setState((prev) => ({ ...prev, kpiPeriods }));
        });
        const unsubTX = subscribeToUserCollection(activeUid, 'transactions', (transactions) => {
          setState((prev) => ({ ...prev, transactions }));
        });
        const unsubCamp = subscribeToUserCollection(activeUid, 'campaigns', (campaigns) => {
          setState((prev) => ({ ...prev, campaigns }));
        });
        const unsubLeads = subscribeToUserCollection(activeUid, 'leads', (leads) => {
          setState((prev) => ({ ...prev, leads }));
        });
        const unsubTasks = subscribeToUserCollection(activeUid, 'tasks', (tasks) => {
          setState((prev) => ({ ...prev, tasks }));
        });
        const unsubStock = subscribeToUserCollection(activeUid, 'stockItems', (stockItems) => {
          setState((prev) => ({ ...prev, stockItems }));
        });
        const unsubEvents = subscribeToUserCollection(activeUid, 'events', (events) => {
          setState((prev) => ({ ...prev, events }));
        });
        const unsubSocial = subscribeToUserCollection(activeUid, 'socialPosts', (socialPosts) => {
          setState((prev) => ({ ...prev, socialPosts }));
        });
        const unsubDesignProjects = subscribeToUserCollection(activeUid, 'designProjects', (designProjects) => {
          setState((prev) => ({ ...prev, designProjects }));
        });
        const unsubDesignFolders = subscribeToUserCollection(activeUid, 'designFolders', (designFolders) => {
          setState((prev) => ({ ...prev, designFolders }));
        });
        const unsubDesignBriefings = subscribeToUserCollection(activeUid, 'designBriefings', (designBriefings) => {
          setState((prev) => ({ ...prev, designBriefings }));
        });
        const unsubDesignPackages = subscribeToUserCollection(activeUid, 'designPackages', (designPackages) => {
          setState((prev) => ({ ...prev, designPackages }));
        });
        const unsubDesignComments = subscribeToUserCollection(activeUid, 'designComments', (designComments) => {
          setState((prev) => ({ ...prev, designComments }));
        });

        unsubs.push(
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
          unsubDesignComments
        );
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

  // Realtime Firestore CRUD Handlers
  const handleAddKPIPeriod = async (period: any) => {
    if (user) {
      await addCollectionItem(user.uid, 'kpiPeriods', period);
    } else {
      setState((prev) => ({
        ...prev,
        kpiPeriods: [...prev.kpiPeriods, { ...period, id: `kpi-${Date.now()}` }],
      }));
    }
  };

  const handleDeleteKPIPeriod = async (id: string) => {
    if (user) {
      await deleteCollectionItem(user.uid, 'kpiPeriods', id);
    } else {
      setState((prev) => ({
        ...prev,
        kpiPeriods: prev.kpiPeriods.filter((k) => k.id !== id),
      }));
    }
  };

  const handleAddTransaction = async (t: any) => {
    if (user) {
      await addCollectionItem(user.uid, 'transactions', t);
    } else {
      setState((prev) => ({
        ...prev,
        transactions: [{ ...t, id: `tx-${Date.now()}` }, ...prev.transactions],
      }));
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (user) {
      await deleteCollectionItem(user.uid, 'transactions', id);
    } else {
      setState((prev) => ({
        ...prev,
        transactions: prev.transactions.filter((t) => t.id !== id),
      }));
    }
  };

  const handleAddCampaign = async (c: any) => {
    if (user) {
      await addCollectionItem(user.uid, 'campaigns', c);
    } else {
      setState((prev) => ({
        ...prev,
        campaigns: [...prev.campaigns, { ...c, id: `camp-${Date.now()}` }],
      }));
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (user) {
      await deleteCollectionItem(user.uid, 'campaigns', id);
    } else {
      setState((prev) => ({
        ...prev,
        campaigns: prev.campaigns.filter((c) => c.id !== id),
      }));
    }
  };

  const handleAddSocialPost = async (post: any) => {
    if (user) {
      await addCollectionItem(user.uid, 'socialPosts', post);
    } else {
      setState((prev) => ({
        ...prev,
        socialPosts: [{ ...post, id: `post-${Date.now()}` }, ...prev.socialPosts],
      }));
    }
  };

  const handleDeleteSocialPost = async (id: string) => {
    if (user) {
      await deleteCollectionItem(user.uid, 'socialPosts', id);
    } else {
      setState((prev) => ({
        ...prev,
        socialPosts: prev.socialPosts.filter((p) => p.id !== id),
      }));
    }
  };

  const handleAddStockItem = async (item: any) => {
    if (user) {
      await addCollectionItem(user.uid, 'stockItems', item);
    } else {
      setState((prev) => ({
        ...prev,
        stockItems: [...prev.stockItems, { ...item, id: `stock-${Date.now()}` }],
      }));
    }
  };

  const handleDeleteStockItem = async (id: string) => {
    if (user) {
      await deleteCollectionItem(user.uid, 'stockItems', id);
    } else {
      setState((prev) => ({
        ...prev,
        stockItems: prev.stockItems.filter((i) => i.id !== id),
      }));
    }
  };

  const handleAddTask = async (task: any) => {
    if (user) {
      await addCollectionItem(user.uid, 'tasks', task);
    } else {
      setState((prev) => ({
        ...prev,
        tasks: [...prev.tasks, { ...task, id: `task-${Date.now()}` }],
      }));
    }
  };

  const handleUpdateTaskStatus = async (id: string, status: any) => {
    if (user) {
      await updateCollectionItem(user.uid, 'tasks', id, { status });
    } else {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
      }));
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (user) {
      await deleteCollectionItem(user.uid, 'tasks', id);
    } else {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== id),
      }));
    }
  };

  const handleAddLead = async (lead: any) => {
    if (user) {
      await addCollectionItem(user.uid, 'leads', lead);
    } else {
      setState((prev) => ({
        ...prev,
        leads: [{ ...lead, id: `lead-${Date.now()}` }, ...prev.leads],
      }));
    }
  };

  const handleUpdateLeadStatus = async (id: string, status: any) => {
    if (user) {
      await updateCollectionItem(user.uid, 'leads', id, { status });
    } else {
      setState((prev) => ({
        ...prev,
        leads: prev.leads.map((l) => (l.id === id ? { ...l, status } : l)),
      }));
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (user) {
      await deleteCollectionItem(user.uid, 'leads', id);
    } else {
      setState((prev) => ({
        ...prev,
        leads: prev.leads.filter((l) => l.id !== id),
      }));
    }
  };

  const handleAddEvent = async (ev: any) => {
    if (user) {
      await addCollectionItem(user.uid, 'events', ev);
    } else {
      setState((prev) => ({
        ...prev,
        events: [...prev.events, { ...ev, id: `ev-${Date.now()}` }],
      }));
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (user) {
      await deleteCollectionItem(user.uid, 'events', id);
    } else {
      setState((prev) => ({
        ...prev,
        events: prev.events.filter((e) => e.id !== id),
      }));
    }
  };

  // Design Hub Handlers
  const handleAddDesignProject = async (proj: any) => {
    if (user) {
      await addCollectionItem(user.uid, 'designProjects', proj);
    } else {
      setState((prev) => ({
        ...prev,
        designProjects: [{ ...proj, id: `des-${Date.now()}` }, ...(prev.designProjects || [])],
      }));
    }
  };

  const handleUpdateDesignProject = async (id: string, data: any) => {
    if (user) {
      await updateCollectionItem(user.uid, 'designProjects', id, data);
    } else {
      setState((prev) => ({
        ...prev,
        designProjects: (prev.designProjects || []).map((p) =>
          p.id === id ? { ...p, ...data } : p
        ),
      }));
    }
  };

  const handleDeleteDesignProject = async (id: string) => {
    if (user) {
      await deleteCollectionItem(user.uid, 'designProjects', id);
    } else {
      setState((prev) => ({
        ...prev,
        designProjects: (prev.designProjects || []).filter((p) => p.id !== id),
      }));
    }
  };

  const handleAddDesignFolder = async (folder: any) => {
    if (user) {
      await addCollectionItem(user.uid, 'designFolders', folder);
    } else {
      setState((prev) => ({
        ...prev,
        designFolders: [{ ...folder, id: `fold-${Date.now()}` }, ...(prev.designFolders || [])],
      }));
    }
  };

  const handleAddDesignBriefing = async (briefing: any) => {
    if (user) {
      await addCollectionItem(user.uid, 'designBriefings', briefing);
    } else {
      setState((prev) => ({
        ...prev,
        designBriefings: [{ ...briefing, id: `brief-${Date.now()}` }, ...(prev.designBriefings || [])],
      }));
    }
  };

  const handleUpdateDesignBriefing = async (id: string, data: any) => {
    if (user) {
      await updateCollectionItem(user.uid, 'designBriefings', id, data);
    } else {
      setState((prev) => ({
        ...prev,
        designBriefings: (prev.designBriefings || []).map((b) =>
          b.id === id ? { ...b, ...data } : b
        ),
      }));
    }
  };

  const handleAddDesignPackage = async (pkg: any) => {
    if (user) {
      await addCollectionItem(user.uid, 'designPackages', pkg);
    } else {
      setState((prev) => ({
        ...prev,
        designPackages: [{ ...pkg, id: `pack-${Date.now()}` }, ...(prev.designPackages || [])],
      }));
    }
  };

  const handleUpdateDesignPackage = async (id: string, data: any) => {
    if (user) {
      await updateCollectionItem(user.uid, 'designPackages', id, data);
    } else {
      setState((prev) => ({
        ...prev,
        designPackages: (prev.designPackages || []).map((p) =>
          p.id === id ? { ...p, ...data } : p
        ),
      }));
    }
  };

  const handleAddDesignComment = async (comment: any) => {
    if (user) {
      await addCollectionItem(user.uid, 'designComments', comment);
    } else {
      setState((prev) => ({
        ...prev,
        designComments: [...(prev.designComments || []), { ...comment, id: `com-${Date.now()}` }],
      }));
    }
  };

  const handleDeleteDesignFolder = async (id: string) => {
    if (user) {
      await deleteCollectionItem(user.uid, 'designFolders', id);
    } else {
      setState((prev) => ({
        ...prev,
        designFolders: (prev.designFolders || []).filter((f) => f.id !== id),
      }));
    }
  };

  const handleDeleteDesignBriefing = async (id: string) => {
    if (user) {
      await deleteCollectionItem(user.uid, 'designBriefings', id);
    } else {
      setState((prev) => ({
        ...prev,
        designBriefings: (prev.designBriefings || []).filter((b) => b.id !== id),
      }));
    }
  };

  const handleDeleteDesignPackage = async (id: string) => {
    if (user) {
      await deleteCollectionItem(user.uid, 'designPackages', id);
    } else {
      setState((prev) => ({
        ...prev,
        designPackages: (prev.designPackages || []).filter((p) => p.id !== id),
      }));
    }
  };

  const handleDeleteDesignComment = async (id: string) => {
    if (user) {
      await deleteCollectionItem(user.uid, 'designComments', id);
    } else {
      setState((prev) => ({
        ...prev,
        designComments: (prev.designComments || []).filter((c) => c.id !== id),
      }));
    }
  };

  const handleClearAllDesignData = async () => {
    if (user) {
      for (const p of state.designProjects || []) {
        await deleteCollectionItem(user.uid, 'designProjects', p.id);
      }
      for (const f of state.designFolders || []) {
        await deleteCollectionItem(user.uid, 'designFolders', f.id);
      }
      for (const b of state.designBriefings || []) {
        await deleteCollectionItem(user.uid, 'designBriefings', b.id);
      }
      for (const pkg of state.designPackages || []) {
        await deleteCollectionItem(user.uid, 'designPackages', pkg.id);
      }
      for (const c of state.designComments || []) {
        await deleteCollectionItem(user.uid, 'designComments', c.id);
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
    <div className="min-h-screen bg-[#06070a] text-gray-100 flex flex-col font-sans selection:bg-[#22c55e] selection:text-black">
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

      <div className="flex flex-1 relative overflow-hidden">
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
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

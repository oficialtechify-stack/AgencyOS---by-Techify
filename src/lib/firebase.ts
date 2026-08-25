import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  KPIPeriod,
  CashTransaction,
  AdCampaign,
  CRMLead,
  KanbanTask,
  StockItem,
  CalendarEvent,
  SocialPost,
  UserProfile,
  ViewType,
  DesignProject,
  DesignFolder,
  DesignBriefingDemand,
  DesignPackage,
  DesignComment,
} from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export interface FirestoreUserProfile {
  uid: string;
  name: string;
  email: string;
  agencyName: string;
  avatarUrl?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  bio?: string;
  department?: 'marketing' | 'design' | 'prospeccao' | 'trafego' | 'gestao' | 'suporte' | 'desenvolvimento' | string;
  role?: string;
  leadershipRole?: 'lider_geral' | 'lider_marketing' | 'lider_prospeccao' | 'lider_design' | 'membro';
  workStatus?: 'online' | 'busy' | 'lunch' | 'away' | 'offline';
  customStatus?: string;
  userType?: 'employee' | 'client';
  agencyOwnerUid?: string;
  designRole?: 'admin' | 'lider' | 'designer' | 'funcionario' | 'cliente';
  canEditDesigns?: boolean;
  canCreateDesigns?: boolean;
  canApproveDesigns?: boolean;
  canPublishPosts?: boolean;
  canDeleteDesigns?: boolean;
  plan: 'Gratuito / Equipe' | 'Trial Gratuito' | 'Starter' | 'Pro' | 'Agency';
  status: 'active' | 'Trial Expirado' | 'cancelled' | 'blocked';
  trialStartDate: number;
  trialEndsAt: number;
  createdAt: string;
  notes?: string;
  allowedModules?: ViewType[];
  tempPasswordHint?: string;
}

// Initial default data seed for new individual user dashboards
export const DEFAULT_INITIAL_DATA = {
  kpiPeriods: [
    {
      id: 'kpi-1',
      monthYear: '06/2026',
      mrr: 28500,
      arr: 342000,
      ltv: 14200,
      cac: 650,
      churnRate: 2.1,
      activeClients: 18,
    },
    {
      id: 'kpi-2',
      monthYear: '07/2026',
      mrr: 34200,
      arr: 410400,
      ltv: 15100,
      cac: 580,
      churnRate: 1.8,
      activeClients: 22,
    },
    {
      id: 'kpi-3',
      monthYear: '08/2026',
      mrr: 41800,
      arr: 501600,
      ltv: 16500,
      cac: 510,
      churnRate: 1.4,
      activeClients: 27,
    },
  ] as KPIPeriod[],

  transactions: [
    {
      id: 'tx-1',
      type: 'Entrada',
      category: 'Fee Mensal',
      description: 'Pagamento Cliente - Loja Silva & Cia',
      amount: 4500,
      date: '2026-08-01',
    },
    {
      id: 'tx-2',
      type: 'Entrada',
      category: 'Projeto Setup',
      description: 'Setup CRM + Google Maps Scraper - Construtora Alfa',
      amount: 7200,
      date: '2026-08-03',
    },
    {
      id: 'tx-3',
      type: 'Saída',
      category: 'Ferramentas & Software',
      description: 'Assinatura Servidores Cloud & API Gemini AI',
      amount: 1450,
      date: '2026-08-05',
    },
    {
      id: 'tx-4',
      type: 'Saída',
      category: 'Equipe',
      description: 'Pró-labore Gestor Tráfego Senior',
      amount: 5800,
      date: '2026-08-08',
    },
  ] as CashTransaction[],

  campaigns: [
    {
      id: 'camp-1',
      name: 'Black Friday Antecipada - E-commerce Moda',
      platform: 'Meta Ads',
      spend: 3400,
      revenue: 22800,
      clicks: 4120,
      conversions: 186,
      roas: 6.7,
      status: 'Ativa',
    },
    {
      id: 'camp-2',
      name: 'Captação Leads B2B - Odonto Corp',
      platform: 'Google Ads',
      spend: 2100,
      revenue: 14700,
      clicks: 1850,
      conversions: 42,
      roas: 7.0,
      status: 'Ativa',
    },
    {
      id: 'camp-3',
      name: 'Branding Local - Restaurante Gourmet',
      platform: 'TikTok Ads',
      spend: 950,
      revenue: 3800,
      clicks: 6200,
      conversions: 84,
      roas: 4.0,
      status: 'Pausada',
    },
  ] as AdCampaign[],

  leads: [
    {
      id: 'lead-1',
      name: 'Dra. Camila Odontologia',
      city: 'São Paulo - SP',
      category: 'Saúde e Estética',
      phone: '(11) 98822-1100',
      email: 'contato@dracamilaodonto.com.br',
      website: 'dracamilaodonto.com.br',
      instagram: '@dracamilaodonto',
      rating: 4.9,
      status: 'proposta',
    },
    {
      id: 'lead-2',
      name: 'Marmoraria & Construtora Real',
      city: 'Curitiba - PR',
      category: 'Arquitetura e Engenharia',
      phone: '(41) 99114-3322',
      email: 'comercial@marmorariareal.com',
      website: 'marmorariareal.com',
      instagram: '@marmorariareal',
      rating: 4.7,
      status: 'qualificado',
    },
    {
      id: 'lead-3',
      name: 'Escola de Idiomas SpeedUp',
      city: 'Belo Horizonte - MG',
      category: 'Educação',
      phone: '(31) 97755-4433',
      email: 'direcao@speedup.edu.br',
      website: null,
      instagram: '@speedupbh',
      rating: 4.5,
      status: 'novo',
    },
  ] as CRMLead[],

  tasks: [
    {
      id: 'task-1',
      title: 'Configurar Pixel Meta Ads e CAPI',
      client: 'Loja Silva & Cia',
      description: 'Instalar servidor CAPI para evitar perdas de rastreamento no iOS 18',
      status: 'Em Andamento',
      priority: 'Alta',
    },
    {
      id: 'task-2',
      title: 'Apresentação de Relatório Mensal ROAS',
      client: 'Dra. Camila Odonto',
      description: 'Reunião de alinhamento e apresentação do dashboard do trimestre',
      status: 'Backlog',
      priority: 'Média',
    },
    {
      id: 'task-3',
      title: 'Aprovação de Criativos de Vídeo',
      client: 'Construtora Alfa',
      description: 'Roteiro e gravação dos anúncios de alta conversão do lançamento',
      status: 'Revisão',
      priority: 'Alta',
    },
  ] as KanbanTask[],

  stockItems: [
    {
      id: 'item-1',
      name: 'Licença API Google Maps Scraper (Créditos)',
      category: 'Automação B2B',
      quantity: 50,
      minQuantity: 10,
      unitPrice: 120,
      status: 'Ativo',
    },
    {
      id: 'item-2',
      name: 'Pacote de Design & Vídeo Anúncios (Unidades)',
      category: 'Conteúdo Criativo',
      quantity: 8,
      minQuantity: 15,
      unitPrice: 450,
      status: 'Estoque Baixo',
    },
  ] as StockItem[],

  events: [
    {
      id: 'evt-1',
      title: 'Fechamento de Contrato de Tráfego',
      date: '2026-08-14',
      time: '14:30',
      client: 'Dra. Camila Odonto',
      type: 'Fechamento',
      meetUrl: 'https://meet.google.com/abc-defg-hij',
    },
    {
      id: 'evt-2',
      title: 'Alinhamento Estratégico de Q3',
      date: '2026-08-15',
      time: '10:00',
      client: 'Construtora Alfa',
      type: 'Alinhamento',
      meetUrl: 'https://meet.google.com/xyz-uvwx-rst',
    },
  ] as CalendarEvent[],

  socialPosts: [
    {
      id: 'post-1',
      platform: 'Instagram',
      client: 'Loja Silva & Cia',
      content: '🔥 Oferta exclusiva da semana! Garanta seu cupom de 20% OFF no link da bio.',
      scheduledDate: '2026-08-16',
      scheduledTime: '18:00',
      status: 'Agendado',
    },
  ] as SocialPost[],

  designProjects: [] as DesignProject[],

  designFolders: [] as DesignFolder[],

  designBriefings: [] as DesignBriefingDemand[],

  designPackages: [] as DesignPackage[],

  designComments: [] as DesignComment[],
};

// User Profile Operations
export async function getOrCreateUserProfile(user: User, customAgencyName?: string): Promise<FirestoreUserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return snap.data() as FirestoreUserProfile;
  }

  // Create new profile with 14-day trial
  const now = Date.now();
  const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

  const newProfile: FirestoreUserProfile = {
    uid: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Usuário Gestor',
    email: user.email || '',
    agencyName: customAgencyName || 'Sua Agência Digital',
    plan: 'Trial Gratuito',
    status: 'active',
    trialStartDate: now,
    trialEndsAt: now + FOURTEEN_DAYS_MS,
    createdAt: new Date().toISOString(),
  };

  await setDoc(userRef, newProfile);

  // Populate default seed data for this individual user
  await seedInitialUserData(user.uid);

  return newProfile;
}

export async function updateUserProfile(uid: string, data: Partial<FirestoreUserProfile>) {
  const userRef = doc(db, 'users', uid);
  const cleanData = sanitizeFirestorePayload(data);
  await updateDoc(userRef, cleanData);
}

// Seed user subcollections with atomic writeBatch and idempotency check
export async function seedInitialUserData(uid: string) {
  try {
    // Check if the user workspace is already initialized to avoid exhausting write streams
    const markerDoc = await getDoc(doc(db, 'users', uid, 'kpiPeriods', 'kpi-1'));
    if (markerDoc.exists()) {
      return; // Already seeded, skip cleanly
    }

    const batch = writeBatch(db);
    const collectionsMap = [
      { name: 'kpiPeriods', items: DEFAULT_INITIAL_DATA.kpiPeriods },
      { name: 'transactions', items: DEFAULT_INITIAL_DATA.transactions },
      { name: 'campaigns', items: DEFAULT_INITIAL_DATA.campaigns },
      { name: 'leads', items: DEFAULT_INITIAL_DATA.leads },
      { name: 'tasks', items: DEFAULT_INITIAL_DATA.tasks },
      { name: 'stockItems', items: DEFAULT_INITIAL_DATA.stockItems },
      { name: 'events', items: DEFAULT_INITIAL_DATA.events },
      { name: 'socialPosts', items: DEFAULT_INITIAL_DATA.socialPosts },
    ];

    let count = 0;
    for (const { name, items } of collectionsMap) {
      for (const item of items) {
        if (item && item.id) {
          const itemRef = doc(db, 'users', uid, name, item.id);
          batch.set(itemRef, sanitizeFirestorePayload(item));
          count++;
        }
      }
    }

    if (count > 0) {
      await batch.commit();
    }
  } catch (seedErr) {
    console.warn('Erro controlado ao popular dados iniciais:', seedErr);
  }
}

// Subscribe to real-time user collections
export function subscribeToUserCollection<T>(
  uid: string,
  collectionName: string,
  onData: (items: T[]) => void
) {
  const colRef = collection(db, 'users', uid, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as unknown as T);
      });
      onData(items);
    },
    (err) => {
      console.error(`Error subscribing to ${collectionName}:`, err);
    }
  );
}

// Subscribe to User Profile
export function subscribeToUserProfile(uid: string, onData: (profile: FirestoreUserProfile | null) => void) {
  const userRef = doc(db, 'users', uid);
  return onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as FirestoreUserProfile);
      } else {
        onData(null);
      }
    },
    (err) => {
      console.warn('Error subscribing to user profile:', err);
    }
  );
}

// Helper to recursively strip undefined properties before sending to Firestore
export function sanitizeFirestorePayload<T = any>(obj: T): T {
  if (obj === null || obj === undefined) return null as unknown as T;
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => (typeof item === 'object' && item !== null ? sanitizeFirestorePayload(item) : item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = typeof value === 'object' && value !== null ? sanitizeFirestorePayload(value) : value;
      }
    }
    return cleaned as T;
  }
  return obj;
}

// Firestore collection Item operations
export async function addCollectionItem(uid: string, collectionName: string, itemData: any) {
  const cleanData = sanitizeFirestorePayload(itemData);
  if (itemData && itemData.id) {
    const itemRef = doc(db, 'users', uid, collectionName, String(itemData.id));
    await setDoc(itemRef, cleanData, { merge: true });
    return itemData.id;
  }
  const colRef = collection(db, 'users', uid, collectionName);
  const docRef = await addDoc(colRef, cleanData);
  return docRef.id;
}

export async function updateCollectionItem(uid: string, collectionName: string, itemId: string, itemData: any) {
  if (!uid || !itemId) return;
  const itemRef = doc(db, 'users', uid, collectionName, String(itemId));
  const cleanData = sanitizeFirestorePayload(itemData);
  await setDoc(itemRef, cleanData, { merge: true });
}

export async function deleteCollectionItem(uid: string, collectionName: string, itemId: string) {
  const itemRef = doc(db, 'users', uid, collectionName, itemId);
  await deleteDoc(itemRef);
}

// Batch delete items to prevent exhausting write streams on bulk actions
export async function batchDeleteCollectionItems(uid: string, collectionName: string, itemIds: string[]) {
  if (!itemIds || itemIds.length === 0) return;
  const batch = writeBatch(db);
  for (const id of itemIds) {
    const itemRef = doc(db, 'users', uid, collectionName, id);
    batch.delete(itemRef);
  }
  await batch.commit();
}

// Subscribe to ALL Users across the platform for Admin Panel
export function subscribeAllUsers(
  onData: (users: FirestoreUserProfile[]) => void,
  onError?: (err: any) => void
) {
  const usersRef = collection(db, 'users');
  return onSnapshot(
    usersRef,
    (snapshot) => {
      const users: FirestoreUserProfile[] = [];
      snapshot.forEach((docSnap) => {
        users.push({ uid: docSnap.id, ...docSnap.data() } as FirestoreUserProfile);
      });
      onData(users);
    },
    (err) => {
      console.error('Error fetching all users:', err);
      if (onError) onError(err);
    }
  );
}

// Helper to resolve the primary Agency Owner UID for employees
export async function resolvePrimaryAgencyOwnerUid(): Promise<string | null> {
  try {
    const usersRef = collection(db, 'users');
    
    // First, search for the primary agency owner by email
    const qOwner = query(usersRef, where('email', '==', 'rickmarketing81@gmail.com'));
    const snapOwner = await getDocs(qOwner);
    if (!snapOwner.empty) {
      return snapOwner.docs[0].id;
    }

    // Next, check for users with role 'Master Admin' or 'Administrador'
    const qAdmin = query(usersRef, where('role', 'in', ['Master Admin', 'Administrador', 'Executivo']));
    const snapAdmin = await getDocs(qAdmin);
    if (!snapAdmin.empty) {
      // Return the first master admin that is NOT an employee
      for (const d of snapAdmin.docs) {
        const udata = d.data();
        if (udata.userType !== 'employee') {
          return d.id;
        }
      }
      return snapAdmin.docs[0].id;
    }

    // Fallback: search all users for the first non-employee with an active agency
    const allUsers = await getDocs(usersRef);
    for (const d of allUsers.docs) {
      const data = d.data();
      if (data.email?.toLowerCase().includes('rick') || data.email?.toLowerCase().includes('admin')) {
        return d.id;
      }
      if (data.userType !== 'employee' && (data.plan === 'Pro' || data.plan === 'Agency' || data.plan === 'Trial Gratuito')) {
        return d.id;
      }
    }
  } catch (err) {
    console.error('Erro ao resolver UID do proprietário da agência:', err);
  }
  return null;
}

// Delete user profile document from Firestore
export async function deleteUserFromFirestore(uid: string) {
  const userRef = doc(db, 'users', uid);
  await deleteDoc(userRef);
}

// Anti-Spam & Rate Limiting Guard
const requestCooldownMap = new Map<string, number>();

export function checkRateLimit(actionKey: string, cooldownMs = 1000): boolean {
  const now = Date.now();
  const lastTime = requestCooldownMap.get(actionKey) || 0;
  if (now - lastTime < cooldownMs) {
    return false; // Skip if triggered too rapidly
  }
  requestCooldownMap.set(actionKey, now);
  return true;
}

// Add/Invite new user directly into Firestore or Firebase Auth
export async function createUserWithAuthAndPermissions(userData: {
  email: string;
  password?: string;
  name?: string;
  role?: string;
  leadershipRole?: 'lider_geral' | 'lider_marketing' | 'lider_prospeccao' | 'lider_design' | 'membro';
  userType?: 'employee' | 'client';
  agencyOwnerUid?: string;
  designRole?: 'admin' | 'lider' | 'designer' | 'funcionario' | 'cliente';
  canEditDesigns?: boolean;
  canCreateDesigns?: boolean;
  canApproveDesigns?: boolean;
  canPublishPosts?: boolean;
  canDeleteDesigns?: boolean;
  agencyName?: string;
  plan?: 'Gratuito / Equipe' | 'Trial Gratuito' | 'Starter' | 'Pro' | 'Agency';
  status?: 'active' | 'Trial Expirado' | 'cancelled' | 'blocked';
  allowedModules?: ViewType[];
  notes?: string;
}) {
  const normalizedEmail = (userData.email || '').toLowerCase().trim();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw new Error('E-mail inválido ou não informado.');
  }

  let targetUid = '';

  // If a password with at least 6 chars was provided, create Firebase Auth account
  // using a secondary App instance so the current Admin session isn't replaced!
  if (userData.password && userData.password.length >= 6) {
    const secondaryAppName = 'SecondaryAuthAppCreator';
    const existingApps = getApps();
    const secondaryApp =
      existingApps.find((a) => a.name === secondaryAppName) ||
      initializeApp(firebaseConfig, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        normalizedEmail,
        userData.password
      );
      targetUid = userCredential.user.uid;
      // Immediately sign out from the secondary instance
      await signOut(secondaryAuth);
    } catch (authErr: any) {
      if (authErr.code === 'auth/email-already-in-use') {
        console.warn('E-mail já registrado no Firebase Auth. Atualizando documento Firestore.');
      } else if (
        authErr.code === 'auth/operation-not-allowed' ||
        authErr.message?.includes('operation-not-allowed') ||
        authErr.code === 'auth/admin-restricted-operation'
      ) {
        console.warn(
          'Firebase Auth: Provedor de Email/Senha não habilitado ou restrito. Criando registro com credenciais no Firestore:',
          authErr.message
        );
      } else {
        console.warn('Aviso na criação no Firebase Auth, salvando no Firestore:', authErr.message || authErr);
      }
    }
  }

  // If targetUid is not set (or email was already in Auth), check existing Firestore doc
  if (!targetUid) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', normalizedEmail));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      targetUid = querySnap.docs[0].id;
    } else {
      targetUid = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    }
  }

  const now = Date.now();
  const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;
  const isEmployee = userData.userType === 'employee';

  const fullProfile: FirestoreUserProfile = {
    uid: targetUid,
    name: userData.name?.trim() || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    agencyName: userData.agencyName?.trim() || 'Agência Digital',
    role: userData.role?.trim() || (isEmployee ? 'Membro da Equipe' : 'Cliente AgencyOS'),
    leadershipRole: userData.leadershipRole || (userData.role?.toLowerCase().includes('marketing') ? 'lider_marketing' : userData.role?.toLowerCase().includes('prospec') ? 'lider_prospeccao' : userData.role?.toLowerCase().includes('lider') || userData.role?.toLowerCase().includes('líder') ? 'lider_geral' : 'membro'),
    userType: userData.userType || (isEmployee ? 'employee' : 'client'),
    agencyOwnerUid: userData.agencyOwnerUid || undefined,
    designRole: userData.designRole || (isEmployee ? 'funcionario' : 'cliente'),
    canEditDesigns: userData.canEditDesigns !== undefined ? userData.canEditDesigns : true,
    canCreateDesigns: userData.canCreateDesigns !== undefined ? userData.canCreateDesigns : true,
    canApproveDesigns: userData.canApproveDesigns !== undefined ? userData.canApproveDesigns : false,
    canPublishPosts: userData.canPublishPosts !== undefined ? userData.canPublishPosts : true,
    canDeleteDesigns: userData.canDeleteDesigns !== undefined ? userData.canDeleteDesigns : false,
    plan: isEmployee ? 'Gratuito / Equipe' : (userData.plan || 'Trial Gratuito'),
    status: userData.status || 'active',
    trialStartDate: now,
    trialEndsAt: now + FOURTEEN_DAYS,
    createdAt: new Date().toLocaleDateString('pt-BR'),
    notes: userData.notes?.trim() || '',
    allowedModules: userData.allowedModules && userData.allowedModules.length > 0
      ? userData.allowedModules
      : ['dashboard', 'designer', 'social-hub', 'kanban', 'agenda', 'relatorios'],
    tempPasswordHint: userData.password ? userData.password : undefined,
  };

  const userRef = doc(db, 'users', targetUid);
  await setDoc(userRef, fullProfile, { merge: true });

  // Seed default data for the user if it is an independent client
  if (!isEmployee) {
    try {
      await seedInitialUserData(targetUid);
    } catch (seedErr) {
      console.warn('Erro ao inicializar subcoleções:', seedErr);
    }
  }

  return fullProfile;
}

// Add/Invite new user directly into Firestore (Backward compatibility wrapper)
export async function addUserToFirestore(userData: Omit<FirestoreUserProfile, 'uid'> & { uid?: string; password?: string }) {
  return createUserWithAuthAndPermissions({
    email: userData.email,
    password: userData.password,
    name: userData.name,
    role: userData.role,
    agencyName: userData.agencyName,
    plan: userData.plan,
    status: userData.status,
    allowedModules: userData.allowedModules,
    notes: userData.notes,
  });
}

// Update user permissions in Firestore
export async function updateUserPermissionsInFirestore(
  uid: string,
  allowedModules: ViewType[],
  extraData?: Partial<FirestoreUserProfile>
) {
  const userRef = doc(db, 'users', uid);
  const payload: Record<string, any> = { allowedModules, ...extraData };
  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(payload)) {
    if (val !== undefined) {
      sanitized[key] = val;
    }
  }
  await updateDoc(userRef, sanitized);
}

// Update existing user profile in Firestore
export async function updateUserInFirestore(uid: string, data: Partial<FirestoreUserProfile>) {
  const userRef = doc(db, 'users', uid);
  const sanitizedData: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      sanitizedData[key] = val;
    }
  }
  await updateDoc(userRef, sanitizedData);
}

// Auth Session Management (Supporting both Firebase Auth & Firestore Admin-Created Users)
export interface ActiveSession {
  uid: string;
  email: string;
  name?: string;
}

const SESSION_KEY = 'agencyos_auth_session';

export function getStoredSession(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler sessão salva:', e);
  }
  return null;
}

export function setStoredSession(session: ActiveSession | null) {
  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (e) {
    console.error('Erro ao salvar sessão:', e);
  }
  window.dispatchEvent(new Event('agencyos_session_changed'));
}

// Unified Login Handler that checks Firebase Auth and Firestore records
export async function loginWithEmailOrFirestoreCredentials(
  emailInput: string,
  passwordInput: string
): Promise<FirestoreUserProfile> {
  const cleanEmail = (emailInput || '').toLowerCase().trim();
  const cleanPassword = (passwordInput || '').trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Por favor, informe um e-mail válido.');
  }

  if (!cleanPassword) {
    throw new Error('Informe a senha de acesso.');
  }

  // 1. Attempt standard Firebase Auth sign in
  let authSuccess = false;
  let authUser: User | null = null;
  try {
    const res = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
    authUser = res.user;
    authSuccess = true;
  } catch (authErr: any) {
    console.log('Firebase Auth direto não autenticou ou está restrito. Verificando cadastro no Firestore:', authErr?.code || authErr?.message);
  }

  if (authSuccess && authUser) {
    const profile = await getOrCreateUserProfile(authUser);
    setStoredSession({
      uid: profile.uid,
      email: profile.email,
      name: profile.name,
    });
    return profile;
  }

  // 2. Query Firestore 'users' collection for the user registered by Admin
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', cleanEmail));
  const querySnap = await getDocs(q);

  if (querySnap.empty) {
    // If not found with exact query, fetch all and search case-insensitively
    const allUsersSnap = await getDocs(usersRef);
    let matchedDoc: any = null;
    allUsersSnap.forEach((d) => {
      const data = d.data();
      if ((data.email || '').toLowerCase().trim() === cleanEmail) {
        matchedDoc = { id: d.id, ...data };
      }
    });

    if (!matchedDoc) {
      throw new Error('Usuário não encontrado. Verifique o e-mail digitado ou solicite acesso ao administrador.');
    }

    return handleValidateFirestoreProfile(matchedDoc, cleanPassword);
  }

  const userDoc = { uid: querySnap.docs[0].id, ...querySnap.docs[0].data() } as unknown as FirestoreUserProfile;
  return handleValidateFirestoreProfile(userDoc, cleanPassword);
}

// Helper to validate Firestore user status and password
async function handleValidateFirestoreProfile(
  userProfile: FirestoreUserProfile,
  passwordInput: string
): Promise<FirestoreUserProfile> {
  if (userProfile.status === 'blocked') {
    throw new Error('Sua conta foi suspensa ou bloqueada pelo administrador. Entre em contato com o suporte.');
  }

  if (userProfile.status === 'cancelled') {
    throw new Error('Seu acesso/assinatura foi cancelado.');
  }

  // Verify password if a password was configured
  if (userProfile.tempPasswordHint && userProfile.tempPasswordHint.trim() !== passwordInput) {
    throw new Error('Senha incorreta para este usuário.');
  }

  // Ensure UID is set
  const uid = userProfile.uid || (userProfile as any).id || `user-${Date.now()}`;
  const fullProfile: FirestoreUserProfile = {
    ...userProfile,
    uid,
  };

  // Set active custom session
  setStoredSession({
    uid: fullProfile.uid,
    email: fullProfile.email,
    name: fullProfile.name || fullProfile.email.split('@')[0],
  });

  // Seed default workspace subcollections if needed
  try {
    await seedInitialUserData(fullProfile.uid);
  } catch (seedErr) {
    console.warn('Workspace subcollections already seeded or initialized:', seedErr);
  }

  return fullProfile;
}

// Unified Signup Handler
export async function signUpWithEmailOrFirestore(
  emailInput: string,
  passwordInput: string,
  agencyNameInput?: string,
  nameInput?: string
): Promise<FirestoreUserProfile> {
  const cleanEmail = (emailInput || '').toLowerCase().trim();
  const cleanPassword = (passwordInput || '').trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Por favor, informe um e-mail válido.');
  }

  if (!cleanPassword || cleanPassword.length < 6) {
    throw new Error('A senha deve ter no mínimo 6 caracteres.');
  }

  // Try standard Firebase Auth signup
  try {
    const res = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
    try {
      await sendUserVerificationEmail(res.user);
    } catch (vErr) {
      console.warn('Erro ao enviar e-mail de verificação:', vErr);
    }
    const profile = await getOrCreateUserProfile(res.user, agencyNameInput);
    setStoredSession({
      uid: profile.uid,
      email: profile.email,
      name: profile.name,
    });
    return profile;
  } catch (authErr: any) {
    if (authErr.code === 'auth/email-already-in-use') {
      throw new Error('Este e-mail já está cadastrado. Faça login na aba Entrar.');
    }
    console.log('Criando conta com registro direto no Firestore:', authErr?.message || authErr);
  }

  // Create directly via Firestore with full trial permissions
  const newProfile = await createUserWithAuthAndPermissions({
    email: cleanEmail,
    password: cleanPassword,
    name: nameInput?.trim() || cleanEmail.split('@')[0],
    agencyName: agencyNameInput?.trim() || 'Sua Agência Digital',
    plan: 'Trial Gratuito',
    status: 'active',
    allowedModules: ['dashboard', 'kpis', 'fluxo-caixa', 'campanhas', 'agenda', 'maps-scraper', 'social-hub', 'estoque', 'kanban', 'relatorios', 'calculadora-roi', 'ia-consultora'],
  });

  setStoredSession({
    uid: newProfile.uid,
    email: newProfile.email,
    name: newProfile.name,
  });

  return newProfile;
}

// Auth Helper Functions
export async function sendUserVerificationEmail(userToVerify?: User | null) {
  const targetUser = userToVerify || auth.currentUser;
  if (!targetUser) throw new Error('Nenhum usuário autenticado.');
  await sendEmailVerification(targetUser);
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);
  const profile = await getOrCreateUserProfile(res.user);
  setStoredSession({
    uid: profile.uid,
    email: profile.email,
    name: profile.name,
  });
  return res;
}

export async function logoutUser() {
  setStoredSession(null);
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Erro ao deslogar do Firebase Auth:', e);
  }
}

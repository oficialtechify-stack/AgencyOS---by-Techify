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
  ChatMessage,
  ChatChannel,
} from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const rawDbId = (firebaseConfig as any).firestoreDatabaseId;
export const db =
  rawDbId &&
  rawDbId !== '(default)' &&
  typeof rawDbId === 'string' &&
  rawDbId.trim() !== ''
    ? getFirestore(app, rawDbId)
    : getFirestore(app);

export interface FirestoreUserProfile {
  uid: string;
  name: string;
  email: string;
  agencyName: string;
  avatarUrl?: string;
  photoURL?: string;
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

// Linked Company resolution for employees, clients and invitations
export interface LinkedCompanyResult {
  agencyOwnerUid?: string;
  agencyName?: string;
  userType?: 'employee' | 'client';
  role?: string;
  department?: string;
  allowedModules?: ViewType[];
  designRole?: 'admin' | 'lider' | 'designer' | 'funcionario' | 'cliente';
  canEditDesigns?: boolean;
  canCreateDesigns?: boolean;
  canApproveDesigns?: boolean;
  canPublishPosts?: boolean;
  profileDocId?: string;
}

/**
 * Searches if an email is registered by any Agency/Company in the system.
 * If found, returns the company owner's workspace UID so the user is directly
 * redirected to that company's dashboard instead of a generic profile.
 */
export async function findLinkedCompanyForEmail(
  emailInput: string,
  excludeUid?: string
): Promise<LinkedCompanyResult | null> {
  const cleanEmail = (emailInput || '').toLowerCase().trim();
  if (!cleanEmail || !cleanEmail.includes('@')) return null;

  try {
    // 1. Check default registered team members (Techify team)
    const staticMem = AGENCY_REGISTERED_TEAM_MEMBERS.find(
      (m) => (m.email || '').toLowerCase().trim() === cleanEmail
    );
    if (staticMem) {
      const ownerUid = (await resolvePrimaryAgencyOwnerUid()) || 'user-rick-marcos';
      return {
        agencyOwnerUid: ownerUid,
        agencyName: staticMem.agencyName || 'Techify Agência',
        userType: 'employee',
        role: staticMem.role || 'Membro da Equipe',
        department: staticMem.department || 'gestao',
        allowedModules: staticMem.allowedModules,
        designRole: staticMem.designRole,
        canEditDesigns: staticMem.canEditDesigns,
        canCreateDesigns: staticMem.canCreateDesigns,
        canApproveDesigns: staticMem.canApproveDesigns,
        canPublishPosts: staticMem.canPublishPosts,
      };
    }

    // 2. Query Firestore 'users' collection where email == cleanEmail
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', cleanEmail));
    const snap = await getDocs(q);

    let candidateDoc: any = null;
    let candidateDocId = '';

    for (const d of snap.docs) {
      if (d.id === excludeUid) continue;
      const data = d.data();
      // If doc has an agencyOwnerUid pointing to a company owner
      if (data.agencyOwnerUid && data.agencyOwnerUid !== d.id && data.agencyOwnerUid !== excludeUid) {
        candidateDoc = data;
        candidateDocId = d.id;
        break;
      }
      if (!candidateDoc && (data.userType === 'employee' || data.agencyOwnerUid)) {
        candidateDoc = data;
        candidateDocId = d.id;
      }
    }

    // 3. Fallback: Search all users case-insensitively if not found with exact match
    if (!candidateDoc) {
      const allSnap = await getDocs(usersRef);
      for (const d of allSnap.docs) {
        if (d.id === excludeUid) continue;
        const data = d.data();
        if ((data.email || '').toLowerCase().trim() === cleanEmail) {
          if (data.agencyOwnerUid && data.agencyOwnerUid !== d.id && data.agencyOwnerUid !== excludeUid) {
            candidateDoc = data;
            candidateDocId = d.id;
            break;
          }
          if (!candidateDoc && (data.userType === 'employee' || data.agencyOwnerUid)) {
            candidateDoc = data;
            candidateDocId = d.id;
          }
        }
      }
    }

    if (candidateDoc) {
      let resolvedOwnerUid = candidateDoc.agencyOwnerUid;
      if (!resolvedOwnerUid || resolvedOwnerUid === 'agency-master-owner') {
        if (candidateDoc.agencyName?.toLowerCase().includes('techify')) {
          resolvedOwnerUid = (await resolvePrimaryAgencyOwnerUid()) || undefined;
        } else if (candidateDoc.userType === 'employee') {
          const agencyName = candidateDoc.agencyName;
          if (agencyName) {
            const allUsers = await getDocs(usersRef);
            for (const d of allUsers.docs) {
              const u = d.data();
              if (u.agencyName === agencyName && u.userType !== 'employee' && d.id !== candidateDocId) {
                resolvedOwnerUid = d.id;
                break;
              }
            }
          }
        }
      }

      return {
        agencyOwnerUid: resolvedOwnerUid,
        agencyName: candidateDoc.agencyName || 'Agência Digital',
        userType: candidateDoc.userType || 'employee',
        role: candidateDoc.role || 'Membro da Equipe',
        department: candidateDoc.department || 'gestao',
        allowedModules: candidateDoc.allowedModules,
        designRole: candidateDoc.designRole,
        canEditDesigns: candidateDoc.canEditDesigns,
        canCreateDesigns: candidateDoc.canCreateDesigns,
        canApproveDesigns: candidateDoc.canApproveDesigns,
        canPublishPosts: candidateDoc.canPublishPosts,
        profileDocId: candidateDocId,
      };
    }
  } catch (err) {
    console.warn('Erro ao buscar vínculo corporativo por e-mail:', err);
  }

  return null;
}

// User Profile Operations
export async function getOrCreateUserProfile(user: User, customAgencyName?: string): Promise<FirestoreUserProfile> {
  const cleanEmail = (user.email || '').toLowerCase().trim();
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  const linked = await findLinkedCompanyForEmail(cleanEmail, user.uid);

  // 1. If document already exists by user.uid
  if (snap.exists()) {
    const existing = snap.data() as FirestoreUserProfile;
    // If the user is linked to an agency/company but their document is missing agencyOwnerUid or points to itself
    if (
      linked?.agencyOwnerUid &&
      (!existing.agencyOwnerUid || existing.agencyOwnerUid === user.uid || existing.agencyOwnerUid === 'agency-master-owner')
    ) {
      const merged: FirestoreUserProfile = {
        ...existing,
        avatarUrl: user.photoURL || existing.avatarUrl || '',
        photoURL: user.photoURL || (existing as any).photoURL || '',
        agencyOwnerUid: linked.agencyOwnerUid,
        agencyName: linked.agencyName || existing.agencyName,
        userType: linked.userType || 'employee',
        role: linked.role || existing.role || 'Membro da Equipe',
        department: (linked.department as any) || existing.department || 'gestao',
        allowedModules: linked.allowedModules || existing.allowedModules,
        designRole: linked.designRole || existing.designRole,
        canEditDesigns: linked.canEditDesigns !== undefined ? linked.canEditDesigns : existing.canEditDesigns,
        canCreateDesigns: linked.canCreateDesigns !== undefined ? linked.canCreateDesigns : existing.canCreateDesigns,
        canApproveDesigns: linked.canApproveDesigns !== undefined ? linked.canApproveDesigns : existing.canApproveDesigns,
        canPublishPosts: linked.canPublishPosts !== undefined ? linked.canPublishPosts : existing.canPublishPosts,
      };
      await setDoc(userRef, sanitizeFirestorePayload(merged), { merge: true });
      return merged;
    }
    return existing;
  }

  // 2. Check if an existing profile exists in Firestore with this email
  if (cleanEmail) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', cleanEmail));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const foundDoc = querySnap.docs[0];
        const existingData = foundDoc.data() as FirestoreUserProfile;
        const merged: FirestoreUserProfile = {
          ...existingData,
          uid: foundDoc.id,
          avatarUrl: user.photoURL || existingData.avatarUrl || '',
          photoURL: user.photoURL || (existingData as any).photoURL || '',
        };
        // Also map to auth uid if different
        if (foundDoc.id !== user.uid) {
          await setDoc(userRef, sanitizeFirestorePayload({ ...merged, uid: user.uid, linkedOriginalId: foundDoc.id }), { merge: true });
        }
        return merged;
      }
    } catch (e) {
      console.warn('Erro ao consultar usuário existente por email:', e);
    }
  }

  // 3. Check if this is the Master Admin or pre-registered team member
  if (
    cleanEmail === 'rickmarketing81@gmail.com' ||
    cleanEmail === 'agencyosoficial@gmail.com' ||
    cleanEmail.includes('rickmarketing81')
  ) {
    const nowIso = new Date().toISOString();
    const masterProfile: FirestoreUserProfile = {
      uid: user.uid,
      name: user.displayName || 'Marcos Henrique',
      email: cleanEmail,
      agencyName: 'Techify Agência',
      plan: 'Agency',
      status: 'active',
      role: 'CEO & Administrador Master',
      userType: 'employee',
      department: 'gestao',
      avatarUrl: user.photoURL || '',
      trialStartDate: Date.now(),
      trialEndsAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
      createdAt: nowIso,
      allowedModules: [
        'dashboard',
        'profile',
        'lideranca',
        'ponto',
        'chat',
        'kpis',
        'fluxo-caixa',
        'campanhas',
        'social-hub',
        'designer',
        'kanban',
        'prospection',
        'agenda',
        'leadspay-companies',
        'admin',
        'leadspay-master',
        'relatorios',
        'calculadora-roi',
        'ia-consultora',
      ],
    };
    await setDoc(userRef, sanitizeFirestorePayload(masterProfile), { merge: true });
    return masterProfile;
  }

  // 4. Create new company profile ("as empresas conseguem criar a conta so pelo google")
  const now = Date.now();
  const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
  const isEmployee = Boolean(linked?.agencyOwnerUid) || linked?.userType === 'employee';
  const companyName = customAgencyName || (user.displayName ? `Empresa ${user.displayName}` : 'Sua Empresa');

  const newProfile: FirestoreUserProfile = {
    uid: user.uid,
    name: user.displayName || cleanEmail.split('@')[0] || 'Empresa Cliente',
    email: cleanEmail,
    avatarUrl: user.photoURL || '',
    photoURL: user.photoURL || '',
    agencyName: linked?.agencyName || companyName,
    agencyOwnerUid: linked?.agencyOwnerUid,
    userType: isEmployee ? 'employee' : 'client',
    role: linked?.role || (isEmployee ? 'Membro da Equipe' : 'Cliente AgencyOS'),
    department: (linked?.department as any) || 'gestao',
    allowedModules: linked?.allowedModules || [
      'dashboard',
      'designer',
      'social-hub',
      'kanban',
      'agenda',
      'relatorios',
      'calculadora-roi',
      'ia-consultora',
    ],
    plan: isEmployee ? 'Gratuito / Equipe' : 'Pro',
    status: 'active',
    designRole: linked?.designRole || 'cliente',
    canEditDesigns: linked?.canEditDesigns ?? true,
    canCreateDesigns: linked?.canCreateDesigns ?? true,
    canApproveDesigns: linked?.canApproveDesigns ?? true,
    canPublishPosts: linked?.canPublishPosts ?? false,
    trialStartDate: now,
    trialEndsAt: now + FOURTEEN_DAYS_MS,
    createdAt: new Date().toISOString(),
  };

  await setDoc(userRef, sanitizeFirestorePayload(newProfile));

  // Sync original invitation document if created with temporary ID
  if (linked?.profileDocId && linked.profileDocId !== user.uid) {
    try {
      await setDoc(doc(db, 'users', linked.profileDocId), { linkedAuthUid: user.uid }, { merge: true });
    } catch (linkSyncErr) {
      console.warn('Aviso ao sincronizar documento de convite:', linkSyncErr);
    }
  }

  // Seed default workspace subcollections for the company in Firestore
  try {
    await seedInitialUserData(user.uid);
  } catch (seedErr) {
    console.warn('Workspace seed:', seedErr);
  }

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
  onData: (items: T[]) => void,
  onError?: (err: any) => void
) {
  if (!uid) return () => {};
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
      if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
        window.dispatchEvent(
          new CustomEvent('agencyos_firestore_permission_denied', { detail: { collectionName } })
        );
        console.warn(`[Firestore] Permissão pendente para coleção '${collectionName}' no Firestore.`);
      } else {
        console.warn(`[Firestore] Aviso na subscrição de '${collectionName}':`, err?.message || err);
      }
      if (onError) onError(err);
      // Fallback to default initial data if available
      if ((DEFAULT_INITIAL_DATA as any)[collectionName]) {
        onData((DEFAULT_INITIAL_DATA as any)[collectionName]);
      }
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
      onData(null);
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

// Default Agency Team Members
// Helper to sanitize avatar URL and remove fake/mock placeholders
export function cleanAvatarUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === '""') return '';
  // Reject fake stock photos (unsplash, placeholders) so only real user uploads are shown
  if (
    trimmed.includes('unsplash.com') ||
    trimmed.includes('placeholder') ||
    trimmed.includes('picsum.photos') ||
    trimmed.includes('dummy')
  ) {
    return '';
  }
  return trimmed;
}

// Universal avatar extractor that checks every possible image field on a user document
export function resolveUserAvatar(userOrUrl?: any): string {
  if (!userOrUrl) return '';
  if (typeof userOrUrl === 'string') {
    return cleanAvatarUrl(userOrUrl);
  }
  if (typeof userOrUrl === 'object') {
    const candidate =
      userOrUrl.avatarUrl ||
      userOrUrl.photoURL ||
      userOrUrl.photoUrl ||
      userOrUrl.avatar ||
      userOrUrl.imageUrl ||
      userOrUrl.picture ||
      userOrUrl.profilePicture ||
      userOrUrl.photo ||
      '';
    return cleanAvatarUrl(candidate);
  }
  return '';
}

export const AGENCY_REGISTERED_TEAM_MEMBERS: FirestoreUserProfile[] = [
  {
    uid: 'user-rick-marcos',
    name: 'Marcos Henrique',
    email: 'rickmarketing81@gmail.com',
    avatarUrl: '',
    instagram: 'rickzinxx_',
    bio: 'CEO & Fundador da Techify AgencyOS • Direção executiva e tecnologia.',
    agencyName: 'Techify Agência',
    role: 'CEO & Diretor Executivo',
    department: 'gestao',
    leadershipRole: 'lider_geral',
    workStatus: 'online',
    plan: 'Agency',
    status: 'active',
    designRole: 'admin',
    canEditDesigns: true,
    canCreateDesigns: true,
    canApproveDesigns: true,
    canPublishPosts: true,
    canDeleteDesigns: true,
    userType: 'employee',
    trialStartDate: Date.now(),
    trialEndsAt: Date.now() + 14 * 86400000,
    createdAt: new Date().toISOString(),
    allowedModules: ['dashboard', 'designer', 'social-hub', 'marketing', 'prospection', 'kanban', 'agenda', 'kpis', 'fluxo-caixa', 'maps-scraper', 'relatorios', 'chat', 'ponto', 'admin'],
  },
  {
    uid: 'user-vitoria-ellen',
    name: 'Vitoria Ellen da Silva',
    email: 'vitoriajob02@gmail.com',
    avatarUrl: '',
    instagram: 'vitoria.design',
    bio: 'Líder de Design & Criativos • Especialista em identidade visual e criativos de alta conversão.',
    agencyName: 'Techify Agência',
    role: 'Lider de Designer',
    department: 'design',
    leadershipRole: 'lider_geral',
    workStatus: 'online',
    plan: 'Gratuito / Equipe',
    status: 'active',
    designRole: 'lider',
    canEditDesigns: true,
    canCreateDesigns: true,
    canApproveDesigns: true,
    canPublishPosts: true,
    canDeleteDesigns: true,
    userType: 'employee',
    tempPasswordHint: 'AgOS@D3LPuH',
    trialStartDate: Date.now(),
    trialEndsAt: Date.now() + 14 * 86400000,
    createdAt: new Date().toISOString(),
    allowedModules: ['dashboard', 'designer', 'social-hub', 'kanban', 'agenda', 'relatorios', 'chat', 'ponto'],
  },
  {
    uid: 'user-lucas-marketing',
    name: 'Lucas Lider do marketing',
    email: 'lucassgabriell876@gmail.com',
    avatarUrl: '',
    instagram: 'lucas.mkt',
    bio: 'Líder de Marketing & Gestão de Tráfego Pago • Escala de campanhas Meta & Google Ads.',
    agencyName: 'Techify Agência',
    role: 'Gestor de Tráfego',
    department: 'marketing',
    leadershipRole: 'lider_marketing',
    workStatus: 'online',
    plan: 'Gratuito / Equipe',
    status: 'active',
    designRole: 'lider',
    canEditDesigns: true,
    canCreateDesigns: true,
    canApproveDesigns: true,
    canPublishPosts: true,
    canDeleteDesigns: false,
    userType: 'employee',
    tempPasswordHint: 'lucasgmail',
    trialStartDate: Date.now(),
    trialEndsAt: Date.now() + 14 * 86400000,
    createdAt: new Date().toISOString(),
    allowedModules: ['dashboard', 'marketing', 'campanhas', 'social-hub', 'relatorios', 'chat', 'ponto'],
  },
  {
    uid: 'user-sabrina-suellen',
    name: 'Sabrina Suellen',
    email: 'suellensabrina36@gmail.com',
    avatarUrl: '',
    instagram: 'sabrina.sdr',
    bio: 'Closer & SDR Comercial • Prospecção ativa B2B e fechamento de novos clientes.',
    agencyName: 'Techify Agência',
    role: 'Closer / SDR de Prospecção',
    department: 'prospeccao',
    leadershipRole: 'lider_prospeccao',
    workStatus: 'online',
    plan: 'Gratuito / Equipe',
    status: 'active',
    designRole: 'funcionario',
    canEditDesigns: false,
    canCreateDesigns: true,
    canApproveDesigns: false,
    canPublishPosts: true,
    canDeleteDesigns: false,
    userType: 'employee',
    tempPasswordHint: '123456',
    trialStartDate: Date.now(),
    trialEndsAt: Date.now() + 14 * 86400000,
    createdAt: new Date().toISOString(),
    allowedModules: ['dashboard', 'prospection', 'maps-scraper', 'agenda', 'relatorios', 'chat', 'ponto'],
  },
  {
    uid: 'user-marcos-design',
    name: 'MARCOS HENRIQUE',
    email: 'aigerakabane81983521523@gmail.com',
    avatarUrl: '',
    instagram: 'marcos.design',
    bio: 'Líder Geral & Design • Gestão de projetos criativos e branding.',
    agencyName: 'Techify Agência',
    role: 'Líder Geral',
    department: 'design',
    leadershipRole: 'lider_design',
    workStatus: 'online',
    plan: 'Gratuito / Equipe',
    status: 'active',
    designRole: 'lider',
    canEditDesigns: true,
    canCreateDesigns: true,
    canApproveDesigns: true,
    canPublishPosts: true,
    canDeleteDesigns: false,
    userType: 'employee',
    tempPasswordHint: '12345678',
    trialStartDate: Date.now(),
    trialEndsAt: Date.now() + 14 * 86400000,
    createdAt: new Date().toISOString(),
    allowedModules: ['dashboard', 'designer', 'social-hub', 'marketing', 'prospection', 'kanban', 'agenda', 'kpis', 'fluxo-caixa', 'maps-scraper', 'relatorios', 'chat', 'ponto'],
  },
];

// Local + Firestore deleted user registry to guarantee permanent deletion ("nada fake")
const DELETED_USERS_STORAGE_KEY = 'agencyos_deleted_user_keys_v3';

export function getDeletedUserKeys(): Set<string> {
  const set = new Set<string>();
  try {
    const raw = localStorage.getItem(DELETED_USERS_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        arr.forEach((k) => {
          if (k) set.add(String(k).toLowerCase().trim());
        });
      }
    }
  } catch (e) {
    console.warn('Erro ao carregar lista de excluídos:', e);
  }
  return set;
}

export function saveDeletedUserKeys(keys: Set<string>) {
  try {
    localStorage.setItem(DELETED_USERS_STORAGE_KEY, JSON.stringify(Array.from(keys)));
  } catch (e) {
    console.warn('Erro ao salvar lista de excluídos:', e);
  }
}

export function removeTeamMemberFromMemory(uid?: string | null, email?: string | null) {
  const normEmail = (email || '').toLowerCase().trim();
  const idx = AGENCY_REGISTERED_TEAM_MEMBERS.findIndex(
    (m) => (uid && m.uid === uid) || (normEmail && (m.email || '').toLowerCase().trim() === normEmail)
  );
  if (idx !== -1) {
    AGENCY_REGISTERED_TEAM_MEMBERS.splice(idx, 1);
  }
}

let hasSeededTeamInDb = false;

// Ensure that all registered agency team members are written to Firestore as real documents
export async function ensureAgencyTeamInFirestore() {
  if (hasSeededTeamInDb) return;
  hasSeededTeamInDb = true;
  try {
    const usersRef = collection(db, 'users');
    const existingSnap = await getDocs(usersRef);
    const existingDocsByEmail = new Map<string, { id: string; avatarUrl?: string }>();
    const deletedKeys = getDeletedUserKeys();
    
    const batch = writeBatch(db);
    let writesCount = 0;

    existingSnap.forEach((d) => {
      const u = d.data();
      if (u && u.email) {
        const cleanAv = resolveUserAvatar(u);
        existingDocsByEmail.set(u.email.toLowerCase().trim(), {
          id: d.id,
          avatarUrl: cleanAv,
        });
      }
    });

    for (const member of AGENCY_REGISTERED_TEAM_MEMBERS) {
      const email = member.email.toLowerCase().trim();
      // Skip if deleted by administrator
      if (deletedKeys.has(email) || deletedKeys.has(member.uid.toLowerCase().trim())) {
        continue;
      }
      const existingDoc = existingDocsByEmail.get(email);
      if (!existingDoc) {
        const memberRef = doc(db, 'users', member.uid);
        batch.set(memberRef, sanitizeFirestorePayload(member), { merge: true });
        writesCount++;
      } else if (!existingDoc.avatarUrl && member.avatarUrl) {
        const memberRef = doc(db, 'users', existingDoc.id);
        batch.set(memberRef, { avatarUrl: member.avatarUrl, photoURL: member.avatarUrl, avatar: member.avatarUrl }, { merge: true });
        writesCount++;
      }
    }

    if (writesCount > 0) {
      await batch.commit();
      console.log(`✅ Sincronização de equipe no Firestore realizada (${writesCount} registros).`);
    }
  } catch (err) {
    console.warn('Sincronização de equipe no Firestore:', err);
  }
}

// Subscribe to ALL Users across the platform for Admin Panel and Chat
export function subscribeAllUsers(
  onData: (users: FirestoreUserProfile[]) => void,
  onError?: (err: any) => void
) {
  // Proactively ensure team is initialized in Firestore
  ensureAgencyTeamInFirestore().catch((e) => console.warn(e));

  const usersRef = collection(db, 'users');
  return onSnapshot(
    usersRef,
    (snapshot) => {
      const liveUsers: FirestoreUserProfile[] = [];
      const deletedKeys = getDeletedUserKeys();

      snapshot.forEach((docSnap) => {
        const rawData = docSnap.data() as any;
        const resolvedEmail = (rawData.email || rawData.userEmail || '').trim();
        const normEmail = resolvedEmail.toLowerCase();
        const docId = docSnap.id.toLowerCase();

        // Strictly filter out deleted accounts from database stream
        if (deletedKeys.has(docId) || (normEmail && deletedKeys.has(normEmail))) {
          return;
        }

        const avatar = resolveUserAvatar(rawData);
        const resolvedName =
          (rawData.name && rawData.name.trim()) ||
          (rawData.displayName && rawData.displayName.trim()) ||
          (rawData.fullName && rawData.fullName.trim()) ||
          (rawData.agencyName && rawData.agencyName.trim()) ||
          (resolvedEmail ? resolvedEmail.split('@')[0] : 'Colaborador');

        liveUsers.push({
          ...rawData,
          uid: docSnap.id,
          id: docSnap.id,
          avatarUrl: avatar,
          name: resolvedName,
          email: resolvedEmail,
          role: rawData.role || 'Membro da Equipe',
          department: rawData.department || 'gestao',
          agencyName: rawData.agencyName || 'Techify Agência',
          workStatus: rawData.workStatus || 'online',
          status: rawData.status || 'active',
        });
      });

      // Merge map: index by normalized email AND by document id (uid)
      const userMap = new Map<string, FirestoreUserProfile>();

      // 1. Add all Firestore documents directly (ensuring NO database record is lost)
      for (const u of liveUsers) {
        const idKey = (u.uid || (u as any).id || '').toLowerCase();
        const emailKey = u.email ? u.email.toLowerCase().trim() : '';
        if (deletedKeys.has(emailKey) || (idKey && deletedKeys.has(idKey))) {
          continue;
        }
        if (emailKey) {
          userMap.set(emailKey, u);
        } else if (idKey) {
          userMap.set(idKey, u);
        }
      }

      // 2. Add registered agency team defaults if not already present AND not deleted
      for (const def of AGENCY_REGISTERED_TEAM_MEMBERS) {
        if (!def) continue;
        const emailKey = (def.email || '').toLowerCase().trim();
        const idKey = (def.uid || '').toLowerCase().trim();
        if (deletedKeys.has(emailKey) || (idKey && deletedKeys.has(idKey))) {
          continue;
        }

        const existing = emailKey ? userMap.get(emailKey) : undefined;
        if (existing) {
          // Merge defaults with live database values, giving priority to live DB data
          const realAvatar = resolveUserAvatar(existing) || resolveUserAvatar(def);
          userMap.set(emailKey, {
            ...def,
            ...existing,
            avatarUrl: realAvatar,
            name: existing.name || def.name,
            email: existing.email || def.email,
            role: existing.role || def.role,
            department: existing.department || def.department,
            instagram: existing.instagram || def.instagram || '',
            bio: existing.bio || def.bio || '',
            workStatus: existing.workStatus || def.workStatus || 'online',
            customStatus: existing.customStatus || def.customStatus || '',
          });
        } else if (emailKey && liveUsers.length === 0) {
          userMap.set(emailKey, {
            ...def,
            avatarUrl: resolveUserAvatar(def),
          });
        }
      }

      const finalUsers = Array.from(userMap.values());
      onData(finalUsers);
    },
    (err) => {
      if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
        window.dispatchEvent(
          new CustomEvent('agencyos_firestore_permission_denied', { detail: { collectionName: 'users' } })
        );
        console.warn('[Firestore] Permissão pendente para coleção users no Firestore.');
      } else {
        console.warn('Aviso ao buscar todos os usuários do Firestore:', err?.message || err);
      }
      onData([]);
      if (onError) onError(err);
    }
  );
}

// Global Agency Chat Messages Subscription (Realtime, shared across entire team)
export function subscribeAgencyChatMessages(
  onData: (messages: ChatMessage[]) => void,
  onError?: (err: any) => void
) {
  const chatRef = collection(db, 'agencyChatMessages');
  return onSnapshot(
    chatRef,
    (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        messages.push({ id: docSnap.id, ...docSnap.data() } as ChatMessage);
      });
      // Sort chronologically
      messages.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
      onData(messages);
    },
    (err) => {
      if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
        window.dispatchEvent(
          new CustomEvent('agencyos_firestore_permission_denied', { detail: { collectionName: 'agencyChatMessages' } })
        );
        console.warn('[Firestore] Permissão pendente para mensagens do chat no Firestore.');
      } else {
        console.warn('Aviso ao subscrever mensagens do chat da agência:', err?.message || err);
      }
      if (onError) onError(err);
    }
  );
}

// Global Agency Chat Channels Subscription
export function subscribeAgencyChatChannels(
  onData: (channels: ChatChannel[]) => void,
  onError?: (err: any) => void
) {
  const chanRef = collection(db, 'agencyChatChannels');
  return onSnapshot(
    chanRef,
    (snapshot) => {
      const channels: ChatChannel[] = [];
      snapshot.forEach((docSnap) => {
        channels.push({ id: docSnap.id, ...docSnap.data() } as ChatChannel);
      });
      onData(channels);
    },
    (err) => {
      if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
        window.dispatchEvent(
          new CustomEvent('agencyos_firestore_permission_denied', { detail: { collectionName: 'agencyChatChannels' } })
        );
        console.warn('[Firestore] Permissão pendente para canais do chat no Firestore.');
      } else {
        console.warn('Aviso ao subscrever canais do chat da agência:', err?.message || err);
      }
      if (onError) onError(err);
    }
  );
}

// Send Chat Message to Global Firestore Collection
export async function sendAgencyChatMessage(message: ChatMessage) {
  const msgRef = doc(db, 'agencyChatMessages', message.id);
  const cleanData = sanitizeFirestorePayload(message);
  await setDoc(msgRef, cleanData, { merge: true });
}

// Soft Delete Chat Message in Global Firestore
export async function deleteAgencyChatMessage(msgId: string) {
  const msgRef = doc(db, 'agencyChatMessages', msgId);
  await setDoc(msgRef, { isDeleted: true, text: 'Mensagem apagada' }, { merge: true });
}

// Create or Update Global Chat Channel in Firestore
export async function createAgencyChatChannel(channel: ChatChannel) {
  const chanRef = doc(db, 'agencyChatChannels', channel.id);
  const cleanData = sanitizeFirestorePayload(channel);
  await setDoc(chanRef, cleanData, { merge: true });
}

// Mark channel messages as read
export async function markAgencyChatChannelAsRead(channelId: string, userEmail: string, userName: string) {
  if (!channelId || !userEmail) return;
  try {
    const chatRef = collection(db, 'agencyChatMessages');
    const q = query(chatRef, where('channelId', '==', channelId));
    const snap = await getDocs(q);
    const nowIso = new Date().toISOString();
    const batch = writeBatch(db);
    let count = 0;

    snap.forEach((d) => {
      const data = d.data() as ChatMessage;
      if (!data.readBy || !data.readBy[userEmail]) {
        const docRef = doc(db, 'agencyChatMessages', d.id);
        batch.set(
          docRef,
          {
            readBy: {
              ...(data.readBy || {}),
              [userEmail]: { readAt: nowIso, userName },
            },
          },
          { merge: true }
        );
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
    }
  } catch (err) {
    console.warn('Erro ao marcar mensagens como lidas:', err);
  }
}

// Helper to resolve the primary Agency Owner UID for employees
export async function resolvePrimaryAgencyOwnerUid(): Promise<string | null> {
  try {
    const usersRef = collection(db, 'users');
    
    // First, search for the primary agency owner by email (supporting both @gmail and @gamail)
    const qOwner = query(usersRef, where('email', 'in', ['rickmarketing81@gmail.com', 'rickmarketing81@gamail.com']));
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
    console.warn('Aviso ao resolver UID do proprietário da agência:', err);
  }
  return null;
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
  extraData?: Partial<FirestoreUserProfile>,
  userEmail?: string
) {
  const normEmail = (userEmail || extraData?.email || '').toLowerCase().trim();
  const cleanUid = (uid || '').trim();
  const payload: Record<string, any> = { allowedModules, ...extraData };
  const sanitized = sanitizeFirestorePayload(payload);

  // 1. Update in-memory defaults
  if (normEmail || cleanUid) {
    const memIdx = AGENCY_REGISTERED_TEAM_MEMBERS.findIndex(
      (m) => (cleanUid && m.uid === cleanUid) || (normEmail && (m.email || '').toLowerCase().trim() === normEmail)
    );
    if (memIdx !== -1) {
      AGENCY_REGISTERED_TEAM_MEMBERS[memIdx] = {
        ...AGENCY_REGISTERED_TEAM_MEMBERS[memIdx],
        ...sanitized,
        allowedModules,
      };
    }
  }

  // 2. Update by UID in Firestore
  if (cleanUid) {
    try {
      const userRef = doc(db, 'users', cleanUid);
      await setDoc(userRef, sanitized, { merge: true });
    } catch (e) {
      console.warn('Erro ao atualizar permissões por UID no Firestore:', e);
    }
  }

  // 3. Update all docs by email in Firestore
  if (normEmail) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', normEmail));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      let count = 0;
      snap.forEach((d) => {
        if (d.id !== cleanUid) {
          batch.set(d.ref, sanitized, { merge: true });
          count++;
        }
      });
      if (count > 0) {
        await batch.commit();
      }
    } catch (e) {
      console.warn('Erro ao atualizar permissões por email no Firestore:', e);
    }
  }

  // 4. Update stored session if active user
  const stored = getStoredSession();
  if (
    stored &&
    ((cleanUid && stored.uid === cleanUid) || (normEmail && (stored.email || '').toLowerCase().trim() === normEmail))
  ) {
    window.dispatchEvent(new Event('agencyos_session_changed'));
  }
}

// Delete user profile document from Firestore permanently ("nada fake")
export async function deleteUserFromFirestore(uid: string, email?: string) {
  const normEmail = (email || '').toLowerCase().trim();
  const cleanUid = (uid || '').trim();

  // 1. Register in memory and localStorage blacklist
  const keys = getDeletedUserKeys();
  if (cleanUid) keys.add(cleanUid.toLowerCase());
  if (normEmail) keys.add(normEmail);
  saveDeletedUserKeys(keys);

  // 2. Remove from in-memory team defaults
  removeTeamMemberFromMemory(cleanUid, normEmail);

  // 3. Delete from Firestore by UID
  if (cleanUid) {
    try {
      const userRef = doc(db, 'users', cleanUid);
      await deleteDoc(userRef);
    } catch (e) {
      console.warn('Aviso ao deletar doc de usuário por UID:', e);
    }
  }

  // 4. Delete all matching documents by email in Firestore
  if (normEmail) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', normEmail));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      let count = 0;
      snap.forEach((d) => {
        batch.delete(d.ref);
        count++;
      });
      if (count > 0) {
        await batch.commit();
      }
    } catch (e) {
      console.warn('Aviso ao deletar docs de usuário por email:', e);
    }
  }

  // 5. Persist in Firestore deletedUsers collection for multi-device sync
  try {
    const blacklistRef = doc(db, 'deletedUsers', cleanUid || normEmail.replace(/[^a-zA-Z0-9]/g, '_'));
    await setDoc(blacklistRef, {
      uid: cleanUid || null,
      email: normEmail || null,
      deletedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (e) {
    console.warn('Aviso ao registrar exclusão na coleção deletedUsers:', e);
  }

  // 6. Clear session if deleted user was logged in
  const stored = getStoredSession();
  if (
    stored &&
    ((cleanUid && stored.uid === cleanUid) || (normEmail && (stored.email || '').toLowerCase().trim() === normEmail))
  ) {
    setStoredSession(null);
  }
}

// Update existing user profile in Firestore
export async function updateUserInFirestore(uid: string, data: Partial<FirestoreUserProfile>) {
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  const sanitizedData: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      sanitizedData[key] = val;
    }
  }
  await setDoc(userRef, sanitizedData, { merge: true });
}

// Comprehensive profile updater: syncs Firestore by UID, by Email, in static list, and local session
export async function updateUserProfileInFirestore(
  targetUid: string | undefined | null,
  targetEmail: string | undefined | null,
  data: Partial<FirestoreUserProfile>
) {
  const mergedData = { ...data };
  if (mergedData.avatarUrl !== undefined) {
    (mergedData as any).photoURL = mergedData.avatarUrl;
    (mergedData as any).avatar = mergedData.avatarUrl;
  }
  const sanitizedData = sanitizeFirestorePayload(mergedData);
  const normalizedEmail = (targetEmail || data.email || '').toLowerCase().trim();

  // 1. Update in memory default team members array
  if (normalizedEmail || targetUid) {
    const memIdx = AGENCY_REGISTERED_TEAM_MEMBERS.findIndex(
      (m) => (targetUid && m.uid === targetUid) || (normalizedEmail && (m.email || '').toLowerCase().trim() === normalizedEmail)
    );
    if (memIdx !== -1) {
      AGENCY_REGISTERED_TEAM_MEMBERS[memIdx] = {
        ...AGENCY_REGISTERED_TEAM_MEMBERS[memIdx],
        ...mergedData,
      };
    }
  }

  // 2. Update by UID in Firestore
  if (targetUid) {
    const userRef = doc(db, 'users', targetUid);
    await setDoc(userRef, sanitizedData, { merge: true });
  }

  // 3. Update any documents matching email in Firestore
  if (normalizedEmail) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', normalizedEmail));
      const querySnap = await getDocs(q);
      const batch = writeBatch(db);
      let batchCount = 0;

      querySnap.forEach((docSnap) => {
        if (docSnap.id !== targetUid) {
          batch.set(docSnap.ref, sanitizedData, { merge: true });
          batchCount++;
        }
      });

      if (batchCount > 0) {
        await batch.commit();
      } else if (!targetUid) {
        // Create new document for this email
        const newUserRef = doc(collection(db, 'users'));
        await setDoc(newUserRef, { ...sanitizedData, email: normalizedEmail }, { merge: true });
      }
    } catch (err) {
      console.warn('Erro ao atualizar documentos de usuário por e-mail:', err);
    }
  }

  // 4. Update stored session if active
  const stored = getStoredSession();
  if (
    stored &&
    (stored.uid === targetUid || (stored.email && stored.email.toLowerCase().trim() === normalizedEmail))
  ) {
    setStoredSession({
      ...stored,
      name: mergedData.name || stored.name,
      email: normalizedEmail || stored.email,
    });
  }
}

// Auth Session Management (Supporting both Firebase Auth & Firestore Admin-Created Users)
export interface ActiveSession {
  uid: string;
  email: string;
  name?: string;
  agencyOwnerUid?: string;
}

const SESSION_KEY = 'agencyos_auth_session';

export function getStoredSession(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.uid === 'logged-out') return null;
      return parsed;
    }
  } catch (e) {
    console.warn('Aviso ao ler sessão salva:', e);
  }
  return {
    uid: 'user-rick-marcos',
    email: 'rickmarketing81@gmail.com',
    name: 'Marcos Henrique',
  };
}

export function setStoredSession(session: ActiveSession | null) {
  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ uid: 'logged-out', email: '' }));
    }
  } catch (e) {
    console.warn('Aviso ao salvar sessão:', e);
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
      // Master Admin Instant Bypass: Never lock out the platform owner
      if (
        cleanEmail === 'rickmarketing81@gmail.com' ||
        cleanEmail === 'agencyosoficial@gmail.com' ||
        cleanEmail === 'rickmarketing81@gamail.com' ||
        cleanEmail.includes('rickmarketing81')
      ) {
        const masterProfile: FirestoreUserProfile = {
          uid: 'user-rick-marcos',
          name: 'Marcos Henrique',
          email: cleanEmail,
          agencyName: 'Techify Agência',
          plan: 'Agency',
          status: 'active',
          role: 'CEO & Administrador Master',
          userType: 'employee',
          department: 'gestao',
          trialStartDate: Date.now(),
          trialEndsAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
          createdAt: new Date().toISOString(),
          allowedModules: [
            'dashboard',
            'profile',
            'lideranca',
            'ponto',
            'kpis',
            'fluxo-caixa',
            'campanhas',
            'social-hub',
            'designer',
            'kanban',
            'prospection',
            'relatorios',
            'agenda',
            'calculadora-roi',
            'ia-consultora',
            'admin',
            'leadspay-master',
            'leadspay-companies',
          ],
        };
        setStoredSession({
          uid: masterProfile.uid,
          email: masterProfile.email,
          name: masterProfile.name,
        });
        try {
          await setDoc(doc(db, 'users', masterProfile.uid), masterProfile, { merge: true });
        } catch (e) {
          console.warn('Persist master profile:', e);
        }
        return masterProfile;
      }

      // Check registered team defaults if not deleted
      const deletedKeys = getDeletedUserKeys();
      const foundInMem = AGENCY_REGISTERED_TEAM_MEMBERS.find(
        (m) =>
          (m.email || '').toLowerCase().trim() === cleanEmail &&
          !deletedKeys.has(m.uid.toLowerCase()) &&
          !deletedKeys.has(cleanEmail)
      );
      if (foundInMem) {
        return handleValidateFirestoreProfile(foundInMem, cleanPassword);
      }

      throw new Error(
        'Acesso não autorizado: O e-mail informado não está cadastrado no sistema. Apenas usuários cadastrados previamente pelo administrador podem acessar o painel.'
      );
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

// Scopes for Google Calendar & Workspace integration
export const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
];

// In-memory token cache (Do NOT store in localStorage or sessionStorage)
let cachedGoogleAccessToken: string | null = null;
let isSigningInWithGoogle = false;

export const getCachedGoogleAccessToken = (): string | null => {
  return cachedGoogleAccessToken;
};

export const setCachedGoogleAccessToken = (token: string | null) => {
  cachedGoogleAccessToken = token;
};

// Check if an email is officially registered in the agency system (and not deleted)
export async function checkIfEmailIsRegisteredInSystem(email: string): Promise<FirestoreUserProfile | null> {
  const normEmail = (email || '').toLowerCase().trim();
  if (!normEmail) return null;

  const deletedKeys = getDeletedUserKeys();
  if (deletedKeys.has(normEmail)) return null;

  // Master admin is always authorized
  if (
    normEmail === 'rickmarketing81@gmail.com' ||
    normEmail === 'agencyosoficial@gmail.com' ||
    normEmail.includes('rickmarketing81')
  ) {
    const nowIso = new Date().toISOString();
    return {
      uid: 'user-rick-marcos',
      name: 'Marcos Henrique',
      email: normEmail,
      role: 'CEO & Administrador Master',
      agencyName: 'Techify Agência',
      plan: 'Agency',
      status: 'active',
      userType: 'employee',
      department: 'gestao',
      trialStartDate: Date.now(),
      trialEndsAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
      createdAt: nowIso,
      allowedModules: [
        'dashboard',
        'profile',
        'lideranca',
        'ponto',
        'kpis',
        'fluxo-caixa',
        'campanhas',
        'social-hub',
        'designer',
        'kanban',
        'prospection',
        'relatorios',
        'agenda',
        'calculadora-roi',
        'ia-consultora',
        'admin',
        'leadspay-master',
        'leadspay-companies',
      ],
    };
  }

  // 1. Query Firestore 'users' collection
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', normEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      for (const d of snap.docs) {
        if (!deletedKeys.has(d.id.toLowerCase())) {
          return { uid: d.id, ...d.data() } as FirestoreUserProfile;
        }
      }
    }

    const allSnap = await getDocs(usersRef);
    for (const d of allSnap.docs) {
      const data = d.data();
      if ((data.email || '').toLowerCase().trim() === normEmail) {
        if (!deletedKeys.has(d.id.toLowerCase())) {
          return { uid: d.id, ...data } as FirestoreUserProfile;
        }
      }
    }
  } catch (e) {
    console.warn('Erro ao consultar Firestore por email:', e);
  }

  // 2. Check registered agency team members
  const foundMem = AGENCY_REGISTERED_TEAM_MEMBERS.find(
    (m) =>
      (m.email || '').toLowerCase().trim() === normEmail &&
      !deletedKeys.has(m.uid.toLowerCase()) &&
      !deletedKeys.has(normEmail)
  );
  if (foundMem) {
    return foundMem;
  }

  return null;
}

// Login or Create Company Account with Google Email (database-backed)
export async function loginOrCreateAccountWithGoogleEmail(
  googleEmail: string,
  displayName?: string,
  photoUrl?: string
): Promise<FirestoreUserProfile> {
  const cleanEmail = (googleEmail || '').toLowerCase().trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Informe um e-mail Google válido.');
  }

  const deletedKeys = getDeletedUserKeys();
  if (deletedKeys.has(cleanEmail)) {
    throw new Error('Esta conta foi excluída pelo administrador.');
  }

  // 1. Check if email already has an account in Firestore or static team
  const existingProfile = await checkIfEmailIsRegisteredInSystem(cleanEmail);
  if (existingProfile) {
    if (existingProfile.status === 'blocked') {
      throw new Error('Sua conta foi suspensa pelo administrador.');
    }

    let targetOwnerUid = existingProfile.agencyOwnerUid;
    const isMasterUser =
      cleanEmail === 'rickmarketing81@gmail.com' ||
      cleanEmail === 'agencyosoficial@gmail.com' ||
      cleanEmail.includes('rickmarketing81');
    if (!targetOwnerUid && !isMasterUser) {
      targetOwnerUid = (await resolvePrimaryAgencyOwnerUid()) || 'user-rick-marcos';
      existingProfile.agencyOwnerUid = targetOwnerUid;
    }

    const fullProfile: FirestoreUserProfile = {
      ...existingProfile,
      uid: existingProfile.uid || `user-${Date.now()}`,
      agencyOwnerUid: targetOwnerUid,
      avatarUrl: photoUrl || existingProfile.avatarUrl || '',
    };

    setStoredSession({
      uid: fullProfile.uid,
      email: fullProfile.email,
      name: fullProfile.name,
      agencyOwnerUid: targetOwnerUid,
    });

    return fullProfile;
  }

  // 2. New Company Signup via Google ("as empresas conseguem criar a conta so pelo google")
  const targetUid = `user-google-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const now = Date.now();
  const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;
  const companyName = displayName ? `Empresa ${displayName}` : `Empresa ${cleanEmail.split('@')[0]}`;

  const newCompanyProfile: FirestoreUserProfile = {
    uid: targetUid,
    name: displayName || cleanEmail.split('@')[0],
    email: cleanEmail,
    avatarUrl: photoUrl || '',
    photoURL: photoUrl || '',
    agencyName: companyName,
    role: 'Cliente AgencyOS',
    userType: 'client',
    plan: 'Pro',
    status: 'active',
    designRole: 'cliente',
    canEditDesigns: true,
    canCreateDesigns: true,
    canApproveDesigns: true,
    canPublishPosts: false,
    trialStartDate: now,
    trialEndsAt: now + FOURTEEN_DAYS,
    createdAt: new Date().toISOString(),
    allowedModules: [
      'dashboard',
      'designer',
      'social-hub',
      'kanban',
      'agenda',
      'relatorios',
      'calculadora-roi',
      'ia-consultora',
    ],
  };

  // Save in Firestore 'users' collection
  try {
    const userRef = doc(db, 'users', targetUid);
    await setDoc(userRef, sanitizeFirestorePayload(newCompanyProfile), { merge: true });
    await seedInitialUserData(targetUid);
  } catch (err) {
    console.warn('Erro ao criar conta de empresa no Firestore:', err);
  }

  setStoredSession({
    uid: newCompanyProfile.uid,
    email: newCompanyProfile.email,
    name: newCompanyProfile.name,
  });

  return newCompanyProfile;
}

// Backward-compatibility wrapper
export const loginWithRegisteredGoogleEmail = loginOrCreateAccountWithGoogleEmail;

export async function loginWithGoogle(requestCalendarScope: boolean = true) {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  if (requestCalendarScope) {
    GOOGLE_CALENDAR_SCOPES.forEach((scope) => provider.addScope(scope));
  }
  isSigningInWithGoogle = true;
  try {
    const res = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(res);
    if (credential?.accessToken) {
      cachedGoogleAccessToken = credential.accessToken;
    }

    const profile = await getOrCreateUserProfile(res.user);
    setStoredSession({
      uid: profile.uid,
      email: profile.email,
      name: profile.name,
      agencyOwnerUid: profile.agencyOwnerUid,
    });
    return { res, accessToken: cachedGoogleAccessToken, profile };
  } finally {
    isSigningInWithGoogle = false;
  }
}

export async function connectGoogleCalendar(): Promise<string | null> {
  const provider = new GoogleAuthProvider();
  GOOGLE_CALENDAR_SCOPES.forEach((scope) => provider.addScope(scope));
  isSigningInWithGoogle = true;
  try {
    const res = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(res);
    if (credential?.accessToken) {
      cachedGoogleAccessToken = credential.accessToken;
      return credential.accessToken;
    }
    return null;
  } finally {
    isSigningInWithGoogle = false;
  }
}

export async function logoutUser() {
  setStoredSession(null);
  cachedGoogleAccessToken = null;
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Erro ao deslogar do Firebase Auth:', e);
  }
}

// Real-time hooks exports
export { useChatUsers } from '../hooks/useChatUsers';
export { usePresence } from '../hooks/usePresence';
export { useMessages } from '../hooks/useMessages';


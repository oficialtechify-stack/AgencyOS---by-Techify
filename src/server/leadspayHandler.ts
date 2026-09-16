import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  increment,
} from 'firebase/firestore';

// Read config from environment or fallback to project config
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'liquid-dub-x8gvj',
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyDAKqJapgr6Nxt758eO0L6_xfphfkIuK2Y',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'liquid-dub-x8gvj.firebaseapp.com',
};

const serverApp = getApps().length === 0 ? initializeApp(firebaseConfig, 'leadspay-server') : getApps()[0];
const serverDb = getFirestore(serverApp);

export interface LeadsPayEventPayload {
  event: string;
  agency_id?: string;
  data?: Record<string, any>;
  timestamp?: string;
}

/**
 * Processes a LeadsPay webhook event and persists to Firestore
 */
export async function handleLeadsPayWebhookEvent(payload: LeadsPayEventPayload) {
  const { event, agency_id, data = {}, timestamp } = payload;
  const isoTimestamp = timestamp || new Date().toISOString();

  // 1. Atualizar Coleção Exclusiva Master (Apenas para o seu usuário Super Admin)
  const masterDocRef = doc(serverDb, 'leadspay_master_metrics', 'global_stats');
  await setDoc(
    masterDocRef,
    {
      last_updated: isoTimestamp,
      [event === 'company.activated' ? 'total_companies' : 'total_events']: increment(1),
    },
    { merge: true }
  );

  // 2. Registra o log individual de eventos do LeadsPay
  const eventsCol = collection(serverDb, 'leadspay_events');
  const eventDocRef = await addDoc(eventsCol, {
    event,
    agency_id: agency_id || 'master_leadspay_admin',
    data: data || {},
    created_at: new Date(),
    received_at: isoTimestamp,
  });

  // 3. Se o evento pertencer a uma agência/empresa específica, atualiza o dashboard dela
  if (agency_id && agency_id !== 'master_leadspay_admin') {
    // agencies/{agency_id}/transactions
    const agencyTxCol = collection(serverDb, 'agencies', agency_id, 'transactions');
    await addDoc(agencyTxCol, {
      ...data,
      event_type: event,
      created_at: new Date(),
    });

    // Mirror to users/{agency_id}/transactions if agency_id is a registered user/workspace
    try {
      const userTxCol = collection(serverDb, 'users', agency_id, 'transactions');
      await addDoc(userTxCol, {
        id: `lp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        client: data?.customer_name || data?.payer_name || data?.company_name || 'Assinante LeadsPay',
        amount: Number(data?.amount || data?.value || data?.total || 0),
        type: data?.type === 'refund' || data?.type === 'chargeback' ? 'Despesa' : 'Receita',
        category: data?.plan_name || data?.product || 'LeadsPay Recorrente',
        date: new Date().toISOString().split('T')[0],
        status: 'Recebido',
        description: `Transação LeadsPay: ${event}`,
        event_type: event,
        created_at: new Date().toISOString(),
      });
    } catch (mirrorErr) {
      console.warn('Aviso ao espelhar transação em users/transactions:', mirrorErr);
    }
  }

  return { success: true, eventId: eventDocRef.id };
}

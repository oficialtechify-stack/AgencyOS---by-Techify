import type { Express, Request, Response } from 'express';
import { randomBytes } from 'node:crypto';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

type AdminCtx = { uid: string; platformAdmin: boolean; ownerUid: string; email: string };
class AdminError extends Error { constructor(public status: number, message: string) { super(message); } }
const MODULES = new Set([
  'dashboard','prospection','maps-scraper','agenda','kanban','lideranca','ponto',
  'campanhas','marketing','social-hub','designer','fluxo-caixa','kpis',
  'relatorios','calculadora-roi','ia-consultora','estoque','profile',
]);
const DEFAULT_EMPLOYEE_MODULES = ['dashboard', 'kanban', 'agenda', 'ponto'];
function adminServices() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new AdminError(503, 'Firebase Admin não configurado na Vercel.');
  const app = getApps().find(a => a.name === 'agencyos-admin') ||
    initializeApp({ credential: cert(JSON.parse(raw)), projectId: 'agencyos-1c3fc' }, 'agencyos-admin');
  return { db: getFirestore(app), auth: getAuth(app) };
}
function textField(value: any, max: number) { return typeof value === 'string' ? value.trim().slice(0, max) : ''; }
function errorOut(res: Response, error: unknown) {
  if (error instanceof SyntaxError && process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.error('Admin API: invalid Firebase Admin service account JSON');
    return res.status(503).json({
      error: 'FIREBASE_SERVICE_ACCOUNT_JSON não contém um JSON válido. Confira o arquivo cadastrado na Vercel.',
    });
  }
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code: unknown }).code) : '';
  if (code === 'auth/invalid-credential' || code === 'app/invalid-credential') {
    return res.status(503).json({ error: 'Credencial administrativa do Firebase inválida. Confira o projeto e a chave de serviço.' });
  }
  if (error instanceof AdminError) return res.status(error.status).json({ error: error.message });
  console.error('Admin API:', error instanceof Error ? error.message : 'unexpected');
  return res.status(500).json({ error: 'Não foi possível concluir a operação administrativa.' });
}
async function authorize(req: Request): Promise<AdminCtx> {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw new AdminError(401, 'Faça login para continuar.');
  const { db, auth } = adminServices();
  const decoded = await auth.verifyIdToken(header.slice(7), true);
  const profile = await db.doc('users/' + decoded.uid).get();
  if (!profile.exists || profile.data()?.status === 'blocked' || profile.data()?.status === 'cancelled')
    throw new AdminError(403, 'Sua conta não está autorizada.');
  const data = profile.data() || {};
  const platformAdmin = decoded.platform_admin === true;
  // Platform admin must be granted through a Firebase custom claim,
  // never a profile field, hardcoded email or a client-submitted role.
  const isOwner = data.userType !== 'employee' && (!data.agencyOwnerUid || data.agencyOwnerUid === decoded.uid);
  if (!platformAdmin && !isOwner) throw new AdminError(403, 'Somente o responsável pela empresa pode gerenciar acessos.');
  return { uid: decoded.uid, platformAdmin, ownerUid: decoded.uid, email: decoded.email || '' };
}
function modulesFrom(input: unknown): string[] {
  if (!Array.isArray(input)) throw new AdminError(400, 'Selecione os módulos autorizados.');
  const values = [...new Set(input.map(x => String(x)))];
  if (!values.length || values.length > MODULES.size || values.some(x => !MODULES.has(x)))
    throw new AdminError(400, 'A lista de permissões contém módulos inválidos.');
  // Manager privileges never come from module selections.
  return values;
}
function safeProfile(doc: any, authUser?: any) {
  const d = doc.data() || {};
  return {
    uid: doc.id, name: d.name || '', email: d.email || '',
    agencyName: d.agencyName || '', userType: d.userType || null,
    agencyOwnerUid: d.agencyOwnerUid || null, role: d.role || '',
    leadershipRole: d.leadershipRole || 'membro', allowedModules: d.allowedModules || [],
    status: authUser?.disabled ? 'blocked' : d.status || 'active',
    invitationStatus: d.invitationStatus || '',
    hasSignedIn: Boolean(authUser?.metadata?.lastSignInTime),
    createdAt: d.createdAt || '',
    plan: d.plan || null,
    subscriptionStatus: d.subscription?.status || null,
    avatarUrl: d.avatarUrl || d.photoURL || '',
    isAuthAccount: Boolean(authUser),
  };
}
async function audit(actor: AdminCtx, action: string, subject: string, details: object = {}) {
  await adminServices().db.collection('adminAuditLog').add({
    actorUid: actor.uid, action, targetUid: subject,
    ownerUid: actor.ownerUid, details, createdAt: FieldValue.serverTimestamp(),
  });
}
async function getTarget(actor: AdminCtx, uid: string) {
  if (!/^[\w-]{1,128}$/.test(uid)) throw new AdminError(400, 'Identificador inválido.');
  const target = await adminServices().db.doc('users/' + uid).get();
  if (!target.exists) throw new AdminError(404, 'Conta não encontrada.');
  const data = target.data() || {};
  if (uid === actor.uid) throw new AdminError(403, 'Você não pode alterar seus próprios privilégios por esta tela.');
  if (!actor.platformAdmin && !(data.userType === 'employee' && data.agencyOwnerUid === actor.ownerUid))
    throw new AdminError(403, 'Esta pessoa não pertence à sua empresa.');
  return { ref: target.ref, data };
}
export function registerAdminManageRoutes(app: Express) {
  app.get('/api/admin/members', async (req, res) => {
    try {
      const actor = await authorize(req), { db, auth } = adminServices();
      const snap = actor.platformAdmin
        ? await db.collection('users').limit(150).get()
        : await db.collection('users').where('agencyOwnerUid', '==', actor.ownerUid).limit(150).get();
      const profiles = snap.docs.filter(d => actor.platformAdmin ||
        (d.data().userType === 'employee' && d.data().agencyOwnerUid === actor.ownerUid));
      // Firebase Admin batch lookup avoids one authentication request per row.
      const identified = new Map<string, any>();
      for (let offset = 0; offset < profiles.length; offset += 100) {
        const batch = profiles.slice(offset, offset + 100);
        const found = await auth.getUsers(batch.map(d => ({ uid: d.id })));
        for (const user of found.users) identified.set(user.uid, user);
      }
      const result = profiles.map(d => safeProfile(d, identified.get(d.id)));
      const [employee, client] = [result.filter(p => p.userType === 'employee'),
        actor.platformAdmin ? result.filter(p => p.userType !== 'employee') : []];
      res.json({ users: result, employees: employee.length, clients: client.length,
        platformAdmin: actor.platformAdmin, limited: snap.size >= 150,
        billingConnected: false });
    } catch (e) { errorOut(res, e); }
  });

  app.post('/api/admin/invite', async (req, res) => {
    try {
      const actor = await authorize(req);
      const { auth, db } = adminServices();
      const kind = req.body?.kind === 'client' ? 'client' : 'employee';
      if (kind === 'client' && !actor.platformAdmin)
        throw new AdminError(403, 'Somente o administrador global pode cadastrar clientes do SaaS.');
      const email = textField(req.body?.email, 254).toLowerCase();
      const name = textField(req.body?.name, 90);
      const role = textField(req.body?.role, 70) || (kind === 'employee' ? 'Colaborador' : 'Cliente AgencyOS');
      const agencyName = textField(req.body?.agencyName, 120);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name)
        throw new AdminError(400, 'Informe nome e e-mail válidos.');
      if (kind === 'client' && !agencyName) throw new AdminError(400, 'Informe o nome da empresa cliente.');
      const modules = kind === 'employee'
        ? modulesFrom(req.body?.allowedModules || DEFAULT_EMPLOYEE_MODULES)
        : ['dashboard', 'profile'];
      const existingDoc = await db.collection('users').where('email', '==', email).limit(1).get();
      if (!existingDoc.empty) throw new AdminError(409, 'Já existe um perfil com este e-mail. Revise o cadastro antes de enviar um convite.');
      try {
        await auth.getUserByEmail(email);
        throw new AdminError(409, 'Este e-mail já possui uma conta. Revise os cadastros existentes antes de convidar.');
      } catch (e: any) {
        if (e instanceof AdminError) throw e;
        if (e?.code !== 'auth/user-not-found') throw e;
      }
      const temporaryPassword = randomBytes(36).toString('base64url') + '!Aa2';
      const user = await auth.createUser({ email, displayName: name, password: temporaryPassword, emailVerified: false });
      const now = new Date().toISOString();
      try {
        await db.doc('users/' + user.uid).set({
          uid: user.uid, email, name, agencyName: kind === 'employee' ?
            (await db.doc('users/' + actor.ownerUid).get()).data()?.agencyName || 'Minha agência' : agencyName,
          role, leadershipRole: 'membro', userType: kind, status: 'active',
          agencyOwnerUid: kind === 'employee' ? actor.ownerUid : user.uid,
          allowedModules: modules, plan: kind === 'employee' ? 'Gratuito / Equipe' : 'Trial Gratuito',
          trialStartDate: 0, trialEndsAt: 0, invitationStatus: 'pending',
          createdAt: now, designRole: kind === 'employee' ? 'funcionario' : 'cliente',
          canApproveDesigns: false, canPublishPosts: false, canDeleteDesigns: false,
        });
        const invitationUrl = await auth.generatePasswordResetLink(email, {
          url: process.env.AGENCYOS_PUBLIC_ORIGIN || 'https://agency-os-by-techify.vercel.app',
          handleCodeInApp: false,
        });
        await audit(actor, 'user.invited', user.uid, { kind });
        res.status(201).json({ success: true, uid: user.uid, invitationUrl,
          message: 'Conta criada. Envie o link de definição de senha ao destinatário por um canal seguro.' });
      } catch (e) {
        // Do not strand an unlinked Firebase Auth account on failure.
        await auth.deleteUser(user.uid).catch(() => {});
        await db.doc('users/' + user.uid).delete().catch(() => {});
        throw e;
      }
    } catch (e) { errorOut(res, e); }
  });

  app.patch('/api/admin/members/:uid', async (req, res) => {
    try {
      const actor = await authorize(req), target = await getTarget(actor, req.params.uid);
      const body = req.body || {}, patch: Record<string, any> = {};
      if ('name' in body) {
        const name = textField(body.name, 90);
        if (!name) throw new AdminError(400, 'Nome não pode ficar vazio.');
        patch.name = name;
      }
      if ('role' in body) {
        if (target.data.userType !== 'employee') throw new AdminError(403, 'Cargos internos só podem ser alterados para funcionários.');
        patch.role = textField(body.role, 70) || 'Colaborador';
      }
      if ('allowedModules' in body) {
        if (target.data.userType !== 'employee') throw new AdminError(403, 'Módulos de clientes dependem do plano contratado.');
        patch.allowedModules = modulesFrom(body.allowedModules);
      }
      if ('status' in body) {
        if (!['active', 'blocked'].includes(body.status))
          throw new AdminError(400, 'Status inválido.');
        patch.status = body.status;
      }
      if (!Object.keys(patch).length) throw new AdminError(400, 'Nenhuma alteração válida.');
      const { auth } = adminServices();
      if (patch.status) await auth.updateUser(req.params.uid, { disabled: patch.status === 'blocked' });
      await target.ref.update({ ...patch, updatedAt: FieldValue.serverTimestamp() });
      await audit(actor, 'user.updated', req.params.uid, { fields: Object.keys(patch) });
      res.json({ success: true });
    } catch (e) { errorOut(res, e); }
  });

  app.get('/api/admin/audit', async (req, res) => {
    try {
      const actor = await authorize(req);
      const snap = actor.platformAdmin
        ? await adminServices().db.collection('adminAuditLog').orderBy('createdAt', 'desc').limit(60).get()
        : await adminServices().db.collection('adminAuditLog').where('ownerUid', '==', actor.ownerUid).limit(60).get();
      const entries = snap.docs.map(d => ({ id: d.id, ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toISOString?.() || '' }));
      entries.sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)));
      res.json({ entries });
    } catch (e) { errorOut(res, e); }
  });
}

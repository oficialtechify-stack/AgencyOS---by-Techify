import type { Express, Request, Response } from 'express';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { EMPLOYEE_MODULE_SET, DEFAULT_EMPLOYEE_MODULES } from '../shared/agencyModules.js';
import { canRemoveLegacyEmployee } from './legacyAccountDeletion.js';
import { createHostedPasswordLink } from './invitationLink.js';

type AdminCtx = {
  uid: string; platformAdmin: boolean; ownerUid: string; email: string;
  emailVerified: boolean; linkedOwnerUid: string | null;
  legacyOwnerProfile: boolean;
  conflictingOwnerLink: boolean;
};
class AdminError extends Error { constructor(public status: number, message: string) { super(message); } }
function adminServices() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new AdminError(503, 'Firebase Admin não configurado na Vercel.');
  const app = getApps().find(a => a.name === 'agencyos-admin') ||
    initializeApp({ credential: cert(JSON.parse(raw)), projectId: 'agencyos-1c3fc' }, 'agencyos-admin');
  return { db: getFirestore(app), auth: getAuth(app) };
}
// Protect legacy ownership mappings against document forgery even if deployed
// Firestore rules accidentally allow client writes. Signing key is server-only.
function signLegacyClaim(oldUid: string, claimantUid: string, email: string) {
  const credential = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
  if (!credential.private_key) throw new AdminError(503, 'Chave Firebase Admin indisponível.');
  return createHmac('sha256', credential.private_key)
    .update(['agencyos-legacy-workspace-v1', oldUid, claimantUid, email].join('\u0000'))
    .digest('hex');
}
function legacyClaimValid(doc: any, oldUid: string, uid: string, email: string) {
  if (!doc || doc.claimantUid !== uid || doc.verifiedEmail !== email) return false;
  const received = Buffer.from(String(doc.signature || ''), 'hex');
  const expected = Buffer.from(signLegacyClaim(oldUid, uid, email), 'hex');
  return received.length === expected.length && timingSafeEqual(received, expected);
}
function copilotMembershipSignature(uid: string, ownerUid: string): string {
  const privateKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}').private_key;
  if (!privateKey) throw new AdminError(503, 'Credencial administrativa indisponível.');
  return createHmac('sha256', privateKey)
    .update(['agencyos-copilot-member-v1', uid, ownerUid].join('\u0000')).digest('hex');
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
  if (code === 'auth/email-already-exists') {
    return res.status(409).json({ error: 'Esse e-mail já tem uma conta no Firebase. Verifique a equipe antes de convidar novamente.' });
  }
  if (code === 'auth/invalid-email' || code === 'auth/user-not-found') {
    return res.status(400).json({ error: 'O Firebase não reconheceu o e-mail do funcionário. Confira o endereço e tente novamente.' });
  }
  if (code === 'auth/unauthorized-continue-uri' || code === 'auth/invalid-continue-uri' ||
      (error instanceof Error && error.message.includes('Domain not allowlisted by project'))) {
    console.error('Admin API: Firebase Auth email action domain blocked', code || 'domain-not-allowlisted');
    return res.status(503).json({ error: 'O Firebase bloqueou o domínio de retorno do convite. É necessário autorizar o domínio nas configurações do Firebase Authentication.' });
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
  // A verified Firebase Auth UID owns its own workspace unless there is an
  // explicit binding to a DIFFERENT real account. Legacy versions incorrectly
  // saved actual owners as userType='employee' with no owner UID, or with the
  // non-UID placeholder 'agency-master-owner'. That label cannot grant or deny
  // ownership by itself. No email, plan, title or role can grant global access.
  const platformAdmin = decoded.platform_admin === true;
  const rawOwner = typeof data.agencyOwnerUid === 'string' ? data.agencyOwnerUid.trim() : '';
  const linkedToAnotherCompany = rawOwner !== '' &&
    rawOwner !== decoded.uid &&
    rawOwner !== 'agency-master-owner';
  // A linked employee is NOT an owner of their employer's workspace.
  // They can still inspect/manage an independent workspace under their own
  // authenticated UID, never the linked company. This is NOT a migration.
  // Such a workspace contains only employees explicitly linked to this UID.
  const legacyOwnerProfile = data.userType === 'employee' || linkedToAnotherCompany;
  let ownerUid = decoded.uid;
  if (linkedToAnotherCompany && decoded.email_verified === true) {
    const claim = await db.doc('verifiedLegacyWorkspaceClaims/' + rawOwner).get();
    if (claim.exists && legacyClaimValid(claim.data(), rawOwner, decoded.uid,
        String(decoded.email || '').trim().toLowerCase()))
      ownerUid = rawOwner;
  }
  return {
    uid: decoded.uid, platformAdmin, ownerUid, email: decoded.email || '',
    emailVerified: decoded.email_verified === true,
    linkedOwnerUid: linkedToAnotherCompany ? rawOwner : null,
    legacyOwnerProfile, conflictingOwnerLink: linkedToAnotherCompany && ownerUid === decoded.uid,
  };
}
function modulesFrom(input: unknown): string[] {
  if (!Array.isArray(input)) throw new AdminError(400, 'Selecione os módulos autorizados.');
  if (input.some(x => typeof x !== 'string')) throw new AdminError(400, 'O formato de um módulo é inválido.');
  const values = [...new Set(input)];
  if (!values.length || values.length > EMPLOYEE_MODULE_SET.size)
    throw new AdminError(400, 'Selecione de 1 a ' + EMPLOYEE_MODULE_SET.size + ' módulos operacionais.');
  const forbidden = values.filter(x => !EMPLOYEE_MODULE_SET.has(x));
  if (forbidden.length)
    throw new AdminError(400,
      'Permissões antigas ou restritas detectadas: ' + forbidden.join(', ') +
      '. Edite os módulos operacionais; permissões de administração não podem ser concedidas aqui.');
  return values;
}
function safeProfile(doc: any, authUser?: any) {
  const d = doc.data() || {};
  const raw = Array.isArray(d.allowedModules) ? d.allowedModules.filter((x: unknown) => typeof x === 'string') : [];
  return {
    uid: doc.id, name: d.name || '', email: d.email || '',
    agencyName: d.agencyName || '', userType: d.userType || null,
    agencyOwnerUid: d.agencyOwnerUid || null, role: d.role || '',
    leadershipRole: d.leadershipRole || 'membro', allowedModules: raw,
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
  // Company owners can only modify their own employees. The platform admin
  // can additionally manage SaaS customer accounts, but cannot edit employees
  // belonging to a different company from this company-facing endpoint.
  const ownEmployee = data.userType === 'employee' && data.agencyOwnerUid === actor.ownerUid;
  const saasClient = actor.platformAdmin && data.userType === 'client' &&
    (!data.agencyOwnerUid || data.agencyOwnerUid === target.id);
  if (!ownEmployee && !saasClient)
    throw new AdminError(403, 'Esta pessoa não pertence ao escopo administrativo autorizado.');
  return { ref: target.ref, data };
}

type LegacyDiagnosis = { recoverable: boolean; reason: string; legacyOwnerUid: string | null;
  memberCount: number; verifiedMemberCount: number; alreadyLinked: boolean };
async function diagnoseLegacy(actor: AdminCtx): Promise<LegacyDiagnosis> {
  const baseline: LegacyDiagnosis = { recoverable: false, reason: 'sem_vinculo',
    legacyOwnerUid: null, memberCount: 0, verifiedMemberCount: 0, alreadyLinked: false };
  const oldUid = actor.linkedOwnerUid;
  if (!oldUid || !/^[A-Za-z0-9_-]{1,128}$/.test(oldUid)) return baseline;
  if (!actor.emailVerified || !actor.email) return { ...baseline, reason: 'email_nao_verificado' };
  const { db, auth } = adminServices();
  const existing = await db.doc('verifiedLegacyWorkspaceClaims/' + oldUid).get();
  if (existing.exists && !legacyClaimValid(existing.data(), oldUid, actor.uid, actor.email.toLowerCase()))
    return { ...baseline, reason: 'ja_reivindicado_por_outra_conta' };
  // Never allow adoption of an existing Firebase Authentication identity.
  try {
    await auth.getUser(oldUid);
    return { ...baseline, reason: 'outra_conta_auth_ativa' };
  } catch (error: any) {
    if (error?.code !== 'auth/user-not-found') throw error;
  }
  const ownerDoc = await db.doc('users/' + oldUid).get();
  if (!ownerDoc.exists) return { ...baseline, reason: 'perfil_legado_inexistente' };
  const identity = await auth.getUser(actor.uid);
  const oldEmail = String(ownerDoc.data()?.email || '').trim().toLowerCase();
  if (!identity.emailVerified || !identity.email ||
      identity.email.toLowerCase() !== actor.email.toLowerCase() ||
      oldEmail !== actor.email.toLowerCase())
    return { ...baseline, reason: 'email_proprietario_diferente' };
  const snap = await db.collection('users').where('agencyOwnerUid', '==', oldUid).limit(150).get();
  const docs = snap.docs.filter(d => d.id !== actor.uid && d.id !== oldUid &&
    d.data().userType === 'employee' &&
    String(d.data().email || '').trim().toLowerCase() !== oldEmail);
  let verifiedMemberCount = 0;
  for (let offset = 0; offset < docs.length; offset += 100) {
    const group = docs.slice(offset, offset + 100);
    const found = await auth.getUsers(group.map(d => ({ uid: d.id })));
    const users = new Map(found.users.map(user => [user.uid, user]));
    for (const d of group) {
      const user = users.get(d.id);
      if (user?.email && user.email.toLowerCase() === String(d.data().email || '').trim().toLowerCase())
        verifiedMemberCount++;
    }
  }
  return { recoverable: true, reason: 'legado_validado', legacyOwnerUid: oldUid,
    memberCount: docs.length, verifiedMemberCount, alreadyLinked: existing.exists };
}

export function registerAdminManageRoutes(app: Express) {
  app.get('/api/admin/legacy-workspace', async (req, res) => {
    try {
      const actor = await authorize(req);
      res.json(await diagnoseLegacy(actor));
    } catch (e) { errorOut(res, e); }
  });
  app.post('/api/admin/legacy-workspace/claim', async (req, res) => {
    try {
      const actor = await authorize(req);
      const data = await diagnoseLegacy(actor);
      if (!data.recoverable || !data.legacyOwnerUid ||
          req.body?.legacyOwnerUid !== data.legacyOwnerUid || req.body?.confirm !== true)
        throw new AdminError(403, 'Não foi possível validar a propriedade da equipe antiga.');
      const { db } = adminServices();
      const ref = db.doc('verifiedLegacyWorkspaceClaims/' + data.legacyOwnerUid);
      await db.runTransaction(async tx => {
        const exists = await tx.get(ref);
        if (exists.exists && !legacyClaimValid(exists.data(), data.legacyOwnerUid!, actor.uid, actor.email.toLowerCase()))
          throw new AdminError(409, 'Workspace reivindicado por outra conta.');
        if (!exists.exists) tx.create(ref, {
          claimantUid: actor.uid, verifiedEmail: actor.email.trim().toLowerCase(),
          signature: signLegacyClaim(data.legacyOwnerUid, actor.uid, actor.email.trim().toLowerCase()),
          proof: 'verified-firebase-auth+legacy-firestore-profile',
          claimedAt: FieldValue.serverTimestamp(),
        });
      });
      await audit({ ...actor, ownerUid: data.legacyOwnerUid },
        'workspace.legacy_claimed', data.legacyOwnerUid,
        { memberCount: data.memberCount, verifiedMemberCount: data.verifiedMemberCount });
      res.json({ success: true, memberCount: data.memberCount });
    } catch (e) { errorOut(res, e); }
  });

  app.get('/api/admin/members', async (req, res) => {
    try {
      const actor = await authorize(req), { db, auth } = adminServices();
      // The company's team is ALWAYS scoped to its own owner UID.
      // Even a platform administrator must not blend everyone into their team.
      const teamSnap = await db.collection('users')
        .where('agencyOwnerUid', '==', actor.ownerUid).limit(150).get();
      const teamDocs = teamSnap.docs.filter(d =>
        d.id !== actor.ownerUid &&
        d.data().agencyOwnerUid === actor.ownerUid &&
        d.data().userType === 'employee'
      );
      // SaaS client accounts are a distinct area, available only to a
      // custom-claim platform administrator (not based on email/role/plan).
      const clientSnap = actor.platformAdmin
        ? await db.collection('users').where('userType', '==', 'client').limit(150).get()
        : null;
      const clientDocs = (clientSnap?.docs || []).filter(d =>
        d.data().userType === 'client' &&
        (!d.data().agencyOwnerUid || d.data().agencyOwnerUid === d.id)
      );
      const documents = [...teamDocs, ...clientDocs.filter(d => !teamDocs.some(m => m.id === d.id))];
      const identities = new Map<string, any>();
      for (let offset = 0; offset < documents.length; offset += 100) {
        const chunk = documents.slice(offset, offset + 100);
        const found = await auth.getUsers(chunk.map(d => ({ uid: d.id })));
        for (const user of found.users) identities.set(user.uid, user);
      }
      const members = documents.map(d => safeProfile(d, identities.get(d.id)));
      const employeeCount = members.filter(p => p.userType === 'employee').length;
      const clientCount = members.filter(p => p.userType === 'client').length;
      res.json({
        users: members, employees: employeeCount, clients: clientCount,
        platformAdmin: actor.platformAdmin, limited: teamSnap.size >= 150 || Boolean(clientSnap && clientSnap.size >= 150),
        billingConnected: false, legacyOwnerProfile: actor.legacyOwnerProfile,
        conflictingOwnerLink: actor.conflictingOwnerLink,
        workspaceScope: actor.ownerUid === actor.uid ? 'own' : 'verified_legacy',
      });
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
      let persisted = false;
      try {
        const invitationUrl = await createHostedPasswordLink(auth, email);
        const ownerProfile = kind === 'employee'
          ? await db.doc('users/' + actor.ownerUid).get() : null;
        const batch = db.batch();
        batch.set(db.doc('users/' + user.uid), {
          uid: user.uid, email, name,
          agencyName: kind === 'employee'
            ? ownerProfile?.data()?.agencyName || 'Minha agência' : agencyName,
          role, leadershipRole: 'membro', userType: kind, status: 'active',
          agencyOwnerUid: kind === 'employee' ? actor.ownerUid : user.uid,
          allowedModules: modules, plan: kind === 'employee' ? 'Gratuito / Equipe' : 'Trial Gratuito',
          trialStartDate: 0, trialEndsAt: 0, invitationStatus: 'pending',
          createdAt: now, designRole: kind === 'employee' ? 'funcionario' : 'cliente',
          canApproveDesigns: false, canPublishPosts: false, canDeleteDesigns: false,
        });
        if (kind === 'employee') batch.set(db.doc('copilotMemberships/' + user.uid), {
          uid: user.uid, ownerUid: actor.ownerUid,
          signature: copilotMembershipSignature(user.uid, actor.ownerUid),
          createdAt: FieldValue.serverTimestamp(),
        });
        batch.set(db.collection('adminAuditLog').doc(), {
          actorUid: actor.uid, action: 'user.invited', targetUid: user.uid,
          ownerUid: actor.ownerUid, details: { kind },
          createdAt: FieldValue.serverTimestamp(),
        });
        await batch.commit();
        persisted = true;
        res.status(201).json({ success: true, uid: user.uid, invitationUrl,
          message: 'Conta criada. Compartilhe o link de definição de senha por um canal seguro.' });
      } catch (e) {
        // Never destroy an existing registration when just a later step fails.
        if (!persisted) await auth.deleteUser(user.uid).catch(() => {});
        throw e;
      }
    } catch (e) { errorOut(res, e); }
  });

  // Promote a legacy Firestore-only employee to an actual Firebase Auth user.
  // The same UID is retained; never take over an existing email/identity.
  app.post('/api/admin/members/:uid/activate', async (req, res) => {
    try {
      const actor = await authorize(req);
      const { db, auth } = adminServices();
      const target = await getTarget(actor, req.params.uid);
      if (target.data.userType !== 'employee' || target.data.agencyOwnerUid !== actor.ownerUid)
        throw new AdminError(403, 'Somente funcionários deste workspace podem ser ativados.');
      if (req.body?.confirm !== true)
        throw new AdminError(400, 'Confirme a ativação desta conta legada.');
      const email = textField(target.data.email, 254).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new AdminError(400, 'O cadastro antigo não possui e-mail válido.');
      try {
        await auth.getUser(target.ref.id);
        throw new AdminError(409, 'A conta já existe no Firebase Auth. Atualize a lista.');
      } catch (e: any) {
        if (e instanceof AdminError) throw e;
        if (e?.code !== 'auth/user-not-found') throw e;
      }
      try {
        const existingEmail = await auth.getUserByEmail(email);
        if (existingEmail.uid !== target.ref.id)
          throw new AdminError(409, 'Já existe uma conta com este e-mail e outro UID. É necessária revisão manual.');
        throw new AdminError(409, 'A conta já existe. Atualize a lista.');
      } catch (e: any) {
        if (e instanceof AdminError) throw e;
        if (e?.code !== 'auth/user-not-found') throw e;
      }
      const created = await auth.createUser({
        uid: target.ref.id, email,
        displayName: textField(target.data.name, 90) || 'Colaborador',
        password: randomBytes(36).toString('base64url') + '!Aa2',
        emailVerified: false,
      });
      let persisted = false;
      try {
        const invitationUrl = await createHostedPasswordLink(auth, email);
        const batch = db.batch();
        batch.update(target.ref, {
          invitationStatus: 'pending', status: 'active',
          updatedAt: FieldValue.serverTimestamp(),
        });
        batch.set(db.doc('copilotMemberships/' + created.uid), {
          uid: created.uid, ownerUid: actor.ownerUid,
          signature: copilotMembershipSignature(created.uid, actor.ownerUid),
          createdAt: FieldValue.serverTimestamp(),
        });
        batch.set(db.collection('adminAuditLog').doc(), {
          actorUid: actor.uid, action: 'user.legacy_activated', targetUid: created.uid,
          ownerUid: actor.ownerUid, details: { source: 'existing-firestore-uid' },
          createdAt: FieldValue.serverTimestamp(),
        });
        await batch.commit();
        persisted = true;
        res.json({ success: true, invitationUrl, uid: created.uid });
      } catch (e) {
        if (!persisted) await auth.deleteUser(created.uid).catch(() => {});
        throw e;
      }
    } catch (e) { errorOut(res, e); }
  });


  // Delete ONLY a legacy employee profile without Firebase Authentication.
  // It is impossible to delete a live Firebase Auth account through this route.
  // Exact email confirmation, ownership verification and audit are mandatory.
  app.delete('/api/admin/members/:uid/legacy', async (req, res) => {
    try {
      const actor = await authorize(req);
      if (req.body?.confirm !== true) {
        throw new AdminError(400, 'Confirme a exclusão do cadastro legado.');
      }
      const confirmationEmail = textField(req.body?.email, 254).toLowerCase();
      if (!confirmationEmail) throw new AdminError(400, 'Digite o e-mail do funcionário para confirmar.');
      const { db, auth } = adminServices();
      const target = await getTarget(actor, req.params.uid);
      if (target.data.userType !== 'employee' || target.data.agencyOwnerUid !== actor.ownerUid)
        throw new AdminError(403, 'Somente cadastros da própria equipe podem ser excluídos.');
      try {
        await auth.getUser(target.ref.id);
        throw new AdminError(409, 'Esta pessoa já possui uma conta de login ativa. Esta opção exclui apenas cadastros legados.');
      } catch (error: any) {
        if (error instanceof AdminError) throw error;
        if (error?.code !== 'auth/user-not-found') throw error;
      }
      // Profile documents may be updated while an admin keeps the dialog open;
      // recheck the data inside a Firestore transaction before deleting.
      await db.runTransaction(async transaction => {
        const refreshed = await transaction.get(target.ref);
        if (!refreshed.exists) throw new AdminError(404, 'O cadastro já foi excluído.');
        const member = refreshed.data() || {};
        if (!canRemoveLegacyEmployee({
          requesterUid: actor.uid, workspaceUid: actor.ownerUid,
          targetUid: refreshed.id, agencyOwnerUid: member.agencyOwnerUid,
          userType: member.userType, storedEmail: member.email,
          confirmedEmail: confirmationEmail, authUserExists: false,
        })) {
          throw new AdminError(403, 'Este cadastro não pode ser excluído. Confira a empresa e o e-mail de confirmação.');
        }
        const log = db.collection('adminAuditLog').doc();
        transaction.delete(target.ref);
        transaction.set(log, {
          actorUid: actor.uid,
          action: 'user.legacy_deleted',
          targetUid: target.ref.id,
          ownerUid: actor.ownerUid,
          details: { kind: 'employee', firebaseAuthWasAbsent: true },
          createdAt: FieldValue.serverTimestamp(),
        });
      });
      res.json({ success: true, message: 'Cadastro legado excluído da equipe. Você já pode cadastrar um novo funcionário.' });
    } catch (error) { errorOut(res, error); }
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
      const { auth, db } = adminServices();
      let existingAuth;
      try { existingAuth = await auth.getUser(req.params.uid); }
      catch (e: any) {
        if (e?.code === 'auth/user-not-found')
          throw new AdminError(409, 'Cadastro legado sem autenticação. Ative primeiro a conta do funcionário.');
        throw e;
      }
      if (patch.status) {
        await auth.updateUser(req.params.uid, { disabled: patch.status === 'blocked' });
        if (patch.status === 'blocked') await auth.revokeRefreshTokens(req.params.uid);
      }
      const batch = db.batch();
      batch.update(target.ref, { ...patch, updatedAt: FieldValue.serverTimestamp() });
      batch.set(db.collection('adminAuditLog').doc(), {
        actorUid: actor.uid, action: 'user.updated', targetUid: req.params.uid,
        ownerUid: actor.ownerUid, details: { fields: Object.keys(patch) },
        createdAt: FieldValue.serverTimestamp(),
      });
      await batch.commit();
      // Changing profile display name must not leave Firebase Auth stale.
      if (patch.name && patch.name !== existingAuth.displayName) {
        await auth.updateUser(req.params.uid, { displayName: patch.name }).catch(e =>
          console.warn('Admin API: Auth display name sync deferred', e?.code || 'error'));
      }
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

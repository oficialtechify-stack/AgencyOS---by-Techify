import type { Express, Request, Response } from 'express';
import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

const VERSION = process.env.META_GRAPH_VERSION || 'v24.0';
const GRAPH = 'https://graph.facebook.com/' + VERSION;
const IG_GRAPH = 'https://graph.instagram.com/' + VERSION;
type Access = { uid: string; owner: string; isOwner: boolean };
class ApiError extends Error { constructor(public status: number, msg: string) { super(msg); } }
function mustEnv(key: string) { const val = process.env[key]?.trim(); if (!val) throw new ApiError(503, 'Configuração pendente: ' + key); return val; }
function same(a: string, b: string) {
  const x = Buffer.from(a || ''), y = Buffer.from(b || '');
  return x.length === y.length && timingSafeEqual(x, y);
}
function key() {
  const text = mustEnv('SOCIAL_TOKEN_ENCRYPTION_KEY');
  if (!/^[a-f0-9]{64}$/i.test(text)) throw new ApiError(503, 'Chave de criptografia social inválida.');
  return Buffer.from(text, 'hex');
}
function encrypt(text: string) {
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', key(), iv);
  const bytes = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return [iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), bytes.toString('base64url')].join('.');
}
function decrypt(text: string) {
  const [iv, tag, body] = String(text || '').split('.');
  if (!iv || !tag || !body) throw new ApiError(409, 'Credencial inválida. Reconecte a conta.');
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(body, 'base64url')), decipher.final()]).toString('utf8');
}
function services() {
  const json = mustEnv('FIREBASE_SERVICE_ACCOUNT_JSON');
  const app = getApps().find(a => a.name === 'agencyos-meta') ||
    initializeApp({ credential: cert(JSON.parse(json)), projectId: 'agencyos-1c3fc' }, 'agencyos-meta');
  return { db: getFirestore(app), auth: getAuth(app) };
}
function val(v: any, max = 1200) { return typeof v === 'string' ? v.trim().slice(0, max) : ''; }
function failure(res: Response, e: unknown) {
  if (e instanceof ApiError) return res.status(e.status).json({ error: e.message });
  console.error('Social API error:', e instanceof Error ? e.message : 'unexpected');
  return res.status(500).json({ error: 'Erro interno na integração. Consulte os logs do servidor.' });
}
async function meta(url: string, options: RequestInit = {}) {
  const res = await fetch(url, { ...options, signal: AbortSignal.timeout(20000) });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new ApiError(502, 'Meta API: ' + val(data.error?.message || 'Falha na operação.', 230));
  return data;
}
async function authorize(req: Request): Promise<Access> {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw new ApiError(401, 'Entre com sua conta AgencyOS.');
  const { auth, db } = services();
  const decoded = await auth.verifyIdToken(header.slice(7), true);
  const doc = await db.doc('users/' + decoded.uid).get();
  if (!doc.exists) throw new ApiError(403, 'Perfil AgencyOS não encontrado.');
  const p = doc.data() || {};
  if (p.userType === 'employee' && !(p.allowedModules || []).includes('social-hub'))
    throw new ApiError(403, 'Sem permissão para usar as redes sociais desta empresa.');
  const owner = p.userType === 'employee' ? p.agencyOwnerUid : decoded.uid;
  if (!owner || !/^[a-zA-Z0-9_-]{1,128}$/.test(owner)) throw new ApiError(403, 'Agência inválida.');
  return { uid: decoded.uid, owner, isOwner: owner === decoded.uid };
}
function onlyOwner(a: Access) { if (!a.isOwner) throw new ApiError(403, 'Somente a conta responsável pode conectar canais e alterar automações.'); }
function publicAccount(v: any) { return v?.status === 'connected' && !(v.expiresAt && Date.now() >= v.expiresAt) ? {
  connected: true, username: v.username || '', phone: v.phone || '', name: v.name || '',
  connectedAt: v.connectedAt || '', accountType: v.accountType || '',
} : { connected: false }; }
function mac(state: string) { return createHmac('sha256', key()).update(state).digest('base64url'); }
function oauthPage(res: Response, ok: boolean) {
  const origin = new URL(process.env.AGENCYOS_PUBLIC_ORIGIN || 'https://agency-os-by-techify.vercel.app').origin;
  return res.type('html').send('<!doctype html><meta charset="utf-8"><body style="background:#08132c;color:#fff;font:16px system-ui;text-align:center;padding:70px">' +
    '<h2>' + (ok ? 'Instagram conectado!' : 'Não foi possível conectar.') + '</h2><p>Volte ao AgencyOS.</p>' +
    '<script>window.opener?.postMessage({type:"AGENCYOS_META_OAUTH",ok:' + JSON.stringify(ok) + '},' + JSON.stringify(origin) + ');window.close()</script>');
}
async function publishInstagram(owner: string, id: string) {
  const db = services().db;
  const ref = db.doc('socialWorkspaces/' + owner + '/drafts/' + id);
  const draft = await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) throw new ApiError(404, 'Rascunho não encontrado.');
    const value = snapshot.data() || {};
    if (value.status === 'publicado') throw new ApiError(409, 'Já publicado.');
    if (value.status === 'publicando') throw new ApiError(409, 'Esta publicação já está sendo processada.');
    if (!/^https:\/\/\S+$/i.test(value.imageUrl || '')) throw new ApiError(400, 'Forneça imagem pública HTTPS.');
    transaction.update(ref, { status: 'publicando', processingAt: new Date().toISOString() });
    return value;
  });
  try {
    const conn = (await db.doc('socialWorkspaces/' + owner + '/connections/instagram').get()).data();
    if (conn?.status !== 'connected') throw new ApiError(409, 'Conecte o Instagram profissional.');
    if (conn.expiresAt && Date.now() >= conn.expiresAt) throw new ApiError(409, 'Token expirado. Reconecte a conta.');
    const token = decrypt(conn.tokenCipher);
    const headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
    const container = await meta(IG_GRAPH + '/' + conn.externalId + '/media', {
      method: 'POST', headers, body: JSON.stringify({ image_url: draft.imageUrl, caption: draft.caption }),
    });
    if (!container.id) throw new ApiError(502, 'A Meta não criou a mídia.');
    const post = await meta(IG_GRAPH + '/' + conn.externalId + '/media_publish', {
      method: 'POST', headers, body: JSON.stringify({ creation_id: container.id }),
    });
    if (!post.id) throw new ApiError(502, 'A publicação não foi confirmada.');
    await ref.update({ status: 'publicado', publishedId: post.id, publishedAt: new Date().toISOString() });
    return post.id as string;
  } catch (error) {
    // The creation id is preserved separately for future reconciliation.
    // A Graph API timeout does not prove that publishing failed; do NOT
    // automatically repeat a request after an ambiguous response.
    await ref.update({ status: 'erro', lastError: error instanceof Error ? val(error.message, 160) : 'Erro não especificado' })
      .catch(() => {});
    throw error;
  }
}

async function sendWhatsapp(owner: string, to: string, body: string) {
  const connection = (await services().db.doc('socialWorkspaces/' + owner + '/connections/whatsapp').get()).data();
  if (!connection || connection.status !== 'connected') throw new ApiError(409, 'WhatsApp Business não conectado.');
  const response = await meta(GRAPH + '/' + connection.phoneNumberId + '/messages', {
    method: 'POST', headers: { Authorization: 'Bearer ' + decrypt(connection.tokenCipher), 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text',
      text: { preview_url: false, body } }),
  });
  return val(response.messages?.[0]?.id);
}
export function registerSocialMetaRoutes(app: Express) {
  app.get('/api/social/config', (_req, res) => res.json({
    instagramReady: Boolean(process.env.META_IG_APP_ID && process.env.META_IG_APP_SECRET && process.env.META_IG_REDIRECT_URI &&
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON && process.env.SOCIAL_TOKEN_ENCRYPTION_KEY),
    whatsappReady: Boolean(process.env.META_WA_APP_ID && process.env.META_WA_APP_SECRET && process.env.META_WA_CONFIG_ID &&
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON && process.env.SOCIAL_TOKEN_ENCRYPTION_KEY),
    waAppId: process.env.META_WA_APP_ID || '', waConfigId: process.env.META_WA_CONFIG_ID || '',
    schedulerReady: Boolean(process.env.CRON_SECRET && process.env.SOCIAL_CRON_ENABLED === 'true'),
  }));
  app.get('/api/social/status', async (req, res) => {
    try {
      const a = await authorize(req), db = services().db;
      const [ig, wa, settings] = await Promise.all([
        db.doc('socialWorkspaces/' + a.owner + '/connections/instagram').get(),
        db.doc('socialWorkspaces/' + a.owner + '/connections/whatsapp').get(),
        db.doc('socialWorkspaces/' + a.owner + '/settings/automation').get(),
      ]);
      res.json({ instagram: publicAccount(ig.data()), whatsapp: publicAccount(wa.data()),
        automation: { enabled: settings.data()?.enabled === true, greeting: settings.data()?.greeting || '' },
        isOwner: a.isOwner });
    } catch (e) { failure(res, e); }
  });
  app.post('/api/social/instagram/start', async (req, res) => {
    try {
      const a = await authorize(req); onlyOwner(a);
      const appId = mustEnv('META_IG_APP_ID'), redirect = mustEnv('META_IG_REDIRECT_URI');
      mustEnv('META_IG_APP_SECRET');
      const nonce = randomBytes(18).toString('hex'), now = Date.now();
      const payload = Buffer.from(JSON.stringify({ uid: a.uid, owner: a.owner, nonce, at: now })).toString('base64url');
      await services().db.doc('socialOAuthStates/' + nonce).set({
        uid: a.uid, owner: a.owner, expiresAt: Timestamp.fromMillis(now + 600000) });
      const url = new URL('https://www.instagram.com/oauth/authorize');
      for (const [k, v] of Object.entries({
        enable_fb_login: '0', force_authentication: '1', client_id: appId,
        redirect_uri: redirect, response_type: 'code',
        scope: 'instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages,instagram_business_manage_comments',
        state: payload + '.' + mac(payload),
      })) url.searchParams.set(k, v);
      res.json({ url: url.toString() });
    } catch (e) { failure(res, e); }
  });
  app.get('/api/social/instagram/callback', async (req, res) => {
    try {
      if (req.query.error || !req.query.code) return oauthPage(res, false);
      const parts = val(req.query.state, 4000).split('.');
      if (parts.length !== 2 || !same(mac(parts[0]), parts[1])) return oauthPage(res, false);
      const state = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
      if (!state.nonce || Date.now() - state.at > 600000 || state.at > Date.now()) return oauthPage(res, false);
      const db = services().db, marker = db.doc('socialOAuthStates/' + state.nonce);
      const consumed = await db.runTransaction(async t => {
        const snap = await t.get(marker);
        if (!snap.exists || snap.data()?.uid !== state.uid || snap.data()?.owner !== state.owner) return false;
        t.delete(marker); return true;
      });
      if (!consumed) return oauthPage(res, false);
      const params = new URLSearchParams({ client_id: mustEnv('META_IG_APP_ID'),
        client_secret: mustEnv('META_IG_APP_SECRET'), grant_type: 'authorization_code',
        redirect_uri: mustEnv('META_IG_REDIRECT_URI'), code: val(req.query.code, 2200) });
      const short = await meta('https://api.instagram.com/oauth/access_token', { method: 'POST', body: params });
      if (!short.access_token) throw new ApiError(502, 'Token do Instagram indisponível.');
      const url = new URL('https://graph.instagram.com/access_token');
      url.searchParams.set('grant_type', 'ig_exchange_token');
      url.searchParams.set('client_secret', mustEnv('META_IG_APP_SECRET'));
      url.searchParams.set('access_token', short.access_token);
      const exchanged = await meta(url.toString());
      const token = exchanged.access_token || short.access_token;
      const profile = new URL(IG_GRAPH + '/me');
      profile.searchParams.set('fields', 'id,user_id,username,account_type');
      profile.searchParams.set('access_token', token);
      const me = await meta(profile.toString());
      const externalId = String(me.user_id || me.id || short.user_id || '');
      if (!externalId) throw new ApiError(502, 'Identidade do Instagram não confirmada.');
      await db.doc('socialWorkspaces/' + state.owner + '/connections/instagram').set({
        provider: 'instagram', status: 'connected', externalId, username: me.username || '',
        accountType: me.account_type || '', tokenCipher: encrypt(token),
        connectedAt: new Date().toISOString(), expiresAt: exchanged.expires_in ?
          Date.now() + Number(exchanged.expires_in) * 1000 : null,
      });
      oauthPage(res, true);
    } catch (e) { console.error('Instagram OAuth callback:', e instanceof Error ? e.message : 'error'); oauthPage(res, false); }
  });
  app.post('/api/social/whatsapp/connect', async (req, res) => {
    try {
      const a = await authorize(req); onlyOwner(a);
      const code = val(req.body?.code, 2500), waba = val(req.body?.wabaId, 35),
        phoneId = val(req.body?.phoneNumberId, 35);
      if (!code || !/^\d+$/.test(waba) || !/^\d+$/.test(phoneId)) throw new ApiError(400, 'Cadastro empresarial Meta incompleto.');
      const exchangeUrl = new URL(GRAPH + '/oauth/access_token');
      exchangeUrl.searchParams.set('client_id', mustEnv('META_WA_APP_ID'));
      exchangeUrl.searchParams.set('client_secret', mustEnv('META_WA_APP_SECRET'));
      exchangeUrl.searchParams.set('code', code);
      const exchange = await meta(exchangeUrl.toString());
      const token = val(exchange.access_token, 4000);
      if (!token) throw new ApiError(502, 'Meta não retornou a credencial WhatsApp.');
      const headers = { Authorization: 'Bearer ' + token };
      const all = await meta(GRAPH + '/' + waba + '/phone_numbers?fields=id,display_phone_number,verified_name', { headers });
      const number = (all.data || []).find((x: any) => String(x.id) === phoneId);
      if (!number) throw new ApiError(403, 'Número não pertence à empresa autorizada.');
      await meta(GRAPH + '/' + waba + '/subscribed_apps', { method: 'POST', headers });
      const db = services().db;
      await db.doc('socialWorkspaces/' + a.owner + '/connections/whatsapp').set({
        provider: 'whatsapp', status: 'connected', externalId: waba,
        phoneNumberId: phoneId, phone: number.display_phone_number || '',
        name: number.verified_name || '', tokenCipher: encrypt(token),
        connectedAt: new Date().toISOString(),
      });
      await db.doc('socialPhoneRoutes/' + phoneId).set({ owner: a.owner, waba });
      res.json({ success: true, phone: number.display_phone_number });
    } catch (e) { failure(res, e); }
  });
  app.post('/api/social/disconnect', async (req, res) => {
    try {
      const a = await authorize(req); onlyOwner(a);
      const provider = req.body?.provider;
      if (!['instagram', 'whatsapp'].includes(provider)) throw new ApiError(400, 'Canal inválido.');
      const db = services().db, ref = db.doc('socialWorkspaces/' + a.owner + '/connections/' + provider);
      const old = (await ref.get()).data();
      if (provider === 'whatsapp' && old?.phoneNumberId) await db.doc('socialPhoneRoutes/' + old.phoneNumberId).delete();
      await ref.delete(); res.json({ success: true });
    } catch (e) { failure(res, e); }
  });
  app.get('/api/social/drafts', async (req, res) => {
    try {
      const a = await authorize(req), snapshot = await services().db.collection('socialWorkspaces/' + a.owner + '/drafts')
        .orderBy('createdAt', 'desc').limit(60).get();
      res.json({ drafts: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) });
    } catch (e) { failure(res, e); }
  });
  app.post('/api/social/drafts', async (req, res) => {
    try {
      const a = await authorize(req), caption = val(req.body?.caption, 2200),
        imageUrl = val(req.body?.imageUrl, 2000), when = val(req.body?.scheduledAt, 40);
      if (req.body?.platform !== 'instagram' || !caption) throw new ApiError(400, 'Informe a legenda do Instagram.');
      if (imageUrl && !/^https:\/\/[^#\s]+$/i.test(imageUrl)) throw new ApiError(400, 'Informe URL HTTPS pública da imagem.');
      if (when && (!process.env.CRON_SECRET || process.env.SOCIAL_CRON_ENABLED !== 'true' || !imageUrl || !Number.isFinite(Date.parse(when)) || Date.parse(when) < Date.now() + 60000))
        throw new ApiError(400, 'Agendamento indisponível ou data inválida.');
      const db = services().db, ref = db.collection('socialWorkspaces/' + a.owner + '/drafts').doc();
      const data = { platform: 'instagram', caption, imageUrl, scheduledAt: when || '',
        status: when ? 'agendado' : 'rascunho', createdAt: new Date().toISOString(), authorUid: a.uid };
      await ref.set(data);
      if (when) await db.doc('socialScheduleJobs/' + ref.id).set({ owner: a.owner, draftId: ref.id,
        dueAt: Timestamp.fromDate(new Date(when)), state: 'queued' });
      res.status(201).json({ id: ref.id, ...data });
    } catch (e) { failure(res, e); }
  });
  app.delete('/api/social/drafts/:id', async (req, res) => {
    try {
      const a = await authorize(req), id = val(req.params.id, 160);
      if (!/^[\w-]+$/.test(id)) throw new ApiError(400, 'ID inválido.');
      const db = services().db, ref = db.doc('socialWorkspaces/' + a.owner + '/drafts/' + id);
      const item = await ref.get();
      if (!item.exists) throw new ApiError(404, 'Não encontrado.');
      if (item.data()?.status === 'publicado') throw new ApiError(409, 'Publicação já concluída.');
      await Promise.all([ref.delete(), db.doc('socialScheduleJobs/' + id).delete()]);
      res.json({ success: true });
    } catch (e) { failure(res, e); }
  });
  app.post('/api/social/drafts/:id/publish', async (req, res) => {
    try {
      const a = await authorize(req), id = val(req.params.id, 160);
      if (!/^[\w-]+$/.test(id)) throw new ApiError(400, 'ID inválido.');
      const db = services().db, job = await db.doc('socialScheduleJobs/' + id).get();
      if (job.exists && job.data()?.owner !== a.owner) throw new ApiError(403, 'Agendamento de outra empresa.');
      const publishedId = await publishInstagram(a.owner, id);
      if (job.exists) await job.ref.delete();
      res.json({ success: true, publishedId });
    } catch (e) { failure(res, e); }
  });
  app.get('/api/social/jobs/publish', async (req, res) => {
    try {
      const token = mustEnv('CRON_SECRET');
      if (!same(req.headers.authorization || '', 'Bearer ' + token)) throw new ApiError(401, 'Job não autorizado.');
      const db = services().db, jobs = await db.collection('socialScheduleJobs')
        .where('state', '==', 'queued').where('dueAt', '<=', Timestamp.now()).limit(10).get();
      let sent = 0, failures = 0;
      for (const job of jobs.docs) {
        const locked = await db.runTransaction(async t => {
          const fresh = await t.get(job.ref);
          if (!fresh.exists || fresh.data()?.state !== 'queued') return false;
          t.update(job.ref, { state: 'running' }); return true;
        });
        if (!locked) continue;
        try { await publishInstagram(job.data().owner, job.data().draftId); await job.ref.delete(); sent++; }
        catch (e) {
          await job.ref.update({ state: 'failed', error: e instanceof Error ? val(e.message, 160) : 'Erro interno' });
          await db.doc('socialWorkspaces/' + job.data().owner + '/drafts/' + job.data().draftId)
            .set({ status: 'erro' }, { merge: true });
          failures++;
        }
      }
      res.json({ sent, failures });
    } catch (e) { failure(res, e); }
  });
  app.get('/api/social/messages', async (req, res) => {
    try {
      const a = await authorize(req), messages = await services().db.collection('socialWorkspaces/' + a.owner + '/messages')
        .orderBy('receivedAt', 'desc').limit(100).get();
      res.json({ messages: messages.docs.map(d => ({ id: d.id, ...d.data() })) });
    } catch (e) { failure(res, e); }
  });
  app.post('/api/social/messages/reply', async (req, res) => {
    try {
      const a = await authorize(req), id = val(req.body?.messageId, 160), body = val(req.body?.text, 1000);
      if (!id || !body) throw new ApiError(400, 'Mensagem inválida.');
      const db = services().db;
      const received = (await db.doc('socialWorkspaces/' + a.owner + '/messages/' + id).get()).data();
      if (received?.direction !== 'incoming' || received?.provider !== 'whatsapp') throw new ApiError(404, 'Conversa não encontrada.');
      if (Date.now() - Date.parse(received.receivedAt) > 86400000) throw new ApiError(409, 'Janela de 24h encerrada. Use template aprovado pela Meta.');
      const sentId = await sendWhatsapp(a.owner, received.senderId, body);
      await db.doc('socialWorkspaces/' + a.owner + '/messages/' + (sentId || randomBytes(12).toString('hex')))
        .set({ provider: 'whatsapp', direction: 'outgoing', senderId: received.senderId, text: body,
          receivedAt: new Date().toISOString(), externalId: sentId, authorUid: a.uid });
      res.json({ success: true });
    } catch (e) { failure(res, e); }
  });
  app.post('/api/social/automation', async (req, res) => {
    try {
      const a = await authorize(req); onlyOwner(a);
      const enabled = req.body?.enabled === true, greeting = val(req.body?.greeting, 600);
      if (enabled && greeting.length < 8) throw new ApiError(400, 'Escreva mensagem com pelo menos 8 caracteres.');
      if (enabled && (await services().db.doc('socialWorkspaces/' + a.owner + '/connections/whatsapp').get()).data()?.status !== 'connected')
        throw new ApiError(409, 'Conecte o WhatsApp antes de ativar a automação.');
      await services().db.doc('socialWorkspaces/' + a.owner + '/settings/automation').set({ enabled, greeting,
        updatedAt: new Date().toISOString() });
      res.json({ enabled, greeting });
    } catch (e) { failure(res, e); }
  });
  app.get('/api/social/webhook/meta', (req, res) => {
    try {
      const verify = mustEnv('META_WA_VERIFY_TOKEN');
      if (req.query['hub.mode'] === 'subscribe' && same(val(req.query['hub.verify_token'], 250), verify))
        return res.status(200).send(req.query['hub.challenge']);
      res.status(403).send('Forbidden');
    } catch (e) { failure(res, e); }
  });
  app.post('/api/social/webhook/meta', async (req, res) => {
    try {
      const secret = mustEnv('META_WA_APP_SECRET'), raw = (req as any).rawBody as Buffer;
      if (!Buffer.isBuffer(raw)) throw new ApiError(503, 'Body original indisponível.');
      const signature = 'sha256=' + createHmac('sha256', secret).update(raw).digest('hex');
      if (!same(val(req.headers['x-hub-signature-256'], 200), signature)) throw new ApiError(401, 'Webhook não autorizado.');
      if (req.body?.object !== 'whatsapp_business_account') return res.sendStatus(200);
      const db = services().db;
      for (const entry of req.body.entry || []) for (const change of entry.changes || []) {
        const phoneId = String(change.value?.metadata?.phone_number_id || '');
        if (!/^\d+$/.test(phoneId)) continue;
        const owner = (await db.doc('socialPhoneRoutes/' + phoneId).get()).data()?.owner;
        if (!owner) continue;
        for (const message of change.value?.messages || []) {
          const id = val(message.id, 170), senderId = val(message.from, 25);
          if (!id || !/^\d{7,20}$/.test(senderId)) continue;
          const reference = db.doc('socialWorkspaces/' + owner + '/messages/' + id);
          if ((await reference.get()).exists) continue;
          const receivedAt = message.timestamp ? new Date(Number(message.timestamp) * 1000).toISOString() : new Date().toISOString();
          await reference.create({ provider: 'whatsapp', direction: 'incoming', senderId,
            text: val(message.text?.body, 4000) || '[Mídia ou evento]', receivedAt,
            externalId: id, messageType: message.type || 'other' }).catch(() => {});
          if (message.type !== 'text') continue;
          const opts = (await db.doc('socialWorkspaces/' + owner + '/settings/automation').get()).data();
          if (opts?.enabled !== true || !opts.greeting) continue;
          const guard = db.doc('socialWorkspaces/' + owner + '/autoReplies/' + senderId);
          const shouldReply = await db.runTransaction(async t => {
            const old = await t.get(guard);
            if (Date.now() - Number(old.data()?.lastSentAt || 0) < 86400000) return false;
            t.set(guard, { lastSentAt: Date.now() }); return true;
          });
          if (shouldReply) try { await sendWhatsapp(owner, senderId, val(opts.greeting, 600)); }
          catch (e) { console.error('Auto reply:', e instanceof Error ? e.message : 'error'); }
        }
      }
      res.sendStatus(200);
    } catch (e) { failure(res, e); }
  });
}

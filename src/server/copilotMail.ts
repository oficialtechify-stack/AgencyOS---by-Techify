import type { Express } from 'express';
import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
import { authenticateCopilot, copilotServices, CopilotError, formatCopilotError } from './copilotAuth.js';

const origin=()=>process.env.AGENCYOS_PUBLIC_ORIGIN||'https://agency-os-by-techify.vercel.app';
const callback=()=>process.env.COPILOT_GOOGLE_REDIRECT_URI||origin()+'/api/copilot/google/callback';
const clientId=()=>process.env.COPILOT_GOOGLE_CLIENT_ID||'';
const clientSecret=()=>process.env.COPILOT_GOOGLE_CLIENT_SECRET||'';
function encKey(){
 const key=process.env.COPILOT_TOKEN_ENCRYPTION_KEY||'';
 if(!/^[a-f0-9]{64}$/i.test(key))throw new CopilotError(503,'Configure COPILOT_TOKEN_ENCRYPTION_KEY com 64 caracteres hexadecimais no servidor.');
 return Buffer.from(key,'hex');
}
function encryption(text:string,uid:string){
 const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',encKey(),iv);
 cipher.setAAD(Buffer.from(uid));
 const data=Buffer.concat([cipher.update(text,'utf8'),cipher.final()]);
 return [iv.toString('base64url'),cipher.getAuthTag().toString('base64url'),data.toString('base64url')].join('.');
}
function decryption(value:string,uid:string){
 const parts=String(value||'').split('.');
 if(parts.length!==3)throw new CopilotError(503,'Credencial do Gmail inválida. Reconecte a conta.');
 const [iv,tag,data]=parts.map(p=>Buffer.from(p,'base64url'));
 const decipher=createDecipheriv('aes-256-gcm',encKey(),iv);
 decipher.setAuthTag(tag);
 decipher.setAAD(Buffer.from(uid));
 return Buffer.concat([decipher.update(data),decipher.final()]).toString('utf8');
}
const configReady=()=>Boolean(clientId()&&clientSecret()&&/^[a-f0-9]{64}$/i.test(process.env.COPILOT_TOKEN_ENCRYPTION_KEY||''));
const digest=(v:string)=>createHash('sha256').update(v).digest('hex');
function stateSignature(nonce:string,uid:string,workspaceUid:string,expiresAt:number){
 return createHash('sha256')
  .update(encKey()).update(['agencyos-copilot-oauth',nonce,uid,workspaceUid,String(expiresAt)].join('\u0000'))
  .digest('hex');
}

const emailValid=(s:string)=>/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(s);
const clean=(s:unknown,max:number)=>typeof s==='string'?s.trim().slice(0,max):'';
function requireMailConfigured(){if(!configReady())throw new CopilotError(503,'Gmail não está configurado neste SaaS. O administrador precisa cadastrar OAuth e a chave de criptografia na Vercel.');}
async function issueAccessToken(refresh:string){
 const params=new URLSearchParams({client_id:clientId(),client_secret:clientSecret(),
  grant_type:'refresh_token',refresh_token:refresh});
 const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',
  headers:{'Content-Type':'application/x-www-form-urlencoded'},body:params});
 if(!response.ok)throw new CopilotError(409,'A conexão Gmail expirou. Reconecte a conta Google.');
 const payload:any=await response.json();
 if(!payload.access_token)throw new CopilotError(502,'O Google não retornou uma credencial válida.');
 return String(payload.access_token);
}
export function registerCopilotMailRoutes(app:Express){
 app.get('/api/copilot/gmail/status',async(req,res)=>{
  try{
   const user=await authenticateCopilot(req.headers.authorization);
   const record=await copilotServices().db.doc('copilotPrivate/'+user.uid+'/integrations/gmail').get();
   res.set('Cache-Control','private, no-store');
   res.json({configured:configReady(),connected:record.exists,email:record.exists?String(record.data()?.email||''):null,
    canSend:configReady()&&record.exists});
  }catch(error){formatCopilotError(res,error);}
 });
 app.get('/api/copilot/gmail/connect',async(req,res)=>{
  try{
   requireMailConfigured();
   const user=await authenticateCopilot(req.headers.authorization);
   const nonce=randomBytes(32).toString('base64url');
   const expiresAt=Date.now()+10*60*1000;
   await copilotServices().db.doc('copilotOAuthStates/'+digest(nonce)).create({
    uid:user.uid,workspaceUid:user.ownerUid,expiresAt,
    signature:stateSignature(nonce,user.uid,user.ownerUid,expiresAt),
    createdAt:new Date().toISOString(),
   });
   const params=new URLSearchParams({
    client_id:clientId(),redirect_uri:callback(),response_type:'code',
    scope:'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email',
    state:nonce,access_type:'offline',prompt:'consent',include_granted_scopes:'false',
   });
   res.set('Cache-Control','no-store');
   res.json({url:'https://accounts.google.com/o/oauth2/v2/auth?'+params.toString()});
  }catch(error){formatCopilotError(res,error);}
 });
 app.get('/api/copilot/google/callback',async(req,res)=>{
  const back=origin()+'/?copilot=gmail-';
  try{
   requireMailConfigured();
   const nonce=clean(req.query.state,180),code=clean(req.query.code,3000);
   if(!nonce||!code)throw new CopilotError(400,'Autorização não concluída.');
   const {db}=copilotServices(),ref=db.doc('copilotOAuthStates/'+digest(nonce));
   let data:any;
   await db.runTransaction(async tx=>{
    const snap=await tx.get(ref);
    if(!snap.exists||Number(snap.data()?.expiresAt||0)<Date.now())
     throw new CopilotError(403,'Autorização expirada. Conecte novamente.');
    data=snap.data();
    const expected=stateSignature(nonce,String(data.uid||''),String(data.workspaceUid||''),Number(data.expiresAt));
    if(data.signature!==expected)throw new CopilotError(403,'Autorização não reconhecida pelo servidor.');
    tx.delete(ref);
   });
   const params=new URLSearchParams({client_id:clientId(),client_secret:clientSecret(),
    redirect_uri:callback(),grant_type:'authorization_code',code});
   const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},body:params});
   if(!response.ok)throw new CopilotError(409,'O Google recusou a conexão Gmail.');
   const token:any=await response.json();
   if(!token.refresh_token||!token.access_token)throw new CopilotError(409,'Permissão offline do Gmail ausente. Conecte novamente e aceite o acesso.');
   const infoResponse=await fetch('https://www.googleapis.com/oauth2/v2/userinfo',{
    headers:{Authorization:'Bearer '+token.access_token}});
   if(!infoResponse.ok)throw new CopilotError(502,'Não foi possível identificar a conta Google.');
   const info:any=await infoResponse.json();
   if(!emailValid(String(info.email||'')))throw new CopilotError(403,'Conta Google sem e-mail validado.');
   const profile=await db.doc('users/'+data.uid).get();
   if(!profile.exists||['blocked','cancelled'].includes(profile.data()?.status))
    throw new CopilotError(403,'Conta AgencyOS não autorizada.');
   await db.doc('copilotPrivate/'+data.uid+'/integrations/gmail').set({
    workspaceUid:data.workspaceUid,email:String(info.email).toLowerCase(),
    refreshCipher:encryption(String(token.refresh_token),data.uid),updatedAt:new Date().toISOString(),
   });
   res.redirect(302,back+'connected');
  }catch(error){
   console.error('Copilot Gmail OAuth callback:',error instanceof Error?error.message:'error');
   res.redirect(302,back+'error');
  }
 });
 app.post('/api/copilot/gmail/disconnect',async(req,res)=>{
  try{
   const user=await authenticateCopilot(req.headers.authorization);
   const ref=copilotServices().db.doc('copilotPrivate/'+user.uid+'/integrations/gmail');
   const record=await ref.get();
   if(record.exists&&record.data()?.workspaceUid!==user.ownerUid)
    throw new CopilotError(403,'A conexão pertence a outro workspace.');
   await ref.delete();
   res.json({success:true});
  }catch(error){formatCopilotError(res,error);}
 });
 app.post('/api/copilot/email/send',async(req,res)=>{
  try{
   requireMailConfigured();
   const user=await authenticateCopilot(req.headers.authorization);
   // This endpoint is called ONLY by a visible confirmation button in the UI.
   if(req.body?.confirm!==true)throw new CopilotError(400,'Confirme o envio antes de executar.');
   const to=clean(req.body?.to,254).toLowerCase(),subject=clean(req.body?.subject,160),
    body=clean(req.body?.body,12000);
   const requestId=clean(req.body?.requestId,90);
   if(!emailValid(to)||!subject||!body||!/^[a-zA-Z0-9-]{16,90}$/.test(requestId))
    throw new CopilotError(400,'Informe destinatário, assunto, mensagem e identificador de confirmação.');
   const {db}=copilotServices(),connection=await db.doc('copilotPrivate/'+user.uid+'/integrations/gmail').get();
   if(!connection.exists||connection.data()?.workspaceUid!==user.ownerUid)
    throw new CopilotError(409,'Conecte a conta Gmail desta agência antes de enviar.');
   const dedupe=db.doc('copilotMailRequests/'+user.uid+'/actions/'+requestId);
   await db.runTransaction(async tx=>{
    const current=await tx.get(dedupe);
    if(current.exists)throw new CopilotError(409,
      'Este envio já foi processado ou iniciado. Verifique os e-mails enviados antes de tentar de novo.');
    tx.create(dedupe,{uid:user.uid,workspaceUid:user.ownerUid,
      toHash:digest(to),status:'processing',createdAt:new Date().toISOString()});
   });
   // Never repeat a send if Google's response is ambiguous.
   try{
    const access=await issueAccessToken(decryption(String(connection.data()?.refreshCipher||''),user.uid));
    const normalizedSubject='=?UTF-8?B?'+Buffer.from(subject).toString('base64')+'?=';
    const raw=['To: '+to,'Subject: '+normalizedSubject,'MIME-Version: 1.0',
      'Content-Type: text/plain; charset="UTF-8"','Content-Transfer-Encoding: 8bit',
      '',body.replace(/\r/g,'')].join('\r\n');
    const response=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{
     method:'POST',headers:{Authorization:'Bearer '+access,'Content-Type':'application/json'},
     body:JSON.stringify({raw:Buffer.from(raw,'utf8').toString('base64url')}),
    });
    if(!response.ok)throw new CopilotError(502,
      response.status===403?'O Google recusou o envio. Verifique a permissão gmail.send.':'O Gmail não confirmou o envio; verifique a pasta Enviados.');
    const sent:any=await response.json();
    if(!sent.id)throw new CopilotError(502,'O Gmail não confirmou um identificador para a mensagem.');
    await dedupe.update({status:'sent',messageId:String(sent.id),sentAt:new Date().toISOString()});
    res.json({success:true,messageId:String(sent.id),sender:String(connection.data()?.email||'')});
   }catch(error){
    await dedupe.update({status:'uncertain',error:error instanceof Error?error.message.slice(0,180):'error'}).catch(()=>{});
    throw error;
   }
  }catch(error){formatCopilotError(res,error);}
 });
}

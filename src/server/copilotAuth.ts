import { createHmac, timingSafeEqual } from 'node:crypto';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export class CopilotError extends Error {
 constructor(public status: number,message: string){super(message);}
}
export function copilotServices(){
 const secret=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
 if(!secret)throw new CopilotError(503,'Firebase Admin ainda não está configurado.');
 const app=getApps().find(a=>a.name==='agencyos-admin')||
  initializeApp({credential:cert(JSON.parse(secret)),projectId:'agencyos-1c3fc'},'agencyos-admin');
 return {db:getFirestore(app),auth:getAuth(app)};
}
function verifiedLegacyClaim(doc:Record<string,unknown>|undefined,oldUid:string,uid:string,email:string){
 if(!doc||doc.claimantUid!==uid||doc.verifiedEmail!==email)return false;
 const secret=JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'{}').private_key;
 if(!secret)return false;
 const sign=createHmac('sha256',secret).update(['agencyos-legacy-workspace-v1',oldUid,uid,email].join('\u0000')).digest('hex');
 const a=Buffer.from(String(doc.signature||''),'hex'),b=Buffer.from(sign,'hex');
 return a.length===b.length&&timingSafeEqual(a,b);
}
export type AgencyIdentity = {uid:string;ownerUid:string;agencyName:string;role:'owner'|'employee';
  modules:string[];email:string;displayName:string};
export async function authenticateCopilot(authorization:string|undefined):Promise<AgencyIdentity>{
 if(!authorization?.startsWith('Bearer '))throw new CopilotError(401,'Entre na sua conta para usar a IA.');
 const {db,auth}=copilotServices();
 const decoded=await auth.verifyIdToken(authorization.slice(7),true);
 const snap=await db.doc('users/'+decoded.uid).get();
 if(!snap.exists)throw new CopilotError(403,'Sua conta ainda não tem um workspace válido.');
 const profile=snap.data()||{};
 if(['blocked','cancelled'].includes(profile.status))throw new CopilotError(403,'A conta está desativada.');
 const linked=typeof profile.agencyOwnerUid==='string'?profile.agencyOwnerUid.trim():'';
 const external=linked&&linked!==decoded.uid&&linked!=='agency-master-owner';
 let ownerUid=decoded.uid,role:'owner'|'employee'='owner';
 if(external){
  const claim=await db.doc('verifiedLegacyWorkspaceClaims/'+linked).get();
  const email=String(decoded.email||'').toLowerCase().trim();
  if(verifiedLegacyClaim(claim.data(),linked,decoded.uid,email)){
   ownerUid=linked;role='owner';
  }else{
   // Employees may only read the company to which they have a verified
   // explicit membership. A self-editable arbitrary owner UID is insufficient.
   const membership=await db.doc('copilotMemberships/'+decoded.uid).get();
   const proof=membership.data()||{};
   const privateKey=JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'{}').private_key;
   const expected=privateKey?createHmac('sha256',privateKey)
    .update(['agencyos-copilot-member-v1',decoded.uid,linked].join('\u0000')).digest('hex'):'';
   const signature=String(proof.signature||'');
   const a=Buffer.from(signature,'hex'),b=Buffer.from(expected,'hex');
   const verified=proof.uid===decoded.uid&&proof.ownerUid===linked&&
    b.length>0&&a.length===b.length&&timingSafeEqual(a,b);
   const owner=await db.doc('users/'+linked).get();
   if(!verified||!owner.exists||profile.userType!=='employee')
    throw new CopilotError(403,'Sua conta ainda precisa ser autorizada pelo responsável da agência para acessar os dados na IA.');
   ownerUid=linked;role='employee';
  }
 }
 const ownerDoc=await db.doc('users/'+ownerUid).get();
 if(!ownerDoc.exists)throw new CopilotError(403,'Workspace da agência não encontrado.');
 const name=String(ownerDoc.data()?.agencyName||profile.agencyName||'Agência');
 return {uid:decoded.uid,ownerUid,role,agencyName:name.slice(0,100),
   modules:Array.isArray(profile.allowedModules)?profile.allowedModules.filter((v:unknown)=>typeof v==='string'):[],
   email:String(decoded.email||''),displayName:String(profile.name||decoded.name||'Gestor').slice(0,100)};
}
export function canReadModule(identity:AgencyIdentity,module:string){
 return identity.role==='owner'||identity.modules.includes(module);
}
export function formatCopilotError(res:any,error:unknown){
 if(error instanceof CopilotError)return res.status(error.status).json({error:error.message});
 console.error('Agency Copilot:',error instanceof Error?error.message:'Unexpected error');
 return res.status(500).json({error:'Não foi possível concluir a operação da IA. Tente novamente.'});
}

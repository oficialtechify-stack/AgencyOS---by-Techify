/**
 * Private AgencyOS -> Hermes Agent bridge.
 * Hermes MUST be an independently hosted, isolated, hardened gateway.
 * Never put API_SERVER_KEY in VITE_* or browser code.
 * The gateway's default toolset can use terminal/network; users must not
 * share a Hermes runtime across untrusted AgencyOS tenants.
 * Ref: https://github.com/NousResearch/hermes-agent
 */
import { authenticateCopilot, CopilotError, type AgencyIdentity } from './copilotAuth.js';

type ChatInput = {role: string;content: string};
export type HermesResult = {text:string;provider:'Hermes Agent'};
export type HermesConfig = {available:boolean;configured:boolean;reason:string};

function endpoint():URL|null{
 const raw=(process.env.HERMES_AGENT_URL||'').trim();
 if(!raw)return null;
 try {
  const u=new URL(raw);
  if(u.protocol!=='https:'||!u.hostname||u.username||u.password||u.search||u.hash) return null;
  if(!['/','/v1','/v1/'].includes(u.pathname))return null;
  if(/^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.|::1$|.*\.local$)/i.test(u.hostname))return null;
  return new URL('/v1/chat/completions',u.origin);
 }catch{return null;}
}
export function hermesAvailability(user:AgencyIdentity):HermesConfig {
 const configured=Boolean(endpoint()&&(process.env.HERMES_AGENT_API_KEY||'').trim()&&(process.env.HERMES_AGENCY_OWNER_UID||'').trim());
 if(!configured)return {configured:false,available:false,reason:'Servidor Hermes não configurado. É necessário conectar uma instância dedicada e sua chave de API.'};
 if(user.role!=='owner'||user.uid!==user.ownerUid||user.ownerUid!==process.env.HERMES_AGENCY_OWNER_UID)
  return {configured:true,available:false,reason:'Hermes está reservado ao administrador proprietário da agência autorizada. Outros workspaces precisam de uma instância isolada.'};
 return {configured:true,available:true,reason:'Conector configurado para esta agência. A conectividade será verificada no primeiro envio.'};
}
export async function hermesReply(identity:AgencyIdentity,system:string,messages:ChatInput[]):Promise<HermesResult>{
 const availability=hermesAvailability(identity);
 if(!availability.available)throw new CopilotError(503,availability.reason);
 const url=endpoint();
 if(!url)throw new CopilotError(503,'URL Hermes inválida; use HTTPS com domínio público seguro.');
 // This API is stateless: pass only the authorized AgencyOS context and the
 // conversation history belonging to the current Firebase user.
 const payload={model:'hermes-agent',stream:false,
  messages:[{role:'system',content:system.slice(0,16500)},...messages.slice(-13).map(m=>({
   role:m.role==='assistant'?'assistant':'user',content:String(m.content).slice(0,2200)
  }))]};
 let response:Response;
 try{
  response=await fetch(url.href,{method:'POST',redirect:'error',signal:AbortSignal.timeout(45000),
   headers:{Authorization:'Bearer '+process.env.HERMES_AGENT_API_KEY,'Content-Type':'application/json'},
   body:JSON.stringify(payload)});
 }catch{
  throw new CopilotError(502,'Não foi possível conectar ao servidor Hermes. Confira se ele está online e acessível por HTTPS.');
 }
 if(response.status===401||response.status===403)
  throw new CopilotError(503,'O servidor Hermes recusou a chave privada da conexão.');
 if(!response.ok)throw new CopilotError(502,'Hermes não concluiu esta solicitação. Verifique os logs do agente.');
 const result:any=await response.json().catch(()=>null);
 if(!result||!Array.isArray(result.choices))throw new CopilotError(502,'Resposta Hermes fora do formato esperado.');
 const choice=result.choices[0];
 if(choice?.finish_reason==='error')throw new CopilotError(502,'O Hermes informou falha durante a execução.');
 const content=choice?.message?.content;
 const answer=typeof content==='string'?content:
  Array.isArray(content)?content.filter(v=>v?.type==='text'&&typeof v.text==='string').map(v=>v.text).join('\n'):'';
 if(!answer.trim())throw new CopilotError(502,'Hermes não retornou uma resposta válida.');
 return {text:answer.slice(0,16000),provider:'Hermes Agent'};
}

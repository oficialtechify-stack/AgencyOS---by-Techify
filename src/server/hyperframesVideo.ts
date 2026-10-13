import type { Express } from 'express';
import { strToU8, zipSync } from 'fflate';
import { GoogleGenAI } from '@google/genai';
import { authenticateCopilot, copilotServices, canReadModule, CopilotError, formatCopilotError } from './copilotAuth.js';

type Aspect='9:16'|'1:1'|'16:9';
type Scene={heading:string;caption:string;accent:string};
type Project={title:string;brief:string;aspect:Aspect;duration:number;style:string;scenes:Scene[];html:string;status:string;createdAt:string;renderId?:string;revision:number};
const dimensions:Record<Aspect,[number,number]>={'9:16':[1080,1920],'1:1':[1080,1080],'16:9':[1920,1080]};
const colors:Record<string,[string,string,string]>={
 'Roxo premium':['#0D0821','#351A60','#BA90FF'],
 'Azul neon':['#070D21','#152D64','#58BBFF'],
 'Preto e dourado':['#111111','#302319','#FFD68A'],
 'Minimalista':['#0F1729','#223A50','#A5D9FF']
};
const clean=(value:unknown,max:number)=>typeof value==='string'?value.trim().slice(0,max):'';
export const htmlEscape=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
export function validateScenes(value:unknown):Scene[]{
 if(!Array.isArray(value)||value.length<2||value.length>7)throw new CopilotError(422,'A IA retornou um roteiro inválido.');
 return value.map(row=>{
  const heading=clean(row?.heading,85),caption=clean(row?.caption,180),accent=clean(row?.accent,45);
  if(!heading||!caption)throw new CopilotError(422,'A IA retornou uma cena incompleta.');
  return {heading,caption,accent};
 });
}
export function buildHyperframesHtml(scenes:Scene[],aspect:Aspect,duration:number,style:string,title:string):string{
 if(!dimensions[aspect]||!Number.isInteger(duration)||duration<6||duration>40)throw new CopilotError(400,'Formato ou duração inválidos.');
 const [w,h]=dimensions[aspect],palette=colors[style]||colors['Roxo premium'];
 const clipDuration=duration/scenes.length;
 const opening=[
  '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">',
  '<meta name="viewport" content="width='+w+',height='+h+'">',
  '<title>'+htmlEscape(title)+'</title>',
  '<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>',
  '<style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:'+palette[0]+';color:white;font-family:Arial,Helvetica,sans-serif}',
  '#root{position:relative;width:100%;height:100%;overflow:hidden;background:linear-gradient(135deg,'+palette[0]+','+palette[1]+')}',
  '.clip{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden}',
  '.orb{position:absolute;border-radius:100%;width:75%;aspect-ratio:1;right:-30%;top:-20%;background:'+palette[2]+';filter:blur(20px);opacity:.13}',
  '.content{position:relative;width:86%;z-index:1;display:flex;flex-direction:column;gap:28px}',
  '.tag{border:2px solid '+palette[2]+';color:'+palette[2]+';padding:12px 24px;border-radius:100px;font-size:clamp(20px,2.2vw,38px);letter-spacing:4px;max-width:max-content}',
  'h1{font-size:clamp(66px,8vw,152px);font-weight:900;line-height:1.05;letter-spacing:-.05em;overflow-wrap:anywhere;margin:0}',
  'p{font-size:clamp(29px,3vw,53px);line-height:1.32;overflow-wrap:anywhere;max-width:92%;opacity:.85;margin:0}',
  '.bar{height:8px;width:100%;border-radius:8px;background:'+palette[2]+'}',
  '.footer{position:absolute;bottom:5%;left:7%;right:7%;font-size:22px;letter-spacing:3px;opacity:.55;display:flex;justify-content:space-between}',
  '</style></head><body>',
  '<div id="root" data-composition-id="main" data-width="'+w+'" data-height="'+h+'" data-start="0" data-duration="'+duration+'">'
 ];
 const clips=scenes.map((scene,i)=>{
  const start=(i*clipDuration).toFixed(3),length=(duration-i*clipDuration>clipDuration?clipDuration:duration-i*clipDuration).toFixed(3);
  return '<section id="scene-'+i+'" class="clip" data-start="'+start+'" data-duration="'+length+'">'+
    '<div class="orb"></div><div class="content"><div class="tag" id="tag-'+i+'">'+htmlEscape(scene.accent||'AGENCYOS')+'</div>'+
    '<h1 id="heading-'+i+'">'+htmlEscape(scene.heading)+'</h1><p id="caption-'+i+'">'+htmlEscape(scene.caption)+'</p>'+
    '<div class="bar" id="bar-'+i+'"></div></div><div class="footer"><span>'+htmlEscape(title)+'</span><span>'+(i+1)+' / '+scenes.length+'</span></div></section>';
 }).join('\n');
 const motion=scenes.map((_scene,i)=>{
  const t=(i*clipDuration).toFixed(2);
  return 'tl.fromTo("#heading-'+i+'",{opacity:0,y:60},{opacity:1,y:0,duration:.7,ease:"power3.out"},'+t+');'+
   'tl.fromTo("#caption-'+i+'",{opacity:0,y:35},{opacity:1,y:0,duration:.6,ease:"power2.out"},'+(i*clipDuration+.3).toFixed(2)+');'+
   'tl.fromTo("#tag-'+i+'",{opacity:0},{opacity:1,duration:.35},'+(i*clipDuration+.1).toFixed(2)+');'+
   'tl.fromTo("#bar-'+i+'",{scaleX:0,transformOrigin:"left center"},{scaleX:1,duration:'+(clipDuration-.35).toFixed(2)+',ease:"none"},'+(i*clipDuration+.15).toFixed(2)+');';
 }).join('\n');
 return opening.join('')+clips+'</div><script>window.__timelines=window.__timelines||{};'+
  'const tl=gsap.timeline({paused:true});'+motion+'window.__timelines["main"]=tl;</script></body></html>';
}
const validId=(id:string)=>/^[a-zA-Z0-9_-]{14,70}$/.test(id);
function cloudKey(){const key=process.env.HEYGEN_API_KEY||process.env.HYPERFRAMES_API_KEY;
 if(!key)throw new CopilotError(503,'Render MP4 pendente: configure HEYGEN_API_KEY em Production na Vercel. A exportação HTML funciona sem chave.');
 return key;
}
async function heygen(method:'POST'|'GET',path:string,key:string,body?:unknown,idem?:string){
 const response=await fetch('https://api.heygen.com'+path,{method,signal:AbortSignal.timeout(26000),
 headers:{'x-api-key':key,'Content-Type':'application/json',...(idem?{'Idempotency-Key':idem}:{})},
 ...(body?{body:JSON.stringify(body)}:{})});
 if(!response.ok)throw new CopilotError(response.status===401||response.status===403?503:502,
 'A HeyGen não confirmou a operação. Verifique a chave, créditos e histórico de renderização antes de tentar novamente.');
 const value:any=await response.json();
 return value?.data||value;
}
async function createStoryboard(brief:string,aspect:Aspect,duration:number){
 const prompt='Crie cenas de motion graphics para um Reels profissional em português brasileiro sobre: '+brief+
 '. Aspecto '+aspect+', duração '+duration+' s. Retorne só JSON: {"title":"...","scenes":[{"heading":"...","caption":"...","accent":"..."}]}. '+
 'Crie 3 a 5 cenas, frases curtas e CTA ao final. Não invente métricas ou promessas. heading até 80 caracteres, caption até 170.';
 let content='';
 if(process.env.GEMINI_API_KEY){
  try{const client=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
   const result=await client.models.generateContent({model:'gemini-2.5-flash',contents:prompt,
    config:{responseMimeType:'application/json',temperature:.45}});
   content=result.text||'';
  }catch{console.warn('HyperFrames: Gemini temporarily unavailable');}
 }
 if(!content&&process.env.GROQ_API_KEY){
  const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',
   headers:{Authorization:'Bearer '+process.env.GROQ_API_KEY,'Content-Type':'application/json'},
   signal:AbortSignal.timeout(23000),
   body:JSON.stringify({model:'llama-3.3-70b-versatile',response_format:{type:'json_object'},
    messages:[{role:'user',content:prompt}],max_tokens:1250})});
  if(r.ok){const d:any=await r.json();content=d.choices?.[0]?.message?.content||'';}
 }
 if(!content)throw new CopilotError(503,'A geração de vídeo está indisponível. Verifique Gemini e Groq.');
 try{const parsed=JSON.parse(content);return {title:clean(parsed.title,75)||brief.slice(0,65),
  scenes:validateScenes(parsed.scenes)};}
 catch{throw new CopilotError(502,'A IA não retornou um roteiro válido. Tente gerar novamente.');}
}
export function registerHyperframesRoutes(app:Express){
 const guard=async(req:any)=>{
  const u=await authenticateCopilot(req.headers.authorization);
  if(!canReadModule(u,'social-hub'))throw new CopilotError(403,'Seu perfil não tem acesso à aba Redes sociais.');
  return u;
 };
 const path=(uid:string)=>'socialWorkspaces/'+uid+'/hyperframesProjects';
 const publicData=(d:FirebaseFirestore.DocumentSnapshot)=>({id:d.id,...d.data()});
 app.get('/api/social/hyperframes/config',async(req,res)=>{
  try{await guard(req);res.json({renderReady:!!(process.env.HEYGEN_API_KEY||process.env.HYPERFRAMES_API_KEY),
   source:'https://github.com/heygen-com/hyperframes',license:'Apache-2.0',cloud:'HeyGen',mayCost:true});}
  catch(e){formatCopilotError(res,e);}
 });
 app.get('/api/social/hyperframes/projects',async(req,res)=>{
  try{const u=await guard(req),docs=await copilotServices().db.collection(path(u.ownerUid)).orderBy('createdAt','desc').limit(16).get();
   res.set('Cache-Control','private, no-store');res.json({projects:docs.docs.map(publicData)});}
  catch(e){formatCopilotError(res,e);}
 });
 app.post('/api/social/hyperframes/generate',async(req,res)=>{
  try{
   const u=await guard(req),brief=clean(req.body?.brief,1000),aspect=req.body?.aspect as Aspect,
    duration=Number(req.body?.duration),style=clean(req.body?.style,80);
   if(brief.length<10||!dimensions[aspect]||!Number.isInteger(duration)||duration<6||duration>40)
    throw new CopilotError(400,'Informe uma descrição de pelo menos 10 caracteres, formato e duração de 6 a 40 segundos.');
   const {db}=copilotServices();
   const day=new Date().toISOString().slice(0,10).replace(/-/g,'');
   const meter=db.doc('hyperframesDailyUsage/'+u.uid+'/days/'+day);
   await db.runTransaction(async tx=>{
    const snap=await tx.get(meter),used=Number(snap.data()?.generated||0);
    if(used>=20)throw new CopilotError(429,'Você atingiu o limite diário de 20 projetos de vídeo.');
    tx.set(meter,{generated:used+1,workspaceUid:u.ownerUid,updatedAt:new Date().toISOString()},{merge:true});
   });
   const storyboard=await createStoryboard(brief,aspect,duration);
   const project:Project={title:storyboard.title,brief,aspect,duration,
    style:colors[style]?style:'Roxo premium',scenes:storyboard.scenes,
    html:buildHyperframesHtml(storyboard.scenes,aspect,duration,style,storyboard.title),
    status:'draft',createdAt:new Date().toISOString(),revision:1};
   const ref=copilotServices().db.collection(path(u.ownerUid)).doc();
   await ref.set({...project,creatorUid:u.uid});
   res.status(201).json({project:{id:ref.id,...project}});
  }catch(e){formatCopilotError(res,e);}
 });
 app.post('/api/social/hyperframes/:id/render',async(req,res)=>{
  try{
   const u=await guard(req);
   if(u.role!=='owner')throw new CopilotError(403,'Somente o responsável pela agência pode autorizar o uso de créditos HeyGen.');
   if(req.body?.confirm!==true)throw new CopilotError(400,'Confirme o custo da renderização.');
   const key=cloudKey(),id=String(req.params.id);
   if(!validId(id))throw new CopilotError(400,'Projeto inválido.');
   const db=copilotServices().db,ref=db.doc(path(u.ownerUid)+'/'+id);
   const today=new Date().toISOString().slice(0,10).replace(/-/g,'');
   const daily=db.doc('hyperframesRenderBudgets/'+u.ownerUid+'/days/'+today);
   const data=await db.runTransaction(async tx=>{
    const budget=await tx.get(daily);
    const used=Number(budget.data()?.submitted||0);
    if(used>=3)throw new CopilotError(429,'Limite diário de três renderizações atingido. Evite custos inesperados.');
    const doc=await tx.get(ref);
    if(!doc.exists)throw new CopilotError(404,'Projeto não encontrado.');
    const value=doc.data()||{};
    if(['submitting','queued','rendering','completed','uncertain'].includes(value.status))
     throw new CopilotError(409,'Este vídeo já foi solicitado. Confira o andamento antes de tentar novamente.');
    tx.update(ref,{status:'submitting',updatedAt:new Date().toISOString()});
    tx.set(daily,{submitted:used+1,ownerUid:u.ownerUid,updatedAt:new Date().toISOString()},{merge:true});
    tx.set(db.collection('hyperframesRenderAudit').doc(),{
      ownerUid:u.ownerUid,actorUid:u.uid,projectId:id,action:'render.requested',
      createdAt:new Date().toISOString(),
    });
    return value;
   });
   try{
    const zip=zipSync({'index.html':strToU8(String(data.html))},{level:6});
    const result=await heygen('POST','/v3/hyperframes/renders',key,{
     project:{type:'base64',media_type:'application/zip',data:Buffer.from(zip).toString('base64')},
     composition:'index.html',fps:30,quality:'standard',format:'mp4',resolution:'1080p',
     aspect_ratio:data.aspect,title:clean(data.title,85)
    },'agencyos-hf-'+id+'-'+String(data.revision||1));
    if(!result.render_id)throw new CopilotError(502,'A HeyGen não retornou um ID de renderização.');
    await ref.update({status:'queued',renderId:result.render_id,updatedAt:new Date().toISOString()});
    res.json({status:'queued',renderId:result.render_id});
   }catch(e){
    await ref.update({status:'uncertain',error:'Pedido de renderização não confirmado. Confira o histórico na HeyGen antes de repetir.'});
    throw e;
   }
  }catch(e){formatCopilotError(res,e);}
 });
 app.get('/api/social/hyperframes/:id/status',async(req,res)=>{
  try{
   const u=await guard(req),id=String(req.params.id);
   if(!validId(id))throw new CopilotError(400,'Projeto inválido.');
   const ref=copilotServices().db.doc(path(u.ownerUid)+'/'+id),doc=await ref.get();
   if(!doc.exists)throw new CopilotError(404,'Projeto não encontrado.');
   const d=doc.data()||{};
   if(!d.renderId){res.json({status:d.status||'draft'});return;}
   if(!/^hfr_[A-Za-z0-9_-]+$/.test(d.renderId))throw new CopilotError(502,'Identificador HeyGen inválido.');
   const result=await heygen('GET','/v3/hyperframes/renders/'+d.renderId,cloudKey());
   if(['queued','rendering','completed','failed'].includes(result.status)&&result.status!==d.status)
    await ref.update({status:result.status,updatedAt:new Date().toISOString()});
   res.set('Cache-Control','private, no-store');
   res.json({status:result.status,renderId:d.renderId,
    videoUrl:result.status==='completed'?result.video_url:null,
    thumbnailUrl:result.status==='completed'?result.thumbnail_url:null,
    error:result.status==='failed'?'A HeyGen informou falha na renderização.':null});
  }catch(e){formatCopilotError(res,e);}
 });
}

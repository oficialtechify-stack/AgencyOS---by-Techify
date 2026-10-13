import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { auth } from '../../lib/firebase';
import { Clapperboard, Sparkles, Film, Download, Play, CircleCheck, Clock,
 Loader2, ExternalLink, AlertCircle, RefreshCw, ShieldCheck, ChevronDown } from 'lucide-react';

type Scene={heading:string;caption:string;accent:string};
type Project={id:string;title:string;brief:string;style:string;aspect:'9:16'|'1:1'|'16:9';
 duration:number;scenes:Scene[];html:string;status:string;createdAt:string;renderId?:string};
type Configuration={renderReady:boolean;source:string;license:string;cloud:string;mayCost:boolean};
const panel='rounded-[22px] border border-[#263D64] bg-[#0D192E] p-5 sm:p-6';
const control='w-full rounded-xl bg-[#081529] border border-[#30486F] px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-400 placeholder-slate-500';
const secondary='inline-flex items-center justify-center gap-2 text-xs font-semibold rounded-xl border border-[#34517B] text-slate-200 px-4 py-2.5 hover:bg-[#1B3050] disabled:opacity-40';
const primary='inline-flex items-center justify-center gap-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 disabled:opacity-40';
async function request(path:string,options:RequestInit={}){
 await auth.authStateReady();
 const user=auth.currentUser;
 if(!user)throw Error('Entre na sua conta AgencyOS para usar o HyperFrames.');
 const token=await user.getIdToken();
 const result=await fetch('/api/social/hyperframes/'+path,{...options,
  headers:{'Content-Type':'application/json',Authorization:'Bearer '+token,...options.headers}});
 const value=await result.json().catch(()=>({}));
 if(!result.ok)throw Error(value.error||'Operação HyperFrames não concluída.');
 return value;
}
function exportProject(project:Project){
 const blob=new Blob([project.html],{type:'text/html;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const anchor=document.createElement('a');
 anchor.href=url;
 anchor.download='hyperframes-'+project.id+'.html';
 anchor.click();
 URL.revokeObjectURL(url);
}
export const HyperframesVideoStudio:React.FC=()=>{
 const [brief,setBrief]=useState('');
 const [style,setStyle]=useState('Roxo premium');
 const [aspect,setAspect]=useState<'9:16'|'1:1'|'16:9'>('9:16');
 const [duration,setDuration]=useState(15);
 const [config,setConfig]=useState<Configuration|null>(null);
 const [projects,setProjects]=useState<Project[]>([]);
 const [selected,setSelected]=useState<Project|null>(null);
 const [status,setStatus]=useState('');
 const [busy,setBusy]=useState('');
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [videoUrl,setVideoUrl]=useState('');
 const load=useCallback(async()=>{
  try{
   const [c,p]=await Promise.all([request('config'),request('projects')]);
   setConfig(c);setProjects(Array.isArray(p.projects)?p.projects:[]);
  }catch(e:any){setError(e.message);}
 },[]);
 useEffect(()=>{void load();},[load]);
 const make=async()=>{
  if(brief.trim().length<10||busy)return;
  setBusy('generate');setError('');setNotice('');setVideoUrl('');
  try{
   const data=await request('generate',{method:'POST',body:JSON.stringify({brief,aspect,duration,style})});
   const project=data.project as Project;
   setSelected(project);setStatus('draft');
   setProjects(old=>[project,...old].slice(0,16));
   setNotice('Roteiro e composição HyperFrames salvos no Firebase. Revise a prévia antes de renderizar.');
  }catch(e:any){setError(e.message);}
  finally{setBusy('');}
 };
 const render=async()=>{
  if(!selected||busy||!config?.renderReady)return;
  if(!window.confirm('A renderização MP4 usa créditos da HeyGen e pode gerar cobrança. Deseja solicitar este vídeo agora?'))return;
  setBusy('render');setError('');setNotice('');
  try{
   const r=await request(selected.id+'/render',{method:'POST',body:JSON.stringify({confirm:true})});
   setStatus(r.status);setNotice('Renderização solicitada à HeyGen. Clique em Atualizar render para acompanhar.');
  }catch(e:any){setError(e.message);}
  finally{setBusy('');}
 };
 const check=async()=>{
  if(!selected||busy)return;
  setBusy('status');setError('');
  try{
   const r=await request(selected.id+'/status');
   setStatus(r.status);setVideoUrl(r.videoUrl||'');
   if(r.status==='completed')setNotice('A HeyGen concluiu o MP4. Abra o arquivo para conferir.');
   if(r.status==='failed')setError(r.error||'A renderização falhou na HeyGen.');
  }catch(e:any){setError(e.message);}
  finally{setBusy('');}
 };
 const preview=useMemo(()=>{
  if(!selected?.html)return '';
  // Sandbox without allow-same-origin prevents generated content from
  // accessing AgencyOS cookies, Firebase tokens or parent storage.
  return selected.html.replace('</body>',
   '<script>window.addEventListener("load",function(){if(window.__timelines&&window.__timelines.main){window.__timelines.main.play(0);}});</script></body>');
 },[selected]);
 return <div className="space-y-5 text-slate-100">
  <section className="rounded-[24px] p-5 sm:p-6 border border-blue-500/30 bg-gradient-to-r from-[#132956] to-[#191435] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
   <div className="space-y-2">
    <div className="text-blue-200 uppercase tracking-[.15em] text-[10px] font-bold flex items-center gap-2"><Film className="w-4 h-4"/>Estúdio de vídeo com inteligência artificial</div>
    <h3 className="text-xl sm:text-2xl font-bold text-white">Vídeos com IA · HyperFrames</h3>
    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">Crie cenas animadas para Reels, Stories, anúncios e apresentações usando composições do HyperFrames. A IA prepara o roteiro e os visuais; você revisa e decide quando renderizar.</p>
   </div>
   <a href="https://github.com/heygen-com/hyperframes" target="_blank" rel="noopener noreferrer" className={secondary}><ExternalLink className="w-4 h-4"/>Código oficial</a>
  </section>
  {error&&<div role="alert" className="border border-rose-500/30 bg-rose-950/25 text-rose-200 rounded-xl p-3 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0"/>{error}</div>}
  {notice&&<div role="status" className="border border-emerald-500/30 bg-emerald-950/20 text-emerald-200 rounded-xl p-3 text-xs flex items-center gap-2"><CircleCheck className="w-4 h-4 shrink-0"/>{notice}</div>}
  <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
   <div className="xl:col-span-5 space-y-5">
    <section className={panel+' space-y-4'}>
     <h4 className="text-sm font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-400"/>Criar vídeo com a IA</h4>
     <label className="block text-xs font-semibold text-slate-300 space-y-2">Explique o vídeo
      <textarea rows={5} className={control} value={brief} onChange={e=>setBrief(e.target.value)}
       placeholder="Ex.: vídeo de 15 segundos apresentando os benefícios do nosso serviço de criação de sites. Estilo premium, com CTA ao final."/>
     </label>
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <label className="space-y-2 text-xs text-slate-300">Formato<select className={control} value={aspect} onChange={e=>setAspect(e.target.value as typeof aspect)}>
       <option value="9:16">Vertical 9:16 (Reels)</option><option value="1:1">Quadrado 1:1</option><option value="16:9">Horizontal 16:9</option>
      </select></label>
      <label className="space-y-2 text-xs text-slate-300">Visual<select className={control} value={style} onChange={e=>setStyle(e.target.value)}>
       {['Roxo premium','Azul neon','Preto e dourado','Minimalista'].map(x=><option key={x}>{x}</option>)}
      </select></label>
      <label className="space-y-2 text-xs text-slate-300 sm:col-span-2">Duração<select className={control} value={duration} onChange={e=>setDuration(Number(e.target.value))}>
       {[9,12,15,20,30].map(x=><option value={x} key={x}>{x} segundos</option>)}
      </select></label>
     </div>
     <button className={primary+' w-full'} onClick={()=>void make()} disabled={busy!==''||brief.trim().length<10}>
      {busy==='generate'?<Loader2 className="w-4 h-4 animate-spin"/>:<Sparkles className="w-4 h-4"/>}
      {busy==='generate'?'Criando cenas reais...':'Gerar roteiro e animação'}
     </button>
     <p className="text-[11px] text-slate-500 leading-relaxed">O vídeo é uma composição HTML + animações compatível com o HyperFrames. O MP4 depende do renderizador HeyGen, que pode consumir créditos.</p>
    </section>
    <section className={panel+' space-y-3'}>
     <div className="flex items-center justify-between"><h4 className="text-sm font-bold">Projetos desta agência</h4><button className={secondary} title="Atualizar projetos" onClick={()=>void load()}><RefreshCw className="w-4 h-4"/></button></div>
     {projects.length===0?<p className="text-xs text-slate-400">Nenhum vídeo criado ainda. Seus projetos aparecerão aqui após a geração.</p>:
     <div className="max-h-64 overflow-y-auto space-y-2">
      {projects.map(p=><button key={p.id} onClick={()=>{setSelected(p);setStatus(p.status);setVideoUrl('');}}
       className={'text-left block w-full rounded-xl px-3 py-3 border text-xs '+(selected?.id===p.id?'bg-[#213E70] border-blue-400/50':'bg-[#101F37] border-[#2C4267] hover:bg-[#193054]')}>
       <span className="font-semibold text-slate-100 block truncate">{p.title}</span>
       <span className="text-slate-400 text-[11px]">{p.aspect} · {p.duration}s · {p.status||'draft'}</span>
      </button>)}
     </div>}
    </section>
   </div>
   <div className="xl:col-span-7 space-y-5">
    <section className={panel+' space-y-4'}>
     <div className="flex flex-wrap gap-3 items-center justify-between">
      <h4 className="text-sm font-bold flex items-center gap-2"><Play className="w-4 h-4 text-blue-400"/>Prévia do projeto</h4>
      {selected&&<span className="text-[11px] text-slate-400">{selected.aspect} · {selected.duration} segundos</span>}
     </div>
     <div className="min-h-[280px] flex items-center justify-center rounded-2xl bg-[#070D1B] border border-[#274064] overflow-hidden p-3">
      {selected?
       <iframe title="Prévia isolada do vídeo HyperFrames" sandbox="allow-scripts" srcDoc={preview}
        className="border-0 bg-[#101020] w-full max-w-[500px] aspect-[9/16] rounded-xl shadow-2xl"
        style={{aspectRatio:selected.aspect==='9:16'?'9/16':selected.aspect==='16:9'?'16/9':'1/1'}}/>
       :<div className="text-center text-slate-500 text-sm p-10"><Clapperboard className="w-12 h-12 mx-auto mb-3"/>Gere ou selecione um projeto para ver a animação.</div>}
     </div>
     {selected&&<>
      <p className="text-[11px] text-slate-400">Prévia no navegador. A saída MP4 oficial só estará disponível após renderização concluída na HeyGen.</p>
      <div className="flex flex-wrap gap-2">
       <button className={secondary} onClick={()=>exportProject(selected)}><Download className="w-4 h-4"/>Baixar projeto HTML</button>
       <button className={primary} disabled={!config?.renderReady||busy!==''||['submitting','queued','rendering','completed','uncertain'].includes(status)}
        onClick={()=>void render()}><Film className="w-4 h-4"/>Renderizar MP4</button>
       {selected&&<button className={secondary} onClick={()=>void check()} disabled={busy!==''}>
        {busy==='status'?<Loader2 className="w-4 h-4 animate-spin"/>:<RefreshCw className="w-4 h-4"/>}Atualizar render</button>}
      </div>
      {videoUrl&&<a className={primary} href={videoUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4"/>Abrir vídeo MP4 concluído</a>}
      {!config?.renderReady&&<div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-amber-200 text-xs">
       Para renderizar MP4 na nuvem, configure HEYGEN_API_KEY na Vercel. A geração, prévia e exportação HTML continuam disponíveis.
      </div>}
     </>}
    </section>
    {selected&&<section className={panel+' space-y-3'}>
     <h4 className="text-sm font-bold flex items-center gap-2"><Clapperboard className="w-4 h-4 text-blue-400"/>Roteiro gerado pela IA</h4>
     {selected.scenes.map((scene,i)=><div key={i} className="rounded-xl border border-[#2B4265] bg-[#0B1428] p-3">
      <span className="text-blue-400 text-[10px] font-bold uppercase tracking-wider">Cena {i+1} · {scene.accent||'Texto animado'}</span>
      <p className="font-bold text-sm mt-1">{scene.heading}</p><p className="text-xs text-slate-400 mt-1">{scene.caption}</p>
     </div>)}
    </section>}
   </div>
  </div>
  <div className="text-[11px] text-slate-500 flex items-center gap-2"><ShieldCheck className="w-4 h-4"/>Projetos separados por empresa, acesso Firebase autenticado e renderização cobrada somente após sua confirmação.</div>
 </div>;
};

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
 ArrowUp, Bot, BrainCircuit, Check, CheckCircle2, ChevronDown, Clock3,
 Copy, ExternalLink, FileText, History, Link2, Loader2, Mail, Menu,
 MessageSquare, Mic2, PanelLeftClose, Plus, Send, ShieldCheck, Sparkles,
 SquarePen, StopCircle, Trash2, Users, Wallet, X, ListTodo, Layers3
} from 'lucide-react';
import { auth } from '../lib/firebase';
import type { ViewType } from '../types';
type Engine='standard'|'hermes';
type EngineSettings={hermes:{configured:boolean;available:boolean;reason:string}};
type Role='user'|'assistant';
type Message={role:Role;content:string;createdAt?:string};
type Thread={id:string;title:string;updatedAt:string;engine?:Engine};
type Area='overview'|'sales'|'finance'|'operations'|'marketing'|'team';
type Context={agencyName:string;focus:Area;observedAt:string;recordsAreSamples:boolean;
 sections:Record<string,{visible:number;limited:boolean;records:unknown[]}>};
type Gmail={configured:boolean;connected:boolean;email:string|null;canSend:boolean};
const focusOptions:{id:Area;label:string;icon:typeof BrainCircuit}[]=[
 {id:'overview',label:'Visão geral',icon:Layers3},
 {id:'sales',label:'Clientes e vendas',icon:Users},
 {id:'finance',label:'Financeiro',icon:Wallet},
 {id:'operations',label:'Projetos',icon:ListTodo},
 {id:'marketing',label:'Marketing',icon:Sparkles},
 {id:'team',label:'Equipe',icon:ShieldCheck},
];
const destination:Record<Area,ViewType>={
 overview:'dashboard',sales:'prospection',finance:'fluxo-caixa',
 operations:'kanban',marketing:'marketing',team:'lideranca',
};
const quick=[
 {label:'Diagnóstico de escala',prompt:'Analise os dados reais disponíveis da minha agência e me dê 3 prioridades para escalar, separando fatos de hipóteses.',focus:'overview' as Area},
 {label:'Revisar financeiro',prompt:'Analise o financeiro registrado: entradas, saídas, riscos e próximos passos. Não invente valores nem confunda lançamentos com pagamentos confirmados.',focus:'finance' as Area},
 {label:'Melhorar vendas',prompt:'Veja minha prospecção e identifique ações para melhorar conversão e retenção, com base apenas nos registros disponíveis.',focus:'sales' as Area},
 {label:'Organizar entregas',prompt:'Analise os projetos e tarefas da agência e sugira uma ordem de prioridade com possíveis gargalos.',focus:'operations' as Area},
];
const actionBtn='inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 px-4 py-2.5 text-xs font-semibold text-white transition-colors';
const field='w-full rounded-xl border border-[#2C426A] bg-[#0C172D] px-3.5 py-3 text-sm text-white outline-none focus:border-blue-500 placeholder-[#7183A1]';
function RichText({text}:{text:string}){
 const lines=text.split('\n');
 const inline=(t:string)=>t.split(/(\*\*[^*]+\*\*)/g).map((part,i)=>
  part.startsWith('**')&&part.endsWith('**')?<strong key={i} className="font-bold text-slate-100">{part.slice(2,-2)}</strong>:<React.Fragment key={i}>{part}</React.Fragment>);
 return <div className="space-y-2 text-[13.5px] leading-7 text-[#D9E3F5] break-words">
  {lines.map((l,i)=>{
   const line=l.trim();
   if(!line)return <div key={i} className="h-1"/>;
   if(line.startsWith('### '))return <h4 key={i} className="font-bold text-white text-sm mt-3">{inline(line.slice(4))}</h4>;
   if(line.startsWith('## ')||line.startsWith('# '))return <h3 key={i} className="font-bold text-white text-[15px] mt-3">{inline(line.replace(/^#+\s*/,''))}</h3>;
   if(/^[-*]\s/.test(line))return <div key={i} className="pl-4 flex gap-2"><span className="text-blue-400">•</span><span>{inline(line.slice(2))}</span></div>;
   if(/^\d+[.)]\s/.test(line))return <div key={i} className="pl-2">{inline(line)}</div>;
   return <p key={i}>{inline(line)}</p>;
  })}
 </div>;
}
export const IAConsultoraView:React.FC<{onNavigate?:(view:ViewType)=>void}>=({onNavigate})=>{
 const [messages,setMessages]=useState<Message[]>([]);
 const [threads,setThreads]=useState<Thread[]>([]);
 const [threadId,setThreadId]=useState<string|null>(null);
 const [input,setInput]=useState('');
 const [focus,setFocus]=useState<Area>('overview');
 const [context,setContext]=useState<Context|null>(null);
 const [gmail,setGmail]=useState<Gmail|null>(null);
 const [loading,setLoading]=useState(false);
 const [loadingHistory,setLoadingHistory]=useState(false);
 const [sidebar,setSidebar]=useState(true);
 const [contextOpen,setContextOpen]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [provider,setProvider]=useState('');
 const [engine,setEngine]=useState<Engine>('standard');
 const [engineSettings,setEngineSettings]=useState<EngineSettings|null>(null);
 const [taskOpen,setTaskOpen]=useState(false);
 const [taskTitle,setTaskTitle]=useState('');
 const [taskDescription,setTaskDescription]=useState('');
 const [taskPriority,setTaskPriority]=useState<'Baixa'|'Média'|'Alta'>('Média');
 const [mailOpen,setMailOpen]=useState(false);
 const [mailTo,setMailTo]=useState('');
 const [mailSubject,setMailSubject]=useState('');
 const [mailBody,setMailBody]=useState('');
 const [mailGoal,setMailGoal]=useState('');
 const [speaking,setSpeaking]=useState(false);
 const [sendRequestId,setSendRequestId]=useState('');
 const bottom=useRef<HTMLDivElement|null>(null);
 const sending=useRef(false);
 const api=useCallback(async(path:string,options:RequestInit={})=>{
  await auth.authStateReady();
  const identity=auth.currentUser;
  if(!identity)throw Error('Faça login para usar a IA Consultora.');
  const token=await identity.getIdToken();
  const response=await fetch('/api/copilot/'+path,{
   ...options,
   headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',...options.headers}
  });
  const result=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(result.error||'Não foi possível concluir a operação.');
  return result;
 },[]);
 const refreshThreads=useCallback(async()=>{
  try{const d=await api('threads');setThreads(Array.isArray(d.threads)?d.threads:[]);}
  catch(e:any){setError(e.message);}
 },[api]);
 const refreshGmail=useCallback(async()=>{
  try{setGmail(await api('gmail/status'));}
  catch{setGmail(null);}
 },[api]);
 useEffect(()=>{void refreshThreads();void refreshGmail();},[refreshThreads,refreshGmail]);
 useEffect(()=>{
  let cancelled=false;
  void api('engines').then(d=>{if(!cancelled)setEngineSettings(d);})
   .catch(()=>{if(!cancelled)setEngineSettings(null);});
  return()=>{cancelled=true;};
 },[api]);
 useEffect(()=>{
  let cancelled=false;
  void api('context?focus='+focus).then(d=>{if(!cancelled)setContext(d.snapshot);}).catch(e=>{
   if(!cancelled){setContext(null);setError(e.message);}
  });
  return()=>{cancelled=true;};
 },[focus,api]);
 useEffect(()=>{bottom.current?.scrollIntoView({block:'end',behavior:loading?'smooth':'auto'});},[messages,loading]);
 useEffect(()=>{
  const flag=new URLSearchParams(window.location.search).get('copilot');
  if(flag==='gmail-connected'){setNotice('Gmail autorizado. A conexão está disponível para envio confirmado.');void refreshGmail();}
  else if(flag==='gmail-error')setError('A autorização Gmail não foi concluída. Verifique as configurações OAuth.');
 },[refreshGmail]);
 const run=async(action:()=>Promise<void>)=>{
  setError('');setNotice('');
  try{await action();}catch(e:any){setError(e.message||'Falha na operação.');}
 };
 const ask=async(question?:string,newFocus?:Area)=>{
  const prompt=(question??input).trim();
  if(!prompt||sending.current)return;
  sending.current=true;setLoading(true);setError('');setInput('');
  if(newFocus)setFocus(newFocus);
  setMessages(old=>[...old,{role:'user',content:prompt}]);
  try{
   const data=await api('chat',{method:'POST',body:JSON.stringify({message:prompt,threadId:threadId||undefined,focus:newFocus||focus,engine})});
   if(!threadId)setThreadId(data.threadId);
   setProvider(data.provider||'');
   setMessages(old=>[...old,{role:'assistant',content:String(data.reply||'Sem resposta da IA.')}]);
   void refreshThreads();
  }catch(e:any){
   setError(e.message||'Falha ao consultar a IA.');
  }finally{setLoading(false);sending.current=false;}
 };
 const loadThread=async(id:string)=>{
  if(loading)return;
  setLoadingHistory(true);setError('');
  try{
   const d=await api('threads/'+id);
   setThreadId(id);
   setEngine(d.engine==='hermes'?'hermes':'standard');
   setProvider(d.engine==='hermes'?'Hermes Agent':'');
   setMessages(Array.isArray(d.messages)?d.messages:[]);
  }catch(e:any){setError(e.message);}
  finally{setLoadingHistory(false);}
 };
 const newThread=()=>{setThreadId(null);setMessages([]);setInput('');setError('');setProvider('');};
 const switchEngine=(next:Engine)=>{
  if(next===engine)return;
  if(next==='hermes'&&!engineSettings?.hermes.available)return;
  if(messages.length>0&&!window.confirm('Trocar o motor inicia uma nova conversa. Deseja continuar?'))return;
  newThread();
  setEngine(next);
 };
 const deleteThread=async(id:string)=>{
  if(!window.confirm('Excluir esta conversa do seu histórico?'))return;
  await run(async()=>{await api('threads/'+id,{method:'DELETE'});if(threadId===id)newThread();await refreshThreads();});
 };
 const speak=(value:string)=>{
  if(!('speechSynthesis'in window)){setError('Leitura de voz indisponível neste navegador.');return;}
  window.speechSynthesis.cancel();
  if(speaking){setSpeaking(false);return;}
  const utterance=new SpeechSynthesisUtterance(value.replace(/[*#]/g,''));
  utterance.lang='pt-BR';utterance.rate=1;
  utterance.onend=()=>setSpeaking(false);utterance.onerror=()=>setSpeaking(false);
  window.speechSynthesis.speak(utterance);setSpeaking(true);
 };
 const createTask=async()=>{
  if(!taskTitle.trim())return;
  setLoading(true);
  try{
   await api('tasks',{method:'POST',body:JSON.stringify({
    title:taskTitle,description:taskDescription,priority:taskPriority,confirm:true})});
   setTaskOpen(false);setTaskTitle('');setTaskDescription('');setNotice('Tarefa criada no Kanban desta agência.');
  }catch(e:any){setError(e.message);}finally{setLoading(false);}
 };
 const connectGmail=async()=>{
  await run(async()=>{
   const r=await api('gmail/connect');
   window.location.assign(r.url);
  });
 };
 const draftEmail=async()=>{
  if(!mailGoal.trim())return;
  setLoading(true);
  try{
   const d=await api('draft-email',{method:'POST',body:JSON.stringify({purpose:mailGoal,recipient:mailTo,engine})});
   const body=String(d.draft||'');
   const match=body.match(/^Assunto:\s*(.+)(?:\r?\n){1,2}/i);
   if(match){setMailSubject(match[1].trim());setMailBody(body.slice(match[0].length).trim());}
   else setMailBody(body);
   setNotice('Rascunho gerado. Revise e confirme antes de enviar.');
  }catch(e:any){setError(e.message);}finally{setLoading(false);}
 };
 const sendEmail=async()=>{
  if(!gmail?.canSend||!mailTo||!mailSubject||!mailBody)return;
  if(!window.confirm('Confirma o envio deste e-mail pela conta Gmail conectada?'))return;
  const id=sendRequestId||crypto.randomUUID();setSendRequestId(id);setLoading(true);
  try{
   const result=await api('email/send',{method:'POST',body:JSON.stringify({
    to:mailTo,subject:mailSubject,body:mailBody,confirm:true,requestId:id})});
   setMailOpen(false);setNotice('Gmail confirmou o envio. ID: '+result.messageId);
   setMailTo('');setMailSubject('');setMailBody('');setMailGoal('');setSendRequestId('');
  }catch(e:any){setError(e.message+' Se o resultado for incerto, confira a pasta Enviados antes de repetir.');}
  finally{setLoading(false);}
 };
 const clearMail=()=>{setMailOpen(false);setSendRequestId('');};
 return <div className="h-[calc(100dvh-118px)] min-h-[520px] max-h-[1100px] flex rounded-[22px] border border-[#263A5F] bg-[#080F20] overflow-hidden text-slate-100 shadow-2xl">
  {sidebar&&<aside className="w-[235px] shrink-0 hidden md:flex flex-col bg-[#0C1730] border-r border-[#273955] min-h-0">
   <div className="p-3 border-b border-[#263956]">
    <button onClick={newThread} className="flex items-center gap-2 w-full rounded-xl border border-[#355381] hover:bg-[#1D3356] px-3 py-2.5 font-semibold text-xs">
     <SquarePen className="w-4 h-4 text-blue-300"/>Nova conversa</button>
   </div>
   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.14em] px-4 pt-5 pb-2">Suas conversas</p>
   <div className="flex-1 overflow-y-auto min-h-0 px-2 space-y-1">
    {threads.length===0&&<p className="text-xs text-slate-500 p-3">Nenhuma conversa salva ainda.</p>}
    {threads.map(thread=><div key={thread.id} className={'group rounded-lg flex items-center '+(threadId===thread.id?'bg-[#1C345B]':'hover:bg-[#172845]')}>
      <button onClick={()=>void loadThread(thread.id)} title={thread.title}
       className="min-w-0 flex-1 px-3 py-2.5 text-left text-xs text-slate-300 truncate">
       <MessageSquare className="w-3.5 h-3.5 inline mr-2 text-slate-500"/>{thread.title}
      </button>
      <button aria-label="Apagar conversa" title="Excluir" onClick={()=>void deleteThread(thread.id)}
       className="p-2 text-slate-500 hover:text-rose-300 opacity-70 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5"/></button>
    </div>)}
   </div>
   <div className="m-3 p-3 rounded-xl bg-[#132540] border border-[#2D456D] text-[11px] text-slate-400">
    <ShieldCheck className="w-4 h-4 text-blue-300 mb-2"/>
    Histórico privado por conta e dados limitados à empresa autorizada.
   </div>
  </aside>}
  <section className="flex-1 min-w-0 min-h-0 flex flex-col">
   <header className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-5 py-3 border-b border-[#233756] bg-[#0B152B] shrink-0">
    <div className="flex items-center gap-2 min-w-0">
     <button title="Mostrar/ocultar histórico" onClick={()=>setSidebar(v=>!v)} className="p-2 hover:bg-[#1C3358] rounded-lg hidden md:block">
      {sidebar?<PanelLeftClose className="w-4 h-4"/>:<Menu className="w-4 h-4"/>}
     </button>
     <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center"><Sparkles className="w-5 h-5"/></div>
     <div className="min-w-0">
      <h2 className="font-bold text-white text-sm">Consultora AgencyOS</h2>
      <p className="text-[10px] text-slate-400 truncate">Dados da sua agência • {engine==='hermes'?'Hermes Agent':provider||'Gemini / Groq'}</p>
     </div>
    </div>
    <div className="flex items-center flex-wrap gap-1.5">
     <label className="text-[11px] relative flex gap-2 items-center border border-[#2F4A74] bg-[#132545] rounded-lg px-2.5 py-2" title={engineSettings?.hermes.reason||'Selecione o motor de IA'}>
      <Bot className="w-3.5 h-3.5 text-blue-300" />
      <span className="sr-only">Motor de IA</span>
      <select aria-label="Motor de IA" value={engine} onChange={e=>switchEngine(e.target.value as Engine)}
       className="bg-transparent outline-none text-blue-100 text-[11px] font-semibold cursor-pointer max-w-[122px]">
       <option value="standard" className="bg-[#101D33]">Gemini / Groq</option>
       <option value="hermes" disabled={!engineSettings?.hermes.available} className="bg-[#101D33]">Hermes Agent{!engineSettings?.hermes.available?' (pendente)':''}</option>
      </select>
     </label>
     <button onClick={()=>setContextOpen(v=>!v)} className="px-3 py-2 rounded-lg bg-[#142849] text-blue-200 text-[11px] border border-[#2A4770] flex items-center gap-1.5">
      <Layers3 className="w-3.5 h-3.5"/>Contexto {contextOpen?'−':'+'}</button>
     {onNavigate&&<button title="Abrir a aba correspondente no AgencyOS" onClick={()=>onNavigate(destination[focus])}
      className="px-3 py-2 rounded-lg border border-[#31486B] text-[11px] hover:bg-[#152A49] flex items-center gap-1.5">
       <ExternalLink className="w-3.5 h-3.5"/>Abrir aba</button>}
     <button onClick={()=>setTaskOpen(true)} className="px-3 py-2 rounded-lg border border-[#31486B] text-[11px] font-bold hover:bg-[#152A49] flex items-center gap-1.5">
      <ListTodo className="w-3.5 h-3.5"/>Tarefa</button>
     <button onClick={()=>{setMailOpen(true);void refreshGmail();}} className="px-3 py-2 rounded-lg border border-[#31486B] text-[11px] font-bold hover:bg-[#152A49] flex items-center gap-1.5">
      <Mail className="w-3.5 h-3.5"/>E-mail</button>
     <button onClick={newThread} title="Nova conversa" className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 md:hidden"><Plus className="w-4 h-4"/></button>
    </div>
   </header>
   {engineSettings&&!engineSettings.hermes.available&&
    <div className="mx-3 sm:mx-5 mt-2 text-[11px] text-slate-400 flex gap-2 items-center">
     <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0"/>
     <span>Hermes Agent: {engineSettings.hermes.reason}</span>
    </div>}
   {(error||notice)&&<div className={'mx-3 sm:mx-6 mt-3 p-3 rounded-xl text-xs border shrink-0 '+(error?'border-rose-500/40 bg-rose-950/30 text-rose-200':'border-emerald-500/30 bg-emerald-950/20 text-emerald-200')}>
    <div className="flex justify-between gap-2"><span>{error||notice}</span><button onClick={()=>{setError('');setNotice('');}} aria-label="Fechar"><X className="w-4 h-4"/></button></div>
   </div>}
   {contextOpen&&<div className="mx-3 sm:mx-5 mt-3 p-3 rounded-xl bg-[#0E203E] border border-[#2C4670] max-h-44 overflow-y-auto shrink-0">
    <div className="flex flex-wrap gap-2 items-center justify-between mb-2">
     <strong className="text-xs text-white">Contexto consultado no Firestore</strong>
     <span className="text-[10px] text-slate-400">{context?.observedAt?new Date(context.observedAt).toLocaleString('pt-BR'):'Sem dados carregados'}</span>
    </div>
    {context?<div className="flex flex-wrap gap-2">
      {(Object.entries(context.sections) as [string,{visible:number;limited:boolean;records:unknown[]}][]).map(([name,val])=><div key={name} className="rounded-lg bg-[#1B345A] px-3 py-2 text-[11px] text-slate-200">
       {name}: <strong>{val.visible}</strong>{val.limited?' (limite de leitura)':''}
      </div>)}
      {Object.keys(context.sections).length===0&&<span className="text-xs text-slate-400">Sem coleções autorizadas para esta área.</span>}
    </div>:<p className="text-xs text-slate-400">Aguardando contexto autenticado...</p>}
    <p className="text-[10px] mt-2 text-slate-400">Contagens de registros consultados, não totais certificados. A IA não recebe senhas ou tokens.</p>
   </div>}
   <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-7 py-5" aria-live="polite">
    <div className="max-w-[820px] mx-auto space-y-6">
     {messages.length===0&&!loadingHistory&&<div className="py-9 sm:py-14 space-y-6">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/25 to-violet-500/25 border border-blue-500/30 flex items-center justify-center">
       <BrainCircuit className="w-7 h-7 text-blue-300"/>
      </div>
      <div><h3 className="text-[26px] sm:text-[31px] text-white font-bold tracking-tight leading-tight">Como posso ajudar sua agência?</h3>
       <p className="mt-3 text-sm leading-relaxed text-slate-400 max-w-xl">Analiso dados autorizados das suas abas, explico gargalos e preparo decisões. Para fazer alterações ou enviar e-mails, você confirma cada ação.</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
       {quick.map(x=><button key={x.label} onClick={()=>void ask(x.prompt,x.focus)} className="text-left rounded-2xl p-4 bg-[#121E34] border border-[#283A55] hover:border-blue-400/55 hover:bg-[#182C4B] transition-colors">
        <span className="text-xs font-bold text-slate-100 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-blue-400"/>{x.label}</span>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">{x.prompt}</p>
       </button>)}
      </div>
     </div>}
     {loadingHistory&&<p className="text-xs text-slate-400 flex gap-2"><Loader2 className="w-4 h-4 animate-spin"/>Carregando sua conversa...</p>}
     {messages.map((m,i)=><div key={i} className={'flex '+(m.role==='user'?'justify-end':'justify-start')}>
      {m.role==='assistant'?<div className="w-full max-w-[780px]">
       <div className="flex items-center gap-2 mb-3"><div className="w-7 h-7 rounded-lg bg-[#193B75] flex items-center justify-center"><Sparkles className="w-4 h-4 text-blue-200"/></div>
        <span className="text-[11px] font-semibold text-slate-400">{engine==='hermes'?'Hermes Agent · AgencyOS':'Consultora AgencyOS'}</span>
       </div>
       <div className="ml-0 sm:ml-9"><RichText text={m.content}/></div>
       <div className="ml-0 sm:ml-9 flex items-center gap-1 mt-3">
        <button title="Copiar resposta" onClick={()=>void navigator.clipboard.writeText(m.content).then(()=>setNotice('Resposta copiada.'))} className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-[#182B4D]"><Copy className="w-4 h-4"/></button>
        <button title={speaking?'Parar leitura':'Ouvir resposta'} onClick={()=>speak(m.content)} className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-[#182B4D]">
         {speaking?<StopCircle className="w-4 h-4"/>:<Mic2 className="w-4 h-4"/>}</button>
       </div>
      </div>:<div className="max-w-[90%] sm:max-w-[78%] rounded-[20px] rounded-br-md bg-[#1B2940] border border-[#32445D] px-4 py-3 text-sm leading-relaxed text-white whitespace-pre-wrap">{m.content}</div>}
     </div>)}
     {loading&&<div className="flex gap-3 items-center text-xs text-slate-400"><Loader2 className="h-5 w-5 text-blue-400 animate-spin"/>Consultando dados autorizados e preparando a resposta...</div>}
     <div ref={bottom}/>
    </div>
   </div>
   <footer className="shrink-0 border-t border-[#243756] bg-[#0B152B] px-3 sm:px-6 py-3">
    <div className="max-w-[820px] mx-auto">
     <div className="flex gap-2 mb-2 overflow-x-auto">
      {focusOptions.map(o=><button key={o.id} onClick={()=>setFocus(o.id)} className={'whitespace-nowrap px-2.5 py-1.5 rounded-full text-[11px] border '+(focus===o.id?'bg-blue-600/25 border-blue-400/40 text-blue-200':'border-[#31445F] text-slate-400 hover:text-white')}>{o.label}</button>)}
     </div>
     <div className="rounded-[18px] border border-[#354D73] bg-[#111D34] flex items-end gap-2 p-2 focus-within:border-blue-500">
      <textarea value={input} onChange={e=>setInput(e.target.value)}
       onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void ask();}}}
       placeholder="Pergunte sobre sua agência, clientes, metas, projetos..." rows={2}
       className="flex-1 min-w-0 px-2.5 py-2 resize-none max-h-32 overflow-y-auto bg-transparent text-[13px] text-white placeholder-slate-500 outline-none"/>
      <button title="Enviar mensagem" onClick={()=>void ask()} disabled={loading||!input.trim()}
       className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 p-2.5 text-white shrink-0"><ArrowUp className="w-4 h-4"/></button>
     </div>
     <p className="text-center text-[10px] text-slate-500 mt-2">A IA pode cometer erros. Confira recomendações importantes antes de tomar decisões.</p>
    </div>
   </footer>
  </section>
  {taskOpen&&<div className="fixed inset-0 bg-black/80 z-[90] p-4 flex items-center justify-center" role="presentation">
   <section className="w-full max-w-lg rounded-2xl bg-[#101D33] border border-[#36517B] p-5 space-y-4" role="dialog" aria-modal="true" aria-label="Criar tarefa">
    <div className="flex justify-between"><h3 className="text-lg font-bold">Criar tarefa no Kanban</h3><button onClick={()=>setTaskOpen(false)} aria-label="Fechar"><X className="w-4 h-4"/></button></div>
    <p className="text-xs text-slate-400">A IA não executará nada sem sua confirmação. Esta tarefa será criada na empresa autorizada.</p>
    <label className="text-xs block">Título<input value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} className={field} placeholder="Ex.: Revisar campanha do cliente"/></label>
    <label className="text-xs block">Descrição<textarea value={taskDescription} onChange={e=>setTaskDescription(e.target.value)} className={field} rows={3}/></label>
    <label className="text-xs block">Prioridade<select value={taskPriority} onChange={e=>setTaskPriority(e.target.value as typeof taskPriority)} className={field}>
     {['Baixa','Média','Alta'].map(x=><option key={x}>{x}</option>)}</select></label>
    <button onClick={()=>void createTask()} disabled={loading||!taskTitle.trim()} className={actionBtn}>Confirmar e criar tarefa</button>
   </section>
  </div>}
  {mailOpen&&<div className="fixed inset-0 bg-black/80 z-[90] p-3 sm:p-5 flex items-center justify-center" role="presentation">
   <section className="w-full max-w-2xl max-h-[92dvh] overflow-y-auto rounded-2xl bg-[#101D33] border border-[#36517B] p-5 space-y-4" role="dialog" aria-modal="true" aria-label="E-mail da agência">
    <div className="flex justify-between gap-2"><h3 className="text-lg font-bold flex gap-2 items-center"><Mail className="w-5 h-5 text-blue-300"/>E-mail da agência</h3><button onClick={clearMail} aria-label="Fechar"><X className="w-4 h-4"/></button></div>
    <div className="rounded-xl bg-[#172A49] border border-[#314E76] p-3 text-xs leading-relaxed">
     {gmail?.connected?<span className="text-emerald-300"><CheckCircle2 className="inline w-4 h-4 mr-1"/>Gmail conectado: {gmail.email}</span>
      :gmail?.configured?<div className="flex flex-wrap gap-2 items-center justify-between">
       <span className="text-slate-300">Conecte sua conta Google para enviar mensagens reais.</span>
       <button onClick={()=>void connectGmail()} className={actionBtn}>Conectar Gmail <ExternalLink className="w-3 h-3"/></button></div>
      :<span className="text-amber-300">O Gmail ainda depende de OAuth configurado na Vercel e no Google Cloud. Rascunhos funcionam sem envio.</span>}
    </div>
    <label className="block text-xs text-slate-300">Objetivo do rascunho<textarea className={field} value={mailGoal} onChange={e=>setMailGoal(e.target.value)} rows={2} placeholder="Ex.: agradecer a reunião e enviar próximos passos"/></label>
    <button className="rounded-xl border border-[#34537B] px-3 py-2 text-xs flex items-center gap-2 hover:bg-[#1A3458] disabled:opacity-40" disabled={loading||!mailGoal.trim()} onClick={()=>void draftEmail()}>
     <Sparkles className="w-4 h-4 text-blue-300"/>Pedir rascunho à IA
    </button>
    <label className="block text-xs">Para<input type="email" className={field} value={mailTo} onChange={e=>{setMailTo(e.target.value);setSendRequestId('');}} placeholder="destinatario@empresa.com"/></label>
    <label className="block text-xs">Assunto<input className={field} value={mailSubject} onChange={e=>{setMailSubject(e.target.value);setSendRequestId('');}} placeholder="Assunto do e-mail"/></label>
    <label className="block text-xs">Mensagem<textarea className={field} value={mailBody} onChange={e=>{setMailBody(e.target.value);setSendRequestId('');}} rows={7} placeholder="Revise o texto antes do envio"/></label>
    <div className="flex flex-wrap items-center gap-2 justify-between">
     {gmail?.connected&&<button className="text-xs text-rose-300" onClick={()=>void run(async()=>{await api('gmail/disconnect',{method:'POST'});await refreshGmail();setNotice('Gmail desconectado.');})}>Desconectar Gmail</button>}
     <button disabled={!gmail?.canSend||!mailTo.trim()||!mailSubject.trim()||!mailBody.trim()||loading} onClick={()=>void sendEmail()} className={actionBtn}><Send className="w-4 h-4"/>Confirmar e enviar e-mail</button>
    </div>
    <p className="text-[11px] text-slate-400">O envio usa a conta Gmail autorizada, requer sua confirmação e não é automático. Não envie mensagens comerciais sem consentimento adequado.</p>
   </section>
  </div>}
 </div>;
};

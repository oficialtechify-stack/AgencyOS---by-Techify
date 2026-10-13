import React, { useCallback, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import {
  Instagram, MessageSquare, Link2, Link2Off, ShieldCheck, CalendarDays, PenLine,
  Inbox, Bot, BarChart3, Sparkles, Send, Image, Copy, AlertCircle, CheckCircle2,
  Clock, Trash2, RefreshCcw, ExternalLink, Loader2, ArrowRight, Plus, Lock,
  Zap, Settings2,
} from 'lucide-react';

type Tab = 'connections' | 'studio' | 'planner' | 'inbox' | 'automation' | 'insights';
type Provider = 'instagram' | 'whatsapp';
type Account = { connected: boolean; username?: string; phone?: string; name?: string; accountType?: string };
type Config = { instagramReady: boolean; whatsappReady: boolean; waAppId: string; waConfigId: string; schedulerReady: boolean };
type Draft = { id: string; caption: string; imageUrl?: string; status: string; createdAt: string; scheduledAt?: string; publishedAt?: string };
type Message = { id: string; direction: 'incoming' | 'outgoing'; senderId: string; text: string; receivedAt: string; provider: string };
type State = { instagram: Account; whatsapp: Account; isOwner: boolean; automation: { enabled: boolean; greeting: string } };
const card = 'rounded-[24px] border border-[#213758] bg-[#0D172B] shadow-lg shadow-blue-950/10';
const input = 'w-full rounded-xl border border-[#304563] bg-[#0A1428] p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors';
const primary = 'inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-40 transition-colors';
const secondary = 'inline-flex items-center justify-center gap-2 rounded-xl border border-[#305078] bg-[#142B4C] px-4 py-2.5 text-xs font-bold text-blue-100 hover:bg-[#203E6A] disabled:opacity-40 transition-colors';
const noAccount: Account = { connected: false };

export const SocialHubView: React.FC = () => {
  const [tab, setTab] = useState<Tab>('connections');
  const [config, setConfig] = useState<Config | null>(null);
  const [state, setState] = useState<State | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Profissional e próximo');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [replyTarget, setReplyTarget] = useState('');
  const [replyText, setReplyText] = useState('');

  const api = useCallback(async (url: string, init: RequestInit = {}) => {
    await auth.authStateReady();
    const user = auth.currentUser;
    if (!user) throw Error('Entre na sua conta AgencyOS para utilizar as integrações.');
    const token = await user.getIdToken();
    const response = await fetch('/api/social/' + url, {
      ...init, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, ...(init.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw Error(data.error || 'Não foi possível concluir a solicitação.');
    return data;
  }, []);

  const reload = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const configuration = await fetch('/api/social/config').then(r => r.json());
      setConfig(configuration);
      const [current, posts, inbox] = await Promise.all([api('status'), api('drafts'), api('messages')]);
      setState(current); setDrafts(posts.drafts || []); setMessages(inbox.messages || []);
      setGreeting(current.automation?.greeting || '');
      setAutoEnabled(current.automation?.enabled === true);
    } catch (e: any) { setError(e.message || 'Não foi possível carregar o Social Hub.'); }
    finally { setLoading(false); }
  }, [api]);

  useEffect(() => { void reload(); }, [reload]);
  useEffect(() => {
    const message = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== 'AGENCYOS_META_OAUTH') return;
      if (event.data.ok) { setNotice('Conta do Instagram conectada com autorização oficial.'); void reload(); }
      else setError('O Instagram não foi conectado. Verifique permissões da Meta.');
    };
    window.addEventListener('message', message);
    return () => window.removeEventListener('message', message);
  }, [reload]);

  async function work(name: string, fn: () => Promise<void>) {
    if (busy) return;
    setBusy(name); setError(''); setNotice('');
    try { await fn(); } catch (e: any) { setError(e.message || 'Falha na solicitação.'); }
    finally { setBusy(''); }
  }

  function instagramLogin() {
    const popup = window.open('about:blank', 'agencyos_instagram_oauth', 'width=620,height=760');
    void work('ig', async () => {
      try {
        const result = await api('instagram/start', { method: 'POST' });
        if (!popup) throw Error('Pop-up bloqueado. Autorize janelas para este site e tente novamente.');
        popup.location.href = result.url;
      } catch (error) { popup?.close(); throw error; }
    });
  }

  function whatsAppLogin() {
    void work('wa', async () => {
      if (!config?.waAppId || !config.waConfigId) throw Error('Configure o WhatsApp Business no Meta Developers.');
      if (!(window as any).FB) await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/pt_BR/sdk.js';
        script.async = true; script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        script.onerror = () => reject(Error('SDK da Meta indisponível neste navegador.'));
        document.head.appendChild(script);
      });
      const fb = (window as any).FB;
      fb.init({ appId: config.waAppId, cookie: true, xfbml: false, version: 'v24.0' });
      const selected = await new Promise<{ code: string; wabaId: string; phoneNumberId: string }>((resolve, reject) => {
        let code = '', wabaId = '', phoneNumberId = '';
        let finished = false;
        const finish = () => {
          if (finished || !code || !wabaId || !phoneNumberId) return;
          finished = true; window.removeEventListener('message', onMessage);
          resolve({ code, wabaId, phoneNumberId });
        };
        const onMessage = (event: MessageEvent) => {
          if (!['https://www.facebook.com', 'https://web.facebook.com'].includes(event.origin)) return;
          try {
            const d = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            if (d.type !== 'WA_EMBEDDED_SIGNUP') return;
            if (d.event === 'FINISH') {
              wabaId = String(d.data?.waba_id || ''); phoneNumberId = String(d.data?.phone_number_id || ''); finish();
            } else if (d.event === 'CANCEL' || d.event === 'ERROR') {
              finished = true; window.removeEventListener('message', onMessage);
              reject(Error('Cadastro da Meta cancelado ou recusado.'));
            }
          } catch { /* unrelated SDK event */ }
        };
        window.addEventListener('message', onMessage);
        fb.login((response: any) => {
          code = response?.authResponse?.code || '';
          if (!code && !finished) {
            finished = true; window.removeEventListener('message', onMessage);
            reject(Error('Não foi possível obter a autorização do WhatsApp.'));
          }
          finish();
        }, { config_id: config.waConfigId, response_type: 'code',
          override_default_response_type: true, extras: { setup: {} } });
      });
      await api('whatsapp/connect', { method: 'POST', body: JSON.stringify(selected) });
      setNotice('WhatsApp Business conectado após validação da Meta.');
      await reload();
    });
  }

  function disconnect(provider: Provider) {
    if (!window.confirm('Desconectar esta conta e interromper suas automações?')) return;
    void work('disconnect', async () => {
      await api('disconnect', { method: 'POST', body: JSON.stringify({ provider }) });
      await reload(); setNotice('Conta desconectada.');
    });
  }
  function generateCaption() {
    void work('caption', async () => {
      if (!topic.trim()) throw Error('Descreva o objetivo da publicação.');
      const r = await fetch('/api/ai/social-caption', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.result) throw Error(d.error || 'Serviço de IA indisponível.');
      setCaption(d.result); setNotice('Legenda gerada. Revise antes de enviar.');
    });
  }
  function saveDraft() {
    void work('save', async () => {
      const draft = await api('drafts', { method: 'POST', body: JSON.stringify({
        platform: 'instagram', caption, imageUrl, scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : '',
      }) });
      setDrafts(prev => [draft, ...prev]);
      setNotice(scheduledAt ? 'Agendamento registrado na fila.' : 'Rascunho salvo no Firebase.');
      setTab('planner');
    });
  }
  function publish(id: string) {
    if (!window.confirm('Publicar esta imagem no Instagram conectado agora?')) return;
    void work('publish', async () => {
      await api('drafts/' + id + '/publish', { method: 'POST' });
      setDrafts((await api('drafts')).drafts || []);
      setNotice('A API oficial da Meta confirmou a publicação.');
    });
  }
  function deleteDraft(id: string) {
    if (!window.confirm('Apagar rascunho ou agendamento?')) return;
    void work('delete', async () => {
      await api('drafts/' + id, { method: 'DELETE' });
      setDrafts(prev => prev.filter(p => p.id !== id)); setNotice('Conteúdo apagado.');
    });
  }
  function saveAutomation() {
    void work('automation', async () => {
      const d = await api('automation', { method: 'POST', body: JSON.stringify({ enabled: autoEnabled, greeting }) });
      setAutoEnabled(d.enabled);
      setNotice(d.enabled ? 'Automação ativada para as novas mensagens recebidas.' : 'Automação desativada.');
    });
  }
  function reply() {
    void work('reply', async () => {
      await api('messages/reply', { method: 'POST', body: JSON.stringify({ messageId: replyTarget, text: replyText }) });
      setReplyTarget(''); setReplyText('');
      setMessages((await api('messages')).messages || []); setNotice('Resposta enviada pela Meta.');
    });
  }

  const connected = Number(state?.instagram?.connected === true) + Number(state?.whatsapp?.connected === true);
  const scheduled = drafts.filter(p => p.status === 'agendado').length;
  const received = messages.filter(m => m.direction === 'incoming');
  const tabs: { id: Tab; text: string; icon: any }[] = [
    { id: 'connections', text: 'Conexões', icon: Link2 }, { id: 'studio', text: 'Estúdio', icon: PenLine },
    { id: 'planner', text: 'Planejador', icon: CalendarDays }, { id: 'inbox', text: 'Mensagens', icon: Inbox },
    { id: 'automation', text: 'Automações', icon: Bot }, { id: 'insights', text: 'Insights', icon: BarChart3 },
  ];
  return <div className="space-y-5 pb-12 max-w-[1650px] mx-auto text-slate-100">
    <section className="rounded-[26px] border border-[#2A4166] bg-gradient-to-br from-[#123063] via-[#0E2146] to-[#081124] p-5 sm:p-8 relative overflow-hidden">
      <div className="absolute -right-20 -top-20 h-64 w-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative flex flex-col lg:flex-row gap-5 justify-between lg:items-center">
        <div><div className="text-[11px] text-blue-300 font-bold tracking-[0.18em] uppercase mb-2 flex items-center gap-2"><Zap className="h-4 w-4" />Social Media Hub</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Central de redes sociais</h2>
          <p className="text-sm text-slate-400 max-w-2xl mt-2">Conecte suas contas, prepare conteúdo, programe publicações e responda clientes com APIs oficiais.</p></div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-xl bg-[#13294C] border border-[#35527B] px-4 py-2.5 text-xs font-bold text-blue-200 flex items-center gap-2"><Link2 className="w-4 h-4" />{connected} de 2 canais conectados</span>
          <button onClick={() => void reload()} className={secondary} disabled={loading}><RefreshCcw className={'w-4 h-4 ' + (loading ? 'animate-spin' : '')} />Atualizar</button>
        </div>
      </div>
    </section>

    {error && <div role="alert" className="flex gap-2 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-sm text-rose-200"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>{error}</div>}
    {notice && <div role="status" className="flex gap-2 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm text-emerald-200"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5"/>{notice}</div>}

    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {[
        { label: 'Contas conectadas', value: connected, icon: Link2, subtitle: 'Autorizadas na Meta' },
        { label: 'Publicações na fila', value: scheduled, icon: CalendarDays, subtitle: 'Com horário definido' },
        { label: 'Conteúdos salvos', value: drafts.length, icon: PenLine, subtitle: 'Dados do Firebase' },
        { label: 'Mensagens recebidas', value: received.length, icon: MessageSquare, subtitle: 'Últimos registros' },
      ].map(k => { const Icon = k.icon; return <div key={k.label} className={card + ' p-4 sm:p-5'}>
        <div className="flex justify-between gap-2 text-xs text-slate-400"><span>{k.label}</span><Icon className="h-4 w-4 text-blue-400" /></div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white mt-3 tabular-nums">{k.value}</div>
        <div className="mt-1 text-[11px] text-slate-500">{k.subtitle}</div>
      </div>; })}
    </div>

    <nav className="p-1.5 flex gap-1.5 overflow-x-auto bg-[#0A1428] border border-[#263B5D] rounded-2xl" aria-label="Ferramentas sociais">
      {tabs.map(item => { const Icon = item.icon; return <button key={item.id} onClick={() => setTab(item.id)}
        className={'flex gap-2 items-center justify-center whitespace-nowrap rounded-xl px-4 py-3 text-xs font-bold transition-colors ' + (tab === item.id ? 'bg-[#1D3B6C] text-white ring-1 ring-blue-500/25' : 'text-slate-400 hover:bg-[#162D4C] hover:text-white')}>
        <Icon className="w-4 h-4" />{item.text}</button>; })}
    </nav>

    {tab === 'connections' && <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {([
        { provider: 'instagram' as Provider, name: 'Instagram profissional', description: 'Publique conteúdos em contas profissionais autorizadas.', icon: Instagram, iconStyle: 'text-pink-400', ready: config?.instagramReady },
        { provider: 'whatsapp' as Provider, name: 'WhatsApp Business', description: 'Atenda contatos e gerencie respostas pelo WhatsApp Cloud API.', icon: MessageSquare, iconStyle: 'text-emerald-400', ready: config?.whatsappReady },
      ]).map(item => {
        const Icon = item.icon, account = state?.[item.provider] || noAccount;
        return <section key={item.provider} className={card + ' p-5 sm:p-6'}>
          <div className="flex justify-between items-start gap-3"><div className="rounded-2xl p-3 bg-[#1B2D4F] border border-[#334A70]"><Icon className={'w-6 h-6 ' + item.iconStyle} /></div>
            <span className={'text-[11px] font-bold px-2.5 py-1 rounded-full border ' + (account.connected ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25' : 'text-amber-200 bg-amber-500/10 border-amber-500/20')}>
              {account.connected ? 'Conectada' : 'Não conectada'}</span></div>
          <h3 className="text-lg font-extrabold mt-5 text-white">{item.name}</h3>
          <p className="mt-1 text-xs text-slate-400">{item.description}</p>
          <div className="mt-5 mb-4 rounded-xl border border-[#2B4265] bg-[#09182D] p-4 text-xs">
            {account.connected ? <><div className="text-white font-bold">{account.username ? '@' + account.username : account.name || account.phone || 'Conta conectada'}</div>
              <p className="text-slate-400 mt-1">{account.phone || account.accountType || 'Permissão oficial Meta'}</p></> :
              <div className="flex gap-2 text-slate-400"><Lock className="w-4 h-4 text-blue-400 shrink-0" />Autorize pelo aplicativo oficial da Meta. Não pedimos senha do Instagram nem WhatsApp.</div>}
          </div>
          {account.connected ? <button className={secondary} disabled={Boolean(busy) || !state?.isOwner} onClick={() => disconnect(item.provider)}><Link2Off className="w-4 h-4" />Desconectar</button> :
            <button className={primary} disabled={!item.ready || !state?.isOwner || Boolean(busy)}
              onClick={item.provider === 'instagram' ? instagramLogin : whatsAppLogin}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              Conectar {item.provider === 'instagram' ? 'Instagram' : 'WhatsApp'}</button>}
          {!item.ready && <p className="text-xs mt-3 text-amber-300">Pendente de credenciais e aprovação da Meta no servidor.</p>}
          {!state?.isOwner && <p className="text-[11px] mt-3 text-slate-500">Apenas o responsável pela empresa pode autorizar canais.</p>}
        </section>;
      })}
      <section className={card + ' p-5 xl:col-span-2 flex flex-col sm:flex-row justify-between gap-4 sm:items-center'}>
        <div><h4 className="text-sm text-white font-bold flex gap-2 items-center"><ShieldCheck className="w-4 h-4 text-blue-400" />Conexões oficiais</h4>
          <p className="text-xs text-slate-400 mt-2">Instagram precisa ser profissional. WhatsApp exige Business Account, telefone e App Review quando aplicável. Tokens ficam criptografados no servidor.</p></div>
        <a className={secondary} href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer">Configurar na Meta <ExternalLink className="w-4 h-4" /></a>
      </section>
    </div>}

    {tab === 'studio' && <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <section className={card + ' xl:col-span-7 p-5 sm:p-6 space-y-4'}>
        <div><h3 className="text-lg font-bold text-white flex gap-2 items-center"><Sparkles className="w-5 h-5 text-blue-400" />Estúdio de publicações</h3>
          <p className="text-xs text-slate-400 mt-1">Crie, revise e salve publicações para o Instagram.</p></div>
        <div><label className="text-xs font-bold text-slate-300 block mb-2">Tema e objetivo</label><textarea rows={3} value={topic} onChange={e => setTopic(e.target.value)} className={input} placeholder="Ex.: apresentação de serviço de sites empresariais..." /></div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1"><label className="text-xs font-bold text-slate-300 block mb-2">Tom da comunicação</label>
            <select className={input} value={tone} onChange={e => setTone(e.target.value)}>
              <option>Profissional e próximo</option><option>Persuasivo</option><option>Educativo</option><option>Descontraído</option>
            </select></div>
          <button className={primary} disabled={Boolean(busy)} onClick={generateCaption}><Sparkles className="w-4 h-4" />{busy === 'caption' ? 'Gerando...' : 'Gerar com IA'}</button>
        </div>
        <div><label className="text-xs font-bold text-slate-300 block mb-2">Legenda final (editável)</label>
          <textarea rows={6} value={caption} onChange={e => setCaption(e.target.value)} className={input} placeholder="Escreva ou gere sua legenda..." /></div>
        <div><label className="text-xs font-bold text-slate-300 block mb-2">Imagem pública (HTTPS)</label>
          <input type="url" className={input} value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://site.com/foto.jpg" />
          <p className="text-[11px] text-slate-500 mt-2">A Meta precisa acessar a imagem. Upload e geração de imagem aguardam serviço de mídia.</p></div>
        {config?.schedulerReady && <div>
          <label className="text-xs font-bold text-slate-300 block mb-2">Programar publicação (opcional)</label>
          <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className={input} />
          <p className="text-[11px] text-slate-500 mt-1">Depende de cron seguro ativo e autorização Meta.</p>
        </div>}
        <div className="flex flex-wrap gap-2">
          <button className={primary} disabled={!caption.trim() || Boolean(busy)} onClick={saveDraft}><Plus className="w-4 h-4" />{scheduledAt ? 'Programar conteúdo' : 'Salvar rascunho'}</button>
          <button className={secondary} disabled={!caption} onClick={() => void navigator.clipboard.writeText(caption).then(() => setNotice('Legenda copiada.'))}><Copy className="w-4 h-4" />Copiar</button>
        </div>
      </section>
      <aside className={card + ' xl:col-span-5 p-5 sm:p-6'}>
        <h3 className="text-sm font-bold flex gap-2 items-center"><Image className="w-4 h-4 text-blue-400" />Prévia do conteúdo</h3>
        <div className="mt-4 aspect-square rounded-2xl border border-[#2A4168] bg-[#081326] flex items-center justify-center overflow-hidden">
          {/^https:\/\//.test(imageUrl) ? <img src={imageUrl} alt="Mídia de publicação" className="w-full h-full object-contain" /> :
            <div className="text-center text-xs text-slate-500"><Image className="h-10 w-10 mx-auto mb-3" />Insira a URL da imagem</div>}
        </div>
        <p className="text-xs whitespace-pre-wrap text-slate-300 mt-5 line-clamp-6">{caption || 'Sua legenda aparecerá aqui após ser escrita.'}</p>
        <div className="mt-5 text-xs text-slate-400 border-t border-[#26395A] pt-4">O sistema só marca como publicada uma postagem confirmada pela API da Meta.</div>
      </aside>
    </div>}

    {tab === 'planner' && <div className="space-y-4">
      <section className={card + ' p-5 sm:p-6 flex flex-col sm:flex-row gap-3 sm:items-center justify-between'}>
        <div><h3 className="text-lg font-bold text-white">Planejador editorial</h3>
          <p className="text-xs text-slate-400 mt-1">{config?.schedulerReady ? 'Agendamento depende do cron seguro estar executando.' : 'Publicação automática depende de configuração de agendador no servidor.'}</p></div>
        <button className={secondary} onClick={() => setTab('studio')}><Plus className="w-4 h-4" />Novo conteúdo</button>
      </section>
      {drafts.length === 0 ? <section className={card + ' p-14 text-center'}>
        <CalendarDays className="w-10 h-10 text-blue-400 mx-auto"/><h4 className="text-base font-bold mt-3">Nenhuma publicação cadastrada</h4>
        <p className="text-xs text-slate-400 mt-2">Salve seu primeiro rascunho no Estúdio.</p>
      </section> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {drafts.map(d => <article key={d.id} className={card + ' p-5'}>
          {d.imageUrl && <img src={d.imageUrl} className="w-full h-40 object-cover rounded-xl bg-[#101D37] mb-3" alt="" />}
          <div className="flex justify-between gap-2"><span className="text-[10px] font-bold uppercase text-blue-400">Instagram</span>
            <span className="rounded-md bg-[#1D365C] px-2 py-1 text-[10px] font-bold text-blue-100">{d.status}</span></div>
          <p className="text-sm whitespace-pre-wrap mt-4 line-clamp-4 min-h-16">{d.caption}</p>
          <p className="text-[11px] text-slate-500 mt-3">{d.scheduledAt ? 'Programado para ' + new Date(d.scheduledAt).toLocaleString('pt-BR') : d.publishedAt ? 'Publicado ' + new Date(d.publishedAt).toLocaleString('pt-BR') : 'Sem horário programado'}</p>
          {d.status !== 'publicado' && <div className="mt-4 flex gap-2 flex-wrap">
            <button disabled={!state?.instagram.connected || !d.imageUrl || Boolean(busy)} className={primary} onClick={() => publish(d.id)}><Send className="w-4 h-4" />Publicar</button>
            <button disabled={Boolean(busy)} className={secondary} onClick={() => deleteDraft(d.id)}><Trash2 className="w-4 h-4" />Excluir</button>
          </div>}
        </article>)}
      </div>}
    </div>}

    {tab === 'inbox' && <section className={card + ' overflow-hidden'}>
      <header className="border-b border-[#263A5C] p-5 sm:p-6"><h3 className="text-lg font-bold text-white">Caixa de entrada</h3>
        <p className="text-xs text-slate-400 mt-2">Conversas recebidas pelo webhook oficial do WhatsApp Business.</p></header>
      {messages.length === 0 ? <div className="px-5 py-16 text-center">
        <Inbox className="w-10 h-10 mx-auto text-blue-400" /><h4 className="text-white font-bold mt-3">Nenhuma mensagem recebida</h4>
        <p className="text-xs text-slate-400 mt-2">Conecte a conta empresarial e ative os webhooks da Meta.</p>
        <button className={secondary + ' mt-4'} onClick={() => setTab('connections')}>Conectar canais <ArrowRight className="w-4 h-4" /></button>
      </div> : <div className="divide-y divide-[#263859]">
        {messages.map(m => <div key={m.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div><p className="text-xs font-bold text-slate-200">{m.direction === 'incoming' ? 'Recebida de ' : 'Enviada para '}{m.senderId}</p>
            <p className="text-sm text-slate-300 mt-2 whitespace-pre-wrap break-words">{m.text}</p>
            <p className="text-[11px] text-slate-500 mt-2">{new Date(m.receivedAt).toLocaleString('pt-BR')}</p></div>
          {m.direction === 'incoming' && <button className={secondary + ' self-start'} onClick={() => setReplyTarget(m.id)}>Responder <Send className="w-4 h-4" /></button>}
        </div>)}
      </div>}
      {replyTarget && <div className="p-5 border-t border-[#2A4164] bg-[#102243] space-y-3">
        <h4 className="font-bold text-sm text-white">Responder contato</h4>
        <p className="text-xs text-slate-400">Resposta livre disponível dentro da janela oficial de atendimento de 24 horas.</p>
        <textarea value={replyText} onChange={e => setReplyText(e.target.value)} className={input} rows={3} placeholder="Escreva a mensagem..." />
        <div className="flex gap-2"><button className={primary} disabled={!replyText.trim() || Boolean(busy)} onClick={reply}>Enviar resposta</button>
          <button className={secondary} onClick={() => setReplyTarget('')}>Cancelar</button></div>
      </div>}
    </section>}

    {tab === 'automation' && <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <section className={card + ' xl:col-span-8 p-5 sm:p-6 space-y-5'}>
        <div><h3 className="text-lg font-bold text-white flex gap-2 items-center"><Bot className="w-5 h-5 text-blue-400" />Resposta automática WhatsApp</h3>
          <p className="text-xs text-slate-400 mt-2">Uma mensagem de boas-vindas para contatos que iniciam conversa.</p></div>
        <label className="flex gap-3 items-center cursor-pointer text-sm text-slate-300">
          <input type="checkbox" checked={autoEnabled} onChange={e => setAutoEnabled(e.target.checked)} disabled={!state?.whatsapp.connected || !state?.isOwner} className="accent-blue-500 w-4 h-4"/>
          Ativar automação de boas-vindas</label>
        <div><label className="text-xs font-bold text-slate-300 block mb-2">Texto da resposta</label>
          <textarea className={input} rows={5} value={greeting} onChange={e => setGreeting(e.target.value)} disabled={!state?.isOwner}
            placeholder="Olá! Obrigado por entrar em contato. Nossa equipe responderá em breve." /></div>
        <button className={primary} disabled={!state?.isOwner || Boolean(busy)} onClick={saveAutomation}><Settings2 className="w-4 h-4" />Salvar configurações</button>
      </section>
      <aside className={card + ' xl:col-span-4 p-5 sm:p-6'}>
        <h4 className="text-sm font-bold text-white flex gap-2 items-center"><ShieldCheck className="w-4 h-4 text-blue-400" />Proteção da conta</h4>
        <div className="mt-4 text-xs text-slate-400 space-y-3">
          <p>Desativada por padrão até autorização do dono.</p>
          <p>Responde apenas contatos que escreveram primeiro.</p>
          <p>Limite: uma resposta automática por contato a cada 24 horas.</p>
          <p>Não envia disparos em massa nem contorna as políticas da Meta.</p>
        </div>
      </aside>
    </div>}

    {tab === 'insights' && <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <section className={card + ' p-5 sm:p-6'}>
        <h3 className="text-lg font-bold text-white">Métricas operacionais reais</h3>
        <p className="mt-2 text-xs text-slate-400">Contagens de registros salvos no AgencyOS.</p>
        <div className="space-y-2 mt-5">{[
          ['Rascunhos', drafts.filter(d => d.status === 'rascunho').length],
          ['Na fila', scheduled],
          ['Publicações confirmadas', drafts.filter(d => d.status === 'publicado').length],
          ['Mensagens recebidas', received.length],
        ].map(([label, number]) => <div key={String(label)} className="flex justify-between gap-4 px-4 py-3 bg-[#0A182F] border border-[#253B5A] rounded-xl text-xs">
          <span className="text-slate-300">{label}</span><b className="text-blue-300 tabular-nums">{number}</b></div>)}</div>
      </section>
      <section className={card + ' p-5 sm:p-6'}>
        <h3 className="text-lg font-bold text-white">Desempenho de audiência</h3>
        <div className="mt-5 rounded-2xl border border-dashed border-[#304666] p-8 text-center">
          <BarChart3 className="w-8 h-8 text-blue-400 mx-auto"/>
          <h4 className="mt-3 font-bold text-sm text-white">Ainda sem métricas autorizadas</h4>
          <p className="text-xs text-slate-400 mt-2">Alcance, engajamento e melhores horários exigem consulta às métricas oficiais da conta. Nada será inventado.</p>
        </div>
      </section>
    </div>}
  </div>;
};

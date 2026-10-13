import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertCircle, ArrowRight, BadgeCheck, Building2, Check, CheckCircle2,
  ChevronDown, CircleHelp, Clock3, Copy, DollarSign, Edit3, ExternalLink,
  Eye, FileLock2, Filter, KeyRound, LayoutGrid, Loader2, LockKeyhole, Mail,
  MoreHorizontal, Plus, RefreshCw, Search, Settings2, Shield, ShieldCheck,
  ShieldAlert, Trash2, UserCheck, UserPlus, Users, X,
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { ALL_SYSTEM_MODULES } from '../lib/permissions';
import { EMPLOYEE_MODULE_SET, splitEmployeeModules } from '../shared/agencyModules';
import type { FirestoreUserProfile } from '../lib/firebase';

type AdminTab = 'team' | 'clients' | 'access' | 'plans' | 'activity';
type Member = {
  uid: string; name: string; email: string; agencyName: string;
  userType: 'employee' | 'client' | null; agencyOwnerUid?: string;
  role: string; allowedModules: string[]; status: string; invitationStatus: string;
  hasSignedIn: boolean; avatarUrl?: string; createdAt: string; plan?: string;
  subscriptionStatus?: string; isAuthAccount: boolean;
};
type AuditEvent = { id: string; actorUid: string; targetUid: string; action: string; createdAt: string };
type Summary = {
  users: Member[]; employees: number; clients: number;
  platformAdmin: boolean; limited: boolean; billingConnected: boolean;
  legacyOwnerProfile?: boolean; conflictingOwnerLink?: boolean;
  workspaceScope?: 'own' | 'verified_legacy';
};
type LegacyInfo = {
  recoverable: boolean; reason: string; legacyOwnerUid: string | null;
  memberCount: number; verifiedMemberCount: number; alreadyLinked: boolean;
};
type InviteKind = 'employee' | 'client';
const panel = 'rounded-[22px] border border-[#23375A] bg-[#0D182C] shadow-lg shadow-[#030A19]/15';
const actionBtn = 'inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2.5 text-xs font-bold hover:bg-blue-500 disabled:opacity-50 transition-colors';
const outlineBtn = 'inline-flex items-center justify-center gap-2 rounded-xl border border-[#32496B] bg-[#142746] px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-[#1E375B] disabled:opacity-45 transition-colors';
const inputStyle = 'w-full rounded-xl border border-[#344968] bg-[#091428] px-3.5 py-3 text-sm text-white outline-none placeholder-slate-500 focus:border-blue-500';
const fullModules = ALL_SYSTEM_MODULES.filter(m => EMPLOYEE_MODULE_SET.has(m.id))
  .map(m => ({ id: m.id, name: m.name }));
const presetModules = ['dashboard', 'kanban', 'agenda', 'ponto'];

export const AdminView: React.FC<{ currentUser?: FirestoreUserProfile | null }> = ({ currentUser }) => {
  const [tab, setTab] = useState<AdminTab>('team');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [legacy, setLegacy] = useState<LegacyInfo | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked' | 'pending'>('all');
  const [selected, setSelected] = useState<Member | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editModules, setEditModules] = useState<string[]>([]);
  const [editModulesDirty, setEditModulesDirty] = useState(false);
  const [ignoredLegacyModules, setIgnoredLegacyModules] = useState<string[]>([]);
  const [activationLink, setActivationLink] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteKind, setInviteKind] = useState<InviteKind>('employee');
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Colaborador');
  const [inviteAgency, setInviteAgency] = useState('');
  const [inviteModules, setInviteModules] = useState<string[]>(presetModules);
  const [invitationLink, setInvitationLink] = useState('');
  const [busy, setBusy] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [menuUser, setMenuUser] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');

  const api = useCallback(async (path: string, init: RequestInit = {}) => {
    await auth.authStateReady();
    const identity = auth.currentUser;
    if (!identity) throw new Error('Faça login novamente para gerenciar a empresa.');
    const token = await identity.getIdToken();
    const result = await fetch('/api/admin/' + path, { ...init,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, ...(init.headers || {}) },
    });
    const responseType = result.headers.get('content-type') || '';
    const json = responseType.includes('application/json')
      ? await result.json().catch(() => null)
      : null;
    if (!result.ok) {
      if (typeof json?.error === 'string') throw new Error(json.error);
      throw new Error(
        'API administrativa indisponível (HTTP ' + result.status +
        '). Confira a implantação da função na Vercel.'
      );
    }
    if (!json) throw new Error('Resposta inesperada da API administrativa. Verifique a rota no servidor.');
    return json;
  }, []);

  const reload = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await api('members');
      if (!Array.isArray(result.users)) {
        throw new Error('A API não retornou a lista de usuários. Confira a autenticação do Firebase.');
      }
      setSummary(result); setMenuUser(null);
      if (result.conflictingOwnerLink) {
        // Only the backend may decide if the linked legacy workspace
        // belongs to the verified Firebase Authentication account.
        try { setLegacy(await api('legacy-workspace')); }
        catch { setLegacy(null); }
      } else setLegacy(null);
      if (selected) {
        const fresh = (result.users || []).find((x: Member) => x.uid === selected.uid);
        setSelected(fresh || null);
      }
    } catch (e: any) { setSummary(null); setError(e.message || 'Não foi possível carregar as contas.'); }
    finally { setLoading(false); }
  }, [api, selected?.uid]);

  useEffect(() => { void reload(); }, [api]);
  useEffect(() => {
    if (tab !== 'activity') return;
    void api('audit').then(d => setAudit(d.entries || []))
      .catch((e: any) => setError(e.message || 'Auditoria indisponível.'));
  }, [tab, api]);

  function openMember(member: Member) {
    setSelected(member);
    const normalized = splitEmployeeModules(member.allowedModules);
    setEditName(member.name); setEditRole(member.role);
    setEditModules(normalized.valid); setIgnoredLegacyModules(normalized.ignored);
    setEditModulesDirty(false);
    setMenuUser(null);
  }
  async function run(action: string, body: () => Promise<void>) {
    if (busy) return;
    setBusy(action); setError(''); setNotice('');
    try { await body(); } catch (e: any) { setError(e.message || 'Não foi possível salvar.'); }
    finally { setBusy(''); }
  }
  function patchMember(member: Member, patch: object, message: string) {
    void run('update', async () => {
      await api('members/' + encodeURIComponent(member.uid), { method: 'PATCH', body: JSON.stringify(patch) });
      setNotice(message);
      await reload();
    });
  }
  function toggleMember(member: Member) {
    if (member.uid === currentUser?.uid) { setError('Não é possível alterar sua própria conta por aqui.'); return; }
    const block = member.status !== 'blocked';
    if (!window.confirm(block ? 'Bloquear o acesso de ' + member.name + '? A sessão será revogada.' :
      'Reativar o acesso desta pessoa ao AgencyOS?')) return;
    patchMember(member, { status: block ? 'blocked' : 'active' },
      block ? 'Acesso bloqueado no Firebase Authentication.' : 'Conta reativada.');
  }
  function saveMember() {
    if (!selected) return;
    if (selected.uid === currentUser?.uid) { setError('Sua própria conta não pode ser editada aqui.'); return; }
    const patch = selected.userType === 'employee'
      ? {
          name: editName, role: editRole,
          ...(editModulesDirty ? { allowedModules: editModules } : {}),
        }
      : { name: editName };
    void run('update', async () => {
      await api('members/' + encodeURIComponent(selected.uid), { method: 'PATCH', body: JSON.stringify(patch) });
      setSelected(null); setNotice('Dados e permissões salvos no servidor.');
      await reload();
    });
  }
  function activateLegacy(member: Member) {
    if (member.isAuthAccount || busy || !window.confirm(
      'Ativar este cadastro antigo e liberar seu acesso? O funcionário precisará definir uma senha pelo link oficial do Firebase. Nenhuma senha anterior será reutilizada.'
    )) return;
    void run('activate-' + member.uid, async () => {
      const result = await api('members/' + encodeURIComponent(member.uid) + '/activate', {
        method: 'POST', body: JSON.stringify({ confirm: true }),
      });
      if (!result.invitationUrl) throw new Error('O servidor não retornou o link de ativação.');
      setActivationLink(result.invitationUrl);
      setNotice('Conta preparada no Firebase. Envie o link de ativação por um canal seguro.');
      await reload();
    });
  }

  function createInvite() {
    void run('invite', async () => {
      const result = await api('invite', { method: 'POST', body: JSON.stringify({
        kind: inviteKind, name: inviteName, email: inviteEmail, role: inviteRole,
        agencyName: inviteAgency, allowedModules: inviteModules,
      }) });
      setInvitationLink(result.invitationUrl || '');
      setNotice('Pré-cadastro criado. Envie o link de definição de senha à pessoa convidada.');
      await reload();
    });
  }
  const rows = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR');
    return (summary?.users || []).filter(member => {
      const isEmployee = member.userType === 'employee';
      if (tab === 'team' && !isEmployee) return false;
      if (tab === 'clients' && isEmployee) return false;
      const q = [member.name, member.email, member.role, member.agencyName].join(' ').toLocaleLowerCase('pt-BR');
      if (query && !q.includes(query)) return false;
      if (filter === 'active' && member.status !== 'active') return false;
      if (filter === 'blocked' && member.status !== 'blocked') return false;
      if (filter === 'pending' && (member.hasSignedIn || member.invitationStatus !== 'pending')) return false;
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [tab, search, filter, summary]);
  const employees = (summary?.users || []).filter(p => p.userType === 'employee');
  const clients = (summary?.users || []).filter(p => p.userType !== 'employee');
  const activeEmployees = employees.filter(p => p.isAuthAccount && p.status === 'active').length;
  const pendingInvites = (summary?.users || []).filter(p => p.invitationStatus === 'pending' && !p.hasSignedIn).length;
  const duplicates = useMemo(() => {
    const count = new Map<string, number>();
    for (const member of summary?.users || []) {
      const email = member.email.toLowerCase().trim();
      if (email) count.set(email, (count.get(email) || 0) + 1);
    }
    return new Set([...count].filter(([, c]) => c > 1).map(([e]) => e));
  }, [summary]);

  const tabs: { id: AdminTab; label: string; icon: any; count?: number }[] = [
    { id: 'team', label: 'Minha equipe', icon: Users, count: employees.length },
    ...(summary?.platformAdmin ? [{ id: 'clients' as const, label: 'Clientes SaaS', icon: Building2, count: clients.length }] : []),
    { id: 'access', label: 'Acessos', icon: ShieldCheck },
    { id: 'plans', label: 'Planos e cobranças', icon: DollarSign },
    { id: 'activity', label: 'Auditoria', icon: Activity },
  ];
  const statusBadge = (member: Member) => {
    if (!member.isAuthAccount) return <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/25">Cadastro legado</span>;
    if (member.status === 'blocked') return <span className="px-2 py-1 rounded-full bg-rose-500/10 text-rose-300 text-[10px] font-bold border border-rose-500/25">Bloqueado</span>;
    if (member.invitationStatus === 'pending' && !member.hasSignedIn)
      return <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-200 text-[10px] font-bold border border-amber-500/25">Convite pendente</span>;
    return <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-bold border border-emerald-500/25">Ativo</span>;
  };
  const avatar = (member: Member) => member.avatarUrl ?
    <img src={member.avatarUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-[#34517A]" referrerPolicy="no-referrer" /> :
    <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center bg-[#1A3767] text-blue-200 font-extrabold text-sm border border-blue-500/20">
      {(member.name || member.email || '?').slice(0, 1).toUpperCase()}</div>;
  const memberActions = (member: Member) => <div className="flex flex-wrap gap-2 justify-end">
    {!member.isAuthAccount && member.userType === 'employee' && (
      <button className={actionBtn} disabled={Boolean(busy)} onClick={() => activateLegacy(member)}>
        {busy === 'activate-' + member.uid ? <Loader2 className="w-4 h-4 animate-spin"/> : <KeyRound className="w-4 h-4"/>}
        Ativar conta
      </button>
    )}
    <button className={outlineBtn} onClick={() => openMember(member)} disabled={!member.isAuthAccount}>
      <Settings2 className="w-4 h-4" />Gerenciar</button>
    {member.uid !== currentUser?.uid && <button className={outlineBtn + (member.status !== 'blocked' ? ' text-rose-200' : '')}
      onClick={() => toggleMember(member)} disabled={Boolean(busy) || !member.isAuthAccount}>
      {member.status === 'blocked' ? <UserCheck className="w-4 h-4" /> : <LockKeyhole className="w-4 h-4" />}
      {member.status === 'blocked' ? 'Reativar' : 'Bloquear'}</button>}
  </div>;

  const renderMemberCard = (member: Member) => <article className={panel + ' p-4 sm:p-5'} key={member.uid}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex gap-3 items-center min-w-0">{avatar(member)}
        <div className="min-w-0"><p className="font-bold text-sm text-white truncate">{member.name || 'Sem nome'}</p>
          <p className="text-xs text-slate-400 truncate">{member.email || 'Sem e-mail'}</p></div></div>
      {statusBadge(member)}
    </div>
    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-400">
      <div><p className="text-[10px] uppercase tracking-wider mb-1">Cargo ou plano</p>
        <p className="text-slate-200 font-medium">{member.userType === 'employee' ? member.role || 'Colaborador' : member.plan || 'Sem plano'}</p></div>
      <div><p className="text-[10px] uppercase tracking-wider mb-1">Acesso</p>
        <p className="text-slate-200 font-medium">{member.userType === 'employee' ? member.allowedModules.length + ' módulos' : 'Workspace individual'}</p></div>
    </div>
    {duplicates.has(member.email.toLowerCase().trim()) &&
      <p className="mt-3 text-amber-300 text-[11px] flex gap-1.5 items-center"><ShieldAlert className="w-3.5 h-3.5" />E-mail repetido — revisar os registros</p>}
    <div className="mt-4 pt-4 border-t border-[#263C5E]">{memberActions(member)}</div>
  </article>;

  return <div className="max-w-[1650px] mx-auto pb-12 text-slate-100 space-y-5">
    <section className="relative rounded-[26px] overflow-hidden border border-[#2A4471] bg-gradient-to-br from-[#122D60] via-[#0F2247] to-[#081428] p-5 sm:p-7">
      <div className="absolute -right-20 -top-32 w-80 h-80 rounded-full blur-3xl bg-blue-500/10 pointer-events-none" />
      <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div><p className="flex items-center gap-2 uppercase font-bold text-[10px] tracking-[0.16em] text-blue-300 mb-3">
          <ShieldCheck className="w-4 h-4" />Administração e segurança</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Pessoas e acessos</h2>
          <p className="text-slate-400 text-sm max-w-2xl mt-2">Gerencie sua equipe e os acessos de cada pessoa com clareza, sem misturar funcionários, clientes e planos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={outlineBtn} onClick={() => void reload()} disabled={loading}><RefreshCw className={'w-4 h-4 ' + (loading ? 'animate-spin' : '')} />Atualizar</button>
          <button className={actionBtn} disabled={Boolean(summary?.conflictingOwnerLink)}
            title={summary?.conflictingOwnerLink ? 'Confirme primeiro o workspace antigo para não cadastrar pessoas na empresa errada.' : 'Convidar um funcionário'}
            onClick={() => {
            setInviteKind('employee'); setInvitationLink(''); setInviteName(''); setInviteEmail(''); setInviteModules([...presetModules]); setShowInvite(true);
          }}><UserPlus className="w-4 h-4" />Convidar funcionário</button>
          {summary?.platformAdmin && <button className={outlineBtn} onClick={() => {
            setInviteKind('client'); setInvitationLink(''); setInviteName(''); setInviteEmail(''); setInviteAgency(''); setShowInvite(true);
          }}><Building2 className="w-4 h-4" />Novo cliente</button>}
        </div>
      </div>
    </section>

    {error && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 flex gap-2 text-sm text-rose-200"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}</div>}
    {notice && <div role="status" className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 flex gap-2 text-sm text-emerald-200"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />{notice}</div>}

    {summary?.conflictingOwnerLink && <section role="status" className="rounded-2xl border border-amber-500/30 bg-[#1C170C] p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2 text-amber-200 font-bold text-sm">
        <ShieldAlert className="w-4 h-4 shrink-0" />Recuperação da equipe antiga
      </div>
      <p className="text-xs text-amber-100/85 leading-relaxed">
        Existe um vínculo de cadastro legado com outro identificador de workspace.
        Por segurança, nenhum funcionário foi transferido e nenhum dado foi apagado.
      </p>
      {!legacy ? <p className="text-xs text-slate-400">Ainda não foi possível confirmar a identidade do proprietário antigo. Mantenha sua equipe atual separada até a revisão.</p>
      : legacy.recoverable ? <>
        <p className="text-xs text-slate-200">
          Confirmação de propriedade disponível: <b>{legacy.memberCount}</b> registros associados ao workspace antigo,
          dos quais <b>{legacy.verifiedMemberCount}</b> têm conta Firebase Auth com e-mail correspondente.
          Os registros sem autenticação continuarão identificados como cadastros legados.
        </p>
        <p className="text-[11px] text-amber-200/90">
          A recuperação vinculará sua conta autenticada ao workspace antigo, mantendo seus dados e permissões originais.
          Não altera as senhas, não transfere dados de outras empresas e fica registrada na auditoria.
        </p>
        <button className={actionBtn} disabled={Boolean(busy)} onClick={() => {
          if (!legacy.legacyOwnerUid || !window.confirm(
            'Confirmar que este workspace antigo pertence à sua empresa? O vínculo será registrado após validação pelo Firebase.'
          )) return;
          void run('legacy-recovery', async () => {
            await api('legacy-workspace/claim', { method: 'POST',
              body: JSON.stringify({ legacyOwnerUid: legacy.legacyOwnerUid, confirm: true }) });
            await reload();
            setNotice('Vínculo do workspace antigo confirmado no servidor. Os registros preservados foram recarregados.');
          });
        }}>
          {busy === 'legacy-recovery' ? <Loader2 className="h-4 w-4 animate-spin"/> : <ShieldCheck className="w-4 h-4"/>}
          Confirmar propriedade e recuperar equipe
        </button>
      </> : <div className="space-y-2">
        <p className="text-xs text-amber-100">
          A verificação não encontrou evidência suficiente para recuperar automaticamente esse workspace
          ({legacy.reason.replaceAll('_',' ')}). Nenhuma pessoa foi movida.
        </p>
        <p className="text-[11px] text-slate-400">Se você é o proprietário, será necessário confirmar a vinculação antiga pelo Firebase antes de associar os colaboradores. Não é seguro recuperar contas apenas pelo nome ou pelo e-mail informado no perfil.</p>
      </div>}
    </section>}
    {summary?.workspaceScope === 'verified_legacy' && <div role="status" className="text-xs rounded-xl border border-emerald-500/25 bg-emerald-500/5 text-emerald-200 p-3 flex gap-2">
      <ShieldCheck className="h-4 w-4 shrink-0" />Workspace antigo confirmado pela autenticação Firebase. Sua equipe é exibida sem copiar cadastros para outras empresas.
    </div>}
    {summary?.legacyOwnerProfile && !summary.conflictingOwnerLink &&
      summary.workspaceScope !== 'verified_legacy' && <div className="text-xs rounded-xl border border-blue-500/30 bg-blue-500/5 text-blue-200 p-3">
        Sua conta tem uma classificação antiga. Esta tela só apresenta membros com vínculo explícito ao seu workspace autenticado.
      </div>}
    {summary?.limited && <div className="text-xs rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-200 p-3">
      A consulta foi limitada a 150 contas. A paginação para bases maiores ainda precisa ser adicionada antes de lançar o SaaS.</div>}

    <section aria-label="Resumo administrativo" className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {[
        { label: 'Membros da equipe', value: summary ? String(employees.length) : '—', icon: Users, note: activeEmployees + ' habilitados' },
        { label: 'Clientes cadastrados', value: summary?.platformAdmin ? String(clients.length) : '—', icon: Building2,
          note: summary?.platformAdmin ? 'Contas SaaS no Firebase' : 'Visão exclusiva do administrador global' },
        { label: 'Convites pendentes', value: summary ? String(pendingInvites) : '—', icon: Mail, note: 'Aguardando primeiro acesso' },
        { label: 'MRR confirmado', value: '—', icon: DollarSign, note: 'Aguardando integração de cobranças' },
      ].map(item => { const Icon = item.icon; return <div className={panel + ' p-4 sm:p-5'} key={item.label}>
        <div className="flex justify-between gap-2 text-xs text-slate-400"><span>{item.label}</span><Icon className="w-4 h-4 shrink-0 text-blue-400" /></div>
        <p className="text-2xl sm:text-3xl text-white font-extrabold tabular-nums mt-3">{loading && !summary ? '…' : item.value}</p>
        <p className="text-[11px] text-slate-500 mt-1">{item.note}</p></div>; })}
    </section>

    <nav className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-[#0A1427] border border-[#243957]" aria-label="Áreas administrativas">
      {tabs.map(t => { const Icon = t.icon; return <button type="button" key={t.id} onClick={() => { setTab(t.id); setSearch(''); setFilter('all'); }}
        className={'whitespace-nowrap flex gap-2 items-center px-4 py-3 rounded-xl text-xs font-bold transition-colors ' + (tab === t.id ? 'bg-[#1D3C70] text-white ring-1 ring-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-[#152A4D]')}>
        <Icon className="h-4 w-4" />{t.label}{typeof t.count === 'number' && <span className="rounded-lg px-1.5 py-0.5 bg-white/10">{t.count}</span>}</button>; })}
    </nav>

    {(tab === 'team' || tab === 'clients') && <>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div><h3 className="text-lg font-extrabold text-white">{tab === 'team' ? 'Minha equipe' : 'Clientes AgencyOS'}</h3>
          <p className="text-xs text-slate-400 mt-1">{tab === 'team' ? 'Funcionários vinculados à empresa, cada um com permissões próprias.' : 'Empresas clientes com workspaces independentes.'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input className={inputStyle + ' pl-9 w-full sm:w-64'} aria-label="Buscar pessoas" value={search}
              onChange={e => setSearch(e.target.value)} placeholder="Buscar pessoa ou empresa..." />
          </div>
          <select aria-label="Filtrar status" className={inputStyle + ' w-auto'} value={filter} onChange={e => setFilter(e.target.value as typeof filter)}>
            <option value="all">Todos</option><option value="active">Habilitados</option>
            <option value="pending">Convite pendente</option><option value="blocked">Bloqueados</option>
          </select>
          <button className={outlineBtn} onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')} aria-label="Alternar visualização">
            <LayoutGrid className="h-4 w-4" />{viewMode === 'cards' ? 'Tabela' : 'Cartões'}</button>
        </div>
      </div>
      {loading && !summary ? <div className={panel + ' p-14 text-center text-slate-400 text-sm'}>
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-blue-400" />Carregando os usuários autorizados…</div>
      : rows.length === 0 ? <div className={panel + ' py-14 px-6 text-center'}>
        <Users className="w-10 h-10 text-blue-400 mx-auto"/><h4 className="font-bold text-white mt-4">{search || filter !== 'all' ? 'Nenhum resultado para os filtros' :
          summary?.conflictingOwnerLink ? 'Equipe antiga aguardando verificação' : 'Nenhum cadastro nesta área'}</h4>
        <p className="text-xs text-slate-400 mt-2">{summary?.conflictingOwnerLink
          ? 'Use a recuperação acima para verificar a propriedade do workspace antigo. Não recrie funcionários nem cadastre novamente a mesma empresa.'
          : 'A lista é composta por contas reais ou cadastros legados do workspace autorizado. Nenhum usuário fictício será criado.'}</p>
        {(search || filter !== 'all') && <button className={outlineBtn + ' mt-4'} onClick={() => { setSearch(''); setFilter('all'); }}>Limpar filtros</button>}
      </div> : <>
        <div className={(viewMode === 'cards' ? '' : 'lg:hidden ') + 'grid grid-cols-1 sm:grid-cols-2 gap-3'}>{rows.map(renderMemberCard)}</div>
        {viewMode === 'list' && <div className={panel + ' hidden lg:block overflow-x-auto'}>
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0A152A] text-slate-500 uppercase tracking-wide text-[10px] border-b border-[#243859]">
              <tr><th className="px-5 py-4">Pessoa / conta</th><th className="px-4 py-4">Cargo ou plano</th>
                <th className="px-4 py-4">Acessos</th><th className="px-4 py-4">Situação</th><th className="px-5 py-4 text-right">Ações</th></tr>
            </thead>
            <tbody className="divide-y divide-[#253856]">
              {rows.map(member => <tr key={member.uid} className="hover:bg-[#152848]/50">
                <td className="p-4"><div className="flex items-center gap-3 min-w-0">{avatar(member)}
                  <div className="min-w-0"><p className="text-sm font-bold text-white max-w-[250px] truncate">{member.name || 'Sem nome'}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[260px]">{member.email}</p>
                    {duplicates.has(member.email.toLowerCase().trim()) && <p className="mt-1 text-[10px] text-amber-300">Possível duplicação</p>}
                  </div></div></td>
                <td className="p-4"><p className="font-medium text-slate-200">{member.userType === 'employee' ? member.role || 'Colaborador' : member.plan || 'Sem plano'}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{member.userType === 'employee' ? 'Equipe interna' : member.agencyName}</p></td>
                <td className="p-4 text-slate-300">{member.userType === 'employee' ? member.allowedModules.length + ' módulos liberados' : 'Área independente'}</td>
                <td className="p-4">{statusBadge(member)}</td>
                <td className="p-4 text-right">{memberActions(member)}</td>
              </tr>)}
            </tbody>
          </table></div>}
        <p className="text-[11px] text-slate-500 px-1">{rows.length} contas encontradas. Nenhum registro é excluído automaticamente.</p>
      </>}
    </>}

    {tab === 'access' && <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <section className={panel + ' p-5 sm:p-6 lg:col-span-8'}>
        <h3 className="text-lg text-white font-extrabold flex items-center gap-2"><Shield className="h-5 w-5 text-blue-400" />Permissões por pessoa</h3>
        <p className="mt-2 text-xs text-slate-400">Cada funcionário só recebe os módulos autorizados pelo responsável. Selecione uma pessoa para personalizar o acesso.</p>
        <div className="space-y-2 mt-5">
          {employees.length === 0 ? <p className="text-sm text-slate-400 border border-dashed border-[#304567] rounded-xl p-6 text-center">Ainda não existem funcionários cadastrados.</p> :
            employees.map(member => <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#253B5E] bg-[#09162C] p-3" key={member.uid}>
              <div className="flex items-center gap-2.5">{avatar(member)}
                <div><p className="text-sm font-bold text-white">{member.name}</p><p className="text-[11px] text-slate-400">{member.allowedModules.length} módulos • {member.role}</p></div></div>
              <button onClick={() => openMember(member)} className={outlineBtn}><Settings2 className="w-4 h-4" />Permissões</button>
            </div>)}
        </div>
      </section>
      <aside className={panel + ' lg:col-span-4 p-5 sm:p-6'}>
        <h4 className="font-extrabold text-white text-sm flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-blue-400" />Segurança e governança</h4>
        <div className="space-y-3 mt-4 text-xs text-slate-400">
          <p>• A alteração exige sessão autenticada no Firebase.</p>
          <p>• O servidor confirma a empresa vinculada ao funcionário.</p>
          <p>• Ninguém muda o próprio papel por esta tela.</p>
          <p>• Planos pagos não são ativados por edição manual.</p>
          <p>• Cada operação administrativa registra auditoria.</p>
        </div>
      </aside>
    </div>}

    {tab === 'plans' && <section className={panel + ' p-6 sm:p-8'}>
      <div className="flex flex-wrap justify-between gap-4">
        <div><h3 className="text-lg font-extrabold text-white flex items-center gap-2"><DollarSign className="w-5 h-5 text-blue-400" />Planos e assinaturas</h3>
          <p className="mt-2 text-xs text-slate-400 max-w-2xl">O histórico de pagamentos precisa vir de eventos reais de cobrança validados pelo servidor. Não exibimos receita estimada com preços fictícios.</p></div>
        <span className="rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-200 text-[11px] font-bold self-start px-3 py-1.5">Conciliação de pagamentos pendente</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
        {['Assinaturas confirmadas', 'MRR conciliado', 'Cobranças em atraso'].map(label =>
          <div key={label} className="bg-[#0A172E] border border-[#294063] rounded-2xl p-5">
            <p className="text-xs text-slate-400">{label}</p><p className="text-2xl font-extrabold mt-2 text-white">—</p>
            <p className="mt-2 text-[11px] text-slate-500">Conectar provedor e validar webhooks</p></div>)}
      </div>
      <div className="mt-6 border-t border-[#263D60] pt-5">
        <h4 className="font-bold text-white text-sm">Separação de contas</h4>
        <p className="text-xs text-slate-400 mt-2">Funcionários pertencem ao workspace de sua agência. Clientes SaaS possuem workspace próprio. O cadastro de um cliente não comprova pagamento nem ativa assinatura.</p>
      </div>
    </section>}

    {tab === 'activity' && <section className={panel + ' overflow-hidden'}>
      <div className="p-5 sm:p-6 border-b border-[#263958]">
        <h3 className="text-lg font-bold text-white">Histórico de alterações administrativas</h3>
        <p className="text-xs text-slate-400 mt-2">Somente eventos administrativos registrados pelo servidor.</p>
      </div>
      {audit.length === 0 ? <div className="py-14 px-5 text-center">
        <Activity className="w-9 h-9 text-blue-400 mx-auto"/><p className="font-bold text-white mt-3">Nenhuma alteração registrada</p>
        <p className="text-xs text-slate-400 mt-2">Convites e alterações de acesso aparecerão aqui.</p></div>
        : <div className="divide-y divide-[#253858]">
          {audit.map(entry => <div key={entry.id} className="p-4 sm:p-5 flex gap-3 items-start">
            <div className="bg-[#1B365B] text-blue-300 rounded-xl p-2"><ShieldCheck className="w-4 h-4" /></div>
            <div><p className="text-sm font-semibold text-white">{entry.action === 'user.invited' ? 'Usuário convidado' : 'Conta atualizada'}</p>
              <p className="text-xs text-slate-400 mt-1">Conta: {entry.targetUid}</p>
              <p className="text-[11px] text-slate-500 mt-1">{entry.createdAt ? new Date(entry.createdAt).toLocaleString('pt-BR') : 'Data indisponível'}</p></div>
          </div>)}
        </div>}
    </section>}

    {selected && <div className="fixed inset-0 z-[70] flex justify-end bg-[#020916]/75 backdrop-blur-sm" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}>
      <aside role="dialog" aria-modal="true" aria-label="Gerenciar pessoa" className="w-full max-w-lg bg-[#0B1629] border-l border-[#29466B] h-full overflow-y-auto shadow-2xl p-5 sm:p-7 space-y-5">
        <div className="flex items-start justify-between gap-3"><div>
          <h3 className="text-xl font-extrabold text-white">Gerenciar acesso</h3>
          <p className="mt-1 text-xs text-slate-400">{selected.email}</p></div>
          <button aria-label="Fechar" onClick={() => setSelected(null)} className={outlineBtn}><X className="w-4 h-4" /></button></div>
        <div className="p-4 rounded-xl border border-[#2B4568] bg-[#11213D]">
          <p className="text-xs text-slate-400">Estado atual</p><div className="mt-2">{statusBadge(selected)}</div>
          {selected.uid === currentUser?.uid && <p className="text-xs text-amber-200 mt-3">Sua conta não pode editar os próprios privilégios.</p>}
        </div>
        <div><label className="block text-xs font-bold text-slate-300 mb-2">Nome</label>
          <input value={editName} onChange={e => setEditName(e.target.value)} className={inputStyle}/></div>
        {selected.userType === 'employee' ? <>
          <div><label className="block text-xs font-bold text-slate-300 mb-2">Cargo</label>
            <input value={editRole} onChange={e => setEditRole(e.target.value)} className={inputStyle}/></div>
          <div><div className="flex justify-between items-center gap-2 mb-3"><label className="text-xs font-bold text-white">Módulos permitidos</label>
            <span className="text-[11px] text-blue-300 font-bold">{editModules.length} selecionados</span></div>
            {ignoredLegacyModules.length > 0 && <p className="text-[11px] text-amber-200 mb-3 p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl">
              Este cadastro contém {ignoredLegacyModules.length} permissão(ões) antiga(s) ou restrita(s):
              {' '}{ignoredLegacyModules.join(', ')}. Editar o nome ou cargo não altera essas permissões.
              Se você modificar a seleção abaixo, somente os módulos operacionais escolhidos serão salvos.
            </p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[48vh] overflow-y-auto pr-1">
              {fullModules.map(mod => <label key={mod.id} className={'flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs ' +
                (editModules.includes(mod.id) ? 'border-blue-500/40 bg-[#19345B] text-white' : 'border-[#293D5B] bg-[#091527] text-slate-400')}>
                <input type="checkbox" className="accent-blue-500" checked={editModules.includes(mod.id)}
                  onChange={e => { setEditModulesDirty(true); setEditModules(prev => e.target.checked ? [...prev, mod.id] : prev.filter(id => id !== mod.id)); }}/>
                {mod.name}</label>)}
            </div>
          </div>
        </> : <div className="rounded-xl bg-[#121F37] border border-[#294368] p-4 text-xs text-slate-400">
          Permissões de clientes SaaS seguem o plano contratado; elas não são liberadas manualmente.</div>}
        <div className="flex gap-2 pt-4 border-t border-[#2A3E60]">
          <button className={actionBtn} disabled={Boolean(busy) || !editName.trim() ||
            (selected.userType === 'employee' && editModulesDirty && editModules.length === 0) ||
            selected.uid === currentUser?.uid}
            onClick={saveMember}>{busy ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4"/>}Salvar alterações</button>
          <button className={outlineBtn} onClick={() => setSelected(null)}>Cancelar</button>
        </div>
      </aside>
    </div>}

    {activationLink && <div role="presentation" className="fixed inset-0 z-[80] bg-[#020816]/85 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={e => { if (e.target === e.currentTarget) setActivationLink(''); }}>
      <section role="dialog" aria-modal="true" aria-label="Link de ativação do funcionário"
        className={panel + ' p-6 max-w-xl w-full space-y-4'}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-lg text-white">Ativação do funcionário</h3>
          <button className={outlineBtn} onClick={() => setActivationLink('')} aria-label="Fechar"><X className="h-4 w-4"/></button>
        </div>
        <p className="text-sm text-slate-300">A conta foi preparada no Firebase Authentication. Envie o link para o funcionário definir sua própria senha. O link não é enviado automaticamente por e-mail.</p>
        <textarea className={inputStyle + ' break-all'} rows={4} readOnly value={activationLink}/>
        <button className={actionBtn} onClick={() => void navigator.clipboard.writeText(activationLink).then(() => setNotice('Link de ativação copiado.'))}>
          <Copy className="w-4 h-4"/>Copiar link de ativação
        </button>
        <p className="text-[11px] text-amber-200">Compartilhe somente com a pessoa correta, por canal seguro. Não publique o link.</p>
      </section>
    </div>}

    {showInvite && <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-[#020816]/85 backdrop-blur-sm"
      role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setShowInvite(false); }}>
      <div role="dialog" aria-modal="true" aria-label="Convidar conta" className="rounded-[24px] border border-[#36537C] bg-[#0B172C] w-full max-w-xl max-h-[92dvh] overflow-y-auto p-5 sm:p-7 space-y-4 shadow-2xl">
        <div className="flex justify-between items-start gap-3"><div><h3 className="text-xl font-extrabold text-white">{inviteKind === 'employee' ? 'Convidar funcionário' : 'Cadastrar cliente SaaS'}</h3>
          <p className="text-xs mt-1 text-slate-400">Conta individual com autenticação real no Firebase.</p></div>
          <button onClick={() => setShowInvite(false)} className={outlineBtn} aria-label="Fechar"><X className="w-4 h-4" /></button></div>
        {invitationLink ? <div className="space-y-4">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Pré-cadastro realizado. O sistema não enviou e-mail automaticamente; compartilhe este link com a pessoa convidada por um canal seguro.
          </div>
          <div><label className="block text-xs font-semibold mb-2 text-slate-300">Link para definir a senha</label>
            <textarea rows={4} readOnly className={inputStyle + ' break-all'} value={invitationLink} /></div>
          <button className={actionBtn} onClick={() => void navigator.clipboard.writeText(invitationLink).then(() => setNotice('Link copiado com sucesso.'))}>
            <Copy className="w-4 h-4" />Copiar link seguro</button>
          <button className={outlineBtn} onClick={() => { setShowInvite(false); setInvitationLink(''); }}>Concluir</button>
        </div> : <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold mb-2 text-slate-300">Nome completo</label>
              <input className={inputStyle} value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Nome da pessoa" /></div>
            <div><label className="block text-xs font-semibold mb-2 text-slate-300">E-mail</label>
              <input type="email" className={inputStyle} value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="usuario@empresa.com" /></div>
          </div>
          {inviteKind === 'employee' ? <>
            <div><label className="block text-xs font-semibold mb-2 text-slate-300">Cargo na agência</label>
              <input className={inputStyle} value={inviteRole} onChange={e => setInviteRole(e.target.value)} placeholder="Ex.: Designer, SDR..." /></div>
            <p className="text-xs font-bold text-slate-300">Acessos iniciais</p>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto">
              {fullModules.map(mod => <label key={mod.id} className={'flex items-center gap-2 rounded-lg p-2 text-[11px] border ' +
                (inviteModules.includes(mod.id) ? 'text-blue-100 bg-[#1A3357] border-blue-500/30' : 'text-slate-400 bg-[#0A1629] border-[#2A3B57]')}>
                <input type="checkbox" className="accent-blue-500" checked={inviteModules.includes(mod.id)}
                  onChange={e => setInviteModules(prev => e.target.checked ? [...prev, mod.id] : prev.filter(id => id !== mod.id))}/>
                {mod.name}</label>)}
            </div>
          </> : <div><label className="block text-xs font-semibold mb-2 text-slate-300">Nome da empresa cliente</label>
            <input className={inputStyle} value={inviteAgency} onChange={e => setInviteAgency(e.target.value)} placeholder="Empresa cliente"/>
            <p className="text-[11px] text-amber-200 mt-2">O cadastro não cria cobrança ou assinatura. O pagamento precisa ser confirmado separadamente.</p></div>}
          <div className="rounded-xl bg-[#102441] border border-[#325174] p-3 text-xs text-slate-400 flex gap-2">
            <KeyRound className="w-4 h-4 text-blue-400 shrink-0" />A senha será definida pela própria pessoa no link de ativação. Nenhuma senha é exibida ou armazenada no painel.
          </div>
          <div className="flex gap-2 pt-2">
            <button className={actionBtn} disabled={Boolean(busy) || !inviteName.trim() || !inviteEmail.includes('@') || (inviteKind === 'employee' && inviteModules.length === 0)}
              onClick={createInvite}>{busy ? <Loader2 className="w-4 h-4 animate-spin"/> : <UserPlus className="w-4 h-4"/>}Criar pré-cadastro</button>
            <button className={outlineBtn} onClick={() => setShowInvite(false)}>Cancelar</button>
          </div>
        </>}
      </div>
    </div>}
  </div>;
};

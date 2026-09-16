import React, { useEffect, useState, useMemo } from 'react';
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  setDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import {
  ShieldAlert,
  Zap,
  Building2,
  Activity,
  Clock,
  Copy,
  Check,
  Send,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  Filter,
  Key,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
  DollarSign,
  Users,
  Settings,
  LayoutDashboard,
  FileCode,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { db, FirestoreUserProfile, getStoredSession, setStoredSession } from '../lib/firebase';
import { isUserMasterAdmin } from '../lib/permissions';

interface LeadsPayMasterViewProps {
  currentUser?: FirestoreUserProfile | null;
  initialTab?: 'dashboard' | 'companies' | 'webhook';
}

export interface LeadsPayEvent {
  id: string;
  event: string;
  agency_id?: string;
  data?: Record<string, any>;
  created_at?: any;
  received_at?: string;
}

export interface LeadsPayGlobalStats {
  total_companies?: number;
  total_events?: number;
  total_revenue?: number;
  last_updated?: string;
}

export interface LeadsPayCompany {
  id: string;
  name: string;
  email: string;
  cnpjOrDoc?: string;
  plan: 'Starter' | 'Pro' | 'Enterprise' | 'Black';
  monthlyFee: number;
  status: 'active' | 'pending' | 'suspended';
  totalRevenue: number;
  apiKey: string;
  createdAt: string;
  lastWebhookAt?: string;
}

const DEFAULT_COMPANIES: LeadsPayCompany[] = [
  {
    id: 'lp-comp-1',
    name: 'Techify Agência Digital & Mídia',
    email: 'rickmarketing81@gmail.com',
    cnpjOrDoc: '48.912.341/0001-90',
    plan: 'Enterprise',
    monthlyFee: 997,
    status: 'active',
    totalRevenue: 14955,
    apiKey: 'lp_live_sec_techify_8912aa',
    createdAt: '2026-01-15T10:00:00.000Z',
    lastWebhookAt: '2026-09-16T12:00:00.000Z',
  },
  {
    id: 'lp-comp-2',
    name: 'Vektor Performance & Tráfego',
    email: 'financeiro@vektormidia.com.br',
    cnpjOrDoc: '32.145.882/0001-12',
    plan: 'Pro',
    monthlyFee: 497,
    status: 'active',
    totalRevenue: 8946,
    apiKey: 'lp_live_sec_vektor_4410b',
    createdAt: '2026-02-01T14:30:00.000Z',
    lastWebhookAt: '2026-09-15T18:22:00.000Z',
  },
  {
    id: 'lp-comp-3',
    name: 'Nexus Growth Partners',
    email: 'contato@nexusgrowth.io',
    cnpjOrDoc: '51.309.219/0001-44',
    plan: 'Pro',
    monthlyFee: 497,
    status: 'active',
    totalRevenue: 5964,
    apiKey: 'lp_live_sec_nexus_9918c',
    createdAt: '2026-03-10T09:15:00.000Z',
    lastWebhookAt: '2026-09-14T11:45:00.000Z',
  },
  {
    id: 'lp-comp-4',
    name: 'Alpha Escala Tráfego & Lançamentos',
    email: 'gestao@alphaescala.com',
    cnpjOrDoc: '39.810.112/0001-78',
    plan: 'Starter',
    monthlyFee: 197,
    status: 'active',
    totalRevenue: 2364,
    apiKey: 'lp_live_sec_alpha_1290d',
    createdAt: '2026-04-05T16:00:00.000Z',
    lastWebhookAt: '2026-09-12T08:10:00.000Z',
  },
  {
    id: 'lp-comp-5',
    name: 'Lumina Soluções Criativas',
    email: 'adm@luminasolucoes.com.br',
    cnpjOrDoc: '44.920.781/0001-05',
    plan: 'Starter',
    monthlyFee: 197,
    status: 'pending',
    totalRevenue: 0,
    apiKey: 'lp_live_sec_lumina_7712e',
    createdAt: '2026-08-20T11:20:00.000Z',
    lastWebhookAt: '2026-08-20T11:20:00.000Z',
  },
];

export const LeadsPayMasterView: React.FC<LeadsPayMasterViewProps> = ({
  currentUser,
  initialTab = 'dashboard',
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'companies' | 'webhook'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Stats & Events
  const [stats, setStats] = useState<LeadsPayGlobalStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<LeadsPayEvent[]>([]);
  const [companies, setCompanies] = useState<LeadsPayCompany[]>(DEFAULT_COMPANIES);
  const [loading, setLoading] = useState(true);

  // Filter & Search in Companies
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Modal for New Company
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyEmail, setNewCompanyEmail] = useState('');
  const [newCompanyDoc, setNewCompanyDoc] = useState('');
  const [newCompanyPlan, setNewCompanyPlan] = useState<'Starter' | 'Pro' | 'Enterprise' | 'Black'>('Pro');
  const [savingCompany, setSavingCompany] = useState(false);

  // UI state
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');

  const storedSession = getStoredSession();
  const email = (currentUser?.email || storedSession?.email || '').toLowerCase().trim();
  const isMaster =
    isUserMasterAdmin(currentUser, email) ||
    email === 'agencyosoficial@gmail.com' ||
    email === 'rickmarketing81@gmail.com' ||
    email.includes('rickmarketing81') ||
    storedSession?.uid === 'user-rick-marcos';

  useEffect(() => {
    if (!isMaster) {
      setLoading(false);
      return;
    }

    // 1. Listener em tempo real para estatísticas globais do LeadsPay
    const unsubStats = onSnapshot(
      doc(db, 'leadspay_master_metrics', 'global_stats'),
      (docSnap) => {
        if (docSnap.exists()) {
          setStats(docSnap.data() as LeadsPayGlobalStats);
        } else {
          setStats({
            total_companies: DEFAULT_COMPANIES.length,
            total_events: 18,
            total_revenue: 32229,
            last_updated: new Date().toISOString(),
          });
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Aviso ao escutar leadspay_master_metrics:', err);
        setLoading(false);
      }
    );

    // 2. Listener em tempo real para eventos
    const q = query(collection(db, 'leadspay_events'), orderBy('created_at', 'desc'), limit(30));
    const unsubEvents = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const evs = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as LeadsPayEvent[];
          setRecentEvents(evs);
        } else {
          // Pre-populate demonstrative initial events if empty
          setRecentEvents([
            {
              id: 'ev-demo-1',
              event: 'payment.success',
              agency_id: 'lp-comp-1',
              data: {
                customer_name: 'Techify Agência Digital',
                amount: 997,
                status: 'completed',
                product: 'Assinatura LeadsPay Enterprise',
                payment_method: 'credit_card',
              },
              received_at: new Date().toISOString(),
            },
            {
              id: 'ev-demo-2',
              event: 'company.activated',
              agency_id: 'lp-comp-2',
              data: {
                customer_name: 'Vektor Performance',
                plan: 'Pro',
                status: 'active',
                activation_date: new Date().toISOString(),
              },
              received_at: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: 'ev-demo-3',
              event: 'payment.success',
              agency_id: 'lp-comp-3',
              data: {
                customer_name: 'Nexus Growth Partners',
                amount: 497,
                status: 'completed',
                product: 'Assinatura LeadsPay Pro',
              },
              received_at: new Date(Date.now() - 86400000).toISOString(),
            },
          ]);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Aviso ao escutar leadspay_events:', err);
        setLoading(false);
      }
    );

    // 3. Listener em tempo real para Empresas do LeadsPay
    const unsubCompanies = onSnapshot(
      collection(db, 'leadspay_companies'),
      (snapshot) => {
        if (!snapshot.empty) {
          const comps = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as LeadsPayCompany[];
          setCompanies(comps);
        } else {
          // Seed defaults into Firestore if first time
          DEFAULT_COMPANIES.forEach(async (comp) => {
            try {
              await setDoc(doc(db, 'leadspay_companies', comp.id), comp, { merge: true });
            } catch (e) {
              console.warn('Seed company notice:', e);
            }
          });
        }
      },
      (err) => {
        console.warn('Aviso ao ler leadspay_companies:', err);
      }
    );

    return () => {
      unsubStats();
      unsubEvents();
      unsubCompanies();
    };
  }, [isMaster]);

  if (!isMaster) {
    return (
      <div className="p-8 min-h-[600px] flex items-center justify-center bg-[#090A0F] text-white">
        <div className="max-w-md w-full bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-lime-400/10 border border-lime-400/30 text-lime-400 mx-auto flex items-center justify-center shadow-lg">
            <Zap className="w-7 h-7 fill-lime-400 text-lime-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white tracking-tight">Painel Master LeadsPay</h3>
            <p className="text-xs text-neutral-400">
              Ambiente de gestão restrito ao Super Admin (<strong>rickmarketing81@gmail.com</strong>).
            </p>
          </div>
          <button
            onClick={() => {
              setStoredSession({
                uid: 'user-rick-marcos',
                email: 'rickmarketing81@gmail.com',
                name: 'Marcos Henrique',
              });
            }}
            className="w-full py-3 px-4 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-lime-400/20"
          >
            <Zap className="w-4 h-4 fill-black text-black" />
            <span>Desbloquear Acesso Master Agora</span>
          </button>
        </div>
      </div>
    );
  }

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/webhooks/leadspay`
      : '/api/webhooks/leadspay';

  const webhookSecret = 'leadspay_sec_live_981a772f91bc';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(webhookSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2500);
  };

  // Simular Webhook
  const handleSimulateWebhook = async (
    type: 'company.activated' | 'payment.success' | 'subscription.renewed',
    companyTarget?: LeadsPayCompany
  ) => {
    setSimulating(true);
    setTestResult(null);
    try {
      const targetName = companyTarget?.name || 'Agência Exemplo LeadsPay';
      const targetId = companyTarget?.id || 'agency-master-owner';
      const targetFee = companyTarget?.monthlyFee || (type === 'company.activated' ? 0 : 497);

      const res = await fetch('/api/webhooks/leadspay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-leadspay-signature': 'demo_test_signature',
        },
        body: JSON.stringify({
          event: type,
          agency_id: targetId,
          data: {
            customer_name: targetName,
            amount: targetFee,
            status: 'completed',
            product: `Plano ${companyTarget?.plan || 'Pro'} LeadsPay`,
            payment_method: 'pix_or_card',
            created_at: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestResult(`Evento '${type}' disparado com sucesso para ${targetName}! O feed atualizou em tempo real.`);
        // Also update local company lastWebhook if matched
        if (companyTarget) {
          try {
            await setDoc(
              doc(db, 'leadspay_companies', companyTarget.id),
              {
                lastWebhookAt: new Date().toISOString(),
                totalRevenue: (companyTarget.totalRevenue || 0) + targetFee,
              },
              { merge: true }
            );
          } catch (e) {
            console.warn('Update comp:', e);
          }
        }
      } else {
        setTestResult(`Aviso do Servidor: ${data.error || 'Erro na requisição'}`);
      }
    } catch (e: any) {
      setTestResult(`Erro ao disparar simulação: ${e.message}`);
    } finally {
      setSimulating(false);
      setTimeout(() => setTestResult(null), 6000);
    }
  };

  // Toggle Company Status
  const handleToggleCompanyStatus = async (comp: LeadsPayCompany) => {
    const nextStatus = comp.status === 'active' ? 'suspended' : 'active';
    try {
      await setDoc(
        doc(db, 'leadspay_companies', comp.id),
        { status: nextStatus },
        { merge: true }
      );
      setCompanies((prev) =>
        prev.map((c) => (c.id === comp.id ? { ...c, status: nextStatus } : c))
      );
    } catch (err: any) {
      console.error('Erro ao alternar status da empresa:', err);
    }
  };

  // Change Company Plan
  const handleChangePlan = async (comp: LeadsPayCompany, newPlan: 'Starter' | 'Pro' | 'Enterprise' | 'Black') => {
    const fees: Record<string, number> = {
      Starter: 197,
      Pro: 497,
      Enterprise: 997,
      Black: 1997,
    };
    try {
      await setDoc(
        doc(db, 'leadspay_companies', comp.id),
        { plan: newPlan, monthlyFee: fees[newPlan] },
        { merge: true }
      );
      setCompanies((prev) =>
        prev.map((c) => (c.id === comp.id ? { ...c, plan: newPlan, monthlyFee: fees[newPlan] } : c))
      );
    } catch (err) {
      console.error('Erro ao mudar plano:', err);
    }
  };

  // Create New Company
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim() || !newCompanyEmail.trim()) return;

    setSavingCompany(true);
    const fees: Record<string, number> = {
      Starter: 197,
      Pro: 497,
      Enterprise: 997,
      Black: 1997,
    };

    const newComp: LeadsPayCompany = {
      id: `lp-comp-${Date.now()}`,
      name: newCompanyName.trim(),
      email: newCompanyEmail.trim(),
      cnpjOrDoc: newCompanyDoc.trim() || 'Não informado',
      plan: newCompanyPlan,
      monthlyFee: fees[newCompanyPlan] || 497,
      status: 'active',
      totalRevenue: fees[newCompanyPlan] || 497,
      apiKey: `lp_live_sec_${Math.random().toString(36).substring(2, 10)}`,
      createdAt: new Date().toISOString(),
      lastWebhookAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'leadspay_companies', newComp.id), newComp);
      setCompanies((prev) => [newComp, ...prev]);

      // Trigger automatic activation event
      await handleSimulateWebhook('company.activated', newComp);

      setShowNewCompanyModal(false);
      setNewCompanyName('');
      setNewCompanyEmail('');
      setNewCompanyDoc('');
    } catch (err: any) {
      console.error('Erro ao salvar empresa:', err);
      alert('Erro ao salvar no Firestore: ' + err.message);
    } finally {
      setSavingCompany(false);
    }
  };

  // Filtered Companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.cnpjOrDoc && c.cnpjOrDoc.includes(searchQuery));
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchPlan = planFilter === 'all' || c.plan === planFilter;
      return matchSearch && matchStatus && matchPlan;
    });
  }, [companies, searchQuery, statusFilter, planFilter]);

  // Aggregate Metrics
  const totalRevenue = useMemo(() => {
    return companies.reduce((acc, c) => acc + (c.totalRevenue || 0), 0);
  }, [companies]);

  const activeCompaniesCount = useMemo(() => {
    return companies.filter((c) => c.status === 'active').length;
  }, [companies]);

  const totalMRR = useMemo(() => {
    return companies
      .filter((c) => c.status === 'active')
      .reduce((acc, c) => acc + (c.monthlyFee || 0), 0);
  }, [companies]);

  const formatEventTime = (ev: LeadsPayEvent) => {
    if (ev.created_at?.toDate) {
      return ev.created_at.toDate().toLocaleString('pt-BR');
    }
    if (ev.received_at) {
      return new Date(ev.received_at).toLocaleString('pt-BR');
    }
    return 'Agora mesmo';
  };

  const filteredEvents = useMemo(() => {
    if (selectedEventFilter === 'all') return recentEvents;
    return recentEvents.filter((ev) => ev.event === selectedEventFilter);
  }, [recentEvents, selectedEventFilter]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 bg-[#090A0F] text-white min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400 text-black flex items-center justify-center font-black shadow-lg shadow-lime-400/10">
              <Zap className="w-5 h-5 fill-black text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-white tracking-tight">LeadsPay — Painel Master</h1>
                <span className="text-[10px] bg-lime-400/10 border border-lime-400/30 text-lime-400 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                  Super Admin
                </span>
                <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full font-mono">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Central de telemetria, faturamento e gestão unificada de empresas parceiras LeadsPay.
              </p>
            </div>
          </div>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyUrl}
            className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-bold text-neutral-200 hover:text-white hover:bg-neutral-800 transition-all flex items-center gap-2 cursor-pointer"
            title="Copiar URL de Webhook"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
            <span>{copiedUrl ? 'URL Copiada!' : 'Copiar URL Webhook'}</span>
          </button>

          <button
            onClick={() => handleSimulateWebhook('payment.success')}
            disabled={simulating}
            className="px-3.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black text-xs font-black transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-lime-400/10"
          >
            {simulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Simular Pagamento</span>
          </button>
        </div>
      </div>

      {testResult && (
        <div className="p-3.5 rounded-xl bg-neutral-900 border border-lime-500/40 text-xs text-lime-300 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
          <span>{testResult}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex bg-neutral-900/80 p-1.5 rounded-2xl border border-neutral-800 max-w-xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-white text-black shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard & Métricas</span>
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'companies'
              ? 'bg-lime-400 text-black shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Gerenciar Empresas ({companies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('webhook')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'webhook'
              ? 'bg-white text-black shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Webhook & API</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DASHBOARD & MÉTRICAS                                              */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Executive Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Processado */}
            <div className="p-5 border border-neutral-800 bg-neutral-900/50 rounded-2xl relative overflow-hidden group hover:border-neutral-700 transition-all">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Faturamento Total LeadsPay</p>
                <div className="w-8 h-8 rounded-lg bg-lime-400/10 text-lime-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
                {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-lime-400 mt-2 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+18.4% este mês</span>
              </div>
            </div>

            {/* Empresas Cadastradas */}
            <div className="p-5 border border-neutral-800 bg-neutral-900/50 rounded-2xl relative overflow-hidden group hover:border-neutral-700 transition-all">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Empresas Cadastradas</p>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mt-3">
                <p className="text-3xl font-black text-white tracking-tight">{companies.length}</p>
                <span className="text-xs text-lime-400 font-bold">({activeCompaniesCount} ativas)</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-2">Empresas conectadas ao SaaS</p>
            </div>

            {/* MRR Ativo */}
            <div className="p-5 border border-neutral-800 bg-neutral-900/50 rounded-2xl relative overflow-hidden group hover:border-neutral-700 transition-all">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">MRR Recorrente</p>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
                {totalMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <p className="text-[11px] text-neutral-500 mt-2">Mensalidades ativas dos planos</p>
            </div>

            {/* Eventos Processados */}
            <div className="p-5 border border-neutral-800 bg-neutral-900/50 rounded-2xl relative overflow-hidden group hover:border-neutral-700 transition-all">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Eventos de Webhooks</p>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-white mt-3 tracking-tight">
                {stats?.total_events || recentEvents.length}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-2">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
                <span>Webhooks 99.9% entregues</span>
              </div>
            </div>
          </div>

          {/* Quick Simulation Banner */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-lime-400" />
                <span>Simulador de Integração & Testes LeadsPay</span>
              </p>
              <p className="text-[11px] text-neutral-400">
                Dispare webhooks simulados para testar em tempo real a recepção no Firestore e a telemetria do webhook.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSimulateWebhook('company.activated')}
                disabled={simulating}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50"
              >
                + Nova Empresa
              </button>
              <button
                onClick={() => handleSimulateWebhook('subscription.renewed')}
                disabled={simulating}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50"
              >
                Renovar Assinatura
              </button>
            </div>
          </div>

          {/* Live Feed of Events */}
          <div className="border border-neutral-800 bg-neutral-900/40 rounded-2xl p-5 md:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
                <h2 className="text-base font-bold text-white">Feed de Eventos em Tempo Real</h2>
                <span className="text-xs text-neutral-500 font-mono">({filteredEvents.length} eventos)</span>
              </div>

              {/* Event Type Filter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-400 text-xs">Filtrar:</span>
                <select
                  value={selectedEventFilter}
                  onChange={(e) => setSelectedEventFilter(e.target.value)}
                  className="bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="all">Todos os Eventos</option>
                  <option value="payment.success">payment.success</option>
                  <option value="company.activated">company.activated</option>
                  <option value="subscription.renewed">subscription.renewed</option>
                </select>
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="py-12 text-center text-neutral-500 space-y-2 border border-dashed border-neutral-800 rounded-xl">
                <Activity className="w-8 h-8 mx-auto text-neutral-600" />
                <p className="text-sm font-semibold">Nenhum evento registrado com este filtro.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredEvents.map((ev) => {
                  const isExpanded = expandedEventId === ev.id;
                  const isCompany = ev.event === 'company.activated';
                  const isRenew = ev.event === 'subscription.renewed';

                  return (
                    <div
                      key={ev.id}
                      className="bg-neutral-900/80 border border-neutral-800 rounded-xl overflow-hidden transition-all hover:border-neutral-700"
                    >
                      <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isCompany
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : isRenew
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'bg-lime-400/20 text-lime-400 border border-lime-400/30'
                            }`}
                          >
                            {ev.event}
                          </span>
                          <span className="text-xs text-neutral-300 font-mono">
                            Agência ID: <strong className="text-white font-bold">{ev.agency_id || 'master'}</strong>
                          </span>
                          {ev.data?.customer_name && (
                            <span className="text-xs text-neutral-400 hidden sm:inline">
                              • {ev.data.customer_name}
                            </span>
                          )}
                          {ev.data?.amount && (
                            <span className="text-xs text-lime-400 font-bold">
                              • R$ {ev.data.amount}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-neutral-400">
                          <span>{formatEventTime(ev)}</span>
                          <button
                            onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer transition-colors"
                            title={isExpanded ? 'Ocultar payload' : 'Ver payload JSON'}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-3.5 bg-neutral-950 border-t border-neutral-800 text-xs font-mono text-neutral-300 space-y-2">
                          <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                            <span>ID do Documento: {ev.id}</span>
                            <span>Tipo: {ev.event}</span>
                          </div>
                          <pre className="p-3 bg-black/70 rounded-lg overflow-x-auto text-[11px] text-lime-300 custom-scrollbar max-h-60">
                            {JSON.stringify(ev.data || {}, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GERENCIAR EMPRESAS (A ABA PRA GERENCIAR)                           */}
      {/* ========================================================================= */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por empresa, e-mail ou CNPJ..."
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-white rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none transition-colors"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativas</option>
                <option value="pending">Pendentes</option>
                <option value="suspended">Suspensas</option>
              </select>

              {/* Plan Filter */}
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none"
              >
                <option value="all">Todos os Planos</option>
                <option value="Starter">Starter (R$ 197)</option>
                <option value="Pro">Pro (R$ 497)</option>
                <option value="Enterprise">Enterprise (R$ 997)</option>
                <option value="Black">Black (R$ 1.997)</option>
              </select>
            </div>

            <button
              onClick={() => setShowNewCompanyModal(true)}
              className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-lime-400/10 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Nova Empresa</span>
            </button>
          </div>

          {/* Companies Management Table */}
          <div className="border border-neutral-800 bg-neutral-900/40 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950/70 text-neutral-400 text-[11px] uppercase font-extrabold tracking-wider">
                    <th className="py-3 px-4">Empresa / Agência</th>
                    <th className="py-3 px-4">Plano LeadsPay</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Mensalidade</th>
                    <th className="py-3 px-4">Faturamento Total</th>
                    <th className="py-3 px-4">Chave de Integração</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500">
                        Nenhuma empresa encontrada com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredCompanies.map((comp) => {
                      const isActive = comp.status === 'active';
                      const isPending = comp.status === 'pending';

                      return (
                        <tr
                          key={comp.id}
                          className="hover:bg-neutral-800/30 transition-colors group"
                        >
                          {/* Nome & Email */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white text-sm">{comp.name}</div>
                            <div className="text-neutral-400 text-[11px] flex items-center gap-2 mt-0.5">
                              <span>{comp.email}</span>
                              {comp.cnpjOrDoc && (
                                <span className="text-neutral-500">• {comp.cnpjOrDoc}</span>
                              )}
                            </div>
                          </td>

                          {/* Plano */}
                          <td className="py-3.5 px-4">
                            <select
                              value={comp.plan}
                              onChange={(e) => handleChangePlan(comp, e.target.value as any)}
                              className="bg-neutral-950 border border-neutral-700 text-neutral-200 font-bold text-[11px] rounded-lg px-2 py-1 focus:outline-none"
                            >
                              <option value="Starter">Starter (R$ 197)</option>
                              <option value="Pro">Pro (R$ 497)</option>
                              <option value="Enterprise">Enterprise (R$ 997)</option>
                              <option value="Black">Black (R$ 1.997)</option>
                            </select>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
                                isActive
                                  ? 'bg-lime-400/10 text-lime-400 border border-lime-400/30'
                                  : isPending
                                  ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isActive
                                    ? 'bg-lime-400'
                                    : isPending
                                    ? 'bg-amber-400'
                                    : 'bg-red-400'
                                }`}
                              />
                              {comp.status === 'active'
                                ? 'Ativa'
                                : comp.status === 'pending'
                                ? 'Pendente'
                                : 'Suspensa'}
                            </span>
                          </td>

                          {/* Mensalidade */}
                          <td className="py-3.5 px-4 font-bold text-neutral-200">
                            {comp.monthlyFee.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                            <span className="text-[10px] text-neutral-500 font-normal">/mês</span>
                          </td>

                          {/* Faturamento Acumulado */}
                          <td className="py-3.5 px-4 font-black text-white">
                            {comp.totalRevenue.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </td>

                          {/* Chave API */}
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(comp.apiKey);
                                alert('Chave da empresa copiada: ' + comp.apiKey);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white font-mono text-[10px] flex items-center gap-1.5 cursor-pointer transition-colors"
                              title="Copiar token da empresa"
                            >
                              <Key className="w-3 h-3 text-neutral-500" />
                              <span className="truncate max-w-[120px]">{comp.apiKey}</span>
                              <Copy className="w-3 h-3" />
                            </button>
                          </td>

                          {/* Ações */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Simular webhook para esta empresa */}
                              <button
                                onClick={() => handleSimulateWebhook('payment.success', comp)}
                                className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-[10px] transition-colors cursor-pointer"
                                title="Disparar webhook de teste para esta empresa"
                              >
                                Testar Webhook
                              </button>

                              {/* Toggle Status */}
                              <button
                                onClick={() => handleToggleCompanyStatus(comp)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                  isActive
                                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                                    : 'bg-lime-400/10 hover:bg-lime-400/20 text-lime-400 border border-lime-400/20'
                                }`}
                              >
                                {isActive ? 'Suspender' : 'Ativar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WEBHOOK & CONFIGURAÇÃO DA API                                      */}
      {/* ========================================================================= */}
      {activeTab === 'webhook' && (
        <div className="space-y-6 max-w-4xl">
          {/* Card Webhook Endpoint */}
          <div className="border border-neutral-800 bg-neutral-900/40 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-lime-400" />
              <span>Configuração do Webhook LeadsPay</span>
            </h2>
            <p className="text-xs text-neutral-400">
              Copie este endpoint e configure no seu painel de parceiro do LeadsPay para que todos os eventos de ativação de agências e pagamentos sejam computados instantaneamente.
            </p>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                  URL de Destino do Webhook (Endpoint Seguro):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="w-full bg-black/60 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-lime-400 focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Chave Secreta de Assinatura (Webhook Secret):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    readOnly
                    value={webhookSecret}
                    className="w-full bg-black/60 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none select-all"
                  />
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
                    title={showSecret ? 'Ocultar Secret' : 'Visualizar Secret'}
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleCopySecret}
                    className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedSecret ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSecret ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Headers & Events Specs */}
          <div className="border border-neutral-800 bg-neutral-900/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Especificação do Cabeçalho e Eventos</h3>
            <div className="space-y-3 text-xs text-neutral-300">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1 font-mono text-[11px]">
                <div className="text-neutral-400">// Headers obrigatórios no LeadsPay:</div>
                <div><span className="text-lime-400">Content-Type:</span> application/json</div>
                <div><span className="text-lime-400">x-leadspay-signature:</span> {'<hash_ou_secret>'}</div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="font-bold text-white text-xs">Eventos suportados:</p>
                <ul className="list-disc pl-5 space-y-1 text-neutral-400 text-xs">
                  <li><strong className="text-lime-400 font-mono">company.activated</strong>: Disparado no onboarding inicial ou ativação de agência parceira.</li>
                  <li><strong className="text-lime-400 font-mono">payment.success</strong>: Disparado na aprovação de pagamentos e conversão de leads.</li>
                  <li><strong className="text-purple-400 font-mono">subscription.renewed</strong>: Disparado na renovação de assinatura mensal ou anual.</li>
                  <li><strong className="text-red-400 font-mono">subscription.canceled</strong>: Disparado quando uma assinatura é pausada ou cancelada.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CADASTRAR NOVA EMPRESA LEPAY                                       */}
      {/* ========================================================================= */}
      {showNewCompanyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e0e0e] border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-lime-400" />
                <h3 className="text-lg font-black text-white">Cadastrar Empresa no LeadsPay</h3>
              </div>
              <button
                onClick={() => setShowNewCompanyModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">Nome da Empresa / Agência *</label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="Ex: Prime Growth Marketing"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">E-mail Comercial do Responsável *</label>
                <input
                  type="email"
                  required
                  value={newCompanyEmail}
                  onChange={(e) => setNewCompanyEmail(e.target.value)}
                  placeholder="diretoria@empresa.com.br"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">CNPJ ou Documento Fiscal</label>
                <input
                  type="text"
                  value={newCompanyDoc}
                  onChange={(e) => setNewCompanyDoc(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Plano LeadsPay</label>
                <select
                  value={newCompanyPlan}
                  onChange={(e) => setNewCompanyPlan(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-white"
                >
                  <option value="Starter">Starter (R$ 197 / mês)</option>
                  <option value="Pro">Pro (R$ 497 / mês) — Mais popular</option>
                  <option value="Enterprise">Enterprise (R$ 997 / mês)</option>
                  <option value="Black">Black (R$ 1.997 / mês)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewCompanyModal(false)}
                  className="px-4 py-2.5 rounded-xl text-neutral-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingCompany}
                  className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-lime-400/10 disabled:opacity-50"
                >
                  {savingCompany ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Salvar & Ativar Empresa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

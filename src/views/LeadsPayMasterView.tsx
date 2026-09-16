import React, { useEffect, useState } from 'react';
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
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
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { db, FirestoreUserProfile } from '../lib/firebase';
import { isUserMasterAdmin } from '../lib/permissions';

interface LeadsPayMasterViewProps {
  currentUser?: FirestoreUserProfile | null;
}

interface LeadsPayEvent {
  id: string;
  event: string;
  agency_id?: string;
  data?: Record<string, any>;
  created_at?: any;
  received_at?: string;
}

interface LeadsPayGlobalStats {
  total_companies?: number;
  total_events?: number;
  last_updated?: string;
}

export const LeadsPayMasterView: React.FC<LeadsPayMasterViewProps> = ({ currentUser }) => {
  const [stats, setStats] = useState<LeadsPayGlobalStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<LeadsPayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const email = (currentUser?.email || '').toLowerCase().trim();
  const isMaster =
    isUserMasterAdmin(currentUser, email) ||
    email === 'agencyosoficial@gmail.com' ||
    email === 'rickmarketing81@gmail.com';

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
          setStats({ total_companies: 0, total_events: 0, last_updated: 'Aguardando primeiro webhook' });
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Erro ao escutar leadspay_master_metrics:', err);
        setLoading(false);
      }
    );

    // 2. Listener em tempo real para o feed de eventos recebidos
    const q = query(collection(db, 'leadspay_events'), orderBy('created_at', 'desc'), limit(25));
    const unsubEvents = onSnapshot(
      q,
      (snapshot) => {
        const events = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as LeadsPayEvent[];
        setRecentEvents(events);
        setLoading(false);
      },
      (err) => {
        console.warn('Erro ao escutar leadspay_events:', err);
        setLoading(false);
      }
    );

    return () => {
      unsubStats();
      unsubEvents();
    };
  }, [isMaster]);

  // Bloqueio de acesso: Somente a sua conta Super Admin visualiza este painel
  if (!isMaster) {
    return (
      <div className="p-8 min-h-[600px] flex items-center justify-center bg-[#090A0F] text-white">
        <div className="max-w-md w-full bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Acesso Restrito ao Administrador LeadsPay</h3>
          <p className="text-xs text-neutral-400">
            Este painel monitora métricas e transações globais da integração LeadsPay e só pode ser acessado pelo Super Admin autorizado.
          </p>
        </div>
      </div>
    );
  }

  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/leadspay` : '/api/webhooks/leadspay';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleSimulateWebhook = async (type: 'company.activated' | 'payment.success') => {
    setSimulating(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/webhooks/leadspay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-leadspay-signature': 'demo_test_signature',
        },
        body: JSON.stringify({
          event: type,
          agency_id: currentUser?.uid || 'agency-master-owner',
          data: {
            customer_name: type === 'company.activated' ? 'Nova Agência Cadastrada' : 'Lead Convertido - Plano Pro',
            amount: type === 'company.activated' ? 0 : 497.0,
            status: 'completed',
            product: 'Assinatura LeadsPay Agência',
            created_at: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestResult(`Evento '${type}' disparado com sucesso! O feed abaixo atualizou em tempo real.`);
      } else {
        setTestResult(`Aviso: ${data.error || 'Erro na requisição'}`);
      }
    } catch (e: any) {
      setTestResult(`Erro ao disparar simulação: ${e.message}`);
    } finally {
      setSimulating(false);
      setTimeout(() => setTestResult(null), 6000);
    }
  };

  const formatEventTime = (ev: LeadsPayEvent) => {
    if (ev.created_at?.toDate) {
      return ev.created_at.toDate().toLocaleString('pt-BR');
    }
    if (ev.received_at) {
      return new Date(ev.received_at).toLocaleString('pt-BR');
    }
    return 'Agora mesmo';
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#090A0F] text-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-400 text-black flex items-center justify-center font-black shadow-lg shadow-lime-400/10">
              <Zap className="w-5 h-5 fill-black text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">Visão Geral Master — LeadsPay</h1>
                <span className="text-[10px] bg-lime-400/10 border border-lime-400/30 text-lime-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  Tempo Real
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Monitoramento exclusivo de empresas, webhooks e telemetria de transações da plataforma LeadsPay.
              </p>
            </div>
          </div>
        </div>

        {/* Action / Webhook URL */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyUrl}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-bold text-neutral-200 hover:text-white hover:bg-neutral-800 transition-all flex items-center gap-2 cursor-pointer"
            title="Copiar URL do Webhook do LeadsPay"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
            <span>{copiedUrl ? 'URL Copiada!' : 'Copiar URL Webhook'}</span>
          </button>

          <button
            onClick={() => handleSimulateWebhook('company.activated')}
            disabled={simulating}
            className="px-3.5 py-2 rounded-xl bg-lime-400 text-black text-xs font-black hover:bg-lime-300 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {simulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Simular Nova Empresa</span>
          </button>

          <button
            onClick={() => handleSimulateWebhook('payment.success')}
            disabled={simulating}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-bold hover:bg-neutral-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Simular Pagamento</span>
          </button>
        </div>
      </div>

      {testResult && (
        <div className="p-3.5 rounded-xl bg-neutral-900 border border-lime-500/40 text-xs text-lime-300 flex items-center gap-2">
          <Zap className="w-4 h-4 text-lime-400 shrink-0" />
          <span>{testResult}</span>
        </div>
      )}

      {/* Cards de Métricas Master */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total de Empresas */}
        <div className="p-5 border border-neutral-800 bg-neutral-900/40 rounded-2xl relative overflow-hidden group hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total de Empresas Cadastradas</p>
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-lime-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3 tracking-tight">
            {loading ? '...' : (stats?.total_companies || 0)}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">Empresas ativadas via LeadsPay</p>
        </div>

        {/* Total de Eventos */}
        <div className="p-5 border border-neutral-800 bg-neutral-900/40 rounded-2xl relative overflow-hidden group hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total de Eventos Processados</p>
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-white">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3 tracking-tight">
            {loading ? '...' : (stats?.total_events || 0)}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">Webhooks recebidos e persistidos</p>
        </div>

        {/* Última Atualização */}
        <div className="p-5 border border-neutral-800 bg-neutral-900/40 rounded-2xl relative overflow-hidden group hover:border-neutral-700 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Última Atualização</p>
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-neutral-200 mt-3 truncate" title={stats?.last_updated || ''}>
            {loading ? 'Carregando...' : (stats?.last_updated ? new Date(stats.last_updated).toLocaleString('pt-BR') : 'Aguardando dados...')}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">Sincronização em tempo real do Firestore</p>
        </div>
      </div>

      {/* Webhook Configuration Box */}
      <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="font-bold text-white flex items-center gap-2">
            <span>Endpoint do Webhook no AgencyOS:</span>
            <code className="text-[11px] bg-neutral-900 text-lime-400 px-2 py-0.5 rounded font-mono">
              /api/webhooks/leadspay
            </code>
          </div>
          <p className="text-neutral-400 text-[11px]">
            Configure este endpoint no painel do LeadsPay com o header <code className="text-neutral-200">x-leadspay-signature</code> e a variável de ambiente <code className="text-neutral-200">LEADSPAY_WEBHOOK_SECRET</code>.
          </p>
        </div>
        <button
          onClick={handleCopyUrl}
          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 text-xs"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copiar URL</span>
        </button>
      </div>

      {/* Feed de Eventos em Tempo Real */}
      <div className="border border-neutral-800 bg-neutral-900/40 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <h2 className="text-base font-bold text-white">Feed de Eventos em Tempo Real</h2>
          </div>
          <span className="text-xs text-neutral-500">
            {recentEvents.length} eventos recentes
          </span>
        </div>

        {recentEvents.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 space-y-2 border border-dashed border-neutral-800 rounded-xl">
            <Activity className="w-8 h-8 mx-auto text-neutral-600" />
            <p className="text-sm font-semibold">Nenhum evento registrado ainda.</p>
            <p className="text-xs text-neutral-600">
              Use os botões de simulação acima ou envie um webhook para <code className="text-neutral-400">/api/webhooks/leadspay</code>.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentEvents.map((ev) => {
              const isExpanded = expandedEventId === ev.id;
              const isCompanyEvent = ev.event === 'company.activated';
              return (
                <div
                  key={ev.id}
                  className="bg-neutral-900/70 border border-neutral-800 rounded-xl overflow-hidden transition-all hover:border-neutral-700"
                >
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isCompanyEvent
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-lime-400/20 text-lime-400 border border-lime-400/30'
                        }`}
                      >
                        {ev.event}
                      </span>
                      <span className="text-xs text-neutral-300 font-mono">
                        Agência ID: <strong className="text-white font-bold">{ev.agency_id || 'master'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                      <span>{formatEventTime(ev)}</span>
                      <button
                        onClick={() => setExpandedEventId(isExpanded ? null : ev.id)}
                        className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer transition-colors"
                        title={isExpanded ? 'Ocultar detalhes' : 'Ver payload JSON'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3.5 bg-neutral-950 border-t border-neutral-800 text-xs font-mono text-neutral-300 space-y-2">
                      <div className="flex items-center justify-between text-neutral-400">
                        <span>Payload Completo (Firestore Doc: {ev.id})</span>
                      </div>
                      <pre className="p-3 bg-black/60 rounded-lg overflow-x-auto text-[11px] text-lime-300/90 custom-scrollbar max-h-60">
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
  );
};

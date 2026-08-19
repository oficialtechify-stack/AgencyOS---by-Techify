import React from 'react';
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Calendar,
  MapPin,
  Share2,
  Package,
  Kanban,
  FileText,
  Target,
  Bot,
  Users,
  TrendingDown,
  ArrowRight,
  Lock,
  Palette,
} from 'lucide-react';
import { ViewMode, KPIPeriod, CashTransaction, AdCampaign, CRMLead, StockItem } from '../types';
import { hasModuleAccess } from '../lib/permissions';
import { FirestoreUserProfile } from '../lib/firebase';

interface DashboardGeralViewProps {
  onNavigate?: (view: ViewMode) => void;
  kpiPeriods?: KPIPeriod[];
  transactions?: CashTransaction[];
  campaigns?: AdCampaign[];
  leads?: CRMLead[];
  stockItems?: StockItem[];
  userProfile?: FirestoreUserProfile | null;
}

export const DashboardGeralView: React.FC<DashboardGeralViewProps> = ({
  onNavigate = (_view: ViewMode) => {},
  kpiPeriods = [],
  transactions = [],
  campaigns = [],
  leads = [],
  stockItems = [],
  userProfile,
}) => {
  const latestKPI = kpiPeriods.length > 0 ? kpiPeriods[kpiPeriods.length - 1] : null;
  const currentMRR = latestKPI && latestKPI.mrr > 0 ? `R$ ${latestKPI.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—';
  const activeClients = latestKPI && latestKPI.activeClients > 0 ? latestKPI.activeClients.toString() : '—';
  const churnRate = latestKPI && latestKPI.churnRate > 0 ? `${latestKPI.churnRate.toFixed(1)}%` : '—';

  const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + c.revenue, 0);
  const avgRoas = totalSpend > 0 ? `${(totalRevenue / totalSpend).toFixed(1)}x` : '—';

  const modules = [
    {
      id: 'kpis' as ViewMode,
      title: 'Financeiro',
      desc: 'KPIs, MRR, LTV e DRE',
      icon: DollarSign,
      badge: latestKPI ? `MRR ativo` : 'Sem dados',
    },
    {
      id: 'campanhas' as ViewMode,
      title: 'Tráfego',
      desc: 'Facebook & Google Ads',
      icon: BarChart3,
      badge: `${campaigns.length} campanhas`,
    },
    {
      id: 'fluxo-caixa' as ViewMode,
      title: 'Fluxo de Caixa',
      desc: 'Entradas e saídas',
      icon: TrendingUp,
      badge: 'Ver dados',
    },
    {
      id: 'maps-scraper' as ViewMode,
      title: 'Maps Scraper',
      desc: 'Extração de leads',
      icon: MapPin,
      badge: `${leads.length} leads`,
    },
    {
      id: 'agenda' as ViewMode,
      title: 'Agenda',
      desc: 'Compromissos e tarefas',
      icon: Calendar,
      badge: 'Ver agenda',
    },
    {
      id: 'calculadora-roi' as ViewMode,
      title: 'Calculadora ROI',
      desc: 'Previsão e rentabilidade',
      icon: Target,
      badge: 'Calcular',
    },
    {
      id: 'ia-consultora' as ViewMode,
      title: 'IA Consultora',
      desc: 'Análise inteligente',
      icon: Bot,
      badge: 'Online',
    },
    {
      id: 'social-hub' as ViewMode,
      title: 'Social Hub',
      desc: 'Instagram & WhatsApp com IA',
      icon: Share2,
      badge: 'IA ativa',
    },
    {
      id: 'estoque' as ViewMode,
      title: 'Estoque',
      desc: 'Produtos e suprimentos',
      icon: Package,
      badge: null,
    },
    {
      id: 'relatorios' as ViewMode,
      title: 'Relatórios',
      desc: 'Exportar relatório completo',
      icon: FileText,
      badge: null,
    },
    {
      id: 'marketing' as ViewMode,
      title: 'Marketing & Lançamentos',
      desc: 'Funis, editorial e copywriting',
      icon: Target,
      badge: 'Estratégico',
    },
    {
      id: 'designer' as ViewMode,
      title: 'Área do Designer',
      desc: 'Briefings, aprovação & entrega',
      icon: Palette,
      badge: 'Hub Criativo',
    },
    {
      id: 'kanban' as ViewMode,
      title: 'Kanban',
      desc: 'Projetos e tarefas da agência',
      icon: Kanban,
      badge: null,
    },
  ];

  return (
    <div className="space-y-6 text-neutral-200 font-sans max-w-7xl mx-auto pb-12">
      {/* Top Welcome / Header section */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-white inline-block" />
          <span>AGENCYOS • AO VIVO</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Bem-vindo ao AgencyOS
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 font-normal">
          Tudo que você precisa para gerir sua agência em um só lugar.
        </p>
      </div>

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 flex flex-col justify-between space-y-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {currentMRR}
          </div>
          <div className="text-xs text-neutral-400 font-normal">
            MRR
          </div>
        </div>

        {/* Clientes Ativos */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 flex flex-col justify-between space-y-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {activeClients}
          </div>
          <div className="text-xs text-neutral-400 font-normal">
            Clientes Ativos
          </div>
        </div>

        {/* Churn Rate */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 flex flex-col justify-between space-y-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
            <TrendingDown className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {churnRate}
          </div>
          <div className="text-xs text-neutral-400 font-normal">
            Churn Rate
          </div>
        </div>

        {/* ROAS Médio */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 flex flex-col justify-between space-y-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {avgRoas}
          </div>
          <div className="text-xs text-neutral-400 font-normal">
            ROAS Médio
          </div>
        </div>
      </div>

      {/* Middle Card: Receita vs Despesas */}
      <div className="p-6 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-3">
        <div className="space-y-0.5">
          <h3 className="font-bold text-white text-sm">Receita vs Despesas</h3>
          <p className="text-xs text-neutral-500 font-normal">
            Sem dados — cadastre KPIs no módulo Financeiro
          </p>
        </div>

        {kpiPeriods.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-1.5">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mb-1">
              <DollarSign className="w-6 h-6 text-neutral-400 stroke-[1.5]" />
            </div>
            <p className="text-xs text-neutral-400 font-normal">
              Nenhum dado financeiro cadastrado.
            </p>
            <button
              onClick={() => onNavigate('kpis')}
              className="text-xs font-semibold text-white hover:underline cursor-pointer pt-0.5"
            >
              → Ir para o Módulo Financeiro
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {kpiPeriods.slice(-4).map((kp) => (
              <div key={kp.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-neutral-300">
                  <span className="font-medium">{kp.monthYear}</span>
                  <span className="text-white font-bold">
                    MRR: R$ {kp.mrr.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden flex border border-neutral-800">
                  <div className="h-full bg-white" style={{ width: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section: Módulos do Sistema */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm sm:text-base">Módulos do Sistema</h3>
          <span className="text-xs text-neutral-500 font-normal">13 módulos integrados</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            const isAllowed = hasModuleAccess(m.id, userProfile);
            return (
              <div
                key={m.id}
                className={`p-5 rounded-2xl bg-[#0e0e0e] border transition-all flex flex-col justify-between group min-h-[160px] ${
                  isAllowed
                    ? 'border-neutral-800 hover:border-neutral-500'
                    : 'border-neutral-900 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    {isAllowed ? (
                      m.badge && (
                        <span className="text-[11px] font-semibold text-neutral-300 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                          {m.badge}
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] font-bold text-neutral-400 bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Bloqueado
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
                      <span>{m.title}</span>
                      {!isAllowed && <Lock className="w-3 h-3 text-neutral-500" />}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1 leading-snug">{m.desc}</p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(m.id)}
                  className={`text-xs font-semibold flex items-center gap-1 cursor-pointer mt-4 pt-1 ${
                    isAllowed
                      ? 'text-white hover:underline'
                      : 'text-neutral-500 hover:text-neutral-400'
                  }`}
                >
                  <span>{isAllowed ? 'Abrir módulo' : 'Acesso Restrito'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

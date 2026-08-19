import React, { useState } from 'react';
import {
  Zap,
  Check,
  ChevronDown,
  ArrowRight,
  Clock,
  DollarSign,
  TrendingUp,
  BarChart3,
  MapPin,
  Calculator,
  Shield,
  Palette,
  Target,
  Sparkles,
  Bot,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  FileText,
  Star,
  Users,
  Smartphone,
  Server,
  Lock,
} from 'lucide-react';
import { ViewMode } from '../types';

interface LandingViewProps {
  onNavigate?: (view: ViewMode) => void;
  onStartTrial?: () => void;
  onOpenLogin?: () => void;
  onOpenDocs?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigate,
  onStartTrial,
  onOpenLogin,
  onOpenDocs,
}) => {
  const [activeTab, setActiveTab] = useState<'financeiro' | 'trafego' | 'designer' | 'crm' | 'ia'>('financeiro');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleStart = () => {
    if (onStartTrial) onStartTrial();
    else if (onNavigate) onNavigate('trial-signup');
  };

  const handleLogin = () => {
    if (onOpenLogin) onOpenLogin();
  };

  const handleDocs = () => {
    if (onOpenDocs) onOpenDocs();
  };

  const interactiveFeatures = [
    {
      id: 'financeiro',
      title: 'Financeiro & DRE',
      icon: DollarSign,
      headline: 'Previsibilidade total de caixa com MRR, ARR, LTV e CAC em tempo real',
      description: 'Diga adeus às planilhas desconectadas. Acompanhe entradas, saídas, inadimplência e a taxa de retenção dos seus clientes com conciliação automática.',
      metrics: [
        { label: 'MRR Atual', val: 'R$ 48.500', change: '+14.2%' },
        { label: 'LTV Médio', val: 'R$ 12.800', change: '+8.1%' },
        { label: 'CAC Real', val: 'R$ 620', change: '-12.0%' },
        { label: 'Churn Rate', val: '1.8%', change: '-0.4%' },
      ],
      highlights: [
        'Demonstrativo de Resultado do Exercício (DRE) automático',
        'Controle granular por categorias de receita e centro de custos',
        'Alertas de renovação contratual e vencimento de faturas',
      ],
    },
    {
      id: 'trafego',
      title: 'Tráfego & Marketing',
      icon: Target,
      headline: 'Gestão de mídia paga, ROAS por canal e funis de conversão',
      description: 'Monitore campanhas no Meta Ads, Google Ads e TikTok Ads com cálculo de ROAS real, CPL e taxa de conversão em cada etapa do funil.',
      metrics: [
        { label: 'Investimento Mídia', val: 'R$ 32.400', change: 'Mês atual' },
        { label: 'Receita Gerada', val: 'R$ 142.800', change: '4.41x ROAS' },
        { label: 'Cliques Qualificados', val: '18.920', change: 'CPC R$ 1,71' },
        { label: 'Leads Captados', val: '1.450', change: 'CPL R$ 22,34' },
      ],
      highlights: [
        'Comparativo de ROAS e ROI entre plataformas de anúncios',
        'Funis de aquisição: Visitantes → Leads → MQL → SQL → Venda',
        'Banco de copies validadas, ganchos de 3s e roteiros de VSL',
      ],
    },
    {
      id: 'designer',
      title: 'Hub do Designer',
      icon: Palette,
      headline: 'Esteira de criativos com controle de briefings, prazos e aprovações',
      description: 'Organize pastas por cliente, aprove peças criativas com status rigorosos e exporte pacotes prontos para campanhas sem atritos.',
      metrics: [
        { label: 'Projetos em Andamento', val: '24', change: 'No prazo' },
        { label: 'Aprovados na 1ª Versão', val: '88%', change: '+12%' },
        { label: 'Tempo Médio Entrega', val: '1.4 dias', change: '-35%' },
        { label: 'Pacotes Entregues', val: '142', change: 'Neste trimestre' },
      ],
      highlights: [
        'Fluxo de aprovação: Briefing → Em Criação → Revisão Líder → Aprovado',
        'Separação por pastas de clientes e repositório de referências',
        'Download direto e empacotamento para envio ao cliente',
      ],
    },
    {
      id: 'crm',
      title: 'Maps Scraper & CRM',
      icon: MapPin,
      headline: 'Prospecção ativa automatizada direto do Google Maps para o seu funil',
      description: 'Encontre negócios locais em qualquer cidade e segmento, filtre por nota e presença online, e importe contatos diretamente para o pipeline comercial.',
      metrics: [
        { label: 'Leads Minerados/Mês', val: '2.500+', change: 'Sem limites' },
        { label: 'Validação de Telefone', val: '96.4%', change: 'WhatsApp ativo' },
        { label: 'Taxa de Resposta', val: '28.5%', change: 'Outbound' },
        { label: 'Reuniões Agendadas', val: '46', change: 'Mês anterior' },
      ],
      highlights: [
        'Extração de telefones, e-mails, websites e perfis no Instagram',
        'Pipeline Kanban de vendas com status de contato e negociação',
        'Exportação instantânea para CSV ou sincronização em tempo real',
      ],
    },
    {
      id: 'ia',
      title: 'IA Consultora Copilot',
      icon: Bot,
      headline: 'Inteligência artificial com RAG conectada aos números da sua agência',
      description: 'Receba diagnósticos precisos sobre onde cortar custos, como melhorar a precificação de contratos e quais serviços ofertar para aumentar seu LTV.',
      metrics: [
        { label: 'Tempo de Diagnóstico', val: '< 3 seg', change: 'Instantâneo' },
        { label: 'Modelos de Consultoria', val: '12+', change: 'Especializados' },
        { label: 'Análise de Margem', val: '100%', change: 'Em tempo real' },
        { label: 'Sugestões de Upsell', val: 'Ativas', change: 'Por cliente' },
      ],
      highlights: [
        'Consultoria orientada aos seus números reais de faturamento',
        'Geração de relatórios executivos para envio aos seus clientes',
        'Privacidade corporativa: seus dados não treinam modelos públicos',
      ],
    },
  ];

  const currentFeature = interactiveFeatures.find((f) => f.id === activeTab) || interactiveFeatures[0];

  const plans = [
    {
      name: 'Starter',
      subtitle: 'Para agências enxutas e prestadores solo',
      priceMonthly: 197,
      priceAnnual: 157,
      popular: false,
      features: [
        'Dashboard Financeiro (MRR, LTV, CAC, Churn)',
        'Controle de Fluxo de Caixa & DRE',
        'Agenda de Reuniões & Compromissos',
        'Calculadora de ROI & Rentabilidade',
        'Kanban de Tarefas e Projetos',
        'Até 3 usuários na equipe',
        'Suporte por e-mail e comunidade',
      ],
      cta: 'Iniciar 14 Dias Grátis',
      ctaStyle: 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700',
    },
    {
      name: 'Professional',
      subtitle: 'Para agências em crescimento que buscam escala',
      priceMonthly: 497,
      priceAnnual: 397,
      popular: true,
      badge: 'MAIS ESCOLHIDO',
      features: [
        'Tudo incluso no plano Starter',
        'Dashboard de Tráfego Pago (Meta & Google Ads)',
        'Hub de Marketing, Funis & Copywriting',
        'Hub do Designer com Fluxo de Aprovações',
        'Maps Scraper B2B (Leads Ilimitados)',
        'IA Consultora de Negócios (RAG Integrado)',
        'Relatórios Executivos com 1 clique',
        'Até 10 usuários com controle de permissões',
        'Suporte prioritário via WhatsApp',
      ],
      cta: 'Experimentar Plano Pro',
      ctaStyle: 'bg-white hover:bg-neutral-200 text-black font-extrabold',
    },
    {
      name: 'Enterprise',
      subtitle: 'Para grandes operações e redes de agências',
      priceMonthly: 997,
      priceAnnual: 797,
      popular: false,
      features: [
        'Tudo incluso no plano Professional',
        'Usuários e Colaboradores Ilimitados',
        'Social Hub Completo (Instagram & WhatsApp)',
        'Controle Avançado de Estoque e Suprimentos',
        'Painel Master de Administração & Multi-Agência',
        'Auditoria de Logs e Segurança Avançada',
        'Onboarding personalizado com nosso time',
        'SLA de 99.9% e Gerente de Contas Dedicado',
      ],
      cta: 'Contratar Enterprise',
      ctaStyle: 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700',
    },
  ];

  const faqs = [
    {
      q: 'Como funciona o período de teste grátis de 14 dias?',
      a: 'Você tem acesso imediato e completo a todos os recursos do AgencyOS por 14 dias sem necessidade de cadastrar cartão de crédito. Se decidir assinar após o período, seus dados e configurações permanecem intactos.',
    },
    {
      q: 'O AgencyOS substitui quais outras ferramentas?',
      a: 'O AgencyOS substitui planilhas financeiras complexas, ferramentas de relatórios de tráfego, plataformas de extração de leads, softwares de aprovação de criativos e quadros de tarefas dispersos, centralizando toda a operação.',
    },
    {
      q: 'Posso definir permissões diferentes para cada membro da equipe?',
      a: 'Sim. Nosso controle de acessos (RBAC) permite atribuir papéis como Administrador Geral, Gestor de Tráfego, Designer Criativo, Vendedor/Comercial ou Financeiro, liberando apenas as telas necessárias para cada cargo.',
    },
    {
      q: 'Os dados dos meus clientes e métricas estão protegidos?',
      a: 'Utilizamos infraestrutura em nuvem segura com banco de dados Firestore isolado por agência, criptografia ponta a ponta e conformidade com as melhores práticas corporativas de segurança e LGPD.',
    },
    {
      q: 'Como funciona o Maps Scraper de Leads?',
      a: 'O módulo pesquisa diretamente estabelecimentos no Google Maps conforme a cidade e nicho selecionados (ex: "Clínicas Odontológicas em Curitiba"), capturando telefones, endereços, websites e links sociais prontos para prospecção.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-100 font-sans selection:bg-white selection:text-black">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 bg-[#000000]/95 backdrop-blur-md border-b border-neutral-800">
        <div className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-black text-sm">
              <Zap className="w-4 h-4 fill-black stroke-black" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-white text-base tracking-tight">AgencyOS</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-700">
                  v2.6
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-medium tracking-wide">by Techify</span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-neutral-400">
            <a href="#solucoes" className="hover:text-white transition-colors">
              Soluções
            </a>
            <a href="#modulos" className="hover:text-white transition-colors">
              Módulos
            </a>
            <a href="#comparativo" className="hover:text-white transition-colors">
              Por que Nós
            </a>
            <a href="#precos" className="hover:text-white transition-colors">
              Planos & Preços
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDocs}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-neutral-900 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Documentação</span>
            </button>
            <button
              onClick={handleLogin}
              className="text-xs font-bold text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-neutral-900 transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={handleStart}
              className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 text-black font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Testar Grátis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 text-center max-w-5xl mx-auto space-y-7">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-semibold text-neutral-300">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span>Plataforma Corporativa de Gestão para Agências Digitais</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
          A estrutura definitiva para <br className="hidden sm:inline" />
          <span className="text-neutral-100">escalar sua agência</span> com rentabilidade.
        </h1>

        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed font-normal">
          DRE e Financeiro em tempo real, painéis de tráfego pago, prospecção ativa de leads, esteira de criativos e funis de marketing integrados em um único software.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 stroke-[2.5]" />
            <span>Começar 14 Dias Grátis</span>
          </button>
          <button
            onClick={handleLogin}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Acessar Painel Demonstração</span>
            <ArrowRight className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        {/* Badges / Guarantees Row */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap text-xs text-neutral-400 pt-4 border-t border-neutral-900 max-w-3xl mx-auto">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" /> Sem cartão de crédito
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" /> Configuração em 2 minutos
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" /> Suporte em português
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" /> Cancelamento em 1 clique
          </span>
        </div>
      </section>

      {/* Interactive Feature Deep-Dive Section */}
      <section id="solucoes" className="py-16 px-6 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
            ECOSSISTEMA 360°
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Toda a operação da sua agência em sincronia
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Alterne entre os módulos e veja como cada setor se conecta para gerar clareza e lucro.
          </p>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap border-b border-neutral-800 pb-4">
          {interactiveFeatures.map((feat) => {
            const Icon = feat.icon;
            const isActive = activeTab === feat.id;
            return (
              <button
                key={feat.id}
                onClick={() => setActiveTab(feat.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white text-black font-extrabold shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-neutral-500'}`} />
                <span>{feat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Feature Display Card */}
        <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900 border border-neutral-700 text-[11px] font-bold text-neutral-200">
              <currentFeature.icon className="w-3.5 h-3.5 text-white" />
              <span>{currentFeature.title}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {currentFeature.headline}
            </h3>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              {currentFeature.description}
            </p>

            <div className="space-y-2.5 pt-2">
              {currentFeature.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                  <div className="w-4 h-4 rounded-full bg-neutral-900 border border-neutral-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={handleStart}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Experimentar este módulo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Metric Dashboard Mockup Frame */}
          <div className="lg:col-span-6 bg-[#121212] border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" /> Indicadores Operacionais
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">Status: Em Tempo Real</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {currentFeature.metrics.map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-[#181818] border border-neutral-800 space-y-1">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{m.label}</div>
                  <div className="text-lg font-black text-white">{m.val}</div>
                  <div className="text-[10px] font-semibold text-neutral-300 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-white" />
                    <span>{m.change}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-[#181818] border border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
              <span>Sincronização com Firestore e Auth</span>
              <span className="text-white font-bold font-mono">Conectado (99.9% SLA)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Why Techify / AgencyOS vs Generic Spreadsheets */}
      <section id="comparativo" className="py-16 px-6 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
            COMPARAÇÃO DIRETA
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Por que migrar para uma plataforma corporativa?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Veja a diferença entre gerenciar com ferramentas fragmentadas versus um ecossistema unificado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Old Way */}
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-neutral-300 font-bold text-sm border-b border-neutral-800 pb-3">
              <XCircle className="w-5 h-5 text-neutral-500" />
              <span>Sem o AgencyOS (Gestão Fragmentada)</span>
            </div>
            <ul className="space-y-3 text-xs text-neutral-400">
              <li className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                <span>5 a 7 ferramentas diferentes com cobranças em dólar separadas.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                <span>Planilhas de fluxo de caixa que desatualizam e não calculam LTV e Churn.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                <span>Criativos e briefings perdidos em grupos desorganizados de WhatsApp.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <XCircle className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                <span>Prospecção manual lenta sem validação de dados de contato.</span>
              </li>
            </ul>
          </div>

          {/* AgencyOS Way */}
          <div className="bg-[#0a0a0a] border border-neutral-600 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 text-white font-bold text-sm border-b border-neutral-700 pb-3">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>Com o AgencyOS by Techify</span>
            </div>
            <ul className="space-y-3 text-xs text-neutral-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>Plataforma única em reais, centralizando finanças, tráfego, CRM e design.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>DRE automatizado e métricas de retenção atualizadas a cada pagamento.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>Esteira clara com aprovação de líderes e exportação estruturada de entregas.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>Mineração de contatos qualificados no Google Maps direto para o Kanban de vendas.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-16 px-6 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
            TABELA DE PREÇOS
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Planos transparentes para cada estágio da sua agência
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Teste gratuitamente por 14 dias com todos os recursos liberados.
          </p>

          {/* Billing Switch */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <div className="p-1 rounded-xl bg-neutral-950 border border-neutral-800 inline-flex items-center text-xs font-bold">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  billingCycle === 'annual'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>Anual</span>
                <span className="text-[10px] font-bold text-white px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-700">
                  -20%
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {plans.map((plan, idx) => {
            const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
            return (
              <div
                key={idx}
                className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all ${
                  plan.popular
                    ? 'bg-[#0e0e0e] border-2 border-white shadow-xl shadow-white/5 relative'
                    : 'bg-[#0a0a0a] border border-neutral-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white text-black text-[10px] font-black tracking-wider uppercase">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-neutral-400 leading-snug">{plan.subtitle}</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800">
                    <div className="text-3xl sm:text-4xl font-black text-white flex items-baseline gap-1">
                      R$ {price}
                      <span className="text-xs text-neutral-500 font-medium">/mês</span>
                    </div>
                    {billingCycle === 'annual' && (
                      <p className="text-[10px] text-neutral-300 font-semibold pt-1">
                        Faturado anualmente com desconto
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2.5 text-xs text-neutral-300 pt-2">
                    {plan.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-white shrink-0 mt-0.5 stroke-[3]" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-neutral-800">
                  <button
                    onClick={handleStart}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${plan.ctaStyle}`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-6 max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
            DÚVIDAS FREQUENTES
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Perguntas frequentes sobre a plataforma
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-[#0a0a0a] border border-neutral-800 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4.5 text-left font-bold text-white text-xs sm:text-sm flex items-center justify-between gap-4 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4.5 pb-4 text-xs text-neutral-400 border-t border-neutral-800 pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white mx-auto shadow-sm">
          <Zap className="w-6 h-6 fill-white" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Pronto para assumir o controle total da sua agência?
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
          Junte-se a gestores que substituíram planilhas manuais e desorganização por um painel corporativo completo.
        </p>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Clock className="w-4 h-4 stroke-[2.5]" />
            <span>Começar 14 Dias Grátis Agora</span>
          </button>
          <button
            onClick={handleDocs}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-neutral-400" />
            <span>Ver Documentação Técnica</span>
          </button>
        </div>
      </section>

      {/* Corporate Clean Monochrome Footer */}
      <footer className="border-t border-neutral-900 py-8 px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
            <Zap className="w-3.5 h-3.5 fill-white" />
          </div>
          <span>
            AgencyOS by <strong className="text-white font-semibold">Techify</strong> • Todos os direitos reservados
          </span>
        </div>
        <div className="flex items-center gap-5 text-neutral-400 text-[11px]">
          <span>Criptografia 256-bit</span>
          <span>•</span>
          <span>Multi-tenant Seguro</span>
          <span>•</span>
          <span>© 2026 Techify</span>
        </div>
      </footer>
    </div>
  );
};

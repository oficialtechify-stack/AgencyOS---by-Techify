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
}) => {
  const handleStart = () => {
    if (onStartTrial) onStartTrial();
    else if (onNavigate) onNavigate('trial-signup');
  };

  const [selectedModules, setSelectedModules] = useState<string[]>([
    'financeiro',
    'fluxo-caixa',
    'roi',
  ]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const modulesList = [
    {
      id: 'financeiro',
      name: 'Financeiro',
      desc: 'KPIs em tempo real: MRR, ARR, LTV, CAC e Churn Rate',
      priceTag: 'Incluído',
      isIncluded: true,
      icon: DollarSign,
      iconColor: 'text-[#22c55e]',
      iconBg: 'bg-[#12281a] border-[#1e442c]',
      priceColor: 'text-[#22c55e] bg-[#12281a] border-[#1e442c]',
    },
    {
      id: 'fluxo-caixa',
      name: 'Fluxo de Caixa',
      desc: 'Controle total de entradas, saídas e categorias',
      priceTag: 'Incluído',
      isIncluded: true,
      icon: TrendingUp,
      iconColor: 'text-[#22c55e]',
      iconBg: 'bg-[#12281a] border-[#1e442c]',
      priceColor: 'text-[#22c55e] bg-[#12281a] border-[#1e442c]',
    },
    {
      id: 'trafego',
      name: 'Tráfego',
      desc: 'Dashboards de Facebook Ads, Google Ads integrados',
      priceTag: '+R$47/mês',
      isIncluded: false,
      icon: BarChart3,
      iconColor: 'text-blue-400',
      iconBg: 'bg-[#121c2e] border-[#1e304f]',
      priceColor: 'text-blue-400',
    },
    {
      id: 'maps-scraper',
      name: 'Maps Scraper',
      desc: 'Extraia leads do Google Maps e importe para o CRM',
      priceTag: '+R$97/mês',
      isIncluded: false,
      icon: MapPin,
      iconColor: 'text-amber-400',
      iconBg: 'bg-[#2b1f14] border-[#44311e]',
      priceColor: 'text-amber-400',
    },
    {
      id: 'roi',
      name: 'Calculadora ROI',
      desc: 'Preveja faturamento e calcule rentabilidade real',
      priceTag: 'Incluído',
      isIncluded: true,
      icon: Calculator,
      iconColor: 'text-purple-400',
      iconBg: 'bg-[#22162e] border-[#3a254f]',
      priceColor: 'text-[#22c55e] bg-[#12281a] border-[#1e442c]',
    },
  ];

  const toggleModule = (id: string) => {
    if (selectedModules.includes(id)) {
      setSelectedModules(selectedModules.filter((m) => m !== id));
    } else {
      setSelectedModules([...selectedModules, id]);
    }
  };

  const faqs = [
    {
      q: 'Preciso instalar alguma coisa?',
      a: 'Não! O AgencyOS é 100% em nuvem e funciona diretamente no seu navegador, desktop ou celular sem downloads.',
    },
    {
      q: 'Meus dados são seguros?',
      a: 'Sim. Utilizamos criptografia de ponta a ponta e dados isolados em servidor seguro para cada agência.',
    },
    {
      q: 'Posso cancelar quando quiser?',
      a: 'Com certeza. Não há contrato de fidelidade. Você pode cancelar sua assinatura a qualquer momento com 1 clique.',
    },
    {
      q: 'A IA Consultora tem acesso a todos os dados?',
      a: 'A IA lê os indicadores de faturamento em tempo real para te dar conselhos personalizados de negócios, mantendo sigilo absoluto.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-[#22c55e] selection:text-black">
      {/* Top Header Navbar */}
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#22c55e] flex items-center justify-center text-black shadow-[0_0_12px_rgba(34,197,94,0.4)]">
            <Zap className="w-4 h-4 fill-black stroke-black" />
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="font-extrabold text-white tracking-tight">AgencyOS</span>
            <span className="text-[11px] font-semibold text-[#22c55e]">by Techify</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStart}
            className="px-4 py-2 rounded-lg bg-[#a3e635] hover:bg-[#8fd32b] text-black font-extrabold text-xs shadow-md transition-transform hover:scale-105 cursor-pointer"
          >
            Começar Grátis
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-14 px-6 text-center max-w-4xl mx-auto space-y-6 relative">
        {/* Glow behind hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#22c55e]/10 blur-3xl rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0d1e10] border border-[#1b3d22] text-[11px] font-semibold text-[#86efac]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
          <span>Novo: IA Consultora com RAG disponível</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-3xl mx-auto">
          Gerencie sua agência <br />
          <span className="text-[#a3e635]">completa</span> em um só lugar
        </h1>

        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
          Financeiro, tráfego pago, CRM de leads, agenda e IA consultora — tudo integrado, em tempo
          real, no celular ou desktop.
        </p>

        <div className="flex flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleStart}
            className="px-6 py-3 rounded-xl bg-[#a3e635] hover:bg-[#8fd32b] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(163,230,53,0.35)] transition-all hover:scale-105 cursor-pointer"
          >
            <Clock className="w-4 h-4 stroke-[2.5]" />
            <span>Trial Grátis 14 dias</span>
          </button>
          <a
            href="#modulos"
            className="px-5 py-3 rounded-xl bg-[#0d0f14] hover:bg-[#151922] border border-[#202636] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <span>Ver Módulos</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
          </a>
        </div>

        {/* Value Props Checklist Bar */}
        <div className="flex items-center justify-center gap-5 sm:gap-7 flex-wrap text-xs text-gray-400 pt-3">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> 7 módulos integrados
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> Multi-tenant
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> Mobile First
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> IA Incluída
          </span>
        </div>
      </section>

      {/* Modules Selector Section */}
      <section id="modulos" className="py-16 px-6 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-1.5">
          <div className="text-[11px] font-black text-[#22c55e] uppercase tracking-widest">
            MÓDULOS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Selecione o que você precisa
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Monte seu plano adicionando módulos ao carrinho
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {modulesList.slice(0, 4).map((m) => {
            const Icon = m.icon;
            const isSelected = selectedModules.includes(m.id);
            return (
              <div
                key={m.id}
                onClick={() => toggleModule(m.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-[#0b0e14] border-[#1e2536] shadow-[0_0_15px_rgba(34,197,94,0.08)]'
                    : 'bg-[#08090d] border-[#151722] hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center ${m.iconBg} ${m.iconColor}`}
                  >
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border transition-all ${
                      isSelected
                        ? 'border-[#22c55e] bg-[#22c55e]/20 flex items-center justify-center'
                        : 'border-gray-600 bg-transparent'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white text-xs">{m.name}</h4>
                  <p className="text-[10px] text-gray-400 leading-snug line-clamp-2">{m.desc}</p>
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px]">
                  {m.isIncluded ? (
                    <span className="px-2 py-0.5 rounded font-bold text-[#22c55e] bg-[#12281a] border border-[#1e442c]">
                      Incluído
                    </span>
                  ) : (
                    <span className={`font-bold ${m.priceColor}`}>{m.priceTag}</span>
                  )}
                  <span className="text-gray-500">Clique para add</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Second row: Calculadora ROI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {modulesList.slice(4).map((m) => {
            const Icon = m.icon;
            const isSelected = selectedModules.includes(m.id);
            return (
              <div
                key={m.id}
                onClick={() => toggleModule(m.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 opacity-90 ${
                  isSelected
                    ? 'bg-[#0b0e14] border-[#1e2536]'
                    : 'bg-[#08090d] border-[#151722] hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center ${m.iconBg} ${m.iconColor}`}
                  >
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border transition-all ${
                      isSelected
                        ? 'border-[#22c55e] bg-[#22c55e]/20 flex items-center justify-center'
                        : 'border-gray-600 bg-transparent'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white text-xs">{m.name}</h4>
                  <p className="text-[10px] text-gray-400 leading-snug line-clamp-2">{m.desc}</p>
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <span className="px-2 py-0.5 rounded font-bold text-[#22c55e] bg-[#12281a] border border-[#1e442c]">
                    Incluído
                  </span>
                  <span className="text-gray-500">Clique para add</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-1.5">
          <div className="text-[11px] font-black text-[#22c55e] uppercase tracking-widest">
            PLANOS
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Preço justo, resultado real
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Starter */}
          <div className="p-6 rounded-2xl bg-[#090b10] border border-[#181a24] space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-400">Starter</span>
              <div className="text-3xl font-black text-white flex items-baseline gap-1">
                R$197 <span className="text-xs text-gray-500 font-normal">/mês</span>
              </div>
              <ul className="space-y-2.5 text-xs text-gray-300 pt-3">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> Dashboard Financeiro
                  (MRR, LTV, CAC)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> Fluxo de Caixa
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> Agenda
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> Calculadora de ROI
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> Kanban de projetos
                </li>
              </ul>
            </div>
            <button
              onClick={handleStart}
              className="w-full py-2.5 rounded-xl bg-[#12141c] hover:bg-[#1a1e2a] border border-[#222738] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Começar Grátis 14 dias</span>
            </button>
          </div>

          {/* Pro (Featured) */}
          <div className="p-6 rounded-2xl bg-[#090e0c] border-2 border-[#22c55e] space-y-5 flex flex-col justify-between relative shadow-[0_0_30px_rgba(34,197,94,0.15)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#a3e635] text-black text-[10px] font-black tracking-wider uppercase">
              MAIS POPULAR
            </div>
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-300">Pro</span>
              <div className="text-3xl font-black text-white flex items-baseline gap-1">
                R$497 <span className="text-xs text-gray-500 font-normal">/mês</span>
              </div>
              <ul className="space-y-2.5 text-xs text-gray-200 pt-3">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> Tudo do Starter
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> Dashboard de Tráfego
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> Maps Scraper + CRM
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> IA Consultora
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> Relatórios
                </li>
              </ul>
            </div>
            <button
              onClick={handleStart}
              className="w-full py-2.5 rounded-xl bg-[#a3e635] hover:bg-[#8fd32b] text-black font-black text-xs shadow-md transition-transform hover:scale-105 cursor-pointer"
            >
              Assinar Pro
            </button>
          </div>

          {/* Agency */}
          <div className="p-6 rounded-2xl bg-[#090b10] border border-[#181a24] space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-400">Agency</span>
              <div className="text-3xl font-black text-white flex items-baseline gap-1">
                R$997 <span className="text-xs text-gray-500 font-normal">/mês</span>
              </div>
              <ul className="space-y-2.5 text-xs text-gray-300 pt-3">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> Tudo do Pro
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> Social Hub
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> Estoque
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> Usuários Ilimitados
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#22c55e] stroke-[3]" /> Suporte prioritário
                </li>
              </ul>
            </div>
            <button
              onClick={handleStart}
              className="w-full py-2.5 rounded-xl bg-[#12141c] hover:bg-[#1a1e2a] border border-[#222738] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Assinar Agency</span>
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 px-6 max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Perguntas Frequentes</h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-[#090a0f] border border-[#161924] overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-bold text-white text-xs flex items-center justify-between gap-4 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-[#22c55e]' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-gray-400 border-t border-[#131620] pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#0e2213] border border-[#1b4426] flex items-center justify-center text-[#22c55e] mx-auto shadow-[0_0_20px_rgba(34,197,94,0.2)]">
          <Zap className="w-6 h-6 fill-[#22c55e]" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-white">Pronto para escalar?</h2>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Acesse o sistema completo agora e gerencie sua agência com inteligência.
        </p>

        <div className="pt-2">
          <button
            onClick={handleStart}
            className="px-6 py-3 rounded-xl bg-[#a3e635] hover:bg-[#8fd32b] text-black font-extrabold text-xs shadow-[0_0_25px_rgba(163,230,53,0.3)] transition-transform hover:scale-105 inline-flex items-center gap-2 cursor-pointer"
          >
            <Clock className="w-4 h-4 stroke-[2.5]" />
            <span>Começar 14 dias grátis</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#12141c] py-6 px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#12281a] border border-[#1e442c] flex items-center justify-center text-[#22c55e]">
            <Zap className="w-3 h-3 fill-[#22c55e]" />
          </div>
          <span>
            AgencyOS by <strong className="text-[#22c55e] font-semibold">Techify</strong>
          </span>
        </div>
        <div>
          <p>© 2025 Techify. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

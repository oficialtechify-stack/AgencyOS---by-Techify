import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Target, Users, ArrowUpRight } from 'lucide-react';

export const CalculadoraROIView: React.FC = () => {
  const [ticketMedio, setTicketMedio] = useState(2500); // R$/mês por cliente
  const [targetRevenue, setTargetRevenue] = useState(50000); // Meta de faturamento
  const [metaConversionRate, setMetaConversionRate] = useState(10); // % de leads que fecham
  const [cpl, setCpl] = useState(25); // Custo por lead em R$
  const [avgRetentionMonths, setAvgRetentionMonths] = useState(12); // LTV em meses

  const activeClientsNeeded = Math.ceil(targetRevenue / ticketMedio);
  const totalLeadsNeeded = Math.ceil((activeClientsNeeded / (metaConversionRate / 100)));
  const totalMediaSpendNeeded = totalLeadsNeeded * cpl;
  const projectedLtv = ticketMedio * avgRetentionMonths;
  const estimatedCac = (totalMediaSpendNeeded / (activeClientsNeeded || 1));
  const ltvCacRatio = estimatedCac > 0 ? (projectedLtv / estimatedCac).toFixed(1) : '0';

  return (
    <div className="space-y-6 text-gray-200">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#12141c] border border-[#1e2332] space-y-2">
        <div className="flex items-center gap-2 text-[#22c55e] font-bold text-xs">
          <Calculator className="w-4 h-4" /> CALCULADORA SIMULADORA DE EXPANSÃO SAAS & AGÊNCIA
        </div>
        <h2 className="text-xl font-black text-white">Simulador de Meta de Vendas & Viabilidade LTV/CAC</h2>
        <p className="text-xs text-gray-400">
          Ajuste as métricas da sua operação para prever investimento em anúncios, volume de leads
          necessários e retorno projetado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#12141c] border border-[#1e2332] space-y-5">
          <h3 className="font-extrabold text-white text-sm border-b border-[#1f2434] pb-3">
            Parâmetros de Simulação
          </h3>

          <div className="space-y-4 text-xs">
            {/* Ticket Medio */}
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-gray-300">Ticket Médio Mensal por Cliente</span>
                <span className="text-[#22c55e]">R$ {ticketMedio.toLocaleString('pt-BR')}</span>
              </div>
              <input
                type="range"
                min="500"
                max="15000"
                step="250"
                value={ticketMedio}
                onChange={(e) => setTicketMedio(Number(e.target.value))}
                className="w-full accent-[#22c55e] bg-[#1d2232] h-2 rounded-lg"
              />
            </div>

            {/* Meta Revenue */}
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-gray-300">Meta de Faturamento Mensal (MRR)</span>
                <span className="text-[#22c55e]">R$ {targetRevenue.toLocaleString('pt-BR')}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="300000"
                step="5000"
                value={targetRevenue}
                onChange={(e) => setTargetRevenue(Number(e.target.value))}
                className="w-full accent-[#22c55e] bg-[#1d2232] h-2 rounded-lg"
              />
            </div>

            {/* Taxa Conversao */}
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-gray-300">Taxa de Conversão da Equipe (%)</span>
                <span className="text-[#22c55e]">{metaConversionRate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                step="1"
                value={metaConversionRate}
                onChange={(e) => setMetaConversionRate(Number(e.target.value))}
                className="w-full accent-[#22c55e] bg-[#1d2232] h-2 rounded-lg"
              />
            </div>

            {/* CPL */}
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-gray-300">Custo Por Lead Médio (CPL)</span>
                <span className="text-[#22c55e]">R$ {cpl}</span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={cpl}
                onChange={(e) => setCpl(Number(e.target.value))}
                className="w-full accent-[#22c55e] bg-[#1d2232] h-2 rounded-lg"
              />
            </div>

            {/* Retention */}
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-gray-300">Permanência Média do Cliente</span>
                <span className="text-[#22c55e]">{avgRetentionMonths} meses</span>
              </div>
              <input
                type="range"
                min="3"
                max="36"
                step="1"
                value={avgRetentionMonths}
                onChange={(e) => setAvgRetentionMonths(Number(e.target.value))}
                className="w-full accent-[#22c55e] bg-[#1d2232] h-2 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#12141c] border border-[#1e2332] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                <span>CLIENTES NECESSÁRIOS</span>
                <Users className="w-4 h-4 text-[#22c55e]" />
              </div>
              <div className="text-3xl font-black text-white">{activeClientsNeeded} clientes</div>
              <p className="text-[10px] text-gray-500">Para atingir a meta de MRR</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#12141c] border border-[#1e2332] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                <span>LEADS NECESSÁRIOS</span>
                <Target className="w-4 h-4 text-[#22c55e]" />
              </div>
              <div className="text-3xl font-black text-[#22c55e]">{totalLeadsNeeded} leads</div>
              <p className="text-[10px] text-gray-500">
                Com taxa de conversão de {metaConversionRate}%
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#12141c] border border-[#1e2332] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                <span>INVESTIMENTO EM TRÁFEGO</span>
                <DollarSign className="w-4 h-4 text-[#22c55e]" />
              </div>
              <div className="text-3xl font-black text-white">
                R$ {totalMediaSpendNeeded.toLocaleString('pt-BR')}
              </div>
              <p className="text-[10px] text-gray-500">Verba estimada para compra de tráfego</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#12141c] border border-[#1e2332] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                <span>LTV PROJETADO</span>
                <TrendingUp className="w-4 h-4 text-[#22c55e]" />
              </div>
              <div className="text-3xl font-black text-[#22c55e]">
                R$ {projectedLtv.toLocaleString('pt-BR')}
              </div>
              <p className="text-[10px] text-gray-500">Valor gerado por cliente ao longo do contrato</p>
            </div>
          </div>

          {/* LTV/CAC Card */}
          <div className="p-6 rounded-2xl bg-[#122215] border-2 border-[#22c55e] space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-[#22c55e] uppercase">
                  Relação LTV / CAC Projetada
                </span>
                <h4 className="text-2xl font-black text-white">{ltvCacRatio} : 1</h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gray-400">CAC Estimado</span>
                <div className="text-lg font-bold text-white">
                  R$ {estimatedCac.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {Number(ltvCacRatio) >= 3 ? (
                <span className="text-[#22c55e] font-bold">
                  ✓ Excelente saúde financeira! O LTV é mais que 3x maior que o custo de aquisição.
                </span>
              ) : (
                <span className="text-yellow-400 font-bold">
                  ⚠ Atenção: Aumente o ticket médio ou diminua o CPL para obter um LTV/CAC acima de 3.0.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

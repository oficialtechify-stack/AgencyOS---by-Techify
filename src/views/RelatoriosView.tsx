import React from 'react';
import { FileText, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { KPIPeriod, CashTransaction, AdCampaign, CRMLead, StockItem } from '../types';

interface RelatoriosViewProps {
  kpiPeriods?: KPIPeriod[];
  transactions?: CashTransaction[];
  campaigns?: AdCampaign[];
  leads?: CRMLead[];
  stockItems?: StockItem[];
}

export const RelatoriosView: React.FC<RelatoriosViewProps> = ({
  kpiPeriods = [],
  transactions = [],
  campaigns = [],
  leads = [],
  stockItems = [],
}) => {
  const downloadTXT = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportFinancialReport = () => {
    const latestKPI = kpiPeriods[kpiPeriods.length - 1];
    let text = `=========================================\n`;
    text += `   RELATÓRIO FINANCEIRO - AGENCYOS\n`;
    text += `   Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    text += `=========================================\n\n`;

    if (latestKPI) {
      text += `MÉTRICAS ATUAIS (${latestKPI.monthYear}):\n`;
      text += `- MRR: R$ ${latestKPI.mrr.toLocaleString('pt-BR')}\n`;
      text += `- ARR: R$ ${latestKPI.arr.toLocaleString('pt-BR')}\n`;
      text += `- LTV: R$ ${latestKPI.ltv.toLocaleString('pt-BR')}\n`;
      text += `- CAC: R$ ${latestKPI.cac.toLocaleString('pt-BR')}\n`;
      text += `- Churn Rate: ${latestKPI.churnRate}%\n`;
      text += `- Clientes Ativos: ${latestKPI.activeClients}\n\n`;
    }

    text += `HISTÓRICO DE TRANSAÇÕES DE CAIXA (${transactions.length}):\n`;
    transactions.forEach((t, i) => {
      text += `${i + 1}. [${t.date}] ${t.type} - ${t.category}: R$ ${t.amount} (${t.description})\n`;
    });

    downloadTXT(`relatorio_financeiro_agencyos_${Date.now()}.txt`, text);
  };

  const exportTrafficReport = () => {
    let text = `=========================================\n`;
    text += `   RELATÓRIO DE TRÁFEGO PAGO - AGENCYOS\n`;
    text += `   Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    text += `=========================================\n\n`;

    text += `CAMPANHAS ATIVAS (${campaigns.length}):\n`;
    campaigns.forEach((c, i) => {
      text += `${i + 1}. ${c.name} [${c.platform}]\n`;
      text += `   Investimento: R$ ${c.spend} | Retorno: R$ ${c.revenue} | ROAS: ${c.roas}x\n`;
      text += `   Cliques: ${c.clicks} | Conversões: ${c.conversions}\n\n`;
    });

    downloadTXT(`relatorio_trafego_agencyos_${Date.now()}.txt`, text);
  };

  const exportCRMReport = () => {
    let text = `=========================================\n`;
    text += `   RELATÓRIO DE LEADS & CRM - AGENCYOS\n`;
    text += `   Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    text += `=========================================\n\n`;

    text += `LEADS NO PIPELINE (${leads.length}):\n`;
    leads.forEach((l, i) => {
      text += `${i + 1}. ${l.name} (${l.category} - ${l.city})\n`;
      text += `   Tel: ${l.phone} | Email: ${l.email}\n`;
      text += `   Website: ${l.website || 'Nenhum'} | Instagram: ${l.instagram}\n`;
      text += `   Status CRM: ${l.status.toUpperCase()} | Avaliação: ${l.rating} estrelas\n\n`;
    });

    downloadTXT(`relatorio_crm_agencyos_${Date.now()}.txt`, text);
  };

  const exportStockReport = () => {
    let text = `=========================================\n`;
    text += `   RELATÓRIO DE ESTOQUE - AGENCYOS\n`;
    text += `   Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    text += `=========================================\n\n`;

    text += `ITENS DE ESTOQUE (${stockItems.length}):\n`;
    stockItems.forEach((item, i) => {
      text += `${i + 1}. ${item.name} (${item.category})\n`;
      text += `   Quantidade: ${item.quantity} un | Mínimo: ${item.minQuantity} un\n`;
      text += `   Preço Unitário: R$ ${item.unitPrice} | Status: ${item.status}\n\n`;
    });

    downloadTXT(`relatorio_estoque_agencyos_${Date.now()}.txt`, text);
  };

  const exportFullSystemReport = () => {
    let text = `=========================================\n`;
    text += `   RELATÓRIO EXECUTIVO COMPLETO - AGENCYOS\n`;
    text += `   Data de Emissão: ${new Date().toLocaleString('pt-BR')}\n`;
    text += `=========================================\n\n`;

    text += `1. RESUMO EXECUTIVO:\n`;
    text += `- Períodos Financeiros Registrados: ${kpiPeriods.length}\n`;
    text += `- Transações de Caixa: ${transactions.length}\n`;
    text += `- Campanhas de Tráfego: ${campaigns.length}\n`;
    text += `- Leads Qualificados CRM: ${leads.length}\n`;
    text += `- Itens de Estoque: ${stockItems.length}\n\n`;

    text += `-----------------------------------------\n`;
    text += `2. LEADS E CRM:\n`;
    leads.forEach((l) => {
      text += `- ${l.name} | ${l.category} | ${l.phone} | Status: ${l.status}\n`;
    });

    downloadTXT(`relatorio_completo_agencyos_${Date.now()}.txt`, text);
  };

  return (
    <div className="space-y-6 text-neutral-200 font-sans max-w-7xl mx-auto pb-16">
      {/* Notice Banner */}
      <div className="p-6 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-2">
        <div className="flex items-center gap-2 text-neutral-300 font-bold text-xs">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>CENTRAL DE EXPORTAÇÃO NATIVA</span>
        </div>
        <h2 className="text-xl font-black text-white">Exporte relatórios completos em formato .txt</h2>
        <p className="text-xs text-neutral-400">
          Gere arquivos de texto formatados para backup local, auditoria interna ou envio rápido por
          WhatsApp e email.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Financeiro */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white border border-neutral-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Relatório Financeiro</h3>
            <p className="text-xs text-neutral-400">
              Contém KPIs do último período (MRR, ARR, LTV, CAC, Churn) e histórico completo de
              entradas e saídas de caixa.
            </p>
          </div>
          <button
            onClick={exportFinancialReport}
            className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all border border-neutral-700 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Exportar Financeiro (.txt)
          </button>
        </div>

        {/* Tráfego */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white border border-neutral-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Relatório de Tráfego</h3>
            <p className="text-xs text-neutral-400">
              Desempenho de anúncios (Meta Ads, Google Ads), investimentos, conversões, ROAS e
              cliques.
            </p>
          </div>
          <button
            onClick={exportTrafficReport}
            className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all border border-neutral-700 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Exportar Tráfego (.txt)
          </button>
        </div>

        {/* CRM */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white border border-neutral-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Relatório de CRM & Leads</h3>
            <p className="text-xs text-neutral-400">
              Lista de todos os leads extraídos pelo Maps Scraper com telefones, emails e status no
              funil.
            </p>
          </div>
          <button
            onClick={exportCRMReport}
            className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all border border-neutral-700 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Exportar CRM (.txt)
          </button>
        </div>

        {/* Estoque */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white border border-neutral-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Relatório de Estoque</h3>
            <p className="text-xs text-neutral-400">
              Mapeamento de produtos, unidades disponíveis, reposições pendentes e valor total
              imobilizado.
            </p>
          </div>
          <button
            onClick={exportStockReport}
            className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all border border-neutral-700 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Exportar Estoque (.txt)
          </button>
        </div>

        {/* Completo */}
        <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-700 space-y-4 flex flex-col justify-between lg:col-span-2 shadow-lg">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white border border-neutral-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Relatório Consolidado Executivo</h3>
            <p className="text-xs text-neutral-300">
              Gera um dossiê técnico e operacional unificado agregando finanças, tráfego, CRM e
              projetos da agência em um único arquivo de texto de auditoria.
            </p>
          </div>
          <button
            onClick={exportFullSystemReport}
            className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Exportar Relatório Executivo Completo (.txt)
          </button>
        </div>
      </div>
    </div>
  );
};

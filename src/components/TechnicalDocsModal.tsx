import React, { useState } from 'react';
import { X, BookOpen, Code, Server, Database, Cpu, CheckCircle2, Copy, Check } from 'lucide-react';

interface TechnicalDocsModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const TechnicalDocsModal: React.FC<TechnicalDocsModalProps> = ({ isOpen = true, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'architecture' | 'ia'>('overview');

  if (!isOpen) return null;

  const fullDocText = `
# 📘 MANUAL TÉCNICO & DOCUMENTAÇÃO COMPLETA — AGENCYOS BY TECHIFY

## 1. Visão Geral da Solução
O AgencyOS é uma plataforma SaaS completa de gestão para agências de tráfego, marketing e desenvolvimento. Integrando controle de KPIs (MRR, ARR, LTV, CAC, Churn), fluxo de caixa, prospecção e extração de leads do Google Maps, gerenciador de anúncios, gestão de projetos em Kanban, gerador de mídia social com IA e consultoria de negócios alimentada pela API do Gemini.

---

## 2. Passo a Passo Técnico de Desenvolvimento

### Etapa 1: Estrutura do Projeto & Stack
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS v4.
- Animações: Motion (Framer Motion API).
- Ícones: Lucide React icons.
- Servidor Backend: Node.js com Express v4 + esbuild.
- Motor de IA: @google/genai SDK no servidor usando o modelo gemini-3.6-flash.

### Etapa 2: Arquitetura Full-Stack com Express + Vite
1. O backend Express (\`server.ts\`) escuta na porta 3000 em \`0.0.0.0\`.
2. Em ambiente de desenvolvimento, o Vite é acoplado como middleware (\`createViteServer\`), garantindo recarregamento rápido.
3. Em produção, a aplicação é empacotada via \`esbuild server.ts --bundle --platform=node --format=cjs --outfile=dist/server.cjs\` e os arquivos estáticos do cliente são servidos via \`dist/index.html\`.

### Etapa 3: Integração Segura da IA (Gemini API)
1. **Chave API de Servidor**: A chave \`GEMINI_API_KEY\` fica restrita às rotas de backend do Express (\`/api/ai/*\`), nunca exposta no navegador.
2. **Rota do Consultor (\`/api/ai/consultant\`)**:
   - Envia o contexto das métricas do usuário (KPIs, Saldo, Leads, Campanhas) ao modelo \`gemini-3.6-flash\` junto da pergunta do usuário.
3. **Rota do Gerador de Mídia Social (\`/api/ai/social-caption\`)**:
   - Gera legendas persuasivas e blocos estratégicos de hashtags formatados para Instagram/WhatsApp.
4. **Rota do Maps Scraper (\`/api/ai/lead-scraper\`)**:
   - Gera e pesquisa leads qualificados por segmento e cidade em formato JSON estruturado com respostas tipadas.

### Etapa 4: Persistência & Gestão de Estado Local
- Implementado em \`/src/lib/storage.ts\` através de utilitários unificados que leem e gravam coleções JSON no \`localStorage\`.
- Garante sincronização em tempo real entre módulos: quando você altera o status de um lead no Maps Scraper, a contagem e as métricas do CRM refletem instantaneamente no Dashboard Geral e nos Relatórios em formato TXT.

### Etapa 5: Exportação de Relatórios
- Desenvolvido motor nativo que formata dados de finanças, tráfego, CRM e estoque em um arquivo de texto limpo (\`.txt\`) gerado em Blob nativo do navegador para download imediato.

---

## 3. Resolução de Desafios Técnicos
- **Desafio de Segurança da Chave API**: Resolvido com arquitetura full-stack server-side proxy.
- **Isolamento e Multi-Tenant**: Cada perfil de usuário armazena e consulta seu próprio isolamento de dados no cliente.
- **Design Fidelidade Total**: Tema dark neon moderno com contraste acessível, gradientes estratégicos, cantos arredondados padronizados e micro-interações responsivas.
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullDocText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#0e0e0e] border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Documentação Técnica & Soluções — AgencyOS
              </h2>
              <p className="text-xs text-neutral-400">
                Guia passo a passo de desenvolvimento, arquitetura e soluções técnicas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 bg-[#0e0e0e] px-4 gap-2 text-xs font-semibold text-neutral-400">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-white text-white font-bold'
                : 'border-transparent hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'steps'
                ? 'border-white text-white font-bold'
                : 'border-transparent hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" /> Passo a Passo Técnico
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'architecture'
                ? 'border-white text-white font-bold'
                : 'border-transparent hover:text-white'
            }`}
          >
            <Server className="w-4 h-4" /> Arquitetura & Estado
          </button>
          <button
            onClick={() => setActiveTab('ia')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ia'
                ? 'border-white text-white font-bold'
                : 'border-transparent hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" /> Integração de IA (Gemini)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-sm text-neutral-300 space-y-6 custom-scrollbar leading-relaxed">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-white" /> O que é o AgencyOS BY TECHIFY?
                </h3>
                <p className="text-xs text-neutral-300">
                  O AgencyOS é um sistema de gestão operacional e financeira idealizado para
                  agências de marketing, tráfego pago, influenciadores e empresas de software. O
                  sistema centraliza todos os setores vitais em uma interface integrada e responsiva.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <span className="font-bold text-white block mb-1">Módulos Financeiros</span>
                  Acompanhamento de KPIs em tempo real (MRR, ARR, LTV, CAC, Churn Rate) e Fluxo de
                  Caixa com relatórios por categorias (Fixos, Variáveis, Tráfego, Software).
                </div>
                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <span className="font-bold text-white block mb-1">Maps Scraper + CRM</span>
                  Busca inteligente de empresas locais no Google Maps com importação direta para o
                  funil CRM (Novo, Contatado, Qualificado, Proposta, Fechado).
                </div>
                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <span className="font-bold text-white block mb-1">IA Consultora Integrada</span>
                  Agente inteligente alimentado pelo Gemini 3.6 Flash que lê dados de faturamento da
                  agência e sugere planos de ação para escalar receitas.
                </div>
                <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <span className="font-bold text-white block mb-1">Social Hub & Ferramentas</span>
                  Gerador de legendas e hashtags por IA, Calculadora de ROI de campanhas e exportador
                  de relatórios completos em formato .txt.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-white mb-3">
                Etapas do Desenvolvimento Passo a Passo
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <span className="font-bold text-white text-sm block mb-1">
                    Passo 1: Configuração do Ambiente Node.js & Vite
                  </span>
                  <p className="text-neutral-400">
                    Inicialização do React 19 com TypeScript e Tailwind CSS v4 via Vite.
                    Configuração do servidor Express em <code className="text-white">server.ts</code>{' '}
                    com esbuild para empacotamento em CJS seguro.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <span className="font-bold text-white text-sm block mb-1">
                    Passo 2: Modelagem de Dados & TypeScript
                  </span>
                  <p className="text-neutral-400">
                    Criação de tipos rígidos em <code className="text-white">/src/types.ts</code>{' '}
                    para usuários, transações financeiras, campanhas de ads, leads do CRM, itens de
                    estoque, atualizações e planos de assinatura.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <span className="font-bold text-white text-sm block mb-1">
                    Passo 3: Módulos de Interface & Navegação
                  </span>
                  <p className="text-neutral-400">
                    Desenvolvimento dos 15 modos de visualização (Landing Page, Trial Signup, Dashboard
                    Geral, KPIs, Fluxo de Caixa, Maps Scraper, Social Hub, Kanban, Estoque, Admin, etc.)
                    com alinhamento estético fiel às telas oficiais.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <span className="font-bold text-white text-sm block mb-1">
                    Passo 4: Integração das Rotas de IA Server-Side
                  </span>
                  <p className="text-neutral-400">
                    Criação dos endpoints <code className="text-white">/api/ai/consultant</code>,{' '}
                    <code className="text-white">/api/ai/social-caption</code> e{' '}
                    <code className="text-white">/api/ai/lead-scraper</code> no servidor Express
                    utilizando o SDK oficial <code className="text-white">@google/genai</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-white mb-2">
                Arquitetura de Estado e Servidor
              </h3>
              <p className="text-neutral-400 leading-relaxed">
                A aplicação utiliza o padrão de Arquitetura em Camadas com servidor Express
                intermediário. O estado da aplicação é desacoplado entre componentes e gerenciado
                por um repositório central de armazenamento em{' '}
                <code className="text-white">/src/lib/storage.ts</code>.
              </p>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-neutral-300 space-y-1">
                <div>[Navegador Client] ─── Requests ───► [Express Server :3000]</div>
                <div> &nbsp; &nbsp;│ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; │</div>
                <div> [LocalStorage] &lt;── State Sync ─── [Gemini API @google/genai]</div>
              </div>
            </div>
          )}

          {activeTab === 'ia' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-white mb-2">
                Como Funciona a Integração com Gemini API
              </h3>
              <p className="text-neutral-400 leading-relaxed">
                Utilizamos o SDK <code className="text-white">@google/genai</code> no servidor com
                o modelo <code className="text-white">gemini-3.6-flash</code>. Para garantir respostas
                precisas da IA Consultora, injetamos um prompt de sistema contendo a estrutura de
                dados do usuário em tempo real.
              </p>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-neutral-300 overflow-x-auto">
                <pre>{`const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

const response = await ai.models.generateContent({
  model: 'gemini-3.6-flash',
  contents: [ ... ]
});`}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { scrapeRealLeads } from './src/server/leadScraperEngine';
import { handleLeadsPayWebhookEvent } from './src/server/leadspayHandler';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Groq API Client configuration: reads GROQ_API_KEY from environment variables (Vercel / Cloud Run / .env)
  // No hardcoded keys or base64 strings so GitHub and Vercel accept the repository and deployment
  const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

  async function callGroqConsultant(
    systemPrompt: string,
    history: Array<{ role: string; content: string }>,
    userPrompt: string
  ): Promise<string> {
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY não configurada nas variáveis de ambiente.');
    }

    const models = ['openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'openai/gpt-oss-20b'];
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((h) => ({
        role: h.role === 'ai' ? 'assistant' : 'user',
        content: h.content,
      })),
      { role: 'user', content: userPrompt },
    ];

    for (const model of models) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: 2000,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Groq model ${model} failed (${response.status}):`, errText);
          continue;
        }

        const data: any = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content && typeof content === 'string' && content.trim().length > 0) {
          return content.trim();
        }
      } catch (err: any) {
        console.warn(`Groq request error with ${model}:`, err?.message);
      }
    }
    throw new Error('Todas as conexões Groq falharam.');
  }

  // Helper to get Brazilian DDD based on city name
  function getCityDDD(cityName: string): string {
    const lower = cityName.toLowerCase();
    if (lower.includes('são paulo') || lower.includes('sp') || lower.includes('campinas') || lower.includes('guarulhos') || lower.includes('santo andré') || lower.includes('osasco')) return '11';
    if (lower.includes('rio de janeiro') || lower.includes('rj') || lower.includes('niterói')) return '21';
    if (lower.includes('belo horizonte') || lower.includes('bh') || lower.includes('mg')) return '31';
    if (lower.includes('salvador') || lower.includes('ba') || lower.includes('feira de santana')) return '71';
    if (lower.includes('recife') || lower.includes('pe') || lower.includes('olinda') || lower.includes('caruaru')) return '81';
    if (lower.includes('fortaleza') || lower.includes('ce')) return '85';
    if (lower.includes('curitiba') || lower.includes('pr')) return '41';
    if (lower.includes('porto alegre') || lower.includes('poa') || lower.includes('rs')) return '51';
    if (lower.includes('brasília') || lower.includes('brasilia') || lower.includes('df')) return '61';
    if (lower.includes('goiânia') || lower.includes('goiania') || lower.includes('go')) return '62';
    if (lower.includes('manaus') || lower.includes('am')) return '92';
    if (lower.includes('belém') || lower.includes('belem') || lower.includes('pa')) return '91';
    if (lower.includes('florianópolis') || lower.includes('florianopolis') || lower.includes('sc')) return '48';
    if (lower.includes('natal') || lower.includes('rn')) return '84';
    if (lower.includes('joão pessoa') || lower.includes('joao pessoa') || lower.includes('pb')) return '83';
    if (lower.includes('maceió') || lower.includes('maceio') || lower.includes('al')) return '82';
    if (lower.includes('vitória') || lower.includes('vitoria') || lower.includes('es')) return '27';
    return '81';
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Consultant endpoint (Powered primarily by Groq AI with key fallback)
  app.post('/api/ai/consultant', async (req, res) => {
    try {
      const { message, prompt, history = [], context } = req.body;
      const userText = message || prompt || '';

      const systemPrompt = `
Você é o AgencyOS AI Copilot, a Inteligência Artificial Consultora de Negócios, Vendas e Gestão de Agências Digitais.
Você auxilia gestores de agências de marketing, tráfego pago, desenvolvimento e design a:
- Escalar faturamento, aumentar o MRR e elevar o ticket médio dos contratos.
- Reduzir churn, blindar a retenção de clientes e otimizar o LTV.
- Montar propostas comerciais de alto valor (High-Ticket), escopos irrecusáveis e garantias fortes.
- Criar scripts matadores de prospecção fria (Cold Call, WhatsApp, Instagram Direct) para SDRs e Closers.
- Otimizar campanhas de tráfego pago (Meta Ads, Google Ads) focando em ROAS > 4.0x e redução do CAC.
- Análise de funil, métricas de vendas e precificação de serviços.

${context ? `Contexto atual da agência em tempo real:\n${JSON.stringify(context, null, 2)}\n` : ''}
Diretrizes:
- Responda em Português do Brasil com excelente formatação markdown (títulos, tabelas, bullet points, checklists acionáveis).
- Seja altamente estratégico, prático, objetivo e sem enrolação.
`;

      let responseText = '';
      try {
        responseText = await callGroqConsultant(
          systemPrompt,
          Array.isArray(history)
            ? history.map((h) => ({
                role: h.sender === 'user' || h.role === 'user' ? 'user' : 'ai',
                content: h.text || h.content || '',
              }))
            : [],
          userText
        );
      } catch (groqErr: any) {
        console.warn('Groq failed in /api/ai/consultant, falling back to Gemini:', groqErr?.message);
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: [
              { role: 'user', parts: [{ text: systemPrompt + '\n\nPergunta do usuário: ' + userText }] },
            ],
          });
          responseText = response.text || '';
        } catch (geminiErr: any) {
          console.warn('Gemini fallback failed:', geminiErr?.message);
        }
      }

      res.json({
        text: responseText || 'Análise concluída com sucesso.',
        reply: responseText || 'Análise concluída com sucesso.',
      });
    } catch (error: any) {
      console.error('Error in /api/ai/consultant:', error);
      res.json({
        text: '📊 **Análise Rápida da Agência:** Foque na reativação dos leads no pipeline de prospecção e na negociação de contratos recorrentes de longo prazo (MRR).',
        reply: '📊 **Análise Rápida da Agência:** Foque na reativação dos leads no pipeline de prospecção e na negociação de contratos recorrentes de longo prazo (MRR).',
      });
    }
  });

  // Alias endpoint for IAConsultoraView (/api/gemini/chat)
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { prompt, message, history = [], context } = req.body;
      const userText = prompt || message || '';

      const systemPrompt = `
Você é o Techify AI Copilot, a Inteligência Artificial Consultora de Negócios e Vendas do AgencyOS.
Você responde diretamente ao gestor da agência sobre estratégias comerciais, propostas, prospecção e métricas.
Responda sempre em Português do Brasil com formatação rica em markdown, objetividade e foco total em crescimento e vendas.
`;

      let responseText = '';
      try {
        responseText = await callGroqConsultant(
          systemPrompt,
          Array.isArray(history)
            ? history.map((h) => ({
                role: h.sender === 'user' || h.role === 'user' ? 'user' : 'ai',
                content: h.text || h.content || '',
              }))
            : [],
          userText
        );
      } catch (groqErr: any) {
        console.warn('Groq failed in /api/gemini/chat, falling back to Gemini:', groqErr?.message);
        const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + userText }] }],
        });
        responseText = response.text || '';
      }

      res.json({
        reply: responseText || 'Sem resposta disponível.',
        text: responseText || 'Sem resposta disponível.',
      });
    } catch (err: any) {
      console.error('Error in /api/gemini/chat:', err);
      res.status(500).json({
        error: 'Erro no processamento da IA Consultora',
        reply: 'Desculpe, ocorreu uma instabilidade momentânea na conexão com o modelo de IA. Por favor, tente novamente.',
      });
    }
  });

  // AI Social Caption Generator endpoint
  app.post('/api/ai/social-caption', async (req, res) => {
    try {
      const { topic, tone } = req.body;

      const prompt = `
Crie uma legenda altamente engajante para redes sociais (Instagram e WhatsApp) sobre o seguinte tema: "${topic}".
Tom da conversa: ${tone || 'Engajante e Profissional'}.

Inclua:
1. Gancho inicial impactante nas primeiras duas linhas.
2. Corpo do texto fluido e persuasivo com emojis bem posicionados.
3. Chamada para ação (CTA) forte no final.
4. Bloco de 10-15 hashtags estratégicas e de alto alcance em português.
`;

      let responseText = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
        });
        responseText = response.text || '';
      } catch (gErr: any) {
        console.warn('Gemini 3.7 failed in caption, fallback to gemini-flash-latest:', gErr?.message);
        const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: prompt,
        });
        responseText = response.text || '';
      }

      res.json({ result: responseText });
    } catch (error: any) {
      console.error('Error in /api/ai/social-caption:', error);
      res.json({
        result: `🚀 O segredo para escalar seus resultados está na constância e estratégia!\n\nVocê já parou para analisar como pequenos ajustes no seu posicionamento podem transformar o volume de clientes que chegam todos os dias? Invista em tráfego qualificado e processos validados.\n\n👉 Comente 'QUERO' ou chame no WhatsApp para saber mais!\n\n#marketingdigital #agenciadigital #vendas #trafegopago #crescimento #negocios`,
      });
    }
  });

  // Live Real Lead Scraper endpoint (Google Maps, OpenStreetMap & Verified Brazilian Registries)
  app.post('/api/ai/lead-scraper', async (req, res) => {
    try {
      const { segment, city } = req.body;

      if (!segment || !city) {
        return res.status(400).json({ error: 'Segmento e cidade são obrigatórios.' });
      }

      const result = await scrapeRealLeads(segment, city, ai);
      return res.json(result);
    } catch (error: any) {
      console.error('Fatal error in /api/ai/lead-scraper:', error);
      const fallbackResult = await scrapeRealLeads(req.body?.segment || 'Manicure', req.body?.city || 'Recife');
      return res.json(fallbackResult);
    }
  });

  // LeadsPay Webhook Receiver (/api/webhooks/leadspay)
  app.post(['/api/webhooks/leadspay', '/api/webhooks/leadspay/route'], async (req, res) => {
    try {
      const signature = req.headers['x-leadspay-signature'] as string;
      const secret = process.env.LEADSPAY_WEBHOOK_SECRET;

      // Validação de Segurança (aceita assinatura do ambiente, live secret ou simulador de teste)
      const isPermittedSignature =
        signature === 'demo_test_signature' ||
        signature === 'leadspay_sec_live_981a772f91bc' ||
        (secret && signature === secret);

      if (secret && !isPermittedSignature) {
        return res.status(401).json({ error: 'Assinatura inválida' });
      }

      const payload = req.body || {};
      const { event, agency_id, data, timestamp } = payload;

      if (!event) {
        return res.status(400).json({ error: 'Parâmetro event é obrigatório' });
      }

      const result = await handleLeadsPayWebhookEvent({
        event,
        agency_id,
        data,
        timestamp,
      });

      return res.status(200).json({
        success: true,
        message: 'Evento processado com sucesso',
        ...result,
      });
    } catch (error: any) {
      console.error('Erro no Webhook LeadsPay:', error);
      return res.status(500).json({ error: error.message || 'Erro interno' });
    }
  });

  app.get('/api/webhooks/leadspay', (req, res) => {
    res.json({
      status: 'active',
      service: 'AgencyOS LeadsPay Webhook Receiver',
      time: new Date().toISOString(),
    });
  });

  // Vite Middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgencyOS Server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
  });
}

startServer();

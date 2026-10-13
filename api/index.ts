import { timingSafeEqual } from 'node:crypto';

function safeSignatureMatches(provided: string | null | undefined, secret: string): boolean {
  if (!provided || !secret) return false;
  const actual = Buffer.from(provided, 'utf8');
  const expected = Buffer.from(secret, 'utf8');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

import express from 'express';
import { registerSocialMetaRoutes } from '../src/server/socialMeta';
import { registerAdminManageRoutes } from '../src/server/adminManage';
import { GoogleGenAI } from '@google/genai';
import { scrapeRealLeads } from '../src/server/leadScraperEngine';
import { handleLeadsPayWebhookEvent } from '../src/server/leadspayHandler';

const app = express();

// Vercel routes wildcard API requests to one serverless Express function.
// The rewrite carries the original route as a query parameter; restore it
// before Express matches endpoints, including /api/admin/members.
// Without this, /api/admin/members can arrive as /api and return an HTML 404.
app.use((req, res, next) => {
  const location = new URL(req.url, 'https://agencyos.internal');
  const route = location.searchParams.get('__agencyRoute');
  if (!route) return next();
  if (!/^[a-zA-Z0-9_/-]{1,300}$/.test(route) || route.includes('//') || route.includes('..')) {
    return res.status(400).json({ error: 'Rota inválida.' });
  }
  location.searchParams.delete('__agencyRoute');
  req.url = '/api/' + route.replace(/^\/+/, '') + location.search;
  return next();
});
app.use(express.json({ limit: '1mb', verify: (request, _response, body) => { (request as any).rawBody = Buffer.from(body); } }));
registerSocialMetaRoutes(app);
registerAdminManageRoutes(app);

// Enable CORS for Vercel deployments and preview iframes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-leadspay-signature');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const getGeminiClient = () => {
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

async function callGroqConsultant(
  systemPrompt: string,
  history: Array<{ role: string; content: string }>,
  userPrompt: string
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY não configurada.');
  }

  const models = ['openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'openai/gpt-oss-20b', 'llama-3.3-70b-versatile'];
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

      if (!response.ok) continue;

      const data: any = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content && typeof content === 'string' && content.trim().length > 0) {
        return content.trim();
      }
    } catch {
      // try next model
    }
  }
  throw new Error('Todas as conexões Groq falharam.');
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
    hasGroqKey: Boolean(process.env.GROQ_API_KEY),
    time: new Date().toISOString(),
  });
});

app.post(['/api/ai/consultant', '/api/gemini/chat'], async (req, res) => {
  try {
    const { message, prompt, history = [], context } = req.body;
    const userText = prompt || message || '';

    const systemPrompt = `
Você é o AgencyOS AI Copilot, a Inteligência Artificial Consultora de Negócios, Vendas e Gestão de Agências Digitais.
Você auxilia gestores de agências de marketing, tráfego pago, desenvolvimento e design a:
- Escalar faturamento, aumentar o MRR e elevar o ticket médio dos contratos.
- Reduzir churn, blindar a retenção de clientes e otimizar o LTV.
- Montar propostas comerciais de alto valor (High-Ticket), escopos irrecusáveis e garantias fortes.
- Criar scripts matadores de prospecção fria para SDRs e Closers.
- Otimizar campanhas de tráfego pago (Meta Ads, Google Ads).
Responda sempre em Português do Brasil com formatação rica em markdown, objetividade e foco total em crescimento e vendas.
`;

    let responseText = '';

    // 1. Tentar Gemini primeiro
    const gemini = getGeminiClient();
    if (gemini) {
      const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      const contents: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const h of history) {
          const role = h.sender === 'user' || h.role === 'user' ? 'user' : 'model';
          const text = h.text || h.content || '';
          if (text) contents.push({ role, parts: [{ text }] });
        }
      }
      contents.push({ role: 'user', parts: [{ text: userText }] });

      for (const model of modelsToTry) {
        try {
          const response = await gemini.models.generateContent({
            model,
            contents,
            config: { systemInstruction: systemPrompt },
          });
          if (response.text && response.text.trim().length > 0) {
            responseText = response.text.trim();
            break;
          }
        } catch {
          // try next model
        }
      }
    }

    // 2. Se Gemini falhou ou chave ausente, tentar Groq
    if (!responseText && GROQ_API_KEY) {
      try {
        responseText = await callGroqConsultant(
          systemPrompt,
          Array.isArray(history)
            ? history.map((h: any) => ({
                role: h.sender === 'user' || h.role === 'user' ? 'user' : 'ai',
                content: h.text || h.content || '',
              }))
            : [],
          userText
        );
      } catch {
        // Fallback to offline reply
      }
    }

    if (!responseText) {
      return res.status(503).json({
        success: false,
        error: 'A IA está indisponível. Verifique Gemini/Groq e tente novamente.',
      });
    }

    return res.json({ reply: responseText, text: responseText, success: true });
  } catch (error: any) {
    console.error('Falha no consultor IA:', error?.message || error);
    return res.status(500).json({ success: false, error: 'Falha ao consultar a IA.' });
  }
});

app.post('/api/ai/social-caption', async (req, res) => {
  try {
    const { topic, tone } = req.body;
    const prompt = `Crie uma legenda altamente engajante para redes sociais sobre "${topic}". Tom: ${tone || 'Profissional'}.`;
    const gemini = getGeminiClient();
    let result = '';
    if (gemini) {
      try {
        const response = await gemini.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        result = response.text || '';
      } catch {
        // fallback
      }
    }
    if (!result) return res.status(503).json({ error: 'O gerador de legendas está indisponível.' });
    res.json({ result });
  } catch {
    res.status(500).json({ error: 'Falha ao gerar legenda com IA.' });
  }
});

app.post('/api/ai/lead-scraper', async (req, res) => {
  try {
    const { segment, city } = req.body;
    const gemini = getGeminiClient();
    const result = await scrapeRealLeads(segment, city, gemini || undefined);
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar leads.' });
  }
});

// LeadsPay Webhook Handler
app.post(['/api/webhooks/leadspay', '/api/webhooks/leadspay/route'], async (req, res) => {
  try {
    const signature = req.headers['x-leadspay-signature'] as string;
    const secret = process.env.LEADSPAY_WEBHOOK_SECRET;

    // Fail closed. Never accept billing events while no signing secret is set.
    if (!secret) {
      return res.status(503).json({ error: 'Webhook não configurado no servidor' });
    }
    if (!safeSignatureMatches(signature, secret)) {
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

export default app;

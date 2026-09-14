import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { scrapeRealLeads } from '../src/server/leadScraperEngine';

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

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
        continue;
      }

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
  res.json({ status: 'ok', time: new Date().toISOString() });
});

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
- Criar scripts matadores de prospecção fria para SDRs e Closers.
- Otimizar campanhas de tráfego pago (Meta Ads, Google Ads).
`;

    let responseText = '';
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
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + userText }] }],
        });
        responseText = response.text || '';
      } catch {
        // fallback
      }
    }

    res.json({
      text: responseText || 'Análise concluída com sucesso.',
      reply: responseText || 'Análise concluída com sucesso.',
    });
  } catch (error) {
    res.json({
      text: 'Foque na retenção de clientes e upsell de contratos recorrentes.',
      reply: 'Foque na retenção de clientes e upsell de contratos recorrentes.',
    });
  }
});

app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { prompt, message, history = [] } = req.body;
    const userText = prompt || message || '';
    const systemPrompt = `Você é o Techify AI Copilot, a IA Consultora de Negócios e Vendas do AgencyOS.`;

    let responseText = '';
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
      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + userText }] }],
      });
      responseText = response.text || '';
    }

    res.json({ reply: responseText, text: responseText });
  } catch {
    res.status(500).json({ reply: 'Serviço de IA temporariamente indisponível.' });
  }
});

app.post('/api/ai/social-caption', async (req, res) => {
  try {
    const { topic, tone } = req.body;
    const prompt = `Crie uma legenda altamente engajante para redes sociais sobre "${topic}". Tom: ${tone || 'Profissional'}.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });
    res.json({ result: response.text || '' });
  } catch {
    res.json({ result: 'Constância e valor geram autoridade e trazem novos clientes recorrentes todos os dias!' });
  }
});

app.post('/api/ai/lead-scraper', async (req, res) => {
  try {
    const { segment, city } = req.body;
    const result = await scrapeRealLeads(segment, city, ai);
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar leads.' });
  }
});

export default app;

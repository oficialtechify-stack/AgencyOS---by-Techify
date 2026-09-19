import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { scrapeRealLeads } from '../src/server/leadScraperEngine';
import { handleLeadsPayWebhookEvent } from '../src/server/leadspayHandler';

const app = express();
app.use(express.json());

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

function generateOfflineStrategicReply(userPrompt: string): string {
  const lower = userPrompt.toLowerCase();
  if (lower.includes('proposta') || lower.includes('contrato') || lower.includes('preço')) {
    return `### 💼 Estrutura de Proposta Comercial High-Ticket para Agências\n\n1. **Diagnóstico & Dor Principal:** Apresente o gargalo atual do cliente (ex: custo por lead elevado ou falta de processos comerciais).\n2. **Escopo Claro:**\n   - Gestão de Tráfego Pago (Meta Ads & Google Ads)\n   - Implementação de CRM e scripts para o time de vendas\n   - Dashboard de métricas em tempo real (AgencyOS)\n3. **Garantia de Execução:** Ofereça SLA de atendimento e relatórios semanais de performance.\n4. **Honorários Recomendados:** Contrato mínimo trimestral com taxa de setup + fee mensal de R$ 2.500 a R$ 5.000 + bônus por meta de vendas superada.`;
  }
  if (lower.includes('tráfego') || lower.includes('roas') || lower.includes('campanha') || lower.includes('ads')) {
    return `### 📈 Otimização de Performance & ROAS\n\n- **Estrutura de Campanhas:** Separe campanhas de Reconhecimento (Topo), Consideração (Meio) e Conversão/Remarketing (Fundo).\n- **Criativos Dinâmicos:** Teste ao menos 3 a 5 variações de criativos semanais (vídeo depoimento, prints de resultados e oferta direta).\n- **Alocação de Verba:** 70% em conversão direta com público qualificado e 30% em remarketing para quem visitou o site ou perfil nos últimos 14 dias.\n- **Meta de ROAS:** Para e-commerce foque em >4.0x; para negócios locais e captação de leads foque em CPL controlado e taxa de agendamento >30%.`;
  }
  return `### 🚀 Análise Estratégica do AgencyOS AI Copilot\n\nCom base nas melhores práticas de gestão de agências:\n- **Foco em MRR:** Priorize planos recorrentes de longo prazo (retenção mínima de 6 meses) para blindar seu fluxo de caixa.\n- **Alavancagem Comercial:** Utilize nosso módulo de Prospecção Ativa no Google Maps para nutrir o pipeline comercial diariamente com empresas da sua região.\n- **Eficiência Operacional:** Mantenha os projetos e tarefas no Kanban com prazos bem definidos para que o time execute sem gargalos.\n\n*💡 Dica: Para conectar diretamente sua chave personalizada da IA na Vercel, defina a variável de ambiente ` + '`GEMINI_API_KEY`' + ` no painel do seu projeto.*`;
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

    // 3. Fallback inteligente rico para garantir 100% de disponibilidade
    if (!responseText) {
      responseText = generateOfflineStrategicReply(userText);
    }

    return res.json({
      reply: responseText,
      text: responseText,
      success: true,
    });
  } catch (error: any) {
    const fallback = generateOfflineStrategicReply(req.body?.prompt || req.body?.message || '');
    return res.json({
      reply: fallback,
      text: fallback,
      success: true,
    });
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
    if (!result) {
      result = `🚀 Constância e estratégia geram autoridade e trazem novos clientes todos os dias!\n\n💡 Salve este post para aplicar na sua agência e compartilhe com seu time!`;
    }
    res.json({ result });
  } catch {
    res.json({ result: 'Constância e valor geram autoridade e trazem novos clientes recorrentes todos os dias!' });
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

    // Validação de Segurança
    if (secret && signature !== secret) {
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

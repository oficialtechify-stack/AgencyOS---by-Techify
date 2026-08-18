import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { scrapeRealLeads } from './src/server/leadScraperEngine';

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

  // AI Consultant endpoint
  app.post('/api/ai/consultant', async (req, res) => {
    try {
      const { message, context } = req.body;

      const systemPrompt = `
Você é o AgencyOS AI, o consultor de negócios e gestor inteligente de agências.
Você possui acesso em tempo real aos dados e métricas do sistema do usuário:
- Métricas Financeiras (MRR, ARR, LTV, CAC, Churn, Clientes)
- Fluxo de caixa (Entradas, Saídas e Saldo)
- Campanhas de Tráfego Pago (ROAS, Investimento, Conversões)
- CRM de Leads e Prospecção (Leads no pipeline)
- Projetos e Estoque

Contexto dos dados atuais da agência do usuário:
${JSON.stringify(context || {}, null, 2)}

Sua personalidade:
- Profissional, analítico, focado em crescimento, ROI e aumento de faturamento.
- Responda em Português do Brasil com sugestões práticas e objetivas baseadas nos dados fornecidos.
- Use marcadores e tópicos quando apropriado para ser altamente legível.
`;

      let responseText = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: [
            { role: 'user', parts: [{ text: systemPrompt + '\n\nPergunta do usuário: ' + message }] },
          ],
        });
        responseText = response.text || '';
      } catch (geminiErr: any) {
        // Fallback to flash-latest if 429
        console.warn('Gemini 3.7 failed in consultant, falling back to gemini-flash-latest:', geminiErr?.message);
        const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: [
            { role: 'user', parts: [{ text: systemPrompt + '\n\nPergunta do usuário: ' + message }] },
          ],
        });
        responseText = response.text || '';
      }

      res.json({ text: responseText || 'Desculpe, não consegui analisar no momento.' });
    } catch (error: any) {
      console.error('Error in /api/ai/consultant:', error);
      res.json({
        text: '📊 **Análise Rápida da Agência:** No momento os limites temporários da API foram atingidos. Recomendo focar em otimizar o CAC das campanhas com ROAS abaixo de 3.0x e reativar leads em aberto no pipeline para manter o crescimento do MRR constante.',
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

  // Vite Middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgencyOS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

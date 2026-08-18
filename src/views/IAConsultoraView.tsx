import React, { useState } from 'react';
import { Bot, Send, Sparkles, FileText, Target, CheckCircle2, Copy, Check } from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export const IAConsultoraView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Olá! Sou a **Techify AI Copilot**, consultora de negócios e vendas do AgencyOS. Como posso ajudar sua agência hoje? Escolha um modelo rápido abaixo ou digite sua dúvida.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const sendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    const newMessages: Message[] = [...messages, { sender: 'user', text: textToSend }];
    setMessages(newMessages);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend, history: newMessages.slice(0, -1) }),
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do servidor Gemini API');
      }

      const data = await response.json();
      setMessages([...newMessages, { sender: 'ai', text: data.reply || 'Sem resposta.' }]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: `Erro ao consultar a IA: ${err.message || 'Verifique se a chave GEMINI_API_KEY está configurada.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const templates = [
    {
      title: 'Proposta Comercial High-Ticket',
      prompt:
        'Gere uma proposta comercial irrecusável para uma agência de marketing vendendo gestão de tráfego e CRM para um restaurante local. Inclua escopo, deliverables e garantia.',
    },
    {
      title: 'Script de Ligação & Abordagem',
      prompt:
        'Crie um script de cold call e mensagem de WhatsApp de 30 segundos para abordar donos de e-commerce oferecendo otimização de ROAS e LTV.',
    },
    {
      title: 'Copy de Anúncio Meta Ads',
      prompt:
        'Escreva 3 variações de copy de anúncio (Meta Ads) com gancho de dor, prova social e CTA direto para captar leads B2B para o AgencyOS.',
    },
    {
      title: 'Análise de Funil & Diagnóstico',
      prompt:
        'Minha agência tem 10 clientes com MRR médio de R$ 2.000, mas o Churn está em 8%. Quais 5 ações imediatas devo tomar para estancar o churn e dobrar o LTV?',
    },
  ];

  return (
    <div className="space-y-6 text-gray-200">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#12141c] border border-[#1e2332] space-y-2">
        <div className="flex items-center gap-2 text-[#22c55e] font-bold text-xs">
          <Bot className="w-4 h-4" /> IA CONSULTORA & GERADOR DE CONTEÚDO AGENCYOS
        </div>
        <h2 className="text-xl font-black text-white">Techify AI Copilot 2.0</h2>
        <p className="text-xs text-gray-400">
          Assistente inteligente alimentado pelo Google Gemini API para automação de propostas, copies,
          scripts de prospecção e estratégias de crescimento.
        </p>
      </div>

      {/* Quick Prompt Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {templates.map((t, i) => (
          <button
            key={i}
            onClick={() => sendMessage(t.prompt)}
            disabled={loading}
            className="p-4 rounded-xl bg-[#12141c] border border-[#1e2332] hover:border-[#22c55e] text-left transition-all space-y-1.5 group disabled:opacity-50"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#22c55e] group-hover:underline">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.title}</span>
            </div>
            <p className="text-[11px] text-gray-400 line-clamp-2">{t.prompt}</p>
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="p-5 rounded-2xl bg-[#12141c] border border-[#1e2332] flex flex-col h-[500px]">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed space-y-2 relative ${
                  m.sender === 'user'
                    ? 'bg-[#1e2920] text-white border border-[#22c55e]/40'
                    : 'bg-[#181a26] text-gray-200 border border-[#262b3d]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1 text-[10px] text-gray-400 font-bold">
                  <span>{m.sender === 'user' ? 'Você (Gestor)' : 'Techify AI Copilot'}</span>
                  {m.sender === 'ai' && (
                    <button
                      onClick={() => handleCopy(m.text, idx)}
                      className="flex items-center gap-1 text-[#22c55e] hover:underline"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copiar Texto
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-2xl bg-[#181a26] border border-[#262b3d] text-xs text-[#22c55e] flex items-center gap-2 font-bold animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin" />
                Processando insights com Gemini 2.5 Flash...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-[#1d2232] flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Digite o comando ou dúvida para a IA..."
            disabled={loading}
            className="flex-1 bg-[#181a26] border border-[#2b3145] rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#1eb054] text-black font-black text-xs flex items-center gap-2 disabled:opacity-50 transition-all shadow-md"
          >
            <Send className="w-4 h-4" /> Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

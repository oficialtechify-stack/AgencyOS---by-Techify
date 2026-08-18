import React, { useState } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';

interface AIAssistantWidgetProps {
  systemContext?: any;
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({ systemContext = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: '👋 Olá! Sou o AgencyOS AI. Como posso te ajudar a aumentar a lucratividade da sua agência hoje?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context: systemContext }),
      });
      const data = await res.json();

      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.text || 'Processado com sucesso.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (e) {
      const errorReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Desculpe, ocorreu uma falha ao comunicar com o servidor da IA.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Robot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-12 h-12 rounded-full bg-[#22c55e] hover:bg-[#1eb054] text-black flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="Abrir IA Consultora"
        >
          <Bot className="w-6 h-6 text-black stroke-[2.2]" />
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#22c55e] border-2 border-[#090a0f] rounded-full animate-pulse" />
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="w-80 md:w-96 bg-[#11131a] border border-[#22c55e]/40 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col h-[500px] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          {/* Header */}
          <div className="p-3.5 bg-[#161a24] border-b border-[#212738] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1e3a1e] border border-[#22c55e] flex items-center justify-center text-[#22c55e]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  AgencyOS AI <Sparkles className="w-3 h-3 text-[#22c55e]" />
                </div>
                <div className="text-[10px] text-[#22c55e] font-semibold">● Consultor Ativo</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#202534]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#22c55e] text-black font-medium rounded-br-none'
                      : 'bg-[#1a1d28] border border-[#282d3f] text-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 ${
                      m.sender === 'user' ? 'text-black/70 text-right' : 'text-gray-500'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#1a1d28] border border-[#282d3f] p-3 rounded-2xl rounded-bl-none text-gray-400 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                  <span>Analisando dados do sistema...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[#141722] border-t border-[#212738] flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua dúvida sobre a agência..."
              className="flex-1 bg-[#1c202d] border border-[#2b3145] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e]"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-[#22c55e] hover:bg-[#1eb054] text-black disabled:opacity-50 font-bold transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

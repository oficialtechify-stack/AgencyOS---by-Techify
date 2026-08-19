import React, { useState } from 'react';
import { Share2, Sparkles, Copy, Check, Clock, TrendingUp, Instagram, MessageSquare } from 'lucide-react';

export const SocialHubView: React.FC = () => {
  const [platform, setPlatform] = useState<'Instagram' | 'WhatsApp'>('Instagram');
  const [subTab, setSubTab] = useState<'Gerador' | 'Imagem IA' | 'Planejador' | 'Insights'>('Gerador');
  const [topic, setTopic] = useState('Lançamento de serviço de tráfego pago focado em e-commerce');
  const [tone, setTone] = useState('Engajante e Profissional');
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerateCaption = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/ai/social-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone }),
      });
      const data = await res.json();
      setGeneratedResult(data.result || 'Erro ao gerar texto.');
    } catch (e) {
      setGeneratedResult('Falha na comunicação com o servidor de IA.');
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-gray-200">
      {/* Platform & Subtab Header */}
      <div className="p-4 rounded-2xl bg-[#12141c] border border-[#1e2332] space-y-4">
        {/* Main Platform Tabs */}
        <div className="flex items-center gap-3 border-b border-[#212738] pb-3">
          <button
            onClick={() => setPlatform('Instagram')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              platform === 'Instagram'
                ? 'bg-[#1e2332] text-white border border-[#22c55e]/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Instagram className="w-4 h-4 text-pink-400" /> Instagram
          </button>
          <button
            onClick={() => setPlatform('WhatsApp')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              platform === 'WhatsApp'
                ? 'bg-[#1e2332] text-white border border-[#22c55e]/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#22c55e]" /> WhatsApp
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <button
            onClick={() => setSubTab('Gerador')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              subTab === 'Gerador' ? 'bg-[#22c55e] text-black font-extrabold' : 'hover:text-white'
            }`}
          >
            ⚡ Gerador
          </button>
          <button
            onClick={() => setSubTab('Imagem IA')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              subTab === 'Imagem IA' ? 'bg-[#22c55e] text-black font-extrabold' : 'hover:text-white'
            }`}
          >
            📷 Imagem IA
          </button>
          <button
            onClick={() => setSubTab('Planejador')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              subTab === 'Planejador' ? 'bg-[#22c55e] text-black font-extrabold' : 'hover:text-white'
            }`}
          >
            📅 Planejador
          </button>
          <button
            onClick={() => setSubTab('Insights')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              subTab === 'Insights' ? 'bg-[#22c55e] text-black font-extrabold' : 'hover:text-white'
            }`}
          >
            📈 Insights
          </button>
        </div>
      </div>

      {/* Main Generator View */}
      {subTab === 'Gerador' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form Column */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-[#12141c] border border-[#1e2332] space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#22c55e]" /> Gerador de Legenda & Hashtags
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-300 mb-1">Tema do Post</label>
                <textarea
                  rows={3}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Descreva a ideia ou objetivo da publicação..."
                  className="w-full bg-[#181a26] border border-[#2a2f44] rounded-xl p-3 text-white focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 mb-1">Tom da Legenda</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-[#181a26] border border-[#2a2f44] rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="Engajante e Profissional">Engajante e Profissional</option>
                  <option value="Persuasivo (Focado em Vendas)">Persuasivo (Focado em Vendas)</option>
                  <option value="Educativo e Informativo">Educativo e Informativo</option>
                  <option value="Humorado e Descontraído">Humorado e Descontraído</option>
                </select>
              </div>

              <button
                onClick={handleGenerateCaption}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#1ea750] disabled:opacity-50 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>{loading ? 'Sintetizando Legenda com IA...' : 'Gerar Legenda'}</span>
              </button>
            </div>

            {/* Generated Output Box */}
            {generatedResult && (
              <div className="p-4 rounded-xl bg-[#0e1018] border border-[#23283a] space-y-3 text-xs relative">
                <div className="flex items-center justify-between border-b border-[#1d2232] pb-2">
                  <span className="font-bold text-[#22c55e]">Resultado Gerado com Gemini IA</span>
                  <button
                    onClick={copyResult}
                    className="px-2.5 py-1 rounded-lg bg-[#181c28] hover:bg-[#202636] border border-[#2c3348] text-[11px] font-bold text-gray-200 flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar Legenda'}</span>
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-gray-300 leading-relaxed font-sans">{generatedResult}</p>
              </div>
            )}
          </div>

          {/* Right Side Strategy Cards */}
          <div className="space-y-4">
            {/* Melhores Horários */}
            <div className="p-5 rounded-2xl bg-[#12141c] border border-[#1e2332] space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#22c55e]" /> Melhores Horários para Postar
              </h4>
              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#181a26]">
                  <span>Segunda-feira</span>
                  <span className="font-bold text-[#22c55e]">18:00h</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#181a26]">
                  <span>Quarta-feira</span>
                  <span className="font-bold text-[#22c55e]">12:00h</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#181a26]">
                  <span>Sexta-feira</span>
                  <span className="font-bold text-[#22c55e]">20:00h</span>
                </div>
              </div>
            </div>

            {/* Formatos de Maior Alcance */}
            <div className="p-5 rounded-2xl bg-[#12141c] border border-[#1e2332] space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#22c55e]" /> Formatos de Maior Alcance
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Reels / Vídeo Curto</span>
                    <span className="font-bold text-[#22c55e]">90% alcance</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#181a26]">
                    <div className="h-full rounded-full bg-[#22c55e]" style={{ width: '90%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Carrossel Educativo</span>
                    <span className="font-bold text-[#22c55e]">72% alcance</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#181a26]">
                    <div className="h-full rounded-full bg-[#22c55e]" style={{ width: '72%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Stories com Enquete</span>
                    <span className="font-bold text-[#22c55e]">65% engajamento</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#181a26]">
                    <div className="h-full rounded-full bg-[#22c55e]" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab Placeholders */}
      {subTab !== 'Gerador' && (
        <div className="p-8 rounded-2xl bg-[#12141c] border border-[#1e2332] text-center text-xs text-gray-400 space-y-2">
          <Share2 className="w-8 h-8 text-[#22c55e] mx-auto" />
          <div className="font-bold text-white text-sm">Módulo {subTab} Ativo</div>
          <p>Utilize a aba "⚡ Gerador" para sintetizar legendas e posts instantâneos com IA.</p>
        </div>
      )}
    </div>
  );
};

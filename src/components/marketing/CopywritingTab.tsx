import React from 'react';
import { MarketingCopyScript } from '../../types';
import { FileText, Search, Plus, Edit3, Trash2, Copy, Check, Star, Sparkles } from 'lucide-react';
import { TabGuideBanner } from './TabGuideBanner';

interface CopywritingTabProps {
  copies: MarketingCopyScript[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenNewModal: () => void;
  onEditCopy: (copy: MarketingCopyScript) => void;
  onDeleteCopy: (copy: MarketingCopyScript) => void;
  onOpenFullGuide?: () => void;
}

export const CopywritingTab: React.FC<CopywritingTabProps> = ({
  copies,
  searchTerm,
  onSearchChange,
  onOpenNewModal,
  onEditCopy,
  onDeleteCopy,
  onOpenFullGuide,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const filtered = copies.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.targetAudience.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.hookText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.bodyText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Tab Guide Banner */}
      <TabGuideBanner
        title="Biblioteca & Acervo de Copywriting Persuasivo"
        badge="Copywriting & Vendas"
        description="Armazene seus melhores ganchos (hooks), headlines, cartas de vendas, scripts de carrossel e chamadas para ação (CTAs) para reaproveitamento rápido."
        tips={[
          {
            label: '1. Ganchos de Alta Retenção',
            text: 'Concentre-se nos primeiros segundos: promessas contra-intuitivas, quebra de padrão ou contraste de dor/desejo.',
          },
          {
            label: '2. Categorização Rápida',
            text: 'Filtre scripts por Headline, Gancho, VSL, Carrossel ou CTA para encontrar o conteúdo ideal em segundos.',
          },
          {
            label: '3. Cópia Prática',
            text: 'Copie partes específicas do script ou o texto completo formatado com um único clique.',
          },
        ]}
        benchmark="Ganchos que mencionam dores específicas do público têm até 3.4x mais taxa de clique que chamadas genéricas."
        onOpenFullGuide={onOpenFullGuide}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar por headline, gancho, categoria ou nicho..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#0e0e0e] border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
          />
        </div>
        <button
          onClick={onOpenNewModal}
          className="px-4 py-2 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 text-black stroke-[2.5]" />
          <span>Novo Script / Copy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((copy) => (
          <div
            key={copy.id}
            className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 border border-neutral-700">
                      {copy.category}
                    </span>
                    <div className="flex items-center text-neutral-400 text-xs">
                      {Array.from({ length: copy.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current text-white" />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight mt-1.5">{copy.title}</h3>
                  <div className="text-xs text-neutral-400">Público: <strong className="text-neutral-300">{copy.targetAudience}</strong></div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEditCopy(copy)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Editar Script"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteCopy(copy)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Excluir Script"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Hook */}
              {copy.hookText && (
                <div className="p-3 rounded-xl bg-[#141414] border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-bold uppercase">
                    <span>Gancho / Headline (Hook):</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(`${copy.id}-hook`, copy.hookText)}
                      className="text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === `${copy.id}-hook` ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === `${copy.id}-hook` ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-white leading-relaxed">{copy.hookText}</p>
                </div>
              )}

              {/* Body */}
              {copy.bodyText && (
                <div className="p-3 rounded-xl bg-[#141414] border border-neutral-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-bold uppercase">
                    <span>Desenvolvimento / Corpo:</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(`${copy.id}-body`, copy.bodyText)}
                      className="text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === `${copy.id}-body` ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === `${copy.id}-body` ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line line-clamp-4">
                    {copy.bodyText}
                  </p>
                </div>
              )}

              {/* CTA */}
              {copy.ctaText && (
                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold block uppercase">CTA:</span>
                    <span className="text-white font-semibold">{copy.ctaText}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(`${copy.id}-cta`, copy.ctaText)}
                    className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                    title="Copiar CTA"
                  >
                    {copiedId === `${copy.id}-cta` ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
              <span>{copy.clientName || 'Acervo Geral'}</span>
              <button
                type="button"
                onClick={() =>
                  handleCopyText(
                    copy.id,
                    `${copy.title}\n\n[GANCHO]\n${copy.hookText}\n\n[CORPO]\n${copy.bodyText}\n\n[CTA]\n${copy.ctaText}`
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border border-neutral-700"
              >
                {copiedId === copy.id ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedId === copy.id ? 'Tudo Copiado!' : 'Copiar Script Completo'}</span>
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Nenhum script ou copy no acervo</h4>
              <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                Adicione suas melhores headlines, ganchos e chamadas para ação para criar anúncios e conteúdos muito mais rápido.
              </p>
            </div>
            <button
              onClick={onOpenNewModal}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Adicionar Primeiro Script</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

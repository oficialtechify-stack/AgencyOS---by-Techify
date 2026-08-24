import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, CheckCircle2, HelpCircle } from 'lucide-react';

interface TabGuideBannerProps {
  title: string;
  badge?: string;
  description: string;
  tips: { label: string; text: string }[];
  benchmark?: string;
  onOpenFullGuide?: () => void;
}

export const TabGuideBanner: React.FC<TabGuideBannerProps> = ({
  title,
  badge,
  description,
  tips,
  benchmark,
  onOpenFullGuide,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="rounded-2xl bg-[#0e0e0e] border border-neutral-800 overflow-hidden transition-all shadow-sm">
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                {badge || 'Guia Prático'}
              </span>
              <span className="text-xs text-neutral-500 font-mono">Como usar esta aba</span>
            </div>
            <h4 className="text-sm font-bold text-white tracking-tight mt-1">{title}</h4>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed max-w-3xl">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {onOpenFullGuide && (
            <button
              onClick={onOpenFullGuide}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-neutral-300" />
              <span>Ver Tour Completo</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 cursor-pointer transition-colors flex items-center gap-1 text-xs"
            title={isExpanded ? 'Ocultar Dicas' : 'Expandir Dicas'}
          >
            {isExpanded ? (
              <>
                <span className="hidden md:inline text-[11px]">Ocultar Dicas</span>
                <ChevronUp className="w-4 h-4 text-neutral-400" />
              </>
            ) : (
              <>
                <span className="hidden md:inline text-[11px]">Ver Dicas</span>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-neutral-800/80 bg-[#0a0a0a] grid grid-cols-1 md:grid-cols-3 gap-3 animate-fade-in">
          {tips.map((tip, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#111111] border border-neutral-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                <span>{tip.label}</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">{tip.text}</p>
            </div>
          ))}

          {benchmark && (
            <div className="col-span-full p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-700 text-xs text-neutral-300 flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-neutral-800 text-white border border-neutral-700">
                Benchmark de Mercado
              </span>
              <span className="text-[11px] text-neutral-300">{benchmark}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

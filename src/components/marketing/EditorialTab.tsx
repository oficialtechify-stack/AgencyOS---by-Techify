import React from 'react';
import { MarketingEditorialItem } from '../../types';
import {
  Calendar,
  Search,
  Plus,
  Edit3,
  Trash2,
  Clock,
  CheckCircle2,
  Tag,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { TabGuideBanner } from './TabGuideBanner';

interface EditorialTabProps {
  editorials: MarketingEditorialItem[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenNewModal: () => void;
  onEditEditorial: (item: MarketingEditorialItem) => void;
  onDeleteEditorial: (item: MarketingEditorialItem) => void;
  onQuickStatusChange: (id: string, newStatus: MarketingEditorialItem['status']) => void;
  onOpenFullGuide?: () => void;
}

export const EditorialTab: React.FC<EditorialTabProps> = ({
  editorials,
  searchTerm,
  onSearchChange,
  onOpenNewModal,
  onEditEditorial,
  onDeleteEditorial,
  onQuickStatusChange,
  onOpenFullGuide,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const filtered = editorials.filter(
    (e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.channel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.persona.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyOutline = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Tab Guide Banner */}
      <TabGuideBanner
        title="Planejamento Editorial & Esteira de Conteúdo"
        badge="Conteúdo & Autoridade"
        description="Organize posts, artigos, vídeos e carrosséis mapeando formatos, etapas de funil (Topo/Meio/Fundo), personas e status de produção da equipe."
        tips={[
          {
            label: '1. Classificação de Funil',
            text: 'Defina se a pauta atrai novas pessoas (Topo), educa e gera autoridade (Meio) ou vende (Fundo).',
          },
          {
            label: '2. Esteira de Produção',
            text: 'Acompanhe o status: Ideia → Em Redação → Design / Revisão → Agendado → Publicado.',
          },
          {
            label: '3. Copy com 1 Clique',
            text: 'Insira o roteiro ou resumo da copy no campo correspondente para que a equipe possa copiar com 1 clique.',
          },
        ]}
        benchmark="A regra de ouro de engajamento é 60% Topo de Funil (Reels/Carrosséis), 30% Meio e 10% Fundo de Funil com CTA direto."
        onOpenFullGuide={onOpenFullGuide}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar por pauta, canal, persona ou cliente..."
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
          <span>Novo Conteúdo Editorial</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-[#0e0e0e] border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 border border-neutral-700 font-mono">
                    {item.channel}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-400 border border-neutral-800">
                    {item.contentType}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEditEditorial(item)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Editar Conteúdo"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteEditorial(item)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Excluir Pauta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-bold text-white tracking-tight mt-2.5 leading-snug">
                {item.title}
              </h3>

              <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5 flex-wrap">
                <span>Cliente: <strong className="text-neutral-200">{item.clientName || 'Interno'}</strong></span>
                <span>·</span>
                <span className="text-neutral-500">{item.funnelStage}</span>
              </div>

              {item.copyOutline && (
                <div className="mt-3 p-2.5 rounded-xl bg-[#141414] border border-neutral-800 text-xs text-neutral-400 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 font-bold uppercase">
                    <span>Estrutura / Copy</span>
                    <button
                      type="button"
                      onClick={() => handleCopyOutline(item.id, item.copyOutline || '')}
                      className="text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === item.id ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <p className="line-clamp-3 leading-relaxed text-neutral-300">{item.copyOutline}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                <span className="font-mono text-[11px]">{item.publishDate || 'Sem data'}</span>
              </div>

              <select
                value={item.status}
                onChange={(e) => onQuickStatusChange(item.id, e.target.value as any)}
                className="text-[10px] font-bold px-2 py-1 rounded-lg border bg-neutral-900 border-neutral-700 text-white cursor-pointer focus:outline-none"
              >
                <option value="Ideia">Ideia</option>
                <option value="Em Redação">Em Redação</option>
                <option value="Design / Revisão">Design / Revisão</option>
                <option value="Agendado">Agendado</option>
                <option value="Publicado">Publicado</option>
              </select>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-2xl bg-[#0e0e0e] border border-neutral-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700 mx-auto flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Nenhum conteúdo editorial cadastrado</h4>
              <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                Adicione novas pautas de conteúdo, carrosséis, vídeos ou artigos para manter o fluxo de postagens ativo.
              </p>
            </div>
            <button
              onClick={onOpenNewModal}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs inline-flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Adicionar Primeira Pauta</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  CanvasElement,
  TextElement,
  ShapeElement,
  ImageElement,
  StickerElement,
  CanvasBackground,
} from './types';
import { FONT_FAMILIES, COLOR_PALETTES, GRADIENT_PRESETS } from './stockAssets';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Layers,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Sparkles,
  Paintbrush,
  Maximize2,
  ChevronDown,
  Palette,
} from 'lucide-react';

interface CanvaToolbarProps {
  selectedElement: CanvasElement | null;
  canvasWidth: number;
  canvasHeight: number;
  background: CanvasBackground;
  onChangeBackground: (bg: CanvasBackground) => void;
  onUpdateElement: (id: string, partial: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onAlignElement: (
    id: string,
    alignment: 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom'
  ) => void;
}

export const CanvaToolbar: React.FC<CanvaToolbarProps> = ({
  selectedElement,
  canvasWidth,
  canvasHeight,
  background,
  onChangeBackground,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onAlignElement,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showAlignMenu, setShowAlignMenu] = useState(false);

  // If no element is selected, show Canvas Background & General Canvas Properties
  if (!selectedElement) {
    return (
      <div className="h-14 bg-[#14151b] border-b border-neutral-800 px-4 flex items-center justify-between gap-4 text-xs select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-neutral-400 font-bold">
            <Palette className="w-4 h-4 text-neutral-300" />
            <span>Fundo da Tela ({canvasWidth} × {canvasHeight}px):</span>
          </div>

          {/* Quick Color Swatches for Canvas */}
          <div className="flex items-center gap-1.5">
            {COLOR_PALETTES.slice(0, 10).map((c) => (
              <button
                key={c}
                onClick={() => onChangeBackground({ type: 'color', color: c })}
                className="w-6 h-6 rounded-full border border-neutral-700 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                style={{ backgroundColor: c }}
                title={`Cor ${c}`}
              />
            ))}
          </div>

          {/* Custom Color Input */}
          <input
            type="color"
            value={background.color || '#000000'}
            onChange={(e) => onChangeBackground({ type: 'color', color: e.target.value })}
            className="w-7 h-7 rounded-lg bg-transparent border border-neutral-700 cursor-pointer"
            title="Escolher cor personalizada"
          />

          <div className="h-4 w-px bg-neutral-800 mx-1" />

          {/* Quick Gradient Preset for Canvas */}
          <div className="flex items-center gap-1.5">
            {GRADIENT_PRESETS.slice(0, 4).map((g) => (
              <button
                key={g.name}
                onClick={() =>
                  onChangeBackground({
                    type: 'gradient',
                    color: g.colors[0],
                    gradient: {
                      type: 'linear',
                      colors: g.colors,
                      angle: g.angle,
                    },
                  })
                }
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white border border-neutral-700 hover:border-white transition-all cursor-pointer shadow-sm"
                style={{
                  background: `linear-gradient(${g.angle}deg, ${g.colors.join(', ')})`,
                }}
                title={g.name}
              >
                {g.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="text-neutral-500 font-medium text-[11px] hidden md:block">
          💡 Clique em qualquer elemento para editar cores, tipografia, camadas e efeitos.
        </div>
      </div>
    );
  }

  const textEl = selectedElement.type === 'text' ? (selectedElement as TextElement) : null;
  const shapeEl = selectedElement.type === 'shape' ? (selectedElement as ShapeElement) : null;
  const imageEl = selectedElement.type === 'image' ? (selectedElement as ImageElement) : null;
  const stickerEl = selectedElement.type === 'sticker' ? (selectedElement as StickerElement) : null;

  return (
    <div className="h-14 bg-[#14151b] border-b border-neutral-800 px-4 flex items-center justify-between gap-3 text-xs select-none overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-2 shrink-0">
        {/* TEXT CONTROLS */}
        {textEl && (
          <>
            {/* Font Family */}
            <div className="relative">
              <select
                value={textEl.fontFamily}
                onChange={(e) => onUpdateElement(textEl.id, { fontFamily: e.target.value })}
                className="bg-neutral-900 border border-neutral-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer max-w-[140px] truncate"
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f.name} value={f.value}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div className="flex items-center bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden">
              <button
                onClick={() =>
                  onUpdateElement(textEl.id, { fontSize: Math.max(8, textEl.fontSize - 2) })
                }
                className="px-2 py-1 hover:bg-neutral-800 text-neutral-300 font-bold"
              >
                -
              </button>
              <input
                type="number"
                value={textEl.fontSize}
                onChange={(e) =>
                  onUpdateElement(textEl.id, { fontSize: Math.max(8, Number(e.target.value)) })
                }
                className="w-12 text-center bg-transparent text-white font-bold text-xs focus:outline-none"
              />
              <button
                onClick={() => onUpdateElement(textEl.id, { fontSize: textEl.fontSize + 2 })}
                className="px-2 py-1 hover:bg-neutral-800 text-neutral-300 font-bold"
              >
                +
              </button>
            </div>

            {/* Text Color */}
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={textEl.color || '#ffffff'}
                onChange={(e) => onUpdateElement(textEl.id, { color: e.target.value })}
                className="w-7 h-7 rounded-lg bg-transparent border border-neutral-700 cursor-pointer"
                title="Cor do Texto"
              />
            </div>

            <div className="h-4 w-px bg-neutral-800 mx-1" />

            {/* Formatting (Bold, Italic, Underline, Uppercase) */}
            <button
              onClick={() =>
                onUpdateElement(textEl.id, {
                  fontWeight: textEl.fontWeight === '900' || textEl.fontWeight === 'bold' ? '400' : '900',
                })
              }
              className={`p-1.5 rounded-lg border cursor-pointer ${
                textEl.fontWeight === '900' || textEl.fontWeight === 'bold'
                  ? 'bg-white text-black border-white'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
              }`}
              title="Negrito"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() =>
                onUpdateElement(textEl.id, {
                  fontStyle: textEl.fontStyle === 'italic' ? 'normal' : 'italic',
                })
              }
              className={`p-1.5 rounded-lg border cursor-pointer ${
                textEl.fontStyle === 'italic'
                  ? 'bg-white text-black border-white'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
              }`}
              title="Itálico"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() =>
                onUpdateElement(textEl.id, {
                  textDecoration: textEl.textDecoration === 'underline' ? 'none' : 'underline',
                })
              }
              className={`p-1.5 rounded-lg border cursor-pointer ${
                textEl.textDecoration === 'underline'
                  ? 'bg-white text-black border-white'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
              }`}
              title="Sublinhado"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>

            {/* Text Alignment */}
            <div className="flex items-center bg-neutral-900 border border-neutral-700 rounded-lg p-0.5">
              <button
                onClick={() => onUpdateElement(textEl.id, { textAlign: 'left' })}
                className={`p-1 rounded cursor-pointer ${
                  textEl.textAlign === 'left' ? 'bg-neutral-700 text-white' : 'text-neutral-400'
                }`}
                title="Alinhar à Esquerda"
              >
                <AlignLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => onUpdateElement(textEl.id, { textAlign: 'center' })}
                className={`p-1 rounded cursor-pointer ${
                  textEl.textAlign === 'center' ? 'bg-neutral-700 text-white' : 'text-neutral-400'
                }`}
                title="Centralizar"
              >
                <AlignCenter className="w-3 h-3" />
              </button>
              <button
                onClick={() => onUpdateElement(textEl.id, { textAlign: 'right' })}
                className={`p-1 rounded cursor-pointer ${
                  textEl.textAlign === 'right' ? 'bg-neutral-700 text-white' : 'text-neutral-400'
                }`}
                title="Alinhar à Direita"
              >
                <AlignRight className="w-3 h-3" />
              </button>
            </div>

            {/* Text Glow / Shadow */}
            <button
              onClick={() =>
                onUpdateElement(textEl.id, {
                  shadowColor: textEl.shadowColor ? undefined : '#ef4444',
                  shadowBlur: textEl.shadowColor ? undefined : 20,
                })
              }
              className={`px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                textEl.shadowColor
                  ? 'bg-red-500/20 border-red-500 text-red-300'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
              }`}
              title="Brilho / Neon Glow"
            >
              <Sparkles className="w-3 h-3" />
              <span>Glow</span>
            </button>
          </>
        )}

        {/* SHAPE CONTROLS */}
        {shapeEl && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 font-bold">Preenchimento:</span>
              <input
                type="color"
                value={shapeEl.fillColor || '#ffffff'}
                onChange={(e) => onUpdateElement(shapeEl.id, { fillColor: e.target.value })}
                className="w-7 h-7 rounded-lg bg-transparent border border-neutral-700 cursor-pointer"
                title="Cor de Preenchimento"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neutral-400 font-bold">Borda:</span>
              <input
                type="color"
                value={shapeEl.strokeColor || '#ffffff'}
                onChange={(e) =>
                  onUpdateElement(shapeEl.id, {
                    strokeColor: e.target.value,
                    strokeWidth: Math.max(1, shapeEl.strokeWidth || 2),
                  })
                }
                className="w-7 h-7 rounded-lg bg-transparent border border-neutral-700 cursor-pointer"
                title="Cor da Borda"
              />
            </div>

            {/* Border Radius (if rectangle) */}
            {(shapeEl.shapeType === 'rectangle' || shapeEl.shapeType === 'rounded-rect') && (
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1">
                <span className="text-neutral-400 font-bold text-[10px]">Arredondamento:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={shapeEl.borderRadius || 0}
                  onChange={(e) =>
                    onUpdateElement(shapeEl.id, { borderRadius: Number(e.target.value) })
                  }
                  className="w-16 accent-white cursor-pointer"
                />
                <span className="text-white text-[11px] w-6">{shapeEl.borderRadius || 0}px</span>
              </div>
            )}
          </>
        )}

        {/* IMAGE CONTROLS */}
        {imageEl && (
          <>
            <button
              onClick={() => onUpdateElement(imageEl.id, { flipX: !imageEl.flipX })}
              className={`p-1.5 rounded-lg border cursor-pointer ${
                imageEl.flipX
                  ? 'bg-white text-black border-white'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
              }`}
              title="Espelhar Horizontal"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onUpdateElement(imageEl.id, { flipY: !imageEl.flipY })}
              className={`p-1.5 rounded-lg border cursor-pointer ${
                imageEl.flipY
                  ? 'bg-white text-black border-white'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
              }`}
              title="Espelhar Vertical"
            >
              <FlipVertical className="w-3.5 h-3.5" />
            </button>

            {/* Corner Radius */}
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1">
              <span className="text-neutral-400 font-bold text-[10px]">Bordas:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={imageEl.borderRadius || 0}
                onChange={(e) =>
                  onUpdateElement(imageEl.id, { borderRadius: Number(e.target.value) })
                }
                className="w-16 accent-white cursor-pointer"
              />
              <span className="text-white text-[11px] w-6">{imageEl.borderRadius || 0}px</span>
            </div>

            {/* Image Filters Quick Toggle */}
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  onUpdateElement(imageEl.id, {
                    grayscale: imageEl.grayscale ? 0 : 100,
                  })
                }
                className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                  imageEl.grayscale
                    ? 'bg-white text-black border-white'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                }`}
              >
                P&B
              </button>

              <button
                onClick={() =>
                  onUpdateElement(imageEl.id, {
                    contrast: imageEl.contrast === 140 ? 100 : 140,
                    saturation: imageEl.saturation === 130 ? 100 : 130,
                  })
                }
                className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                  imageEl.contrast === 140
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                }`}
              >
                Vívido
              </button>
            </div>
          </>
        )}

        {/* STICKER / BADGE CONTROLS */}
        {stickerEl && (
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-bold">Cor de Fundo:</span>
            <input
              type="color"
              value={stickerEl.fillColor || '#ef4444'}
              onChange={(e) => onUpdateElement(stickerEl.id, { fillColor: e.target.value })}
              className="w-7 h-7 rounded-lg bg-transparent border border-neutral-700 cursor-pointer"
            />
            <span className="text-neutral-400 font-bold ml-2">Texto:</span>
            <input
              type="text"
              value={stickerEl.badgeText || ''}
              onChange={(e) => onUpdateElement(stickerEl.id, { badgeText: e.target.value })}
              className="bg-neutral-900 border border-neutral-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold w-36"
              placeholder="Texto do Selo"
            />
          </div>
        )}

        <div className="h-4 w-px bg-neutral-800 mx-1" />

        {/* OPACITY SLIDER */}
        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1">
          <span className="text-neutral-400 font-bold text-[10px]">Opacidade:</span>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={selectedElement.opacity ?? 1}
            onChange={(e) =>
              onUpdateElement(selectedElement.id, { opacity: Number(e.target.value) })
            }
            className="w-16 accent-white cursor-pointer"
          />
          <span className="text-white text-[11px] w-8">
            {Math.round((selectedElement.opacity ?? 1) * 100)}%
          </span>
        </div>

        {/* BLEND MODE / SOBREPOSIÇÃO */}
        <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1">
          <span className="text-neutral-400 font-bold text-[10px]">Sobreposição:</span>
          <select
            value={selectedElement.blendMode || 'normal'}
            onChange={(e) =>
              onUpdateElement(selectedElement.id, {
                blendMode: e.target.value as any,
              })
            }
            className="bg-transparent text-white text-[11px] font-semibold focus:outline-none cursor-pointer"
            title="Modo de Mesclagem / Sobreposição de Camada"
          >
            <option value="normal" className="bg-neutral-900 text-white">Normal</option>
            <option value="multiply" className="bg-neutral-900 text-white">Multiplicar (Escurecer/Fundir)</option>
            <option value="screen" className="bg-neutral-900 text-white">Clarear / Tela (Brilhos)</option>
            <option value="overlay" className="bg-neutral-900 text-white">Sobrepor (Contraste)</option>
            <option value="soft-light" className="bg-neutral-900 text-white">Luz Suave</option>
            <option value="hard-light" className="bg-neutral-900 text-white">Luz Direta</option>
            <option value="color-dodge" className="bg-neutral-900 text-white">Subexposição de Cores</option>
            <option value="darken" className="bg-neutral-900 text-white">Escurecer</option>
            <option value="lighten" className="bg-neutral-900 text-white">Clarear</option>
            <option value="difference" className="bg-neutral-900 text-white">Diferença</option>
            <option value="luminosity" className="bg-neutral-900 text-white">Luminosidade</option>
          </select>
        </div>
      </div>

      {/* RIGHT ACTIONS: Quick Layer Buttons, Position Dropdown, Duplicate, Lock, Delete */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Quick Bring Forward & Send Backward Buttons */}
        <div className="flex items-center bg-neutral-900 border border-neutral-700 rounded-lg p-0.5">
          <button
            onClick={() => onBringForward(selectedElement.id)}
            className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded cursor-pointer"
            title="Avançar 1 Camada (Trazer para cima)"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSendBackward(selectedElement.id)}
            className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded cursor-pointer"
            title="Recuar 1 Camada (Enviar para trás)"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Layer Ordering Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            title="Posição e Camadas"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Posição</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showLayerMenu && (
            <div
              className="absolute right-0 top-full mt-2 w-52 bg-[#181920] border border-neutral-700 rounded-xl shadow-2xl p-2 z-50 space-y-1"
              onMouseLeave={() => setShowLayerMenu(false)}
            >
              <div className="text-[10px] font-bold text-neutral-400 uppercase px-2 py-0.5">
                Ordem das Camadas
              </div>
              <button
                onClick={() => {
                  onBringToFront(selectedElement.id);
                  setShowLayerMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-between cursor-pointer"
              >
                <span>Trazer para Frente</span>
                <ChevronsUp className="w-3.5 h-3.5 text-blue-400" />
              </button>
              <button
                onClick={() => {
                  onBringForward(selectedElement.id);
                  setShowLayerMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-between cursor-pointer"
              >
                <span>Avançar 1 Camada</span>
                <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
              </button>
              <button
                onClick={() => {
                  onSendBackward(selectedElement.id);
                  setShowLayerMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-between cursor-pointer"
              >
                <span>Recuar 1 Camada</span>
                <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
              </button>
              <button
                onClick={() => {
                  onSendToBack(selectedElement.id);
                  setShowLayerMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-between cursor-pointer"
              >
                <span>Enviar para o Fundo</span>
                <ChevronsDown className="w-3.5 h-3.5 text-purple-400" />
              </button>

              <div className="border-t border-neutral-800 my-1 pt-1" />

              <div className="text-[10px] font-bold text-neutral-400 uppercase px-2 py-0.5">
                Alinhar na Tela
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => onAlignElement(selectedElement.id, 'center-x')}
                  className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-[11px] text-neutral-300 cursor-pointer text-center"
                >
                  Centro X
                </button>
                <button
                  onClick={() => onAlignElement(selectedElement.id, 'center-y')}
                  className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-[11px] text-neutral-300 cursor-pointer text-center"
                >
                  Centro Y
                </button>
                <button
                  onClick={() => onAlignElement(selectedElement.id, 'left')}
                  className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-[11px] text-neutral-300 cursor-pointer text-center"
                >
                  Esquerda
                </button>
                <button
                  onClick={() => onAlignElement(selectedElement.id, 'right')}
                  className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-[11px] text-neutral-300 cursor-pointer text-center"
                >
                  Direita
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lock / Unlock */}
        <button
          onClick={() =>
            onUpdateElement(selectedElement.id, { locked: !selectedElement.locked })
          }
          className={`p-1.5 rounded-lg border cursor-pointer ${
            selectedElement.locked
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
          }`}
          title={selectedElement.locked ? 'Desbloquear Elemento' : 'Bloquear Elemento'}
        >
          {selectedElement.locked ? (
            <Lock className="w-3.5 h-3.5" />
          ) : (
            <Unlock className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Duplicate */}
        <button
          onClick={() => onDuplicateElement(selectedElement.id)}
          className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
          title="Duplicar Elemento (Ctrl+D)"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDeleteElement(selectedElement.id)}
          className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
          title="Excluir (Delete)"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

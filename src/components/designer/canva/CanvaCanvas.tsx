import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  CanvasElement,
  CanvasBackground,
  TextElement,
  ShapeElement,
  ImageElement,
  StickerElement,
  BrushElement,
  BlendModeType,
} from './types';
import {
  ChevronsUp,
  ChevronsDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  Blend,
  Sliders,
  Check,
  Type,
  Image as ImageIcon,
  Square,
  Smile,
  Paintbrush,
} from 'lucide-react';

interface CanvaCanvasProps {
  width: number;
  height: number;
  zoom: number;
  background: CanvasBackground;
  elements: CanvasElement[];
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, partial: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onBringForward?: (id: string) => void;
  onSendBackward?: (id: string) => void;
  onBringToFront?: (id: string) => void;
  onSendToBack?: (id: string) => void;
  isDrawingMode?: boolean;
  brushColor?: string;
  brushWidth?: number;
  onAddBrushElement?: (element: BrushElement) => void;
  showGrid?: boolean;
}

export const CanvaCanvas: React.FC<CanvaCanvasProps> = ({
  width,
  height,
  zoom,
  background,
  elements,
  selectedId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  isDrawingMode = false,
  brushColor = '#ffffff',
  brushWidth = 4,
  onAddBrushElement,
  showGrid = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [elementStartPos, setElementStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Resize State
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
    elX: number;
    elY: number;
    fontSize?: number;
  }>({ x: 0, y: 0, w: 0, h: 0, elX: 0, elY: 0 });

  // Rotate State
  const [isRotating, setIsRotating] = useState(false);
  const [rotateCenter, setRotateCenter] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Drawing state
  const [currentBrushPoints, setCurrentBrushPoints] = useState<{ x: number; y: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Right Click Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    elementId: string | null;
    overlappingElements: CanvasElement[];
  } | null>(null);

  // Quick Blend Mode Selector popover in floating bar
  const [showFloatingBlendMenu, setShowFloatingBlendMenu] = useState(false);

  // Active element
  const selectedElement = elements.find((el) => el.id === selectedId);

  // Close context menu on outside click or scroll
  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu(null);
      setShowFloatingBlendMenu(false);
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('scroll', handleGlobalClick, true);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('scroll', handleGlobalClick, true);
    };
  }, []);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (!selectedId || !selectedElement) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteElement(selectedId);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onDuplicateElement(selectedId);
      } else if (e.key === ']' || ((e.ctrlKey || e.metaKey) && e.key === ']')) {
        e.preventDefault();
        if (e.shiftKey && onBringToFront) {
          onBringToFront(selectedId);
        } else if (onBringForward) {
          onBringForward(selectedId);
        }
      } else if (e.key === '[' || ((e.ctrlKey || e.metaKey) && e.key === '[')) {
        e.preventDefault();
        if (e.shiftKey && onSendToBack) {
          onSendToBack(selectedId);
        } else if (onSendBackward) {
          onSendBackward(selectedId);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onUpdateElement(selectedId, { y: selectedElement.y - (e.shiftKey ? 10 : 1) });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onUpdateElement(selectedId, { y: selectedElement.y + (e.shiftKey ? 10 : 1) });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onUpdateElement(selectedId, { x: selectedElement.x - (e.shiftKey ? 10 : 1) });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onUpdateElement(selectedId, { x: selectedElement.x + (e.shiftKey ? 10 : 1) });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedId,
    selectedElement,
    onDeleteElement,
    onDuplicateElement,
    onUpdateElement,
    onBringForward,
    onSendBackward,
    onBringToFront,
    onSendToBack,
  ]);

  // Global mouse move & up listeners for drag, resize, rotate
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scale = zoom / 100;

      // Handle Element Dragging
      if (isDragging && selectedId && selectedElement && !selectedElement.locked) {
        const dx = (e.clientX - dragStart.x) / scale;
        const dy = (e.clientY - dragStart.y) / scale;
        onUpdateElement(selectedId, {
          x: Math.round(elementStartPos.x + dx),
          y: Math.round(elementStartPos.y + dy),
        });
      }

      // Handle Element Resizing
      if (resizeHandle && selectedId && selectedElement && !selectedElement.locked) {
        const dx = (e.clientX - resizeStart.x) / scale;
        const dy = (e.clientY - resizeStart.y) / scale;

        let newW = resizeStart.w;
        let newH = resizeStart.h;
        let newX = resizeStart.elX;
        let newY = resizeStart.elY;

        if (resizeHandle.includes('e')) newW = Math.max(20, resizeStart.w + dx);
        if (resizeHandle.includes('s')) newH = Math.max(20, resizeStart.h + dy);
        if (resizeHandle.includes('w')) {
          const proposedW = resizeStart.w - dx;
          if (proposedW > 20) {
            newW = proposedW;
            newX = resizeStart.elX + dx;
          }
        }
        if (resizeHandle.includes('n')) {
          const proposedH = resizeStart.h - dy;
          if (proposedH > 20) {
            newH = proposedH;
            newY = resizeStart.elY + dy;
          }
        }

        // For text elements, scale font size proportionally with corner drag
        if (selectedElement.type === 'text' && (resizeHandle === 'se' || resizeHandle === 'nw' || resizeHandle === 'ne' || resizeHandle === 'sw')) {
          const ratio = newW / resizeStart.w;
          const originalFontSize = resizeStart.fontSize || (selectedElement as TextElement).fontSize;
          const newFontSize = Math.max(8, Math.round(originalFontSize * ratio));
          onUpdateElement(selectedId, {
            x: Math.round(newX),
            y: Math.round(newY),
            width: Math.round(newW),
            height: Math.round(newH),
            fontSize: newFontSize,
          });
        } else {
          onUpdateElement(selectedId, {
            x: Math.round(newX),
            y: Math.round(newY),
            width: Math.round(newW),
            height: Math.round(newH),
          });
        }
      }

      // Handle Element Rotating
      if (isRotating && selectedId && selectedElement && !selectedElement.locked) {
        const angleRad = Math.atan2(e.clientY - rotateCenter.y, e.clientX - rotateCenter.x);
        let angleDeg = Math.round((angleRad * 180) / Math.PI) + 90;
        if (angleDeg < 0) angleDeg += 360;
        if (angleDeg >= 360) angleDeg -= 360;

        // Snap to 0, 45, 90, 180, 270 degrees if close
        if (Math.abs(angleDeg - 0) < 4 || Math.abs(angleDeg - 360) < 4) angleDeg = 0;
        else if (Math.abs(angleDeg - 90) < 4) angleDeg = 90;
        else if (Math.abs(angleDeg - 180) < 4) angleDeg = 180;
        else if (Math.abs(angleDeg - 270) < 4) angleDeg = 270;

        onUpdateElement(selectedId, { rotation: angleDeg });
      }

      // Handle Drawing Brush Points
      if (isDrawingMode && isDrawing) {
        const mouseX = (e.clientX - rect.left) / scale;
        const mouseY = (e.clientY - rect.top) / scale;
        setCurrentBrushPoints((prev) => [...prev, { x: mouseX, y: mouseY }]);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setResizeHandle(null);
      setIsRotating(false);

      if (isDrawingMode && isDrawing && currentBrushPoints.length > 1 && onAddBrushElement) {
        // Calculate bounding box for brush element
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        currentBrushPoints.forEach((p) => {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        });

        const brushElement: BrushElement = {
          id: `brush-${Date.now()}`,
          type: 'brush',
          x: Math.max(0, Math.round(minX)),
          y: Math.max(0, Math.round(minY)),
          width: Math.max(20, Math.round(maxX - minX)),
          height: Math.max(20, Math.round(maxY - minY)),
          rotation: 0,
          opacity: 1,
          locked: false,
          zIndex: elements.length + 1,
          points: currentBrushPoints,
          color: brushColor,
          strokeWidth: brushWidth,
        };

        onAddBrushElement(brushElement);
        setCurrentBrushPoints([]);
      }
      setIsDrawing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    dragStart,
    elementStartPos,
    resizeHandle,
    resizeStart,
    isRotating,
    rotateCenter,
    isDrawingMode,
    isDrawing,
    currentBrushPoints,
    selectedId,
    selectedElement,
    zoom,
    brushColor,
    brushWidth,
    onUpdateElement,
    onAddBrushElement,
    elements.length,
  ]);

  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (isDrawingMode) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scale = zoom / 100;
      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY = (e.clientY - rect.top) / scale;
      setIsDrawing(true);
      setCurrentBrushPoints([{ x: mouseX, y: mouseY }]);
      return;
    }

    if (e.target === containerRef.current || (e.target as HTMLElement).id === 'canva-artboard') {
      onSelectElement(null);
    }
  };

  const handleMouseDownElement = (e: React.MouseEvent, el: CanvasElement) => {
    e.stopPropagation();
    if (isDrawingMode) return;

    onSelectElement(el.id);

    if (el.locked) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementStartPos({ x: el.x, y: el.y });
  };

  // Right-Click Handler on Artboard / Element
  const handleContextMenu = (e: React.MouseEvent, targetEl?: CanvasElement) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    const clickCanvasX = (e.clientX - rect.left) / scale;
    const clickCanvasY = (e.clientY - rect.top) / scale;

    // Find all elements under the click position
    const overlapping = elements
      .filter((el) => {
        return (
          clickCanvasX >= el.x &&
          clickCanvasX <= el.x + el.width &&
          clickCanvasY >= el.y &&
          clickCanvasY <= el.y + el.height
        );
      })
      .sort((a, b) => b.zIndex - a.zIndex); // Highest zIndex first

    const activeEl = targetEl || (overlapping.length > 0 ? overlapping[0] : null);

    if (activeEl) {
      onSelectElement(activeEl.id);
    }

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      elementId: activeEl ? activeEl.id : null,
      overlappingElements: overlapping,
    });
  };

  const handleMouseDownResize = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (!selectedElement || selectedElement.locked) return;

    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      w: selectedElement.width,
      h: selectedElement.height,
      elX: selectedElement.x,
      elY: selectedElement.y,
      fontSize: selectedElement.type === 'text' ? (selectedElement as TextElement).fontSize : undefined,
    });
  };

  const handleMouseDownRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedElement || selectedElement.locked || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    const centerX = rect.left + (selectedElement.x + selectedElement.width / 2) * scale;
    const centerY = rect.top + (selectedElement.y + selectedElement.height / 2) * scale;

    setIsRotating(true);
    setRotateCenter({ x: centerX, y: centerY });
  };

  // Background CSS generator
  const getBackgroundStyle = (): React.CSSProperties => {
    if (background.type === 'gradient' && background.gradient) {
      const colors = background.gradient.colors.join(', ');
      return {
        background: `linear-gradient(${background.gradient.angle}deg, ${colors})`,
      };
    }
    if (background.type === 'image' && background.imageSrc) {
      return {
        backgroundImage: `url(${background.imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return {
      backgroundColor: background.color || '#000000',
    };
  };

  // Sort elements by zIndex ascending for true CSS stacking
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type className="w-3.5 h-3.5 text-blue-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
      case 'shape':
        return <Square className="w-3.5 h-3.5 text-amber-400" />;
      case 'sticker':
        return <Smile className="w-3.5 h-3.5 text-purple-400" />;
      case 'brush':
        return <Paintbrush className="w-3.5 h-3.5 text-pink-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  const getElementLabel = (el: CanvasElement) => {
    if (el.type === 'text') return `"${(el as TextElement).text.slice(0, 18)}..."`;
    if (el.type === 'image') return 'Imagem / Foto';
    if (el.type === 'shape') return `Forma: ${(el as ShapeElement).shapeType}`;
    if (el.type === 'sticker') return `Selo: ${(el as StickerElement).badgeText || 'Badge'}`;
    if (el.type === 'brush') return 'Traço / Desenho';
    return 'Elemento';
  };

  const BLEND_MODES: { label: string; value: BlendModeType; desc: string }[] = [
    { label: 'Normal', value: 'normal', desc: 'Padrão (sem mesclagem)' },
    { label: 'Multiplicar', value: 'multiply', desc: 'Escurece e funde sombras' },
    { label: 'Sobrepor', value: 'overlay', desc: 'Aumenta contraste sobreposto' },
    { label: 'Clarear / Screen', value: 'screen', desc: 'Remove fundo preto e clareia' },
    { label: 'Luz Suave', value: 'soft-light', desc: 'Iluminação difusa suave' },
    { label: 'Luz Direta', value: 'hard-light', desc: 'Forte contraste de iluminação' },
    { label: 'Diferença', value: 'difference', desc: 'Inversão estilizada de cores' },
  ];

  return (
    <div
      className="flex items-center justify-center p-8 min-h-full w-full overflow-auto select-none relative"
      onMouseDown={handleMouseDownCanvas}
      onContextMenu={(e) => handleContextMenu(e)}
    >
      <div
        ref={containerRef}
        id="canva-artboard"
        className="relative shadow-2xl transition-transform duration-75 origin-center rounded-sm overflow-hidden"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${zoom / 100})`,
          ...getBackgroundStyle(),
        }}
      >
        {/* Optional Grid Overlay */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        )}

        {/* Canvas Elements rendered in strict zIndex order */}
        {sortedElements.map((el) => {
          if (el.hidden) return null;
          const isSelected = el.id === selectedId;

          return (
            <div
              key={el.id}
              id={`canva-el-${el.id}`}
              onMouseDown={(e) => handleMouseDownElement(e, el)}
              onContextMenu={(e) => handleContextMenu(e, el)}
              className={`absolute cursor-move ${
                isSelected ? 'ring-2 ring-blue-500 rounded-sm' : ''
              }`}
              style={{
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                transform: `rotate(${el.rotation || 0}deg)`,
                opacity: el.opacity ?? 1,
                zIndex: el.zIndex,
                mixBlendMode: (el.blendMode || 'normal') as any,
              }}
            >
              {/* Element Renderers */}
              {el.type === 'text' && <RenderTextElement element={el as TextElement} />}
              {el.type === 'shape' && <RenderShapeElement element={el as ShapeElement} />}
              {el.type === 'image' && <RenderImageElement element={el as ImageElement} />}
              {el.type === 'sticker' && <RenderStickerElement element={el as StickerElement} />}
              {el.type === 'brush' && <RenderBrushElement element={el as BrushElement} />}

              {/* Selection Bounding Box & Transform Handles */}
              {isSelected && !el.locked && !isDrawingMode && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Rotate handle above top edge */}
                  <div
                    className="absolute -top-7 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-blue-500 shadow-md cursor-grab active:cursor-grabbing pointer-events-auto flex items-center justify-center"
                    onMouseDown={handleMouseDownRotate}
                    title="Girar elemento"
                  >
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  </div>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-blue-500 pointer-events-none" />

                  {/* Corner Resize Handles */}
                  <div
                    className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-sm shadow cursor-nwse-resize pointer-events-auto"
                    onMouseDown={(e) => handleMouseDownResize(e, 'nw')}
                  />
                  <div
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-sm shadow cursor-nesw-resize pointer-events-auto"
                    onMouseDown={(e) => handleMouseDownResize(e, 'ne')}
                  />
                  <div
                    className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-sm shadow cursor-nesw-resize pointer-events-auto"
                    onMouseDown={(e) => handleMouseDownResize(e, 'sw')}
                  />
                  <div
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-sm shadow cursor-nwse-resize pointer-events-auto"
                    onMouseDown={(e) => handleMouseDownResize(e, 'se')}
                  />

                  {/* Edge Resize Handles */}
                  <div
                    className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-5 bg-white border-2 border-blue-500 rounded-sm shadow cursor-ew-resize pointer-events-auto"
                    onMouseDown={(e) => handleMouseDownResize(e, 'w')}
                  />
                  <div
                    className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-5 bg-white border-2 border-blue-500 rounded-sm shadow cursor-ew-resize pointer-events-auto"
                    onMouseDown={(e) => handleMouseDownResize(e, 'e')}
                  />
                  <div
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-3 bg-white border-2 border-blue-500 rounded-sm shadow cursor-ns-resize pointer-events-auto"
                    onMouseDown={(e) => handleMouseDownResize(e, 'n')}
                  />
                  <div
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-3 bg-white border-2 border-blue-500 rounded-sm shadow cursor-ns-resize pointer-events-auto"
                    onMouseDown={(e) => handleMouseDownResize(e, 's')}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Live Active Brush Stroke Preview */}
        {isDrawingMode && currentBrushPoints.length > 1 && (
          <svg className="absolute inset-0 w-full height-full pointer-events-none z-50">
            <polyline
              fill="none"
              stroke={brushColor}
              strokeWidth={brushWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              points={currentBrushPoints.map((p) => `${p.x},${p.y}`).join(' ')}
            />
          </svg>
        )}
      </div>

      {/* FLOATING QUICK-ACTIONS LAYER BAR FOR SELECTED ELEMENT */}
      {selectedElement && !isDrawingMode && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#12131a]/95 backdrop-blur-md border border-neutral-700/80 rounded-2xl shadow-2xl p-2 z-50 flex items-center gap-1.5 text-xs select-none animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-300 font-bold text-[11px]">
            {getElementIcon(selectedElement.type)}
            <span className="max-w-[120px] truncate">{getElementLabel(selectedElement)}</span>
          </div>

          <div className="h-4 w-px bg-neutral-800" />

          {/* Bring to Front */}
          <button
            onClick={() => onBringToFront && onBringToFront(selectedElement.id)}
            className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-blue-400 rounded-lg cursor-pointer flex items-center gap-1"
            title="Trazer para a Frente (Ctrl+Shift+])"
          >
            <ChevronsUp className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold hidden sm:inline">Frente</span>
          </button>

          {/* Bring Forward */}
          <button
            onClick={() => onBringForward && onBringForward(selectedElement.id)}
            className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-emerald-400 rounded-lg cursor-pointer flex items-center gap-1"
            title="Avançar 1 Camada (Ctrl+])"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold hidden sm:inline">Avançar</span>
          </button>

          {/* Send Backward */}
          <button
            onClick={() => onSendBackward && onSendBackward(selectedElement.id)}
            className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 rounded-lg cursor-pointer flex items-center gap-1"
            title="Recuar 1 Camada (Ctrl+[)"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold hidden sm:inline">Recuar</span>
          </button>

          {/* Send to Back */}
          <button
            onClick={() => onSendToBack && onSendToBack(selectedElement.id)}
            className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-purple-400 rounded-lg cursor-pointer flex items-center gap-1"
            title="Enviar para o Fundo (Ctrl+Shift+[)"
          >
            <ChevronsDown className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold hidden sm:inline">Fundo</span>
          </button>

          <div className="h-4 w-px bg-neutral-800" />

          {/* Quick Blend Mode Popover Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowFloatingBlendMenu(!showFloatingBlendMenu)}
              className={`p-1.5 rounded-lg border font-bold text-[10px] flex items-center gap-1 cursor-pointer ${
                selectedElement.blendMode && selectedElement.blendMode !== 'normal'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:text-white'
              }`}
              title="Sobreposição e Mesclagem de Cores"
            >
              <Blend className="w-3.5 h-3.5" />
              <span>Sobrepor</span>
            </button>

            {showFloatingBlendMenu && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-52 bg-[#181922] border border-neutral-700 rounded-xl shadow-2xl p-1.5 space-y-0.5 z-50">
                <div className="text-[9px] font-bold text-neutral-400 uppercase px-2 py-1">
                  Modo de Sobreposição
                </div>
                {BLEND_MODES.map((bm) => (
                  <button
                    key={bm.value}
                    onClick={() => {
                      onUpdateElement(selectedElement.id, { blendMode: bm.value });
                      setShowFloatingBlendMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center justify-between cursor-pointer ${
                      (selectedElement.blendMode || 'normal') === bm.value
                        ? 'bg-blue-600/30 text-blue-300 font-bold'
                        : 'hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <span>{bm.label}</span>
                    {(selectedElement.blendMode || 'normal') === bm.value && (
                      <Check className="w-3 h-3 text-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-neutral-800" />

          {/* Duplicate */}
          <button
            onClick={() => onDuplicateElement(selectedElement.id)}
            className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg cursor-pointer"
            title="Duplicar (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDeleteElement(selectedElement.id)}
            className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer"
            title="Excluir Elemento (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* RIGHT-CLICK CONTEXT MENU */}
      {contextMenu && (
        <div
          className="fixed bg-[#161720] border border-neutral-700/90 rounded-2xl shadow-2xl p-2 z-50 text-xs w-60 space-y-1 select-none animate-fade-in"
          style={{
            left: `${Math.min(window.innerWidth - 250, contextMenu.x)}px`,
            top: `${Math.min(window.innerHeight - 340, contextMenu.y)}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Overlapping Elements list selector */}
          {contextMenu.overlappingElements.length > 1 && (
            <div className="border-b border-neutral-800 pb-1.5 mb-1.5">
              <div className="text-[10px] font-bold text-neutral-400 uppercase px-2 py-0.5">
                Elementos Sobrepostos ({contextMenu.overlappingElements.length})
              </div>
              <div className="space-y-0.5 max-h-32 overflow-y-auto">
                {contextMenu.overlappingElements.map((el) => (
                  <button
                    key={el.id}
                    onClick={() => {
                      onSelectElement(el.id);
                      setContextMenu(null);
                    }}
                    className={`w-full text-left px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                      el.id === selectedId
                        ? 'bg-blue-600/30 text-blue-300'
                        : 'hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {getElementIcon(el.type)}
                    <span className="truncate">{getElementLabel(el)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {contextMenu.elementId && (
            <>
              <div className="text-[10px] font-bold text-neutral-500 uppercase px-2 py-0.5">
                Sobreposição & Posição
              </div>

              <button
                onClick={() => {
                  onBringToFront && onBringToFront(contextMenu.elementId!);
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ChevronsUp className="w-3.5 h-3.5 text-blue-400" />
                  <span>Trazer para Frente</span>
                </div>
                <span className="text-[10px] text-neutral-500">Ctrl+Shift+]</span>
              </button>

              <button
                onClick={() => {
                  onBringForward && onBringForward(contextMenu.elementId!);
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Avançar 1 Camada</span>
                </div>
                <span className="text-[10px] text-neutral-500">Ctrl+]</span>
              </button>

              <button
                onClick={() => {
                  onSendBackward && onSendBackward(contextMenu.elementId!);
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Recuar 1 Camada</span>
                </div>
                <span className="text-[10px] text-neutral-500">Ctrl+[</span>
              </button>

              <button
                onClick={() => {
                  onSendToBack && onSendToBack(contextMenu.elementId!);
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ChevronsDown className="w-3.5 h-3.5 text-purple-400" />
                  <span>Enviar para o Fundo</span>
                </div>
                <span className="text-[10px] text-neutral-500">Ctrl+Shift+[</span>
              </button>

              <div className="border-t border-neutral-800 my-1 pt-1" />

              <div className="text-[10px] font-bold text-neutral-500 uppercase px-2 py-0.5">
                Ações Rápidas
              </div>

              <button
                onClick={() => {
                  onDuplicateElement(contextMenu.elementId!);
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Duplicar</span>
                </div>
                <span className="text-[10px] text-neutral-500">Ctrl+D</span>
              </button>

              <button
                onClick={() => {
                  const el = elements.find((e) => e.id === contextMenu.elementId);
                  if (el) onUpdateElement(el.id, { locked: !el.locked });
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Bloquear / Desbloquear</span>
              </button>

              <button
                onClick={() => {
                  onDeleteElement(contextMenu.elementId!);
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Excluir</span>
                </div>
                <span className="text-[10px] text-red-400">Del</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Sub-renderers
const RenderTextElement: React.FC<{ element: TextElement }> = ({ element }) => {
  return (
    <div
      className="w-full h-full flex items-center justify-center select-none overflow-visible"
      style={{
        fontFamily: element.fontFamily,
        fontSize: `${element.fontSize}px`,
        fontWeight: element.fontWeight,
        fontStyle: element.fontStyle || 'normal',
        textAlign: element.textAlign || 'center',
        color: element.color || '#ffffff',
        letterSpacing: `${element.letterSpacing || 0}px`,
        lineHeight: element.lineHeight || 1.2,
        textTransform: element.textTransform || 'none',
        textDecoration: element.textDecoration || 'none',
        textShadow: element.shadowColor
          ? `${element.shadowOffsetX || 0}px ${element.shadowOffsetY || 0}px ${element.shadowBlur || 10}px ${element.shadowColor}`
          : 'none',
        backgroundColor: element.backgroundColor || 'transparent',
        padding: element.backgroundPadding ? `${element.backgroundPadding}px` : '0px',
        borderRadius: element.backgroundRadius ? `${element.backgroundRadius}px` : '0px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {element.text}
    </div>
  );
};

const RenderShapeElement: React.FC<{ element: ShapeElement }> = ({ element }) => {
  const { shapeType, fillColor, strokeColor, strokeWidth, borderRadius } = element;

  if (shapeType === 'circle') {
    return (
      <div
        className="w-full h-full rounded-full"
        style={{
          backgroundColor: fillColor,
          borderColor: strokeColor || 'transparent',
          borderWidth: `${strokeWidth || 0}px`,
          borderStyle: 'solid',
        }}
      />
    );
  }

  if (shapeType === 'triangle') {
    return (
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon
          points="50,0 100,100 0,100"
          fill={fillColor}
          stroke={strokeColor || 'transparent'}
          strokeWidth={strokeWidth || 0}
        />
      </svg>
    );
  }

  if (shapeType === 'star') {
    return (
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon
          points="50,5 64,36 98,36 70,57 81,90 50,70 19,90 30,57 2,36 36,36"
          fill={fillColor}
          stroke={strokeColor || 'transparent'}
          strokeWidth={strokeWidth || 0}
        />
      </svg>
    );
  }

  if (shapeType === 'line') {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          borderBottom: `${strokeWidth || 3}px solid ${fillColor || strokeColor || '#ffffff'}`,
        }}
      />
    );
  }

  if (shapeType === 'arrow') {
    return (
      <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
        <path
          d="M0,20 L65,20 L65,5 L100,25 L65,45 L65,30 L0,30 Z"
          fill={fillColor}
          stroke={strokeColor || 'transparent'}
          strokeWidth={strokeWidth || 0}
        />
      </svg>
    );
  }

  // Rectangle / Rounded Rect
  return (
    <div
      className="w-full h-full"
      style={{
        backgroundColor: fillColor,
        borderColor: strokeColor || 'transparent',
        borderWidth: `${strokeWidth || 0}px`,
        borderStyle: 'solid',
        borderRadius: `${borderRadius || 0}px`,
      }}
    />
  );
};

const RenderImageElement: React.FC<{ element: ImageElement }> = ({ element }) => {
  const filterString = [
    element.brightness !== undefined ? `brightness(${element.brightness}%)` : '',
    element.contrast !== undefined ? `contrast(${element.contrast}%)` : '',
    element.saturation !== undefined ? `saturate(${element.saturation}%)` : '',
    element.blur ? `blur(${element.blur}px)` : '',
    element.grayscale ? `grayscale(${element.grayscale}%)` : '',
    element.sepia ? `sepia(${element.sepia}%)` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <img
      src={element.src}
      alt={element.alt || 'Arte Canva'}
      className="w-full h-full object-cover pointer-events-none select-none"
      referrerPolicy="no-referrer"
      style={{
        borderRadius: `${element.borderRadius || 0}px`,
        transform: `scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
        filter: filterString || 'none',
      }}
    />
  );
};

const RenderStickerElement: React.FC<{ element: StickerElement }> = ({ element }) => {
  return (
    <div
      className="w-full h-full flex items-center justify-center rounded-2xl p-2 shadow-lg"
      style={{
        backgroundColor: element.fillColor,
        color: element.textColor || '#ffffff',
      }}
    >
      <span className="font-black text-center tracking-wide">{element.badgeText || element.content}</span>
    </div>
  );
};

const RenderBrushElement: React.FC<{ element: BrushElement }> = ({ element }) => {
  if (!element.points || element.points.length < 2) return null;
  // Offset relative to element x/y
  const pts = element.points.map((p) => `${p.x - element.x},${p.y - element.y}`).join(' ');

  return (
    <svg className="w-full h-full overflow-visible pointer-events-none">
      <polyline
        fill="none"
        stroke={element.color}
        strokeWidth={element.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
};

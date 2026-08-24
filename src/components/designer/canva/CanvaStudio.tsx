import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CanvasElement,
  CanvasBackground,
  CanvasTemplate,
  SavedCanvaProject,
  TextElement,
  ShapeElement,
  ImageElement,
  StickerElement,
  BrushElement,
} from './types';
import { CANVAS_PRESETS } from './stockAssets';
import { CANVA_TEMPLATES } from './templates';
import { CanvaCanvas } from './CanvaCanvas';
import { CanvaSidebar } from './CanvaSidebar';
import { CanvaToolbar } from './CanvaToolbar';
import {
  Undo,
  Redo,
  Download,
  Share2,
  FolderPlus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Sparkles,
  ChevronDown,
  FileImage,
  Send,
  Save,
  Check,
  Palette,
} from 'lucide-react';
import { DesignProject, DesignFolder } from '../../../types';
import { FirestoreUserProfile } from '../../../lib/firebase';

const SAVED_PROJECTS_KEY = 'agencyos_canva_projects_v1';
const AUTOSAVE_DRAFT_KEY = 'agencyos_canva_draft_v1';

interface CanvaStudioProps {
  userProfile?: FirestoreUserProfile | null;
  designFolders?: DesignFolder[];
  onAddProject?: (project: Omit<DesignProject, 'id'>) => Promise<void>;
  showToast: (msg: string) => void;
  onClose?: () => void;
}

export const CanvaStudio: React.FC<CanvaStudioProps> = ({
  userProfile,
  designFolders = [],
  onAddProject,
  showToast,
  onClose,
}) => {
  // Canvas Dimensions & Format Preset
  const [canvasPresetId, setCanvasPresetId] = useState<string>('insta-square');
  const [canvasWidth, setCanvasWidth] = useState<number>(1080);
  const [canvasHeight, setCanvasHeight] = useState<number>(1080);
  const [projectTitle, setProjectTitle] = useState<string>('Nova Arte Sem Título');

  // Background
  const [background, setBackground] = useState<CanvasBackground>({
    type: 'color',
    color: '#0e1017',
  });

  // Elements
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [brushColor, setBrushColor] = useState<string>('#ffffff');
  const [brushWidth, setBrushWidth] = useState<number>(4);

  // Zoom & Viewport state
  const [zoom, setZoom] = useState<number>(55);
  const [showGrid, setShowGrid] = useState<boolean>(false);

  // History for Undo / Redo
  const [history, setHistory] = useState<{ elements: CanvasElement[]; background: CanvasBackground }[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isUndoRedoing = useRef<boolean>(false);

  // Saved Projects in Local Storage
  const [savedProjects, setSavedProjects] = useState<SavedCanvaProject[]>([]);

  // Export / Integration Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSaveToMuralModalOpen, setIsSaveToMuralModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Mural Modal Fields
  const [muralClientName, setMuralClientName] = useState<string>('');
  const [muralFolderId, setMuralFolderId] = useState<string>('');
  const [muralChannel, setMuralChannel] = useState<any>('Instagram Feed');
  const [muralCategory, setMuralCategory] = useState<any>('Instagram');
  const [muralCopy, setMuralCopy] = useState<string>('');

  // Initial Load from Template or Autosave
  useEffect(() => {
    // Load Saved Projects
    try {
      const stored = localStorage.getItem(SAVED_PROJECTS_KEY);
      if (stored) {
        setSavedProjects(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }

    // Load initial default template if empty
    if (CANVA_TEMPLATES.length > 0) {
      const defaultTemplate = CANVA_TEMPLATES[0];
      setCanvasWidth(defaultTemplate.width);
      setCanvasHeight(defaultTemplate.height);
      setBackground(defaultTemplate.background);
      setElements(defaultTemplate.elements);
      setProjectTitle(defaultTemplate.name);
      pushHistory(defaultTemplate.elements, defaultTemplate.background);
    }
  }, []);

  // Push to History stack
  const pushHistory = useCallback(
    (newElements: CanvasElement[], newBg: CanvasBackground) => {
      if (isUndoRedoing.current) return;
      setHistory((prev) => {
        const nextHistory = prev.slice(0, historyIndex + 1);
        return [...nextHistory, { elements: JSON.parse(JSON.stringify(newElements)), background: { ...newBg } }];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  // Handle Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      isUndoRedoing.current = true;
      const targetState = history[historyIndex - 1];
      setElements(JSON.parse(JSON.stringify(targetState.elements)));
      setBackground({ ...targetState.background });
      setHistoryIndex((prev) => prev - 1);
      setTimeout(() => {
        isUndoRedoing.current = false;
      }, 50);
    }
  };

  // Handle Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUndoRedoing.current = true;
      const targetState = history[historyIndex + 1];
      setElements(JSON.parse(JSON.stringify(targetState.elements)));
      setBackground({ ...targetState.background });
      setHistoryIndex((prev) => prev + 1);
      setTimeout(() => {
        isUndoRedoing.current = false;
      }, 50);
    }
  };

  // Apply Template
  const handleApplyTemplate = (template: CanvasTemplate) => {
    setCanvasWidth(template.width);
    setCanvasHeight(template.height);
    setBackground(template.background);
    setElements(template.elements);
    setProjectTitle(template.name);
    setSelectedId(null);
    pushHistory(template.elements, template.background);
    showToast(`Modelo "${template.name}" aplicado com sucesso!`);
  };

  // Add Single Element
  const handleAddElement = (newElement: CanvasElement) => {
    const updated = [...elements, newElement];
    setElements(updated);
    setSelectedId(newElement.id);
    pushHistory(updated, background);
  };

  // Update Element
  const handleUpdateElement = (id: string, partial: Partial<CanvasElement>) => {
    const updated = elements.map((el) => (el.id === id ? ({ ...el, ...partial } as CanvasElement) : el));
    setElements(updated);
    pushHistory(updated, background);
  };

  // Delete Element
  const handleDeleteElement = (id: string) => {
    const updated = elements.filter((el) => el.id !== id);
    setElements(updated);
    if (selectedId === id) setSelectedId(null);
    pushHistory(updated, background);
  };

  // Duplicate Element
  const handleDuplicateElement = (id: string) => {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    const duplicated: CanvasElement = {
      ...JSON.parse(JSON.stringify(el)),
      id: `${el.type}-${Date.now()}`,
      x: el.x + 30,
      y: el.y + 30,
      zIndex: elements.length + 1,
    };
    const updated = [...elements, duplicated];
    setElements(updated);
    setSelectedId(duplicated.id);
    pushHistory(updated, background);
    showToast('Elemento duplicado');
  };

  // Change Background
  const handleChangeBackground = (newBg: CanvasBackground) => {
    setBackground(newBg);
    pushHistory(elements, newBg);
  };

  // Reorder Layers with strictly normalized sequential indexing
  const handleBringToFront = (id: string) => {
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const target = sorted.find((e) => e.id === id);
    if (!target) return;
    const filtered = sorted.filter((e) => e.id !== id);
    const newOrder = [...filtered, target];
    const updated = newOrder.map((el, idx) => ({ ...el, zIndex: idx + 1 }));
    setElements(updated);
    pushHistory(updated, background);
    showToast('Camada trazida para a frente');
  };

  const handleSendToBack = (id: string) => {
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const target = sorted.find((e) => e.id === id);
    if (!target) return;
    const filtered = sorted.filter((e) => e.id !== id);
    const newOrder = [target, ...filtered];
    const updated = newOrder.map((el, idx) => ({ ...el, zIndex: idx + 1 }));
    setElements(updated);
    pushHistory(updated, background);
    showToast('Camada enviada para o fundo');
  };

  const handleBringForward = (id: string) => {
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex((e) => e.id === id);
    if (idx === -1 || idx === sorted.length - 1) return;
    const newOrder = [...sorted];
    const temp = newOrder[idx];
    newOrder[idx] = newOrder[idx + 1];
    newOrder[idx + 1] = temp;
    const updated = newOrder.map((el, i) => ({ ...el, zIndex: i + 1 }));
    setElements(updated);
    pushHistory(updated, background);
    showToast('Avançou 1 camada');
  };

  const handleSendBackward = (id: string) => {
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex((e) => e.id === id);
    if (idx <= 0) return;
    const newOrder = [...sorted];
    const temp = newOrder[idx];
    newOrder[idx] = newOrder[idx - 1];
    newOrder[idx - 1] = temp;
    const updated = newOrder.map((el, i) => ({ ...el, zIndex: i + 1 }));
    setElements(updated);
    pushHistory(updated, background);
    showToast('Recuou 1 camada');
  };

  const handleReorderLayers = (newOrderedIds: string[]) => {
    const idMap = new Map<string, CanvasElement>(elements.map((e) => [e.id, e]));
    const reordered: CanvasElement[] = [];
    newOrderedIds.forEach((id) => {
      const el = idMap.get(id);
      if (el) reordered.push(el);
    });
    // Add any missing
    elements.forEach((e) => {
      if (!newOrderedIds.includes(e.id)) reordered.push(e);
    });
    const updated = reordered.map((el, idx) => ({ ...el, zIndex: idx + 1 }));
    setElements(updated);
    pushHistory(updated, background);
  };

  // Align Element to Canvas
  const handleAlignElement = (
    id: string,
    alignment: 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom'
  ) => {
    const el = elements.find((e) => e.id === id);
    if (!el) return;

    let newX = el.x;
    let newY = el.y;

    if (alignment === 'left') newX = 0;
    if (alignment === 'center-x') newX = Math.round((canvasWidth - el.width) / 2);
    if (alignment === 'right') newX = canvasWidth - el.width;
    if (alignment === 'top') newY = 0;
    if (alignment === 'center-y') newY = Math.round((canvasHeight - el.height) / 2);
    if (alignment === 'bottom') newY = canvasHeight - el.height;

    handleUpdateElement(id, { x: newX, y: newY });
  };

  // Change Preset Format
  const handlePresetChange = (presetId: string) => {
    setCanvasPresetId(presetId);
    const preset = CANVAS_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setCanvasWidth(preset.width);
      setCanvasHeight(preset.height);
      showToast(`Dimensões ajustadas para ${preset.name} (${preset.width}x${preset.height})`);
    }
  };

  // Clear Canvas
  const handleClearCanvas = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o canvas?')) {
      setElements([]);
      setSelectedId(null);
      pushHistory([], background);
      showToast('Canvas limpo');
    }
  };

  // Render Canvas to High-Res Image Data URL
  const renderCanvasToDataURL = async (format: 'png' | 'jpeg' = 'png'): Promise<string> => {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = canvasWidth;
    offCanvas.height = canvasHeight;
    const ctx = offCanvas.getContext('2d');
    if (!ctx) return '';

    // 1. Draw Background
    if (background.type === 'color') {
      ctx.fillStyle = background.color || '#000000';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (background.type === 'gradient' && background.gradient) {
      const { colors, angle } = background.gradient;
      const angleRad = (angle * Math.PI) / 180;
      const x1 = canvasWidth / 2 - (Math.cos(angleRad) * canvasWidth) / 2;
      const y1 = canvasHeight / 2 - (Math.sin(angleRad) * canvasHeight) / 2;
      const x2 = canvasWidth / 2 + (Math.cos(angleRad) * canvasWidth) / 2;
      const y2 = canvasHeight / 2 + (Math.sin(angleRad) * canvasHeight) / 2;

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (background.type === 'image' && background.imageSrc) {
      try {
        const bgImg = await loadImage(background.imageSrc);
        ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);
      } catch (e) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    } else {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // 2. Draw Elements in order of zIndex
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

    for (const el of sorted) {
      if (el.hidden) continue;
      ctx.save();
      ctx.globalAlpha = el.opacity ?? 1;
      if (el.blendMode && el.blendMode !== 'normal') {
        try {
          ctx.globalCompositeOperation = el.blendMode as GlobalCompositeOperation;
        } catch {
          // fallback
        }
      }

      // Translate to element center for rotation
      const centerX = el.x + el.width / 2;
      const centerY = el.y + el.height / 2;
      ctx.translate(centerX, centerY);
      if (el.rotation) {
        ctx.rotate((el.rotation * Math.PI) / 180);
      }
      ctx.translate(-centerX, -centerY);

      // Render based on type
      if (el.type === 'text') {
        const textEl = el as TextElement;

        // Background highlight if exists
        if (textEl.backgroundColor && textEl.backgroundColor !== 'transparent') {
          ctx.fillStyle = textEl.backgroundColor;
          const pad = textEl.backgroundPadding || 8;
          const rad = textEl.backgroundRadius || 8;
          roundRect(
            ctx,
            textEl.x - pad,
            textEl.y - pad,
            textEl.width + pad * 2,
            textEl.height + pad * 2,
            rad
          );
          ctx.fill();
        }

        // Shadow Glow
        if (textEl.shadowColor) {
          ctx.shadowColor = textEl.shadowColor;
          ctx.shadowBlur = textEl.shadowBlur || 15;
          ctx.shadowOffsetX = textEl.shadowOffsetX || 0;
          ctx.shadowOffsetY = textEl.shadowOffsetY || 0;
        }

        ctx.fillStyle = textEl.color || '#ffffff';
        const fontStyle = textEl.fontStyle === 'italic' ? 'italic ' : '';
        const fontWeight = textEl.fontWeight || 'normal';
        ctx.font = `${fontStyle}${fontWeight} ${textEl.fontSize}px ${textEl.fontFamily.split(',')[0].replace(/"/g, '')}`;
        ctx.textAlign = (textEl.textAlign === 'justify' ? 'left' : textEl.textAlign) as CanvasTextAlign || 'center';
        ctx.textBaseline = 'middle';

        const lines = textEl.text.split('\n');
        const lineHeight = textEl.fontSize * (textEl.lineHeight || 1.2);
        const startY =
          textEl.y + textEl.height / 2 - ((lines.length - 1) * lineHeight) / 2;

        let posX = textEl.x + textEl.width / 2;
        if (textEl.textAlign === 'left') posX = textEl.x;
        if (textEl.textAlign === 'right') posX = textEl.x + textEl.width;

        lines.forEach((line, i) => {
          ctx.fillText(line, posX, startY + i * lineHeight);
        });
      } else if (el.type === 'shape') {
        const shapeEl = el as ShapeElement;
        ctx.fillStyle = shapeEl.fillColor;
        ctx.strokeStyle = shapeEl.strokeColor || 'transparent';
        ctx.lineWidth = shapeEl.strokeWidth || 0;

        if (shapeEl.shapeType === 'circle') {
          ctx.beginPath();
          ctx.arc(
            shapeEl.x + shapeEl.width / 2,
            shapeEl.y + shapeEl.height / 2,
            shapeEl.width / 2,
            0,
            Math.PI * 2
          );
          ctx.fill();
          if (shapeEl.strokeWidth) ctx.stroke();
        } else if (shapeEl.shapeType === 'triangle') {
          ctx.beginPath();
          ctx.moveTo(shapeEl.x + shapeEl.width / 2, shapeEl.y);
          ctx.lineTo(shapeEl.x + shapeEl.width, shapeEl.y + shapeEl.height);
          ctx.lineTo(shapeEl.x, shapeEl.y + shapeEl.height);
          ctx.closePath();
          ctx.fill();
          if (shapeEl.strokeWidth) ctx.stroke();
        } else if (shapeEl.shapeType === 'line') {
          ctx.beginPath();
          ctx.moveTo(shapeEl.x, shapeEl.y + shapeEl.height / 2);
          ctx.lineTo(shapeEl.x + shapeEl.width, shapeEl.y + shapeEl.height / 2);
          ctx.strokeStyle = shapeEl.fillColor || shapeEl.strokeColor || '#ffffff';
          ctx.lineWidth = shapeEl.strokeWidth || 3;
          ctx.stroke();
        } else {
          // Rectangle or Rounded Rectangle
          roundRect(
            ctx,
            shapeEl.x,
            shapeEl.y,
            shapeEl.width,
            shapeEl.height,
            shapeEl.borderRadius || 0
          );
          ctx.fill();
          if (shapeEl.strokeWidth) ctx.stroke();
        }
      } else if (el.type === 'image') {
        const imgEl = el as ImageElement;
        try {
          const img = await loadImage(imgEl.src);
          if (imgEl.borderRadius) {
            ctx.beginPath();
            roundRect(ctx, imgEl.x, imgEl.y, imgEl.width, imgEl.height, imgEl.borderRadius);
            ctx.clip();
          }
          ctx.drawImage(img, imgEl.x, imgEl.y, imgEl.width, imgEl.height);
        } catch (e) {
          console.error(e);
        }
      } else if (el.type === 'sticker') {
        const stickEl = el as StickerElement;
        ctx.fillStyle = stickEl.fillColor;
        roundRect(ctx, stickEl.x, stickEl.y, stickEl.width, stickEl.height, 16);
        ctx.fill();

        ctx.fillStyle = stickEl.textColor || '#ffffff';
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          stickEl.badgeText || stickEl.content,
          stickEl.x + stickEl.width / 2,
          stickEl.y + stickEl.height / 2
        );
      } else if (el.type === 'brush') {
        const brushEl = el as BrushElement;
        if (brushEl.points && brushEl.points.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = brushEl.color;
          ctx.lineWidth = brushEl.strokeWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.moveTo(brushEl.points[0].x, brushEl.points[0].y);
          for (let i = 1; i < brushEl.points.length; i++) {
            ctx.lineTo(brushEl.points[i].x, brushEl.points[i].y);
          }
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    return offCanvas.toDataURL(format === 'jpeg' ? 'image/jpeg' : 'image/png', 0.95);
  };

  // Helper to load image async
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Helper for rounded rectangle in Canvas 2D
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  };

  // Download High-Res File (PNG / JPG)
  const handleDownloadFile = async (format: 'png' | 'jpeg') => {
    setIsExporting(true);
    try {
      const dataUrl = await renderCanvasToDataURL(format);
      const link = document.createElement('a');
      link.download = `${projectTitle.toLowerCase().replace(/\s+/g, '-')}.${format === 'jpeg' ? 'jpg' : 'png'}`;
      link.href = dataUrl;
      link.click();
      showToast(`Arquivo baixado com sucesso em alta resolução (.${format})!`);
      setIsExportModalOpen(false);
    } catch (e) {
      console.error(e);
      showToast('Erro ao exportar imagem.');
    } finally {
      setIsExporting(false);
    }
  };

  // Save Project to Saved Library
  const handleSaveToProjectLibrary = async () => {
    try {
      const thumb = await renderCanvasToDataURL('png');
      const newProj: SavedCanvaProject = {
        id: `proj-${Date.now()}`,
        title: projectTitle,
        width: canvasWidth,
        height: canvasHeight,
        background,
        elements,
        thumbnailUrl: thumb,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = [newProj, ...savedProjects.filter((p) => p.title !== projectTitle)];
      setSavedProjects(updated);
      localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(updated));
      showToast('Projeto salvo na sua biblioteca pessoal!');
    } catch (e) {
      console.error(e);
      showToast('Erro ao salvar projeto.');
    }
  };

  // Load Saved Project
  const handleLoadSavedProject = (proj: SavedCanvaProject) => {
    setCanvasWidth(proj.width);
    setCanvasHeight(proj.height);
    setBackground(proj.background);
    setElements(proj.elements);
    setProjectTitle(proj.title);
    setSelectedId(null);
    pushHistory(proj.elements, proj.background);
    showToast(`Projeto "${proj.title}" carregado com sucesso!`);
  };

  // Delete Saved Project
  const handleDeleteSavedProject = (id: string) => {
    const updated = savedProjects.filter((p) => p.id !== id);
    setSavedProjects(updated);
    localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(updated));
    showToast('Projeto excluído da biblioteca.');
  };

  // Save Directly to AgencyOS Creative Board (Mural de Criativos)
  const handleSaveToMural = async () => {
    if (!onAddProject) {
      showToast('Função de integração não disponível.');
      return;
    }

    setIsExporting(true);
    try {
      const dataUrl = await renderCanvasToDataURL('png');
      const selectedFolder = designFolders.find((f) => f.id === muralFolderId);

      await onAddProject({
        title: projectTitle || 'Arte Criada no Studio Canva',
        clientName: muralClientName || (selectedFolder ? selectedFolder.clientName : 'Cliente Agência'),
        folderId: muralFolderId || undefined,
        folderName: selectedFolder ? selectedFolder.name : undefined,
        category: muralCategory,
        channel: muralChannel,
        status: 'producao',
        assignedTo: userProfile?.name || 'Designer Studio',
        assignedEmail: userProfile?.email || '',
        createdBy: userProfile?.name || 'Designer Studio',
        createdEmail: userProfile?.email || '',
        briefing: `Criativo desenvolvido diretamente no Studio Canva integrado do AgencyOS.\n\nFormato: ${canvasWidth}x${canvasHeight}px.`,
        copyText: muralCopy || '',
        imageUrl: dataUrl,
        images: [dataUrl],
        version: 1,
        dimensions: `${canvasWidth}x${canvasHeight}`,
        approved: false,
        postStatus: 'nao_postado',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      showToast(`Arte "${projectTitle}" inserida no Mural de Criativos com sucesso!`);
      setIsSaveToMuralModalOpen(false);
    } catch (e) {
      console.error(e);
      showToast('Erro ao salvar no Mural de Criativos.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[700px] w-full bg-[#090a0f] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* 1. TOP HEADER NAVIGATION BAR */}
      <div className="h-16 bg-[#0c0d14] border-b border-neutral-800 px-4 flex items-center justify-between gap-3 shrink-0 z-30 select-none">
        {/* Left: Brand, Project Title & Dimension Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 rounded-xl text-white font-black text-xs shadow-md">
            <Palette className="w-4 h-4" />
            <span>STUDIO CANVA</span>
          </div>

          {/* Editable Title */}
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-700/60 focus:border-blue-500 text-white font-bold text-xs rounded-xl px-3 py-1.5 w-56 focus:outline-none transition-all"
            placeholder="Nome do seu design..."
          />

          {/* Preset Dimensions Dropdown */}
          <div className="relative">
            <select
              value={canvasPresetId}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-neutral-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {CANVAS_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} ({preset.width}x{preset.height})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Undo / Redo / Zoom / Grid */}
        <div className="flex items-center gap-2">
          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-300 cursor-pointer"
            title="Desfazer (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>

          {/* Redo */}
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-300 cursor-pointer"
            title="Refazer (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-neutral-800 mx-1" />

          {/* Zoom In / Out */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-0.5">
            <button
              onClick={() => setZoom((prev) => Math.max(20, prev - 10))}
              className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-white px-2">{zoom}%</span>
            <button
              onClick={() => setZoom((prev) => Math.min(150, prev + 10))}
              className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-xl border cursor-pointer ${
              showGrid
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Grade de Alinhamento"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Save Library, Save to Mural, Download */}
        <div className="flex items-center gap-2">
          {/* Clear Canvas */}
          <button
            onClick={handleClearCanvas}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 border border-neutral-800 cursor-pointer transition-all"
            title="Limpar Canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Save Project locally */}
          <button
            onClick={handleSaveToProjectLibrary}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            title="Salvar na Biblioteca"
          >
            <Save className="w-4 h-4 text-neutral-400" />
            <span className="hidden lg:inline">Salvar Projeto</span>
          </button>

          {/* Save to Creative Board (Mural de Criativos) */}
          <button
            onClick={() => setIsSaveToMuralModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-600/20"
          >
            <Send className="w-4 h-4" />
            <span>Mural de Criativos</span>
          </button>

          {/* Export / Download PNG/JPG */}
          <div className="relative">
            <button
              onClick={() => setIsExportModalOpen(!isExportModalOpen)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-xs flex items-center gap-2 cursor-pointer transition-all shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Baixar / Exportar</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Export Dropdown */}
            {isExportModalOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-56 bg-[#181922] border border-neutral-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1"
                onMouseLeave={() => setIsExportModalOpen(false)}
              >
                <div className="text-[10px] font-black text-neutral-400 uppercase tracking-wider px-2.5 py-1">
                  Formatos de Exportação HD
                </div>

                <button
                  onClick={() => handleDownloadFile('png')}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-blue-400" />
                    <span>Baixar PNG (Alta Resolução)</span>
                  </div>
                </button>

                <button
                  onClick={() => handleDownloadFile('jpeg')}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-emerald-400" />
                    <span>Baixar JPG (Leve & Rápido)</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. CONTEXTUAL TOOLBAR */}
      <CanvaToolbar
        selectedElement={elements.find((e) => e.id === selectedId) || null}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        background={background}
        onChangeBackground={handleChangeBackground}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={handleDeleteElement}
        onDuplicateElement={handleDuplicateElement}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        onAlignElement={handleAlignElement}
      />

      {/* 3. MAIN WORKSPACE: SIDEBAR + INTERACTIVE CANVAS */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Canva Left Sidebar Tools */}
        <CanvaSidebar
          onApplyTemplate={handleApplyTemplate}
          onAddElement={handleAddElement}
          background={background}
          onChangeBackground={handleChangeBackground}
          isDrawingMode={isDrawingMode}
          setIsDrawingMode={setIsDrawingMode}
          brushColor={brushColor}
          setBrushColor={setBrushColor}
          brushWidth={brushWidth}
          setBrushWidth={setBrushWidth}
          savedProjects={savedProjects}
          onLoadSavedProject={handleLoadSavedProject}
          onDeleteSavedProject={handleDeleteSavedProject}
          elements={elements}
          selectedId={selectedId}
          onSelectElement={setSelectedId}
          onBringForward={handleBringForward}
          onSendBackward={handleSendBackward}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
          onReorderLayers={handleReorderLayers}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
        />

        {/* Central Canvas Viewport */}
        <div className="flex-1 bg-[#0b0c12] relative overflow-auto flex items-center justify-center">
          <CanvaCanvas
            width={canvasWidth}
            height={canvasHeight}
            zoom={zoom}
            background={background}
            elements={elements}
            selectedId={selectedId}
            onSelectElement={setSelectedId}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
            onBringForward={handleBringForward}
            onSendBackward={handleSendBackward}
            onBringToFront={handleBringToFront}
            onSendToBack={handleSendToBack}
            isDrawingMode={isDrawingMode}
            brushColor={brushColor}
            brushWidth={brushWidth}
            onAddBrushElement={handleAddElement}
            showGrid={showGrid}
          />
        </div>
      </div>

      {/* MODAL: Salvar no Mural de Criativos da Agência */}
      {isSaveToMuralModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-neutral-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Send className="w-5 h-5" />
                <span>Salvar no Mural de Criativos (AgencyOS)</span>
              </div>
              <button
                onClick={() => setIsSaveToMuralModalOpen(false)}
                className="text-neutral-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Esta arte será renderizada em alta resolução e enviada diretamente para a esteira
              do mural do designer para aprovação e agendamento.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Título da Arte:
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Cliente / Empresa:
                  </label>
                  <input
                    type="text"
                    value={muralClientName}
                    onChange={(e) => setMuralClientName(e.target.value)}
                    placeholder="Nome do cliente"
                    className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">
                    Pasta da Empresa:
                  </label>
                  <select
                    value={muralFolderId}
                    onChange={(e) => setMuralFolderId(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">Sem pasta específica</option>
                    {designFolders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.clientName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Canal:</label>
                  <select
                    value={muralChannel}
                    onChange={(e) => setMuralChannel(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Instagram Feed">Instagram Feed</option>
                    <option value="Instagram Stories">Instagram Stories</option>
                    <option value="Carrossel">Carrossel</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google Display">Google Display</option>
                    <option value="Banner Web">Banner Web</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1">Categoria:</label>
                  <select
                    value={muralCategory}
                    onChange={(e) => setMuralCategory(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Anúncios / Tráfego">Anúncios / Tráfego</option>
                    <option value="Empresa / Cliente">Empresa / Cliente</option>
                    <option value="Branding">Branding</option>
                    <option value="Eventos">Eventos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Legenda / Copy / Observações:
                </label>
                <textarea
                  value={muralCopy}
                  onChange={(e) => setMuralCopy(e.target.value)}
                  rows={3}
                  placeholder="Escreva a legenda do post ou detalhes para a equipe..."
                  className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsSaveToMuralModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={handleSaveToMural}
                disabled={isExporting}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {isExporting ? (
                  <span>Processando e Salvando...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Confirmar e Enviar para o Mural</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

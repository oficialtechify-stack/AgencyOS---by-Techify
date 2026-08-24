import React, { useState } from 'react';
import {
  LayoutTemplate,
  Shapes,
  Type,
  Image as ImageIcon,
  Upload,
  Paintbrush,
  Sparkles,
  FolderHeart,
  Search,
  Plus,
  Flame,
  Check,
  Zap,
  Star,
  ExternalLink,
  Trash2,
  Layers,
  ChevronsUp,
  ChevronsDown,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Blend,
  Sliders,
  Square,
  Smile,
} from 'lucide-react';
import {
  CanvasTemplate,
  CanvasElement,
  CanvasBackground,
  TextElement,
  ShapeElement,
  ImageElement,
  StickerElement,
  SavedCanvaProject,
  BlendModeType,
} from './types';
import { CANVA_TEMPLATES } from './templates';
import {
  STOCK_PHOTOS,
  BADGE_STICKERS,
  SOCIAL_ICONS,
  TYPOGRAPHY_PRESETS,
  COLOR_PALETTES,
  GRADIENT_PRESETS,
} from './stockAssets';

interface CanvaSidebarProps {
  onApplyTemplate: (template: CanvasTemplate) => void;
  onAddElement: (element: CanvasElement) => void;
  background: CanvasBackground;
  onChangeBackground: (bg: CanvasBackground) => void;
  isDrawingMode: boolean;
  setIsDrawingMode: (active: boolean) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushWidth: number;
  setBrushWidth: (w: number) => void;
  savedProjects: SavedCanvaProject[];
  onLoadSavedProject: (project: SavedCanvaProject) => void;
  onDeleteSavedProject: (id: string) => void;
  elements?: CanvasElement[];
  selectedId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onBringForward?: (id: string) => void;
  onSendBackward?: (id: string) => void;
  onBringToFront?: (id: string) => void;
  onSendToBack?: (id: string) => void;
  onReorderLayers?: (orderedIds: string[]) => void;
  onUpdateElement?: (id: string, partial: Partial<CanvasElement>) => void;
  onDeleteElement?: (id: string) => void;
}

type TabType =
  | 'templates'
  | 'elements'
  | 'text'
  | 'photos'
  | 'layers'
  | 'background'
  | 'draw'
  | 'ai'
  | 'projects';

export const CanvaSidebar: React.FC<CanvaSidebarProps> = ({
  onApplyTemplate,
  onAddElement,
  background,
  onChangeBackground,
  isDrawingMode,
  setIsDrawingMode,
  brushColor,
  setBrushColor,
  brushWidth,
  setBrushWidth,
  savedProjects,
  onLoadSavedProject,
  onDeleteSavedProject,
  elements = [],
  selectedId = null,
  onSelectElement,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onReorderLayers,
  onUpdateElement,
  onDeleteElement,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [templateCategory, setTemplateCategory] = useState<string>('todos');
  const [photoCategory, setPhotoCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI Generator state
  const [aiNiche, setAiNiche] = useState('Agência de Marketing & Tráfego');
  const [aiGoal, setAiGoal] = useState('Venda Direta / Promoção');
  const [generatedHeadlines, setGeneratedHeadlines] = useState<string[]>([
    'COMO ESCALAR SEUS RESULTADOS EM 30 DIAS',
    'PARE DE PERDER DINHEIRO COM ANÚNCIOS ERRADOS',
    'O MÉTODO COMPROVADO PARA ATRAIR CLIENTES QUALIFICADOS',
    'ÚLTIMAS HORAS COM 50% DE DESCONTO EXCLUSIVO',
  ]);

  // Handle File Upload from Computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        const newImg: ImageElement = {
          id: `img-upload-${Date.now()}`,
          type: 'image',
          src: base64,
          x: 100,
          y: 100,
          width: 500,
          height: 500,
          rotation: 0,
          opacity: 1,
          locked: false,
          zIndex: 10,
          borderRadius: 16,
        };
        onAddElement(newImg);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleGenerateHeadlines = () => {
    const prompts: Record<string, string[]> = {
      'Agência de Marketing & Tráfego': [
        'COMO GERAR LEADS TODOS OS DIAS NO AUTOMÁTICO',
        'O SEGREDO DO ROAS 5X REVELADO',
        'ESTRATÉGIAS AVANÇADAS DE TRÁFEGO PARA 2026',
        'PARE DE RASGAR DINHEIRO COM ANÚNCIOS',
      ],
      'Infoprodutos & Cursos': [
        'DO ZERO AO PRIMEIRO LANÇAMENTO DE 6 DÍGITOS',
        'O PASSO A PASSO PARA VIVER DO DIGITAL',
        'APRENDA A CRIAR PRODUTOS DIGITAIS IRRESISTÍVEIS',
        'VAGAS LIMITADAS PARA A NOVA TURMA',
      ],
      'E-commerce & Lojas': [
        'OFERTA RELÂMPAGO: 50% OFF EM TODO O SITE',
        'FRETE GRÁTIS PARA TODO O BRASIL HOJE',
        'OS PRODUTOS MAIS VENDIDOS DA SEMANA',
        'GARANTA O SEU ANTES QUE ACABE O ESTOQUE',
      ],
      'Imobiliário & Alto Padrão': [
        'VIVA NO ENDEREÇO MAIS COBIÇADO DA CIDADE',
        'OPORTUNIDADE ÚNICA DE INVESTIMENTO IMOBILIÁRIO',
        'APARTAMENTOS DE LUXO COM CONDIÇÕES EXCLUSIVAS',
        'O CONFORTO QUE SUA FAMÍLIA SEMPRE MERECIA',
      ],
      'Saúde, Estética & Odonto': [
        'RECONQUISTE SEU SORRISO DOS SONHOS',
        'TRANSFORMAÇÃO REAL: AGENDE SUA AVALIAÇÃO',
        'CUIDE DA SUA SAÚDE COM QUEM É REFERÊNCIA',
        'CONDIÇÃO ESPECIAL PARA NOVOS PACIENTES',
      ],
    };

    const list = prompts[aiNiche] || [
      'TRANSFORME SEUS RESULTADOS HOJE MESMO',
      'OFERTA EXCLUSIVA POR TEMPO LIMITADO',
      'DESCUBRA COMO MULTIPLICAR SUAS VENDAS',
    ];
    setGeneratedHeadlines(list);
  };

  const categories = [
    { id: 'todos', name: 'Todos os Modelos' },
    { id: 'Vendas & Promoções', name: 'Vendas & Promoções' },
    { id: 'Lançamentos & Aulas', name: 'Lançamentos & Aulas' },
    { id: 'Branding & Citações', name: 'Branding & Citações' },
    { id: 'Prova Social & Reviews', name: 'Prova Social' },
    { id: 'Stories & Reels', name: 'Stories & Reels' },
    { id: 'Tráfego & Anúncios', name: 'Tráfego & Anúncios' },
  ];

  const filteredTemplates = CANVA_TEMPLATES.filter((t) => {
    const matchesCategory = templateCategory === 'todos' || t.category === templateCategory;
    const matchesSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const photoCategories = [
    'todos',
    'Negócios & Corporativo',
    'Tecnologia & IA',
    'Luxo & Lifestyle',
    'Marketing & Vendas',
    'Texturas & Fundos',
    'Saúde & Fitness',
    'Gastronomia',
  ];

  const filteredPhotos = STOCK_PHOTOS.filter((p) => {
    const matchesCategory = photoCategory === 'todos' || p.category === photoCategory;
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex h-full bg-[#0d0e14] border-r border-neutral-800 select-none">
      {/* Primary Vertical Navigation Rail (Canva Style) */}
      <div className="w-18 bg-[#090a0f] border-r border-neutral-800/80 flex flex-col items-center py-4 gap-1.5 shrink-0 z-10">
        <button
          onClick={() => {
            setActiveTab('templates');
            setIsDrawingMode(false);
          }}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-neutral-800 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
          title="Modelos Prontos"
        >
          <LayoutTemplate className="w-5 h-5" />
          <span className="text-[9px] font-bold">Modelos</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('elements');
            setIsDrawingMode(false);
          }}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'elements'
              ? 'bg-neutral-800 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
          title="Formas & Elementos"
        >
          <Shapes className="w-5 h-5" />
          <span className="text-[9px] font-bold">Elementos</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('text');
            setIsDrawingMode(false);
          }}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'text'
              ? 'bg-neutral-800 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
          title="Textos & Tipografia"
        >
          <Type className="w-5 h-5" />
          <span className="text-[9px] font-bold">Texto</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('photos');
            setIsDrawingMode(false);
          }}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'photos'
              ? 'bg-neutral-800 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
          title="Fotos & Uploads"
        >
          <ImageIcon className="w-5 h-5" />
          <span className="text-[9px] font-bold">Fotos</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('layers');
            setIsDrawingMode(false);
          }}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer relative ${
            activeTab === 'layers'
              ? 'bg-neutral-800 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
          title="Camadas & Sobreposição"
        >
          <Layers className="w-5 h-5 text-blue-400" />
          <span className="text-[9px] font-bold">Camadas</span>
          {elements.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {elements.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('background');
            setIsDrawingMode(false);
          }}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'background'
              ? 'bg-neutral-800 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
          title="Fundos & Gradientes"
        >
          <Paintbrush className="w-5 h-5" />
          <span className="text-[9px] font-bold">Fundo</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('draw');
            setIsDrawingMode(true);
          }}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'draw'
              ? 'bg-neutral-800 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
          title="Desenho Livre / Pincel"
        >
          <Paintbrush className="w-5 h-5 text-amber-400" />
          <span className="text-[9px] font-bold">Desenhar</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('ai');
            setIsDrawingMode(false);
          }}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-neutral-800 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
          title="IA Headlines & Criatividade"
        >
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-[9px] font-bold">IA Textos</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('projects');
            setIsDrawingMode(false);
          }}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-neutral-800 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
          title="Minhas Artes Salvas"
        >
          <FolderHeart className="w-5 h-5 text-emerald-400" />
          <span className="text-[9px] font-bold">Minhas Artes</span>
        </button>
      </div>

      {/* Secondary Drawer Panel (Content of Selected Tool Tab) */}
      <div className="w-80 bg-[#12131a] flex flex-col h-full overflow-hidden">
        {/* TAB 1: MODELOS / TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto scrollbar-none space-y-4">
            <div>
              <h3 className="text-sm font-black text-white">Modelos Prontos</h3>
              <p className="text-[11px] text-neutral-400">
                Selecione um design completo para personalizar.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setTemplateCategory(c.id)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                    templateCategory === c.id
                      ? 'bg-white text-black'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Template Cards Grid */}
            <div className="space-y-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => onApplyTemplate(template)}
                  className="group relative bg-[#181a24] hover:bg-[#202330] border border-neutral-800 hover:border-neutral-600 rounded-2xl p-3.5 cursor-pointer transition-all shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-blue-400">
                      {template.name}
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400">
                      {template.width}×{template.height}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    {template.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-500 font-semibold">
                    <span>{template.elements.length} camadas incluídas</span>
                    <span className="text-blue-400 font-bold group-hover:underline flex items-center gap-1">
                      Carregar no Canvas ➔
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ELEMENTOS & FORMAS */}
        {activeTab === 'elements' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto scrollbar-none space-y-5">
            <div>
              <h3 className="text-sm font-black text-white">Elementos & Formas</h3>
              <p className="text-[11px] text-neutral-400">
                Formas geométricas, selos, adesivos e ícones.
              </p>
            </div>

            {/* Basic Shapes */}
            <div>
              <div className="text-[11px] font-black uppercase text-neutral-400 tracking-wider mb-2">
                Formas Geométricas
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() =>
                    onAddElement({
                      id: `shape-${Date.now()}`,
                      type: 'shape',
                      shapeType: 'rectangle',
                      x: 200,
                      y: 200,
                      width: 250,
                      height: 150,
                      rotation: 0,
                      opacity: 1,
                      locked: false,
                      zIndex: 10,
                      fillColor: '#ef4444',
                      strokeColor: 'transparent',
                      strokeWidth: 0,
                    })
                  }
                  className="bg-neutral-800 hover:bg-neutral-700 p-3 rounded-xl flex flex-col items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-white"
                >
                  <div className="w-8 h-6 bg-red-500 rounded-xs" />
                  <span className="text-[10px] font-bold">Retângulo</span>
                </button>

                <button
                  onClick={() =>
                    onAddElement({
                      id: `shape-${Date.now()}`,
                      type: 'shape',
                      shapeType: 'rounded-rect',
                      x: 200,
                      y: 200,
                      width: 250,
                      height: 150,
                      rotation: 0,
                      opacity: 1,
                      locked: false,
                      zIndex: 10,
                      fillColor: '#3b82f6',
                      strokeColor: 'transparent',
                      strokeWidth: 0,
                      borderRadius: 24,
                    })
                  }
                  className="bg-neutral-800 hover:bg-neutral-700 p-3 rounded-xl flex flex-col items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-white"
                >
                  <div className="w-8 h-6 bg-blue-500 rounded-lg" />
                  <span className="text-[10px] font-bold">Arredondado</span>
                </button>

                <button
                  onClick={() =>
                    onAddElement({
                      id: `shape-${Date.now()}`,
                      type: 'shape',
                      shapeType: 'circle',
                      x: 200,
                      y: 200,
                      width: 200,
                      height: 200,
                      rotation: 0,
                      opacity: 1,
                      locked: false,
                      zIndex: 10,
                      fillColor: '#10b981',
                      strokeColor: 'transparent',
                      strokeWidth: 0,
                    })
                  }
                  className="bg-neutral-800 hover:bg-neutral-700 p-3 rounded-xl flex flex-col items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-white"
                >
                  <div className="w-7 h-7 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] font-bold">Círculo</span>
                </button>

                <button
                  onClick={() =>
                    onAddElement({
                      id: `shape-${Date.now()}`,
                      type: 'shape',
                      shapeType: 'triangle',
                      x: 200,
                      y: 200,
                      width: 200,
                      height: 200,
                      rotation: 0,
                      opacity: 1,
                      locked: false,
                      zIndex: 10,
                      fillColor: '#f59e0b',
                      strokeColor: 'transparent',
                      strokeWidth: 0,
                    })
                  }
                  className="bg-neutral-800 hover:bg-neutral-700 p-3 rounded-xl flex flex-col items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-white"
                >
                  <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[24px] border-b-amber-500" />
                  <span className="text-[10px] font-bold">Triângulo</span>
                </button>

                <button
                  onClick={() =>
                    onAddElement({
                      id: `shape-${Date.now()}`,
                      type: 'shape',
                      shapeType: 'star',
                      x: 200,
                      y: 200,
                      width: 180,
                      height: 180,
                      rotation: 0,
                      opacity: 1,
                      locked: false,
                      zIndex: 10,
                      fillColor: '#eab308',
                      strokeColor: 'transparent',
                      strokeWidth: 0,
                    })
                  }
                  className="bg-neutral-800 hover:bg-neutral-700 p-3 rounded-xl flex flex-col items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-white"
                >
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-bold">Estrela</span>
                </button>

                <button
                  onClick={() =>
                    onAddElement({
                      id: `shape-${Date.now()}`,
                      type: 'shape',
                      shapeType: 'arrow',
                      x: 200,
                      y: 200,
                      width: 250,
                      height: 100,
                      rotation: 0,
                      opacity: 1,
                      locked: false,
                      zIndex: 10,
                      fillColor: '#ffffff',
                      strokeColor: 'transparent',
                      strokeWidth: 0,
                    })
                  }
                  className="bg-neutral-800 hover:bg-neutral-700 p-3 rounded-xl flex flex-col items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-white"
                >
                  <div className="text-white text-lg font-bold">➔</div>
                  <span className="text-[10px] font-bold">Seta CTA</span>
                </button>
              </div>
            </div>

            {/* Badges & Promotional Stickers */}
            <div>
              <div className="text-[11px] font-black uppercase text-neutral-400 tracking-wider mb-2">
                Selos Promocionais & Badges
              </div>
              <div className="grid grid-cols-2 gap-2">
                {BADGE_STICKERS.map((b) => (
                  <button
                    key={b.id}
                    onClick={() =>
                      onAddElement({
                        id: `sticker-${Date.now()}`,
                        type: 'sticker',
                        stickerType: 'badge',
                        content: b.text,
                        badgeText: b.text,
                        fillColor: b.bgColor,
                        textColor: b.textColor,
                        x: 200,
                        y: 200,
                        width: 260,
                        height: 60,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        zIndex: 15,
                      })
                    }
                    className="p-3 rounded-xl border border-neutral-700 hover:scale-105 transition-all text-xs font-black cursor-pointer shadow-md text-center"
                    style={{ backgroundColor: b.bgColor, color: b.textColor }}
                  >
                    {b.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Icons */}
            <div>
              <div className="text-[11px] font-black uppercase text-neutral-400 tracking-wider mb-2">
                Ícones & Emojis Gráficos
              </div>
              <div className="grid grid-cols-4 gap-2">
                {SOCIAL_ICONS.map((icon) => (
                  <button
                    key={icon.id}
                    onClick={() =>
                      onAddElement({
                        id: `icon-${Date.now()}`,
                        type: 'text',
                        text: icon.emoji,
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: 64,
                        fontWeight: 'bold',
                        fontStyle: 'normal',
                        textAlign: 'center',
                        color: '#ffffff',
                        x: 250,
                        y: 250,
                        width: 120,
                        height: 120,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        zIndex: 15,
                        lineHeight: 1,
                        letterSpacing: 0,
                      })
                    }
                    className="bg-neutral-800 hover:bg-neutral-700 p-2.5 rounded-xl flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <span className="text-2xl">{icon.emoji}</span>
                    <span className="text-[9px] text-neutral-400 font-semibold truncate w-full text-center">
                      {icon.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TEXTO & TIPOGRAFIA */}
        {activeTab === 'text' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto scrollbar-none space-y-5">
            <div>
              <h3 className="text-sm font-black text-white">Adicionar Texto</h3>
              <p className="text-[11px] text-neutral-400">
                Inserir títulos, subtítulos e combinações tipográficas.
              </p>
            </div>

            {/* Standard Text Buttons */}
            <div className="space-y-2">
              <button
                onClick={() =>
                  onAddElement({
                    id: `text-h1-${Date.now()}`,
                    type: 'text',
                    text: 'SEU TÍTULO PRINCIPAL',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 64,
                    fontWeight: '900',
                    fontStyle: 'normal',
                    textAlign: 'center',
                    color: '#ffffff',
                    x: 100,
                    y: 200,
                    width: 800,
                    height: 120,
                    rotation: 0,
                    opacity: 1,
                    locked: false,
                    zIndex: 20,
                    lineHeight: 1.1,
                    letterSpacing: 0,
                  })
                }
                className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl p-3 text-left cursor-pointer transition-all"
              >
                <div className="text-lg font-black text-white">Inserir Título Principal</div>
                <div className="text-[11px] text-neutral-400">H1 • Grande & Forte</div>
              </button>

              <button
                onClick={() =>
                  onAddElement({
                    id: `text-h2-${Date.now()}`,
                    type: 'text',
                    text: 'Subtítulo complementar explicativo',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 36,
                    fontWeight: '700',
                    fontStyle: 'normal',
                    textAlign: 'center',
                    color: '#38bdf8',
                    x: 140,
                    y: 340,
                    width: 700,
                    height: 80,
                    rotation: 0,
                    opacity: 1,
                    locked: false,
                    zIndex: 20,
                    lineHeight: 1.2,
                    letterSpacing: 0,
                  })
                }
                className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl p-3 text-left cursor-pointer transition-all"
              >
                <div className="text-sm font-bold text-white">Inserir Subtítulo</div>
                <div className="text-[11px] text-neutral-400">H2 • Médio & Destaque</div>
              </button>

              <button
                onClick={() =>
                  onAddElement({
                    id: `text-body-${Date.now()}`,
                    type: 'text',
                    text: 'Texto de apoio com informações detalhadas sobre a oferta ou conteúdo da postagem.',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 22,
                    fontWeight: '400',
                    fontStyle: 'normal',
                    textAlign: 'center',
                    color: '#e2e8f0',
                    x: 180,
                    y: 440,
                    width: 650,
                    height: 100,
                    rotation: 0,
                    opacity: 1,
                    locked: false,
                    zIndex: 20,
                    lineHeight: 1.5,
                    letterSpacing: 0,
                  })
                }
                className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl p-3 text-left cursor-pointer transition-all"
              >
                <div className="text-xs font-normal text-white">Inserir Texto de Corpo</div>
                <div className="text-[11px] text-neutral-400">Parágrafo • Leitura Fácil</div>
              </button>
            </div>

            {/* Typography Presets */}
            <div>
              <div className="text-[11px] font-black uppercase text-neutral-400 tracking-wider mb-2">
                Estilos Tipográficos Prontos
              </div>
              <div className="space-y-2">
                {TYPOGRAPHY_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() =>
                      onAddElement({
                        id: `type-preset-${Date.now()}`,
                        type: 'text',
                        text: preset.title,
                        fontFamily: preset.font,
                        fontSize: preset.size,
                        fontWeight: preset.weight,
                        fontStyle: (preset.fontStyle as any) || 'normal',
                        textAlign: 'center',
                        color: preset.color,
                        x: 100,
                        y: 250,
                        width: 750,
                        height: 140,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        zIndex: 20,
                        lineHeight: 1.1,
                        letterSpacing: preset.letterSpacing || 0,
                        shadowColor: preset.shadowColor,
                        shadowBlur: preset.shadowBlur,
                        backgroundColor: preset.bg,
                        backgroundPadding: preset.bgPadding,
                        backgroundRadius: preset.bgRadius,
                      })
                    }
                    className="bg-[#181a24] hover:bg-[#202330] border border-neutral-800 hover:border-neutral-600 rounded-xl p-3 cursor-pointer transition-all"
                  >
                    <div className="text-xs text-neutral-400 font-bold mb-1">{preset.name}</div>
                    <div
                      style={{
                        fontFamily: preset.font,
                        color: preset.color,
                        fontWeight: preset.weight,
                      }}
                      className="text-sm truncate"
                    >
                      {preset.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FOTOS & UPLOADS */}
        {activeTab === 'photos' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto scrollbar-none space-y-4">
            <div>
              <h3 className="text-sm font-black text-white">Fotos & Uploads</h3>
              <p className="text-[11px] text-neutral-400">
                Faça upload do seu dispositivo ou use o banco de imagens HD.
              </p>
            </div>

            {/* Upload Button */}
            <label className="w-full bg-neutral-800 hover:bg-neutral-700 border-2 border-dashed border-neutral-600 hover:border-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
              <Upload className="w-6 h-6 text-neutral-300" />
              <span className="text-xs font-bold text-white">Fazer Upload de Imagem</span>
              <span className="text-[10px] text-neutral-400">PNG, JPG, WEBP até 15MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {photoCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => setPhotoCategory(c)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                    photoCategory === c
                      ? 'bg-white text-black'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {c === 'todos' ? 'Todas as Fotos' : c}
                </button>
              ))}
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-2 gap-2">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() =>
                    onAddElement({
                      id: `photo-${Date.now()}`,
                      type: 'image',
                      src: photo.full,
                      alt: photo.title,
                      x: 150,
                      y: 150,
                      width: 500,
                      height: 500,
                      rotation: 0,
                      opacity: 1,
                      locked: false,
                      zIndex: 10,
                      borderRadius: 20,
                    })
                  }
                  className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-neutral-800 hover:border-blue-500 transition-all shadow-md"
                >
                  <img
                    src={photo.thumb}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] font-bold text-white leading-tight">
                      {photo.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: CAMADAS & SOBREPOSIÇÃO */}
        {activeTab === 'layers' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto scrollbar-none space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>Camadas & Sobreposição</span>
                </h3>
                <span className="text-[10px] font-bold bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full">
                  {elements.length} {elements.length === 1 ? 'camada' : 'camadas'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Organize a ordem de sobreposição (frente/fundo), modos de mesclagem e visibilidade.
              </p>
            </div>

            {/* Helper Tip Card */}
            <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-2.5 text-[11px] text-blue-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-300">Dica de Sobreposição:</span> A camada no topo da lista fica acima das outras. Use <strong>Sobrepor / Blend</strong> para fundir fotos e sombras harmonicamente!
              </div>
            </div>

            {elements.length === 0 ? (
              <div className="text-center py-10 px-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
                <Layers className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-neutral-300">Nenhuma camada no canvas</p>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Adicione fotos, textos ou formas para começar a sobrepor elementos.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Render layers in reverse zIndex order: Highest zIndex at the top */}
                {[...elements]
                  .sort((a, b) => b.zIndex - a.zIndex)
                  .map((el, index) => {
                    const isSelected = el.id === selectedId;

                    return (
                      <div
                        key={el.id}
                        onClick={() => onSelectElement && onSelectElement(el.id)}
                        className={`group relative rounded-xl border p-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1e2235] border-blue-500 shadow-md ring-1 ring-blue-500/50'
                            : 'bg-[#161722] border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          {/* Layer Icon & Label */}
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                              {el.type === 'text' && <Type className="w-3.5 h-3.5 text-blue-400" />}
                              {el.type === 'image' && (
                                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                              {el.type === 'shape' && (
                                <Square className="w-3.5 h-3.5 text-amber-400" />
                              )}
                              {el.type === 'sticker' && (
                                <Smile className="w-3.5 h-3.5 text-purple-400" />
                              )}
                              {el.type === 'brush' && (
                                <Paintbrush className="w-3.5 h-3.5 text-pink-400" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                <span>
                                  {el.name ||
                                    (el.type === 'text'
                                      ? `Texto: "${(el as TextElement).text.slice(0, 14)}..."`
                                      : el.type === 'image'
                                      ? 'Imagem'
                                      : el.type === 'shape'
                                      ? `Forma: ${(el as ShapeElement).shapeType}`
                                      : el.type === 'sticker'
                                      ? `Selo: ${(el as StickerElement).badgeText || 'Badge'}`
                                      : 'Desenho')}
                                </span>
                              </div>
                              <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                                <span>Camada #{el.zIndex}</span>
                                {el.blendMode && el.blendMode !== 'normal' && (
                                  <span className="bg-blue-600/30 text-blue-300 font-bold px-1.5 py-0.2 rounded text-[9px]">
                                    {el.blendMode}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Layer Controls: Move Up / Down */}
                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => onBringForward && onBringForward(el.id)}
                              disabled={index === 0}
                              className="p-1 hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent text-neutral-300 hover:text-white rounded cursor-pointer transition-colors"
                              title="Avançar 1 Camada (Subir)"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onSendBackward && onSendBackward(el.id)}
                              disabled={index === elements.length - 1}
                              className="p-1 hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent text-neutral-300 hover:text-white rounded cursor-pointer transition-colors"
                              title="Recuar 1 Camada (Descer)"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Visibility Toggle */}
                            <button
                              onClick={() =>
                                onUpdateElement && onUpdateElement(el.id, { hidden: !el.hidden })
                              }
                              className={`p-1 rounded cursor-pointer transition-colors ${
                                el.hidden
                                  ? 'text-neutral-500 hover:text-white bg-neutral-800'
                                  : 'text-neutral-400 hover:text-white'
                              }`}
                              title={el.hidden ? 'Mostrar Camada' : 'Ocultar Camada'}
                            >
                              {el.hidden ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Lock Toggle */}
                            <button
                              onClick={() =>
                                onUpdateElement && onUpdateElement(el.id, { locked: !el.locked })
                              }
                              className={`p-1 rounded cursor-pointer transition-colors ${
                                el.locked
                                  ? 'text-amber-400 bg-amber-400/10'
                                  : 'text-neutral-400 hover:text-white'
                              }`}
                              title={el.locked ? 'Desbloquear' : 'Bloquear'}
                            >
                              {el.locked ? (
                                <Lock className="w-3.5 h-3.5" />
                              ) : (
                                <Unlock className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => onDeleteElement && onDeleteElement(el.id)}
                              className="p-1 hover:bg-red-500/20 text-neutral-500 hover:text-red-400 rounded cursor-pointer transition-colors"
                              title="Excluir Camada"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Extended Controls if Selected */}
                        {isSelected && (
                          <div
                            className="mt-2.5 pt-2.5 border-t border-neutral-800/80 space-y-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Layer Reorder Fast Buttons */}
                            <div className="grid grid-cols-2 gap-1 text-[10px] font-bold">
                              <button
                                onClick={() => onBringToFront && onBringToFront(el.id)}
                                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-blue-300 rounded-lg flex items-center justify-center gap-1 cursor-pointer border border-neutral-800"
                              >
                                <ChevronsUp className="w-3 h-3" />
                                <span>Topo Máximo</span>
                              </button>
                              <button
                                onClick={() => onSendToBack && onSendToBack(el.id)}
                                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-purple-300 rounded-lg flex items-center justify-center gap-1 cursor-pointer border border-neutral-800"
                              >
                                <ChevronsDown className="w-3 h-3" />
                                <span>Fundo Total</span>
                              </button>
                            </div>

                            {/* Blend Mode Selector */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold text-neutral-400 flex items-center gap-1">
                                <Blend className="w-3 h-3 text-blue-400" />
                                Modo Sobrepor:
                              </span>
                              <select
                                value={el.blendMode || 'normal'}
                                onChange={(e) =>
                                  onUpdateElement &&
                                  onUpdateElement(el.id, {
                                    blendMode: e.target.value as BlendModeType,
                                  })
                                }
                                className="bg-neutral-900 border border-neutral-700 text-white rounded-lg px-2 py-1 text-[11px] font-semibold cursor-pointer outline-none focus:border-blue-500"
                              >
                                <option value="normal">Normal (Sem mesclar)</option>
                                <option value="multiply">Multiplicar (Escurecer)</option>
                                <option value="overlay">Sobrepor (Contraste)</option>
                                <option value="screen">Clarear / Screen</option>
                                <option value="soft-light">Luz Suave</option>
                                <option value="hard-light">Luz Direta</option>
                                <option value="difference">Diferença</option>
                              </select>
                            </div>

                            {/* Opacity Slider */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold text-neutral-400">
                                Opacidade: {Math.round((el.opacity ?? 1) * 100)}%
                              </span>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={el.opacity ?? 1}
                                onChange={(e) =>
                                  onUpdateElement &&
                                  onUpdateElement(el.id, { opacity: parseFloat(e.target.value) })
                                }
                                className="w-28 accent-blue-500 cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: FUNDOS & GRADIENTES */}
        {activeTab === 'background' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto scrollbar-none space-y-5">
            <div>
              <h3 className="text-sm font-black text-white">Fundos & Gradientes</h3>
              <p className="text-[11px] text-neutral-400">
                Personalize o fundo da arte com gradientes e cores.
              </p>
            </div>

            {/* Solid Colors */}
            <div>
              <div className="text-[11px] font-black uppercase text-neutral-400 tracking-wider mb-2">
                Cores Sólidas
              </div>
              <div className="grid grid-cols-5 gap-2">
                {COLOR_PALETTES.map((color) => (
                  <button
                    key={color}
                    onClick={() => onChangeBackground({ type: 'color', color })}
                    className="aspect-square rounded-xl border border-neutral-700 hover:scale-110 transition-transform cursor-pointer shadow-sm flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    {background.color === color && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Modern Gradients */}
            <div>
              <div className="text-[11px] font-black uppercase text-neutral-400 tracking-wider mb-2">
                Gradientes Modernos
              </div>
              <div className="space-y-2">
                {GRADIENT_PRESETS.map((grad) => (
                  <button
                    key={grad.name}
                    onClick={() =>
                      onChangeBackground({
                        type: 'gradient',
                        color: grad.colors[0],
                        gradient: {
                          type: 'linear',
                          colors: grad.colors,
                          angle: grad.angle,
                        },
                      })
                    }
                    className="w-full h-14 rounded-xl border border-neutral-700 hover:border-white p-3 flex items-center justify-between text-left cursor-pointer transition-all shadow-md"
                    style={{
                      background: `linear-gradient(${grad.angle}deg, ${grad.colors.join(', ')})`,
                    }}
                  >
                    <span className="text-xs font-black text-white drop-shadow">
                      {grad.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DESENHAR (BRUSH / PENCIL) */}
        {activeTab === 'draw' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto scrollbar-none space-y-5">
            <div>
              <h3 className="text-sm font-black text-white">Desenho Livre & Pincel</h3>
              <p className="text-[11px] text-neutral-400">
                Desenhe livremente sobre o canvas com o mouse ou caneta.
              </p>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 font-semibold">
              ✏️ Modo Desenho Ativo! Arraste o mouse sobre a tela para rabiscar, circular ou assinar.
            </div>

            {/* Brush Width Slider */}
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-400 font-bold mb-2">
                <span>Espessura do Traço:</span>
                <span className="text-white">{brushWidth}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={brushWidth}
                onChange={(e) => setBrushWidth(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            {/* Brush Color Picker */}
            <div>
              <div className="text-xs text-neutral-400 font-bold mb-2">Cor do Pincel:</div>
              <div className="grid grid-cols-5 gap-2">
                {COLOR_PALETTES.slice(0, 10).map((c) => (
                  <button
                    key={c}
                    onClick={() => setBrushColor(c)}
                    className="aspect-square rounded-xl border border-neutral-700 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center"
                    style={{ backgroundColor: c }}
                  >
                    {brushColor === c && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: IA HEADLINES & CRIATIVIDADE */}
        {activeTab === 'ai' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto scrollbar-none space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-purple-400">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-sm font-black text-white">IA Generator de Headlines</h3>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Gere chamadas matadoras de alta conversão para o seu criativo.
              </p>
            </div>

            {/* Niche Selector */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">
                Nicho / Mercado:
              </label>
              <select
                value={aiNiche}
                onChange={(e) => setAiNiche(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="Agência de Marketing & Tráfego">Agência & Tráfego Pago</option>
                <option value="Infoprodutos & Cursos">Infoprodutos & Cursos</option>
                <option value="E-commerce & Lojas">E-commerce & Varejo</option>
                <option value="Imobiliário & Alto Padrão">Imóveis & Alto Padrão</option>
                <option value="Saúde, Estética & Odonto">Saúde, Estética & Clínicas</option>
              </select>
            </div>

            <button
              onClick={handleGenerateHeadlines}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Gerar Novas Headlines</span>
            </button>

            {/* Generated List */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-black uppercase text-neutral-400 tracking-wider">
                Clique para Inserir na Arte:
              </div>
              {generatedHeadlines.map((head, idx) => (
                <div
                  key={idx}
                  onClick={() =>
                    onAddElement({
                      id: `ai-head-${Date.now()}-${idx}`,
                      type: 'text',
                      text: head,
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: 52,
                      fontWeight: '900',
                      fontStyle: 'normal',
                      textAlign: 'center',
                      color: '#ffffff',
                      x: 100,
                      y: 250,
                      width: 800,
                      height: 160,
                      rotation: 0,
                      opacity: 1,
                      locked: false,
                      zIndex: 25,
                      lineHeight: 1.05,
                      letterSpacing: -0.5,
                      shadowColor: '#a855f7',
                      shadowBlur: 20,
                    })
                  }
                  className="bg-[#181a24] hover:bg-purple-900/20 border border-neutral-800 hover:border-purple-500 rounded-xl p-3 cursor-pointer transition-all text-xs font-bold text-neutral-200 hover:text-white"
                >
                  {head}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: MINHAS ARTES SALVAS */}
        {activeTab === 'projects' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto scrollbar-none space-y-4">
            <div>
              <h3 className="text-sm font-black text-white">Minhas Artes Salvas</h3>
              <p className="text-[11px] text-neutral-400">
                Histórico de designs salvos neste estúdio.
              </p>
            </div>

            {savedProjects.length === 0 ? (
              <div className="text-center py-10 bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4">
                <FolderHeart className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                <div className="text-xs font-bold text-neutral-300">Nenhum projeto salvo</div>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Clique no botão "Salvar Projeto" no topo para arquivar suas criações.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedProjects.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#181a24] border border-neutral-800 hover:border-neutral-600 rounded-2xl p-3 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[170px]">
                        {p.title}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                        {p.width}×{p.height}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => onLoadSavedProject(p)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-[11px] font-bold cursor-pointer"
                      >
                        Abrir & Editar
                      </button>

                      <button
                        onClick={() => onDeleteSavedProject(p.id)}
                        className="p-1.5 text-neutral-500 hover:text-red-400 cursor-pointer"
                        title="Excluir Projeto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

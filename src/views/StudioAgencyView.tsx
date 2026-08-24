import React, { useState, useEffect, useMemo } from 'react';
import {
  Wand2,
  Sparkles,
  LayoutTemplate,
  FolderHeart,
  Palette,
  Bot,
  Printer,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  Search,
  Grid,
  List,
  SlidersHorizontal,
  Download,
  Share2,
  Trash2,
  Copy,
  FolderPlus,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layers,
  FileText,
  Image as ImageIcon,
  Video,
  Monitor,
  Smartphone,
  BookOpen,
  Calendar,
  Zap,
  Globe,
  Tag,
  Star,
  Eye,
  Edit3,
  Clock,
  Send,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  Check,
  X,
  Upload,
  ArrowRight,
  Flame,
  LayoutGrid,
  Type,
} from 'lucide-react';
import {
  CanvasElement,
  CanvasBackground,
  CanvasTemplate,
  SavedCanvaProject,
} from '../components/designer/canva/types';
import { CANVAS_PRESETS, STOCK_PHOTOS, COLOR_PALETTES } from '../components/designer/canva/stockAssets';
import { CANVA_TEMPLATES } from '../components/designer/canva/templates';
import { CanvaStudio } from '../components/designer/canva/CanvaStudio';
import { DesignProject, DesignFolder, ViewType } from '../types';
import { FirestoreUserProfile } from '../lib/firebase';

const SAVED_PROJECTS_KEY = 'agencyos_canva_projects_v1';
const BRAND_KITS_KEY = 'agencyos_canva_brand_kits_v1';
const PRINT_ORDERS_KEY = 'agencyos_canva_print_orders_v1';
const APPROVALS_KEY = 'agencyos_canva_approvals_v1';

export interface BrandKit {
  id: string;
  name: string;
  clientName: string;
  logos: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    subheading: string;
    body: string;
  };
  brandVoice: string;
  photos: string[];
  icons: string[];
}

export interface PrintProduct {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  badge?: string;
  minQty: number;
  basePrice: number;
  dimensions: string;
  paperType: string;
}

export interface DesignApproval {
  id: string;
  title: string;
  clientName: string;
  thumbnailUrl: string;
  status: 'pending' | 'approved' | 'changes_requested';
  requestedAt: string;
  reviewedAt?: string;
  feedback?: string;
  version: number;
}

interface StudioAgencyViewProps {
  userProfile?: FirestoreUserProfile | null;
  designProjects?: DesignProject[];
  designFolders?: DesignFolder[];
  onAddProject?: (project: Omit<DesignProject, 'id'>) => Promise<void>;
  onNavigate?: (view: ViewType) => void;
}

const PRINT_PRODUCTS_CATALOG: PrintProduct[] = [
  {
    id: 'cartao-visita',
    title: 'Cartões de Visita Premium',
    category: 'Papelaria Corporativa',
    description: 'Papel Couché 300g com laminação fosca e verniz localizado de alto brilho.',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    badge: 'Mais Vendido',
    minQty: 100,
    basePrice: 49.9,
    dimensions: '9 x 5 cm',
    paperType: 'Couché 300g Fosco',
  },
  {
    id: 'panfleto-vendas',
    title: 'Panfletos & Flyers Promocionais',
    category: 'Divulgação & Varejo',
    description: 'Impressão colorida frente e verso em alta definição para captação e promoções.',
    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop&q=80',
    badge: 'Essencial',
    minQty: 250,
    basePrice: 89.0,
    dimensions: '10 x 15 cm / 15 x 21 cm',
    paperType: 'Couché 115g Brilho',
  },
  {
    id: 'cartaz-a3',
    title: 'Cartazes & Posters A3/A2',
    category: 'Comunicação Visual',
    description: 'Cartazes para eventos, estabelecimentos comerciais e lançamentos de produtos.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&auto=format&fit=crop&q=80',
    minQty: 10,
    basePrice: 35.0,
    dimensions: '29.7 x 42 cm (A3)',
    paperType: 'Couché 170g',
  },
  {
    id: 'folder-triplo',
    title: 'Folders com Três Dobras',
    category: 'Apresentação Comercial',
    description: '6 páginas para apresentação de serviços, cardápios e portfólios corporativos.',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    minQty: 100,
    basePrice: 129.9,
    dimensions: '21 x 29.7 cm aberto',
    paperType: 'Couché 150g',
  },
  {
    id: 'adesivos-vinil',
    title: 'Adesivos & Rótulos em Vinil',
    category: 'Embalagens & Brindes',
    description: 'Corte especial personalizado com resistência à água e sol para marcas e embalagens.',
    image: 'https://images.unsplash.com/photo-1572945753563-804956783694?w=600&auto=format&fit=crop&q=80',
    badge: 'Resistente',
    minQty: 100,
    basePrice: 59.0,
    dimensions: 'Personalizado',
    paperType: 'Vinil Adesivo Brilho/Fosco',
  },
  {
    id: 'caneca-personalizada',
    title: 'Canecas Corporativas & Brindes',
    category: 'Brindes & Merch',
    description: 'Cerâmica premium com estampa colorida em sublimação sem desbotamento.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    minQty: 5,
    basePrice: 139.0,
    dimensions: '325ml',
    paperType: 'Cerâmica Resinada',
  },
];

const DEFAULT_BRAND_KITS: BrandKit[] = [
  {
    id: 'brand-agency-official',
    name: 'Kit Oficial da Agência',
    clientName: 'Minha Agência / AgencyOS',
    logos: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    ],
    colors: {
      primary: '#6366f1',
      secondary: '#ec4899',
      accent: '#22c55e',
      background: '#090a0f',
      text: '#ffffff',
    },
    fonts: {
      heading: 'Montserrat',
      subheading: 'Inter',
      body: 'Inter',
    },
    brandVoice: 'Inovador, premium, tecnológico e focado em resultados.',
    photos: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=80',
    ],
    icons: ['Sparkles', 'Wand2', 'ShieldCheck', 'TrendingUp'],
  },
  {
    id: 'brand-client-nexus',
    name: 'Nexus Tech Soluções',
    clientName: 'Nexus Tecnologia LTDA',
    logos: [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
    ],
    colors: {
      primary: '#0ea5e9',
      secondary: '#3b82f6',
      accent: '#f59e0b',
      background: '#0f172a',
      text: '#f8fafc',
    },
    fonts: {
      heading: 'Poppins',
      subheading: 'Roboto',
      body: 'Roboto',
    },
    brandVoice: 'Confiável, moderno, acessível e corporativo.',
    photos: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=80',
    ],
    icons: ['Cpu', 'Cloud', 'Lock', 'Zap'],
  },
];

export const StudioAgencyView: React.FC<StudioAgencyViewProps> = ({
  userProfile,
  designProjects = [],
  designFolders = [],
  onAddProject,
  onNavigate,
}) => {
  // Navigation inside Studio Agency
  const [activeTab, setActiveTab] = useState<
    'inicio' | 'projetos' | 'modelos' | 'marca' | 'canva-ia' | 'grafica' | 'aprovacoes' | 'mais'
  >('inicio');

  // Mode: Hub vs Full Editor
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [initialTemplateToLoad, setInitialTemplateToLoad] = useState<CanvasTemplate | null>(null);
  const [initialProjectToLoad, setInitialProjectToLoad] = useState<SavedCanvaProject | null>(null);

  // Quick Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createSearchQuery, setCreateSearchQuery] = useState('');
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);
  const [customUnit, setCustomUnit] = useState<'px' | 'mm' | 'cm'>('px');

  // Search & Filters in Hub
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryPill, setSelectedCategoryPill] = useState<string>('todos');
  const [projectFilterType, setProjectFilterType] = useState<string>('todos');
  const [projectSubNav, setProjectSubNav] = useState<'todos' | 'recentes' | 'pastas' | 'compartilhados' | 'lixeira'>('todos');
  const [projectViewMode, setProjectViewMode] = useState<'grid' | 'list'>('grid');

  // Saved Projects state
  const [savedProjects, setSavedProjects] = useState<SavedCanvaProject[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Brand Kits state
  const [brandKits, setBrandKits] = useState<BrandKit[]>(() => {
    try {
      const stored = localStorage.getItem(BRAND_KITS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_BRAND_KITS;
    } catch {
      return DEFAULT_BRAND_KITS;
    }
  });
  const [selectedBrandKitId, setSelectedBrandKitId] = useState<string>(DEFAULT_BRAND_KITS[0].id);
  const [isNewBrandKitModalOpen, setIsNewBrandKitModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandClient, setNewBrandClient] = useState('');
  const [newBrandUrl, setNewBrandUrl] = useState('');
  const [isExtractingBrand, setIsExtractingBrand] = useState(false);

  // Approvals state
  const [approvals, setApprovals] = useState<DesignApproval[]>(() => {
    try {
      const stored = localStorage.getItem(APPROVALS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'appr-1',
        title: 'Post Lançamento Curso Online',
        clientName: 'Alfa Marketing Digital',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
        status: 'pending',
        requestedAt: 'Há 2 horas',
        version: 1,
      },
      {
        id: 'appr-2',
        title: 'Banner Promocional Black Friday',
        clientName: 'Nexus Tech Soluções',
        thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80',
        status: 'approved',
        requestedAt: 'Ontem às 14:30',
        reviewedAt: 'Ontem às 16:45',
        version: 2,
      },
    ];
  });
  const [isNewApprovalModalOpen, setIsNewApprovalModalOpen] = useState(false);
  const [approvalTitle, setApprovalTitle] = useState('');
  const [approvalClient, setApprovalClient] = useState('');
  const [approvalSelectedProject, setApprovalSelectedProject] = useState<string>('');

  // Creative Print Order Modal state
  const [selectedPrintProduct, setSelectedPrintProduct] = useState<PrintProduct | null>(null);
  const [printQty, setPrintQty] = useState<number>(250);
  const [printPaper, setPrintPaper] = useState<string>('Couché 300g Fosco');
  const [printFinish, setPrintFinish] = useState<string>('Verniz Localizado');

  // AI Chat & Generator inside Hub
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiMode, setAiMode] = useState<'design' | 'imagem' | 'doc' | 'video'>('design');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load saved projects from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVED_PROJECTS_KEY);
      if (stored) {
        setSavedProjects(JSON.parse(stored));
      } else {
        // Seed with initial template previews
        const seedProjects: SavedCanvaProject[] = CANVA_TEMPLATES.slice(0, 4).map((t, idx) => ({
          id: `seed-proj-${idx}`,
          title: t.name,
          category: t.category,
          width: t.width,
          height: t.height,
          background: t.background,
          elements: t.elements,
          thumbnailUrl: t.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
          createdAt: new Date().toLocaleDateString('pt-BR'),
          updatedAt: 'Recente',
        }));
        setSavedProjects(seedProjects);
        localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(seedProjects));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save brand kits to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BRAND_KITS_KEY, JSON.stringify(brandKits));
    } catch {}
  }, [brandKits]);

  // Save approvals to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(APPROVALS_KEY, JSON.stringify(approvals));
    } catch {}
  }, [approvals]);

  // Open Editor with specific template
  const handleOpenTemplateInEditor = (template: CanvasTemplate) => {
    setInitialTemplateToLoad(template);
    setInitialProjectToLoad(null);
    setIsEditorOpen(true);
  };

  // Open Editor with specific saved project
  const handleOpenProjectInEditor = (project: SavedCanvaProject) => {
    setInitialProjectToLoad(project);
    setInitialTemplateToLoad(null);
    setIsEditorOpen(true);
  };

  // Open Editor with new blank canvas or preset
  const handleCreateNewDesign = (presetId?: string, customW?: number, customH?: number) => {
    setIsCreateModalOpen(false);
    let w = customW || 1080;
    let h = customH || 1080;
    let title = 'Design Sem Título';

    if (presetId) {
      const p = CANVAS_PRESETS.find((item) => item.id === presetId);
      if (p) {
        w = p.width;
        h = p.height;
        title = `${p.name} Sem Título`;
      }
    }

    const blankTemplate: CanvasTemplate = {
      id: `custom-${Date.now()}`,
      name: title,
      category: 'Personalizado',
      description: 'Canvas em branco',
      width: w,
      height: h,
      background: {
        type: 'color',
        color: '#ffffff',
      },
      elements: [],
    };

    setInitialTemplateToLoad(blankTemplate);
    setInitialProjectToLoad(null);
    setIsEditorOpen(true);
  };

  // Delete saved project
  const handleDeleteProject = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Deseja realmente excluir este design do Studio?')) return;
    const updated = savedProjects.filter((p) => p.id !== id);
    setSavedProjects(updated);
    localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(updated));
    showToast('Design excluído');
  };

  // Duplicate saved project
  const handleDuplicateProject = (project: SavedCanvaProject, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const duplicated: SavedCanvaProject = {
      ...project,
      id: `proj-${Date.now()}`,
      title: `${project.title} (Cópia)`,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      updatedAt: 'Agora mesmo',
    };
    const updated = [duplicated, ...savedProjects];
    setSavedProjects(updated);
    localStorage.setItem(SAVED_PROJECTS_KEY, JSON.stringify(updated));
    showToast(`Cópia "${duplicated.title}" criada!`);
  };

  // Brand Kit extraction simulation
  const handleExtractBrandFromUrl = () => {
    if (!newBrandUrl.trim()) {
      showToast('Digite a URL do site da empresa');
      return;
    }
    setIsExtractingBrand(true);
    setTimeout(() => {
      setIsExtractingBrand(false);
      const newKit: BrandKit = {
        id: `brand-${Date.now()}`,
        name: newBrandName || 'Marca Extraída',
        clientName: newBrandClient || newBrandUrl,
        logos: [
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        ],
        colors: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
          background: '#0f172a',
          text: '#ffffff',
        },
        fonts: {
          heading: 'Montserrat',
          subheading: 'Inter',
          body: 'Inter',
        },
        brandVoice: 'Profissional, dinâmico e contemporâneo.',
        photos: [
          'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80',
        ],
        icons: ['Sparkles', 'Check', 'Zap', 'Flame'],
      };
      setBrandKits((prev) => [newKit, ...prev]);
      setSelectedBrandKitId(newKit.id);
      setIsNewBrandKitModalOpen(false);
      setNewBrandName('');
      setNewBrandClient('');
      setNewBrandUrl('');
      showToast(`Kit de Marca para "${newKit.name}" gerado com sucesso!`);
    }, 1400);
  };

  // AI Image generation simulation
  const handleGenerateWithAI = () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    setTimeout(() => {
      setIsAiGenerating(false);
      // Pick dynamic stock photo based on prompt
      const photos = STOCK_PHOTOS;
      const randomPhoto = photos[Math.floor(Math.random() * photos.length)].full;
      setAiGeneratedImage(randomPhoto);
      showToast('✨ Imagem e conceito gerados com sucesso!');
    }, 1200);
  };

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return CANVA_TEMPLATES.filter((t) => {
      const matchSearch =
        searchQuery === '' ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategoryPill === 'todos' ||
        t.category.toLowerCase().includes(selectedCategoryPill.toLowerCase()) ||
        (selectedCategoryPill === 'instagram' && (t.width === 1080 && t.height === 1080)) ||
        (selectedCategoryPill === 'story' && (t.width === 1080 && t.height === 1920)) ||
        (selectedCategoryPill === 'apresentacao' && t.width === 1920);

      return matchSearch && matchCategory;
    });
  }, [searchQuery, selectedCategoryPill]);

  // If Full Editor is Open, render CanvaStudio in 100% full screen
  if (isEditorOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0e1017] flex flex-col overflow-hidden text-gray-100 font-sans">
        <CanvaStudio
          userProfile={userProfile}
          designFolders={designFolders}
          onAddProject={onAddProject}
          showToast={showToast}
          onClose={() => {
            setIsEditorOpen(false);
            // Refresh saved projects from localStorage
            try {
              const stored = localStorage.getItem(SAVED_PROJECTS_KEY);
              if (stored) setSavedProjects(JSON.parse(stored));
            } catch {}
          }}
        />
      </div>
    );
  }

  const currentBrandKit = brandKits.find((b) => b.id === selectedBrandKitId) || brandKits[0];

  return (
    <div className="w-full h-full flex flex-col bg-[#090a0f] text-gray-100 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-neutral-900 border border-neutral-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-medium">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Studio Agency Layout: Left Sub-Navigation + Content */}
      <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
        {/* Left Sub-Navigation Rail (Canva Style) */}
        <aside className="w-64 bg-[#0d0e14] border-r border-neutral-800/80 flex flex-col shrink-0 select-none py-4 px-3">
          {/* Top Brand & Create Button */}
          <div className="px-2 pb-4 border-b border-neutral-800/60 mb-3">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 font-black text-sm">
                <Wand2 className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  Studio Agency
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black tracking-wider uppercase">
                    PRO
                  </span>
                </h1>
                <p className="text-[11px] text-neutral-400">Design Studio & IA</p>
              </div>
            </div>

            {/* Main Create Action Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Criar um design</span>
            </button>
          </div>

          {/* Sub Navigation Items (Canva 1:1) */}
          <nav className="flex-1 space-y-1 text-sm font-medium overflow-y-auto pr-1">
            {[
              { id: 'inicio', label: 'Início', icon: LayoutGrid },
              { id: 'projetos', label: 'Projetos', icon: FolderHeart, count: savedProjects.length },
              { id: 'modelos', label: 'Modelos', icon: LayoutTemplate },
              { id: 'marca', label: 'Kit de Marca', icon: Palette },
              { id: 'canva-ia', label: 'Canva IA & Mágico', icon: Bot, isNew: true },
              { id: 'grafica', label: 'Gráfica Criativa', icon: Printer },
              { id: 'aprovacoes', label: 'Aprovações', icon: CheckCircle2, count: approvals.filter((a) => a.status === 'pending').length },
              { id: 'mais', label: 'Mais Ferramentas', icon: MoreHorizontal },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-purple-600/15 text-purple-400 font-semibold border border-purple-500/20'
                      : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-bold">
                      {item.count}
                    </span>
                  )}
                  {item.isNew && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black tracking-wider">
                      IA
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Help & Status */}
          <div className="pt-4 border-t border-neutral-800/60 mt-auto px-2">
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Studio Integrado</span>
              </div>
              <p className="text-[11px] leading-relaxed text-neutral-400">
                Designs salvos sincronizam com o mural de criativos da agência.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto min-h-0 bg-[#090a0f] p-6 lg:p-8 space-y-8">
          {/* ========================================================================= */}
          {/* TAB 1: INÍCIO (CANVA HOME SCREENSHOT 1) */}
          {/* ========================================================================= */}
          {activeTab === 'inicio' && (
            <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
              {/* Canva Top Vibrant Banner "Bora fazer bonito?" */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-pink-600 p-8 sm:p-10 shadow-2xl text-white">
                <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 max-w-3xl space-y-4">
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                    Bora fazer bonito?
                  </h2>
                  <p className="text-white/90 text-sm sm:text-base font-medium">
                    Crie posts para redes sociais, apresentações, panfletos, identidades visuais e muito mais com ferramentas profissionais de design e IA.
                  </p>

                  {/* Search Bar inside Banner */}
                  <div className="pt-2">
                    <div className="relative flex items-center bg-white text-gray-900 rounded-2xl shadow-xl p-1.5 focus-within:ring-4 focus-within:ring-white/30 transition-all">
                      <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="O que você vai criar hoje? (Ex: Post Instagram, Apresentação, Panfleto...)"
                        className="w-full bg-transparent border-none px-3 py-2 text-sm sm:text-base font-medium focus:outline-none text-gray-900 placeholder-gray-500"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg mr-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shrink-0 transition-colors shadow-sm"
                      >
                        Criar Novo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Circular Quick Category Bubbles (Canva 1:1) */}
                <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3 text-center">
                  {[
                    { label: 'Modelos', icon: LayoutTemplate, action: () => setActiveTab('modelos') },
                    { label: 'Camadas IA', icon: Wand2, action: () => setActiveTab('canva-ia') },
                    { label: 'Apresentação', icon: Monitor, preset: 'banner-landscape' },
                    { label: 'Redes sociais', icon: Smartphone, preset: 'insta-square' },
                    { label: 'Vídeo', icon: Video, preset: 'insta-story' },
                    { label: 'Gráfica', icon: Printer, action: () => setActiveTab('grafica') },
                    { label: 'Doc A4', icon: FileText, preset: 'flyer-a4' },
                    { label: 'Quadro branco', icon: LayoutGrid, preset: 'banner-landscape' },
                    { label: 'Planilha', icon: Grid, preset: 'banner-landscape' },
                    { label: 'Code & Web', icon: Globe, preset: 'banner-landscape' },
                    { label: 'E-mail Mkt', icon: Send, preset: 'banner-landscape' },
                    { label: 'Editor fotos', icon: ImageIcon, preset: 'insta-square' },
                  ].map((cat, idx) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (cat.action) cat.action();
                          else if (cat.preset) handleCreateNewDesign(cat.preset);
                        }}
                        className="group flex flex-col items-center gap-1.5 focus:outline-none transition-transform hover:scale-105"
                      >
                        <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md group-hover:bg-white text-white group-hover:text-purple-700 flex items-center justify-center shadow-lg transition-all">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-medium text-white/90 group-hover:text-white truncate max-w-full">
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section: Continuar criando designs (Recent User Designs) */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Continuar criando designs
                    </h3>
                    <p className="text-xs text-neutral-400">Seus projetos e rascunhos em andamento</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('projetos')}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <span>Ver todos os projetos ({savedProjects.length})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {savedProjects.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center space-y-3">
                    <FolderHeart className="w-8 h-8 text-neutral-500 mx-auto" />
                    <p className="text-sm text-neutral-400">Nenhum design criado ainda.</p>
                    <button
                      onClick={() => handleCreateNewDesign('insta-square')}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
                    >
                      Criar Primeiro Design
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {savedProjects.slice(0, 4).map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => handleOpenProjectInEditor(proj)}
                        className="group relative bg-[#12141c] hover:bg-[#161822] border border-neutral-800 hover:border-purple-500/40 rounded-2xl overflow-hidden shadow-lg transition-all cursor-pointer flex flex-col"
                      >
                        {/* Thumbnail */}
                        <div className="h-44 bg-neutral-950 flex items-center justify-center overflow-hidden relative">
                          <img
                            src={proj.thumbnailUrl}
                            alt={proj.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                            <span className="text-xs font-bold text-white bg-purple-600/90 px-2.5 py-1 rounded-lg">
                              Abrir no Editor
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => handleDuplicateProject(proj, e)}
                                title="Duplicar"
                                className="p-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-white rounded-lg"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteProject(proj.id, e)}
                                title="Excluir"
                                className="p-1.5 bg-red-900/80 hover:bg-red-800 text-white rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-3.5 flex flex-col justify-between flex-1">
                          <h4 className="text-sm font-bold text-white truncate group-hover:text-purple-400 transition-colors">
                            {proj.title}
                          </h4>
                          <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2">
                            <span>{proj.width} × {proj.height} px</span>
                            <span>{proj.updatedAt || 'Editado recentemente'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Section: Modelos para você (Templates Carousel) */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Modelos para você
                    </h3>
                    <p className="text-xs text-neutral-400">Comece rapidamente com templates prontos de alta conversão</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('modelos')}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <span>Explorar catálogo completo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {CANVA_TEMPLATES.slice(0, 8).map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => handleOpenTemplateInEditor(tmpl)}
                      className="group relative bg-[#12141c] hover:bg-[#161822] border border-neutral-800 hover:border-purple-500/40 rounded-2xl overflow-hidden shadow-lg transition-all cursor-pointer flex flex-col"
                    >
                      <div className="h-44 bg-neutral-950 flex items-center justify-center overflow-hidden relative">
                        <img
                          src={tmpl.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80'}
                          alt={tmpl.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-purple-300">
                          {tmpl.category}
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                          <button className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Usar este modelo</span>
                          </button>
                        </div>
                      </div>
                      <div className="p-3.5">
                        <h4 className="text-sm font-bold text-white truncate">{tmpl.name}</h4>
                        <p className="text-xs text-neutral-400 truncate mt-1">{tmpl.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PROJETOS (TODOS OS PROJETOS SCREENSHOT 2) */}
          {/* ========================================================================= */}
          {activeTab === 'projetos' && (
            <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Todos os projetos</h2>
                  <p className="text-xs text-neutral-400">Gerencie e organize todos os seus designs, artes e pastas</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCreateNewDesign('insta-square')}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novo design</span>
                  </button>
                </div>
              </div>

              {/* Sub Nav Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium border-b border-neutral-800/60">
                {[
                  { id: 'todos', label: 'Todos os projetos' },
                  { id: 'recentes', label: 'Recentes' },
                  { id: 'pastas', label: 'Pastas' },
                  { id: 'compartilhados', label: 'Compartilhado comigo' },
                  { id: 'lixeira', label: 'Lixeira' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setProjectSubNav(pill.id as any)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                      projectSubNav === pill.id
                        ? 'bg-purple-600 text-white font-bold'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/60 border border-neutral-800 p-3 rounded-2xl">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar projetos pelo nome..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={projectFilterType}
                    onChange={(e) => setProjectFilterType(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-purple-500"
                  >
                    <option value="todos">Todos os tipos</option>
                    <option value="instagram">Redes Sociais</option>
                    <option value="apresentacao">Apresentações</option>
                    <option value="impresso">Impressos</option>
                  </select>

                  <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-0.5">
                    <button
                      onClick={() => setProjectViewMode('grid')}
                      className={`p-1.5 rounded-lg ${projectViewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setProjectViewMode('list')}
                      className={`p-1.5 rounded-lg ${projectViewMode === 'list' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Projects Grid or List */}
              {savedProjects.length === 0 ? (
                <div className="p-12 rounded-3xl bg-neutral-900/30 border border-neutral-800 text-center space-y-4">
                  <FolderHeart className="w-12 h-12 text-neutral-600 mx-auto" />
                  <div>
                    <h3 className="text-base font-bold text-white">Nenhum projeto encontrado</h3>
                    <p className="text-xs text-neutral-400 mt-1">Crie um novo design ou escolha um modelo para começar.</p>
                  </div>
                  <button
                    onClick={() => handleCreateNewDesign('insta-square')}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg"
                  >
                    Criar Novo Design
                  </button>
                </div>
              ) : projectViewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {savedProjects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => handleOpenProjectInEditor(proj)}
                      className="group relative bg-[#12141c] hover:bg-[#161822] border border-neutral-800 hover:border-purple-500/40 rounded-2xl overflow-hidden shadow-lg transition-all cursor-pointer flex flex-col"
                    >
                      <div className="h-44 bg-neutral-950 flex items-center justify-center overflow-hidden relative">
                        <img
                          src={proj.thumbnailUrl}
                          alt={proj.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                          <button className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg">
                            Editar
                          </button>
                          <button
                            onClick={(e) => handleDuplicateProject(proj, e)}
                            className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold p-2 rounded-xl"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteProject(proj.id, e)}
                            className="bg-red-900/80 hover:bg-red-800 text-white text-xs font-bold p-2 rounded-xl"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3.5 flex flex-col justify-between flex-1">
                        <h4 className="text-sm font-bold text-white truncate">{proj.title}</h4>
                        <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2">
                          <span>{proj.width} × {proj.height} px</span>
                          <span>{proj.updatedAt || 'Recente'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#12141c] border border-neutral-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400 font-semibold">
                      <tr>
                        <th className="p-3 pl-4">Nome do Design</th>
                        <th className="p-3">Dimensões</th>
                        <th className="p-3">Categoria</th>
                        <th className="p-3">Última Modificação</th>
                        <th className="p-3 pr-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                      {savedProjects.map((proj) => (
                        <tr
                          key={proj.id}
                          onClick={() => handleOpenProjectInEditor(proj)}
                          className="hover:bg-neutral-800/40 cursor-pointer transition-colors"
                        >
                          <td className="p-3 pl-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-neutral-900 overflow-hidden shrink-0 border border-neutral-800">
                              <img src={proj.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-white truncate max-w-xs">{proj.title}</span>
                          </td>
                          <td className="p-3">{proj.width} × {proj.height} px</td>
                          <td className="p-3">{proj.category || 'Geral'}</td>
                          <td className="p-3 text-neutral-400">{proj.updatedAt || 'Recente'}</td>
                          <td className="p-3 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleOpenProjectInEditor(proj)}
                                className="p-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-lg transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDuplicateProject(proj, e)}
                                className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteProject(proj.id, e)}
                                className="p-1.5 bg-red-900/20 hover:bg-red-900/80 text-red-400 hover:text-white rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: MODELOS (DESCUBRA MODELOS SCREENSHOT 3) */}
          {/* ========================================================================= */}
          {activeTab === 'modelos' && (
            <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Descubra Modelos</h2>
                  <p className="text-xs text-neutral-400">Milhares de layouts editáveis em 1 clique para agências e marcas</p>
                </div>
              </div>

              {/* Category Nav Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-medium scrollbar-none">
                {[
                  { id: 'todos', label: 'Todos os modelos' },
                  { id: 'instagram', label: 'Post Instagram (1:1)' },
                  { id: 'story', label: 'Story & Reels (9:16)' },
                  { id: 'apresentacao', label: 'Apresentações (16:9)' },
                  { id: 'vendas', label: 'Vendas & Black Friday' },
                  { id: 'branding', label: 'Branding & Identidade' },
                  { id: 'impresso', label: 'Impressos & Panfletos' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setSelectedCategoryPill(pill.id)}
                    className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                      selectedCategoryPill === pill.id
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-600/20'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => handleOpenTemplateInEditor(tmpl)}
                    className="group relative bg-[#12141c] hover:bg-[#161822] border border-neutral-800 hover:border-purple-500/40 rounded-2xl overflow-hidden shadow-lg transition-all cursor-pointer flex flex-col"
                  >
                    <div className="h-48 bg-neutral-950 flex items-center justify-center overflow-hidden relative">
                      <img
                        src={tmpl.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80'}
                        alt={tmpl.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-purple-300">
                        {tmpl.category}
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                        <button className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Personalizar</span>
                        </button>
                      </div>
                    </div>
                    <div className="p-3.5">
                      <h4 className="text-sm font-bold text-white truncate">{tmpl.name}</h4>
                      <p className="text-xs text-neutral-400 truncate mt-1">{tmpl.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: MARCA (KIT DE MARCA SCREENSHOT 4) */}
          {/* ========================================================================= */}
          {activeTab === 'marca' && (
            <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Kit de Marca</h2>
                  <p className="text-xs text-neutral-400">Padronize cores, fontes, logos e assets para criar peças alinhadas à identidade visual</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsNewBrandKitModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novo Kit de Marca</span>
                  </button>
                </div>
              </div>

              {/* Brand Kit Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {brandKits.map((kit) => (
                  <button
                    key={kit.id}
                    onClick={() => setSelectedBrandKitId(kit.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedBrandKitId === kit.id
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {kit.name}
                  </button>
                ))}
              </div>

              {/* Brand Kit Detailed Guidelines */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col: Logos & Palettes */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Logos Section */}
                  <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                      <span>Logos da Marca</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {currentBrandKit.logos.map((logo, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col items-center gap-2 group">
                          <img src={logo} alt="Logo" className="w-16 h-16 object-contain rounded-lg" />
                          <span className="text-[10px] text-neutral-400">Logo Principal</span>
                        </div>
                      ))}
                      <button
                        onClick={() => showToast('Selecione uma imagem de logo do seu computador')}
                        className="border-2 border-dashed border-neutral-800 hover:border-purple-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-purple-400 transition-colors"
                      >
                        <Upload className="w-5 h-5" />
                        <span className="text-xs font-semibold">+ Adicionar Logo</span>
                      </button>
                    </div>
                  </div>

                  {/* Colors Palette Section */}
                  <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Palette className="w-4 h-4 text-purple-400" />
                      <span>Paleta de Cores Oficiais</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {Object.entries(currentBrandKit.colors).map(([key, hex]) => (
                        <div key={key} className="space-y-1.5">
                          <div
                            className="h-16 rounded-xl border border-white/10 shadow-inner flex items-center justify-center font-bold text-xs text-white/90"
                            style={{ backgroundColor: hex }}
                          />
                          <div className="text-[11px] font-semibold text-white capitalize">{key}</div>
                          <div className="text-[10px] font-mono text-neutral-400 uppercase">{hex}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Typography Guidelines */}
                  <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Type className="w-4 h-4 text-purple-400" />
                      <span>Tipografia da Marca</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-purple-400">Títulos (H1 / H2)</span>
                        <div className="text-lg font-bold text-white">{currentBrandKit.fonts.heading}</div>
                        <p className="text-xs text-neutral-400">Peso 700 / 800 Bold</p>
                      </div>
                      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-indigo-400">Subtítulos (H3)</span>
                        <div className="text-base font-semibold text-white">{currentBrandKit.fonts.subheading}</div>
                        <p className="text-xs text-neutral-400">Peso 600 SemiBold</p>
                      </div>
                      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-pink-400">Corpo de Texto</span>
                        <div className="text-sm font-normal text-white">{currentBrandKit.fonts.body}</div>
                        <p className="text-xs text-neutral-400">Peso 400 Regular</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Col: Brand Voice & Quick AI Actions */}
                <div className="space-y-6">
                  {/* Brand Voice Card */}
                  <div className="p-6 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      <span>Tom de Voz & Redação</span>
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                      {currentBrandKit.brandVoice}
                    </p>
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Cliente Vinculado</span>
                      <div className="text-xs font-bold text-white mt-0.5">{currentBrandKit.clientName}</div>
                    </div>
                  </div>

                  {/* Smart Brand Extractor Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-neutral-900 border border-purple-500/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <h4 className="text-sm font-bold text-white">Extrator Inteligente de Marca</h4>
                    </div>
                    <p className="text-xs text-neutral-300">
                      Cole a URL do site de um cliente e extraia automaticamente a paleta e fontes sugeridas.
                    </p>
                    <button
                      onClick={() => setIsNewBrandKitModalOpen(true)}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 rounded-xl transition-colors shadow-lg shadow-purple-600/20"
                    >
                      Extrair por URL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: CANVA IA / ESTÚDIO MÁGICO (SCREENSHOT 5) */}
          {/* ========================================================================= */}
          {activeTab === 'canva-ia' && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              <div className="text-center space-y-2 py-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Estúdio Mágico com Inteligência Artificial</span>
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  O que vamos criar hoje?
                </h2>
                <p className="text-xs text-neutral-400">
                  Gere criativos visuais completos, textos magnéticos e conceitos visuais em segundos
                </p>
              </div>

              {/* Mode Selectors */}
              <div className="flex items-center justify-center gap-2">
                {[
                  { id: 'design', label: 'Design Completo' },
                  { id: 'imagem', label: 'Geração de Imagem' },
                  { id: 'doc', label: 'Texto & Copy Mágico' },
                  { id: 'video', label: 'Roteiro de Vídeo' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setAiMode(m.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      aiMode === m.id
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* AI Prompt Input Card */}
              <div className="p-6 rounded-3xl bg-[#12141c] border border-neutral-800 shadow-2xl space-y-4">
                <div className="relative">
                  <textarea
                    rows={4}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Descreva o criativo que você quer gerar... (Ex: 'Post de lançamento para clínica de estética em tons dourados e preto com oferta de 30% OFF e chamada para agendamento WhatsApp')"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 leading-relaxed"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span>Sugestões rápidas:</span>
                      <button
                        onClick={() => setAiPrompt('Banner promocional para restaurante de sushi com cupom SUSHI20')}
                        className="text-[11px] bg-neutral-900 hover:bg-neutral-800 text-neutral-300 px-2 py-1 rounded-lg"
                      >
                        🍣 Sushi
                      </button>
                      <button
                        onClick={() => setAiPrompt('Criativo futurista para SaaS de tecnologia com foco em produtividade')}
                        className="text-[11px] bg-neutral-900 hover:bg-neutral-800 text-neutral-300 px-2 py-1 rounded-lg"
                      >
                        🚀 SaaS Tech
                      </button>
                    </div>

                    <button
                      onClick={handleGenerateWithAI}
                      disabled={isAiGenerating || !aiPrompt.trim()}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all"
                    >
                      {isAiGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Gerando...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Gerar com IA</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Generated Result Preview */}
              {aiGeneratedImage && (
                <div className="p-6 rounded-3xl bg-[#12141c] border border-purple-500/30 space-y-4 animate-fade-in">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>Conceito Gerado pela IA</span>
                  </h3>
                  <div className="h-64 rounded-2xl bg-neutral-950 overflow-hidden relative">
                    <img src={aiGeneratedImage} alt="AI Generated" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleCreateNewDesign('insta-square')}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Inserir em Novo Canvas</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: GRÁFICA CRIATIVA (SCREENSHOT 6) */}
          {/* ========================================================================= */}
          {activeTab === 'grafica' && (
            <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
              {/* Gráfica Banner */}
              <div className="p-8 rounded-3xl bg-gradient-to-r from-neutral-900 via-purple-950 to-neutral-900 border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/20 text-purple-300 text-xs font-bold">
                    <Printer className="w-3.5 h-3.5" />
                    <span>Impressão Profissional com Entrega Nacional</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Conheça a Gráfica Criativa
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    Do design na tela direto para as mãos dos seus clientes com acabamento em papel couchê, verniz localizado, laminação fosca e frete expresso.
                  </p>
                </div>
                <div className="shrink-0 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setSelectedPrintProduct(PRINT_PRODUCTS_CATALOG[0]);
                      setPrintQty(250);
                    }}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-purple-600/25 transition-all"
                  >
                    Calcular Orçamento
                  </button>
                </div>
              </div>

              {/* Print Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {PRINT_PRODUCTS_CATALOG.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-5 rounded-2xl bg-[#12141c] border border-neutral-800 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="h-44 rounded-xl bg-neutral-950 overflow-hidden relative">
                        <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" />
                        {prod.badge && (
                          <div className="absolute top-2.5 right-2.5 bg-purple-600 text-white px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
                            {prod.badge}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">{prod.category}</span>
                        <h3 className="text-base font-bold text-white mt-0.5">{prod.title}</h3>
                        <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{prod.description}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-neutral-400">A partir de</span>
                        <div className="text-sm font-extrabold text-white">
                          R$ {prod.basePrice.toFixed(2).replace('.', ',')}
                          <span className="text-[10px] text-neutral-400 font-normal"> / {prod.minQty} un</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPrintProduct(prod);
                          setPrintQty(prod.minQty);
                        }}
                        className="bg-neutral-800 hover:bg-purple-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                      >
                        Personalizar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Print Calculator Modal / Section if Selected */}
              {selectedPrintProduct && (
                <div className="p-6 rounded-3xl bg-[#12141c] border border-purple-500/40 shadow-2xl space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Configurar Pedido: {selectedPrintProduct.title}</h3>
                      <p className="text-xs text-neutral-400">Simule quantidades, papéis e acabamento</p>
                    </div>
                    <button
                      onClick={() => setSelectedPrintProduct(null)}
                      className="p-1.5 text-neutral-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-neutral-400">Tiragem / Quantidade</label>
                      <select
                        value={printQty}
                        onChange={(e) => setPrintQty(Number(e.target.value))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-purple-500"
                      >
                        <option value={100}>100 unidades</option>
                        <option value={250}>250 unidades</option>
                        <option value={500}>500 unidades</option>
                        <option value={1000}>1.000 unidades</option>
                        <option value={2500}>2.500 unidades</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-400">Tipo de Papel</label>
                      <select
                        value={printPaper}
                        onChange={(e) => setPrintPaper(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-purple-500"
                      >
                        <option value="Couché 300g Fosco">Couché 300g Fosco</option>
                        <option value="Couché 250g Brilho">Couché 250g Brilho</option>
                        <option value="Kraft Sustentável 240g">Kraft Sustentável 240g</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-400">Acabamento</label>
                      <select
                        value={printFinish}
                        onChange={(e) => setPrintFinish(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-purple-500"
                      >
                        <option value="Verniz Localizado">Verniz Localizado</option>
                        <option value="Laminação Fosca">Laminação Fosca Total</option>
                        <option value="Sem Verniz">Sem Verniz (Econômico)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-neutral-400">Valor Total Estimado:</span>
                      <div className="text-xl font-extrabold text-white">
                        R$ {((selectedPrintProduct.basePrice * (printQty / selectedPrintProduct.minQty))).toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        showToast(`Pedido de ${printQty}x "${selectedPrintProduct.title}" enviado para a gráfica parceira!`);
                        setSelectedPrintProduct(null);
                      }}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-purple-600/30"
                    >
                      Confirmar Solicitação de Impressão
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: APROVAÇÕES (SCREENSHOT 7 & 8) */}
          {/* ========================================================================= */}
          {activeTab === 'aprovacoes' && (
            <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Aprovações de Criativos</h2>
                  <p className="text-xs text-neutral-400">Envie artes para revisão de diretores de arte e clientes com links públicos de aprovação</p>
                </div>
                <button
                  onClick={() => setIsNewApprovalModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Solicitar Aprovação</span>
                </button>
              </div>

              {/* Approvals Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvals.map((appr) => (
                  <div key={appr.id} className="p-5 rounded-2xl bg-[#12141c] border border-neutral-800 space-y-4 flex flex-col justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-xl bg-neutral-950 overflow-hidden shrink-0 border border-neutral-800">
                        <img src={appr.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            appr.status === 'approved'
                              ? 'bg-green-900/50 text-green-400 border border-green-700/50'
                              : appr.status === 'changes_requested'
                              ? 'bg-amber-900/50 text-amber-400 border border-amber-700/50'
                              : 'bg-purple-900/50 text-purple-300 border border-purple-700/50'
                          }`}>
                            {appr.status === 'approved' ? 'Aprovado' : appr.status === 'changes_requested' ? 'Ajustes Solicitados' : 'Pendente de Revisão'}
                          </span>
                          <span className="text-[10px] text-neutral-400">v{appr.version}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{appr.title}</h4>
                        <p className="text-xs text-neutral-400">{appr.clientName}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-neutral-400">{appr.requestedAt}</span>
                      <div className="flex items-center gap-2">
                        {appr.status === 'pending' && (
                          <button
                            onClick={() => {
                              setApprovals((prev) =>
                                prev.map((a) => (a.id === appr.id ? { ...a, status: 'approved', reviewedAt: 'Agora' } : a))
                              );
                              showToast(`Arte "${appr.title}" marcada como aprovada!`);
                            }}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Aprovar
                          </button>
                        )}
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(window.location.href);
                            showToast('Link de aprovação copiado para a área de transferência!');
                          }}
                          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Copiar Link</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: MAIS FERRAMENTAS */}
          {/* ========================================================================= */}
          {activeTab === 'mais' && (
            <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Mais Ferramentas & Integrações</h2>
                <p className="text-xs text-neutral-400">Acelere seu fluxo criativo com apps adicionais e tutoriais</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { title: 'Planejador de Conteúdo', desc: 'Agende publicações e sincronize o calendário com o Social Hub.', icon: Calendar, action: () => onNavigate?.('social-hub') },
                  { title: 'Design School', desc: 'Tutoriais de harmonia de cores, tipografia e boas práticas visuais.', icon: BookOpen },
                  { title: 'Gerador de QR Code', desc: 'Crie QR Codes customizados com sua logo para artes impressas.', icon: Grid },
                  { title: 'Removedor de Fundo IA', desc: 'Isole produtos e retratos automaticamente em 1 clique.', icon: Wand2 },
                  { title: 'Mural da Agência', desc: 'Veja o repositório consolidado de todas as artes da agência.', icon: FolderHeart, action: () => onNavigate?.('designer') },
                  { title: 'Exportador em Lote', desc: 'Exporte formatos em alta resolução para Instagram, Stories e Display.', icon: Download },
                ].map((tool, idx) => {
                  const Icon = tool.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (tool.action) tool.action();
                        else showToast(`Ferramenta "${tool.title}" ativada!`);
                      }}
                      className="p-5 rounded-2xl bg-[#12141c] border border-neutral-800 hover:border-purple-500/40 transition-all cursor-pointer space-y-3 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-400 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-all">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{tool.title}</h4>
                        <p className="text-xs text-neutral-400 mt-1">{tool.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CRIAR UM DESIGN (SCREENSHOT 9) */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#12141c] border border-neutral-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-gray-100 font-sans">
            {/* Header */}
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-base text-white">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Criar um design</span>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Custom Size Form */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                  <span>Tamanho personalizado</span>
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400">Largura</label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400">Altura</label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400">Unidade</label>
                    <select
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value as any)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-white mt-1"
                    >
                      <option value="px">px (Pixels)</option>
                      <option value="mm">mm (Milímetros)</option>
                      <option value="cm">cm (Centímetros)</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => handleCreateNewDesign(undefined, customWidth, customHeight)}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2 rounded-xl transition-colors"
                >
                  Criar Novo Canvas
                </button>
              </div>

              {/* Popular Formats */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Formatos Populares</span>
                <div className="grid grid-cols-2 gap-2">
                  {CANVAS_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleCreateNewDesign(p.id)}
                      className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-purple-500 text-left transition-all group"
                    >
                      <div className="font-bold text-xs text-white group-hover:text-purple-400">{p.name}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{p.width} × {p.height} px</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: NOVO KIT DE MARCA */}
      {/* ========================================================================= */}
      {isNewBrandKitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#12141c] border border-neutral-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-gray-100">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Novo Kit de Marca</span>
              </h3>
              <button onClick={() => setIsNewBrandKitModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-400">Nome da Marca</label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Ex: Alfa Tech Soluções"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-400">Empresa / Cliente</label>
                <input
                  type="text"
                  value={newBrandClient}
                  onChange={(e) => setNewBrandClient(e.target.value)}
                  placeholder="Ex: Alfa LTDA"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-400">URL do Site (opcional para extração IA)</label>
                <input
                  type="text"
                  value={newBrandUrl}
                  onChange={(e) => setNewBrandUrl(e.target.value)}
                  placeholder="https://exemplo.com.br"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsNewBrandKitModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleExtractBrandFromUrl}
                disabled={isExtractingBrand}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2"
              >
                {isExtractingBrand ? 'Extraindo...' : 'Criar Kit de Marca'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SOLICITAR APROVAÇÃO */}
      {/* ========================================================================= */}
      {isNewApprovalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#12141c] border border-neutral-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 text-gray-100">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Solicitar Aprovação</span>
              </h3>
              <button onClick={() => setIsNewApprovalModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-400">Título do Design</label>
                <input
                  type="text"
                  value={approvalTitle}
                  onChange={(e) => setApprovalTitle(e.target.value)}
                  placeholder="Ex: Post Carrossel Instagram"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-400">Nome do Cliente / Revisor</label>
                <input
                  type="text"
                  value={approvalClient}
                  onChange={(e) => setApprovalClient(e.target.value)}
                  placeholder="Ex: Clinica Odonto Vida"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white mt-1 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsNewApprovalModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!approvalTitle.trim()) {
                    showToast('Informe o título do design');
                    return;
                  }
                  const newAppr: DesignApproval = {
                    id: `appr-${Date.now()}`,
                    title: approvalTitle,
                    clientName: approvalClient || 'Cliente Geral',
                    thumbnailUrl: savedProjects[0]?.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
                    status: 'pending',
                    requestedAt: 'Agora mesmo',
                    version: 1,
                  };
                  setApprovals((prev) => [newAppr, ...prev]);
                  setIsNewApprovalModalOpen(false);
                  setApprovalTitle('');
                  setApprovalClient('');
                  showToast('Solicitação de aprovação criada com sucesso!');
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg"
              >
                Gerar Link de Aprovação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

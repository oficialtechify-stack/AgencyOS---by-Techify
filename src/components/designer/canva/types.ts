export type CanvasElementType = 'text' | 'shape' | 'image' | 'sticker' | 'brush' | 'badge';

export type ShapeType = 'rectangle' | 'rounded-rect' | 'circle' | 'triangle' | 'star' | 'polygon' | 'line' | 'arrow';

export type BlendModeType =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'luminosity';

export interface BaseElement {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees
  opacity: number; // 0 to 1
  locked: boolean;
  zIndex: number;
  blendMode?: BlendModeType;
  hidden?: boolean;
  name?: string;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  color: string;
  backgroundColor?: string;
  backgroundPadding?: number;
  backgroundRadius?: number;
  letterSpacing: number;
  lineHeight: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through';
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  fillColor: string;
  fillGradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    angle?: number;
  };
  strokeColor: string;
  strokeWidth: number;
  strokeDasharray?: string;
  borderRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt?: string;
  objectFit?: 'contain' | 'cover' | 'fill';
  borderRadius?: number;
  flipX?: boolean;
  flipY?: boolean;
  // Filters
  brightness?: number; // 100 is normal
  contrast?: number; // 100 is normal
  saturation?: number; // 100 is normal
  blur?: number; // 0 is normal
  grayscale?: number; // 0 is normal
  sepia?: number; // 0 is normal
  shadowColor?: string;
  shadowBlur?: number;
}

export interface StickerElement extends BaseElement {
  type: 'sticker';
  stickerType: string;
  content: string; // SVG path or emoji or icon name
  fillColor: string;
  secondaryColor?: string;
  badgeText?: string;
  textColor?: string;
}

export interface BrushPoint {
  x: number;
  y: number;
}

export interface BrushElement extends BaseElement {
  type: 'brush';
  points: BrushPoint[];
  color: string;
  strokeWidth: number;
  isHighlighter?: boolean;
}

export type CanvasElement = TextElement | ShapeElement | ImageElement | StickerElement | BrushElement;

export interface CanvasPreset {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  iconName?: string;
}

export interface CanvasBackground {
  type: 'color' | 'gradient' | 'image' | 'pattern';
  color: string;
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    angle: number;
  };
  imageSrc?: string;
  pattern?: 'dots' | 'grid' | 'stripes' | 'noise' | 'none';
}

export interface CanvasTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  width: number;
  height: number;
  background: CanvasBackground;
  elements: CanvasElement[];
  thumbnail?: string;
}

export interface SavedCanvaProject {
  id: string;
  title: string;
  clientName?: string;
  category?: string;
  width: number;
  height: number;
  background: CanvasBackground;
  elements: CanvasElement[];
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
}

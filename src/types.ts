export type TabType = 'mirror' | 'moodboard' | 'wardrobe' | 'pipeline';

export interface Inspiration {
  id: string;
  name: string;
  era: string;
  subtitle: string;
  imageUrl: string;
  thumbnailUrl: string;
  palette: string[];
  paletteNames: string[];
  silhouettes: string[];
  fabrics: string[];
  aestheticMatch: number;
  description: string;
  promptSignature: string;
}

export interface WardrobeItem {
  id: string;
  code: string;
  name: string;
  category: 'tops' | 'trousers' | 'outerwear' | 'accessories';
  material: string;
  colorName: string;
  colorHex: string;
  gsm: number;
  drapeType: 'Liquid Fluid' | 'Rigid Structured' | 'Architectural' | 'Voluminous Crepe' | 'Cascading Silk';
  imageUrl: string;
  cadImageUrl?: string;
  activeInLook: boolean;
  price?: string;
  description: string;
  composition: string;
  careLabel: string;
}

export interface StylistVerdict {
  quote: string;
  model: string;
  aestheticMatchPercent: number;
  drapeAssessment: string;
  postureAxis: string;
  latentFitLock: number;
  recommendedItemIds: string[];
  notes: string[];
}

export interface SavedLook {
  id: string;
  timestamp: string;
  inspirationName: string;
  aestheticMatch: number;
  quote: string;
  modelImageUrl: string;
  equippedItems: {
    id: string;
    name: string;
    code: string;
    material: string;
    imageUrl: string;
  }[];
}

export interface PipelineConfig {
  activeModel: 'Gemini 1.5 Pro' | 'Gemini 2.0 Flash';
  loraWeight: number; // 0 to 1
  cfgScale: number; // e.g. 7.5
  denoisingSteps: number;
  streamSource: 'vonage-editorial' | 'runway-noir' | 'webcam';
  resolution: '1080p' | '4K-Atelier';
  fps: number;
  latentFitConfidence: number;
}

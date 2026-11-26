export type PaletteId =
  | 'emerald-obsidian'
  | 'airy-coral'
  | 'midnight-sapphire'
  | 'burgundy-ivory';

export interface ThemePalette {
  id: PaletteId;
  name: string;
  tagline: string;
  sidebarMode: 'dark' | 'light';
  swatches: [string, string, string];
  vars: Record<string, string>;
}

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: 'emerald-obsidian',
    name: 'Emerald Obsidian',
    tagline: 'Botanical Forest · Champagne Gold',
    sidebarMode: 'dark',
    swatches: ['#0E3224', '#1D593E', '#B8863B'],
    vars: {
      '--bn-primary': '#0E3224',
      '--bn-primary-deep': '#092218',
      '--bn-secondary': '#1D593E',
      '--bn-accent': '#B8863B',
      '--bn-accent-soft': '#FBF6EC',
      '--bn-bg': '#FFFFFF',
      '--bn-soft-bg': '#F3F6F2',
      '--bn-surface-elevated': '#FAFBF9',
      '--bn-text': '#142019',
      '--bn-muted': '#516359',
      '--bn-border': '#DAE2DA',
      '--bn-border-hover': '#AFC1B3',
      '--bn-sidebar-bg': '#0E3224',
      '--bn-sidebar-border': 'rgba(255, 255, 255, 0.1)',
      '--bn-sidebar-text': '#DCE6DF',
      '--bn-sidebar-muted': '#9BB8A6',
      '--bn-active-pill': '#FFFFFF',
      '--bn-active-pill-text': '#0E3224',
      '--bn-glow': 'rgba(29, 89, 62, 0.16)',
      '--bn-spotlight': 'rgba(184, 134, 59, 0.12)',
    },
  },
  {
    id: 'airy-coral',
    name: 'Alabaster Coral',
    tagline: 'Crisp White Sidebar · Warm Coral Pill',
    sidebarMode: 'light',
    swatches: ['#FFFFFF', '#FF8547', '#1E2430'],
    vars: {
      '--bn-primary': '#E8612C',
      '--bn-primary-deep': '#1C222E',
      '--bn-secondary': '#FF8A4C',
      '--bn-accent': '#F59E0B',
      '--bn-accent-soft': '#FFF5EE',
      '--bn-bg': '#FFFFFF',
      '--bn-soft-bg': '#F6F7FA',
      '--bn-surface-elevated': '#FAFBFD',
      '--bn-text': '#1A1F2B',
      '--bn-muted': '#687385',
      '--bn-border': '#E6E9F0',
      '--bn-border-hover': '#CBD2DF',
      '--bn-sidebar-bg': '#FFFFFF',
      '--bn-sidebar-border': '#E6E9F0',
      '--bn-sidebar-text': '#495365',
      '--bn-sidebar-muted': '#8E98A8',
      '--bn-active-pill': 'linear-gradient(135deg, #FF994F 0%, #F26430 100%)',
      '--bn-active-pill-text': '#FFFFFF',
      '--bn-glow': 'rgba(255, 133, 71, 0.18)',
      '--bn-spotlight': 'rgba(255, 138, 76, 0.12)',
    },
  },
  {
    id: 'midnight-sapphire',
    name: 'Midnight Sapphire',
    tagline: 'Executive Navy · Cerulean & Gold',
    sidebarMode: 'dark',
    swatches: ['#0F203A', '#1D4ED8', '#C6922C'],
    vars: {
      '--bn-primary': '#0F203A',
      '--bn-primary-deep': '#091426',
      '--bn-secondary': '#1E40AF',
      '--bn-accent': '#C6922C',
      '--bn-accent-soft': '#FDF8EE',
      '--bn-bg': '#FFFFFF',
      '--bn-soft-bg': '#F4F7FB',
      '--bn-surface-elevated': '#F9FBFD',
      '--bn-text': '#0F172A',
      '--bn-muted': '#475569',
      '--bn-border': '#DCE3EE',
      '--bn-border-hover': '#9EB3D1',
      '--bn-sidebar-bg': '#0F203A',
      '--bn-sidebar-border': 'rgba(255, 255, 255, 0.1)',
      '--bn-sidebar-text': '#DDE6F3',
      '--bn-sidebar-muted': '#94ABC9',
      '--bn-active-pill': '#FFFFFF',
      '--bn-active-pill-text': '#0F203A',
      '--bn-glow': 'rgba(30, 64, 175, 0.16)',
      '--bn-spotlight': 'rgba(198, 146, 44, 0.12)',
    },
  },
  {
    id: 'burgundy-ivory',
    name: 'Hematology Burgundy',
    tagline: 'Oxblood Velvet · Rose Bronze',
    sidebarMode: 'dark',
    swatches: ['#4B1624', '#7A233A', '#B57350'],
    vars: {
      '--bn-primary': '#4B1624',
      '--bn-primary-deep': '#320D17',
      '--bn-secondary': '#7A233A',
      '--bn-accent': '#B57350',
      '--bn-accent-soft': '#FDF5F1',
      '--bn-bg': '#FFFFFF',
      '--bn-soft-bg': '#F9F5F4',
      '--bn-surface-elevated': '#FCFAF9',
      '--bn-text': '#241418',
      '--bn-muted': '#6A5359',
      '--bn-border': '#E8DCDF',
      '--bn-border-hover': '#CCAAB2',
      '--bn-sidebar-bg': '#4B1624',
      '--bn-sidebar-border': 'rgba(255, 255, 255, 0.1)',
      '--bn-sidebar-text': '#F4E4E8',
      '--bn-sidebar-muted': '#D1A6B1',
      '--bn-active-pill': '#FFFFFF',
      '--bn-active-pill-text': '#4B1624',
      '--bn-glow': 'rgba(122, 35, 58, 0.15)',
      '--bn-spotlight': 'rgba(181, 115, 80, 0.14)',
    },
  },
];

const STORAGE_KEY = 'bn-color-palette';

export function getSavedPaletteId(): PaletteId {
  if (typeof window === 'undefined') return 'emerald-obsidian';
  const saved = window.localStorage.getItem(STORAGE_KEY) as PaletteId | null;
  if (saved && THEME_PALETTES.some((p) => p.id === saved)) {
    return saved;
  }
  return 'emerald-obsidian';
}

export function getPaletteById(id: PaletteId): ThemePalette {
  return THEME_PALETTES.find((p) => p.id === id) ?? THEME_PALETTES[0];
}

export function applyPalette(id: PaletteId): ThemePalette {
  const palette = getPaletteById(id);
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(palette.vars)) {
      root.style.setProperty(key, value);
    }
    root.dataset.palette = palette.id;
    root.dataset.sidebarMode = palette.sidebarMode;
  }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, palette.id);
  }
  return palette;
}

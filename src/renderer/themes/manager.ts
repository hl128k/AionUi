import type { ThemeMode, ThemePack, ThemeStorageShape } from './types';
import { loadStorage, saveStorage } from './storage';

const DEFAULT_THEME_ID = 'default';

const DEFAULT_LIGHT_VARS: Record<string, string> = {
  '--color-bg-1': '#ffffff',
  '--color-text-1': 'rgba(0,0,0,0.9)',
};
const DEFAULT_DARK_VARS: Record<string, string> = {
  '--color-bg-1': '#17171a',
  '--color-text-1': 'rgba(255,255,255,0.9)',
};

const DEFAULT_PACK: ThemePack = {
  id: DEFAULT_THEME_ID,
  name: '默认主题',
  light: { variables: DEFAULT_LIGHT_VARS, arco: { primaryColor: '#4E5969' } },
  dark: { variables: DEFAULT_DARK_VARS, arco: { primaryColor: '#3491FA' } },
};

export class ThemeManager {
  private data: ThemeStorageShape;

  constructor() {
    this.data = loadStorage<ThemeStorageShape>({
      themes: [DEFAULT_PACK],
      state: { currentThemeId: DEFAULT_THEME_ID, mode: 'light' },
    });
    // Ensure at least default exists
    if (!this.data.themes.find((t) => t.id === DEFAULT_THEME_ID)) {
      this.data.themes.unshift(DEFAULT_PACK);
    }
  }

  getAll(): ThemePack[] {
    return this.data.themes;
  }

  getCurrent(): { pack: ThemePack; mode: ThemeMode } {
    const pack = this.data.themes.find((t) => t.id === this.data.state.currentThemeId) || DEFAULT_PACK;
    return { pack, mode: this.data.state.mode };
  }

  setMode(mode: ThemeMode) {
    this.data.state.mode = mode;
    this.persist();
  }

  setCurrentTheme(themeId: string) {
    if (this.data.themes.some((t) => t.id === themeId)) {
      this.data.state.currentThemeId = themeId;
      this.persist();
    }
  }

  upsertTheme(pack: ThemePack) {
    const idx = this.data.themes.findIndex((t) => t.id === pack.id);
    if (idx >= 0) this.data.themes[idx] = pack;
    else this.data.themes.push(pack);
    this.persist();
  }

  removeTheme(themeId: string) {
    this.data.themes = this.data.themes.filter((t) => t.id !== themeId);
    if (this.data.state.currentThemeId === themeId) this.data.state.currentThemeId = DEFAULT_THEME_ID;
    this.persist();
  }

  exportTheme(themeId: string): string | null {
    const pack = this.data.themes.find((t) => t.id === themeId);
    return pack ? JSON.stringify(pack, null, 2) : null;
  }

  importTheme(jsonText: string): ThemePack | null {
    try {
      const pack = JSON.parse(jsonText) as ThemePack;
      if (!pack.id || !pack.light || !pack.dark) return null;
      this.upsertTheme(pack);
      return pack;
    } catch {
      return null;
    }
  }

  applyToDOM(root: HTMLElement = document.body) {
    const { pack, mode } = this.getCurrent();
    // Toggle arco dark
    if (mode === 'dark') root.setAttribute('arco-theme', 'dark');
    else root.removeAttribute('arco-theme');

    // Apply css variables
    const vars = mode === 'dark' ? pack.dark.variables : pack.light.variables;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    // Apply i18n key styles to annotated nodes
    try {
      // Lazy import to avoid circular deps
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { applyI18nStyles } = require('./i18n-style-mapper');
      applyI18nStyles(root);
    } catch (_err) {
      // Ignore styling application errors to avoid breaking theme switch
      void 0;
    }
  }

  private persist() {
    saveStorage(this.data);
  }
}

export const themeManager = new ThemeManager();

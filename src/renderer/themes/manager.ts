import type { ThemeMode, ThemePack, ThemeStorageShape } from './types';
import { loadStorage, saveStorage } from './storage';

const DEFAULT_THEME_ID = 'default';

const DEFAULT_LIGHT_VARS: Record<string, string> = {
  '--color-bg-1': '#ffffff',
  '--color-text-1': 'rgba(0,0,0,0.9)',
  '--color-border-1': '#e5e6eb',
  '--color-fill-1': '#f2f3f5',
};
const DEFAULT_DARK_VARS: Record<string, string> = {
  '--color-bg-1': '#17171a',
  '--color-text-1': 'rgba(255,255,255,0.9)',
};

const DEFAULT_PACK: ThemePack = {
  id: DEFAULT_THEME_ID,
  name: '默认主题',
  light: {
    variables: DEFAULT_LIGHT_VARS,
    arco: { primaryColor: '#4E5969' },
    codeHighlight: {
      background: '#ffffff',
      color: '#24292f',
      headerBackground: '#f6f8fa',
      headerColor: '#656d76',
      lineNumberColor: '#8c959f',
      selectedLineBackground: '#e7f1ff',
      borderColor: '#d0d7de',
      iconColor: '#656d76',
      inlineCodeBackground: '#f6f8fa',
      inlineCodeBorder: '#d0d7de',
      keyword: '#cf222e',
      string: '#0a3069',
      comment: '#6e7781',
      number: '#0550ae',
      function: '#8250df',
      variable: '#953800',
      operator: '#cf222e',
      type: '#0550ae',
      constant: '#0550ae',
      punctuation: '#24292f',
      className: '#8250df',
      property: '#0550ae',
      tag: '#116329',
      attr: '#8250df',
    },
    appStyles: {
      // 侧栏整体（来自 layout.tsx 原 !bg-#f2f3f5）
      'o-slider': { backgroundColor: '#f2f3f5' },
      // 主区域背景（来自 ChatLayout 原 bg-#F9FAFB）
      'o-main': { backgroundColor: '#F9FAFB' },
      // Workspace 区块背景（Header/Sider 容器，来自 ChatLayout 原 !bg-#F7F8FA）
      'o-workspace': { backgroundColor: '#F7F8FA' },
      // 侧栏菜单项（来自多处 hover/bg 硬编码）
      'o-slider-menu': {
        backgroundColor: 'transparent',
        hover: { backgroundColor: '#EBECF1' },
        active: { backgroundColor: '#E5E7F0' },
      },
      // 设置/输入容器（来自 sendbox 原 bg-white + border-#E5E6EB）
      'o-setting-group': { backgroundColor: '#ffffff', borderColor: '#E5E6EB', borderWidth: '1px', borderStyle: 'solid', borderRadius: '20px' },
      // 提示消息（来自 MessageTips 原 bg-#f0f4ff）
      'o-tips': { backgroundColor: '#f0f4ff' },
      // 右侧消息气泡（来自 MessagetText 原 bg-#E9EFFF）
      'o-message-right': { backgroundColor: '#E9EFFF' },
      'o-message-left': {},
      // 图标主色（来自多处 icon 默认 '#86909C'）
      'o-icon-color': { color: '#86909C' },
      // Logo颜色配置
      'o-logo': {
        color: '#fff', // Logo主色，与主题主色保持一致
        backgroundColor: '#000', // Logo容器背景色
      },
      // Diff header 背景（原 rgb(220,220,220)）
      'o-diff-header': { backgroundColor: 'rgb(220,220,220)' },
      // TextArea background (replace component-level !bg-white) + no border
      'o-textarea': { backgroundColor: '#ffffff', borderWidth: '0', borderStyle: 'none' },
      // Dropdown menu item (model selector) hover/active backgrounds
      'o-dropdown-item': {
        backgroundColor: 'transparent',
        hover: { backgroundColor: '#F2F3F5' },
        active: { backgroundColor: '#F2F3F5' },
      },
      // Sendbox stop indicator dot
      'o-sendbox-dot': { backgroundColor: '#86909C' },
      'o-primary-color': {},
      'o-chat-message-user': {},
      'o-chat-message-assistant': {},
      'o-chat-message-system': {},
    },
  },
  dark: {
    variables: DEFAULT_DARK_VARS,
    arco: { primaryColor: '#3491FA' },
    appStyles: {
      // Logo颜色配置 - 深色模式
      'o-logo': {
        color: '#000', // Logo主色，与深色主题主色保持一致
        backgroundColor: '#fff', // Logo容器背景色
      },
    },
  },
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
    const theme = this.data.themes.find((t) => t.id === themeId);
    if (theme) {
      this.data.state.currentThemeId = themeId;
      // 如果主题有默认模式，自动切换到默认模式
      if (theme.defaultMode) {
        this.data.state.mode = theme.defaultMode;
      }
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

    // 先清除之前的 i18n 样式，避免样式残留
    try {
      // Lazy import to avoid circular deps
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { clearAllI18nStyles } = require('./i18n-style-mapper');
      clearAllI18nStyles(root);
    } catch (_err) {
      // Ignore clearing errors
      void 0;
    }

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

    // Apply appStyles to nodes with data-app-style
    try {
      // Lazy import to avoid circular deps
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { applyAppStyles } = require('./app-style-applier');
      applyAppStyles(root);
    } catch (_err) {
      // Ignore to avoid interrupting theme switch
      void 0;
    }
  }

  private persist() {
    saveStorage(this.data);
  }
}

export const themeManager = new ThemeManager();

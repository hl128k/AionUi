export type ThemeMode = 'light' | 'dark';

export interface ThemeTokens {
  // CSS variables map, e.g., --color-bg-1
  variables: Record<string, string>;
  // Optional Arco Design tokens (subset)
  arco?: {
    primaryColor?: string;
  };
  // Optional i18n key styles mapping
  i18nStyles?: Record<string, I18nKeyStyle>;
}

export interface ThemePackMeta {
  author?: string;
  version?: string;
  description?: string;
}

export interface ThemePack {
  id: string;
  name: string;
  meta?: ThemePackMeta;
  light: ThemeTokens;
  dark: ThemeTokens;
}

export interface ThemeStateSnapshot {
  currentThemeId: string;
  mode: ThemeMode;
}

export interface ThemeStorageShape {
  themes: ThemePack[];
  state: ThemeStateSnapshot;
}

export interface I18nKeyStyle {
  colorVar?: string; // e.g., --color-text-1
  fontSize?: string; // e.g., 14px
  fontWeight?: number; // e.g., 400/500/600
  lineHeight?: string; // e.g., 22px or 1.6
  letterSpacing?: string; // e.g., 0.2px
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

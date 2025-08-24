/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

// === 类型定义 ===
export type { AppTheme, CodeHighlightPreset, CodeHighlightTheme, CSSInjectionConfig, ExternalThemeFile, GlobalAppTheme, ThemeConfig, ThemeMode, ThemeStorage } from './types';

// === 内置主题预设 ===
export { builtInPresets, createAppThemeFromPreset, getBuiltInAppThemes, getDefaultThemeForMode, githubLightPreset, monokaiPreset, solarizedLightPreset, tomorrowNightPreset, vscodeEarkPreset } from './presets';

// === 存储管理 ===
export { detectSystemTheme, IntegratedThemeStorage, themeStorage, watchSystemTheme } from './storage';

// === React Provider ===
export type { ThemeContextType, ThemeProviderProps } from './provider';

export { ThemeProvider, useCurrentTheme, useSyntaxHighlighterStyle, useThemeContext } from './provider';

// === Hooks 集合 ===
export { useCodeHighlightTheme, useSystemTheme, useThemeManager, useThemeMode, useThemePerformance, useThemePreview, useThemeSwitcher, useThemeValidator } from './hooks';

// === 主题管理器 ===
export type { ThemeManagerEventListener, ThemeManagerEvents, ThemeManagerOptions } from './manager';

export { createThemeManager, ThemeManager, themeManager } from './manager';

// === 工具函数 ===
export { BrowserUtils, ColorUtils, FileUtils, PerformanceUtils, ThemeUtils, utils } from './utils';

// === YAML 工具函数 ===
export { parseThemeFromYaml as parseYamlTheme, themeToYaml as stringifyYamlTheme, validateYamlTheme } from './yaml-utils';

// === 全局样式管理器 ===
export { createDefaultGlobalStyles, generateCSSVariables, generateGlobalCSS, globalStylesManager } from './global-styles';

// === i18n样式映射器导出 ===
export { createPredefinedMappings, i18nStyleMapper, useI18nStyleMapper } from './i18n-style-mapper';
export type { I18nBasedStyleMapping, I18nKeyStyleConfig } from './i18n-style-mapper';

// === 默认导出 ===
import { globalStylesManager } from './global-styles';
import { i18nStyleMapper } from './i18n-style-mapper';
import { i18nThemeManager } from './i18n-theme-manager';
import { themeManager, ThemeManager } from './manager';
import { builtInPresets, getBuiltInAppThemes, getDefaultThemeForMode } from './presets';
import { ThemeProvider, useCurrentTheme, useSyntaxHighlighterStyle, useThemeContext } from './provider';
import { themeStorage } from './storage';
import { utils } from './utils';

// 定义主题系统核心对象
const themeSystemCore = {
  // Provider
  ThemeProvider,
  useThemeContext,
  useCurrentTheme,
  useSyntaxHighlighterStyle,

  // Manager
  themeManager,
  ThemeManager,

  // Storage
  themeStorage,

  // Presets
  builtInPresets,
  getBuiltInAppThemes,
  getDefaultThemeForMode,

  // Utils
  utils,

  // Global Styles Manager
  globalStylesManager,

  // I18n Theme Manager
  i18nThemeManager,

  // I18n Style Mapper
  i18nStyleMapper,
};

// 创建动态加载组件的函数
export const loadThemeComponents = async () => {
  try {
    const components = await import('./components');
    return {
      ThemeSelector: components.ThemeSelector,
      ThemePreview: components.ThemePreview,
      ThemeSettings: components.ThemeSettings,
    };
  } catch (error) {
    console.warn('Failed to load theme components:', error);
    return {};
  }
};

// 默认导出核心系统
export default themeSystemCore;

/**
 * 快速设置主题系统
 * 这是一个便捷函数，用于在应用启动时快速初始化主题系统
 */
export const setupThemeSystem = async (options?: { defaultMode?: import('./types').ThemeMode; enableSystemWatch?: boolean; onThemeChange?: (theme: import('./types').AppTheme) => void; onError?: (error: Error) => void }) => {
  try {
    // 确保主题管理器已初始化
    await themeManager.initialize();

    // 设置默认模式
    if (options?.defaultMode) {
      await themeManager.setThemeMode(options.defaultMode);
    }

    // 设置事件监听
    if (options?.onThemeChange) {
      themeManager.on('theme-changed', options.onThemeChange);
    }

    if (options?.onError) {
      themeManager.on('error', options.onError);
    }

    return {
      success: true,
      manager: themeManager,
      currentTheme: themeManager.getEffectiveTheme(),
    };
  } catch (error) {
    console.error('Failed to setup theme system:', error);
    options?.onError?.(error as Error);

    return {
      success: false,
      error: error as Error,
      manager: themeManager,
      currentTheme: null as import('./types').AppTheme | null,
    };
  }
};

/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Arco Design 主题适配器
 * 负责将 AionUi 主题配置转换为 Arco Design 兼容的主题配置
 */

import type { AppTheme, ArcoThemeConfig, EnhancedGlobalAppTheme } from './types';

/**
 * 颜色工具函数
 */
export class ColorUtils {
  /**
   * 将颜色转换为 RGB 值
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * 生成颜色的浅色版本
   */
  static lighten(hex: string, amount: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const { r, g, b } = rgb;
    const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
    const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
    const newB = Math.min(255, Math.floor(b + (255 - b) * amount));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * 生成颜色的深色版本
   */
  static darken(hex: string, amount: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const { r, g, b } = rgb;
    const newR = Math.max(0, Math.floor(r * (1 - amount)));
    const newG = Math.max(0, Math.floor(g * (1 - amount)));
    const newB = Math.max(0, Math.floor(b * (1 - amount)));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * 生成主色调色板
   */
  static generatePrimaryPalette(primaryColor: string): Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10, string> {
    return {
      1: this.lighten(primaryColor, 0.9),
      2: this.lighten(primaryColor, 0.8),
      3: this.lighten(primaryColor, 0.6),
      4: this.lighten(primaryColor, 0.4),
      5: this.lighten(primaryColor, 0.2),
      6: primaryColor,
      7: this.darken(primaryColor, 0.2),
      8: this.darken(primaryColor, 0.4),
      9: this.darken(primaryColor, 0.6),
      10: this.darken(primaryColor, 0.8),
    };
  }
}

/**
 * Arco Design 主题转换器
 */
export class ArcoThemeConverter {
  /**
   * 将 AionUi 主题转换为 Arco Design 主题配置
   */
  static convertToArcoTheme(theme: AppTheme): ArcoThemeConfig {
    const { globalStyles, mode } = theme;

    if (!globalStyles) {
      return this.getDefaultArcoTheme(mode);
    }

    const arcoTheme: ArcoThemeConfig = {
      // 主色调配置
      primary: {
        primary: globalStyles.primaryColor,
        primaryLight: ColorUtils.lighten(globalStyles.primaryColor, 0.2),
        primaryDark: ColorUtils.darken(globalStyles.primaryColor, 0.2),
        primaryPalette: ColorUtils.generatePrimaryPalette(globalStyles.primaryColor),
      },

      // 辅助色配置
      colors: {
        success: globalStyles.successColor || (mode === 'dark' ? '#3fb950' : '#1a7f37'),
        warning: globalStyles.warningColor || (mode === 'dark' ? '#d29922' : '#bf8700'),
        danger: globalStyles.errorColor || (mode === 'dark' ? '#f85149' : '#cf222e'),
        info: globalStyles.primaryColor,
        link: globalStyles.accentColor,
      },

      // 中性色配置
      neutral: {
        colorText: globalStyles.mainColor,
        colorTextSecondary: mode === 'dark' ? '#8b949e' : '#656d76',
        colorTextTertiary: mode === 'dark' ? '#6e7681' : '#8c959f',
        colorTextQuaternary: mode === 'dark' ? '#484f58' : '#d0d7de',

        colorBg: globalStyles.mainBackground,
        colorBgSecondary: globalStyles.siderBackground,
        colorBgTertiary: mode === 'dark' ? '#30363d' : '#f6f8fa',
        colorBgQuaternary: mode === 'dark' ? '#21262d' : '#ffffff',

        colorBorder: globalStyles.siderBorder,
        colorBorderSecondary: mode === 'dark' ? '#21262d' : '#e1e4e8',
      },

      // 组件特定配置
      components: {
        Button: {
          colorPrimary: globalStyles.primaryColor,
          colorHover: ColorUtils.lighten(globalStyles.primaryColor, 0.1),
          colorActive: ColorUtils.darken(globalStyles.primaryColor, 0.1),
          colorDisabled: mode === 'dark' ? '#484f58' : '#d0d7de',
          borderRadius: 6,
        },

        Menu: {
          colorItemText: globalStyles.menuItemColor,
          colorItemTextHover: globalStyles.menuItemHoverColor,
          colorItemTextSelected: globalStyles.menuItemActiveColor,
          colorItemBg: globalStyles.menuItemBackground,
          colorItemBgHover: globalStyles.menuItemHoverBackground,
          colorItemBgSelected: globalStyles.menuItemActiveBackground,
        },

        Message: {
          colorBg: globalStyles.assistantMessageBackground,
          colorText: globalStyles.assistantMessageColor,
          borderRadius: 8,
        },

        Layout: {
          colorSiderBg: globalStyles.siderBackground,
          colorHeaderBg: globalStyles.siderBackground,
          colorContentBg: globalStyles.mainBackground,
          colorBorder: globalStyles.siderBorder,
        },
      },

      // 尺寸规范
      sizing: {
        borderRadius: 6,
        borderRadiusSmall: 4,
        borderRadiusLarge: 12,
        spacingXS: 4,
        spacingS: 8,
        spacingM: 16,
        spacingL: 24,
        spacingXL: 32,
      },

      // 字体配置
      typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontFamilyCode: theme.codeHighlight.fontFamily || 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
        fontSize: 14,
        fontSizeSmall: 12,
        fontSizeLarge: 16,
        lineHeight: 1.5715,
      },

      // 阴影配置
      shadows: {
        boxShadowCard: mode === 'dark' ? '0 2px 8px 0 rgba(0, 0, 0, 0.15)' : '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
        boxShadowDrawer: mode === 'dark' ? '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12)' : '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12)',
        boxShadowModal: mode === 'dark' ? '0 4px 12px 0 rgba(0, 0, 0, 0.15)' : '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
        boxShadowPopup: mode === 'dark' ? '0 4px 12px 0 rgba(0, 0, 0, 0.1)' : '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
      },

      // 动画配置
      motion: {
        durationFast: '0.1s',
        durationMid: '0.2s',
        durationSlow: '0.3s',
        easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
        easeOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
      },
    };

    return arcoTheme;
  }

  /**
   * 获取默认的 Arco Design 主题配置
   */
  static getDefaultArcoTheme(mode: 'light' | 'dark'): ArcoThemeConfig {
    const primaryColor = mode === 'dark' ? '#1890ff' : '#165DFF';

    return {
      primary: {
        primary: primaryColor,
        primaryLight: ColorUtils.lighten(primaryColor, 0.2),
        primaryDark: ColorUtils.darken(primaryColor, 0.2),
        primaryPalette: ColorUtils.generatePrimaryPalette(primaryColor),
      },

      colors: {
        success: mode === 'dark' ? '#00b42a' : '#00b42a',
        warning: mode === 'dark' ? '#ff7d00' : '#ff7d00',
        danger: mode === 'dark' ? '#f53f3f' : '#f53f3f',
        info: primaryColor,
        link: primaryColor,
      },

      neutral: {
        colorText: mode === 'dark' ? '#f7f8fa' : '#1d2129',
        colorTextSecondary: mode === 'dark' ? '#c9cdd4' : '#4e5969',
        colorTextTertiary: mode === 'dark' ? '#a9aeb8' : '#86909c',
        colorTextQuaternary: mode === 'dark' ? '#6b7785' : '#c9cdd4',

        colorBg: mode === 'dark' ? '#17171a' : '#ffffff',
        colorBgSecondary: mode === 'dark' ? '#232324' : '#f7f8fa',
        colorBgTertiary: mode === 'dark' ? '#2a2a2b' : '#f2f3f5',
        colorBgQuaternary: mode === 'dark' ? '#373739' : '#e5e6eb',

        colorBorder: mode === 'dark' ? '#2e2e30' : '#e5e6eb',
        colorBorderSecondary: mode === 'dark' ? '#3c3c3f' : '#f2f3f5',
      },
    };
  }

  /**
   * 将 Arco Design 主题配置转换为 CSS 变量
   */
  static arcoThemeToCSSVariables(arcoTheme: ArcoThemeConfig): Record<string, string> {
    const cssVars: Record<string, string> = {};

    // 主色调变量
    if (arcoTheme.primary?.primary) {
      cssVars['--arcoblue-6'] = arcoTheme.primary.primary;
      cssVars['--primary-6'] = arcoTheme.primary.primary;
    }

    if (arcoTheme.primary?.primaryPalette) {
      Object.entries(arcoTheme.primary.primaryPalette).forEach(([key, value]) => {
        cssVars[`--arcoblue-${key}`] = value;
        cssVars[`--primary-${key}`] = value;
      });
    }

    // 辅助色变量
    if (arcoTheme.colors) {
      if (arcoTheme.colors.success) cssVars['--green-6'] = arcoTheme.colors.success;
      if (arcoTheme.colors.warning) cssVars['--orange-6'] = arcoTheme.colors.warning;
      if (arcoTheme.colors.danger) cssVars['--red-6'] = arcoTheme.colors.danger;
      if (arcoTheme.colors.info) cssVars['--arcoblue-6'] = arcoTheme.colors.info;
    }

    // 中性色变量
    if (arcoTheme.neutral) {
      if (arcoTheme.neutral.colorText) cssVars['--color-text-1'] = arcoTheme.neutral.colorText;
      if (arcoTheme.neutral.colorTextSecondary) cssVars['--color-text-2'] = arcoTheme.neutral.colorTextSecondary;
      if (arcoTheme.neutral.colorTextTertiary) cssVars['--color-text-3'] = arcoTheme.neutral.colorTextTertiary;
      if (arcoTheme.neutral.colorTextQuaternary) cssVars['--color-text-4'] = arcoTheme.neutral.colorTextQuaternary;

      if (arcoTheme.neutral.colorBg) cssVars['--color-bg-1'] = arcoTheme.neutral.colorBg;
      if (arcoTheme.neutral.colorBgSecondary) cssVars['--color-bg-2'] = arcoTheme.neutral.colorBgSecondary;
      if (arcoTheme.neutral.colorBgTertiary) cssVars['--color-bg-3'] = arcoTheme.neutral.colorBgTertiary;
      if (arcoTheme.neutral.colorBgQuaternary) cssVars['--color-bg-4'] = arcoTheme.neutral.colorBgQuaternary;

      if (arcoTheme.neutral.colorBorder) cssVars['--color-border'] = arcoTheme.neutral.colorBorder;
      if (arcoTheme.neutral.colorBorderSecondary) cssVars['--color-border-2'] = arcoTheme.neutral.colorBorderSecondary;
    }

    return cssVars;
  }

  /**
   * 生成增强版的全局主题样式
   */
  static createEnhancedGlobalStyles(theme: AppTheme): EnhancedGlobalAppTheme {
    const baseGlobalStyles = theme.globalStyles || this.getDefaultGlobalStyles(theme.mode);
    const arcoTheme = this.convertToArcoTheme(theme);

    return {
      ...baseGlobalStyles,
      arcoTheme,
      useArcoNativeTheme: true,
      arcoThemeByMode: {
        [theme.mode]: arcoTheme,
      },
      cssVariables: this.arcoThemeToCSSVariables(arcoTheme),
    };
  }

  /**
   * 获取默认的全局样式
   */
  private static getDefaultGlobalStyles(mode: 'light' | 'dark') {
    return {
      siderBackground: mode === 'dark' ? '#232324' : '#f7f8fa',
      siderColor: mode === 'dark' ? '#f7f8fa' : '#1d2129',
      siderBorder: mode === 'dark' ? '#2e2e30' : '#e5e6eb',
      mainBackground: mode === 'dark' ? '#17171a' : '#ffffff',
      mainColor: mode === 'dark' ? '#f7f8fa' : '#1d2129',
      menuItemColor: mode === 'dark' ? '#c9cdd4' : '#4e5969',
      menuItemBackground: 'transparent',
      menuItemHoverColor: mode === 'dark' ? '#f7f8fa' : '#1d2129',
      menuItemHoverBackground: mode === 'dark' ? '#2a2a2b' : '#f2f3f5',
      menuItemActiveColor: mode === 'dark' ? '#1890ff' : '#165DFF',
      menuItemActiveBackground: mode === 'dark' ? '#373739' : '#e5e6eb',
      userMessageBackground: mode === 'dark' ? '#1890ff' : '#165DFF',
      userMessageColor: '#ffffff',
      userMessageBorder: mode === 'dark' ? '#40a9ff' : '#4080ff',
      assistantMessageBackground: mode === 'dark' ? '#232324' : '#f7f8fa',
      assistantMessageColor: mode === 'dark' ? '#f7f8fa' : '#1d2129',
      assistantMessageBorder: mode === 'dark' ? '#2e2e30' : '#e5e6eb',
      systemMessageBackground: mode === 'dark' ? '#373739' : '#f2f3f5',
      systemMessageColor: mode === 'dark' ? '#c9cdd4' : '#4e5969',
      systemMessageBorder: mode === 'dark' ? '#2e2e30' : '#e5e6eb',
      workspaceBackground: mode === 'dark' ? '#17171a' : '#ffffff',
      workspaceColor: mode === 'dark' ? '#f7f8fa' : '#1d2129',
      workspaceBorder: mode === 'dark' ? '#2e2e30' : '#e5e6eb',
      settingGroupBackground: mode === 'dark' ? '#232324' : '#f7f8fa',
      settingGroupColor: mode === 'dark' ? '#f7f8fa' : '#1d2129',
      settingGroupBorder: mode === 'dark' ? '#2e2e30' : '#e5e6eb',
      primaryColor: mode === 'dark' ? '#1890ff' : '#165DFF',
      iconColor: mode === 'dark' ? '#c9cdd4' : '#4e5969',
      accentColor: mode === 'dark' ? '#40a9ff' : '#4080ff',
      successColor: '#00b42a',
      warningColor: '#ff7d00',
      errorColor: '#f53f3f',
    };
  }
}

/**
 * 主题适配器管理器
 */
export class ArcoThemeAdapter {
  private static instance: ArcoThemeAdapter;
  private themeCache: Map<string, ArcoThemeConfig> = new Map();
  private performanceMetrics: {
    cacheHits: number;
    cacheMisses: number;
    conversionTime: number[];
  } = {
    cacheHits: 0,
    cacheMisses: 0,
    conversionTime: [],
  };

  static getInstance(): ArcoThemeAdapter {
    if (!ArcoThemeAdapter.instance) {
      ArcoThemeAdapter.instance = new ArcoThemeAdapter();
    }
    return ArcoThemeAdapter.instance;
  }

  /**
   * 获取 Arco Design 主题配置（带缓存和性能监控）
   */
  getArcoThemeConfig(theme: AppTheme): ArcoThemeConfig {
    const cacheKey = `${theme.id}-${theme.updatedAt || 'default'}`;
    const startTime = performance.now();

    try {
      if (this.themeCache.has(cacheKey)) {
        this.performanceMetrics.cacheHits++;
        return this.themeCache.get(cacheKey)!;
      }

      this.performanceMetrics.cacheMisses++;
      const arcoTheme = ArcoThemeConverter.convertToArcoTheme(theme);

      // 限制缓存大小，防止内存泄漏
      if (this.themeCache.size >= 50) {
        const firstKey = this.themeCache.keys().next().value;
        this.themeCache.delete(firstKey);
      }

      this.themeCache.set(cacheKey, arcoTheme);

      const conversionTime = performance.now() - startTime;
      this.performanceMetrics.conversionTime.push(conversionTime);

      // 只保留最近100次转换时间记录
      if (this.performanceMetrics.conversionTime.length > 100) {
        this.performanceMetrics.conversionTime.shift();
      }

      return arcoTheme;
    } catch (error) {
      console.error('[ArcoThemeAdapter] Error converting theme:', error);
      // 返回默认主题配置作为后备
      return ArcoThemeConverter.getDefaultArcoTheme(theme.mode);
    }
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics() {
    const avgConversionTime = this.performanceMetrics.conversionTime.length > 0 ? this.performanceMetrics.conversionTime.reduce((a, b) => a + b, 0) / this.performanceMetrics.conversionTime.length : 0;

    return {
      cacheHits: this.performanceMetrics.cacheHits,
      cacheMisses: this.performanceMetrics.cacheMisses,
      cacheHitRate: this.performanceMetrics.cacheHits / (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) || 0,
      averageConversionTime: avgConversionTime,
      cacheSize: this.themeCache.size,
    };
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.themeCache.clear();
    // 重置性能指标
    this.performanceMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      conversionTime: [],
    };
  }

  /**
   * 预热缓存（带错误处理）
   */
  preloadThemes(themes: AppTheme[]): void {
    try {
      themes.forEach((theme) => {
        this.getArcoThemeConfig(theme);
      });
      console.log(`🎨 [ArcoThemeAdapter] Preloaded ${themes.length} themes`);
    } catch (error) {
      console.error('[ArcoThemeAdapter] Error preloading themes:', error);
    }
  }

  /**
   * 智能缓存清理
   */
  optimizeCache(): void {
    const metrics = this.getPerformanceMetrics();

    // 如果缓存命中率低于50%，清理缓存
    if (metrics.cacheHitRate < 0.5 && this.themeCache.size > 10) {
      console.warn('🎨 [ArcoThemeAdapter] Low cache hit rate, clearing cache for optimization');
      this.clearCache();
    }
  }
}

// 导出单例实例
export const arcoThemeAdapter = ArcoThemeAdapter.getInstance();

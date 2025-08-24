/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * i18n主题管理器
 * 根据语言/地区自动切换主题，支持基于i18n key的动态主题配置
 */

import i18n from '@/renderer/i18n';
import { globalStylesManager } from './global-styles';
import { themeStorage } from './storage';
import type { AppTheme, GlobalAppTheme, I18nThemeConfig, I18nThemeMapping } from './types';

/**
 * i18n主题管理器类
 */
class I18nThemeManager {
  private static instance: I18nThemeManager;
  private currentLocale: string = 'en-US';
  private i18nConfig: I18nThemeConfig | null = null;
  private localeThemeCache = new Map<string, AppTheme>();

  static getInstance(): I18nThemeManager {
    if (!I18nThemeManager.instance) {
      I18nThemeManager.instance = new I18nThemeManager();
    }
    return I18nThemeManager.instance;
  }

  /**
   * 初始化i18n主题管理器
   */
  async initialize(): Promise<void> {
    try {
      // 获取当前配置
      const baseConfig = await themeStorage.getThemeConfig();
      this.i18nConfig = {
        ...baseConfig,
        enableI18nThemes: false, // 默认关闭
      } as I18nThemeConfig;

      // 监听语言变化
      this.currentLocale = i18n.language || 'en-US';
      i18n.on('languageChanged', this.handleLanguageChange.bind(this));

      console.log('🌍 I18n Theme Manager initialized');
    } catch (error) {
      console.error('Failed to initialize I18n Theme Manager:', error);
    }
  }

  /**
   * 启用i18n主题功能
   */
  async enableI18nThemes(lightMapping?: I18nThemeMapping, darkMapping?: I18nThemeMapping): Promise<void> {
    if (!this.i18nConfig) {
      throw new Error('I18n Theme Manager not initialized');
    }

    this.i18nConfig.enableI18nThemes = true;
    if (lightMapping) this.i18nConfig.i18nLightThemes = lightMapping;
    if (darkMapping) this.i18nConfig.i18nDarkThemes = darkMapping;

    await themeStorage.saveThemeConfig(this.i18nConfig);
    await this.applyLocaleTheme();

    console.log('🎨 I18n themes enabled');
  }

  /**
   * 禁用i18n主题功能
   */
  async disableI18nThemes(): Promise<void> {
    if (!this.i18nConfig) return;

    this.i18nConfig.enableI18nThemes = false;
    await themeStorage.saveThemeConfig(this.i18nConfig);

    console.log('🎨 I18n themes disabled');
  }

  /**
   * 设置语言特定主题映射
   */
  async setLocaleThemeMapping(mode: 'light' | 'dark', mapping: I18nThemeMapping): Promise<void> {
    if (!this.i18nConfig) {
      throw new Error('I18n Theme Manager not initialized');
    }

    if (mode === 'light') {
      this.i18nConfig.i18nLightThemes = mapping;
    } else {
      this.i18nConfig.i18nDarkThemes = mapping;
    }

    await themeStorage.saveThemeConfig(this.i18nConfig);
    await this.applyLocaleTheme();
  }

  /**
   * 根据当前语言获取应该应用的主题ID
   */
  getThemeIdForLocale(mode: 'light' | 'dark'): string | null {
    if (!this.i18nConfig?.enableI18nThemes) return null;

    const mapping = mode === 'light' ? this.i18nConfig.i18nLightThemes : this.i18nConfig.i18nDarkThemes;

    if (!mapping) return null;

    // 优先使用精确匹配的locale
    if (mapping.locales[this.currentLocale]) {
      return mapping.locales[this.currentLocale];
    }

    // 尝试语言匹配（如 en-US -> en）
    const language = this.currentLocale.split('-')[0];
    for (const [locale, themeId] of Object.entries(mapping.locales)) {
      if (locale.startsWith(language)) {
        return themeId;
      }
    }

    // 返回默认主题
    return mapping.default;
  }

  /**
   * 应用当前语言的主题
   */
  async applyLocaleTheme(): Promise<void> {
    if (!this.i18nConfig?.enableI18nThemes) return;

    // 确定当前应该使用的模式
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const effectiveMode = this.i18nConfig.themeMode === 'auto' ? systemTheme : this.i18nConfig.themeMode;

    const themeId = this.getThemeIdForLocale(effectiveMode);
    if (!themeId) return;

    // 获取并应用主题
    const theme = await themeStorage.getTheme(themeId);
    if (theme) {
      // 应用本地化增强
      const enhancedTheme = await this.enhanceThemeWithLocale(theme);

      // 应用主题到全局样式管理器
      globalStylesManager.applyGlobalTheme(enhancedTheme);

      console.log(`🌍 Applied ${effectiveMode} theme for locale ${this.currentLocale}:`, theme.name);
    }
  }

  /**
   * 使用locale特定样式增强主题
   */
  private async enhanceThemeWithLocale(theme: AppTheme): Promise<AppTheme> {
    // 检查是否有locale特定的样式覆盖
    const cacheKey = `${theme.id}-${this.currentLocale}`;

    if (this.localeThemeCache.has(cacheKey)) {
      return this.localeThemeCache.get(cacheKey)!;
    }

    const enhancedTheme = { ...theme };

    // 应用基于i18n key的动态样式
    if (theme.globalStyles) {
      enhancedTheme.globalStyles = await this.applyI18nBasedStyles(theme.globalStyles);
    }

    // 缓存增强后的主题
    this.localeThemeCache.set(cacheKey, enhancedTheme);
    return enhancedTheme;
  }

  /**
   * 应用基于i18n key的动态样式
   */
  private async applyI18nBasedStyles(globalStyles: GlobalAppTheme): Promise<GlobalAppTheme> {
    let enhanced = { ...globalStyles };

    // 根据语言调整样式
    switch (this.currentLocale) {
      case 'zh-CN':
      case 'zh-TW':
        // 中文环境下的样式调整
        enhanced.primaryColor = this.adjustColorForChinese(enhanced.primaryColor);
        break;

      case 'ja-JP':
        // 日文环境下的样式调整
        enhanced.primaryColor = this.adjustColorForJapanese(enhanced.primaryColor);
        break;

      default:
        // 默认样式保持不变
        break;
    }

    // 根据i18n key动态调整特定组件的样式
    enhanced = await this.applyComponentBasedI18nStyles(enhanced);

    return enhanced;
  }

  /**
   * 根据组件的i18n key应用样式
   */
  private async applyComponentBasedI18nStyles(globalStyles: GlobalAppTheme): Promise<GlobalAppTheme> {
    const enhanced = { ...globalStyles };

    // 示例：根据设置页面的翻译key动态调整设置区域的样式
    const settingsTranslation = i18n.t('settings', { returnObjects: true }) as any;

    if (settingsTranslation) {
      // 如果当前语言的设置文字较长，调整设置组的宽度相关样式
      const avgTextLength = this.calculateAverageTextLength(settingsTranslation);
      if (avgTextLength > 10) {
        // 文字较长时，调整背景色使其更突出
        enhanced.settingGroupBackground = this.adjustBrightnessForLongText(enhanced.settingGroupBackground);
      }
    }

    return enhanced;
  }

  /**
   * 为中文环境调整颜色
   */
  private adjustColorForChinese(color: string): string {
    // 中文用户偏好的颜色调整
    return this.adjustColorHue(color, 15); // 稍微暖化色调
  }

  /**
   * 为日文环境调整颜色
   */
  private adjustColorForJapanese(color: string): string {
    // 日文用户偏好的颜色调整
    return this.adjustColorHue(color, -10); // 稍微冷化色调
  }

  /**
   * 调整颜色色调
   */
  private adjustColorHue(color: string, adjustment: number): string {
    // 简单的颜色调整实现
    // 这里可以使用更sophisticated的颜色处理库
    try {
      if (color.startsWith('#')) {
        // 简化的HSL调整
        return color; // 暂时返回原色，实际可以实现HSL转换
      }
      return color;
    } catch {
      return color;
    }
  }

  /**
   * 计算翻译文本的平均长度
   */
  private calculateAverageTextLength(translations: any): number {
    const texts = this.extractAllTexts(translations);
    const totalLength = texts.reduce((sum, text) => sum + text.length, 0);
    return totalLength / texts.length || 0;
  }

  /**
   * 从翻译对象中提取所有文本
   */
  private extractAllTexts(obj: any, texts: string[] = []): string[] {
    if (typeof obj === 'string') {
      texts.push(obj);
    } else if (typeof obj === 'object' && obj !== null) {
      Object.values(obj).forEach((value) => this.extractAllTexts(value, texts));
    }
    return texts;
  }

  /**
   * 为长文本调整背景亮度
   */
  private adjustBrightnessForLongText(backgroundColor: string): string {
    // 简化实现，实际可以根据需要调整亮度
    return backgroundColor;
  }

  /**
   * 处理语言变化事件
   */
  private async handleLanguageChange(newLanguage: string): Promise<void> {
    this.currentLocale = newLanguage;

    // 清除缓存以确保使用新的语言设置
    this.localeThemeCache.clear();

    // 重新应用主题
    await this.applyLocaleTheme();

    console.log(`🌍 Language changed to ${newLanguage}, theme updated`);
  }

  /**
   * 获取当前的i18n配置
   */
  getI18nConfig(): I18nThemeConfig | null {
    return this.i18nConfig;
  }

  /**
   * 获取当前语言
   */
  getCurrentLocale(): string {
    return this.currentLocale;
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLocales(): string[] {
    return ['zh-CN', 'en-US', 'ja-JP', 'zh-TW'];
  }
}

// 导出单例实例
export const i18nThemeManager = I18nThemeManager.getInstance();

/**
 * 创建默认的i18n主题映射
 */
export function createDefaultI18nThemeMapping(defaultThemeId: string, localeOverrides: Record<string, string> = {}): I18nThemeMapping {
  return {
    default: defaultThemeId,
    locales: {
      'zh-CN': localeOverrides['zh-CN'] || defaultThemeId,
      'en-US': localeOverrides['en-US'] || defaultThemeId,
      'ja-JP': localeOverrides['ja-JP'] || defaultThemeId,
      'zh-TW': localeOverrides['zh-TW'] || defaultThemeId,
      ...localeOverrides,
    },
  };
}

/**
 * Hook: 使用i18n主题管理器
 */
export function useI18nThemeManager() {
  return {
    manager: i18nThemeManager,
    enableI18nThemes: i18nThemeManager.enableI18nThemes.bind(i18nThemeManager),
    disableI18nThemes: i18nThemeManager.disableI18nThemes.bind(i18nThemeManager),
    setLocaleThemeMapping: i18nThemeManager.setLocaleThemeMapping.bind(i18nThemeManager),
    getCurrentLocale: i18nThemeManager.getCurrentLocale.bind(i18nThemeManager),
    getSupportedLocales: i18nThemeManager.getSupportedLocales.bind(i18nThemeManager),
    getI18nConfig: i18nThemeManager.getI18nConfig.bind(i18nThemeManager),
  };
}

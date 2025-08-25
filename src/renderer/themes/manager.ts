/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { getBuiltInAppThemes, getDefaultThemeForMode } from './presets';
import { detectSystemTheme, themeStorage, watchSystemTheme } from './storage';
import type { AppTheme, CodeHighlightTheme, ThemeMode } from './types';

/**
 * 主题管理器事件类型
 */
export interface ThemeManagerEvents {
  'theme-changed': AppTheme;
  'theme-mode-changed': ThemeMode;
  'themes-updated': AppTheme[];
  'system-theme-changed': 'light' | 'dark';
  error: Error;
}

/**
 * 主题管理器事件监听器
 */
export type ThemeManagerEventListener<T extends keyof ThemeManagerEvents> = (data: ThemeManagerEvents[T]) => void;

/**
 * 主题管理器选项
 */
export interface ThemeManagerOptions {
  autoInit?: boolean;
  enableSystemThemeWatch?: boolean;
  defaultMode?: ThemeMode;
  onError?: (error: Error) => void;
}

/**
 * AionUi 主题管理器
 *
 * 这是一个单例主题管理器，提供：
 * 1. 主题状态的集中管理
 * 2. 事件驱动的主题更新
 * 3. 自动系统主题跟随
 * 4. 主题缓存和性能优化
 * 5. 错误处理和恢复机制
 */
export class ThemeManager {
  private static instance: ThemeManager | null = null;

  // 状态
  private currentTheme: AppTheme | null = null;
  private themeMode: ThemeMode = 'auto';
  private systemTheme: 'light' | 'dark' = 'light';
  private availableThemes: AppTheme[] = [];
  private isInitialized = false;
  private isLoading = false;

  // 事件管理
  private eventListeners: Map<keyof ThemeManagerEvents, Set<Function>> = new Map();
  private systemThemeCleanup: (() => void) | null = null;

  // 缓存
  private themeCache: Map<string, AppTheme> = new Map();
  private styleCache: Map<string, Record<string, any>> = new Map();

  // 配置
  private options: Required<ThemeManagerOptions>;

  /**
   * 私有构造函数 - 单例模式
   */
  private constructor(options: ThemeManagerOptions = {}) {
    this.options = {
      autoInit: true,
      enableSystemThemeWatch: true,
      defaultMode: 'auto',
      onError: () => {},
      ...options,
    };

    this.systemTheme = detectSystemTheme();

    if (this.options.autoInit) {
      this.initialize().catch((error) => {
        this.handleError(error, 'initialization');
      });
    }
  }

  /**
   * 获取单例实例
   */
  public static getInstance(options?: ThemeManagerOptions): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager(options);
    }
    return ThemeManager.instance;
  }

  /**
   * 重置单例实例 (主要用于测试)
   */
  public static resetInstance(): void {
    if (ThemeManager.instance) {
      ThemeManager.instance.destroy();
      ThemeManager.instance = null;
    }
  }

  /**
   * 初始化主题管理器
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.isLoading = true;

      // 加载主题配置
      const config = await themeStorage.getThemeConfig();
      this.themeMode = config.themeMode;
      this.availableThemes = config.availableThemes;

      // 加载当前主题
      await this.loadCurrentTheme(config.currentTheme);

      // 设置系统主题监听
      if (this.options.enableSystemThemeWatch) {
        this.setupSystemThemeWatch();
      }

      this.isInitialized = true;
      this.emit('themes-updated', this.availableThemes);
    } catch (error) {
      this.handleError(error as Error, 'initialize');

      // 失败时的回退逻辑
      await this.initializeWithDefaults();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * 使用默认值初始化
   */
  private async initializeWithDefaults(): Promise<void> {
    try {
      this.availableThemes = getBuiltInAppThemes();
      const defaultTheme = getDefaultThemeForMode('light');
      this.currentTheme = defaultTheme;
      this.themeMode = this.options.defaultMode;

      // 保存默认配置
      await themeStorage.saveThemeConfig({
        currentTheme: defaultTheme.id,
        themeMode: this.themeMode,
        autoMode: this.themeMode === 'auto',
        availableThemes: this.availableThemes,
      });

      this.isInitialized = true;
    } catch (error) {
      this.handleError(error as Error, 'initializeWithDefaults');
    }
  }

  /**
   * 加载当前主题
   */
  private async loadCurrentTheme(themeId: string): Promise<void> {
    try {
      let theme = this.themeCache.get(themeId);

      if (!theme) {
        theme = await themeStorage.getTheme(themeId);
        if (theme) {
          this.themeCache.set(themeId, theme);
        }
      }

      if (theme) {
        this.currentTheme = theme;
        this.emit('theme-changed', theme);
      } else {
        // 主题不存在，使用默认主题
        const defaultTheme = getDefaultThemeForMode('light');
        this.currentTheme = defaultTheme;
        this.emit('theme-changed', defaultTheme);
      }
    } catch (error) {
      this.handleError(error as Error, 'loadCurrentTheme');
    }
  }

  /**
   * 设置系统主题监听
   */
  private setupSystemThemeWatch(): void {
    this.systemThemeCleanup = watchSystemTheme((newSystemTheme) => {
      if (newSystemTheme !== this.systemTheme) {
        this.systemTheme = newSystemTheme;
        this.emit('system-theme-changed', newSystemTheme);

        // 如果是自动模式，需要更新当前主题
        if (this.themeMode === 'auto') {
          this.updateAutoModeTheme().catch((error) => {
            this.handleError(error, 'updateAutoModeTheme');
          });
        }
      }
    });
  }

  /**
   * 更新自动模式下的主题
   */
  private async updateAutoModeTheme(): Promise<void> {
    if (this.themeMode !== 'auto') return;

    const targetMode = this.systemTheme;
    const themesOfMode = this.availableThemes.filter((t) => t.mode === targetMode);

    if (themesOfMode.length === 0) return;

    // 如果当前主题模式不匹配，切换到默认主题
    if (!this.currentTheme || this.currentTheme.mode !== targetMode) {
      const defaultTheme = getDefaultThemeForMode(targetMode);
      await this.setTheme(defaultTheme.id, false); // false 表示不保存配置
    }
  }

  /**
   * 设置主题
   */
  public async setTheme(themeId: string, saveConfig = true): Promise<void> {
    try {
      const theme = await this.getTheme(themeId);
      if (!theme) {
        throw new Error(`Theme not found: ${themeId}`);
      }

      this.currentTheme = theme;
      this.emit('theme-changed', theme);

      if (saveConfig) {
        const config = await themeStorage.getThemeConfig();
        await themeStorage.saveThemeConfig({
          ...config,
          currentTheme: themeId,
        });
      }

      // 清除相关的样式缓存
      this.clearStyleCache(themeId);
    } catch (error) {
      this.handleError(error as Error, 'setTheme');
    }
  }

  /**
   * 设置主题模式
   */
  public async setThemeMode(mode: ThemeMode): Promise<void> {
    try {
      const oldMode = this.themeMode;
      this.themeMode = mode;
      this.emit('theme-mode-changed', mode);

      // 保存配置
      const config = await themeStorage.getThemeConfig();
      await themeStorage.saveThemeConfig({
        ...config,
        themeMode: mode,
        autoMode: mode === 'auto',
      });

      // 如果模式发生变化，可能需要切换主题
      if (oldMode !== mode) {
        if (mode === 'auto') {
          await this.updateAutoModeTheme();
        } else if (this.currentTheme?.mode !== mode) {
          const themesOfMode = this.availableThemes.filter((t) => t.mode === mode);
          if (themesOfMode.length > 0) {
            const defaultTheme = getDefaultThemeForMode(mode);
            await this.setTheme(defaultTheme.id, false);
          }
        }
      }
    } catch (error) {
      this.handleError(error as Error, 'setThemeMode');
    }
  }

  /**
   * 获取主题
   */
  public async getTheme(themeId: string): Promise<AppTheme | null> {
    try {
      // 优先从缓存获取
      let theme = this.themeCache.get(themeId);

      if (!theme) {
        theme = await themeStorage.getTheme(themeId);
        if (theme) {
          this.themeCache.set(themeId, theme);
        }
      }

      return theme;
    } catch (error) {
      this.handleError(error as Error, 'getTheme');
      return null;
    }
  }

  /**
   * 获取当前生效的主题
   */
  public getEffectiveTheme(): AppTheme | null {
    if (!this.currentTheme) return null;

    if (this.themeMode === 'auto') {
      const targetMode = this.systemTheme;

      if (this.currentTheme.mode === targetMode) {
        return this.currentTheme;
      }

      return getDefaultThemeForMode(targetMode);
    }

    return this.currentTheme;
  }

  /**
   * 刷新主题列表
   */
  public async refreshThemes(): Promise<void> {
    try {
      const themes = await themeStorage.getAllThemes();
      this.availableThemes = themes;
      this.emit('themes-updated', themes);

      // 清除主题缓存
      this.themeCache.clear();
    } catch (error) {
      this.handleError(error as Error, 'refreshThemes');
    }
  }

  /**
   * 导入主题
   */
  public async importTheme(file: File): Promise<AppTheme | null> {
    try {
      const theme = await themeStorage.importTheme(JSON.parse(await file.text()));

      // 刷新主题列表
      await this.refreshThemes();

      return theme;
    } catch (error) {
      this.handleError(error as Error, 'importTheme');
      return null;
    }
  }

  /**
   * 导出主题
   */
  public async exportTheme(themeId: string): Promise<boolean> {
    try {
      await themeStorage.exportTheme(themeId);
      return true;
    } catch (error) {
      this.handleError(error as Error, 'exportTheme');
      return false;
    }
  }

  /**
   * 删除主题
   */
  public async deleteTheme(themeId: string): Promise<boolean> {
    try {
      const result = await themeStorage.deleteTheme(themeId);

      if (result) {
        // 如果删除的是当前主题，切换到默认主题
        if (this.currentTheme?.id === themeId) {
          const defaultTheme = getDefaultThemeForMode(this.currentTheme.mode);
          await this.setTheme(defaultTheme.id);
        }

        // 清除缓存
        this.themeCache.delete(themeId);
        this.clearStyleCache(themeId);

        // 刷新主题列表
        await this.refreshThemes();
      }

      return result;
    } catch (error) {
      this.handleError(error as Error, 'deleteTheme');
      return false;
    }
  }

  /**
   * 生成语法高亮样式
   */
  public generateSyntaxHighlighterStyle(theme?: CodeHighlightTheme): Record<string, any> {
    const effectiveTheme = this.getEffectiveTheme();
    const codeTheme = theme || effectiveTheme?.codeHighlight;

    if (!codeTheme) return {};

    // 缓存键
    const cacheKey = theme ? `custom-${Date.now()}` : effectiveTheme!.id;

    // 检查缓存
    if (this.styleCache.has(cacheKey)) {
      return this.styleCache.get(cacheKey)!;
    }

    // 生成样式
    const style = {
      'code[class*="language-"]': {
        color: codeTheme.color,
        background: codeTheme.background,
        fontFamily: codeTheme.fontFamily || 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
        fontSize: codeTheme.fontSize || '14px',
        lineHeight: codeTheme.lineHeight || '1.45',
      },
      'pre[class*="language-"]': {
        color: codeTheme.color,
        background: codeTheme.background,
        fontFamily: codeTheme.fontFamily || 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
        fontSize: codeTheme.fontSize || '14px',
        lineHeight: codeTheme.lineHeight || '1.45',
      },

      // 语法高亮规则
      '.token.comment': { color: codeTheme.comment },
      '.token.prolog': { color: codeTheme.comment },
      '.token.doctype': { color: codeTheme.comment },
      '.token.cdata': { color: codeTheme.comment },

      '.token.punctuation': { color: codeTheme.punctuation },
      '.token.delimiter': { color: codeTheme.punctuation },

      '.token.keyword': { color: codeTheme.keyword },
      '.token.selector': { color: codeTheme.keyword },
      '.token.important': { color: codeTheme.keyword },
      '.token.atrule': { color: codeTheme.keyword },

      '.token.operator': { color: codeTheme.operator },
      '.token.url': { color: codeTheme.operator },

      '.token.attr-name': { color: codeTheme.attr || codeTheme.property },
      '.token.property': { color: codeTheme.property || codeTheme.variable },

      '.token.string': { color: codeTheme.string },
      '.token.char': { color: codeTheme.string },

      '.token.number': { color: codeTheme.number },
      '.token.boolean': { color: codeTheme.number },
      '.token.constant': { color: codeTheme.constant },

      '.token.variable': { color: codeTheme.variable },
      '.token.symbol': { color: codeTheme.variable },

      '.token.function': { color: codeTheme.function },
      '.token.attr-value': { color: codeTheme.function },

      '.token.class-name': { color: codeTheme.className || codeTheme.type },
      '.token.builtin': { color: codeTheme.type },

      '.token.tag': { color: codeTheme.tag || codeTheme.keyword },

      '.token.regex': { color: codeTheme.regex || codeTheme.string },

      '.token.namespace': { color: codeTheme.namespace || codeTheme.type },

      // 特殊元素样式
      '.token.bold': { fontWeight: 'bold' },
      '.token.italic': { fontStyle: 'italic' },
      '.token.entity': { color: codeTheme.operator, cursor: 'help' },
    };

    // 缓存样式
    this.styleCache.set(cacheKey, style);

    return style;
  }

  /**
   * 获取管理器状态
   */
  public getState() {
    return {
      currentTheme: this.currentTheme,
      themeMode: this.themeMode,
      systemTheme: this.systemTheme,
      availableThemes: this.availableThemes,
      isInitialized: this.isInitialized,
      isLoading: this.isLoading,
      cacheSize: {
        themes: this.themeCache.size,
        styles: this.styleCache.size,
      },
    };
  }

  /**
   * 清除样式缓存
   */
  private clearStyleCache(themeId?: string): void {
    if (themeId) {
      this.styleCache.delete(themeId);
    } else {
      this.styleCache.clear();
    }
  }

  /**
   * 事件监听
   */
  public on<T extends keyof ThemeManagerEvents>(event: T, listener: ThemeManagerEventListener<T>): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * 移除事件监听
   */
  public off<T extends keyof ThemeManagerEvents>(event: T, listener: ThemeManagerEventListener<T>): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 触发事件
   */
  private emit<T extends keyof ThemeManagerEvents>(event: T, data: ThemeManagerEvents[T]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in theme manager event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * 错误处理
   */
  private handleError(error: Error, context: string): void {
    console.error(`[ThemeManager] Error in ${context}:`, error);
    this.emit('error', error);
    this.options.onError(error);
  }

  /**
   * 销毁管理器
   */
  public destroy(): void {
    // 清理系统主题监听
    if (this.systemThemeCleanup) {
      this.systemThemeCleanup();
      this.systemThemeCleanup = null;
    }

    // 清除所有事件监听器
    this.eventListeners.clear();

    // 清除缓存
    this.themeCache.clear();
    this.styleCache.clear();

    // 重置状态
    this.isInitialized = false;
    this.currentTheme = null;
    this.availableThemes = [];
  }
}

/**
 * 获取默认的主题管理器实例
 */
export const themeManager = ThemeManager.getInstance();

/**
 * 主题管理器工厂函数
 */
export const createThemeManager = (options?: ThemeManagerOptions): ThemeManager => {
  return ThemeManager.getInstance(options);
};

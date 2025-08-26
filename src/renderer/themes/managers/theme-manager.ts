import { EventEmitter } from 'eventemitter3';
import type { ArcoThemeTokens, ThemeConfig, ThemeMode, ThemeEventTypes } from '../less/types';
import { lessCompiler } from '../compiler/less-compiler';

/**
 * Less 变量主题管理器
 * 负责管理主题配置、编译和缓存
 */
export class LessVariableThemeManager extends EventEmitter<ThemeEventTypes> {
  private currentTheme: ThemeConfig;
  private availableThemes: Map<string, ThemeConfig> = new Map();
  private compiledCache: Map<string, string> = new Map();
  private storageKey = 'aion-ui-less-theme-config';

  constructor() {
    super();

    // 初始化默认主题
    this.currentTheme = {
      id: 'light',
      name: 'Light Theme',
      mode: 'light',
      builtin: true,
      tokens: {},
    };

    this.initializeBuiltinThemes();
    this.loadThemeFromStorage();
  }

  /**
   * 初始化内置主题
   */
  private initializeBuiltinThemes(): void {
    const builtinThemes: ThemeConfig[] = [
      {
        id: 'light',
        name: 'Light Theme',
        mode: 'light',
        builtin: true,
        tokens: {
          colorPrimary: '#165dff',
          colorSuccess: '#00b42a',
          colorWarning: '#ff7d00',
          colorError: '#f53f3f',
        },
      },
      {
        id: 'dark',
        name: 'Dark Theme',
        mode: 'dark',
        builtin: true,
        tokens: {
          colorPrimary: '#165dff',
          colorSuccess: '#00b42a',
          colorWarning: '#ff7d00',
          colorError: '#f53f3f',
        },
      },
    ];

    builtinThemes.forEach((theme) => {
      this.availableThemes.set(theme.id, theme);
    });
  }

  /**
   * 从本地存储加载主题配置
   */
  private loadThemeFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const config = JSON.parse(stored);
          if (this.availableThemes.has(config.themeId)) {
            this.currentTheme = this.availableThemes.get(config.themeId)!;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error);
    }
  }

  /**
   * 保存主题配置到本地存储
   */
  private saveThemeToStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const config = {
          themeId: this.currentTheme.id,
          mode: this.currentTheme.mode,
          timestamp: Date.now(),
        };
        localStorage.setItem(this.storageKey, JSON.stringify(config));
      }
    } catch (error) {
      console.warn('Failed to save theme to storage:', error);
    }
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): ThemeConfig {
    return { ...this.currentTheme };
  }

  /**
   * 设置主题
   */
  async setTheme(theme: ThemeConfig): Promise<void> {
    try {
      // 编译主题
      const css = await this.compileTheme(theme);
      if (css) {
        this.currentTheme = { ...theme };
        this.applyTheme(css, theme.id);
        this.saveThemeToStorage();
        this.emit('theme-changed', this.currentTheme);
        this.emit('theme-compiled', { themeId: theme.id, css });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.emit('theme-error', { themeId: theme.id, error: errorMessage });
      throw error;
    }
  }

  /**
   * 切换模式
   */
  async switchMode(mode: ThemeMode): Promise<void> {
    const modeTheme: ThemeConfig = {
      ...this.currentTheme,
      mode,
      id: this.currentTheme.builtin ? mode : this.currentTheme.id,
    };

    await this.setTheme(modeTheme);
    this.emit('mode-switched', mode);
  }

  /**
   * 获取可用主题列表
   */
  getAvailableThemes(): ThemeConfig[] {
    return Array.from(this.availableThemes.values());
  }

  /**
   * 创建自定义主题
   */
  async createCustomTheme(name: string, tokens: ArcoThemeTokens, baseMode: ThemeMode): Promise<ThemeConfig> {
    const themeId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const customTheme: ThemeConfig = {
      id: themeId,
      name,
      mode: baseMode,
      builtin: false,
      tokens,
      createdAt: new Date().toISOString(),
    };

    // 验证主题是否可以编译
    const css = await this.compileTheme(customTheme);
    if (!css) {
      throw new Error('Failed to compile custom theme');
    }

    this.availableThemes.set(themeId, customTheme);
    return customTheme;
  }

  /**
   * 删除自定义主题
   */
  async deleteCustomTheme(themeId: string): Promise<boolean> {
    const theme = this.availableThemes.get(themeId);
    if (!theme || theme.builtin) {
      return false;
    }

    this.availableThemes.delete(themeId);
    this.compiledCache.delete(themeId);

    // 如果删除的是当前主题，切换到默认主题
    if (this.currentTheme.id === themeId) {
      const defaultTheme = this.availableThemes.get('light')!;
      await this.setTheme(defaultTheme);
    }

    return true;
  }

  /**
   * 导出主题
   */
  async exportTheme(themeId: string): Promise<string> {
    const theme = this.availableThemes.get(themeId);
    if (!theme) {
      throw new Error(`Theme ${themeId} not found`);
    }

    const exportData = {
      ...theme,
      exportVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 导入主题
   */
  async importTheme(themeData: string): Promise<ThemeConfig> {
    try {
      const imported = JSON.parse(themeData);

      // 验证导入数据
      if (!imported.name || !imported.mode || !imported.tokens) {
        throw new Error('Invalid theme data format');
      }

      // 生成新的ID避免冲突
      const newThemeId = `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const importedTheme: ThemeConfig = {
        id: newThemeId,
        name: `${imported.name} (Imported)`,
        mode: imported.mode,
        builtin: false,
        tokens: imported.tokens,
        description: imported.description,
        createdAt: new Date().toISOString(),
      };

      // 验证主题是否可以编译
      const css = await this.compileTheme(importedTheme);
      if (!css) {
        throw new Error('Failed to compile imported theme');
      }

      this.availableThemes.set(newThemeId, importedTheme);
      return importedTheme;
    } catch (error) {
      throw new Error(`Failed to import theme: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 编译主题
   */
  private async compileTheme(theme: ThemeConfig): Promise<string | null> {
    const cacheKey = `${theme.id}-${JSON.stringify(theme.tokens)}`;

    // 检查缓存
    if (this.compiledCache.has(cacheKey)) {
      return this.compiledCache.get(cacheKey)!;
    }

    try {
      const result = await lessCompiler.compileCustomTheme(theme.id, theme.tokens, theme.mode);

      if (result.success && result.css) {
        this.compiledCache.set(cacheKey, result.css);
        return result.css;
      } else {
        console.error(`Failed to compile theme ${theme.id}:`, result.error);
        return null;
      }
    } catch (error) {
      console.error(`Error compiling theme ${theme.id}:`, error);
      return null;
    }
  }

  /**
   * 应用主题到页面
   */
  private applyTheme(css: string, themeId: string): void {
    if (typeof window === 'undefined') return;

    // 移除旧的主题样式
    const existingStyles = document.querySelectorAll('style[data-theme-id]');
    existingStyles.forEach((style) => style.remove());

    // 添加新的主题样式
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-theme-id', themeId);
    styleElement.textContent = css;
    document.head.appendChild(styleElement);

    // 设置 data-theme 属性
    document.documentElement.setAttribute('data-theme', this.currentTheme.mode);
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.compiledCache.clear();
  }

  /**
   * 获取主题统计信息
   */
  getThemeStats(): {
    total: number;
    builtin: number;
    custom: number;
    cacheSize: number;
  } {
    const themes = Array.from(this.availableThemes.values());
    return {
      total: themes.length,
      builtin: themes.filter((t) => t.builtin).length,
      custom: themes.filter((t) => !t.builtin).length,
      cacheSize: this.compiledCache.size,
    };
  }
}

// 创建全局单例
export const themeManager = new LessVariableThemeManager();

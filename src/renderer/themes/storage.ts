/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConfigStorage } from '@/common/storage';
import { getBuiltInAppThemes, getDefaultThemeForMode } from './presets';
import type { AppTheme, ExternalThemeFile, ThemeConfig } from './types';
import { convertThemeForExport, getThemeFileExtension, parseYamlTheme, stringifyYamlTheme } from './yaml-utils';

/**
 * 基于 ConfigStorage 的主题存储管理实现
 * 集成到现有的配置存储系统，不使用独立的存储
 */
export class IntegratedThemeStorage {
  /**
   * 获取主题配置
   */
  async getThemeConfig(): Promise<ThemeConfig> {
    try {
      const config = await ConfigStorage.get('theme.config');
      if (config) {
        // 确保包含所有内置主题
        const builtInThemes = getBuiltInAppThemes();
        const customThemes = await this.getCustomThemes();

        return {
          ...config,
          availableThemes: [...builtInThemes, ...customThemes],
        };
      }
    } catch (error) {
      console.warn('Failed to load theme config:', error);
    }

    // 返回默认配置
    return this.getDefaultThemeConfig();
  }

  /**
   * 保存主题配置
   */
  async saveThemeConfig(config: ThemeConfig): Promise<void> {
    try {
      // 只保存配置信息，不保存主题数据
      const configToSave = {
        currentTheme: config.currentTheme,
        themeMode: config.themeMode,
        autoMode: config.autoMode,
        preferredLightTheme: config.preferredLightTheme,
        preferredDarkTheme: config.preferredDarkTheme,
        customThemeDir: config.customThemeDir,
      };

      await ConfigStorage.set('theme.config', configToSave);
    } catch (error) {
      console.error('Failed to save theme config:', error);
      throw error;
    }
  }

  /**
   * 获取主题
   */
  async getTheme(themeId: string): Promise<AppTheme | null> {
    try {
      // 检查是否为内置主题
      const builtInThemes = getBuiltInAppThemes();
      const builtInTheme = builtInThemes.find((theme) => theme.id === themeId);
      if (builtInTheme) {
        return builtInTheme;
      }

      // 检查自定义主题（通过 fs 系统存储）
      return await this.getCustomTheme(themeId);
    } catch (error) {
      console.error('Failed to get theme:', error);
      return null;
    }
  }

  /**
   * 保存主题
   */
  async saveTheme(theme: AppTheme): Promise<void> {
    try {
      // 内置主题不能被覆盖
      if (theme.isBuiltIn) {
        throw new Error('Cannot save built-in theme');
      }

      // 设置更新时间
      theme.updatedAt = new Date().toISOString();
      if (!theme.createdAt) {
        theme.createdAt = theme.updatedAt;
      }

      // 保存到文件系统
      await this.saveCustomTheme(theme);

      // 更新自定义主题列表
      await this.updateCustomThemesList(theme.id, 'add');
    } catch (error) {
      console.error('Failed to save theme:', error);
      throw error;
    }
  }

  /**
   * 删除主题
   */
  async deleteTheme(themeId: string): Promise<boolean> {
    try {
      // 不能删除内置主题
      const builtInThemes = getBuiltInAppThemes();
      if (builtInThemes.some((theme) => theme.id === themeId)) {
        throw new Error('Cannot delete built-in theme');
      }

      // 删除文件系统中的主题文件
      await this.deleteCustomTheme(themeId);

      // 更新自定义主题列表
      await this.updateCustomThemesList(themeId, 'remove');

      return true;
    } catch (error) {
      console.error('Failed to delete theme:', error);
      return false;
    }
  }

  /**
   * 获取所有主题
   */
  async getAllThemes(): Promise<AppTheme[]> {
    const builtInThemes = getBuiltInAppThemes();
    const customThemes = await this.getCustomThemes();
    return [...builtInThemes, ...customThemes];
  }

  /**
   * 导入主题（从YAML或JSON文件）
   */
  async importTheme(themeData: any): Promise<AppTheme> {
    try {
      // 验证主题数据格式
      if (!this.validateExternalThemeFile(themeData)) {
        throw new Error('Invalid theme file format');
      }

      const externalTheme = themeData as ExternalThemeFile;

      // 转换为应用主题格式
      const appTheme: AppTheme = {
        id: `custom-${externalTheme.id}`,
        name: externalTheme.name,
        mode: externalTheme.mode,
        description: externalTheme.description,
        codeHighlight: externalTheme.codeHighlight,
        isBuiltIn: false,
        createdAt: externalTheme.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 确保ID唯一
      let counter = 1;
      let finalId = appTheme.id;
      while (await this.getTheme(finalId)) {
        finalId = `${appTheme.id}-${counter}`;
        counter++;
      }
      appTheme.id = finalId;

      // 保存主题
      await this.saveTheme(appTheme);

      return appTheme;
    } catch (error) {
      console.error('Failed to import theme:', error);
      throw error;
    }
  }

  /**
   * 导出主题（支持YAML和JSON格式）
   */
  async exportTheme(themeId: string, format: 'json' | 'yaml' = 'yaml'): Promise<string> {
    try {
      const theme = await this.getTheme(themeId);
      if (!theme) {
        throw new Error('Theme not found');
      }

      // 转换为外部主题格式
      const externalTheme = convertThemeForExport(theme);

      // 根据格式返回字符串
      if (format === 'yaml') {
        return stringifyYamlTheme(externalTheme);
      } else {
        return JSON.stringify(externalTheme, null, 2);
      }
    } catch (error) {
      console.error('Failed to export theme:', error);
      throw error;
    }
  }

  /**
   * 获取自定义主题列表
   */
  private async getCustomThemes(): Promise<AppTheme[]> {
    try {
      const customThemeIds = await this.getCustomThemeIds();
      const themes: AppTheme[] = [];

      for (const themeId of customThemeIds) {
        const theme = await this.getCustomTheme(themeId);
        if (theme && !theme.isBuiltIn) {
          themes.push(theme);
        }
      }

      return themes;
    } catch (error) {
      console.error('Failed to get custom themes:', error);
      return [];
    }
  }

  /**
   * 获取自定义主题ID列表
   */
  private async getCustomThemeIds(): Promise<string[]> {
    try {
      const list = await ConfigStorage.get('theme.custom');
      return list || [];
    } catch {
      return [];
    }
  }

  /**
   * 更新自定义主题列表
   */
  private async updateCustomThemesList(themeId: string, operation: 'add' | 'remove'): Promise<void> {
    try {
      let customThemeIds = await this.getCustomThemeIds();

      if (operation === 'add') {
        if (!customThemeIds.includes(themeId)) {
          customThemeIds.push(themeId);
        }
      } else if (operation === 'remove') {
        customThemeIds = customThemeIds.filter((id) => id !== themeId);
      }

      await ConfigStorage.set('theme.custom', customThemeIds);
    } catch (error) {
      console.error('Failed to update custom themes list:', error);
    }
  }

  /**
   * 获取默认主题配置
   */
  private getDefaultThemeConfig(): ThemeConfig {
    const builtInThemes = getBuiltInAppThemes();
    const lightTheme = getDefaultThemeForMode('light');
    const darkTheme = getDefaultThemeForMode('dark');

    return {
      currentTheme: lightTheme.id,
      themeMode: 'auto',
      autoMode: true,
      availableThemes: builtInThemes,
      preferredLightTheme: lightTheme.id,
      preferredDarkTheme: darkTheme.id,
    };
  }

  /**
   * 从文件系统获取自定义主题
   */
  private async getCustomTheme(themeId: string): Promise<AppTheme | null> {
    try {
      // 这里应该使用 fs 系统来读取主题文件
      // 由于 AionUi 使用 Electron，我们可以利用 Node.js fs 模块
      const fs = window.require?.('fs');
      const path = window.require?.('path');

      if (!fs || !path) {
        console.warn('Node.js modules not available');
        return null;
      }

      const config = await this.getThemeConfig();
      const themeDir = config.customThemeDir || path.join(window.require('os').homedir(), '.aionui', 'themes');
      const extension = getThemeFileExtension();
      const themeFile = path.join(themeDir, `${themeId}${extension}`);

      if (!fs.existsSync(themeFile)) {
        // 尝试另一种格式
        const alternativeExtension = extension === '.yaml' ? '.json' : '.yaml';
        const alternativeFile = path.join(themeDir, `${themeId}${alternativeExtension}`);

        if (!fs.existsSync(alternativeFile)) {
          return null;
        }

        const content = fs.readFileSync(alternativeFile, 'utf8');
        return parseYamlTheme(content) as AppTheme;
      }

      const content = fs.readFileSync(themeFile, 'utf8');
      return parseYamlTheme(content) as AppTheme;
    } catch (error) {
      console.error('Failed to read custom theme:', error);
      return null;
    }
  }

  /**
   * 保存自定义主题到文件系统
   */
  private async saveCustomTheme(theme: AppTheme): Promise<void> {
    try {
      const fs = window.require?.('fs');
      const path = window.require?.('path');

      if (!fs || !path) {
        throw new Error('Node.js modules not available');
      }

      const config = await this.getThemeConfig();
      const themeDir = config.customThemeDir || path.join(window.require('os').homedir(), '.aionui', 'themes');

      // 确保目录存在
      if (!fs.existsSync(themeDir)) {
        fs.mkdirSync(themeDir, { recursive: true });
      }

      const extension = getThemeFileExtension();
      const themeFile = path.join(themeDir, `${theme.id}${extension}`);

      // 使用 YAML 工具生成内容
      const content = stringifyYamlTheme(theme);
      fs.writeFileSync(themeFile, content, 'utf8');
    } catch (error) {
      console.error('Failed to save custom theme:', error);
      throw error;
    }
  }

  /**
   * 删除自定义主题文件
   */
  private async deleteCustomTheme(themeId: string): Promise<void> {
    try {
      const fs = window.require?.('fs');
      const path = window.require?.('path');

      if (!fs || !path) {
        throw new Error('Node.js modules not available');
      }

      const config = await this.getThemeConfig();
      const themeDir = config.customThemeDir || path.join(window.require('os').homedir(), '.aionui', 'themes');

      const yamlFile = path.join(themeDir, `${themeId}.yaml`);
      const jsonFile = path.join(themeDir, `${themeId}.json`);

      if (fs.existsSync(yamlFile)) {
        fs.unlinkSync(yamlFile);
      }
      if (fs.existsSync(jsonFile)) {
        fs.unlinkSync(jsonFile);
      }
    } catch (error) {
      console.error('Failed to delete custom theme:', error);
      throw error;
    }
  }

  /**
   * 验证外部主题文件格式
   */
  private validateExternalThemeFile(data: any): boolean {
    if (!data || typeof data !== 'object') return false;

    const required = ['id', 'name', 'mode', 'codeHighlight'];
    for (const field of required) {
      if (!data[field]) return false;
    }

    if (!['light', 'dark'].includes(data.mode)) return false;

    const codeHighlight = data.codeHighlight;
    if (!codeHighlight || typeof codeHighlight !== 'object') return false;

    const requiredColors = ['background', 'color', 'keyword', 'string', 'comment', 'number', 'function', 'variable', 'operator', 'type', 'constant', 'punctuation'];
    for (const color of requiredColors) {
      if (typeof codeHighlight[color] !== 'string') return false;
    }

    return true;
  }
}

/**
 * 单例主题存储实例
 */
export const themeStorage = new IntegratedThemeStorage();

/**
 * 检测系统主题偏好
 */
export function detectSystemTheme(): 'light' | 'dark' {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * 监听系统主题变化
 */
export function watchSystemTheme(callback: (theme: 'light' | 'dark') => void): () => void {
  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else if (mediaQuery.addListener) {
      // 兼容旧版浏览器
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  } catch (error) {
    console.warn('Failed to setup system theme watcher:', error);
  }

  return () => {}; // 空的清理函数
}

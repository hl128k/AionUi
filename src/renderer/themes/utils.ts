/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import type { AppTheme, CodeHighlightTheme } from './types';

/**
 * 颜色工具函数
 */
export class ColorUtils {
  /**
   * 验证颜色值格式
   */
  static isValidColor(color: string): boolean {
    // 支持 hex, rgb, rgba, hsl, hsla 格式
    const colorRegex = /^(#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})|rgb\(|rgba\(|hsl\(|hsla\()/;
    return colorRegex.test(color.trim());
  }

  /**
   * 将十六进制颜色转换为RGB
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
   * 将RGB转换为十六进制颜色
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * 计算颜色亮度
   */
  static getLuminance(color: string): number {
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;

    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * 计算两个颜色的对比度
   */
  static getContrast(color1: string, color2: string): number {
    const lum1 = this.getLuminance(color1);
    const lum2 = this.getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * 检查颜色对比度是否符合WCAG标准
   */
  static meetsWCAG(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    const contrast = this.getContrast(color1, color2);
    return level === 'AA' ? contrast >= 4.5 : contrast >= 7;
  }

  /**
   * 调整颜色亮度
   */
  static adjustBrightness(color: string, amount: number): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;

    const adjust = (value: number) => {
      const adjusted = value + amount * 255;
      return Math.max(0, Math.min(255, Math.round(adjusted)));
    };

    return this.rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
  }

  /**
   * 生成颜色的变体（浅色、深色版本）
   */
  static generateColorVariants(baseColor: string) {
    return {
      lighter: this.adjustBrightness(baseColor, 0.2),
      light: this.adjustBrightness(baseColor, 0.1),
      base: baseColor,
      dark: this.adjustBrightness(baseColor, -0.1),
      darker: this.adjustBrightness(baseColor, -0.2),
    };
  }
}

/**
 * 主题工具函数
 */
export class ThemeUtils {
  /**
   * 深度克隆主题对象
   */
  static cloneTheme(theme: AppTheme): AppTheme {
    return JSON.parse(JSON.stringify(theme));
  }

  /**
   * 合并主题配置
   */
  static mergeThemes(baseTheme: AppTheme, overrides: Partial<AppTheme>): AppTheme {
    return {
      ...baseTheme,
      ...overrides,
      codeHighlight: {
        ...baseTheme.codeHighlight,
        ...(overrides.codeHighlight || {}),
      },
    };
  }

  /**
   * 验证主题完整性
   */
  static validateTheme(theme: Partial<AppTheme>): string[] {
    const errors: string[] = [];

    // 基础字段验证
    if (!theme.id) errors.push('Theme ID is required');
    if (!theme.name) errors.push('Theme name is required');
    if (!theme.mode || !['light', 'dark'].includes(theme.mode)) {
      errors.push('Theme mode must be "light" or "dark"');
    }

    // 代码高亮配置验证
    if (!theme.codeHighlight) {
      errors.push('Code highlight configuration is required');
    } else {
      const requiredColors = ['background', 'color', 'keyword', 'string', 'comment', 'number', 'function', 'variable', 'operator', 'type', 'constant', 'punctuation'];

      for (const colorKey of requiredColors) {
        const colorValue = theme.codeHighlight[colorKey as keyof CodeHighlightTheme] as string;
        if (!colorValue) {
          errors.push(`Missing required color: ${colorKey}`);
        } else if (!ColorUtils.isValidColor(colorValue)) {
          errors.push(`Invalid color format: ${colorKey} = "${colorValue}"`);
        }
      }

      // 检查对比度
      const { background, color } = theme.codeHighlight;
      if (background && color) {
        if (!ColorUtils.meetsWCAG(background, color)) {
          errors.push('Poor contrast between background and text color');
        }
      }
    }

    return errors;
  }

  /**
   * 检查主题是否有效
   */
  static isValidTheme(theme: Partial<AppTheme>): boolean {
    return this.validateTheme(theme).length === 0;
  }

  /**
   * 根据主题模式过滤主题列表
   */
  static filterThemesByMode(themes: AppTheme[], mode: 'light' | 'dark'): AppTheme[] {
    return themes.filter((theme) => theme.mode === mode);
  }

  /**
   * 根据关键词搜索主题
   */
  static searchThemes(themes: AppTheme[], keyword: string): AppTheme[] {
    if (!keyword.trim()) return themes;

    const lowerKeyword = keyword.toLowerCase();
    return themes.filter((theme) => theme.name.toLowerCase().includes(lowerKeyword) || theme.description?.toLowerCase().includes(lowerKeyword) || theme.id.toLowerCase().includes(lowerKeyword));
  }

  /**
   * 按主题类型分组
   */
  static groupThemes(themes: AppTheme[]) {
    return {
      all: themes,
      light: themes.filter((t) => t.mode === 'light'),
      dark: themes.filter((t) => t.mode === 'dark'),
      builtin: themes.filter((t) => t.isBuiltIn),
      custom: themes.filter((t) => !t.isBuiltIn),
    };
  }

  /**
   * 生成主题统计信息
   */
  static getThemeStats(themes: AppTheme[]) {
    const grouped = this.groupThemes(themes);

    return {
      total: themes.length,
      light: grouped.light.length,
      dark: grouped.dark.length,
      builtin: grouped.builtin.length,
      custom: grouped.custom.length,
      mostRecent: themes
        .filter((t) => t.updatedAt)
        .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())
        .slice(0, 5),
    };
  }

  /**
   * 从主题生成CSS变量
   */
  static generateCSSVariables(theme: CodeHighlightTheme, prefix = '--theme'): Record<string, string> {
    const variables: Record<string, string> = {};

    Object.entries(theme).forEach(([key, value]) => {
      if (typeof value === 'string' && ColorUtils.isValidColor(value)) {
        variables[`${prefix}-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
      }
    });

    return variables;
  }

  /**
   * 应用CSS变量到文档
   */
  static applyCSSVariables(variables: Record<string, string>): void {
    const root = document.documentElement;
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }
}

/**
 * 性能工具函数
 */
export class PerformanceUtils {
  private static performanceEntries: Map<string, number> = new Map();

  /**
   * 开始性能测量
   */
  static startMeasure(label: string): void {
    this.performanceEntries.set(label, performance.now());
  }

  /**
   * 结束性能测量并返回耗时
   */
  static endMeasure(label: string): number {
    const startTime = this.performanceEntries.get(label);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.performanceEntries.delete(label);

    return duration;
  }

  /**
   * 测量函数执行时间
   */
  static async measureFunction<T>(fn: () => T | Promise<T>, label?: string): Promise<{ result: T; duration: number }> {
    const measureLabel = label || `function-${Date.now()}`;

    this.startMeasure(measureLabel);
    const result = await fn();
    const duration = this.endMeasure(measureLabel);

    return { result, duration };
  }

  /**
   * 防抖函数
   */
  static debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      const later = () => {
        timeout = null;
        func(...args);
      };

      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * 节流函数
   */
  static throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}

/**
 * 文件工具函数
 */
export class FileUtils {
  /**
   * 从文件读取JSON数据
   */
  static async readJsonFile<T>(file: File): Promise<T> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON format'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * 下载JSON数据为文件
   */
  static downloadJson(data: any, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.json') ? filename : `${filename}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * 验证文件类型
   */
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type) || allowedTypes.some((type) => file.name.toLowerCase().endsWith(type));
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * 浏览器兼容性工具函数
 */
export class BrowserUtils {
  /**
   * 检查是否支持CSS变量
   */
  static supportsCSSVariables(): boolean {
    return window.CSS && CSS.supports && CSS.supports('color', 'var(--test)');
  }

  /**
   * 检查是否支持深色模式媒体查询
   */
  static supportsDarkModeQuery(): boolean {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').media !== 'not all';
  }

  /**
   * 检查是否为移动设备
   */
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * 获取浏览器信息
   */
  static getBrowserInfo() {
    const ua = navigator.userAgent;
    return {
      isChrome: /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor),
      isFirefox: /Firefox/.test(ua),
      isSafari: /Safari/.test(ua) && /Apple Computer/.test(navigator.vendor),
      isEdge: /Edg/.test(ua),
      isMobile: this.isMobile(),
      supportsCSSVariables: this.supportsCSSVariables(),
      supportsDarkModeQuery: this.supportsDarkModeQuery(),
    };
  }
}

/**
 * 通用工具函数集合
 */
export const utils = {
  color: ColorUtils,
  theme: ThemeUtils,
  performance: PerformanceUtils,
  file: FileUtils,
  browser: BrowserUtils,
};

export default utils;

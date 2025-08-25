/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 全局样式管理器
 * 负责动态注入全局应用样式，实现完整的主题切换体验
 */

import type { AppTheme, CSSInjectionConfig, GlobalAppTheme } from './types';

/**
 * 默认CSS注入配置
 */
const DEFAULT_INJECTION_CONFIG: CSSInjectionConfig = {
  enabled: true,
  themePrefix: 'aion-theme',
  targetSelector: 'body',
  useCSSVariables: true,
};

/**
 * 生成CSS变量名
 */
function generateCSSVariable(name: string): string {
  return `--aion-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
}

/**
 * 将全局主题样式转换为CSS变量
 */
export function generateCSSVariables(globalStyles: GlobalAppTheme): Record<string, string> {
  const cssVariables: Record<string, string> = {};

  // 遍历所有样式属性，生成对应的CSS变量
  Object.entries(globalStyles).forEach(([key, value]) => {
    if (typeof value === 'string') {
      cssVariables[generateCSSVariable(key)] = value;
    }
  });

  return cssVariables;
}

/**
 * 生成全局样式CSS规则 - 简化版本（只生成CSS变量）
 */
export function generateGlobalCSS(theme: AppTheme, config: CSSInjectionConfig = DEFAULT_INJECTION_CONFIG): string {
  if (!theme.globalStyles) {
    return '';
  }

  const { globalStyles } = theme;
  const themeClassName = `${config.themePrefix}-${theme.id}`;

  // 基础CSS变量定义
  const cssVariables = generateCSSVariables(globalStyles);
  const variableDeclarations = Object.entries(cssVariables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');

  // 只生成CSS变量声明，不生成侵入式的样式规则
  const cssRules = `
/* === AionUi Theme Variables: ${theme.name} === */
.${themeClassName} {
${variableDeclarations}
}

:root {
${variableDeclarations}
}
`;

  return cssRules.trim();
}

/**
 * 全局样式注入管理器 - 轻量级版本
 */
class GlobalStylesManager {
  private static instance: GlobalStylesManager;
  private currentStyleElement: HTMLStyleElement | null = null;
  private config: CSSInjectionConfig = DEFAULT_INJECTION_CONFIG;

  static getInstance(): GlobalStylesManager {
    if (!GlobalStylesManager.instance) {
      GlobalStylesManager.instance = new GlobalStylesManager();
    }
    return GlobalStylesManager.instance;
  }

  /**
   * 应用全局主题样式 - 仅设置CSS变量
   */
  applyGlobalTheme(theme: AppTheme, config?: Partial<CSSInjectionConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    if (!this.config.enabled || !theme.globalStyles) {
      this.removeCurrentStyles();
      return;
    }

    // 生成轻量级CSS内容（仅CSS变量）
    const cssContent = generateGlobalCSS(theme, this.config);

    if (!cssContent) {
      this.removeCurrentStyles();
      return;
    }

    // 注入CSS样式
    this.injectCSS(cssContent);
  }

  /**
   * 注入CSS样式
   */
  private injectCSS(cssContent: string): void {
    // 移除旧的样式
    this.removeCurrentStyles();

    // 创建新的style元素
    this.currentStyleElement = document.createElement('style');
    this.currentStyleElement.id = 'aionui-global-theme-variables';
    this.currentStyleElement.textContent = cssContent;

    // 插入到head中
    document.head.appendChild(this.currentStyleElement);
  }

  /**
   * 移除当前样式
   */
  private removeCurrentStyles(): void {
    if (this.currentStyleElement) {
      this.currentStyleElement.remove();
      this.currentStyleElement = null;
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<CSSInjectionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): CSSInjectionConfig {
    return { ...this.config };
  }
}

// 导出单例实例
export const globalStylesManager = GlobalStylesManager.getInstance();

/**
 * 创建默认的全局样式主题
 */
export function createDefaultGlobalStyles(mode: 'light' | 'dark'): GlobalAppTheme {
  if (mode === 'light') {
    return {
      // === 基础应用布局 ===
      siderBackground: '#f6f8fa',
      siderColor: '#24292f',
      siderBorder: '#d0d7de',

      mainBackground: '#ffffff',
      mainColor: '#24292f',

      // === 菜单样式 ===
      menuItemColor: '#656d76',
      menuItemBackground: 'transparent',
      menuItemHoverColor: '#24292f',
      menuItemHoverBackground: '#e7f1ff',
      menuItemActiveColor: '#0550ae',
      menuItemActiveBackground: '#dbeafe',

      // === 聊天消息样式 ===
      userMessageBackground: '#0550ae',
      userMessageColor: '#ffffff',
      userMessageBorder: '#0969da',

      assistantMessageBackground: '#f6f8fa',
      assistantMessageColor: '#24292f',
      assistantMessageBorder: '#d0d7de',

      systemMessageBackground: '#fff8c5',
      systemMessageColor: '#7d2d00',
      systemMessageBorder: '#d1a650',

      // === 工作区样式 ===
      workspaceBackground: '#ffffff',
      workspaceColor: '#24292f',
      workspaceBorder: '#d0d7de',

      // === 设置分组样式 ===
      settingGroupBackground: '#f6f8fa',
      settingGroupColor: '#24292f',
      settingGroupBorder: '#d0d7de',

      // === 主题色和图标 ===
      primaryColor: '#0550ae',
      iconColor: '#656d76',
      accentColor: '#0969da',
      successColor: '#1a7f37',
      warningColor: '#bf8700',
      errorColor: '#cf222e',
    };
  } else {
    return {
      // === 基础应用布局 ===
      siderBackground: '#21262d',
      siderColor: '#f0f6fc',
      siderBorder: '#30363d',

      mainBackground: '#0d1117',
      mainColor: '#f0f6fc',

      // === 菜单样式 ===
      menuItemColor: '#8b949e',
      menuItemBackground: 'transparent',
      menuItemHoverColor: '#f0f6fc',
      menuItemHoverBackground: '#30363d',
      menuItemActiveColor: '#58a6ff',
      menuItemActiveBackground: '#161b22',

      // === 聊天消息样式 ===
      userMessageBackground: '#1f6feb',
      userMessageColor: '#ffffff',
      userMessageBorder: '#388bfd',

      assistantMessageBackground: '#21262d',
      assistantMessageColor: '#f0f6fc',
      assistantMessageBorder: '#30363d',

      systemMessageBackground: '#332a00',
      systemMessageColor: '#f0c674',
      systemMessageBorder: '#7d7c00',

      // === 工作区样式 ===
      workspaceBackground: '#0d1117',
      workspaceColor: '#f0f6fc',
      workspaceBorder: '#30363d',

      // === 设置分组样式 ===
      settingGroupBackground: '#21262d',
      settingGroupColor: '#f0f6fc',
      settingGroupBorder: '#30363d',

      // === 主题色和图标 ===
      primaryColor: '#58a6ff',
      iconColor: '#8b949e',
      accentColor: '#1f6feb',
      successColor: '#3fb950',
      warningColor: '#d29922',
      errorColor: '#f85149',
    };
  }
}

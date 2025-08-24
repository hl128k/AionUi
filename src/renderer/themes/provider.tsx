/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { getBuiltInAppThemes, getDefaultThemeForMode } from './presets';
import { detectSystemTheme, themeStorage, watchSystemTheme } from './storage';
import type { AppTheme, CodeHighlightTheme, ThemeMode } from './types';

/**
 * 主题上下文类型定义
 */
export interface ThemeContextType {
  // 当前状态
  currentTheme: AppTheme | null;
  themeMode: ThemeMode;
  systemTheme: 'light' | 'dark';
  isLoading: boolean;

  // 可用主题列表
  availableThemes: AppTheme[];
  lightThemes: AppTheme[];
  darkThemes: AppTheme[];

  // 主题操作方法
  setTheme: (themeId: string) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  refreshThemes: () => Promise<void>;

  // 高级功能
  importTheme: (file: File) => Promise<AppTheme>;
  exportTheme: (themeId: string) => Promise<void>;
  deleteTheme: (themeId: string) => Promise<boolean>;

  // 实用方法
  getEffectiveTheme: () => AppTheme | null;
  generateSyntaxHighlighterStyle: (theme?: CodeHighlightTheme) => Record<string, any>;
}

/**
 * 主题上下文
 */
const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * 主题提供者组件属性
 */
export interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  onThemeChange?: (theme: AppTheme) => void;
  onError?: (error: Error) => void;
}

/**
 * AionUi 主题提供者组件
 *
 * 这是整个主题系统的核心控制器，负责：
 * 1. 主题状态管理和持久化
 * 2. 自动跟随系统主题切换
 * 3. 主题导入导出功能
 * 4. 动态生成SyntaxHighlighter样式
 * 5. 主题热更新和错误处理
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, defaultMode = 'auto', onThemeChange, onError }) => {
  // === 状态管理 ===
  const [currentTheme, setCurrentTheme] = useState<AppTheme | null>(null);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultMode);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => detectSystemTheme());
  const [availableThemes, setAvailableThemes] = useState<AppTheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // === 计算属性 ===
  const lightThemes = availableThemes.filter((theme) => theme.mode === 'light');
  const darkThemes = availableThemes.filter((theme) => theme.mode === 'dark');

  /**
   * 获取生效的主题
   * 处理auto模式下的主题选择逻辑
   */
  const getEffectiveTheme = useCallback((): AppTheme | null => {
    if (!currentTheme) return null;

    if (themeMode === 'auto') {
      // 自动模式下，根据系统主题选择对应模式的主题
      const targetMode = systemTheme;
      const themesOfMode = availableThemes.filter((t) => t.mode === targetMode);

      // 优先使用当前主题（如果模式匹配）
      if (currentTheme.mode === targetMode) {
        return currentTheme;
      }

      // 否则使用默认主题
      return getDefaultThemeForMode(targetMode);
    }

    return currentTheme;
  }, [currentTheme, themeMode, systemTheme, availableThemes]);

  /**
   * 动态生成 SyntaxHighlighter 样式对象
   * 这是主题系统的核心功能之一
   */
  const generateSyntaxHighlighterStyle = useCallback(
    (theme?: CodeHighlightTheme) => {
      const effectiveTheme = getEffectiveTheme();
      const codeTheme = theme || effectiveTheme?.codeHighlight;

      if (!codeTheme) {
        // 回退到默认样式
        return {};
      }

      return {
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
    },
    [getEffectiveTheme]
  );

  /**
   * 错误处理包装器
   */
  const handleError = useCallback(
    (error: Error, context: string) => {
      console.error(`[ThemeProvider] Error in ${context}:`, error);
      onError?.(error);
    },
    [onError]
  );

  /**
   * 刷新可用主题列表
   */
  const refreshThemes = useCallback(async () => {
    try {
      const themes = await themeStorage.getAllThemes();
      setAvailableThemes(themes);
    } catch (error) {
      handleError(error as Error, 'refreshThemes');
    }
  }, [handleError]);

  /**
   * 设置主题
   */
  const setTheme = useCallback(
    async (themeId: string) => {
      try {
        console.log('🎨 ThemeProvider: setTheme called with:', themeId);
        const theme = await themeStorage.getTheme(themeId);
        if (!theme) {
          throw new Error(`Theme not found: ${themeId}`);
        }

        console.log('🎨 ThemeProvider: Theme found:', theme.name);
        setCurrentTheme(theme);

        // 更新配置
        const config = await themeStorage.getThemeConfig();
        await themeStorage.saveThemeConfig({
          ...config,
          currentTheme: themeId,
        });

        console.log('🎨 ThemeProvider: Theme set successfully');
        onThemeChange?.(theme);
      } catch (error) {
        console.error('🎨 ThemeProvider: setTheme error:', error);
        handleError(error as Error, 'setTheme');
      }
    },
    [handleError, onThemeChange]
  );

  /**
   * 设置主题模式
   */
  const setThemeMode = useCallback(
    async (mode: ThemeMode) => {
      try {
        setThemeModeState(mode);

        // 更新配置
        const config = await themeStorage.getThemeConfig();
        await themeStorage.saveThemeConfig({
          ...config,
          themeMode: mode,
        });

        // 如果切换到非auto模式，可能需要切换主题
        if (mode !== 'auto' && currentTheme?.mode !== mode) {
          const targetThemes = availableThemes.filter((t) => t.mode === mode);
          if (targetThemes.length > 0) {
            const defaultTheme = getDefaultThemeForMode(mode);
            await setTheme(defaultTheme.id);
          }
        }
      } catch (error) {
        handleError(error as Error, 'setThemeMode');
      }
    },
    [handleError, currentTheme, availableThemes, setTheme]
  );

  /**
   * 导入主题
   */
  const importTheme = useCallback(
    async (file: File): Promise<AppTheme> => {
      try {
        const text = await file.text();
        const themeData = JSON.parse(text);
        const importedTheme = await themeStorage.importTheme(themeData);

        // 刷新主题列表
        await refreshThemes();

        return importedTheme;
      } catch (error) {
        handleError(error as Error, 'importTheme');
        throw error;
      }
    },
    [handleError, refreshThemes]
  );

  /**
   * 导出主题
   */
  const exportTheme = useCallback(
    async (themeId: string) => {
      try {
        const themeData = await themeStorage.exportTheme(themeId);
        const theme = await themeStorage.getTheme(themeId);

        if (!theme) {
          throw new Error('Theme not found');
        }

        // 创建下载链接
        const blob = new Blob([JSON.stringify(themeData, null, 2)], {
          type: 'application/json',
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${theme.name.replace(/\s+/g, '-').toLowerCase()}-theme.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        handleError(error as Error, 'exportTheme');
      }
    },
    [handleError]
  );

  /**
   * 删除主题
   */
  const deleteTheme = useCallback(
    async (themeId: string): Promise<boolean> => {
      try {
        const result = await themeStorage.deleteTheme(themeId);

        if (result) {
          // 如果删除的是当前主题，切换到默认主题
          if (currentTheme?.id === themeId) {
            const defaultTheme = getDefaultThemeForMode(currentTheme.mode);
            await setTheme(defaultTheme.id);
          }

          // 刷新主题列表
          await refreshThemes();
        }

        return result;
      } catch (error) {
        handleError(error as Error, 'deleteTheme');
        return false;
      }
    },
    [handleError, currentTheme, refreshThemes, setTheme]
  );

  // === 初始化效果 ===
  useEffect(() => {
    const initializeThemes = async () => {
      try {
        setIsLoading(true);

        // 加载主题配置
        const config = await themeStorage.getThemeConfig();

        // 设置状态
        setThemeModeState(config.themeMode);
        setAvailableThemes(config.availableThemes);

        // 加载当前主题
        const theme = await themeStorage.getTheme(config.currentTheme);
        if (theme) {
          setCurrentTheme(theme);
          onThemeChange?.(theme);
        } else {
          // 回退到默认主题
          const defaultTheme = getDefaultThemeForMode('light');
          setCurrentTheme(defaultTheme);
          await themeStorage.saveThemeConfig({
            ...config,
            currentTheme: defaultTheme.id,
          });
        }
      } catch (error) {
        handleError(error as Error, 'initialization');

        // 完全失败时的回退逻辑
        const builtInThemes = getBuiltInAppThemes();
        const defaultTheme = getDefaultThemeForMode('light');
        setAvailableThemes(builtInThemes);
        setCurrentTheme(defaultTheme);
      } finally {
        setIsLoading(false);
      }
    };

    initializeThemes();
  }, [handleError, onThemeChange]);

  // === 系统主题监听 ===
  useEffect(() => {
    const cleanup = watchSystemTheme(setSystemTheme);
    return cleanup;
  }, []);

  // === 主题上下文值 ===
  const contextValue: ThemeContextType = {
    // 状态
    currentTheme,
    themeMode,
    systemTheme,
    isLoading,

    // 主题列表
    availableThemes,
    lightThemes,
    darkThemes,

    // 操作方法
    setTheme,
    setThemeMode,
    refreshThemes,

    // 高级功能
    importTheme,
    exportTheme,
    deleteTheme,

    // 实用方法
    getEffectiveTheme,
    generateSyntaxHighlighterStyle,
  };

  // === 样式注入效果 ===
  useEffect(() => {
    const effectiveTheme = getEffectiveTheme();
    if (!effectiveTheme) {
      console.log('🎨 No effective theme found');
      return;
    }

    console.log('🎨 Applying theme:', effectiveTheme.name, effectiveTheme);

    // 清理所有旧的主题类名（包括SyntaxHighlighter的类名）
    const bodyClasses = document.body.className;
    const cleanedClasses = bodyClasses
      .replace(/aionui-theme-\S+/g, '')
      .replace(/-\w+(-\w+)*/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // 创建主题类名
    const themeClassName = `aionui-theme-${effectiveTheme.id}`;

    // 更新body类名，只保留干净的类名和新的主题类名
    document.body.className = `${cleanedClasses} ${themeClassName}`.trim();

    // 创建或更新全局样式
    const styleId = 'aionui-dynamic-theme';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.setAttribute('data-theme', 'aionui-dynamic');
      document.head.appendChild(styleElement);
      console.log('🎨 Created new style element');
    }

    // 根据思路.md生成基于样式集的CSS规则
    const codeTheme = effectiveTheme.codeHighlight;
    const globalStyles = effectiveTheme.globalStyles;

    // 生成样式集CSS规则（基于思路.md的设计）
    let styleSetCSS = '';
    if (globalStyles) {
      // 左侧菜单栏样式 (o-slider)
      if (globalStyles.siderBackground || globalStyles.siderColor || globalStyles.siderBorder) {
        styleSetCSS += `.${themeClassName} .o-slider {
          ${globalStyles.siderBackground ? `background-color: ${globalStyles.siderBackground} !important;` : ''}
          ${globalStyles.siderColor ? `color: ${globalStyles.siderColor} !important;` : ''}
          ${globalStyles.siderBorder ? `border-right: 1px solid ${globalStyles.siderBorder} !important;` : ''}
        }\n`;
      }

      // 右侧主内容区样式 (o-main)
      if (globalStyles.mainBackground || globalStyles.mainColor) {
        styleSetCSS += `.${themeClassName} .o-main {
          ${globalStyles.mainBackground ? `background-color: ${globalStyles.mainBackground} !important;` : ''}
          ${globalStyles.mainColor ? `color: ${globalStyles.mainColor} !important;` : ''}
        }\n`;
      }

      // 菜单项样式 (o-slider-menu)
      if (globalStyles.menuItemColor || globalStyles.menuItemBackground) {
        styleSetCSS += `.${themeClassName} .o-slider-menu {
          ${globalStyles.menuItemColor ? `color: ${globalStyles.menuItemColor} !important;` : ''}
          ${globalStyles.menuItemBackground ? `background-color: ${globalStyles.menuItemBackground} !important;` : ''}
        }\n`;
      }

      // 菜单项悬停样式
      if (globalStyles.menuItemHoverColor || globalStyles.menuItemHoverBackground) {
        styleSetCSS += `.${themeClassName} .o-slider-menu:hover {
          ${globalStyles.menuItemHoverColor ? `color: ${globalStyles.menuItemHoverColor} !important;` : ''}
          ${globalStyles.menuItemHoverBackground ? `background-color: ${globalStyles.menuItemHoverBackground} !important;` : ''}
        }\n`;
      }

      // 菜单项激活样式
      if (globalStyles.menuItemActiveColor || globalStyles.menuItemActiveBackground) {
        styleSetCSS += `.${themeClassName} .o-slider-menu.active {
          ${globalStyles.menuItemActiveColor ? `color: ${globalStyles.menuItemActiveColor} !important;` : ''}
          ${globalStyles.menuItemActiveBackground ? `background-color: ${globalStyles.menuItemActiveBackground} !important;` : ''}
        }\n`;
      }

      // 聊天消息样式
      if (globalStyles.userMessageBackground || globalStyles.userMessageColor || globalStyles.userMessageBorder) {
        styleSetCSS += `.${themeClassName} .o-chat-message-user {
          ${globalStyles.userMessageBackground ? `background-color: ${globalStyles.userMessageBackground} !important;` : ''}
          ${globalStyles.userMessageColor ? `color: ${globalStyles.userMessageColor} !important;` : ''}
          ${globalStyles.userMessageBorder ? `border: 1px solid ${globalStyles.userMessageBorder} !important;` : ''}
        }\n`;
      }

      if (globalStyles.assistantMessageBackground || globalStyles.assistantMessageColor || globalStyles.assistantMessageBorder) {
        styleSetCSS += `.${themeClassName} .o-chat-message-assistant {
          ${globalStyles.assistantMessageBackground ? `background-color: ${globalStyles.assistantMessageBackground} !important;` : ''}
          ${globalStyles.assistantMessageColor ? `color: ${globalStyles.assistantMessageColor} !important;` : ''}
          ${globalStyles.assistantMessageBorder ? `border: 1px solid ${globalStyles.assistantMessageBorder} !important;` : ''}
        }\n`;
      }

      if (globalStyles.systemMessageBackground || globalStyles.systemMessageColor || globalStyles.systemMessageBorder) {
        styleSetCSS += `.${themeClassName} .o-chat-message-system {
          ${globalStyles.systemMessageBackground ? `background-color: ${globalStyles.systemMessageBackground} !important;` : ''}
          ${globalStyles.systemMessageColor ? `color: ${globalStyles.systemMessageColor} !important;` : ''}
          ${globalStyles.systemMessageBorder ? `border: 1px solid ${globalStyles.systemMessageBorder} !important;` : ''}
        }\n`;
      }

      // 工作区样式
      if (globalStyles.workspaceBackground || globalStyles.workspaceColor || globalStyles.workspaceBorder) {
        styleSetCSS += `.${themeClassName} .o-workspace {
          ${globalStyles.workspaceBackground ? `background-color: ${globalStyles.workspaceBackground} !important;` : ''}
          ${globalStyles.workspaceColor ? `color: ${globalStyles.workspaceColor} !important;` : ''}
          ${globalStyles.workspaceBorder ? `border: 1px solid ${globalStyles.workspaceBorder} !important;` : ''}
        }\n`;
      }

      // 设置分组样式
      if (globalStyles.settingGroupBackground || globalStyles.settingGroupColor || globalStyles.settingGroupBorder) {
        styleSetCSS += `.${themeClassName} .o-setting-group {
          ${globalStyles.settingGroupBackground ? `background-color: ${globalStyles.settingGroupBackground} !important;` : ''}
          ${globalStyles.settingGroupColor ? `color: ${globalStyles.settingGroupColor} !important;` : ''}
          ${globalStyles.settingGroupBorder ? `border: 1px solid ${globalStyles.settingGroupBorder} !important;` : ''}
        }\n`;
      }

      // 主题色和图标
      if (globalStyles.primaryColor) {
        styleSetCSS += `.${themeClassName} .o-primary-color {
          color: ${globalStyles.primaryColor} !important;
        }\n`;
      }

      if (globalStyles.iconColor) {
        styleSetCSS += `.${themeClassName} .o-icon-color {
          color: ${globalStyles.iconColor} !important;
        }\n`;
      }
    }

    const cssContent = `
      :root {
        /* 代码主题变量 */
        --code-bg: ${codeTheme.background};
        --code-color: ${codeTheme.color};
        --code-keyword: ${codeTheme.keyword};
        --code-string: ${codeTheme.string};
        --code-comment: ${codeTheme.comment};
        --code-number: ${codeTheme.number};
        --code-function: ${codeTheme.function};
        --code-variable: ${codeTheme.variable};
        --code-operator: ${codeTheme.operator};
        --code-type: ${codeTheme.type};
        --code-constant: ${codeTheme.constant};
        --code-punctuation: ${codeTheme.punctuation};
        
        /* 主题模式变量 */
        --theme-mode: ${effectiveTheme.mode};
        --is-dark-theme: ${effectiveTheme.mode === 'dark' ? '1' : '0'};
        
        /* 全局应用主题变量 */
        --app-bg: ${globalStyles?.mainBackground || (effectiveTheme.mode === 'dark' ? '#1a1a1a' : '#ffffff')};
        --app-text: ${globalStyles?.mainColor || (effectiveTheme.mode === 'dark' ? '#ffffff' : '#333333')};
        --app-border: ${globalStyles?.workspaceBorder || (effectiveTheme.mode === 'dark' ? '#444444' : '#dddddd')};
        --app-accent: ${globalStyles?.accentColor || (effectiveTheme.mode === 'dark' ? '#0066cc' : '#0088ff')};
        --app-primary: ${globalStyles?.primaryColor || (effectiveTheme.mode === 'dark' ? '#0066cc' : '#0088ff')};
      }

      /* 基于思路.md的样式集规则 */
      ${styleSetCSS}

      /* 全局应用样式 */
      .${themeClassName} {
        --aionui-theme-applied: true;
        --current-theme-name: "${effectiveTheme.name}";
      }

      .${themeClassName},
      .${themeClassName} body {
        background-color: var(--app-bg) !important;
        color: var(--app-text) !important;
      }

      /* 全局代码样式应用 */
      .${themeClassName} pre[class*="language-"],
      .${themeClassName} code[class*="language-"] {
        background: var(--code-bg) !important;
        color: var(--code-color) !important;
      }
      
      .${themeClassName} .token.comment { color: var(--code-comment) !important; }
      .${themeClassName} .token.keyword { color: var(--code-keyword) !important; }
      .${themeClassName} .token.string { color: var(--code-string) !important; }
      .${themeClassName} .token.number { color: var(--code-number) !important; }
      .${themeClassName} .token.function { color: var(--code-function) !important; }
      .${themeClassName} .token.variable { color: var(--code-variable) !important; }
      .${themeClassName} .token.operator { color: var(--code-operator) !important; }
      .${themeClassName} .token.property { color: var(--code-type) !important; }
      .${themeClassName} .token.constant { color: var(--code-constant) !important; }
      .${themeClassName} .token.punctuation { color: var(--code-punctuation) !important; }

      /* 主题变化过渡效果 */
      .${themeClassName} *, .${themeClassName} *::before, .${themeClassName} *::after {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
      }
    `;

    styleElement.textContent = cssContent;

    console.log(`🎨 Theme applied: ${effectiveTheme.name} (${effectiveTheme.mode}) at ${new Date().toLocaleTimeString()}`);
    console.log('🎨 CSS Content length:', cssContent.length);
    console.log('🎨 CSS Content preview:', cssContent.slice(0, 300) + '...');
    console.log('🎨 Style set CSS rules:', styleSetCSS.length > 0 ? `Generated ${styleSetCSS.split('\n').filter((l) => l.trim()).length} rules` : 'No style set rules');
    console.log('🎨 Global styles:', globalStyles);
    console.log('🎨 Body classes:', document.body.className);

    // 检查样式是否被应用
    setTimeout(() => {
      const bodyStyles = getComputedStyle(document.body);
      console.log('🎨 Applied body background:', bodyStyles.backgroundColor);
      console.log('🎨 Applied body color:', bodyStyles.color);
      console.log('🎨 Style element in DOM:', !!document.getElementById(styleId));
      console.log('🎨 Style content length:', styleElement.textContent?.length || 0);
    }, 100);
  }, [currentTheme, themeMode, systemTheme, availableThemes]); // 修复依赖，监听实际的状态变化

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

/**
 * 使用主题上下文的 Hook
 */
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }

  return context;
};

/**
 * 仅获取当前生效主题的轻量级 Hook
 */
export const useCurrentTheme = (): AppTheme | null => {
  const { getEffectiveTheme } = useThemeContext();
  return getEffectiveTheme();
};

/**
 * 仅获取语法高亮样式的专用 Hook
 */
export const useSyntaxHighlighterStyle = (): Record<string, any> => {
  const { generateSyntaxHighlighterStyle } = useThemeContext();
  return generateSyntaxHighlighterStyle();
};

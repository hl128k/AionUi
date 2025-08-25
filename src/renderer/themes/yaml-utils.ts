/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * YAML 主题文件解析工具
 * 支持从 YAML 格式加载和保存主题配置，符合思路.md设计方案
 */

// 暂时移除 js-yaml 依赖，使用简单的解析方案
// import yaml from 'js-yaml';
import type { AppTheme, CodeHighlightTheme, GlobalAppTheme } from './types';

/**
 * 应用样式集配置 (对应思路.md中的样式集定义)
 */
export interface AppStyleSet {
  [key: string]: Record<string, string | number>;
}

/**
 * YAML 主题文件格式定义 (更新为符合思路.md的设计)
 */
export interface YamlThemeFile {
  name: string;
  id: string;
  mode: 'light' | 'dark';
  description?: string;
  version?: string;
  author?: string;

  // 代码高亮配置
  codeHighlight: CodeHighlightTheme;

  // 应用样式集 (根据思路.md中的样式集定义)
  appStyles: AppStyleSet;

  // 元数据
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    tags?: string[];
    basedOn?: string;
  };

  // i18n 特定配置
  i18nConfig?: {
    preferredLocales?: string[];
    localeStyles?: Record<string, Partial<AppStyleSet>>;
  };
}

/**
 * 将应用样式集转换为 GlobalAppTheme 格式
 */
export function convertAppStylesToGlobalTheme(appStyles: AppStyleSet): GlobalAppTheme {
  const globalTheme: Partial<GlobalAppTheme> = {};

  // 处理左侧菜单栏样式 (o-slider)
  const slider = appStyles['o-slider'];
  if (slider) {
    if (slider.backgroundColor) globalTheme.siderBackground = slider.backgroundColor as string;
    if (slider.color) globalTheme.siderColor = slider.color as string;
    if (slider.borderRight) {
      const borderMatch = (slider.borderRight as string).match(/#[a-fA-F0-9]+/);
      globalTheme.siderBorder = borderMatch ? borderMatch[0] : '#d0d7de';
    }
  }

  // 处理右侧内容区域样式 (o-main)
  const main = appStyles['o-main'];
  if (main) {
    if (main.backgroundColor) globalTheme.mainBackground = main.backgroundColor as string;
    if (main.color) globalTheme.mainColor = main.color as string;
  }

  // 处理菜单样式
  const menu = appStyles['o-slider-menu'];
  if (menu) {
    if (menu.color) globalTheme.menuItemColor = menu.color as string;
    if (menu.backgroundColor) globalTheme.menuItemBackground = menu.backgroundColor as string;
  }

  const menuHover = appStyles['o-slider-menu-hover'];
  if (menuHover) {
    if (menuHover.color) globalTheme.menuItemHoverColor = menuHover.color as string;
    if (menuHover.backgroundColor) globalTheme.menuItemHoverBackground = menuHover.backgroundColor as string;
  }

  const menuActive = appStyles['o-slider-menu-active'];
  if (menuActive) {
    if (menuActive.color) globalTheme.menuItemActiveColor = menuActive.color as string;
    if (menuActive.backgroundColor) globalTheme.menuItemActiveBackground = menuActive.backgroundColor as string;
  }

  // 处理聊天消息样式
  const userMessage = appStyles['o-chat-message-user'];
  if (userMessage) {
    if (userMessage.backgroundColor) globalTheme.userMessageBackground = userMessage.backgroundColor as string;
    if (userMessage.color) globalTheme.userMessageColor = userMessage.color as string;
    if (userMessage.border) {
      const borderMatch = (userMessage.border as string).match(/#[a-fA-F0-9]+/);
      globalTheme.userMessageBorder = borderMatch ? borderMatch[0] : (userMessage.border as string);
    }
  }

  const assistantMessage = appStyles['o-chat-message-assistant'];
  if (assistantMessage) {
    if (assistantMessage.backgroundColor) globalTheme.assistantMessageBackground = assistantMessage.backgroundColor as string;
    if (assistantMessage.color) globalTheme.assistantMessageColor = assistantMessage.color as string;
    if (assistantMessage.border) {
      const borderMatch = (assistantMessage.border as string).match(/#[a-fA-F0-9]+/);
      globalTheme.assistantMessageBorder = borderMatch ? borderMatch[0] : (assistantMessage.border as string);
    }
  }

  const systemMessage = appStyles['o-chat-message-system'];
  if (systemMessage) {
    if (systemMessage.backgroundColor) globalTheme.systemMessageBackground = systemMessage.backgroundColor as string;
    if (systemMessage.color) globalTheme.systemMessageColor = systemMessage.color as string;
    if (systemMessage.border) {
      const borderMatch = (systemMessage.border as string).match(/#[a-fA-F0-9]+/);
      globalTheme.systemMessageBorder = borderMatch ? borderMatch[0] : (systemMessage.border as string);
    }
  }

  // 处理工作区样式
  const workspace = appStyles['o-workspace'];
  if (workspace) {
    if (workspace.backgroundColor) globalTheme.workspaceBackground = workspace.backgroundColor as string;
    if (workspace.color) globalTheme.workspaceColor = workspace.color as string;
    if (workspace.border) {
      const borderMatch = (workspace.border as string).match(/#[a-fA-F0-9]+/);
      globalTheme.workspaceBorder = borderMatch ? borderMatch[0] : (workspace.border as string);
    }
  }

  // 处理设置分组样式
  const settingGroup = appStyles['o-setting-group'];
  if (settingGroup) {
    if (settingGroup.backgroundColor) globalTheme.settingGroupBackground = settingGroup.backgroundColor as string;
    if (settingGroup.color) globalTheme.settingGroupColor = settingGroup.color as string;
    if (settingGroup.border) {
      const borderMatch = (settingGroup.border as string).match(/#[a-fA-F0-9]+/);
      globalTheme.settingGroupBorder = borderMatch ? borderMatch[0] : (settingGroup.border as string);
    }
  }

  // 处理主题色和图标
  const primaryColor = appStyles['o-primary-color'];
  if (primaryColor && primaryColor.color) {
    globalTheme.primaryColor = primaryColor.color as string;
    globalTheme.accentColor = primaryColor.color as string;
  }

  const iconColor = appStyles['o-icon-color'];
  if (iconColor && iconColor.color) {
    globalTheme.iconColor = iconColor.color as string;
  }

  return globalTheme as GlobalAppTheme;
}

/**
 * 从 YAML 字符串解析主题
 */
export function parseThemeFromYaml(yamlContent: string): AppTheme {
  try {
    // 暂时使用 JSON 解析作为替代方案
    let data: YamlThemeFile;
    try {
      // 如果是 JSON 格式
      data = JSON.parse(yamlContent) as YamlThemeFile;
    } catch {
      // 简单的 YAML 解析（仅处理基础格式）
      throw new Error('YAML parsing not implemented yet, please use JSON format');
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid YAML content');
    }

    // 转换应用样式集为全局主题格式
    const globalStyles = data.appStyles ? convertAppStylesToGlobalTheme(data.appStyles) : undefined;

    return {
      id: data.id || 'unnamed-theme',
      name: data.name || 'Unnamed Theme',
      mode: data.mode || 'light',
      description: data.description,
      codeHighlight: data.codeHighlight,
      globalStyles: globalStyles,
      isBuiltIn: false,
      createdAt: data.metadata?.createdAt || new Date().toISOString(),
      updatedAt: data.metadata?.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to parse YAML theme: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 将主题转换为 YAML 字符串
 */
export function themeToYaml(theme: AppTheme): string {
  // 这里需要将 GlobalAppTheme 转换回 AppStyleSet 格式
  // 为了简化，暂时使用基础格式
  const yamlData: Partial<YamlThemeFile> = {
    name: theme.name,
    id: theme.id,
    mode: theme.mode,
    description: theme.description,
    version: '1.0.0',
    author: 'AionUi User',
    codeHighlight: theme.codeHighlight,
    // TODO: 需要实现 GlobalAppTheme 到 AppStyleSet 的逆向转换
    metadata: {
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
      basedOn: 'User Custom',
    },
  };

  // 暂时使用 JSON 格式输出
  return JSON.stringify(yamlData, null, 2);
}

/**
 * 验证 YAML 主题文件的完整性
 */
export function validateYamlTheme(data: any): data is YamlThemeFile {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // 必需字段检查
  if (!data.name || typeof data.name !== 'string') {
    return false;
  }

  if (!data.id || typeof data.id !== 'string') {
    return false;
  }

  if (!data.mode || !['light', 'dark'].includes(data.mode)) {
    return false;
  }

  if (!data.codeHighlight || typeof data.codeHighlight !== 'object') {
    return false;
  }

  // 代码高亮必需字段检查
  const codeHighlight = data.codeHighlight;
  const requiredCodeFields = ['background', 'color', 'keyword', 'string', 'comment', 'number'];

  for (const field of requiredCodeFields) {
    if (!codeHighlight[field] || typeof codeHighlight[field] !== 'string') {
      return false;
    }
  }

  // 检查应用样式集
  if (data.appStyles && typeof data.appStyles !== 'object') {
    return false;
  }

  return true;
}

/**
 * 从文件路径加载 YAML 主题
 */
export async function loadThemeFromYamlFile(filePath: string): Promise<AppTheme> {
  try {
    // 这里应该使用适当的文件读取 API，暂时用 fetch 作为示例
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch theme file: ${response.statusText}`);
    }

    const yamlContent = await response.text();
    return parseThemeFromYaml(yamlContent);
  } catch (error) {
    throw new Error(`Failed to load theme from file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 批量加载多个 YAML 主题文件
 */
export async function loadThemesFromYamlFiles(filePaths: string[]): Promise<AppTheme[]> {
  const themes: AppTheme[] = [];
  const errors: string[] = [];

  for (const filePath of filePaths) {
    try {
      const theme = await loadThemeFromYamlFile(filePath);
      themes.push(theme);
    } catch (error) {
      errors.push(`${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (errors.length > 0) {
    console.warn('Some theme files failed to load:', errors);
  }

  return themes;
}

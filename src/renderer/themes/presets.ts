/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { createDefaultGlobalStyles } from './global-styles';
import type { AppTheme, CodeHighlightPreset } from './types';

/**
 * GitHub Light 主题预设
 * 基于经典的 GitHub 代码高亮风格
 */
export const githubLightPreset: CodeHighlightPreset = {
  id: 'github-light',
  name: 'GitHub Light',
  mode: 'light',
  description: 'Classic GitHub light theme with clean interface',
  basedOn: 'GitHub',
  theme: {
    // === 基础样式（主要）===
    background: '#ffffff',
    color: '#24292f',
    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '14px',
    lineHeight: '1.45',

    // === 界面样式（重点突出）===
    headerBackground: '#f6f8fa',
    headerColor: '#656d76',
    lineNumberColor: '#8c959f',
    selectedLineBackground: '#e7f1ff',
    borderColor: '#d0d7de',
    scrollbarColor: '#d0d7de',
    iconColor: '#656d76',
    inlineCodeBackground: '#f6f8fa',
    inlineCodeBorder: '#d0d7de',

    // === 语法元素（简化）===
    keyword: '#cf222e', // 关键字
    string: '#0a3069', // 字符串
    comment: '#6e7781', // 注释
    number: '#0550ae', // 数字
    function: '#8250df', // 函数
    variable: '#953800', // 变量
    operator: '#cf222e', // 操作符
    type: '#0550ae', // 类型
    constant: '#0550ae', // 常量
    punctuation: '#24292f', // 标点

    // === 进阶元素（保留必要）===
    className: '#8250df',
    property: '#0550ae',
    tag: '#116329',
    attr: '#8250df',
  },
};

/**
 * VS Code Dark+ 主题预设
 * 基于 VS Code 默认深色主题
 */
export const vscodeEarkPreset: CodeHighlightPreset = {
  id: 'vscode-dark',
  name: 'VS Code Dark+',
  mode: 'dark',
  description: 'Professional dark theme with modern interface',
  basedOn: 'VS Code',
  theme: {
    // === 基础样式（主要）===
    background: '#1e1e1e',
    color: '#d4d4d4',
    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '14px',
    lineHeight: '1.45',

    // === 界面样式（重点突出）===
    headerBackground: '#2d2d30',
    headerColor: '#cccccc',
    lineNumberColor: '#858585',
    selectedLineBackground: '#094771',
    borderColor: '#3e3e42',
    scrollbarColor: '#3e3e42',
    iconColor: '#cccccc',
    inlineCodeBackground: '#2d2d30',
    inlineCodeBorder: '#3e3e42',

    // === 语法元素（简化）===
    keyword: '#569cd6', // 关键字
    string: '#ce9178', // 字符串
    comment: '#6a9955', // 注释
    number: '#b5cea8', // 数字
    function: '#dcdcaa', // 函数
    variable: '#9cdcfe', // 变量
    operator: '#d4d4d4', // 操作符
    type: '#4ec9b0', // 类型
    constant: '#4fc1ff', // 常量
    punctuation: '#d4d4d4', // 标点

    // === 进阶元素（保留必要）===
    className: '#4ec9b0',
    property: '#92c5f7',
    tag: '#569cd6',
    attr: '#92c5f7',
  },
};

/**
 * Tomorrow Night 主题预设
 * 基于经典的 Tomorrow Night 主题
 */
export const tomorrowNightPreset: CodeHighlightPreset = {
  id: 'tomorrow-night',
  name: 'Tomorrow Night',
  mode: 'dark',
  description: 'Classic dark theme with balanced colors',
  basedOn: 'Tomorrow Night',
  theme: {
    // === 基础样式（主要）===
    background: '#1d1f21',
    color: '#c5c8c6',
    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '14px',
    lineHeight: '1.45',

    // === 界面样式（重点突出）===
    headerBackground: '#282a2e',
    headerColor: '#969896',
    lineNumberColor: '#666666',
    selectedLineBackground: '#373b41',
    borderColor: '#3c3f41',
    scrollbarColor: '#3c3f41',
    iconColor: '#969896',
    inlineCodeBackground: '#282a2e',
    inlineCodeBorder: '#3c3f41',

    // === 语法元素（简化）===
    keyword: '#cc6666', // 关键字
    string: '#b5bd68', // 字符串
    comment: '#969896', // 注释
    number: '#de935f', // 数字
    function: '#81a2be', // 函数
    variable: '#f0c674', // 变量
    operator: '#8abeb7', // 操作符
    type: '#b294bb', // 类型
    constant: '#de935f', // 常量
    punctuation: '#c5c8c6', // 标点

    // === 进阶元素（保留必要）===
    className: '#b294bb',
    property: '#81a2be',
    tag: '#cc6666',
    attr: '#f0c674',
  },
};

/**
 * Monokai 主题预设
 * 基于经典的 Monokai 主题
 */
export const monokaiPreset: CodeHighlightPreset = {
  id: 'monokai',
  name: 'Monokai',
  mode: 'dark',
  description: 'High contrast theme with vibrant colors',
  basedOn: 'Monokai',
  theme: {
    // === 基础样式（主要）===
    background: '#272822',
    color: '#f8f8f2',
    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '14px',
    lineHeight: '1.45',

    // === 界面样式（重点突出）===
    headerBackground: '#3e3d32',
    headerColor: '#a59f85',
    lineNumberColor: '#90908a',
    selectedLineBackground: '#49483e',
    borderColor: '#49483e',
    scrollbarColor: '#49483e',
    iconColor: '#a59f85',
    inlineCodeBackground: '#3e3d32',
    inlineCodeBorder: '#49483e',

    // === 语法元素（简化）===
    keyword: '#f92672', // 关键字
    string: '#e6db74', // 字符串
    comment: '#75715e', // 注释
    number: '#ae81ff', // 数字
    function: '#a6e22e', // 函数
    variable: '#f8f8f2', // 变量
    operator: '#f92672', // 操作符
    type: '#66d9ef', // 类型
    constant: '#ae81ff', // 常量
    punctuation: '#f8f8f2', // 标点

    // === 进阶元素（保留必要）===
    className: '#a6e22e',
    property: '#f8f8f2',
    tag: '#f92672',
    attr: '#a6e22e',
  },
};

/**
 * Solarized Light 主题预设
 * 基于经典的 Solarized Light 主题
 */
export const solarizedLightPreset: CodeHighlightPreset = {
  id: 'solarized-light',
  name: 'Solarized Light',
  mode: 'light',
  description: 'Eye-friendly light theme with scientific color palette',
  basedOn: 'Solarized',
  theme: {
    // === 基础样式（主要）===
    background: '#fdf6e3',
    color: '#657b83',
    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '14px',
    lineHeight: '1.45',

    // === 界面样式（重点突出）===
    headerBackground: '#eee8d5',
    headerColor: '#93a1a1',
    lineNumberColor: '#93a1a1',
    selectedLineBackground: '#e8e2b7',
    borderColor: '#d3af86',
    scrollbarColor: '#d3af86',
    iconColor: '#93a1a1',
    inlineCodeBackground: '#eee8d5',
    inlineCodeBorder: '#d3af86',

    // === 语法元素（简化）===
    keyword: '#859900', // 关键字
    string: '#2aa198', // 字符串
    comment: '#93a1a1', // 注释
    number: '#d33682', // 数字
    function: '#268bd2', // 函数
    variable: '#b58900', // 变量
    operator: '#859900', // 操作符
    type: '#dc322f', // 类型
    constant: '#cb4b16', // 常量
    punctuation: '#657b83', // 标点

    // === 进阶元素（保留必要）===
    className: '#268bd2',
    property: '#657b83',
    tag: '#dc322f',
    attr: '#6c71c4',
  },
};

/**
 * 所有内置主题预设
 */
export const builtInPresets: CodeHighlightPreset[] = [githubLightPreset, vscodeEarkPreset, tomorrowNightPreset, monokaiPreset, solarizedLightPreset];

/**
 * 根据预设创建完整的应用主题（包含全局样式）
 */
export function createAppThemeFromPreset(preset: CodeHighlightPreset): AppTheme {
  const effectiveMode = preset.mode === 'both' ? 'light' : preset.mode;

  return {
    id: `builtin-${preset.id}`,
    name: preset.name,
    mode: effectiveMode,
    description: preset.description,
    codeHighlight: preset.theme,
    globalStyles: createDefaultGlobalStyles(effectiveMode), // 新增全局样式
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 获取所有内置应用主题
 */
export function getBuiltInAppThemes(): AppTheme[] {
  return builtInPresets.map(createAppThemeFromPreset);
}

/**
 * 根据主题模式获取默认主题
 */
export function getDefaultThemeForMode(mode: 'light' | 'dark'): AppTheme {
  if (mode === 'dark') {
    return createAppThemeFromPreset(vscodeEarkPreset);
  } else {
    return createAppThemeFromPreset(githubLightPreset);
  }
}

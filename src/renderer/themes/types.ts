/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 主题模式类型
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * 代码高亮主题配置接口
 * 提供完整的语法高亮样式定制能力，允许用户自定义各种代码元素的显示样式
 */
export interface CodeHighlightTheme {
  // === 基础样式 ===
  /** 代码块背景色 */
  background: string;
  /** 默认文本颜色 */
  color: string;
  /** 字体系列 */
  fontFamily?: string;
  /** 字体大小 */
  fontSize?: string;
  /** 行高 */
  lineHeight?: string;

  // === 语法元素颜色 ===
  /** 关键字颜色 (if, else, function, class, etc.) */
  keyword: string;
  /** 字符串字面量颜色 */
  string: string;
  /** 注释颜色 */
  comment: string;
  /** 数字字面量颜色 */
  number: string;
  /** 函数名颜色 */
  function: string;
  /** 变量名颜色 */
  variable: string;
  /** 操作符颜色 (+, -, *, /, =, etc.) */
  operator: string;
  /** 类型标识符颜色 */
  type: string;
  /** 常量颜色 */
  constant: string;
  /** 标点符号颜色 (括号、分号等) */
  punctuation: string;

  // === 进阶语法元素 ===
  /** 类名颜色 */
  className?: string;
  /** 属性名颜色 */
  property?: string;
  /** 标签名颜色 (HTML/XML) */
  tag?: string;
  /** 属性值颜色 (HTML/XML) */
  attr?: string;
  /** 命名空间颜色 */
  namespace?: string;
  /** 正则表达式颜色 */
  regex?: string;
  /** 转义字符颜色 */
  escape?: string;

  // === 界面样式 ===
  /** 代码块头部背景色 */
  headerBackground?: string;
  /** 代码块头部文字颜色 */
  headerColor?: string;
  /** 行号颜色 */
  lineNumberColor?: string;
  /** 选中行背景色 */
  selectedLineBackground?: string;
  /** 边框颜色 */
  borderColor?: string;
  /** 滚动条颜色 */
  scrollbarColor?: string;
  /** 图标颜色（折叠/展开按钮） */
  iconColor?: string;
  /** 内联代码背景色 */
  inlineCodeBackground?: string;
  /** 内联代码边框色 */
  inlineCodeBorder?: string;
}

/**
 * 全局应用样式主题配置接口
 * 支持整个应用UI的样式定制，包括侧边栏、主内容区、消息等
 */
export interface GlobalAppTheme {
  // === 基础应用布局 ===
  /** 左侧菜单栏样式 */
  siderBackground: string;
  siderColor: string;
  siderBorder: string;

  /** 右侧内容区域样式 */
  mainBackground: string;
  mainColor: string;

  // === 菜单样式 ===
  /** 菜单项默认样式 */
  menuItemColor: string;
  menuItemBackground: string;

  /** 菜单项悬停样式 */
  menuItemHoverColor: string;
  menuItemHoverBackground: string;

  /** 菜单项激活样式 */
  menuItemActiveColor: string;
  menuItemActiveBackground: string;

  // === 聊天消息样式 ===
  /** 用户消息样式 */
  userMessageBackground: string;
  userMessageColor: string;
  userMessageBorder: string;

  /** AI助手消息样式 */
  assistantMessageBackground: string;
  assistantMessageColor: string;
  assistantMessageBorder: string;

  /** 系统消息样式 */
  systemMessageBackground: string;
  systemMessageColor: string;
  systemMessageBorder: string;

  // === 工作区样式 ===
  /** 工作区背景 */
  workspaceBackground: string;
  workspaceColor: string;
  workspaceBorder: string;

  // === 设置分组样式 ===
  /** 设置组背景 */
  settingGroupBackground: string;
  settingGroupColor: string;
  settingGroupBorder: string;

  // === 主题色和图标 ===
  /** 系统主题色（支持arco-design） */
  primaryColor: string;
  /** 图标颜色 */
  iconColor: string;
  /** 强调色 */
  accentColor: string;
  /** 成功色 */
  successColor?: string;
  /** 警告色 */
  warningColor?: string;
  /** 错误色 */
  errorColor?: string;
}

/**
 * 代码高亮主题预设
 * 预定义的主题配置，用户可以直接选择使用
 */
export interface CodeHighlightPreset {
  /** 预设主题唯一标识 */
  id: string;
  /** 预设主题显示名称 */
  name: string;
  /** 适用的主题模式 */
  mode: 'light' | 'dark' | 'both';
  /** 主题描述 */
  description?: string;
  /** 基于的经典主题（用于识别） */
  basedOn?: string;
  /** 主题配置 */
  theme: CodeHighlightTheme;
}

/**
 * 应用主题配置接口（扩展版）
 */
export interface AppTheme {
  /** 主题唯一标识 */
  id: string;
  /** 主题显示名称 */
  name: string;
  /** 主题模式 */
  mode: 'light' | 'dark';
  /** 代码高亮主题 */
  codeHighlight: CodeHighlightTheme;
  /** 全局应用主题样式（新增） */
  globalStyles?: GlobalAppTheme;
  /** 主题描述 */
  description?: string;
  /** 是否为内置主题 */
  isBuiltIn?: boolean;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

/**
 * 主题配置管理接口
 */
export interface ThemeConfig {
  /** 当前选中的主题ID */
  currentTheme: string;
  /** 主题模式 */
  themeMode: ThemeMode;
  /** 是否启用自动模式 */
  autoMode: boolean;
  /** 所有可用主题 */
  availableThemes: AppTheme[];
  /** 浅色模式偏好主题 */
  preferredLightTheme?: string;
  /** 深色模式偏好主题 */
  preferredDarkTheme?: string;
  /** 用户自定义主题存储路径 */
  customThemeDir?: string;
}

/**
 * 主题存储接口
 */
export interface ThemeStorage {
  /** 获取主题配置 */
  getThemeConfig(): Promise<ThemeConfig>;
  /** 保存主题配置 */
  saveThemeConfig(config: ThemeConfig): Promise<void>;
  /** 获取主题 */
  getTheme(themeId: string): Promise<AppTheme | null>;
  /** 保存主题 */
  saveTheme(theme: AppTheme): Promise<void>;
  /** 删除主题 */
  deleteTheme(themeId: string): Promise<boolean>;
  /** 获取所有主题 */
  getAllThemes(): Promise<AppTheme[]>;
  /** 导入主题 */
  importTheme(themeData: any): Promise<AppTheme>;
  /** 导出主题 */
  exportTheme(themeId: string): Promise<any>;
}

/**
 * CSS动态注入配置
 */
export interface CSSInjectionConfig {
  /** 是否启用全局样式注入 */
  enabled: boolean;
  /** 主题名称作为CSS类名前缀 */
  themePrefix: string;
  /** 样式注入的目标选择器 */
  targetSelector: string;
  /** 是否使用CSS变量 */
  useCSSVariables: boolean;
}

/**
 * i18n主题配置映射
 * 支持根据语言locale动态应用不同的主题
 */
export interface I18nThemeMapping {
  /** 默认主题ID（必需） */
  default: string;
  /** 语言特定主题映射 */
  locales: Record<string, string>;
}

/**
 * i18n增强的主题配置
 */
export interface I18nThemeConfig extends ThemeConfig {
  /** 是否启用i18n主题切换 */
  enableI18nThemes: boolean;
  /** 浅色模式的i18n主题映射 */
  i18nLightThemes?: I18nThemeMapping;
  /** 深色模式的i18n主题映射 */
  i18nDarkThemes?: I18nThemeMapping;
}

/**
 * 外部主题文件格式接口（用于导入导出）
 */
export interface ExternalThemeFile {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  description?: string;
  codeHighlight: CodeHighlightTheme;
  globalStyles?: GlobalAppTheme;
  version?: string;
  author?: string;
  createdAt?: string;
  /** i18n特定配置（可选） */
  i18nConfig?: {
    preferredLocales: string[];
    localeStyles?: Record<string, Partial<GlobalAppTheme>>;
  };
}

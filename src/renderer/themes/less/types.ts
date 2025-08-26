/**
 * Arco Design Less 变量主题系统类型定义
 */

export type ThemeMode = 'light' | 'dark';

/**
 * Arco Design 主题令牌（与官方文档保持一致）
 * 基于 https://arco.design/react/docs/theme
 */
export interface ArcoThemeTokens {
  // === 色彩系统 ===
  // 主色系
  colorPrimary?: string;
  colorSuccess?: string;
  colorWarning?: string;
  colorError?: string;
  colorInfo?: string;

  // 文本颜色
  colorTextBase?: string;
  colorText1?: string;
  colorText2?: string;
  colorText3?: string;
  colorText4?: string;

  // 背景色
  colorBgContainer?: string;
  colorBgElevated?: string;
  colorBgLayout?: string;
  colorBgMask?: string;

  // 边框色
  colorBorder?: string;
  colorBorderSecondary?: string;

  // 填充色
  colorFill?: string;
  colorFillSecondary?: string;
  colorFillTertiary?: string;
  colorFillQuaternary?: string;

  // === 尺寸系统 ===
  borderRadius?: number;
  borderRadiusLG?: number;
  borderRadiusSM?: number;
  borderRadiusXS?: number;

  // === 字体系统 ===
  fontSize?: number;
  fontSizeLG?: number;
  fontSizeSM?: number;
  fontSizeXL?: number;
  fontSizeXS?: number;

  lineHeight?: number;
  lineHeightLG?: number;
  lineHeightSM?: number;

  fontFamily?: string;
  fontFamilyCode?: string;

  // === 间距系统 ===
  padding?: number;
  paddingLG?: number;
  paddingSM?: number;
  paddingXL?: number;
  paddingXS?: number;

  margin?: number;
  marginLG?: number;
  marginSM?: number;
  marginXL?: number;
  marginXS?: number;

  // === 阴影系统 ===
  boxShadow?: string;
  boxShadowSecondary?: string;
  boxShadowTertiary?: string;

  // === 动画系统 ===
  motionDurationFast?: string;
  motionDurationMid?: string;
  motionDurationSlow?: string;

  motionEaseInOut?: string;
  motionEaseOut?: string;
  motionEaseIn?: string;
}

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 主题唯一标识 */
  id: string;
  /** 主题显示名称 */
  name: string;
  /** 主题模式 */
  mode: ThemeMode;
  /** 是否为内置主题 */
  builtin: boolean;
  /** 主题令牌配置 */
  tokens: ArcoThemeTokens;
  /** 主题描述 */
  description?: string;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

/**
 * 主题变量管理器接口
 */
export interface ThemeVariableManager {
  /** 获取当前主题 */
  getCurrentTheme(): ThemeConfig;
  /** 设置主题 */
  setTheme(theme: ThemeConfig): Promise<void>;
  /** 切换模式 */
  switchMode(mode: ThemeMode): Promise<void>;
  /** 获取可用主题列表 */
  getAvailableThemes(): ThemeConfig[];
  /** 创建自定义主题 */
  createCustomTheme(name: string, tokens: ArcoThemeTokens, baseMode: ThemeMode): Promise<ThemeConfig>;
  /** 删除自定义主题 */
  deleteCustomTheme(themeId: string): Promise<boolean>;
  /** 导出主题 */
  exportTheme(themeId: string): Promise<string>;
  /** 导入主题 */
  importTheme(themeData: string): Promise<ThemeConfig>;
}

/**
 * Less 编译结果接口
 */
export interface LessCompileResult {
  success: boolean;
  css?: string;
  error?: string;
  sourceMap?: any;
}

/**
 * 主题事件类型
 */
export interface ThemeEventTypes {
  'theme-changed': ThemeConfig;
  'theme-compiled': { themeId: string; css: string };
  'theme-error': { themeId: string; error: string };
  'mode-switched': ThemeMode;
}

/**
 * 外部主题文件格式
 */
export interface ExternalThemeFile {
  id: string;
  name: string;
  mode: ThemeMode;
  tokens: ArcoThemeTokens;
  description?: string;
  version?: string;
  author?: string;
  createdAt?: string;
}

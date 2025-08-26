import * as less from 'less';
import type { ArcoThemeTokens } from '../less/types';

export interface LessCompilerOptions {
  modifyVars?: Record<string, string>;
  filename?: string;
  compress?: boolean;
}

export interface ThemeCompilationResult {
  css: string;
  variables: Record<string, string>;
  success: boolean;
  error?: string;
}

/**
 * Less 主题编译器
 * 负责将 Arco Design Less 变量编译为 CSS
 */
export class LessThemeCompiler {
  private lessOptions: any;

  constructor() {
    this.lessOptions = {
      javascriptEnabled: true,
      compress: false,
      sourceMap: {},
    };
  }

  /**
   * 编译主题变量为 CSS
   */
  async compileTheme(baseVariables: string, customVariables: Record<string, string> = {}, options: LessCompilerOptions = {}): Promise<ThemeCompilationResult> {
    try {
      const modifyVars = {
        ...customVariables,
        ...options.modifyVars,
      };

      const lessContent = this.generateLessContent(baseVariables, modifyVars);

      const result = (await less.render(lessContent, {
        ...this.lessOptions,
        modifyVars,
        filename: options.filename || 'theme.less',
        compress: options.compress || false,
      })) as any;

      return {
        css: result.css || '',
        variables: modifyVars,
        success: true,
      };
    } catch (error) {
      console.error('Less compilation failed:', error);
      return {
        css: '',
        variables: {},
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 从 ArcoThemeTokens 生成 Less 变量
   */
  generateLessVariables(tokens: ArcoThemeTokens): Record<string, string> {
    const variables: Record<string, string> = {};

    // 主色系
    if (tokens.colorPrimary) {
      variables['@primary-color'] = tokens.colorPrimary;
    }
    if (tokens.colorSuccess) {
      variables['@success-color'] = tokens.colorSuccess;
    }
    if (tokens.colorWarning) {
      variables['@warning-color'] = tokens.colorWarning;
    }
    if (tokens.colorError) {
      variables['@error-color'] = tokens.colorError;
    }
    if (tokens.colorInfo) {
      variables['@info-color'] = tokens.colorInfo;
    }

    // 文本颜色
    if (tokens.colorTextBase) {
      variables['@text-color'] = tokens.colorTextBase;
    }
    if (tokens.colorText1) {
      variables['@text-color-secondary'] = tokens.colorText1;
    }
    if (tokens.colorText2) {
      variables['@text-color-placeholder'] = tokens.colorText2;
    }
    if (tokens.colorText3) {
      variables['@text-color-disabled'] = tokens.colorText3;
    }

    // 背景色
    if (tokens.colorBgContainer) {
      variables['@color-bg-1'] = tokens.colorBgContainer;
    }
    if (tokens.colorBgElevated) {
      variables['@color-bg-2'] = tokens.colorBgElevated;
    }
    if (tokens.colorBgLayout) {
      variables['@color-bg-3'] = tokens.colorBgLayout;
    }

    // 边框
    if (tokens.colorBorder) {
      variables['@color-border-1'] = tokens.colorBorder;
    }
    if (tokens.colorBorderSecondary) {
      variables['@color-border-2'] = tokens.colorBorderSecondary;
    }

    // 尺寸
    if (tokens.borderRadius) {
      variables['@border-radius-medium'] = `${tokens.borderRadius}px`;
    }
    if (tokens.borderRadiusLG) {
      variables['@border-radius-large'] = `${tokens.borderRadiusLG}px`;
    }
    if (tokens.borderRadiusSM) {
      variables['@border-radius-small'] = `${tokens.borderRadiusSM}px`;
    }

    // 字体
    if (tokens.fontSize) {
      variables['@font-size-body-1'] = `${tokens.fontSize}px`;
    }
    if (tokens.fontSizeLG) {
      variables['@font-size-title-1'] = `${tokens.fontSizeLG}px`;
    }
    if (tokens.fontSizeSM) {
      variables['@font-size-body-3'] = `${tokens.fontSizeSM}px`;
    }

    return variables;
  }

  /**
   * 生成 Less 内容
   */
  private generateLessContent(baseVariables: string, customVariables: Record<string, string>): string {
    const variableDeclarations = Object.entries(customVariables)
      .map(([key, value]) => `${key.startsWith('@') ? key : '@' + key}: ${value};`)
      .join('\n');

    return `
${variableDeclarations}

${baseVariables}

// 应用自定义变量到 Arco Design 组件
@import '~@arco-design/web-react/dist/css/arco.css';
    `;
  }

  /**
   * 预编译内置主题
   */
  async precompileBuiltinThemes(): Promise<Record<string, string>> {
    const themes: Record<string, string> = {};

    try {
      // 暂时使用硬编码的基础变量，后续可以改为文件读取
      const lightVariables = `
        @import '~@arco-design/web-react/dist/css/arco.css';
      `;

      const darkVariables = `
        @import '~@arco-design/web-react/dist/css/arco.css';
        body[data-theme='dark'] {
          // 暗色主题变量将在这里应用
        }
      `;

      // 编译亮色主题
      const lightResult = await this.compileTheme(lightVariables);
      if (lightResult.success) {
        themes.light = lightResult.css;
      }

      // 编译暗色主题
      const darkResult = await this.compileTheme(darkVariables);
      if (darkResult.success) {
        themes.dark = darkResult.css;
      }
    } catch (error) {
      console.error('Failed to precompile builtin themes:', error);
    }

    return themes;
  }

  /**
   * 编译自定义主题
   */
  async compileCustomTheme(themeName: string, tokens: ArcoThemeTokens, baseTheme: 'light' | 'dark' = 'light'): Promise<ThemeCompilationResult> {
    try {
      // 使用内联的基础变量而不是文件导入
      const baseVariables =
        baseTheme === 'dark'
          ? `
          @import '~@arco-design/web-react/dist/css/arco.css';
          // 暗色主题基础配置
        `
          : `
          @import '~@arco-design/web-react/dist/css/arco.css';
          // 亮色主题基础配置
        `;

      const customVariables = this.generateLessVariables(tokens);

      return await this.compileTheme(baseVariables, customVariables, { filename: `${themeName}.less` });
    } catch (error) {
      return {
        css: '',
        variables: {},
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export const lessCompiler = new LessThemeCompiler();

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ConfigProvider } from '@arco-design/web-react';
import type { ArcoThemeTokens, ThemeConfig, ThemeMode } from '../less/types';
import type { ThemeCompilationResult } from '../compiler/less-compiler';
import { lessCompiler } from '../compiler/less-compiler';

interface LessVariableThemeContextType {
  currentTheme: ThemeConfig;
  compiledCSS: string;
  isCompiling: boolean;
  compilationError: string | null;
  setTheme: (theme: ThemeConfig) => Promise<void>;
  switchMode: (mode: ThemeMode) => Promise<void>;
  compileCustomTheme: (tokens: ArcoThemeTokens) => Promise<boolean>;
  getAvailableThemes: () => ThemeConfig[];
}

const LessVariableThemeContext = createContext<LessVariableThemeContextType | null>(null);

export const useLessVariableTheme = () => {
  const context = useContext(LessVariableThemeContext);
  if (!context) {
    throw new Error('useLessVariableTheme must be used within LessVariableThemeProvider');
  }
  return context;
};

interface LessVariableThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeConfig;
  precompiledThemes?: Record<string, string>;
}

/**
 * Less 变量主题提供者
 * 使用 Arco Design Less 变量系统提供完整的主题定制功能
 */
export const LessVariableThemeProvider: React.FC<LessVariableThemeProviderProps> = ({ children, defaultTheme, precompiledThemes = {} }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(
    defaultTheme || {
      id: 'light',
      name: 'Light Theme',
      mode: 'light',
      builtin: true,
      tokens: {},
    }
  );

  const [compiledCSS, setCompiledCSS] = useState<string>('');
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [compilationError, setCompilationError] = useState<string | null>(null);
  const [availableThemes, setAvailableThemes] = useState<ThemeConfig[]>([]);
  const [compiledThemeCache, setCompiledThemeCache] = useState<Map<string, string>>(new Map());

  // 初始化可用主题列表
  useEffect(() => {
    const builtinThemes: ThemeConfig[] = [
      {
        id: 'light',
        name: 'Light Theme',
        mode: 'light',
        builtin: true,
        tokens: {},
      },
      {
        id: 'dark',
        name: 'Dark Theme',
        mode: 'dark',
        builtin: true,
        tokens: {},
      },
    ];

    setAvailableThemes(builtinThemes);
  }, []);

  // 应用编译后的 CSS 到页面
  const applyCSSToPage = useCallback(
    (css: string, themeId: string) => {
      // 移除旧的主题样式
      const existingStyle = document.getElementById(`arco-theme-${currentTheme.id}`);
      if (existingStyle) {
        existingStyle.remove();
      }

      if (css) {
        // 添加新的主题样式
        const styleElement = document.createElement('style');
        styleElement.id = `arco-theme-${themeId}`;
        styleElement.textContent = css;
        document.head.appendChild(styleElement);
      }
    },
    [currentTheme.id]
  );

  // 编译并应用主题
  const compileAndApplyTheme = useCallback(
    async (theme: ThemeConfig): Promise<boolean> => {
      setIsCompiling(true);
      setCompilationError(null);

      try {
        let result: ThemeCompilationResult;
        const cacheKey = `${theme.id}-${JSON.stringify(theme.tokens)}`;

        // 检查缓存
        if (compiledThemeCache.has(cacheKey)) {
          const cachedCSS = compiledThemeCache.get(cacheKey)!;
          setCompiledCSS(cachedCSS);
          applyCSSToPage(cachedCSS, theme.id);
          setCurrentTheme(theme);
          return true;
        }

        // 内置主题使用预编译的 CSS（如果可用）
        if (theme.builtin && precompiledThemes[theme.id]) {
          const css = precompiledThemes[theme.id];
          setCompiledCSS(css);
          applyCSSToPage(css, theme.id);
          setCurrentTheme(theme);
          compiledThemeCache.set(cacheKey, css);
          return true;
        }

        // 编译自定义主题或内置主题（如果没有预编译版本）
        if (Object.keys(theme.tokens).length > 0) {
          result = await lessCompiler.compileCustomTheme(theme.id, theme.tokens, theme.mode);
        } else {
          // 使用默认变量编译
          const baseTheme = theme.mode === 'dark' ? 'dark' : 'light';
          result = await lessCompiler.compileCustomTheme(theme.id, {}, baseTheme);
        }

        if (result.success && result.css) {
          setCompiledCSS(result.css);
          applyCSSToPage(result.css, theme.id);
          setCurrentTheme(theme);

          // 缓存编译结果
          compiledThemeCache.set(cacheKey, result.css);
          return true;
        } else {
          setCompilationError(result.error || 'Unknown compilation error');
          return false;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setCompilationError(errorMessage);
        console.error('Theme compilation failed:', error);
        return false;
      } finally {
        setIsCompiling(false);
      }
    },
    [precompiledThemes, compiledThemeCache, applyCSSToPage]
  );

  // 设置主题
  const setTheme = useCallback(
    async (theme: ThemeConfig): Promise<void> => {
      await compileAndApplyTheme(theme);
    },
    [compileAndApplyTheme]
  );

  // 切换模式（保持当前主题，只改变模式）
  const switchMode = useCallback(
    async (mode: ThemeMode): Promise<void> => {
      const newTheme: ThemeConfig = {
        ...currentTheme,
        mode,
        id: currentTheme.builtin ? mode : currentTheme.id,
      };
      await compileAndApplyTheme(newTheme);
    },
    [currentTheme, compileAndApplyTheme]
  );

  // 编译自定义主题
  const compileCustomTheme = useCallback(
    async (tokens: ArcoThemeTokens): Promise<boolean> => {
      const customTheme: ThemeConfig = {
        ...currentTheme,
        tokens,
        builtin: false,
      };
      return await compileAndApplyTheme(customTheme);
    },
    [currentTheme, compileAndApplyTheme]
  );

  // 获取可用主题列表
  const getAvailableThemes = useCallback(() => {
    return availableThemes;
  }, [availableThemes]);

  // 初始化默认主题
  useEffect(() => {
    if (defaultTheme) {
      compileAndApplyTheme(defaultTheme);
    }
  }, [defaultTheme, compileAndApplyTheme]);

  const contextValue: LessVariableThemeContextType = {
    currentTheme,
    compiledCSS,
    isCompiling,
    compilationError,
    setTheme,
    switchMode,
    compileCustomTheme,
    getAvailableThemes,
  };

  return (
    <LessVariableThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={{ primaryColor: currentTheme.mode === 'dark' ? '#3491FA' : '#165DFF' }}>{children}</ConfigProvider>
    </LessVariableThemeContext.Provider>
  );
};

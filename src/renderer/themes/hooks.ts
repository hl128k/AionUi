/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useThemeContext } from './provider';
import { detectSystemTheme } from './storage';
import type { AppTheme, CodeHighlightTheme } from './types';

/**
 * 主题切换Hook - 提供简单的主题切换功能
 */
export const useThemeSwitcher = () => {
  const { setTheme, availableThemes, currentTheme, isLoading } = useThemeContext();

  const switchTheme = useCallback(
    async (themeId: string) => {
      console.log('🎨 useThemeSwitcher: Switching theme to:', themeId);
      await setTheme(themeId);
    },
    [setTheme]
  );

  const switchToNextTheme = useCallback(async () => {
    if (availableThemes.length === 0 || !currentTheme) return;

    const currentIndex = availableThemes.findIndex((t) => t.id === currentTheme.id);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    const nextTheme = availableThemes[nextIndex];

    await switchTheme(nextTheme.id);
  }, [availableThemes, currentTheme, switchTheme]);

  const switchToPreviousTheme = useCallback(async () => {
    if (availableThemes.length === 0 || !currentTheme) return;

    const currentIndex = availableThemes.findIndex((t) => t.id === currentTheme.id);
    const prevIndex = currentIndex === 0 ? availableThemes.length - 1 : currentIndex - 1;
    const prevTheme = availableThemes[prevIndex];

    await switchTheme(prevTheme.id);
  }, [availableThemes, currentTheme, switchTheme]);

  return {
    switchTheme,
    switchToNextTheme,
    switchToPreviousTheme,
    currentTheme,
    availableThemes,
    isLoading,
  };
};

/**
 * 主题模式Hook - 专门处理明暗模式切换
 */
export const useThemeMode = () => {
  const { themeMode, setThemeMode, systemTheme, lightThemes, darkThemes } = useThemeContext();

  const toggleMode = useCallback(async () => {
    if (themeMode === 'auto') {
      // auto -> light -> dark -> auto
      await setThemeMode('light');
    } else if (themeMode === 'light') {
      await setThemeMode('dark');
    } else {
      await setThemeMode('auto');
    }
  }, [themeMode, setThemeMode]);

  const setLightMode = useCallback(async () => {
    await setThemeMode('light');
  }, [setThemeMode]);

  const setDarkMode = useCallback(async () => {
    await setThemeMode('dark');
  }, [setThemeMode]);

  const setAutoMode = useCallback(async () => {
    await setThemeMode('auto');
  }, [setThemeMode]);

  const effectiveMode = useMemo(() => {
    return themeMode === 'auto' ? systemTheme : themeMode;
  }, [themeMode, systemTheme]);

  return {
    themeMode,
    effectiveMode,
    systemTheme,
    lightThemes,
    darkThemes,
    toggleMode,
    setLightMode,
    setDarkMode,
    setAutoMode,
    isAuto: themeMode === 'auto',
    isLight: effectiveMode === 'light',
    isDark: effectiveMode === 'dark',
  };
};

/**
 * 代码高亮主题Hook - 专门用于语法高亮
 */
export const useCodeHighlightTheme = () => {
  const { getEffectiveTheme, generateSyntaxHighlighterStyle } = useThemeContext();

  const theme = getEffectiveTheme();
  const codeHighlight = theme?.codeHighlight;
  const syntaxHighlighterStyle = generateSyntaxHighlighterStyle();

  /**
   * 生成内联代码样式
   */
  const inlineCodeStyle = useMemo(() => {
    if (!codeHighlight) return {};

    return {
      backgroundColor: codeHighlight.inlineCodeBackground || '#f1f1f1',
      padding: '2px 4px',
      margin: '0 4px',
      borderRadius: '4px',
      border: '1px solid',
      borderColor: codeHighlight.inlineCodeBorder || '#ddd',
      color: codeHighlight.color,
      fontFamily: codeHighlight.fontFamily || 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
      fontSize: codeHighlight.fontSize || '14px',
    };
  }, [codeHighlight]);

  /**
   * 生成代码块头部样式
   */
  const codeBlockHeaderStyle = useMemo(() => {
    if (!codeHighlight) return {};

    return {
      backgroundColor: codeHighlight.headerBackground || '#dcdcdc',
      color: codeHighlight.headerColor || 'gray',
      borderTopLeftRadius: '0.3rem',
      borderTopRightRadius: '0.3rem',
      borderBottomLeftRadius: '0',
      borderBottomRightRadius: '0',
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
      alignItems: 'center',
      padding: '4px 12px',
    };
  }, [codeHighlight]);

  return {
    codeHighlight,
    syntaxHighlighterStyle,
    inlineCodeStyle,
    codeBlockHeaderStyle,
    theme,
  };
};

/**
 * 主题管理Hook - 提供主题的CRUD操作
 */
export const useThemeManager = () => {
  const { availableThemes, lightThemes, darkThemes, refreshThemes, importTheme, exportTheme, deleteTheme } = useThemeContext();

  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  /**
   * 导入主题文件
   */
  const handleImportTheme = useCallback(
    async (file: File): Promise<AppTheme | null> => {
      try {
        setIsImporting(true);
        const theme = await importTheme(file);
        return theme;
      } catch (error) {
        console.error('Failed to import theme:', error);
        return null;
      } finally {
        setIsImporting(false);
      }
    },
    [importTheme]
  );

  /**
   * 导出主题
   */
  const handleExportTheme = useCallback(
    async (themeId: string): Promise<boolean> => {
      try {
        setIsExporting(true);
        await exportTheme(themeId);
        return true;
      } catch (error) {
        console.error('Failed to export theme:', error);
        return false;
      } finally {
        setIsExporting(false);
      }
    },
    [exportTheme]
  );

  /**
   * 删除主题
   */
  const handleDeleteTheme = useCallback(
    async (themeId: string): Promise<boolean> => {
      try {
        return await deleteTheme(themeId);
      } catch (error) {
        console.error('Failed to delete theme:', error);
        return false;
      }
    },
    [deleteTheme]
  );

  /**
   * 根据关键词搜索主题
   */
  const searchThemes = useCallback(
    (keyword: string) => {
      if (!keyword.trim()) return availableThemes;

      const lowerKeyword = keyword.toLowerCase();
      return availableThemes.filter((theme) => theme.name.toLowerCase().includes(lowerKeyword) || theme.description?.toLowerCase().includes(lowerKeyword) || theme.id.toLowerCase().includes(lowerKeyword));
    },
    [availableThemes]
  );

  /**
   * 按类别分组主题
   */
  const groupedThemes = useMemo(() => {
    const builtIn = availableThemes.filter((t) => t.isBuiltIn);
    const custom = availableThemes.filter((t) => !t.isBuiltIn);

    return {
      all: availableThemes,
      builtIn,
      custom,
      light: lightThemes,
      dark: darkThemes,
    };
  }, [availableThemes, lightThemes, darkThemes]);

  return {
    availableThemes,
    groupedThemes,
    refreshThemes,
    handleImportTheme,
    handleExportTheme,
    handleDeleteTheme,
    searchThemes,
    isImporting,
    isExporting,
  };
};

/**
 * 主题预览Hook - 用于主题选择器中的实时预览
 */
export const useThemePreview = () => {
  const [previewTheme, setPreviewTheme] = useState<AppTheme | null>(null);
  const { generateSyntaxHighlighterStyle } = useThemeContext();

  /**
   * 开始预览主题
   */
  const startPreview = useCallback((theme: AppTheme) => {
    setPreviewTheme(theme);
  }, []);

  /**
   * 结束预览
   */
  const endPreview = useCallback(() => {
    setPreviewTheme(null);
  }, []);

  /**
   * 获取预览样式
   */
  const previewStyle = useMemo(() => {
    if (!previewTheme) return null;

    return generateSyntaxHighlighterStyle(previewTheme.codeHighlight);
  }, [previewTheme, generateSyntaxHighlighterStyle]);

  /**
   * 生成预览代码示例
   */
  const previewCode = `// Theme Preview: ${previewTheme?.name || 'Default'}
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log("Result:", result);

/* 
 * Multi-line comment
 * Theme: ${previewTheme?.description || 'No description'}
 */
export { fibonacci };`;

  return {
    previewTheme,
    previewStyle,
    previewCode,
    startPreview,
    endPreview,
    isPreviewMode: !!previewTheme,
  };
};

/**
 * 系统主题检测Hook
 */
export const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => detectSystemTheme());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else if (mediaQuery.addListener) {
      // 兼容旧版浏览器
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  return systemTheme;
};

/**
 * 主题性能监控Hook
 */
export const useThemePerformance = () => {
  const [renderCount, setRenderCount] = useState(0);
  const [lastThemeChange, setLastThemeChange] = useState<number | null>(null);
  const { currentTheme } = useThemeContext();

  useEffect(() => {
    setRenderCount((prev) => prev + 1);
  });

  useEffect(() => {
    if (currentTheme) {
      setLastThemeChange(Date.now());
    }
  }, [currentTheme]);

  const timeSinceLastChange = useMemo(() => {
    return lastThemeChange ? Date.now() - lastThemeChange : null;
  }, [lastThemeChange]);

  return {
    renderCount,
    lastThemeChange,
    timeSinceLastChange,
    currentTheme: currentTheme?.name,
  };
};

/**
 * 主题验证Hook - 用于主题编辑器
 */
export const useThemeValidator = () => {
  const validateColorValue = useCallback((color: string): boolean => {
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb\(|^rgba\(|^hsl\(|^hsla\(/;
    return colorRegex.test(color.trim());
  }, []);

  const validateTheme = useCallback(
    (theme: Partial<CodeHighlightTheme>): string[] => {
      const errors: string[] = [];

      const requiredColors = ['background', 'color', 'keyword', 'string', 'comment', 'number', 'function', 'variable', 'operator', 'type', 'constant', 'punctuation'];

      for (const colorKey of requiredColors) {
        const colorValue = theme[colorKey as keyof CodeHighlightTheme] as string;
        if (!colorValue) {
          errors.push(`Missing required color: ${colorKey}`);
        } else if (!validateColorValue(colorValue)) {
          errors.push(`Invalid color format: ${colorKey} = "${colorValue}"`);
        }
      }

      return errors;
    },
    [validateColorValue]
  );

  const isValidTheme = useCallback(
    (theme: Partial<CodeHighlightTheme>): boolean => {
      return validateTheme(theme).length === 0;
    },
    [validateTheme]
  );

  return {
    validateColorValue,
    validateTheme,
    isValidTheme,
  };
};

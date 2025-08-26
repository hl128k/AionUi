/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConfigProvider } from '@arco-design/web-react';
import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

/**
 * 简化的主题类型定义
 */
export interface SimpleTheme {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  arcoTheme?: any;
}

/**
 * 主题上下文类型
 */
export interface SimpleThemeContextType {
  currentTheme: SimpleTheme;
  themes: SimpleTheme[];
  setTheme: (themeId: string) => void;
  toggleTheme: () => void;
  isLight: boolean;
  isDark: boolean;
}

/**
 * 内置的简化主题
 */
const SIMPLE_THEMES: SimpleTheme[] = [
  {
    id: 'light',
    name: '明亮主题',
    mode: 'light',
    arcoTheme: {
      primaryColor: '#165DFF',
    },
  },
  {
    id: 'dark',
    name: '黑暗主题',
    mode: 'dark',
    arcoTheme: {
      primaryColor: '#3491FA',
    },
  },
];

/**
 * 主题上下文
 */
const SimpleThemeContext = createContext<SimpleThemeContextType | null>(null);

/**
 * 简化版主题提供者属性
 */
export interface SimpleThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark' | 'auto';
  onThemeChange?: (theme: SimpleTheme) => void;
}

/**
 * 检测系统主题
 */
function detectSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  return mediaQuery.matches ? 'dark' : 'light';
}

/**
 * 动态加载 Arco Design 深色主题 CSS
 */
function loadArcoDarkTheme(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载
    const existingLink = document.querySelector('link[data-arco-dark-theme]');
    if (existingLink) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/@arco-design/web-react@2.66.1/dist/css/arco-dark.css';
    link.setAttribute('data-arco-dark-theme', 'true');

    link.onload = () => resolve();
    link.onerror = () => reject(new Error('Failed to load dark theme CSS'));

    document.head.appendChild(link);
  });
}

/**
 * 简化版主题提供者
 */
export const SimpleThemeProvider: React.FC<SimpleThemeProviderProps> = ({ children, defaultTheme = 'auto', onThemeChange }) => {
  // 初始化主题
  const getInitialTheme = useCallback((): SimpleTheme => {
    const systemTheme = detectSystemTheme();
    const targetMode = defaultTheme === 'auto' ? systemTheme : defaultTheme;
    return SIMPLE_THEMES.find((t) => t.mode === targetMode) || SIMPLE_THEMES[0];
  }, [defaultTheme]);

  const [currentTheme, setCurrentThemeState] = useState<SimpleTheme>(getInitialTheme);
  const [darkThemeLoaded, setDarkThemeLoaded] = useState(false);

  /**
   * 设置主题
   */
  const setTheme = useCallback(
    async (themeId: string) => {
      const theme = SIMPLE_THEMES.find((t) => t.id === themeId);
      if (theme) {
        // 如果是深色主题且还未加载深色样式，先加载
        if (theme.mode === 'dark' && !darkThemeLoaded) {
          try {
            await loadArcoDarkTheme();
            setDarkThemeLoaded(true);
            console.log('🎨 Arco dark theme CSS loaded');
          } catch (error) {
            console.warn('Failed to load dark theme CSS:', error);
          }
        }

        setCurrentThemeState(theme);
        onThemeChange?.(theme);

        // 保存到本地存储
        try {
          localStorage.setItem('aionui-simple-theme', themeId);
        } catch (error) {
          console.warn('Failed to save theme to localStorage:', error);
        }
      }
    },
    [onThemeChange, darkThemeLoaded]
  );

  /**
   * 切换主题
   */
  const toggleTheme = useCallback(() => {
    const nextTheme = currentTheme.mode === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  }, [currentTheme.mode, setTheme]);

  /**
   * 监听系统主题变化
   */
  useEffect(() => {
    if (defaultTheme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        const systemTheme = e.matches ? 'dark' : 'light';
        setTheme(systemTheme);
      };

      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, [defaultTheme, setTheme]);

  /**
   * 从本地存储恢复主题
   */
  useEffect(() => {
    if (defaultTheme !== 'auto') {
      try {
        const savedThemeId = localStorage.getItem('aionui-simple-theme');
        if (savedThemeId && savedThemeId !== currentTheme.id) {
          setTheme(savedThemeId);
        }
      } catch (error) {
        console.warn('Failed to restore theme from localStorage:', error);
      }
    }
  }, [defaultTheme, currentTheme.id, setTheme]);

  /**
   * 应用主题到文档
   */
  useEffect(() => {
    const root = document.documentElement;

    // 设置主题模式类名
    root.className = root.className.replace(/theme-(light|dark)/g, '');
    root.classList.add(`theme-${currentTheme.mode}`);

    // 设置 data 属性
    root.setAttribute('data-theme', currentTheme.mode);
    root.setAttribute('arco-theme', currentTheme.mode);

    // 设置 CSS 变量
    root.style.setProperty('--theme-mode', currentTheme.mode);

    // 应用 Arco Design 的内置主题 CSS 类
    if (currentTheme.mode === 'dark') {
      document.body.setAttribute('arco-theme', 'dark');
    } else {
      document.body.removeAttribute('arco-theme');
    }

    console.log(`🎨 Theme applied: ${currentTheme.name} (${currentTheme.mode})`);
  }, [currentTheme]);

  const contextValue: SimpleThemeContextType = {
    currentTheme,
    themes: SIMPLE_THEMES,
    setTheme,
    toggleTheme,
    isLight: currentTheme.mode === 'light',
    isDark: currentTheme.mode === 'dark',
  };

  return (
    <SimpleThemeContext.Provider value={contextValue}>
      <ConfigProvider
        theme={{
          primaryColor: currentTheme.mode === 'dark' ? '#3491FA' : '#165DFF',
        }}
        componentConfig={{}}
      >
        {children}
      </ConfigProvider>
    </SimpleThemeContext.Provider>
  );
};

/**
 * 使用简化主题的 Hook
 */
export const useSimpleTheme = (): SimpleThemeContextType => {
  const context = useContext(SimpleThemeContext);

  if (!context) {
    throw new Error('useSimpleTheme must be used within a SimpleThemeProvider');
  }

  return context;
};

/**
 * 主题切换组件
 */
export const SimpleThemeToggle: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className, style }) => {
  const { currentTheme, toggleTheme } = useSimpleTheme();

  return (
    <button className={className} style={style} onClick={toggleTheme} title={`切换到${currentTheme.mode === 'light' ? '黑暗' : '明亮'}主题`} aria-label='切换主题'>
      {currentTheme.mode === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

/**
 * 主题选择器组件
 */
export const SimpleThemeSelector: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className, style }) => {
  const { currentTheme, themes, setTheme } = useSimpleTheme();

  return (
    <select className={className} style={style} value={currentTheme.id} onChange={(e) => setTheme(e.target.value)} aria-label='选择主题'>
      {themes.map((theme) => (
        <option key={theme.id} value={theme.id}>
          {theme.name}
        </option>
      ))}
    </select>
  );
};

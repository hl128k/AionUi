/**
 * 简单的主题切换系统
 * 基于 Arco Design 原生主题功能
 */

import { ConfigProvider } from '@arco-design/web-react';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// 导出代码高亮主题 hook
export { useCodeHighlightTheme } from './useCodeHighlightTheme';

interface SimpleThemeProviderProps {
  children: React.ReactNode;
}

export const SimpleThemeProvider: React.FC<SimpleThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // 从 localStorage 读取保存的主题
    const saved = localStorage.getItem('simple-theme');
    return (saved as ThemeMode) || 'light';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('simple-theme', newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    // 应用主题到 body
    if (theme === 'dark') {
      document.body.setAttribute('arco-theme', 'dark');
      // 为 Arco 组件设置暗色主题
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('arco-theme');
      document.body.removeAttribute('data-theme');
    }
  }, [theme]);

  return (
    <ConfigProvider
      theme={
        {
          // 使用 Arco Design 的主题配置
        }
      }
    >
      <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>
    </ConfigProvider>
  );
};

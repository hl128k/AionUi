import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ConfigProvider } from '@arco-design/web-react';
import { themeManager } from './manager';
import type { ThemeMode, ThemePack } from './types';

interface ThemeContextValue {
  themeId: string;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  setTheme: (id: string) => void;
  list: ThemePack[];
  exportTheme: (id: string) => string | null;
  importTheme: (json: string) => boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [{ themeId, mode }, setState] = useState(() => {
    const { pack, mode } = themeManager.getCurrent();
    return { themeId: pack.id, mode };
  });

  // keep DOM in sync
  useEffect(() => {
    themeManager.setCurrentTheme(themeId);
    themeManager.setMode(mode);
    themeManager.applyToDOM(document.body);
  }, [themeId, mode]);

  const list = useMemo(() => themeManager.getAll(), [themeId, mode]);

  const setModeCb = useCallback((m: ThemeMode) => setState((s) => ({ ...s, mode: m })), []);
  const setThemeCb = useCallback((id: string) => setState((s) => ({ ...s, themeId: id })), []);

  const exportTheme = useCallback((id: string) => themeManager.exportTheme(id), []);
  const importTheme = useCallback((json: string) => {
    const ok = !!themeManager.importTheme(json);
    if (ok) {
      // Re-apply to DOM so variable/i18n style changes take effect immediately
      themeManager.applyToDOM(document.body);
      // trigger context consumers if needed
      setState((s) => ({ ...s }));
    }
    return ok;
  }, []);

  const arcoTheme = useMemo(() => {
    const { pack } = themeManager.getCurrent();
    return mode === 'dark' ? pack.dark.arco : pack.light.arco;
  }, [themeId, mode]);

  return (
    <ConfigProvider theme={arcoTheme}>
      <ThemeContext.Provider value={{ themeId, mode, setMode: setModeCb, setTheme: setThemeCb, list, exportTheme, importTheme }}>{children}</ThemeContext.Provider>
    </ConfigProvider>
  );
};

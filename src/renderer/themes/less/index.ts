/**
 * Less 变量主题系统导出
 * 提供完整的主题系统API
 */

// 核心组件
export { LessVariableThemeProvider, useLessVariableTheme } from '../providers/less-variable-provider';
export { LessVariableThemeManager } from '../components/LessVariableThemeManager';
export { LessThemeTest } from '../components/LessThemeTest';

// 管理器和编译器
export { themeManager, LessVariableThemeManager as ThemeManagerClass } from '../managers/theme-manager';
export { lessCompiler, LessThemeCompiler } from '../compiler/less-compiler';

// 类型定义
export type { ThemeMode, ArcoThemeTokens, ThemeConfig, ThemeVariableManager, LessCompileResult, ThemeEventTypes, ExternalThemeFile } from './types';

// 编译器类型
export type { LessCompilerOptions, ThemeCompilationResult } from '../compiler/less-compiler';

// 使用示例：
/*
import React from 'react';
import { 
  LessVariableThemeProvider, 
  LessVariableThemeManager, 
  LessThemeTest 
} from './themes/less';

function App() {
  return (
    <LessVariableThemeProvider>
      <div>
        <h1>应用主体内容</h1>
        
        // 在设置页面中使用主题管理器
        <LessVariableThemeManager />
        
        // 开发和测试时使用测试组件
        <LessThemeTest />
      </div>
    </LessVariableThemeProvider>
  );
}

export default App;
*/

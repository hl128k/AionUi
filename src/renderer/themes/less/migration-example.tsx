/**
 * Less 变量主题系统迁移示例
 * 展示如何从现有主题系统迁移到新的 Less 变量系统
 */

import React from 'react';
import { ConfigProvider } from '@arco-design/web-react';
import { LessVariableThemeProvider, useLessVariableTheme } from '../less';

// ===== 第1步：包装现有应用 =====
// 用 LessVariableThemeProvider 包装你的应用根组件

export const MigratedApp: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LessVariableThemeProvider
      defaultTheme={{
        id: 'light',
        name: 'Light Theme',
        mode: 'light',
        builtin: true,
        tokens: {
          colorPrimary: '#165dff',
          colorSuccess: '#00b42a',
          colorWarning: '#ff7d00',
          colorError: '#f53f3f',
        },
      }}
    >
      {children}
    </LessVariableThemeProvider>
  );
};

// ===== 第2步：迁移主题相关组件 =====
// 将现有的主题切换组件迁移到使用新的 hook

export const MigratedThemeSwitch: React.FC = () => {
  const { currentTheme, switchMode, isCompiling } = useLessVariableTheme();

  return (
    <div>
      <span>当前主题: {currentTheme.mode}</span>
      <button onClick={() => switchMode(currentTheme.mode === 'light' ? 'dark' : 'light')} disabled={isCompiling}>
        {isCompiling ? '切换中...' : `切换到${currentTheme.mode === 'light' ? '暗色' : '亮色'}模式`}
      </button>
    </div>
  );
};

// ===== 第3步：在设置页面中添加主题管理 =====
// 在设置页面中添加新的主题管理界面

export const MigratedSettingsPage: React.FC = () => {
  return (
    <div>
      <h2>应用设置</h2>

      {/* 其他设置项... */}

      {/* 主题设置部分 - 现在使用新的管理器 */}
      <section>
        <h3>主题设置</h3>
        {/* 动态导入主题管理器组件，避免打包体积过大 */}
        <React.Suspense fallback={<div>加载主题设置...</div>}>
          <LazyThemeManager />
        </React.Suspense>
      </section>
    </div>
  );
};

// 懒加载主题管理器组件
const LazyThemeManager = React.lazy(async () => {
  const { LessVariableThemeManager } = await import('../less');
  return { default: LessVariableThemeManager };
});

// ===== 第4步：配置兼容性层 =====
// 为现有代码提供向后兼容

export const LegacyThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentTheme } = useLessVariableTheme();

  // 将新主题格式转换为旧格式（如果需要）
  const legacyTheme = {
    mode: currentTheme.mode,
    primaryColor: currentTheme.tokens.colorPrimary || '#165dff',
    // 其他兼容性映射...
  };

  return (
    <ConfigProvider theme={{ primaryColor: currentTheme.mode === 'dark' ? '#3491FA' : '#165DFF' }}>
      {/* 可以在这里注入全局CSS变量供旧组件使用 */}
      <style>
        {`
          :root {
            --legacy-primary-color: ${legacyTheme.primaryColor};
            --legacy-theme-mode: ${legacyTheme.mode};
          }
        `}
      </style>
      {children}
    </ConfigProvider>
  );
};

// ===== 第5步：完整的迁移示例 =====

export const CompleteApp: React.FC = () => {
  return (
    <MigratedApp>
      <LegacyThemeProvider>
        <div className='app'>
          {/* 应用头部 */}
          <header>
            <h1>AionUi</h1>
            <MigratedThemeSwitch />
          </header>

          {/* 主要内容 */}
          <main>{/* 你的应用内容... */}</main>

          {/* 设置页面（当用户打开设置时） */}
          <MigratedSettingsPage />
        </div>
      </LegacyThemeProvider>
    </MigratedApp>
  );
};

// ===== 迁移步骤总结 =====
/*
1. 安装依赖：
   - less@^4.4.1
   - less-loader@^12.3.0
   - @types/less@^3.0.8

2. 配置 webpack（已完成）：
   - 添加 Less 文件处理规则
   - 支持 .less 文件扩展名

3. 应用代码迁移：
   - 用 LessVariableThemeProvider 包装根组件
   - 使用 useLessVariableTheme hook 替代旧的主题hook
   - 在设置页面添加 LessVariableThemeManager 组件

4. 渐进式迁移：
   - 保持旧的主题提供者并行运行
   - 逐步迁移各个组件使用新的主题系统
   - 最后移除旧的主题相关代码

5. 测试和验证：
   - 使用 LessThemeTest 组件验证功能
   - 确保所有主题切换正常工作
   - 验证编译和缓存机制正常
*/

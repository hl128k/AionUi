# AionUi SyntaxHighlighter主题系统

> 🎨 为AionUi打造的专业级代码高亮主题系统，提供完整的主题管理和自定义能力

## 🚀 快速开始

### 1. 基础设置

```typescript
import React from 'react';
import { ThemeProvider } from '@renderer/themes';

function App() {
  return (
    <ThemeProvider>
      {/* 你的应用组件 */}
      <YourAppContent />
    </ThemeProvider>
  );
}
```

### 2. 使用主题Hook

```typescript
import { useCodeHighlightTheme, useThemeSwitcher } from '@renderer/themes';

function CodeComponent() {
  const { syntaxHighlighterStyle, inlineCodeStyle } = useCodeHighlightTheme();
  const { switchTheme, currentTheme } = useThemeSwitcher();

  return (
    <SyntaxHighlighter style={syntaxHighlighterStyle}>
      {code}
    </SyntaxHighlighter>
  );
}
```

## 🎨 UI组件

### ThemeSelector - 主题选择器

```typescript
import { ThemeSelector } from '@renderer/themes';

// 网格模式（默认）
<ThemeSelector
  mode="grid"
  showSearch={true}
  showModeToggle={true}
  cardSize="medium"
  columns={4}
/>

// 下拉模式
<ThemeSelector mode="dropdown" />

// 紧凑模式
<ThemeSelector mode="compact" />
```

### ThemePreview - 主题预览

```typescript
import { ThemePreview } from '@renderer/themes';

// 内联预览
<ThemePreview
  mode="inline"
  showInfo={true}
  showCode={true}
  codeLanguage="typescript"
/>

// 模态框预览
<ThemePreview mode="modal" />

// 侧边栏预览
<ThemePreview mode="sidebar" />
```

### ThemeSettings - 主题设置

```typescript
import { ThemeSettings } from '@renderer/themes';

<ThemeSettings
  defaultActiveTab="selector"
  onSettingsChange={(settings) => console.log(settings)}
/>
```

## 🔧 高级用法

### 自定义主题

```typescript
import { themeManager } from '@renderer/themes';

// 导入主题
const file = new File([jsonData], 'my-theme.json');
const theme = await themeManager.importTheme(file);

// 导出主题
await themeManager.exportTheme('theme-id');

// 删除主题
await themeManager.deleteTheme('theme-id');
```

### 主题管理器

```typescript
import { useThemeManager } from '@renderer/themes';

function ThemeManagement() {
  const {
    availableThemes,
    handleImportTheme,
    handleExportTheme,
    handleDeleteTheme,
    searchThemes
  } = useThemeManager();

  const filteredThemes = searchThemes('keyword');

  return (
    <div>
      {availableThemes.map(theme => (
        <div key={theme.id}>
          {theme.name}
          <button onClick={() => handleExportTheme(theme.id)}>
            导出
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 主题模式控制

```typescript
import { useThemeMode } from '@renderer/themes';

function ThemeModeControl() {
  const {
    themeMode,
    effectiveMode,
    toggleMode,
    setLightMode,
    setDarkMode,
    setAutoMode
  } = useThemeMode();

  return (
    <div>
      <p>当前模式: {themeMode}</p>
      <p>生效模式: {effectiveMode}</p>
      <button onClick={toggleMode}>切换模式</button>
    </div>
  );
}
```

## 📚 API参考

### Hooks

| Hook名称                | 说明                 | 返回值                                             |
| ----------------------- | -------------------- | -------------------------------------------------- |
| `useThemeContext`       | 获取主题上下文       | `ThemeContextType`                                 |
| `useCurrentTheme`       | 获取当前主题         | `AppTheme \| null`                                 |
| `useCodeHighlightTheme` | 获取代码高亮相关样式 | `{ syntaxHighlighterStyle, inlineCodeStyle, ... }` |
| `useThemeSwitcher`      | 主题切换功能         | `{ switchTheme, currentTheme, ... }`               |
| `useThemeMode`          | 主题模式控制         | `{ themeMode, toggleMode, ... }`                   |
| `useThemeManager`       | 主题管理功能         | `{ availableThemes, handleImportTheme, ... }`      |

### 组件属性

#### ThemeSelector Props

```typescript
interface ThemeSelectorProps {
  mode?: 'dropdown' | 'grid' | 'compact';
  showSearch?: boolean;
  showModeToggle?: boolean;
  showSettings?: boolean;
  cardSize?: 'small' | 'medium' | 'large';
  columns?: number;
  onThemeChange?: (theme: AppTheme) => void;
}
```

#### ThemePreview Props

```typescript
interface ThemePreviewProps {
  theme?: AppTheme;
  mode?: 'inline' | 'modal' | 'sidebar';
  showInfo?: boolean;
  showCode?: boolean;
  codeLanguage?: string;
  customCode?: string;
  size?: 'small' | 'medium' | 'large';
}
```

## 🎯 内置主题

系统提供5个精心调配的内置主题：

1. **GitHub Light** - 经典GitHub浅色主题
2. **VS Code Dark+** - VS Code默认深色主题
3. **Tomorrow Night** - 经典Tomorrow Night深色主题
4. **Monokai** - 高对比度Monokai主题
5. **Solarized Light** - 护眼Solarized浅色主题

## 🔧 自定义主题格式

```json
{
  "id": "my-theme",
  "name": "我的主题",
  "mode": "dark",
  "description": "自定义主题描述",
  "codeHighlight": {
    "background": "#1e1e1e",
    "color": "#d4d4d4",
    "keyword": "#569cd6",
    "string": "#ce9178",
    "comment": "#6a9955",
    "number": "#b5cea8",
    "function": "#dcdcaa",
    "variable": "#9cdcfe",
    "operator": "#d4d4d4",
    "type": "#4ec9b0",
    "constant": "#4fc1ff",
    "punctuation": "#d4d4d4"
  }
}
```

## 💡 最佳实践

### 1. 性能优化

- 使用缓存机制避免重复计算
- 合理使用useMemo和useCallback

### 2. 用户体验

- 提供主题预览功能
- 支持键盘快捷键
- 实现平滑的主题切换动画

### 3. 错误处理

- 主题文件验证
- 优雅的错误降级
- 用户友好的错误提示

## 🤝 贡献指南

1. Fork项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

Apache-2.0 License - 详见[LICENSE](../../LICENSE)文件

---

🎨 **让代码高亮更美好！** 如有问题，请提交Issue或参与讨论。

/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, Divider, Space, Tag, Typography } from '@arco-design/web-react';
import { Code, Moon, SunOne } from '@icon-park/react';
import React, { useMemo } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { useThemePreview } from '../hooks';
import type { AppTheme } from '../types';

const { Title, Text } = Typography;

/**
 * 主题预览组件属性
 */
export interface ThemePreviewProps {
  /** 要预览的主题 */
  theme?: AppTheme;
  /** 预览模式 */
  mode?: 'inline' | 'modal' | 'sidebar';
  /** 是否显示主题信息 */
  showInfo?: boolean;
  /** 是否显示代码示例 */
  showCode?: boolean;
  /** 代码示例语言 */
  codeLanguage?: string;
  /** 自定义代码示例 */
  customCode?: string;
  /** 预览尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
}

/**
 * 默认代码示例
 */
const DEFAULT_CODE_SAMPLES = {
  typescript: `// TypeScript 示例代码
interface User {
  id: number;
  name: string;
  email?: string;
}

function getUserInfo(user: User): string {
  // 检查用户信息
  if (!user.name) {
    throw new Error("用户名不能为空");
  }
  
  const info = \`用户 \${user.name}\`;
  return user.email ? 
    \`\${info} (\${user.email})\` : info;
}

const users: User[] = [
  { id: 1, name: "张三", email: "zhangsan@example.com" },
  { id: 2, name: "李四" }
];

// 处理用户列表
users.forEach(user => {
  try {
    console.log(getUserInfo(user));
  } catch (error) {
    console.error("错误:", error.message);
  }
});`,

  javascript: `// JavaScript 示例代码
function fibonacci(n) {
  // 斐波那契数列
  if (n <= 1) return n;
  
  const cache = new Map();
  
  function fib(num) {
    if (cache.has(num)) {
      return cache.get(num);
    }
    
    const result = fib(num - 1) + fib(num - 2);
    cache.set(num, result);
    return result;
  }
  
  return fib(n);
}

// 计算前10个斐波那契数
const sequence = [];
for (let i = 0; i < 10; i++) {
  sequence.push(fibonacci(i));
}

console.log("斐波那契数列:", sequence);
// 输出: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`,

  python: `# Python 示例代码
from typing import List, Dict, Optional
import json

class DataProcessor:
    """数据处理器类"""
    
    def __init__(self, name: str):
        self.name = name
        self.data: List[Dict] = []
    
    def add_item(self, item: Dict) -> None:
        """添加数据项"""
        if not isinstance(item, dict):
            raise ValueError("数据项必须是字典类型")
        
        item['timestamp'] = self._get_timestamp()
        self.data.append(item)
    
    def _get_timestamp(self) -> str:
        """获取当前时间戳"""
        import datetime
        return datetime.datetime.now().isoformat()
    
    def filter_data(self, condition: callable) -> List[Dict]:
        """根据条件过滤数据"""
        return [item for item in self.data if condition(item)]
    
    def to_json(self) -> str:
        """导出为JSON格式"""
        return json.dumps({
            'processor': self.name,
            'count': len(self.data),
            'data': self.data
        }, indent=2, ensure_ascii=False)

# 使用示例
processor = DataProcessor("用户数据处理器")
processor.add_item({"name": "张三", "age": 25})
processor.add_item({"name": "李四", "age": 30})

# 过滤年龄大于25的用户
adults = processor.filter_data(lambda x: x.get('age', 0) > 25)
print(f"年龄大于25的用户: {len(adults)} 人")`,
};

/**
 * 主题信息卡片组件
 */
const ThemeInfoCard: React.FC<{ theme: AppTheme; size: string }> = ({ theme, size }) => {
  const isSmall = size === 'small';

  return (
    <Card
      size={isSmall ? 'small' : 'default'}
      style={{ marginBottom: 16 }}
      title={
        <Space>
          {theme.mode === 'light' ? <SunOne /> : <Moon />}
          <Text>{theme.name}</Text>
          {theme.isBuiltIn && (
            <Tag color='blue' size='small'>
              内置主题
            </Tag>
          )}
        </Space>
      }
    >
      {theme.description && (
        <div style={{ marginBottom: 12 }}>
          <Text type='secondary'>{theme.description}</Text>
        </div>
      )}

      <Space wrap>
        <Tag color={theme.mode === 'light' ? 'orange' : 'purple'}>{theme.mode === 'light' ? '浅色模式' : '深色模式'}</Tag>

        {theme.createdAt && <Tag color='gray'>创建于 {new Date(theme.createdAt).toLocaleDateString()}</Tag>}

        {theme.updatedAt && theme.updatedAt !== theme.createdAt && <Tag color='gray'>更新于 {new Date(theme.updatedAt).toLocaleDateString()}</Tag>}
      </Space>

      <Divider />

      <Space direction='vertical' style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontWeight: 600 }}>主要颜色:</Text>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: '背景', color: theme.codeHighlight.background },
            { label: '文本', color: theme.codeHighlight.color },
            { label: '关键字', color: theme.codeHighlight.keyword },
            { label: '字符串', color: theme.codeHighlight.string },
            { label: '注释', color: theme.codeHighlight.comment },
            { label: '函数', color: theme.codeHighlight.function },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: isSmall ? 12 : 14,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: item.color,
                  borderRadius: 2,
                  border: '1px solid var(--color-border)',
                }}
              />
              <Text style={{ fontSize: isSmall ? 12 : 14 }}>{item.label}</Text>
            </div>
          ))}
        </div>
      </Space>
    </Card>
  );
};

/**
 * 主题预览组件
 *
 * 用于预览主题的视觉效果，支持多种显示模式：
 * 1. inline - 内联预览
 * 2. modal - 模态框预览
 * 3. sidebar - 侧边栏预览
 */
export const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, mode = 'inline', showInfo = true, showCode = true, codeLanguage = 'typescript', customCode, size = 'medium', style, className }) => {
  // 获取预览主题（可能来自 Hook 或 props）
  const { previewTheme, previewStyle, previewCode } = useThemePreview();
  const effectiveTheme = theme || previewTheme;

  // 确定要显示的代码
  const displayCode = useMemo(() => {
    if (customCode) return customCode;
    if (previewCode && !theme) return previewCode;
    return DEFAULT_CODE_SAMPLES[codeLanguage as keyof typeof DEFAULT_CODE_SAMPLES] || DEFAULT_CODE_SAMPLES.typescript;
  }, [customCode, previewCode, theme, codeLanguage]);

  // 生成样式
  const syntaxHighlighterStyle = useMemo(() => {
    if (previewStyle && !theme) return previewStyle;

    if (!effectiveTheme) return {};

    const codeTheme = effectiveTheme.codeHighlight;
    return {
      'code[class*="language-"]': {
        color: codeTheme.color,
        background: codeTheme.background,
        fontFamily: codeTheme.fontFamily || 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
        fontSize: codeTheme.fontSize || '14px',
        lineHeight: codeTheme.lineHeight || '1.45',
      },
      'pre[class*="language-"]': {
        color: codeTheme.color,
        background: codeTheme.background,
        fontFamily: codeTheme.fontFamily || 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
        fontSize: codeTheme.fontSize || '14px',
        lineHeight: codeTheme.lineHeight || '1.45',
      },
      '.token.comment': { color: codeTheme.comment },
      '.token.keyword': { color: codeTheme.keyword },
      '.token.string': { color: codeTheme.string },
      '.token.number': { color: codeTheme.number },
      '.token.function': { color: codeTheme.function },
      '.token.variable': { color: codeTheme.variable },
      '.token.operator': { color: codeTheme.operator },
      '.token.type': { color: codeTheme.type },
      '.token.constant': { color: codeTheme.constant },
      '.token.punctuation': { color: codeTheme.punctuation },
      '.token.class-name': { color: codeTheme.className || codeTheme.type },
      '.token.property': { color: codeTheme.property || codeTheme.variable },
      '.token.tag': { color: codeTheme.tag || codeTheme.keyword },
      '.token.attr-name': { color: codeTheme.attr || codeTheme.property },
      '.token.regex': { color: codeTheme.regex || codeTheme.string },
      '.token.namespace': { color: codeTheme.namespace || codeTheme.type },
    };
  }, [effectiveTheme, previewStyle, theme]);

  if (!effectiveTheme) {
    return (
      <div style={style} className={className}>
        <Card>
          <div
            style={{
              textAlign: 'center',
              padding: 40,
              color: 'var(--color-text-3)',
            }}
          >
            <Code style={{ fontSize: 48 }} />
            <div style={{ marginTop: 16 }}>选择一个主题来预览效果</div>
          </div>
        </Card>
      </div>
    );
  }

  const containerStyle = {
    ...style,
    ...(mode === 'modal' && {
      maxHeight: '80vh',
      overflowY: 'auto' as const,
    }),
    ...(mode === 'sidebar' && {
      height: '100%',
      overflowY: 'auto' as const,
    }),
  };

  return (
    <div style={containerStyle} className={className}>
      {/* 主题信息 */}
      {showInfo && <ThemeInfoCard theme={effectiveTheme} size={size} />}

      {/* 代码预览 */}
      {showCode && (
        <Card
          size={size === 'small' ? 'small' : 'default'}
          title={
            <Space>
              <Code />
              <Text>代码预览</Text>
              <Tag color='blue' size='small'>
                {codeLanguage}
              </Tag>
            </Space>
          }
        >
          <div
            style={{
              borderRadius: 6,
              overflow: 'hidden',
              border: `1px solid ${effectiveTheme.codeHighlight.borderColor || 'var(--color-border)'}`,
            }}
          >
            <SyntaxHighlighter
              language={codeLanguage}
              style={syntaxHighlighterStyle}
              showLineNumbers={true}
              wrapLines={true}
              customStyle={{
                margin: 0,
                fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
                lineHeight: '1.5',
              }}
            >
              {displayCode}
            </SyntaxHighlighter>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ThemePreview;

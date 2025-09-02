import React from 'react';
import { Form, Grid, Input, Typography } from '@arco-design/web-react';
import { useTheme } from '../provider';
import { themeManager } from '../manager';

const Row = Grid.Row;
const Col = Grid.Col;
const Title = Typography.Title;

// 定义可自定义的 appStyles 键值和友好标签
const APP_STYLE_KEYS = ['o-logo'] as const;

const APP_STYLE_LABELS: Record<string, string> = {
  'o-logo': 'Logo样式',
};

// 定义每个 appStyle 的可配置属性
const APP_STYLE_PROPERTIES: Record<string, Array<{ key: keyof import('../types').I18nKeyStyle; label: string; placeholder: string }>> = {
  'o-logo': [
    { key: 'color', label: '颜色', placeholder: '#4E5969 或 currentColor' },
    { key: 'backgroundColor', label: '背景颜色', placeholder: 'transparent 或 #ffffff' },
  ],
};

const AppStylesCustomizer: React.FC = () => {
  const { themeId, mode } = useTheme();
  const { pack } = themeManager.getCurrent();
  const currentTokens = mode === 'dark' ? pack.dark : pack.light;
  const appStyles = currentTokens.appStyles || {};

  const onChange = (styleKey: string, property: string, value: string) => {
    const updated = { ...pack } as typeof pack;
    const targetTokens = mode === 'dark' ? updated.dark : updated.light;

    // 初始化 appStyles 如果不存在
    if (!targetTokens.appStyles) {
      targetTokens.appStyles = {};
    }

    // 初始化特定样式键如果不存在
    if (!targetTokens.appStyles[styleKey]) {
      targetTokens.appStyles[styleKey] = {};
    }

    // 更新属性值
    (targetTokens.appStyles[styleKey] as Record<string, unknown>)[property] = value;

    themeManager.upsertTheme(updated);
    themeManager.applyToDOM(document.body);
  };

  return (
    <div>
      <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--color-text-3)' }}>
        当前主题：{themeId} / {mode === 'dark' ? '暗黑模式' : '明亮模式'}
      </div>

      <Form layout='vertical' style={{ width: '100%' }}>
        {APP_STYLE_KEYS.map((styleKey) => (
          <div key={styleKey} style={{ marginBottom: '24px' }}>
            <Title
              heading={6}
              style={{
                marginBottom: '12px',
                color: 'var(--color-text-2)',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              {APP_STYLE_LABELS[styleKey]}
            </Title>
            <Row gutter={12} style={{ width: '100%' }}>
              {APP_STYLE_PROPERTIES[styleKey]?.map((prop) => (
                <Col key={prop.key} xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item label={prop.label}>
                    <Input value={((appStyles[styleKey] as Record<string, unknown>)?.[prop.key] as string) || ''} onChange={(value) => onChange(styleKey, prop.key, value)} placeholder={prop.placeholder} allowClear />
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </div>
        ))}
      </Form>
    </div>
  );
};

export default AppStylesCustomizer;

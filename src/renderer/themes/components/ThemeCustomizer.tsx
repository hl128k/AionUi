import React from 'react';
import { Card, Form, Grid, Input } from '@arco-design/web-react';
import { useTheme } from '../provider';
import { THEME_VARIABLE_KEYS, FRIENDLY_LABELS } from '../variables';
import { themeManager } from '../manager';

const Row = Grid.Row;
const Col = Grid.Col;

const ThemeCustomizer: React.FC = () => {
  const { themeId, mode } = useTheme();
  const { pack } = themeManager.getCurrent();
  const vars = mode === 'dark' ? pack.dark.variables : pack.light.variables;

  const [localVars, setLocalVars] = React.useState<Record<string, string>>(() => ({ ...vars }));

  React.useEffect(() => {
    // 当切换主题/模式时，刷新面板值
    const fresh = mode === 'dark' ? pack.dark.variables : pack.light.variables;
    setLocalVars({ ...fresh });
  }, [themeId, mode]);

  const onChange = (key: string, value: string) => {
    const next = { ...localVars, [key]: value };
    setLocalVars(next);
    const updated = { ...pack } as any;
    if (mode === 'dark') updated.dark = { ...updated.dark, variables: next };
    else updated.light = { ...updated.light, variables: next };
    themeManager.upsertTheme(updated);
    themeManager.applyToDOM(document.body);
  };

  return (
    <Card title={`主题变量（${themeId}/${mode}）`} bordered={false} style={{ width: '100%' }}>
      <Form layout='vertical' style={{ width: '100%' }}>
        <Row gutter={12} style={{ width: '100%' }}>
          {THEME_VARIABLE_KEYS.map((k) => (
            <Col key={k} xs={24} sm={12} md={12} lg={8} xl={8}>
              <Form.Item label={`${FRIENDLY_LABELS[k] || k} (${k})`}>
                <Input value={localVars[k] || ''} onChange={(v) => onChange(k, v)} placeholder='颜色值或 CSS 表达式' allowClear />
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </Card>
  );
};

export default ThemeCustomizer;

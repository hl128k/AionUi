/**
 * 简单的主题切换组件
 */

import { Button, Card, Radio, Space, Typography } from '@arco-design/web-react';
import { IconMoon, IconSun } from '@arco-design/web-react/icon';
import React from 'react';
import { useTheme } from './index';

const { Title, Text } = Typography;

export const SimpleThemeToggle: React.FC = () => {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <Card>
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        <div>
          <Title heading={4}>主题模式</Title>
          <Text type='secondary'>选择应用的主题模式</Text>
        </div>

        <Radio.Group value={theme} onChange={setTheme}>
          <Radio value='light'>
            <Space>
              <IconSun />
              <span>亮色模式</span>
            </Space>
          </Radio>
          <Radio value='dark'>
            <Space>
              <IconMoon />
              <span>暗色模式</span>
            </Space>
          </Radio>
        </Radio.Group>

        <Button type='primary' onClick={toggleTheme}>
          快速切换主题
        </Button>

        <div style={{ marginTop: 16, padding: 16, background: 'var(--color-bg-2)', borderRadius: 4 }}>
          <Text>当前主题：{theme === 'light' ? '亮色' : '暗色'}</Text>
        </div>
      </Space>
    </Card>
  );
};

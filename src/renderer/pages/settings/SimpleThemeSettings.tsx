import React from 'react';
import { Card, Space, Typography, Button, Switch } from '@arco-design/web-react';
import { Moon, SunOne } from '@icon-park/react';
import { useSimpleTheme } from '@/renderer/themes/simple-provider';
import SettingContainer from './components/SettingContainer';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

/**
 * 简化版主题设置页面
 */
const SimpleThemeSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentTheme, themes, setTheme, toggleTheme, isLight, isDark } = useSimpleTheme();

  return (
    <SettingContainer title={t('settings.theme')}>
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        {/* 当前主题状态 */}
        <Card>
          <Space direction='vertical' size='medium' style={{ width: '100%' }}>
            <Typography.Title heading={4}>
              <Space>
                {isLight ? <SunOne /> : <Moon />}
                当前主题: {currentTheme.name}
              </Space>
            </Typography.Title>

            <Text type='secondary'>模式: {isLight ? '明亮模式' : '黑暗模式'}</Text>
          </Space>
        </Card>

        {/* 快速切换 */}
        <Card title='快速切换'>
          <Space size='large'>
            <Button type={isLight ? 'primary' : 'outline'} icon={<SunOne />} onClick={() => setTheme('light')} size='large'>
              明亮主题
            </Button>

            <Button type={isDark ? 'primary' : 'outline'} icon={<Moon />} onClick={() => setTheme('dark')} size='large'>
              黑暗主题
            </Button>

            <Button onClick={toggleTheme} size='large' type='dashed'>
              切换主题
            </Button>
          </Space>
        </Card>

        {/* 主题列表 */}
        <Card title='可用主题'>
          <Space direction='vertical' size='medium' style={{ width: '100%' }}>
            {themes.map((theme) => (
              <div
                key={theme.id}
                style={{
                  padding: '16px',
                  border: `2px solid ${theme.id === currentTheme.id ? 'var(--color-primary-6)' : 'var(--color-border)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: theme.id === currentTheme.id ? 'var(--color-primary-light-1)' : 'transparent',
                }}
                onClick={() => setTheme(theme.id)}
              >
                <Space>
                  {theme.mode === 'light' ? <SunOne size={24} style={{ color: theme.id === currentTheme.id ? 'var(--color-primary-6)' : undefined }} /> : <Moon size={24} style={{ color: theme.id === currentTheme.id ? 'var(--color-primary-6)' : undefined }} />}

                  <div>
                    <Text bold={theme.id === currentTheme.id}>{theme.name}</Text>
                    <br />
                    <Text type='secondary' style={{ fontSize: '12px' }}>
                      {theme.mode === 'light' ? '适合白天使用' : '适合夜间使用'}
                    </Text>
                  </div>

                  {theme.id === currentTheme.id && <Text style={{ color: 'var(--color-primary-6)', marginLeft: 'auto' }}>✓ 当前</Text>}
                </Space>
              </div>
            ))}
          </Space>
        </Card>

        {/* 使用说明 */}
        <Card title='使用说明'>
          <Space direction='vertical' size='small'>
            <Text>• 点击上方按钮或主题卡片可以快速切换主题</Text>
            <Text>• 主题会自动保存，下次启动时会恢复上次选择的主题</Text>
            <Text>• 自动模式会根据系统设置切换明暗主题</Text>
          </Space>
        </Card>
      </Space>
    </SettingContainer>
  );
};

export default SimpleThemeSettingsPage;

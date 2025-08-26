import React from 'react';
import { Button, Space, Card, Typography, Tag } from '@arco-design/web-react';
import { useLessVariableTheme } from '../providers/less-variable-provider';
import type { ThemeMode, ArcoThemeTokens } from '../less/types';

const { Title, Text } = Typography;

/**
 * Less 变量主题测试组件
 * 用于验证主题系统功能
 */
export const LessThemeTest: React.FC = () => {
  const { currentTheme, isCompiling, compilationError, setTheme, switchMode, compileCustomTheme, getAvailableThemes } = useLessVariableTheme();

  const availableThemes = getAvailableThemes();

  const handleSwitchMode = async (mode: ThemeMode) => {
    try {
      await switchMode(mode);
    } catch (error) {
      console.error('Failed to switch mode:', error);
    }
  };

  const handleTestCustomTheme = async () => {
    const customTokens: ArcoThemeTokens = {
      colorPrimary: '#722ed1', // 紫色主题
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
    };

    try {
      await compileCustomTheme(customTokens);
    } catch (error) {
      console.error('Failed to apply custom theme:', error);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Less 变量主题系统测试</Title>

      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        {/* 当前主题信息 */}
        <Card title='当前主题信息'>
          <Space direction='vertical'>
            <div>
              <Text strong>主题名称: </Text>
              <Text>{currentTheme.name}</Text>
            </div>
            <div>
              <Text strong>主题ID: </Text>
              <Tag>{currentTheme.id}</Tag>
            </div>
            <div>
              <Text strong>模式: </Text>
              <Tag color={currentTheme.mode === 'dark' ? 'blue' : 'orange'}>{currentTheme.mode}</Tag>
            </div>
            <div>
              <Text strong>是否内置: </Text>
              <Tag color={currentTheme.builtin ? 'green' : 'purple'}>{currentTheme.builtin ? '是' : '否'}</Tag>
            </div>
            <div>
              <Text strong>编译状态: </Text>
              {isCompiling ? <Tag color='blue'>编译中...</Tag> : compilationError ? <Tag color='red'>编译失败</Tag> : <Tag color='green'>编译成功</Tag>}
            </div>
          </Space>
        </Card>

        {/* 编译错误信息 */}
        {compilationError && (
          <Card title='编译错误' status='error'>
            <Text code>{compilationError}</Text>
          </Card>
        )}

        {/* 模式切换 */}
        <Card title='模式切换'>
          <Space>
            <Button type={currentTheme.mode === 'light' ? 'primary' : 'default'} onClick={() => handleSwitchMode('light')} disabled={isCompiling}>
              亮色模式
            </Button>
            <Button type={currentTheme.mode === 'dark' ? 'primary' : 'default'} onClick={() => handleSwitchMode('dark')} disabled={isCompiling}>
              暗色模式
            </Button>
          </Space>
        </Card>

        {/* 主题切换 */}
        <Card title='主题切换'>
          <Space wrap>
            {availableThemes.map((theme) => (
              <Button key={theme.id} type={currentTheme.id === theme.id ? 'primary' : 'default'} onClick={() => setTheme(theme)} disabled={isCompiling}>
                {theme.name}
              </Button>
            ))}
          </Space>
        </Card>

        {/* 自定义主题测试 */}
        <Card title='自定义主题测试'>
          <Space direction='vertical'>
            <Text>点击按钮应用紫色主题（测试 Less 变量编译功能）</Text>
            <Button type='outline' onClick={handleTestCustomTheme} disabled={isCompiling}>
              应用紫色自定义主题
            </Button>
          </Space>
        </Card>

        {/* 组件样式预览 */}
        <Card title='组件样式预览'>
          <Space direction='vertical' size='medium' style={{ width: '100%' }}>
            <div>
              <Text strong>按钮组件:</Text>
              <div style={{ marginTop: '8px' }}>
                <Space>
                  <Button type='primary'>主要按钮</Button>
                  <Button>默认按钮</Button>
                  <Button type='outline'>边框按钮</Button>
                  <Button type='dashed'>虚线按钮</Button>
                  <Button type='text'>文本按钮</Button>
                </Space>
              </div>
            </div>

            <div>
              <Text strong>状态按钮:</Text>
              <div style={{ marginTop: '8px' }}>
                <Space>
                  <Button status='success'>成功</Button>
                  <Button status='warning'>警告</Button>
                  <Button status='danger'>危险</Button>
                </Space>
              </div>
            </div>

            <div>
              <Text strong>标签组件:</Text>
              <div style={{ marginTop: '8px' }}>
                <Space>
                  <Tag>默认标签</Tag>
                  <Tag color='blue'>蓝色标签</Tag>
                  <Tag color='green'>绿色标签</Tag>
                  <Tag color='orange'>橙色标签</Tag>
                  <Tag color='red'>红色标签</Tag>
                </Space>
              </div>
            </div>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

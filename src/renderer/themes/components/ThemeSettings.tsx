/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Badge, Button, Card, Divider, Empty, List, Message, Modal, Popconfirm, Select, Space, Switch, Tabs, Typography, Upload } from '@arco-design/web-react';
import { Download, Preview, Moon, Refresh, SunOne, Setting, Delete, Plus } from '@icon-park/react';
import React, { useCallback, useState } from 'react';
import { useThemeManager, useThemeMode, useThemeSwitcher } from '../hooks';
import type { AppTheme } from '../types';
import { ThemePreview } from './ThemePreview';
import { ThemeSelector } from './ThemeSelector';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;

/**
 * 主题设置页面组件属性
 */
export interface ThemeSettingsProps {
  /** 默认激活的标签页 */
  defaultActiveTab?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
  /** 设置变更回调 */
  onSettingsChange?: (settings: any) => void;
}

/**
 * 主题管理面板组件
 */
const ThemeManagementPanel: React.FC = () => {
  const { groupedThemes, handleImportTheme, handleExportTheme, handleDeleteTheme, isImporting, isExporting, refreshThemes } = useThemeManager();

  const [previewTheme, setPreviewTheme] = useState<AppTheme | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // 处理文件上传
  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        const theme = await handleImportTheme(file);
        if (theme) {
          Message.success(`主题 "${theme.name}" 导入成功！`);
        } else {
          Message.error('主题导入失败，请检查文件格式');
        }
      } catch (error) {
        Message.error('导入失败：' + (error as Error).message);
      }

      return false; // 阻止默认上传行为
    },
    [handleImportTheme]
  );

  // 处理主题导出
  const handleExport = useCallback(
    async (theme: AppTheme) => {
      const success = await handleExportTheme(theme.id);
      if (success) {
        Message.success(`主题 "${theme.name}" 导出成功！`);
      } else {
        Message.error('主题导出失败');
      }
    },
    [handleExportTheme]
  );

  // 处理主题删除
  const handleDelete = useCallback(
    async (theme: AppTheme) => {
      const success = await handleDeleteTheme(theme.id);
      if (success) {
        Message.success(`主题 "${theme.name}" 删除成功！`);
      } else {
        Message.error('主题删除失败');
      }
    },
    [handleDeleteTheme]
  );

  // 预览主题
  const handlePreview = useCallback((theme: AppTheme) => {
    setPreviewTheme(theme);
    setShowPreviewModal(true);
  }, []);

  return (
    <Space direction='vertical' size='large' style={{ width: '100%' }}>
      {/* 工具栏 */}
      <Card title='主题管理'>
        <Space wrap>
          <Upload accept='.json' beforeUpload={handleFileUpload} showUploadList={false}>
            <Button type='primary' icon={<Upload />} loading={isImporting}>
              导入主题
            </Button>
          </Upload>

          <Button icon={<Refresh />} onClick={refreshThemes}>
            刷新列表
          </Button>

          <Button icon={<Plus />} type='outline'>
            创建主题
          </Button>
        </Space>
      </Card>

      {/* 内置主题列表 */}
      <Card title='内置主题'>
        <List
          dataSource={groupedThemes.builtIn}
          render={(theme: AppTheme) => (
            <List.Item
              key={theme.id}
              style={{
                padding: '12px 16px',
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                marginBottom: 8,
              }}
              actions={[
                <Button key='preview' type='text' icon={<Preview />} onClick={() => handlePreview(theme)}>
                  预览
                </Button>,
                <Button key='export' type='text' icon={<Download />} loading={isExporting} onClick={() => handleExport(theme)}>
                  导出
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 6,
                      background: theme.codeHighlight.background,
                      border: '2px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {theme.mode === 'light' ? <SunOne style={{ color: theme.codeHighlight.color }} /> : <Moon style={{ color: theme.codeHighlight.color }} />}
                  </div>
                }
                title={
                  <Space>
                    <Text>{theme.name}</Text>
                    <Badge count='内置' />
                  </Space>
                }
                description={
                  <Space direction='vertical' size='small'>
                    <Text type='secondary'>{theme.description}</Text>
                    <Space>
                      <Text style={{ fontSize: 12, color: 'var(--color-text-3)' }}>模式: {theme.mode === 'light' ? '浅色' : '深色'}</Text>
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* 自定义主题列表 */}
      <Card title='自定义主题'>
        {groupedThemes.custom.length === 0 ? (
          <Empty description='暂无自定义主题' style={{ padding: '40px 0' }} />
        ) : (
          <List
            dataSource={groupedThemes.custom}
            render={(theme: AppTheme) => (
              <List.Item
                key={theme.id}
                style={{
                  padding: '12px 16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 6,
                  marginBottom: 8,
                }}
                actions={[
                  <Button key='preview' type='text' icon={<Preview />} onClick={() => handlePreview(theme)}>
                    预览
                  </Button>,
                  <Button key='export' type='text' icon={<Download />} loading={isExporting} onClick={() => handleExport(theme)}>
                    导出
                  </Button>,
                  <Popconfirm key='delete' title='确定要删除这个主题吗？' content='删除后无法恢复' onOk={() => handleDelete(theme)}>
                    <Button type='text' status='danger' icon={<Delete />}>
                      删除
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 6,
                        background: theme.codeHighlight.background,
                        border: '2px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {theme.mode === 'light' ? <SunOne style={{ color: theme.codeHighlight.color }} /> : <Moon style={{ color: theme.codeHighlight.color }} />}
                    </div>
                  }
                  title={<Text>{theme.name}</Text>}
                  description={
                    <Space direction='vertical' size='small'>
                      <Text type='secondary'>{theme.description}</Text>
                      <Space>
                        <Text style={{ fontSize: 12, color: 'var(--color-text-3)' }}>模式: {theme.mode === 'light' ? '浅色' : '深色'}</Text>
                        {theme.updatedAt && <Text style={{ fontSize: 12, color: 'var(--color-text-3)' }}>更新: {new Date(theme.updatedAt).toLocaleDateString()}</Text>}
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* 预览模态框 */}
      <Modal title={`主题预览 - ${previewTheme?.name}`} visible={showPreviewModal} onCancel={() => setShowPreviewModal(false)} footer={null} style={{ top: 20, width: 800 }}>
        {previewTheme && <ThemePreview theme={previewTheme} mode='modal' showInfo={true} showCode={true} />}
      </Modal>
    </Space>
  );
};

/**
 * 偏好设置面板组件
 */
const PreferencePanel: React.FC<{ onSettingsChange?: (settings: any) => void }> = ({ onSettingsChange }) => {
  const { themeMode, systemTheme, lightThemes, darkThemes, setLightMode, setDarkMode, setAutoMode } = useThemeMode();

  const { currentTheme } = useThemeSwitcher();
  const [autoSwitchEnabled, setAutoSwitchEnabled] = useState(themeMode === 'auto');
  const [preferredLightTheme, setPreferredLightTheme] = useState(currentTheme?.id || '');
  const [preferredDarkTheme, setPreferredDarkTheme] = useState(currentTheme?.id || '');

  // 处理自动切换设置
  const handleAutoSwitchChange = useCallback(
    (enabled: boolean) => {
      setAutoSwitchEnabled(enabled);
      if (enabled) {
        setAutoMode();
      } else {
        // 根据当前系统主题设置对应模式
        if (systemTheme === 'dark') {
          setDarkMode();
        } else {
          setLightMode();
        }
      }

      onSettingsChange?.({ autoSwitchEnabled: enabled });
    },
    [setAutoMode, setDarkMode, setLightMode, systemTheme, onSettingsChange]
  );

  // 处理偏好主题设置
  const handlePreferredThemeChange = useCallback(
    (mode: 'light' | 'dark', themeId: string) => {
      if (mode === 'light') {
        setPreferredLightTheme(themeId);
      } else {
        setPreferredDarkTheme(themeId);
      }

      onSettingsChange?.({
        [`preferred${mode === 'light' ? 'Light' : 'Dark'}Theme`]: themeId,
      });
    },
    [onSettingsChange]
  );

  return (
    <Space direction='vertical' size='large' style={{ width: '100%' }}>
      <Card title='主题模式设置'>
        <Space direction='vertical' size='medium' style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text>自动跟随系统主题</Text>
              <div style={{ marginTop: 4 }}>
                <Text type='secondary' style={{ fontSize: 12 }}>
                  当前系统主题: {systemTheme === 'dark' ? '深色' : '浅色'}
                </Text>
              </div>
            </div>
            <Switch checked={autoSwitchEnabled} onChange={handleAutoSwitchChange} />
          </div>

          <Divider />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>当前主题模式</Text>
            <Select
              value={themeMode}
              style={{ width: 120 }}
              onChange={(value) => {
                if (value === 'light') setLightMode();
                else if (value === 'dark') setDarkMode();
                else setAutoMode();
              }}
            >
              <Option value='auto'>
                <Space>
                  <Setting />
                  自动
                </Space>
              </Option>
              <Option value='light'>
                <Space>
                  <SunOne />
                  浅色
                </Space>
              </Option>
              <Option value='dark'>
                <Space>
                  <Moon />
                  深色
                </Space>
              </Option>
            </Select>
          </div>
        </Space>
      </Card>

      <Card title='偏好主题设置'>
        <Space direction='vertical' size='medium' style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text>偏好的浅色主题</Text>
              <div style={{ marginTop: 4 }}>
                <Text type='secondary' style={{ fontSize: 12 }}>
                  在浅色模式下使用的默认主题
                </Text>
              </div>
            </div>
            <Select value={preferredLightTheme} style={{ width: 200 }} placeholder='选择浅色主题' onChange={(value) => handlePreferredThemeChange('light', value)}>
              {lightThemes.map((theme) => (
                <Option key={theme.id} value={theme.id}>
                  <Space>
                    <SunOne />
                    {theme.name}
                  </Space>
                </Option>
              ))}
            </Select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text>偏好的深色主题</Text>
              <div style={{ marginTop: 4 }}>
                <Text type='secondary' style={{ fontSize: 12 }}>
                  在深色模式下使用的默认主题
                </Text>
              </div>
            </div>
            <Select value={preferredDarkTheme} style={{ width: 200 }} placeholder='选择深色主题' onChange={(value) => handlePreferredThemeChange('dark', value)}>
              {darkThemes.map((theme) => (
                <Option key={theme.id} value={theme.id}>
                  <Space>
                    <Moon />
                    {theme.name}
                  </Space>
                </Option>
              ))}
            </Select>
          </div>
        </Space>
      </Card>
    </Space>
  );
};

/**
 * 主题设置页面组件
 *
 * 提供完整的主题管理界面，包括：
 * 1. 主题选择和切换
 * 2. 主题管理（导入/导出/删除）
 * 3. 偏好设置
 * 4. 主题预览
 */
export const ThemeSettings: React.FC<ThemeSettingsProps> = ({ defaultActiveTab = 'selector', style, className, onSettingsChange }) => {
  return (
    <div style={style} className={className}>
      <Card>
        <Title style={{ marginBottom: 24, fontSize: 24, fontWeight: 600 }}>
          <Space>
            <Setting />
            主题设置
          </Space>
        </Title>

        <Tabs defaultActiveTab={defaultActiveTab}>
          <TabPane key='selector' title='主题选择'>
            <ThemeSelector mode='grid' showSearch={true} showModeToggle={true} showSettings={false} cardSize='medium' columns={3} />
          </TabPane>

          <TabPane key='management' title='主题管理'>
            <ThemeManagementPanel />
          </TabPane>

          <TabPane key='preferences' title='偏好设置'>
            <PreferencePanel onSettingsChange={onSettingsChange} />
          </TabPane>

          <TabPane key='preview' title='实时预览'>
            <ThemePreview mode='inline' showInfo={true} showCode={true} size='large' />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ThemeSettings;

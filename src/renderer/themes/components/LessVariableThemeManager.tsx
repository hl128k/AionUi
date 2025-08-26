import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Select, ColorPicker, InputNumber, Form, Message, Modal, Upload, Tag, Divider, Row, Col } from '@arco-design/web-react';
import { IconPlus, IconDelete, IconExport, IconImport, IconPalette } from '@icon-park/react';
import { useLessVariableTheme } from '../providers/less-variable-provider';
import { themeManager } from '../managers/theme-manager';
import type { ArcoThemeTokens, ThemeConfig } from '../less/types';

const { Title, Text } = Typography;
const FormItem = Form.Item;
const Option = Select.Option;

/**
 * Less 变量主题管理组件
 * 提供可视化的主题创建、编辑、导入导出功能
 */
export const LessVariableThemeManager: React.FC = () => {
  const { currentTheme, isCompiling, compilationError, setTheme, switchMode, getAvailableThemes } = useLessVariableTheme();

  const [form] = Form.useForm<ArcoThemeTokens>();
  const [availableThemes, setAvailableThemes] = useState<ThemeConfig[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeConfig | null>(null);
  const [customThemeName, setCustomThemeName] = useState('');

  // 默认的主题令牌值
  const defaultTokens: ArcoThemeTokens = {
    colorPrimary: '#165dff',
    colorSuccess: '#00b42a',
    colorWarning: '#ff7d00',
    colorError: '#f53f3f',
    colorInfo: '#165dff',
    fontSize: 14,
    borderRadius: 4,
    padding: 16,
    margin: 16,
  };

  // 更新可用主题列表
  const updateThemeList = () => {
    const themes = getAvailableThemes();
    setAvailableThemes(themes);
  };

  useEffect(() => {
    updateThemeList();
  }, [getAvailableThemes]);

  // 创建自定义主题
  const handleCreateTheme = async (values: ArcoThemeTokens) => {
    if (!customThemeName.trim()) {
      Message.warning('请输入主题名称');
      return;
    }

    try {
      const newTheme = await themeManager.createCustomTheme(customThemeName, values, currentTheme.mode);

      Message.success(`主题 "${newTheme.name}" 创建成功`);
      setIsCreateModalVisible(false);
      setCustomThemeName('');
      form.resetFields();
      updateThemeList();
    } catch (error) {
      Message.error(`创建主题失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // 编辑主题
  const handleEditTheme = (theme: ThemeConfig) => {
    if (theme.builtin) {
      Message.warning('内置主题不能编辑');
      return;
    }
    setEditingTheme(theme);
    setCustomThemeName(theme.name);
    form.setFieldsValue(theme.tokens);
    setIsEditModalVisible(true);
  };

  // 更新主题
  const handleUpdateTheme = async (values: ArcoThemeTokens) => {
    if (!editingTheme) return;

    try {
      const updatedTheme: ThemeConfig = {
        ...editingTheme,
        name: customThemeName,
        tokens: values,
        updatedAt: new Date().toISOString(),
      };

      // 删除旧主题并创建新主题
      await themeManager.deleteCustomTheme(editingTheme.id);
      const newTheme = await themeManager.createCustomTheme(customThemeName, values, editingTheme.mode);

      // 如果当前使用的是被编辑的主题，切换到新主题
      if (currentTheme.id === editingTheme.id) {
        await setTheme(newTheme);
      }

      Message.success('主题更新成功');
      setIsEditModalVisible(false);
      setEditingTheme(null);
      setCustomThemeName('');
      form.resetFields();
      updateThemeList();
    } catch (error) {
      Message.error(`更新主题失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // 删除主题
  const handleDeleteTheme = async (theme: ThemeConfig) => {
    if (theme.builtin) {
      Message.warning('不能删除内置主题');
      return;
    }

    Modal.confirm({
      title: '删除主题',
      content: `确定要删除主题 "${theme.name}" 吗？此操作不可撤销。`,
      okText: '确定删除',
      cancelText: '取消',
      onOk: async () => {
        try {
          const success = await themeManager.deleteCustomTheme(theme.id);
          if (success) {
            Message.success('主题删除成功');
            updateThemeList();
          } else {
            Message.error('删除主题失败');
          }
        } catch (error) {
          Message.error(`删除主题失败: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
    });
  };

  // 导出主题
  const handleExportTheme = async (theme: ThemeConfig) => {
    try {
      const exportData = await themeManager.exportTheme(theme.id);

      // 创建下载链接
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${theme.name}-theme.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      Message.success('主题导出成功');
    } catch (error) {
      Message.error(`导出主题失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // 导入主题
  const handleImportTheme = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedTheme = await themeManager.importTheme(content);
        Message.success(`主题 "${importedTheme.name}" 导入成功`);
        updateThemeList();
      } catch (error) {
        Message.error(`导入主题失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    reader.readAsText(file);
    return false; // 阻止默认上传行为
  };

  // 获取主题统计信息
  const themeStats = themeManager.getThemeStats();

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={3}>Less 变量主题管理</Title>
        <Text type='secondary'>使用 Arco Design Less 变量系统创建和管理自定义主题</Text>
      </div>

      {/* 编译状态提示 */}
      {isCompiling && (
        <Card style={{ marginBottom: '16px' }}>
          <Text>正在编译主题...</Text>
        </Card>
      )}

      {compilationError && (
        <Card status='error' style={{ marginBottom: '16px' }}>
          <Text strong>编译错误: </Text>
          <Text code>{compilationError}</Text>
        </Card>
      )}

      {/* 主题统计 */}
      <Card title='主题统计' style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={6}>
            <Text strong>总主题数: </Text>
            <Tag color='blue'>{themeStats.total}</Tag>
          </Col>
          <Col span={6}>
            <Text strong>内置主题: </Text>
            <Tag color='green'>{themeStats.builtin}</Tag>
          </Col>
          <Col span={6}>
            <Text strong>自定义主题: </Text>
            <Tag color='purple'>{themeStats.custom}</Tag>
          </Col>
          <Col span={6}>
            <Text strong>缓存大小: </Text>
            <Tag color='orange'>{themeStats.cacheSize}</Tag>
          </Col>
        </Row>
      </Card>

      {/* 操作按钮 */}
      <Card style={{ marginBottom: '24px' }}>
        <Space>
          <Button
            type='primary'
            icon={<IconPlus />}
            onClick={() => {
              form.setFieldsValue(defaultTokens);
              setIsCreateModalVisible(true);
            }}
          >
            创建自定义主题
          </Button>

          <Upload accept='.json' beforeUpload={handleImportTheme} showUploadList={false}>
            <Button icon={<IconImport />}>导入主题</Button>
          </Upload>

          <Button onClick={() => themeManager.clearCache()}>清除缓存</Button>
        </Space>
      </Card>

      {/* 主题列表 */}
      <Card title='主题列表'>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {availableThemes.map((theme) => (
            <Card key={theme.id} size='small' style={{ position: 'relative' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>{theme.name}</Text>
                  {theme.id === currentTheme.id && (
                    <Tag color='blue' size='small'>
                      当前使用
                    </Tag>
                  )}
                </div>
                <div style={{ marginTop: '4px' }}>
                  <Tag size='small' color={theme.mode === 'dark' ? 'blue' : 'orange'}>
                    {theme.mode}
                  </Tag>
                  {theme.builtin && (
                    <Tag size='small' color='green'>
                      内置
                    </Tag>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                {theme.tokens.colorPrimary && (
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: theme.tokens.colorPrimary,
                        borderRadius: '2px',
                        marginRight: '8px',
                        border: '1px solid var(--color-border)',
                      }}
                    />
                    <Text style={{ fontSize: '12px' }}>主色: {theme.tokens.colorPrimary}</Text>
                  </div>
                )}
                {theme.description && <Text style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{theme.description}</Text>}
              </div>

              <Space size='small'>
                <Button size='small' type={theme.id === currentTheme.id ? 'primary' : 'default'} onClick={() => setTheme(theme)} disabled={isCompiling}>
                  应用
                </Button>

                {!theme.builtin && (
                  <Button size='small' icon={<IconPalette />} onClick={() => handleEditTheme(theme)}>
                    编辑
                  </Button>
                )}

                <Button size='small' icon={<IconExport />} onClick={() => handleExportTheme(theme)}>
                  导出
                </Button>

                {!theme.builtin && (
                  <Button size='small' status='danger' icon={<IconDelete />} onClick={() => handleDeleteTheme(theme)}>
                    删除
                  </Button>
                )}
              </Space>
            </Card>
          ))}
        </div>
      </Card>

      {/* 创建主题模态框 */}
      <Modal
        title='创建自定义主题'
        visible={isCreateModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsCreateModalVisible(false);
          setCustomThemeName('');
          form.resetFields();
        }}
        style={{ width: '600px' }}
      >
        <Form form={form} onSubmit={handleCreateTheme} layout='vertical'>
          <FormItem label='主题名称' required>
            <input
              value={customThemeName}
              onChange={(e) => setCustomThemeName(e.target.value)}
              placeholder='请输入主题名称'
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
              }}
            />
          </FormItem>

          <Divider />

          <FormItem label='主色调' field='colorPrimary'>
            <ColorPicker />
          </FormItem>

          <Row gutter={16}>
            <Col span={12}>
              <FormItem label='成功色' field='colorSuccess'>
                <ColorPicker />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='警告色' field='colorWarning'>
                <ColorPicker />
              </FormItem>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <FormItem label='错误色' field='colorError'>
                <ColorPicker />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='信息色' field='colorInfo'>
                <ColorPicker />
              </FormItem>
            </Col>
          </Row>

          <Divider />

          <Row gutter={16}>
            <Col span={8}>
              <FormItem label='字体大小' field='fontSize'>
                <InputNumber min={12} max={20} />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label='圆角大小' field='borderRadius'>
                <InputNumber min={0} max={20} />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label='内边距' field='padding'>
                <InputNumber min={0} max={32} />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 编辑主题模态框 */}
      <Modal
        title='编辑自定义主题'
        visible={isEditModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingTheme(null);
          setCustomThemeName('');
          form.resetFields();
        }}
        style={{ width: '600px' }}
      >
        <Form form={form} onSubmit={handleUpdateTheme} layout='vertical'>
          <FormItem label='主题名称' required>
            <input
              value={customThemeName}
              onChange={(e) => setCustomThemeName(e.target.value)}
              placeholder='请输入主题名称'
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
              }}
            />
          </FormItem>

          <Divider />

          {/* 与创建模态框相同的表单内容 */}
          <FormItem label='主色调' field='colorPrimary'>
            <ColorPicker />
          </FormItem>

          <Row gutter={16}>
            <Col span={12}>
              <FormItem label='成功色' field='colorSuccess'>
                <ColorPicker />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='警告色' field='colorWarning'>
                <ColorPicker />
              </FormItem>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <FormItem label='错误色' field='colorError'>
                <ColorPicker />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label='信息色' field='colorInfo'>
                <ColorPicker />
              </FormItem>
            </Col>
          </Row>

          <Divider />

          <Row gutter={16}>
            <Col span={8}>
              <FormItem label='字体大小' field='fontSize'>
                <InputNumber min={12} max={20} />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label='圆角大小' field='borderRadius'>
                <InputNumber min={0} max={20} />
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label='内边距' field='padding'>
                <InputNumber min={0} max={32} />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

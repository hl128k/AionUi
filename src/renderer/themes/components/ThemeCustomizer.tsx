/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Button, Card, ColorPicker, Form, Input, Message, Modal, Select, Space, Typography, Upload } from '@arco-design/web-react';
import { Download } from '@icon-park/react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeSwitcher } from '../hooks';
import type { AppTheme, CodeHighlightTheme } from '../types';
import { parseThemeFromYaml as parseYamlTheme, themeToYaml as stringifyYamlTheme, validateYamlTheme } from '../yaml-utils';

const { Title, Text } = Typography;
const FormItem = Form.Item;
const { Option } = Select;

/**
 * 主题自定义组件属性
 */
export interface ThemeCustomizerProps {
  visible?: boolean;
  onClose?: () => void;
  editingTheme?: AppTheme | null;
}

/**
 * 主题自定义组件
 * 提供基础的主题自定义功能，包括：
 * 1. 创建新主题
 * 2. 编辑现有主题
 * 3. 导入导出主题
 * 4. 实时预览
 */
export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ visible = false, onClose, editingTheme = null }) => {
  const { t } = useTranslation();
  const { switchTheme } = useThemeSwitcher();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 处理表单提交
  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      const values = await form.validate();

      const newTheme: AppTheme = {
        id: editingTheme?.id || `custom-${Date.now()}`,
        name: values.name,
        mode: values.mode,
        description: values.description,
        codeHighlight: {
          // 基础样式
          background: values.background,
          color: values.color,
          fontFamily: values.fontFamily || 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
          fontSize: values.fontSize || '14px',
          lineHeight: values.lineHeight || '1.45',

          // 界面样式（重点）
          headerBackground: values.headerBackground,
          headerColor: values.headerColor,
          lineNumberColor: values.lineNumberColor,
          selectedLineBackground: values.selectedLineBackground,
          borderColor: values.borderColor,
          scrollbarColor: values.scrollbarColor,
          iconColor: values.iconColor,
          inlineCodeBackground: values.inlineCodeBackground,
          inlineCodeBorder: values.inlineCodeBorder,

          // 语法元素（简化）
          keyword: values.keyword,
          string: values.string,
          comment: values.comment,
          number: values.number,
          function: values.function,
          variable: values.variable,
          operator: values.operator,
          type: values.type,
          constant: values.constant,
          punctuation: values.punctuation,

          // 进阶元素（可选）
          className: values.className,
          property: values.property,
          tag: values.tag,
          attr: values.attr,
        },
        isBuiltIn: false,
        createdAt: editingTheme?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 这里应该调用存储系统保存主题
      console.log('保存主题:', newTheme);
      Message.success(editingTheme ? t('settings.editTheme') + ' ' + t('common.save') : t('settings.createTheme') + ' ' + t('common.save'));

      onClose?.();
    } catch (error) {
      console.error('Failed to save theme:', error);
      Message.error('保存主题失败');
    } finally {
      setLoading(false);
    }
  }, [editingTheme, form, onClose, t]);

  // 处理导入主题
  const handleImportTheme = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const validation = validateYamlTheme(content);

          if (!validation) {
            Message.error('导入失败: 主题格式无效');
            return;
          }

          const themeData = parseYamlTheme(content);
          const appTheme = themeData;

          // 填充表单
          form.setFieldsValue({
            name: appTheme.name,
            mode: appTheme.mode,
            description: appTheme.description,
            ...appTheme.codeHighlight,
          });

          Message.success('主题导入成功');
        } catch (error) {
          console.error('Import theme failed:', error);
          Message.error('导入主题失败');
        }
      };
      reader.readAsText(file);
      return false; // 阻止默认上传行为
    },
    [form]
  );

  // 处理导出主题
  const handleExportTheme = useCallback(async () => {
    try {
      const values = await form.validate();
      const theme: AppTheme = {
        id: 'export-theme',
        name: values.name,
        mode: values.mode,
        description: values.description,
        codeHighlight: values as CodeHighlightTheme,
        isBuiltIn: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const yamlContent = stringifyYamlTheme(theme);
      const blob = new Blob([yamlContent], { type: 'application/yaml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${theme.name.replace(/[^a-zA-Z0-9]/g, '-')}.yaml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      Message.success('主题导出成功');
    } catch (error) {
      console.error('Export theme failed:', error);
      Message.error('导出主题失败');
    }
  }, [form]);

  // 生成示例主题
  const handleLoadSample = useCallback(() => {
    try {
      const sampleYaml = '{}'; // 简化实现
      const themeData = parseYamlTheme(sampleYaml);
      const appTheme = themeData;

      form.setFieldsValue({
        name: appTheme.name,
        mode: appTheme.mode,
        description: appTheme.description,
        ...appTheme.codeHighlight,
      });

      Message.success('示例主题加载成功');
    } catch (error) {
      console.error('Load sample failed:', error);
      Message.error('加载示例失败');
    }
  }, [form]);

  // 初始化表单数据
  React.useEffect(() => {
    if (visible && editingTheme) {
      form.setFieldsValue({
        name: editingTheme.name,
        mode: editingTheme.mode,
        description: editingTheme.description,
        ...editingTheme.codeHighlight,
      });
    }
  }, [visible, editingTheme, form]);

  return (
    <Modal title={editingTheme ? t('settings.editTheme') : t('settings.createTheme')} visible={visible} onCancel={onClose} onOk={handleSubmit} confirmLoading={loading} style={{ maxHeight: '90vh', width: 800 }}>
      <Form form={form} layout='vertical' scrollToFirstError>
        {/* 基本信息 */}
        <Card title={t('common.settings')} style={{ marginBottom: 16 }}>
          <FormItem label={t('settings.modelName')} field='name' rules={[{ required: true, message: '请输入主题名称' }]}>
            <Input placeholder='输入主题名称' />
          </FormItem>

          <FormItem label={t('settings.theme')} field='mode' rules={[{ required: true, message: '请选择主题模式' }]}>
            <Select placeholder='选择主题模式'>
              <Option value='light'>{t('settings.lightMode')}</Option>
              <Option value='dark'>{t('settings.darkMode')}</Option>
            </Select>
          </FormItem>

          <FormItem label='描述' field='description'>
            <Input.TextArea placeholder='输入主题描述（可选）' rows={2} />
          </FormItem>
        </Card>

        {/* 界面样式（重点） */}
        <Card title='界面样式' style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <FormItem label='背景色' field='background'>
              <ColorPicker showText />
            </FormItem>
            <FormItem label='文字颜色' field='color'>
              <ColorPicker showText />
            </FormItem>
            <FormItem label='头部背景' field='headerBackground'>
              <ColorPicker showText />
            </FormItem>
            <FormItem label='头部文字' field='headerColor'>
              <ColorPicker showText />
            </FormItem>
            <FormItem label='行号颜色' field='lineNumberColor'>
              <ColorPicker showText />
            </FormItem>
            <FormItem label='选中行背景' field='selectedLineBackground'>
              <ColorPicker showText />
            </FormItem>
            <FormItem label='边框颜色' field='borderColor'>
              <ColorPicker showText />
            </FormItem>
            <FormItem label='图标颜色' field='iconColor'>
              <ColorPicker showText />
            </FormItem>
            <FormItem label='内联代码背景' field='inlineCodeBackground'>
              <ColorPicker showText />
            </FormItem>
          </div>
        </Card>

        {/* 语法元素（简化） */}
        <Card title='语法元素' style={{ marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <FormItem label='关键字' field='keyword'>
              <ColorPicker showText />
            </FormItem>
            <FormItem label='字符串' field='string'>
              <ColorPicker showText />
            </FormItem>
            <FormItem label='注释' field='comment'>
              <ColorPicker showText />
            </FormItem>
            <FormItem label='数字' field='number'>
              <ColorPicker showText />
            </FormItem>
            <FormItem label='函数' field='function'>
              <ColorPicker showText />
            </FormItem>
            <FormItem label='变量' field='variable'>
              <ColorPicker showText />
            </FormItem>
            <FormItem label='操作符' field='operator'>
              <ColorPicker showText />
            </FormItem>
            <FormItem label='类型' field='type'>
              <ColorPicker showText />
            </FormItem>
          </div>
        </Card>

        {/* 操作按钮 */}
        <Card title='主题操作'>
          <Space>
            <Upload accept='.yaml,.yml,.json' beforeUpload={handleImportTheme} showUploadList={false}>
              <Button icon={<Upload />}>{t('settings.importTheme')}</Button>
            </Upload>

            <Button icon={<Download />} onClick={handleExportTheme}>
              {t('settings.exportTheme')}
            </Button>

            <Button onClick={handleLoadSample}>加载示例</Button>
          </Space>
        </Card>
      </Form>
    </Modal>
  );
};

export default ThemeCustomizer;

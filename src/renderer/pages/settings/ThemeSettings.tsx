/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { I18nThemeSettings } from '@/renderer/themes/components/I18nThemeSettings';
import { ThemeCustomizer } from '@/renderer/themes/components/ThemeCustomizer';
import { ThemeSelector } from '@/renderer/themes/components/ThemeSelector';
import { Collapse, Form } from '@arco-design/web-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import SettingContainer from './components/SettingContainer';

const CollapseItem = Collapse.Item;

const ThemeSettings: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SettingContainer title={t('settings.themeSettings')}>
      <div className='px-20px'>
        <Collapse defaultActiveKey={['basic', 'advanced', 'i18n']} accordion={false} className='!border-none'>
          {/* 基础主题设置 */}
          <CollapseItem header={t('settings.basicTheme')} name='basic' className='mb-16px'>
            <Form
              labelCol={{
                flex: '120px',
              }}
              wrapperCol={{
                flex: '1',
              }}
              className='[&_.arco-row]:flex-nowrap'
            >
              <Form.Item label={t('settings.selectTheme')} field='themeSelector'>
                <ThemeSelector />
              </Form.Item>
            </Form>
          </CollapseItem>

          {/* 高级主题自定义 */}
          <CollapseItem header={t('settings.advancedTheme')} name='advanced' className='mb-16px'>
            <div className='p-16px bg-gray-50 rounded-lg'>
              <ThemeCustomizer />
            </div>
          </CollapseItem>

          {/* i18n 主题配置 */}
          <CollapseItem header={t('settings.i18nTheme')} name='i18n' className='mb-16px'>
            <div className='p-16px bg-blue-50 rounded-lg'>
              <I18nThemeSettings />
            </div>
          </CollapseItem>
        </Collapse>
      </div>
    </SettingContainer>
  );
};

export default ThemeSettings;

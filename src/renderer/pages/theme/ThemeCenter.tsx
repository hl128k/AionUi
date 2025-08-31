import React from 'react';
import SettingContainer from '../settings/components/SettingContainer';
import { useTranslation } from 'react-i18next';
import { ThemeSelector } from '@/renderer/themes';
import ThemeCustomizer from '@/renderer/themes/components/ThemeCustomizer';
import { Space, Typography } from '@arco-design/web-react';

const ThemeCenter: React.FC = () => {
  const { t } = useTranslation();
  return (
    <SettingContainer title={t('settings.theme') + ' / 主题管理'}>
      <Space direction='vertical' size='large' style={{ width: '100%' }} className='pl-20px pr-20px'>
        <div>
          <Typography.Title heading={6}>{t('settings.theme')}（导入/导出）</Typography.Title>
          <ThemeSelector />
        </div>
        <div>
          <Typography.Title heading={6}>主题变量定制</Typography.Title>
          <ThemeCustomizer />
        </div>
      </Space>
    </SettingContainer>
  );
};

export default ThemeCenter;

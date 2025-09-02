import React from 'react';
import SettingContainer from '../settings/components/SettingContainer';
import { useTranslation } from 'react-i18next';
import { ThemeSelector } from '@/renderer/themes';
import ThemeCustomizer from '@/renderer/themes/components/ThemeCustomizer';
import AppStylesCustomizer from '@/renderer/themes/components/AppStylesCustomizer';
import { Typography, Divider } from '@arco-design/web-react';

const ThemeCenter: React.FC = () => {
  const { t } = useTranslation();
  return (
    <SettingContainer title={t('settings.theme') + ' / 主题管理'}>
      <div style={{ padding: '0 20px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Typography.Title heading={6} data-i18n-key='settings.theme' style={{ marginBottom: '16px' }}>
            {t('settings.theme')}（导入/导出）
          </Typography.Title>
          <ThemeSelector />
        </div>

        <Divider style={{ margin: '24px 0' }} />

        <div>
          <Typography.Title heading={6} data-i18n-key='theme.customization' style={{ marginBottom: '16px' }}>
            主题变量定制
          </Typography.Title>
          <ThemeCustomizer />
        </div>

        <Divider style={{ margin: '24px 0' }} />

        <div>
          <Typography.Title heading={6} data-i18n-key='theme.appstyles' style={{ marginBottom: '16px' }}>
            组件样式定制
          </Typography.Title>
          <AppStylesCustomizer />
        </div>
      </div>
    </SettingContainer>
  );
};

export default ThemeCenter;

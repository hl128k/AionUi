import React from 'react';
import { ThemeSettings } from '@/renderer/themes/components/ThemeSettings';
import SettingContainer from './components/SettingContainer';
import { useTranslation } from 'react-i18next';

const ThemeSettingsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SettingContainer title={t('settings.theme')}>
      <ThemeSettings />
    </SettingContainer>
  );
};

export default ThemeSettingsPage;

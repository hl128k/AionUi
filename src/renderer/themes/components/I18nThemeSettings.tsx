/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, Divider, Message, Select, Space, Switch, Tag, Typography } from '@arco-design/web-react';
import { IconLanguage } from '@arco-design/web-react/icon';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeManager } from '../hooks';
import type { I18nThemeMapping } from '../types';

const { Title, Text } = Typography;
const Option = Select.Option;

/**
 * i18n主题设置组件属性
 */
export interface I18nThemeSettingsProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * i18n主题设置组件
 */
export const I18nThemeSettings: React.FC<I18nThemeSettingsProps> = ({ className, style }) => {
  const { t, i18n } = useTranslation();
  const { manager, enableI18nThemes, disableI18nThemes, setLocaleThemeMapping, getCurrentLocale, getSupportedLocales, getI18nConfig } = useI18nThemeManager();

  const { availableThemes } = useThemeManager();

  const [isEnabled, setIsEnabled] = useState(false);
  const [lightMapping, setLightMapping] = useState<I18nThemeMapping | null>(null);
  const [darkMapping, setDarkMapping] = useState<I18nThemeMapping | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      const config = getI18nConfig();
      if (config) {
        setIsEnabled(config.enableI18nThemes || false);
        setLightMapping(config.i18nLightThemes || null);
        setDarkMapping(config.i18nDarkThemes || null);
      }
    } catch (error) {
      console.error('Failed to load i18n theme config:', error);
    }
  };

  const handleToggleI18nThemes = async (enabled: boolean) => {
    setLoading(true);
    try {
      if (enabled) {
        // 创建默认映射
        const defaultLight = availableThemes.find((t) => t.mode === 'light')?.id || 'builtin-github-light';
        const defaultDark = availableThemes.find((t) => t.mode === 'dark')?.id || 'builtin-vscode-dark';

        const lightMap: I18nThemeMapping = {
          default: defaultLight,
          locales: getSupportedLocales().reduce(
            (acc: Record<string, string>, locale: string) => {
              acc[locale] = defaultLight;
              return acc;
            },
            {} as Record<string, string>
          ),
        };

        const darkMap: I18nThemeMapping = {
          default: defaultDark,
          locales: getSupportedLocales().reduce(
            (acc: Record<string, string>, locale: string) => {
              acc[locale] = defaultDark;
              return acc;
            },
            {} as Record<string, string>
          ),
        };

        await enableI18nThemes(lightMap, darkMap);
        setLightMapping(lightMap);
        setDarkMapping(darkMap);
        Message.success(t('settings.i18nThemes.enabledSuccess', { defaultValue: 'I18n themes enabled successfully!' }));
      } else {
        await disableI18nThemes();
        Message.success(t('settings.i18nThemes.disabledSuccess', { defaultValue: 'I18n themes disabled successfully!' }));
      }
      setIsEnabled(enabled);
    } catch (error) {
      Message.error(t('settings.i18nThemes.toggleFailed', { defaultValue: 'Failed to toggle i18n themes' }));
      console.error('Failed to toggle i18n themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocaleTheme = async (mode: 'light' | 'dark', locale: string, themeId: string) => {
    try {
      const currentMapping = mode === 'light' ? lightMapping : darkMapping;
      if (!currentMapping) return;

      const updatedMapping = {
        ...currentMapping,
        locales: {
          ...currentMapping.locales,
          [locale]: themeId,
        },
      };

      await setLocaleThemeMapping(mode, updatedMapping);

      if (mode === 'light') {
        setLightMapping(updatedMapping);
      } else {
        setDarkMapping(updatedMapping);
      }

      Message.success(
        t('settings.i18nThemes.localeThemeUpdated', {
          defaultValue: `Theme for ${locale} updated successfully!`,
          locale,
          mode,
        })
      );
    } catch (error) {
      Message.error(t('settings.i18nThemes.updateFailed', { defaultValue: 'Failed to update locale theme' }));
      console.error('Failed to update locale theme:', error);
    }
  };

  const renderThemeMapping = (mode: 'light' | 'dark', mapping: I18nThemeMapping | null) => {
    if (!mapping) return null;

    const modeThemes = availableThemes.filter((theme) => theme.mode === mode);

    return (
      <div style={{ marginBottom: 16 }}>
        <Text bold style={{ display: 'block', marginBottom: 8 }}>
          {mode === 'light' ? t('settings.lightThemes') : t('settings.darkThemes')}
        </Text>

        <Space direction='vertical' style={{ width: '100%' }}>
          {getSupportedLocales().map((locale: string) => (
            <div key={locale} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag color={locale === getCurrentLocale() ? 'blue' : 'default'}>{locale}</Tag>

              <Select value={mapping.locales[locale] || mapping.default} onChange={(themeId) => handleUpdateLocaleTheme(mode, locale, themeId)} style={{ flex: 1, minWidth: 200 }} placeholder={t('settings.selectTheme')}>
                {modeThemes.map((theme) => (
                  <Option key={theme.id} value={theme.id}>
                    <Space>
                      {theme.isBuiltIn && <Tag size='small'>{t('settings.builtinTheme')}</Tag>}
                      <span>{theme.name}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </div>
          ))}
        </Space>
      </div>
    );
  };

  return (
    <Card className={className} style={style}>
      <div style={{ marginBottom: 16 }}>
        <Title heading={6} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconLanguage />
          {t('settings.i18nThemes.title', { defaultValue: 'International Theme Settings' })}
        </Title>
        <Text type='secondary' style={{ fontSize: 12 }}>
          {t('settings.i18nThemes.description', {
            defaultValue: 'Automatically switch themes based on language/locale settings',
          })}
        </Text>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Space>
          <Switch checked={isEnabled} loading={loading} onChange={handleToggleI18nThemes} />
          <Text>{t('settings.i18nThemes.enableLabel', { defaultValue: 'Enable I18n Theme Switching' })}</Text>
          <Tag color={isEnabled ? 'green' : 'default'} size='small'>
            {isEnabled ? t('common.enabled', { defaultValue: 'Enabled' }) : t('common.disabled', { defaultValue: 'Disabled' })}
          </Tag>
        </Space>
      </div>

      {isEnabled && (
        <>
          <div style={{ marginBottom: 16 }}>
            <Text type='secondary'>
              {t('settings.i18nThemes.currentLocale', {
                defaultValue: 'Current Language: {{locale}}',
                locale: getCurrentLocale(),
              })}
            </Text>
          </div>

          <Divider />

          <div style={{ marginBottom: 16 }}>
            <Title heading={6} style={{ margin: '0 0 8px 0' }}>
              {t('settings.i18nThemes.mappingTitle', { defaultValue: 'Locale Theme Mapping' })}
            </Title>
            <Text type='secondary' style={{ fontSize: 12 }}>
              {t('settings.i18nThemes.mappingDescription', {
                defaultValue: 'Configure specific themes for different languages',
              })}
            </Text>
          </div>

          {renderThemeMapping('light', lightMapping)}
          {renderThemeMapping('dark', darkMapping)}

          <Divider />

          <div>
            <Title heading={6} style={{ margin: '0 0 8px 0' }}>
              {t('settings.i18nThemes.previewTitle', { defaultValue: 'Preview' })}
            </Title>
            <Space wrap>
              <Tag color='blue'>
                {t('settings.i18nThemes.currentTheme', {
                  defaultValue: 'Current: {{theme}}',
                  theme: availableThemes.find((t) => manager.getThemeIdForLocale('light') === t.id || manager.getThemeIdForLocale('dark') === t.id)?.name || 'Default',
                })}
              </Tag>
              <Tag color='purple'>
                {t('settings.i18nThemes.activeLocale', {
                  defaultValue: 'Locale: {{locale}}',
                  locale: getCurrentLocale(),
                })}
              </Tag>
            </Space>
          </div>
        </>
      )}
    </Card>
  );
};

export default I18nThemeSettings;

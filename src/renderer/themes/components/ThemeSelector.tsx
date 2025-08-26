/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Avatar, Badge, Button, Card, Empty, Grid, Input, Select, Space, Tooltip } from '@arco-design/web-react';
import { Moon, Search, Setting, SunOne } from '@icon-park/react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeManager, useThemeMode, useThemeSwitcher } from '../hooks';
import type { AppTheme } from '../types';

const { Row, Col } = Grid;
const { Option } = Select;

/**
 * 主题选择器组件属性
 */
export interface ThemeSelectorProps {
  /** 显示模式 */
  mode?: 'dropdown' | 'grid' | 'compact';
  /** 是否显示搜索 */
  showSearch?: boolean;
  /** 是否显示模式切换 */
  showModeToggle?: boolean;
  /** 是否显示设置按钮 */
  showSettings?: boolean;
  /** 卡片大小 */
  cardSize?: 'small' | 'medium' | 'large';
  /** 每行显示的主题数量 */
  columns?: number;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
  /** 主题切换回调 */
  onThemeChange?: (theme: AppTheme) => void;
  /** 设置点击回调 */
  onSettingsClick?: () => void;
}

/**
 * 主题预览卡片组件
 */
const ThemePreviewCard: React.FC<{
  theme: AppTheme;
  isActive: boolean;
  size: 'small' | 'medium' | 'large';
  onClick: () => void;
  t: any;
}> = ({ theme, isActive, size, onClick, t }) => {
  const sizeMap = {
    small: { width: 120, height: 80, fontSize: 12 },
    medium: { width: 160, height: 100, fontSize: 14 },
    large: { width: 200, height: 120, fontSize: 16 },
  };

  const cardSize = sizeMap[size];
  const codeTheme = theme.codeHighlight;

  return (
    <Card
      className={`theme-preview-card ${isActive ? 'active' : ''}`}
      style={{
        width: cardSize.width,
        height: cardSize.height,
        cursor: 'pointer',
        border: isActive ? '2px solid var(--color-primary-6)' : '1px solid var(--color-border)',
        borderRadius: 8,
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={onClick}
      hoverable
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: codeTheme.background,
          padding: size === 'small' ? 8 : 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {/* 主题名称 */}
        <div
          style={{
            color: codeTheme.color,
            fontSize: cardSize.fontSize,
            fontWeight: 600,
            marginBottom: 4,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {theme.name}
        </div>

        {/* 代码预览 */}
        <div style={{ flex: 1, fontSize: cardSize.fontSize - 2, fontFamily: 'monospace' }}>
          <div style={{ color: codeTheme.keyword }}>function</div>
          <div style={{ color: codeTheme.function }}>example() {'{'}</div>
          <div style={{ color: codeTheme.comment, paddingLeft: 8 }}>// {theme.mode === 'light' ? t('settings.lightMode') : t('settings.darkMode')} theme</div>
          <div style={{ color: codeTheme.keyword, paddingLeft: 8 }}>return</div>
          <div style={{ color: codeTheme.string, paddingLeft: 16 }}>"hello";</div>
          <div>{'}'}</div>
        </div>

        {/* 主题模式指示器 */}
        <div
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            background: 'var(--theme-secondary-bg)',
            borderRadius: 4,
            padding: '2px 4px',
            fontSize: 10,
            color: codeTheme.color,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {theme.mode === 'light' ? <SunOne /> : <Moon />}
          {theme.isBuiltIn && <Badge count={t('settings.builtinTheme')} />}
        </div>
      </div>
    </Card>
  );
};

/**
 * 主题选择器组件
 *
 * 提供多种显示模式的主题选择界面：
 * 1. dropdown - 下拉选择模式
 * 2. grid - 网格卡片模式
 * 3. compact - 紧凑列表模式
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ mode = 'grid', showSearch = true, showModeToggle = true, showSettings = true, cardSize = 'medium', columns = 4, style, className, onThemeChange, onSettingsClick }) => {
  // Hooks
  const { t } = useTranslation();
  const { currentTheme, availableThemes, switchTheme } = useThemeSwitcher();
  const { themeMode, effectiveMode, toggleMode } = useThemeMode();
  const { searchThemes } = useThemeManager();

  // 本地状态
  const [searchKeyword, setSearchKeyword] = useState('');

  // 搜索和过滤主题
  const filteredThemes = useMemo(() => {
    let themes = availableThemes;

    if (searchKeyword.trim()) {
      themes = searchThemes(searchKeyword);
    }

    return themes;
  }, [availableThemes, searchKeyword, searchThemes]);

  // 按模式分组主题
  const groupedThemes = useMemo(() => {
    const lightThemes = filteredThemes.filter((t) => t.mode === 'light');
    const darkThemes = filteredThemes.filter((t) => t.mode === 'dark');

    return { lightThemes, darkThemes };
  }, [filteredThemes]);

  // 主题切换处理
  const handleThemeChange = useCallback(
    async (theme: AppTheme) => {
      console.log('🎨 ThemeSelector: Switching to theme:', theme.name, theme.id);
      await switchTheme(theme.id);
      onThemeChange?.(theme);
    },
    [switchTheme, onThemeChange]
  );

  // 渲染下拉模式
  const renderDropdownMode = () => (
    <Select
      value={currentTheme?.id}
      placeholder={t('settings.selectTheme')}
      style={{ width: 200, ...style }}
      className={className}
      onChange={(value) => {
        const theme = availableThemes.find((t) => t.id === value);
        if (theme) handleThemeChange(theme);
      }}
      showSearch={showSearch}
      filterOption={true}
    >
      <Option value='' disabled>
        {t('settings.lightThemes')}
      </Option>
      {groupedThemes.lightThemes.map((theme) => (
        <Option key={theme.id} value={theme.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size={20} style={{ backgroundColor: theme.codeHighlight.background }}>
              <SunOne style={{ color: theme.codeHighlight.color }} />
            </Avatar>
            {theme.name}
            {theme.isBuiltIn && <Badge count={t('settings.builtinTheme')} />}
          </div>
        </Option>
      ))}

      <Option value='' disabled>
        {t('settings.darkThemes')}
      </Option>
      {groupedThemes.darkThemes.map((theme) => (
        <Option key={theme.id} value={theme.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar size={20} style={{ backgroundColor: theme.codeHighlight.background }}>
              <Moon style={{ color: theme.codeHighlight.color }} />
            </Avatar>
            {theme.name}
            {theme.isBuiltIn && <Badge count={t('settings.builtinTheme')} />}
          </div>
        </Option>
      ))}
    </Select>
  );

  // 渲染网格模式
  const renderGridMode = () => (
    <div style={style} className={className}>
      {/* 工具栏 */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          {showSearch && <Input prefix={<Search />} placeholder={t('settings.searchTheme')} value={searchKeyword} onChange={setSearchKeyword} style={{ width: 200 }} allowClear />}

          {showModeToggle && (
            <Tooltip content={`${t('settings.currentMode')}: ${themeMode === 'auto' ? t('settings.autoMode') : themeMode === 'light' ? t('settings.lightMode') : t('settings.darkMode')} (${t('settings.effectiveMode')}: ${effectiveMode === 'light' ? t('settings.lightMode') : t('settings.darkMode')})`}>
              <Button icon={effectiveMode === 'light' ? <SunOne /> : <Moon />} onClick={toggleMode} type={themeMode === 'auto' ? 'primary' : 'secondary'}>
                {themeMode === 'auto' ? t('settings.autoMode') : themeMode === 'light' ? t('settings.lightMode') : t('settings.darkMode')}
              </Button>
            </Tooltip>
          )}
        </Space>

        {showSettings && (
          <Button icon={<Setting />} onClick={onSettingsClick} type='text'>
            {t('common.settings')}
          </Button>
        )}
      </div>

      {/* 主题网格 */}
      {filteredThemes.length === 0 ? (
        <Empty description={t('settings.noThemeFound')} />
      ) : (
        <>
          {/* 浅色主题 */}
          {groupedThemes.lightThemes.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 12,
                  color: 'var(--color-text-1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <SunOne />
                {t('settings.lightThemes')} ({t('settings.themeCount', { count: groupedThemes.lightThemes.length })})
              </div>
              <Row gutter={[16, 16]}>
                {groupedThemes.lightThemes.map((theme) => (
                  <Col key={theme.id} span={24 / columns}>
                    <ThemePreviewCard theme={theme} isActive={currentTheme?.id === theme.id} size={cardSize} onClick={() => handleThemeChange(theme)} t={t} />
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* 深色主题 */}
          {groupedThemes.darkThemes.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 12,
                  color: 'var(--color-text-1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Moon />
                {t('settings.darkThemes')} ({t('settings.themeCount', { count: groupedThemes.darkThemes.length })})
              </div>
              <Row gutter={[16, 16]}>
                {groupedThemes.darkThemes.map((theme) => (
                  <Col key={theme.id} span={24 / columns}>
                    <ThemePreviewCard theme={theme} isActive={currentTheme?.id === theme.id} size={cardSize} onClick={() => handleThemeChange(theme)} t={t} />
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </>
      )}
    </div>
  );

  // 渲染紧凑模式
  const renderCompactMode = () => (
    <div style={style} className={className}>
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {filteredThemes.map((theme) => (
          <div
            key={theme.id}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderRadius: 4,
              backgroundColor: currentTheme?.id === theme.id ? 'var(--color-primary-light-1)' : 'transparent',
              border: currentTheme?.id === theme.id ? '1px solid var(--color-primary-6)' : '1px solid transparent',
              marginBottom: 4,
              transition: 'all 0.2s ease',
            }}
            onClick={() => handleThemeChange(theme)}
          >
            <Avatar size={24} style={{ backgroundColor: theme.codeHighlight.background }}>
              {theme.mode === 'light' ? <SunOne style={{ color: theme.codeHighlight.color }} /> : <Moon style={{ color: theme.codeHighlight.color }} />}
            </Avatar>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                {theme.name}
                {theme.isBuiltIn && <Badge count={t('settings.builtinTheme')} style={{ marginLeft: 8 }} />}
              </div>
              {theme.description && <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>{theme.description}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 根据模式渲染
  switch (mode) {
    case 'dropdown':
      return renderDropdownMode();
    case 'grid':
      return renderGridMode();
    case 'compact':
      return renderCompactMode();
    default:
      return renderGridMode();
  }
};

export default ThemeSelector;

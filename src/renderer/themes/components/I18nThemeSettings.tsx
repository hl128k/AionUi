/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, Typography } from '@arco-design/web-react';
import React from 'react';

const { Title, Text } = Typography;

/**
 * i18n主题设置组件属性
 */
export interface I18nThemeSettingsProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * i18n主题设置组件（简化版）
 */
export const I18nThemeSettings: React.FC<I18nThemeSettingsProps> = ({ className, style }) => {
  return (
    <Card className={className} style={style}>
      <Title heading={6}>国际化主题设置</Title>
      <Text type='secondary'>国际化主题功能正在开发中，敬请期待。</Text>
    </Card>
  );
};

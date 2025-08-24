/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

// === 主题选择器 ===
export { ThemeSelector } from './ThemeSelector';
export type { ThemeSelectorProps } from './ThemeSelector';

// === 主题预览 ===
export { ThemePreview } from './ThemePreview';
export type { ThemePreviewProps } from './ThemePreview';

// === 主题设置 ===
export { ThemeSettings } from './ThemeSettings';
export type { ThemeSettingsProps } from './ThemeSettings';

// === 主题自定义器 ===
export { ThemeCustomizer } from './ThemeCustomizer';
export type { ThemeCustomizerProps } from './ThemeCustomizer';

// === i18n主题设置 ===
export { I18nThemeSettings } from './I18nThemeSettings';
export type { I18nThemeSettingsProps } from './I18nThemeSettings';

// === 默认导出 ===
import { I18nThemeSettings } from './I18nThemeSettings';
import { ThemeCustomizer } from './ThemeCustomizer';
import { ThemePreview } from './ThemePreview';
import { ThemeSelector } from './ThemeSelector';
import { ThemeSettings } from './ThemeSettings';

export default {
  ThemeSelector,
  ThemePreview,
  ThemeSettings,
  ThemeCustomizer,
  I18nThemeSettings,
};

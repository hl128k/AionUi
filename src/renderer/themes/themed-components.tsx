/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 主题化组件工厂
 * 为 Arco Design 组件提供自动主题支持的包装器
 */

import { Alert, Button, Card, Collapse, Drawer, Empty, Form, Input, Layout, Menu, Message, Modal, Select, Spin, Switch, Table, Tabs, Tag, Tooltip, Typography } from '@arco-design/web-react';
import React, { forwardRef, useMemo } from 'react';
import { useArcoThemeConfig } from './provider';
import type { ArcoThemeConfig } from './types';

/**
 * 主题样式应用器
 */
const useThemedStyles = (componentName: string) => {
  const arcoConfig = useArcoThemeConfig();

  return useMemo(() => {
    if (!arcoConfig) return {};

    const componentConfig = arcoConfig.components?.[componentName as keyof NonNullable<ArcoThemeConfig['components']>];
    if (!componentConfig) return {};

    const styles: React.CSSProperties = {};

    // 转换配置为样式，增强类型安全
    Object.entries(componentConfig).forEach(([key, value]) => {
      if (typeof value !== 'string' && typeof value !== 'number') return;

      if (key.startsWith('color')) {
        const cssProperty = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        // 使用类型安全的方式设置样式属性
        (styles as any)[cssProperty] = value;
      } else if (key === 'borderRadius' && typeof value === 'number') {
        styles.borderRadius = `${value}px`;
      }
    });

    return styles;
  }, [arcoConfig, componentName]);
};

/**
 * 创建主题化组件的高阶组件工厂
 */
function createThemedComponent<T extends React.ComponentType<any>>(Component: T, componentName: string) {
  return forwardRef<any, React.ComponentPropsWithoutRef<T>>((props, ref) => {
    const themedStyles = useThemedStyles(componentName);

    const enhancedProps = {
      ...props,
      style: {
        ...themedStyles,
        ...props.style,
      },
    } as any;

    return <Component {...enhancedProps} ref={ref} />;
  });
}

// === 主题化组件导出 ===

/**
 * 主题化按钮组件
 */
export const ThemedButton = createThemedComponent(Button, 'Button');

/**
 * 主题化卡片组件
 */
export const ThemedCard = createThemedComponent(Card, 'Card');

/**
 * 主题化菜单组件
 */
export const ThemedMenu = createThemedComponent(Menu, 'Menu');

/**
 * 主题化消息组件
 */
export const ThemedMessage = createThemedComponent(Message, 'Message');

/**
 * 主题化布局组件
 */
export const ThemedLayout = createThemedComponent(Layout, 'Layout');

/**
 * 主题化表单组件
 */
export const ThemedForm = createThemedComponent(Form, 'Form');

/**
 * 主题化输入框组件
 */
export const ThemedInput = createThemedComponent(Input, 'Input');

/**
 * 主题化选择器组件
 */
export const ThemedSelect = createThemedComponent(Select, 'Select');

/**
 * 主题化开关组件
 */
export const ThemedSwitch = createThemedComponent(Switch, 'Switch');

/**
 * 主题化标签页组件
 */
export const ThemedTabs = createThemedComponent(Tabs, 'Tabs');

/**
 * 主题化标签组件
 */
export const ThemedTag = createThemedComponent(Tag, 'Tag');

/**
 * 主题化表格组件
 */
export const ThemedTable = createThemedComponent(Table, 'Table');

/**
 * 主题化模态框组件
 */
export const ThemedModal = createThemedComponent(Modal, 'Modal');

/**
 * 主题化抽屉组件
 */
export const ThemedDrawer = createThemedComponent(Drawer, 'Drawer');

/**
 * 主题化警告框组件
 */
export const ThemedAlert = createThemedComponent(Alert, 'Alert');

/**
 * 主题化空状态组件
 */
export const ThemedEmpty = createThemedComponent(Empty, 'Empty');

/**
 * 主题化加载中组件
 */
export const ThemedSpin = createThemedComponent(Spin, 'Spin');

/**
 * 主题化折叠面板组件
 */
export const ThemedCollapse = createThemedComponent(Collapse, 'Collapse');

/**
 * 主题化文字提示组件
 */
export const ThemedTooltip = createThemedComponent(Tooltip, 'Tooltip');

/**
 * 主题化排版组件
 */
export const ThemedTypography = createThemedComponent(Typography, 'Typography');

// === 特殊主题化组件 ===

/**
 * 智能主题化容器
 * 根据当前主题自动调整背景色和文字颜色
 */
interface ThemedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  padding?: boolean | 'sm' | 'md' | 'lg';
  rounded?: boolean | 'sm' | 'md' | 'lg';
}

export const ThemedContainer: React.FC<ThemedContainerProps> = ({ children, variant = 'primary', padding = true, rounded = false, className, style, ...props }) => {
  const arcoConfig = useArcoThemeConfig();

  const containerStyles = useMemo(() => {
    if (!arcoConfig) return {};

    const styles: React.CSSProperties = {};

    // 背景色变体
    switch (variant) {
      case 'primary':
        styles.backgroundColor = arcoConfig.neutral?.colorBg;
        styles.color = arcoConfig.neutral?.colorText;
        break;
      case 'secondary':
        styles.backgroundColor = arcoConfig.neutral?.colorBgSecondary;
        styles.color = arcoConfig.neutral?.colorTextSecondary;
        break;
      case 'tertiary':
        styles.backgroundColor = arcoConfig.neutral?.colorBgTertiary;
        styles.color = arcoConfig.neutral?.colorTextTertiary;
        break;
    }

    // 边框
    styles.border = `1px solid ${arcoConfig.neutral?.colorBorder}`;

    // 内边距
    if (padding) {
      const paddingSize = typeof padding === 'boolean' ? 'md' : padding;
      switch (paddingSize) {
        case 'sm':
          styles.padding = arcoConfig.sizing?.spacingS || '8px';
          break;
        case 'md':
          styles.padding = arcoConfig.sizing?.spacingM || '16px';
          break;
        case 'lg':
          styles.padding = arcoConfig.sizing?.spacingL || '24px';
          break;
      }
    }

    // 圆角
    if (rounded) {
      const roundedSize = typeof rounded === 'boolean' ? 'md' : rounded;
      switch (roundedSize) {
        case 'sm':
          styles.borderRadius = arcoConfig.sizing?.borderRadiusSmall || '4px';
          break;
        case 'md':
          styles.borderRadius = arcoConfig.sizing?.borderRadius || '6px';
          break;
        case 'lg':
          styles.borderRadius = arcoConfig.sizing?.borderRadiusLarge || '12px';
          break;
      }
    }

    return styles;
  }, [arcoConfig, variant, padding, rounded]);

  return (
    <div
      {...props}
      className={className}
      style={{
        ...containerStyles,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * 主题化分割线组件
 */
interface ThemedDividerProps extends React.HTMLAttributes<HTMLHRElement> {
  variant?: 'solid' | 'dashed' | 'dotted';
  thickness?: 'thin' | 'medium' | 'thick';
}

export const ThemedDivider: React.FC<ThemedDividerProps> = ({ variant = 'solid', thickness = 'thin', className, style, ...props }) => {
  const arcoConfig = useArcoThemeConfig();

  const dividerStyles = useMemo(() => {
    const styles: React.CSSProperties = {
      border: 'none',
      height: 0,
      borderTop: `${thickness === 'thin' ? '1px' : thickness === 'medium' ? '2px' : '3px'} ${variant} ${arcoConfig?.neutral?.colorBorder || 'var(--theme-border)'}`,
      margin: `${arcoConfig?.sizing?.spacingM || '16px'} 0`,
    };

    return styles;
  }, [arcoConfig, variant, thickness]);

  return (
    <hr
      {...props}
      className={className}
      style={{
        ...dividerStyles,
        ...style,
      }}
    />
  );
};

/**
 * 主题化图标容器
 */
interface ThemedIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const ThemedIcon: React.FC<ThemedIconProps> = ({ children, size = 'md', color = 'primary', className, style, ...props }) => {
  const arcoConfig = useArcoThemeConfig();

  const iconStyles = useMemo(() => {
    const styles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    // 尺寸
    switch (size) {
      case 'xs':
        styles.fontSize = '12px';
        styles.width = '12px';
        styles.height = '12px';
        break;
      case 'sm':
        styles.fontSize = '14px';
        styles.width = '14px';
        styles.height = '14px';
        break;
      case 'md':
        styles.fontSize = '16px';
        styles.width = '16px';
        styles.height = '16px';
        break;
      case 'lg':
        styles.fontSize = '20px';
        styles.width = '20px';
        styles.height = '20px';
        break;
      case 'xl':
        styles.fontSize = '24px';
        styles.width = '24px';
        styles.height = '24px';
        break;
    }

    // 颜色
    switch (color) {
      case 'primary':
        styles.color = arcoConfig?.primary?.primary || arcoConfig?.neutral?.colorText;
        break;
      case 'secondary':
        styles.color = arcoConfig?.neutral?.colorTextSecondary;
        break;
      case 'success':
        styles.color = arcoConfig?.colors?.success;
        break;
      case 'warning':
        styles.color = arcoConfig?.colors?.warning;
        break;
      case 'danger':
        styles.color = arcoConfig?.colors?.danger;
        break;
    }

    return styles;
  }, [arcoConfig, size, color]);

  return (
    <span
      {...props}
      className={className}
      style={{
        ...iconStyles,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// === 组件集合导出 ===

/**
 * 所有主题化组件的集合
 */
export const ThemedComponents = {
  Alert: ThemedAlert,
  Button: ThemedButton,
  Card: ThemedCard,
  Collapse: ThemedCollapse,
  Container: ThemedContainer,
  Divider: ThemedDivider,
  Drawer: ThemedDrawer,
  Empty: ThemedEmpty,
  Form: ThemedForm,
  Icon: ThemedIcon,
  Input: ThemedInput,
  Layout: ThemedLayout,
  Menu: ThemedMenu,
  Message: ThemedMessage,
  Modal: ThemedModal,
  Select: ThemedSelect,
  Spin: ThemedSpin,
  Switch: ThemedSwitch,
  Table: ThemedTable,
  Tabs: ThemedTabs,
  Tag: ThemedTag,
  Tooltip: ThemedTooltip,
  Typography: ThemedTypography,
};

/**
 * 主题化组件 Hook
 * 提供便捷的主题化组件访问方式
 */
export const useThemedComponents = () => {
  return ThemedComponents;
};

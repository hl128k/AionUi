/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type CSSProperties, type ReactNode } from 'react';

/**
 * 内部主题化Layout组件，替换Arco Design Layout
 * 完全受控于我们自己的主题系统
 */

interface ThemedLayoutProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

interface ThemedSiderProps {
  children: ReactNode;
  width?: number | string;
  collapsedWidth?: number | string;
  collapsed?: boolean;
  className?: string;
  style?: CSSProperties;
}

interface ThemedContentProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

interface ThemedHeaderProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * 主题化Layout根容器
 */
export const ThemedLayout: React.FC<ThemedLayoutProps> & {
  Sider: React.FC<ThemedSiderProps>;
  Content: React.FC<ThemedContentProps>;
  Header: React.FC<ThemedHeaderProps>;
} = ({ children, className, style }) => {
  return (
    <div className={classNames('themed-layout', 'flex', 'min-h-screen', 'w-full', className)} style={style}>
      {children}
    </div>
  );
};

/**
 * 主题化Sider侧边栏
 * 完全基于CSS变量和样式集控制主题
 */
const ThemedSider: React.FC<ThemedSiderProps> = ({ children, width = 300, collapsedWidth = 64, collapsed = false, className, style }) => {
  const currentTheme = useCurrentTheme();

  const siderWidth = collapsed ? (typeof collapsedWidth === 'number' ? `${collapsedWidth}px` : collapsedWidth) : typeof width === 'number' ? `${width}px` : width;

  const siderStyle: CSSProperties = {
    width: siderWidth,
    minWidth: siderWidth,
    maxWidth: siderWidth,
    transition: 'width 0.3s ease, min-width 0.3s ease, max-width 0.3s ease',
    ...style,
  };

  return (
    <aside
      className={classNames(
        'themed-sider',
        'o-slider', // 保持样式集类名
        'flex',
        'flex-col',
        'overflow-hidden',
        {
          'themed-sider--collapsed': collapsed,
        },
        className
      )}
      style={siderStyle}
    >
      {children}
    </aside>
  );
};

/**
 * 主题化Content内容区
 */
const ThemedContent: React.FC<ThemedContentProps> = ({ children, className, style }) => {
  return (
    <main
      className={classNames(
        'themed-content',
        'o-main', // 保持样式集类名
        'flex-1',
        'overflow-hidden',
        className
      )}
      style={style}
    >
      {children}
    </main>
  );
};

/**
 * 主题化Header头部
 */
const ThemedHeader: React.FC<ThemedHeaderProps> = ({ children, className, style }) => {
  return (
    <header className={classNames('themed-header', 'flex', 'items-center', className)} style={style}>
      {children}
    </header>
  );
};

// 绑定子组件
ThemedLayout.Sider = ThemedSider;
ThemedLayout.Content = ThemedContent;
ThemedLayout.Header = ThemedHeader;

export default ThemedLayout;

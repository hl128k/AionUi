/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

/**
 * 内部主题化Divider组件，替换Arco Design Divider
 * 完全受控于我们自己的主题系统
 */

export type DividerType = 'horizontal' | 'vertical';
export type DividerOrientation = 'left' | 'center' | 'right';

export interface ThemedDividerProps {
  className?: string;
  type?: DividerType;
  orientation?: DividerOrientation;
  dashed?: boolean;
  plain?: boolean;
  children?: ReactNode;
  margin?: string | number;
}

export const ThemedDivider: React.FC<ThemedDividerProps> = ({ className, type = 'horizontal', orientation = 'center', dashed = false, plain = false, children, margin }) => {
  const currentTheme = useCurrentTheme();

  const baseClasses = ['themed-divider', 'flex', 'items-center', 'relative'];

  const lineClasses = ['themed-divider-line', 'flex-1', 'border-t', dashed ? 'border-dashed' : 'border-solid'];

  const textClasses = ['themed-divider-text', 'px-3', 'text-sm', plain ? 'opacity-70' : ''];

  const getOrientationClasses = () => {
    switch (orientation) {
      case 'left':
        return 'justify-start';
      case 'right':
        return 'justify-end';
      default:
        return 'justify-center';
    }
  };

  const getStyle = () => {
    const baseStyle = {
      borderColor: currentTheme.colors?.border || '#e5e7eb',
      color: currentTheme.colors?.text || '#000000',
    };

    if (margin !== undefined) {
      const marginValue = typeof margin === 'number' ? `${margin}px` : margin;
      baseStyle.margin = marginValue;
    }

    return baseStyle;
  };

  if (type === 'vertical') {
    return <div className={classNames(baseClasses, 'w-px', 'h-full', 'border-l', dashed ? 'border-dashed' : 'border-solid', className)} style={getStyle()} />;
  }

  if (children) {
    return (
      <div className={classNames(baseClasses, 'w-full', getOrientationClasses(), className)} style={{ margin: getStyle().margin }}>
        <div className={classNames(lineClasses)} style={getStyle()} />
        <div className={classNames(textClasses)} style={getStyle()}>
          {children}
        </div>
        <div className={classNames(lineClasses)} style={getStyle()} />
      </div>
    );
  }

  return (
    <div className={classNames(baseClasses, 'w-full', className)} style={getStyle()}>
      <div className={classNames(lineClasses)} style={getStyle()} />
    </div>
  );
};

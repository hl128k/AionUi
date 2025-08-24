/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

/**
 * 内部主题化Empty组件，替换Arco Design Empty
 * 完全受控于我们自己的主题系统
 */

export interface ThemedEmptyProps {
  className?: string;
  image?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  style?: React.CSSProperties;
}

export const ThemedEmpty: React.FC<ThemedEmptyProps> = ({ className, image, description, children, style }) => {
  const currentTheme = useCurrentTheme();

  const baseClasses = ['themed-empty', 'flex', 'flex-col', 'items-center', 'justify-center', 'p-8', 'text-center', 'min-h-[200px]'];

  const imageClasses = ['themed-empty-image', 'mb-4', 'text-6xl', 'opacity-50'];

  const descriptionClasses = ['themed-empty-description', 'mb-4', 'text-base', 'opacity-70'];

  const childrenClasses = ['themed-empty-children', 'mt-4'];

  const defaultImage = (
    <div className='flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800'>
      <span className='text-4xl opacity-50'>📭</span>
    </div>
  );

  const defaultDescription = <span style={{ color: currentTheme.colors.text || '#000000' }}>暂无数据</span>;

  return (
    <div
      className={classNames(baseClasses, className)}
      style={{
        color: currentTheme.colors.text || '#000000',
        backgroundColor: currentTheme.colors.emptyBg || 'transparent',
        ...style,
      }}
    >
      <div className={classNames(imageClasses)}>{image || defaultImage}</div>

      <div className={classNames(descriptionClasses)}>{description || defaultDescription}</div>

      {children && <div className={classNames(childrenClasses)}>{children}</div>}
    </div>
  );
};

// 静态方法
ThemedEmpty.PRESENTED_IMAGE_SIMPLE = 'simple';
ThemedEmpty.PRESENTED_IMAGE_DEFAULT = 'default';

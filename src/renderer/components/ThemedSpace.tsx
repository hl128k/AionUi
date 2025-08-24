/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

/**
 * 内部主题化Space组件，替换Arco Design Space
 * 完全受控于我们自己的主题系统
 */

export type SpaceSize = 'small' | 'medium' | 'large' | number;
export type SpaceDirection = 'horizontal' | 'vertical';
export type SpaceAlign = 'start' | 'end' | 'center' | 'baseline';
export type SpaceWrap = boolean;

export interface ThemedSpaceProps {
  className?: string;
  children: ReactNode;
  size?: SpaceSize | SpaceSize[];
  direction?: SpaceDirection;
  align?: SpaceAlign;
  wrap?: SpaceWrap;
  block?: boolean;
  split?: ReactNode;
}

export const ThemedSpace: React.FC<ThemedSpaceProps> = ({ className, children, size = 'medium', direction = 'horizontal', align = 'center', wrap = false, block = false, split }) => {
  const currentTheme = useCurrentTheme();

  const getSizeClasses = () => {
    if (Array.isArray(size)) {
      const [horizontalSize, verticalSize] = size;
      const horizontalClass = getSizeClass(horizontalSize);
      const verticalClass = getSizeClass(verticalSize);
      return direction === 'horizontal' ? `space-x-${horizontalClass} space-y-${verticalClass}` : `space-y-${horizontalClass} space-x-${verticalClass}`;
    }
    const sizeClass = getSizeClass(size);
    return direction === 'horizontal' ? `space-x-${sizeClass}` : `space-y-${sizeClass}`;
  };

  const getSizeClass = (size: SpaceSize) => {
    switch (size) {
      case 'small':
        return '2';
      case 'large':
        return '6';
      case 'medium':
        return '4';
      case 0:
        return '0';
      case 1:
        return '1';
      case 2:
        return '2';
      case 3:
        return '3';
      case 4:
        return '4';
      case 5:
        return '5';
      case 6:
        return '6';
      case 7:
        return '7';
      case 8:
        return '8';
      default:
        return '4';
    }
  };

  const getDirectionClasses = () => {
    switch (direction) {
      case 'vertical':
        return 'flex-col';
      default:
        return 'flex-row';
    }
  };

  const getAlignClasses = () => {
    switch (align) {
      case 'start':
        return 'items-start';
      case 'end':
        return 'items-end';
      case 'baseline':
        return 'items-baseline';
      case 'center':
      default:
        return 'items-center';
    }
  };

  const baseClasses = ['themed-space', 'flex', getDirectionClasses(), getAlignClasses(), wrap ? 'flex-wrap' : 'flex-nowrap', block ? 'w-full' : 'inline-flex'];

  const childrenArray = React.Children.toArray(children).filter(Boolean);

  return (
    <div className={classNames(baseClasses, getSizeClasses(), className)}>
      {childrenArray.map((child, index) => {
        if (split && index > 0) {
          return (
            <React.Fragment key={index}>
              <div className='themed-space-split' style={{ color: '#e5e7eb' }}>
                {split}
              </div>
              {child}
            </React.Fragment>
          );
        }
        return child;
      })}
    </div>
  );
};

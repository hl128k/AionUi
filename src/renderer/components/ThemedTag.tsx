/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

/**
 * 内部主题化Tag组件，替换Arco Design Tag
 * 完全受控于我们自己的主题系统
 */

export type TagColor = 'blue' | 'red' | 'green' | 'orange' | 'purple' | 'cyan' | 'magenta' | 'lime' | 'gold' | 'default';
export type TagShape = 'square' | 'round' | 'circle';
export type TagSize = 'small' | 'medium' | 'large';

export interface ThemedTagProps {
  className?: string;
  children: ReactNode;
  color?: TagColor;
  shape?: TagShape;
  size?: TagSize;
  closable?: boolean;
  visible?: boolean;
  onClose?: () => void;
  onClick?: () => void;
  icon?: ReactNode;
}

export const ThemedTag: React.FC<ThemedTagProps> = ({ className, children, color = 'default', shape = 'square', size = 'medium', closable = false, visible = true, onClose, onClick, icon }) => {
  const currentTheme = useCurrentTheme();
  const [internalVisible, setInternalVisible] = React.useState(visible);

  const handleClose = () => {
    setInternalVisible(false);
    onClose?.();
  };

  if (!internalVisible) return null;

  const getColorStyles = () => {
    switch (color) {
      case 'blue':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          borderColor: 'rgba(59, 130, 246, 0.3)',
        };
      case 'red':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          borderColor: 'rgba(239, 68, 68, 0.3)',
        };
      case 'green':
        return {
          backgroundColor: 'rgba(52, 211, 153, 0.1)',
          color: '#34d399',
          borderColor: 'rgba(52, 211, 153, 0.3)',
        };
      case 'orange':
        return {
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          color: '#fbbf24',
          borderColor: 'rgba(251, 191, 36, 0.3)',
        };
      case 'purple':
        return {
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          color: '#a855f7',
          borderColor: 'rgba(168, 85, 247, 0.3)',
        };
      case 'cyan':
        return {
          backgroundColor: 'rgba(34, 211, 238, 0.1)',
          color: '#22d3ee',
          borderColor: 'rgba(34, 211, 238, 0.3)',
        };
      case 'magenta':
        return {
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          color: '#ec4899',
          borderColor: 'rgba(236, 72, 153, 0.3)',
        };
      case 'lime':
        return {
          backgroundColor: 'rgba(163, 230, 53, 0.1)',
          color: '#a3e635',
          borderColor: 'rgba(163, 230, 53, 0.3)',
        };
      case 'gold':
        return {
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          color: '#fbbf24',
          borderColor: 'rgba(251, 191, 36, 0.3)',
        };
      default:
        return {
          backgroundColor: currentTheme.colors?.tagBg || 'rgba(0, 0, 0, 0.05)',
          color: currentTheme.colors?.text || '#000000',
          borderColor: currentTheme.colors?.border || '#e5e7eb',
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-xs px-2 py-1';
      case 'large':
        return 'text-base px-3 py-2';
      default:
        return 'text-sm px-2.5 py-1.5';
    }
  };

  const getShapeClasses = () => {
    switch (shape) {
      case 'round':
        return 'rounded-full';
      case 'circle':
        return 'rounded-full aspect-square flex items-center justify-center';
      default:
        return 'rounded-md';
    }
  };

  const baseClasses = ['themed-tag', 'inline-flex', 'items-center', 'border', 'transition-all', 'duration-200', 'cursor-pointer', 'hover:shadow-sm', 'select-none', getSizeClasses(), getShapeClasses()];

  const colorStyles = getColorStyles();

  return (
    <div
      className={classNames(baseClasses, className)}
      style={{
        backgroundColor: colorStyles.backgroundColor,
        color: colorStyles.color,
        borderColor: colorStyles.borderColor,
      }}
      onClick={onClick}
    >
      {icon && <span className='mr-1'>{icon}</span>}
      <span className='themed-tag-content'>{children}</span>
      {closable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className='ml-1 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors'
          style={{ color: colorStyles.color }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

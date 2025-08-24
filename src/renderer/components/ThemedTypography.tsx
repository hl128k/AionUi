/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

/**
 * 内部主题化Typography组件，替换Arco Design Typography
 * 完全受控于我们自己的主题系统
 */

export type TextType = 'primary' | 'secondary' | 'success' | 'warning' | 'error';
export type TextSize = 'small' | 'medium' | 'large' | 'heading' | 'title' | 'paragraph';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';

export interface ThemedTypographyProps {
  className?: string;
  children: ReactNode;
  type?: TextType;
  size?: TextSize;
  weight?: TextWeight;
  disabled?: boolean;
  mark?: boolean;
  code?: boolean;
  keyboard?: boolean;
  underline?: boolean;
  delete?: boolean;
  strong?: boolean;
  italic?: boolean;
  copyable?: boolean;
  ellipsis?: boolean;
  onClick?: () => void;
}

export const ThemedTypography: React.FC<ThemedTypographyProps> = ({ className, children, type = 'primary', size = 'medium', weight = 'normal', disabled = false, mark = false, code = false, keyboard = false, underline = false, delete: deleteProp = false, strong = false, italic = false, copyable = false, ellipsis = false, onClick }) => {
  const currentTheme = useCurrentTheme();

  const getTypeStyles = () => {
    if (disabled) {
      return {
        color: currentTheme.colors?.disabledText || 'rgba(0, 0, 0, 0.45)',
        cursor: 'not-allowed',
      };
    }

    switch (type) {
      case 'secondary':
        return {
          color: currentTheme.colors?.secondaryText || 'rgba(0, 0, 0, 0.65)',
        };
      case 'success':
        return {
          color: currentTheme.colors?.success || '#34d399',
        };
      case 'warning':
        return {
          color: currentTheme.colors?.warning || '#fbbf24',
        };
      case 'error':
        return {
          color: currentTheme.colors?.error || '#ef4444',
        };
      default:
        return {
          color: currentTheme.colors?.text || '#000000',
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-lg';
      case 'heading':
        return 'text-2xl font-bold';
      case 'title':
        return 'text-xl font-semibold';
      case 'paragraph':
        return 'text-base leading-relaxed';
      default:
        return 'text-sm';
    }
  };

  const getWeightClasses = () => {
    switch (weight) {
      case 'medium':
        return 'font-medium';
      case 'semibold':
        return 'font-semibold';
      case 'bold':
        return 'font-bold';
      default:
        return 'font-normal';
    }
  };

  const baseClasses = ['themed-typography', 'inline-block', 'transition-all', 'duration-200', getSizeClasses(), getWeightClasses(), disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer', ellipsis ? 'truncate' : '', underline ? 'underline' : '', italic ? 'italic' : ''];

  const typeStyles = getTypeStyles();

  const renderContent = () => {
    let content = children;

    if (strong) {
      content = <strong>{content}</strong>;
    }

    if (mark) {
      content = <mark className='bg-yellow-200 dark:bg-yellow-800 px-1 rounded'>{content}</mark>;
    }

    if (code) {
      content = <code className='bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono'>{content}</code>;
    }

    if (keyboard) {
      content = <kbd className='bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-2 py-1 rounded text-xs font-mono'>{content}</kbd>;
    }

    if (deleteProp) {
      content = <del className='line-through'>{content}</del>;
    }

    if (copyable) {
      content = (
        <span className='inline-flex items-center space-x-1 group'>
          {content}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(children?.toString() || '');
            }}
            className='opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800'
            style={{ color: typeStyles.color }}
          >
            📋
          </button>
        </span>
      );
    }

    return content;
  };

  return (
    <span className={classNames(baseClasses, className)} style={typeStyles} onClick={onClick}>
      {renderContent()}
    </span>
  );
};

// Typography 组件的子组件
export const TypographyTitle: React.FC<Omit<ThemedTypographyProps, 'size'>> = (props) => <ThemedTypography {...props} size='title' />;

export const TypographyParagraph: React.FC<Omit<ThemedTypographyProps, 'size'>> = (props) => <ThemedTypography {...props} size='paragraph' className={classNames(props.className, 'block mb-4')} />;

export const TypographyText: React.FC<ThemedTypographyProps> = (props) => <ThemedTypography {...props} />;

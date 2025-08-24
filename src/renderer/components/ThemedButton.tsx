/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';

/**
 * 内部主题化Button组件，替换Arco Design Button
 * 完全受控于我们自己的主题系统
 */

export interface ThemedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({ children, className, variant = 'primary', size = 'medium', loading = false, icon, disabled = false, type = 'button', ...props }) => {
  const currentTheme = useCurrentTheme();

  const baseClasses = ['themed-button', 'inline-flex', 'items-center', 'justify-center', 'rounded-md', 'font-medium', 'transition-all', 'duration-200', 'cursor-pointer', 'border', 'select-none', 'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-1'];

  // 尺寸样式
  const sizeClasses = {
    small: ['px-3', 'py-1.5', 'text-sm', 'h-7'],
    medium: ['px-4', 'py-2', 'text-sm', 'h-8'],
    large: ['px-6', 'py-3', 'text-base', 'h-10'],
  };

  // 变体样式 - 基于主题系统
  const variantClasses = {
    primary: ['bg-blue-600', 'text-white', 'border-blue-600', 'hover:bg-blue-700', 'hover:border-blue-700', 'focus:ring-blue-500', 'active:bg-blue-800'],
    secondary: ['bg-gray-600', 'text-white', 'border-gray-600', 'hover:bg-gray-700', 'hover:border-gray-700', 'focus:ring-gray-500', 'active:bg-gray-800'],
    outline: ['bg-transparent', 'border-gray-300', 'hover:bg-gray-50', 'focus:ring-gray-500', 'active:bg-gray-100'],
    ghost: ['bg-transparent', 'border-transparent', 'hover:bg-gray-100', 'focus:ring-gray-500', 'active:bg-gray-200'],
    danger: ['bg-red-600', 'text-white', 'border-red-600', 'hover:bg-red-700', 'hover:border-red-700', 'focus:ring-red-500', 'active:bg-red-800'],
  };

  // 禁用和加载状态
  const stateClasses = {
    disabled: ['opacity-50', 'cursor-not-allowed', 'pointer-events-none'],
    loading: ['opacity-75', 'cursor-wait'],
  };

  const buttonClasses = classNames(
    ...baseClasses,
    ...sizeClasses[size],
    ...variantClasses[variant],
    {
      ...Object.fromEntries(stateClasses.disabled.map((cls) => [cls, disabled])),
      ...Object.fromEntries(stateClasses.loading.map((cls) => [cls, loading])),
    },
    className
  );

  return (
    <button type={type} className={buttonClasses} disabled={disabled || loading} {...props}>
      {loading && (
        <svg className='animate-spin -ml-1 mr-2 h-4 w-4' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
        </svg>
      )}
      {icon && !loading && <span className='mr-2 flex-shrink-0'>{icon}</span>}
      {children}
    </button>
  );
};

export default ThemedButton;

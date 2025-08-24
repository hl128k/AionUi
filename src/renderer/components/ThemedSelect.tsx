/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode, type SelectHTMLAttributes } from 'react';

/**
 * 内部主题化Select组件，替换Arco Design Select
 * 完全受控于我们自己的主题系统
 */

export interface SelectOption {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
}

export interface ThemedSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  options?: SelectOption[];
  size?: 'small' | 'medium' | 'large';
  variant?: 'outline' | 'filled' | 'underlined';
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  allowClear?: boolean;
  loading?: boolean;
}

export const ThemedSelect: React.FC<ThemedSelectProps> = ({ className, value, defaultValue, placeholder, disabled = false, error = false, options = [], size = 'medium', variant = 'outline', onChange, allowClear = false, loading = false, ...props }) => {
  const currentTheme = useCurrentTheme();

  const baseClasses = ['themed-select', 'w-full', 'transition-all', 'duration-200', 'outline-none', 'rounded-md', 'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-1', 'disabled:opacity-50', 'disabled:cursor-not-allowed', 'disabled:pointer-events-none', 'appearance-none', 'bg-no-repeat', 'bg-right', 'pr-10'];

  // 尺寸样式
  const sizeClasses = {
    small: ['px-3', 'py-1.5', 'text-sm', 'h-7'],
    medium: ['px-4', 'py-2', 'text-sm', 'h-8'],
    large: ['px-6', 'py-3', 'text-base', 'h-10'],
  };

  // 变体样式
  const variantClasses = {
    outline: ['border', 'bg-transparent', 'hover:border-blue-500', 'focus:border-blue-500', 'focus:ring-blue-500', error ? 'border-red-500' : 'border-gray-300'],
    filled: ['border-0', 'bg-gray-100', 'hover:bg-gray-200', 'focus:bg-gray-100', 'focus:ring-blue-500'],
    underlined: ['border-0', 'border-b-2', 'bg-transparent', 'rounded-none', 'hover:border-blue-500', 'focus:border-blue-500', 'focus:ring-0', 'focus:ring-offset-0', error ? 'border-red-500' : 'border-gray-300'],
  };

  const containerClasses = ['themed-select-container', 'relative', 'inline-flex', 'items-center', 'w-full'];

  const iconClasses = ['themed-select-icon', 'absolute', 'right-3', 'text-gray-500', 'pointer-events-none', 'z-10', 'transition-transform', 'duration-200'];

  const clearButtonClasses = ['themed-select-clear', 'absolute', 'right-8', 'text-gray-400', 'hover:text-gray-600', 'cursor-pointer', 'pointer-events-auto', 'z-10'];

  const selectClasses = classNames(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    {
      'border-red-500': error,
      'pr-16': allowClear && value,
    },
    className
  );

  const containerClassName = classNames(containerClasses, className);
  const iconClassName = classNames(iconClasses, {
    'rotate-180': loading,
  });
  const clearButtonClassName = classNames(clearButtonClasses);

  const handleClear = () => {
    const syntheticEvent = {
      target: { value: '' },
    } as React.ChangeEvent<HTMLSelectElement>;
    if (onChange) {
      onChange(syntheticEvent);
    }
  };

  return (
    <div className={containerClassName}>
      <select
        className={selectClasses}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={onChange}
        style={{
          backgroundImage: loading
            ? "url(\"data:image/svg+xml,%3Csvg class='animate-spin' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Ccircle class='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' stroke-width='4'%3E%3C/circle%3E%3Cpath class='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'%3E%3C/path%3E%3C/svg%3E\")"
            : "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
        }}
        {...props}
      >
        {placeholder && (
          <option value='' disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>

      {allowClear && value && (
        <button type='button' className={clearButtonClassName} onClick={handleClear} disabled={disabled} aria-label='Clear select'>
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>
      )}

      {!loading && (
        <div className={iconClassName}>
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
          </svg>
        </div>
      )}

      {loading && (
        <div className={iconClassName}>
          <svg className='w-4 h-4 animate-spin' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ThemedSelect;

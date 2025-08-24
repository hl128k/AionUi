/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type InputHTMLAttributes, type ReactNode } from 'react';

/**
 * 内部主题化Input组件，替换Arco Design Input
 * 完全受控于我们自己的主题系统
 */

export interface ThemedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outline' | 'filled' | 'underlined';
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  allowClear?: boolean;
}

export const ThemedInput: React.FC<ThemedInputProps> = ({ className, value, defaultValue, placeholder, disabled = false, readOnly = false, error = false, prefix, suffix, size = 'medium', variant = 'outline', onChange, onClear, allowClear = false, type = 'text', ...props }) => {
  const currentTheme = useCurrentTheme();

  const baseClasses = ['themed-input', 'w-full', 'transition-all', 'duration-200', 'outline-none', 'rounded-md', 'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-1', 'disabled:opacity-50', 'disabled:cursor-not-allowed', 'disabled:pointer-events-none'];

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

  const containerClasses = ['themed-input-container', 'relative', 'inline-flex', 'items-center', 'w-full'];

  const prefixClasses = ['themed-input-prefix', 'absolute', 'left-3', 'text-gray-500', 'pointer-events-none', 'z-10'];

  const suffixClasses = ['themed-input-suffix', 'absolute', 'right-3', 'text-gray-500', 'pointer-events-none', 'z-10'];

  const clearButtonClasses = ['themed-input-clear', 'absolute', 'right-3', 'text-gray-400', 'hover:text-gray-600', 'cursor-pointer', 'pointer-events-auto', 'z-10'];

  const inputClasses = classNames(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    {
      'pl-10': prefix,
      'pr-10': suffix || (allowClear && value),
      'pr-16': suffix && allowClear && value,
      'border-red-500': error,
    },
    className
  );

  const containerClassName = classNames(containerClasses, className);
  const prefixClassName = classNames(prefixClasses);
  const suffixClassName = classNames(suffixClasses);
  const clearButtonClassName = classNames(clearButtonClasses);

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
    // 触发onChange事件，将值设为空
    const syntheticEvent = {
      target: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>;
    if (onChange) {
      onChange(syntheticEvent);
    }
  };

  return (
    <div className={containerClassName}>
      {prefix && <div className={prefixClassName}>{prefix}</div>}

      <input type={type} className={inputClasses} value={value} defaultValue={defaultValue} placeholder={placeholder} disabled={disabled} readOnly={readOnly} onChange={onChange} {...props} />

      {allowClear && value && (
        <button type='button' className={clearButtonClassName} onClick={handleClear} disabled={disabled} aria-label='Clear input'>
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>
      )}

      {suffix && <div className={suffixClassName}>{suffix}</div>}
    </div>
  );
};

export default ThemedInput;

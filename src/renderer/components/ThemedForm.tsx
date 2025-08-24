/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

/**
 * 内部主题化Form组件，替换Arco Design Form
 * 完全受控于我们自己的主题系统
 */

export interface ThemedFormProps {
  children: ReactNode;
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'inline';
  labelAlign?: 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
  onSubmit?: (e: React.FormEvent) => void;
}

export interface ThemedFormItemProps {
  children: ReactNode;
  label?: ReactNode;
  className?: string;
  required?: boolean;
  error?: string;
  help?: ReactNode;
  layout?: 'horizontal' | 'vertical' | 'inline';
  labelAlign?: 'left' | 'right';
}

export const ThemedForm: React.FC<ThemedFormProps> = ({ children, className, layout = 'vertical', labelAlign = 'left', size = 'medium', onSubmit }) => {
  const currentTheme = useCurrentTheme();

  const formClasses = [
    'themed-form',
    'w-full',
    {
      'space-y-4': layout === 'vertical',
      'space-y-6': layout === 'vertical' && size === 'large',
      'space-y-2': layout === 'vertical' && size === 'small',
      'grid grid-cols-1 gap-4': layout === 'horizontal',
      'flex flex-wrap gap-4': layout === 'inline',
    },
  ];

  const formClassName = classNames(formClasses, className);

  return (
    <form className={formClassName} onSubmit={onSubmit} noValidate>
      {children}
    </form>
  );
};

export const ThemedFormItem: React.FC<ThemedFormItemProps> = ({ children, label, className, required = false, error, help, layout = 'vertical', labelAlign = 'left' }) => {
  const currentTheme = useCurrentTheme();

  const containerClasses = [
    'themed-form-item',
    {
      'flex flex-col space-y-1': layout === 'vertical',
      'flex items-start space-x-3': layout === 'horizontal' && labelAlign === 'left',
      'flex items-start space-x-3': layout === 'horizontal' && labelAlign === 'right',
      'flex items-center space-x-2': layout === 'inline',
    },
  ];

  const labelClasses = [
    'themed-form-item-label',
    'text-sm',
    'font-medium',
    {
      'text-gray-700 dark:text-gray-300': !error,
      'text-red-600 dark:text-red-400': error,
      'w-32 flex-shrink-0': layout === 'horizontal',
    },
  ];

  const requiredIndicator = <span className='text-red-500 ml-1'>*</span>;

  const helpClasses = ['themed-form-item-help', 'text-xs', 'text-gray-500', 'dark:text-gray-400', 'mt-1'];

  const errorClasses = ['themed-form-item-error', 'text-xs', 'text-red-600', 'dark:text-red-400', 'mt-1'];

  const containerClassName = classNames(containerClasses, className);
  const labelClassName = classNames(labelClasses);
  const helpClassName = classNames(helpClasses);
  const errorClassName = classNames(errorClasses);

  return (
    <div className={containerClassName}>
      {label && (
        <label className={labelClassName}>
          {label}
          {required && requiredIndicator}
        </label>
      )}
      <div className='flex-1'>
        {children}
        {error && <div className={errorClassName}>{error}</div>}
        {help && <div className={helpClassName}>{help}</div>}
      </div>
    </div>
  );
};

export default ThemedForm;

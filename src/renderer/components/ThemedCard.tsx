/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

/**
 * 内部主题化Card组件，替换Arco Design Card
 * 完全受控于我们自己的主题系统
 */

export interface ThemedCardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
  bordered?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  size?: 'small' | 'default' | 'large';
}

export interface ThemedCardHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  className?: string;
}

export interface ThemedCardBodyProps {
  children: ReactNode;
  className?: string;
}

export const ThemedCardHeader: React.FC<ThemedCardHeaderProps> = ({ title, subtitle, extra, className }) => {
  const currentTheme = useCurrentTheme();

  const headerClasses = ['themed-card-header', 'px-6', 'py-4', 'border-b', 'flex', 'items-center', 'justify-between'];

  const titleClasses = ['themed-card-title', 'text-lg', 'font-semibold', 'text-gray-900', 'dark:text-gray-100'];

  const subtitleClasses = ['themed-card-subtitle', 'text-sm', 'text-gray-500', 'dark:text-gray-400', 'mt-1'];

  const extraClasses = ['themed-card-extra', 'text-sm', 'text-gray-600', 'dark:text-gray-300'];

  const headerClassName = classNames(headerClasses, className);
  const titleClassName = classNames(titleClasses);
  const subtitleClassName = classNames(subtitleClasses);
  const extraClassName = classNames(extraClasses);

  return (
    <div className={headerClassName}>
      <div className='flex-1'>
        {title && <div className={titleClassName}>{title}</div>}
        {subtitle && <div className={subtitleClassName}>{subtitle}</div>}
      </div>
      {extra && <div className={extraClassName}>{extra}</div>}
    </div>
  );
};

export const ThemedCardBody: React.FC<ThemedCardBodyProps> = ({ children, className }) => {
  const bodyClasses = ['themed-card-body', 'px-6', 'py-4', 'flex-1'];

  const bodyClassName = classNames(bodyClasses, className);

  return <div className={bodyClassName}>{children}</div>;
};

export const ThemedCard: React.FC<ThemedCardProps> = ({ title, subtitle, extra, children, className, bordered = true, hoverable = false, loading = false, size = 'default' }) => {
  const currentTheme = useCurrentTheme();

  const baseClasses = ['themed-card', 'rounded-lg', 'bg-white', 'dark:bg-gray-800', 'transition-all', 'duration-200', 'overflow-hidden'];

  const sizeClasses = {
    small: ['p-4'],
    default: [],
    large: ['p-6'],
  };

  const stateClasses = {
    bordered: ['border', 'border-gray-200', 'dark:border-gray-700'],
    hoverable: ['hover:shadow-lg', 'hover:shadow-gray-200/50', 'dark:hover:shadow-gray-800/50'],
    loading: ['opacity-60', 'pointer-events-none'],
  };

  const cardClasses = classNames(baseClasses, sizeClasses[size], bordered && stateClasses.bordered, hoverable && stateClasses.hoverable, loading && stateClasses.loading, className);

  if (loading) {
    return (
      <div className={cardClasses}>
        <div className='animate-pulse'>
          <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4'></div>
          <div className='space-y-3'>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded'></div>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6'></div>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses}>
      {(title || subtitle || extra) && <ThemedCardHeader title={title} subtitle={subtitle} extra={extra} />}
      <ThemedCardBody>{children}</ThemedCardBody>
    </div>
  );
};

export default ThemedCard;

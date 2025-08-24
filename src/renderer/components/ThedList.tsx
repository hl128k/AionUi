/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

/**
 * 内部主题化List组件，替换Arco Design List
 * 完全受控于我们自己的主题系统
 */

export interface ListItem {
  key: string;
  title: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  avatar?: ReactNode;
  actions?: ReactNode[];
  disabled?: boolean;
}

export interface ThemedListProps {
  className?: string;
  items: ListItem[];
  size?: 'small' | 'medium' | 'large';
  bordered?: boolean;
  split?: boolean;
  loading?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  empty?: ReactNode;
  grid?: {
    gutter?: number;
    column?: number;
  };
  renderItem?: (item: ListItem, index: number) => ReactNode;
}

export const ThemedList: React.FC<ThemedListProps> = ({ className, items, size = 'medium', bordered = true, split = true, loading = false, header, footer, empty, grid, renderItem }) => {
  const currentTheme = useCurrentTheme();

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'p-2 space-y-1';
      case 'large':
        return 'p-4 space-y-3';
      default:
        return 'p-3 space-y-2';
    }
  };

  const getItemClasses = (disabled?: boolean) => ['themed-list-item', 'flex', 'items-center', 'p-3', 'rounded-lg', 'transition-all', 'duration-200', 'hover:bg-gray-50', 'dark:hover:bg-gray-800', disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'];

  const baseClasses = ['themed-list', 'w-full', 'rounded-lg', bordered ? 'border' : '', 'bg-white', 'dark:bg-gray-900'];

  const getGridClasses = () => {
    if (!grid) return '';

    const gutterClass = grid.gutter ? `gap-${grid.gutter}` : 'gap-4';
    const columnClass = grid.column ? `grid-cols-${grid.column}` : 'grid-cols-1';

    return `grid ${gutterClass} ${columnClass}`;
  };

  const getItemStyle = () => ({
    borderBottom: split ? `1px solid ${currentTheme.colors?.border || '#e5e7eb'}` : 'none',
    color: currentTheme.colors?.text || '#000000',
  });

  const renderDefaultItem = (item: ListItem, index: number) => (
    <div key={item.key} className={classNames(getItemClasses(item.disabled))} style={getItemStyle()}>
      {item.avatar && <div className='flex-shrink-0 mr-3'>{item.avatar}</div>}

      <div className='flex-1 min-w-0'>
        <div className='font-medium text-sm mb-1'>{item.title}</div>
        {item.description && <div className='text-xs opacity-70'>{item.description}</div>}
      </div>

      {item.extra && <div className='flex-shrink-0 ml-3'>{item.extra}</div>}
    </div>
  );

  const renderGridItem = (item: ListItem, index: number) => (
    <div
      key={item.key}
      className={classNames('themed-list-grid-item', 'p-3', 'border', 'rounded-lg', 'bg-white', 'dark:bg-gray-900', 'hover:shadow-md', 'transition-all', 'duration-200')}
      style={{
        borderColor: currentTheme.colors?.border || '#e5e7eb',
        color: currentTheme.colors?.text || '#000000',
      }}
    >
      {item.avatar && <div className='flex items-center mb-2'>{item.avatar}</div>}

      <div className='font-medium text-sm mb-1'>{item.title}</div>

      {item.description && <div className='text-xs opacity-70 mb-2'>{item.description}</div>}

      {item.extra && <div className='mt-2'>{item.extra}</div>}

      {item.actions && item.actions.length > 0 && (
        <div className='flex space-x-2 mt-2'>
          {item.actions.map((action, actionIndex) => (
            <div key={actionIndex}>{action}</div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className={classNames(baseClasses, className)}>
        <div className='flex items-center justify-center p-8'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500'></div>
          <span className='ml-2 text-sm'>加载中...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={classNames(baseClasses, className)}>
        <div className='flex items-center justify-center p-8'>
          {empty || (
            <div className='text-center'>
              <div className='text-4xl mb-2 opacity-50'>📭</div>
              <div className='text-sm opacity-70'>暂无数据</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={classNames(baseClasses, className)}>
      {header && (
        <div className='themed-list-header p-3 border-b font-medium' style={{ borderColor: currentTheme.colors?.border || '#e5e7eb' }}>
          {header}
        </div>
      )}

      {grid ? <div className={classNames('themed-list-grid', getGridClasses(), getSizeClasses())}>{items.map((item, index) => (renderItem ? renderItem(item, index) : renderGridItem(item, index)))}</div> : <div className={classNames('themed-list-items', getSizeClasses())}>{items.map((item, index) => (renderItem ? renderItem(item, index) : renderDefaultItem(item, index)))}</div>}

      {footer && (
        <div className='themed-list-footer p-3 border-t' style={{ borderColor: currentTheme.colors?.border || '#e5e7eb' }}>
          {footer}
        </div>
      )}
    </div>
  );
};

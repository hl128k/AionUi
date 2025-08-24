/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode, useState } from 'react';

/**
 * 内部主题化Tabs组件，替换Arco Design Tabs
 * 完全受控于我们自己的主题系统
 */

export interface TabItem {
  key: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  closable?: boolean;
}

export interface ThemedTabsProps {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  onTabClick?: (key: string) => void;
  onTabClose?: (key: string) => void;
  className?: string;
  tabPosition?: 'top' | 'bottom' | 'left' | 'right';
  type?: 'line' | 'card' | 'text';
  size?: 'small' | 'medium' | 'large';
}

export const ThemedTabs: React.FC<ThemedTabsProps> = ({ items, activeKey: controlledActiveKey, defaultActiveKey, onChange, onTabClick, onTabClose, className, tabPosition = 'top', type = 'line', size = 'medium' }) => {
  const currentTheme = useCurrentTheme();
  const [internalActiveKey, setInternalActiveKey] = useState(defaultActiveKey || (items.length > 0 ? items[0].key : ''));

  const activeKey = controlledActiveKey ?? internalActiveKey;

  const handleTabClick = (key: string) => {
    onTabClick?.(key);
    if (!controlledActiveKey) {
      setInternalActiveKey(key);
    }
    onChange?.(key);
  };

  const handleTabClose = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onTabClose?.(key);
  };

  const getTabPositionClasses = () => {
    const baseClasses = ['themed-tabs'];

    switch (tabPosition) {
      case 'bottom':
        return [...baseClasses, 'flex-col-reverse'];
      case 'left':
        return [...baseClasses, 'flex-row'];
      case 'right':
        return [...baseClasses, 'flex-row-reverse'];
      default:
        return [...baseClasses, 'flex-col'];
    }
  };

  const getTabSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm py-1 px-3';
      case 'large':
        return 'text-lg py-3 px-6';
      default:
        return 'text-base py-2 px-4';
    }
  };

  const getTabTypeStyles = (isActive: boolean, isDisabled: boolean) => {
    if (isDisabled) {
      return {
        backgroundColor: currentTheme.colors.disabledBg || 'rgba(0, 0, 0, 0.05)',
        color: currentTheme.colors.disabledText || 'rgba(0, 0, 0, 0.45)',
        cursor: 'not-allowed',
      };
    }

    switch (type) {
      case 'card':
        return {
          backgroundColor: isActive ? currentTheme.colors.primary || '#3b82f6' : currentTheme.colors.cardBg || '#ffffff',
          color: isActive ? currentTheme.colors.primaryText || '#ffffff' : currentTheme.colors.text || '#000000',
          border: `1px solid ${currentTheme.colors.border || '#e5e7eb'}`,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          color: isActive ? currentTheme.colors.primary || '#3b82f6' : currentTheme.colors.text || '#000000',
          borderBottom: isActive ? `2px solid ${currentTheme.colors.primary || '#3b82f6'}` : 'none',
        };
      default: // line
        return {
          backgroundColor: 'transparent',
          color: isActive ? currentTheme.colors.primary || '#3b82f6' : currentTheme.colors.text || '#000000',
          borderBottom: isActive ? `2px solid ${currentTheme.colors.primary || '#3b82f6'}` : `1px solid ${currentTheme.colors.border || '#e5e7eb'}`,
        };
    }
  };

  const activeTab = items.find((item) => item.key === activeKey);

  return (
    <div className={classNames(getTabPositionClasses(), className)}>
      {/* Tab Headers */}
      <div className={classNames('flex', tabPosition === 'left' || tabPosition === 'right' ? 'flex-col' : 'flex-row', 'border-b', tabPosition === 'top' ? 'border-b' : 'border-t', tabPosition === 'left' ? 'border-r' : '', tabPosition === 'right' ? 'border-l' : '', tabPosition === 'top' || tabPosition === 'bottom' ? 'overflow-x-auto' : 'overflow-y-auto')}>
        {items.map((item) => {
          const isActive = item.key === activeKey;
          const tabStyles = getTabTypeStyles(isActive, item.disabled || false);

          return (
            <div key={item.key} onClick={() => !item.disabled && handleTabClick(item.key)} className={classNames('themed-tab-header', 'flex', 'items-center', 'space-x-2', 'cursor-pointer', 'transition-all', 'duration-200', 'whitespace-nowrap', getTabSizeClasses(), tabPosition === 'left' || tabPosition === 'right' ? 'justify-start' : 'justify-center', isActive ? 'font-semibold' : '', item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80')} style={tabStyles}>
              <span>{item.title}</span>
              {item.closable && (
                <button onClick={(e) => handleTabClose(item.key, e)} className='ml-2 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors'>
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className='flex-1'>{activeTab && <div className='themed-tab-content p-4'>{activeTab.content}</div>}</div>
    </div>
  );
};

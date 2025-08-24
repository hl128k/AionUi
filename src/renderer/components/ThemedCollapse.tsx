/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode, useState } from 'react';

/**
 * 内部主题化Collapse组件，替换Arco Design Collapse
 * 完全受控于我们自己的主题系统
 */

export interface CollapseItem {
  key: string;
  header: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  showArrow?: boolean;
  extra?: ReactNode;
}

export interface ThemedCollapseProps {
  items: CollapseItem[];
  activeKey?: string | string[];
  defaultActiveKey?: string | string[];
  onChange?: (key: string | string[]) => void;
  className?: string;
  accordion?: boolean;
  expandIcon?: ReactNode;
  expandIconPosition?: 'left' | 'right';
  ghost?: boolean;
  bordered?: boolean;
}

export const ThemedCollapse: React.FC<ThemedCollapseProps> = ({ items, activeKey: controlledActiveKey, defaultActiveKey, onChange, className, accordion = false, expandIcon, expandIconPosition = 'left', ghost = false, bordered = true }) => {
  const currentTheme = useCurrentTheme();
  const [internalActiveKeys, setInternalActiveKeys] = useState<string[]>(Array.isArray(defaultActiveKey) ? defaultActiveKey : defaultActiveKey ? [defaultActiveKey] : []);

  const activeKeys = Array.isArray(controlledActiveKey) ? controlledActiveKey : controlledActiveKey ? [controlledActiveKey] : internalActiveKeys;

  const handleItemClick = (key: string) => {
    const isActive = activeKeys.includes(key);
    let newActiveKeys: string[];

    if (accordion) {
      newActiveKeys = isActive ? [] : [key];
    } else {
      newActiveKeys = isActive ? activeKeys.filter((k) => k !== key) : [...activeKeys, key];
    }

    if (!controlledActiveKey) {
      setInternalActiveKeys(newActiveKeys);
    }
    onChange?.(accordion ? newActiveKeys[0] || '' : newActiveKeys);
  };

  const baseClasses = ['themed-collapse', 'w-full', 'rounded-lg', 'overflow-hidden'];

  const itemClasses = ['themed-collapse-item', 'border-b', 'last:border-b-0'];

  const headerClasses = ['themed-collapse-header', 'flex', 'items-center', 'justify-between', 'p-4', 'cursor-pointer', 'transition-all', 'duration-200', 'hover:bg-gray-50', 'dark:hover:bg-gray-800'];

  const contentClasses = ['themed-collapse-content', 'p-4', 'border-t', 'bg-gray-50', 'dark:bg-gray-800'];

  const getArrowIcon = (isActive: boolean) => {
    if (expandIcon) {
      return expandIcon;
    }
    return <span className={classNames('transform', 'transition-transform', 'duration-200', isActive ? 'rotate-180' : '')}>▼</span>;
  };

  const getItemStyle = (isActive: boolean) => ({
    backgroundColor: ghost ? 'transparent' : currentTheme.colors.cardBg || '#ffffff',
    borderColor: bordered ? currentTheme.colors.border || '#e5e7eb' : 'transparent',
  });

  const getHeaderStyle = (isActive: boolean) => ({
    backgroundColor: isActive ? currentTheme.colors.primaryBg || 'rgba(59, 130, 246, 0.1)' : 'transparent',
    color: isActive ? currentTheme.colors.primary || '#3b82f6' : currentTheme.colors.text || '#000000',
  });

  return (
    <div className={classNames(baseClasses, ghost ? 'bg-transparent' : 'bg-white dark:bg-gray-900', bordered ? 'border' : '', className)}>
      {items.map((item) => {
        const isActive = activeKeys.includes(item.key);

        return (
          <div key={item.key} className={classNames(itemClasses)} style={getItemStyle(isActive)}>
            <div className={classNames(headerClasses)} style={getHeaderStyle(isActive)} onClick={() => !item.disabled && handleItemClick(item.key)}>
              <div className='flex items-center space-x-2'>
                {expandIconPosition === 'left' && item.showArrow !== false && <div className='transform transition-transform duration-200'>{getArrowIcon(isActive)}</div>}
                <span className={item.disabled ? 'opacity-50' : ''}>{item.header}</span>
              </div>
              <div className='flex items-center space-x-2'>
                {item.extra}
                {expandIconPosition === 'right' && item.showArrow !== false && <div className='transform transition-transform duration-200'>{getArrowIcon(isActive)}</div>}
              </div>
            </div>

            {isActive && (
              <div
                className={classNames(contentClasses)}
                style={{
                  borderColor: currentTheme.colors.border || '#e5e7eb',
                  color: currentTheme.colors.text || '#000000',
                }}
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

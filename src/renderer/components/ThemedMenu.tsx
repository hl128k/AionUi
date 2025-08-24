/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type CSSProperties, type ReactNode } from 'react';

/**
 * 内部主题化Menu组件，替换Arco Design Menu
 * 完全受控于我们自己的主题系统
 */

interface ThemedMenuProps {
  children: ReactNode;
  mode?: 'vertical' | 'horizontal';
  className?: string;
  style?: CSSProperties;
  selectedKeys?: string[];
  onClickMenuItem?: (key: string) => void;
}

interface ThemedMenuItemProps {
  children: ReactNode;
  key: string;
  className?: string;
  style?: CSSProperties;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * 主题化Menu容器
 */
export const ThemedMenu: React.FC<ThemedMenuProps> & {
  Item: React.FC<ThemedMenuItemProps>;
} = ({ children, mode = 'vertical', className, style, selectedKeys = [], onClickMenuItem }) => {
  const currentTheme = useCurrentTheme();

  return (
    <nav
      className={classNames(
        'themed-menu',
        'o-slider-menu', // 保持样式集类名
        {
          'themed-menu--vertical': mode === 'vertical',
          'themed-menu--horizontal': mode === 'horizontal',
        },
        'flex',
        mode === 'vertical' ? 'flex-col' : 'flex-row',
        className
      )}
      style={style}
      role='navigation'
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === ThemedMenuItem) {
          return React.cloneElement(child as React.ReactElement<ThemedMenuItemProps>, {
            ...child.props,
            onClick: () => {
              onClickMenuItem?.(child.props.key);
              child.props.onClick?.();
            },
            className: classNames(child.props.className, {
              'themed-menu-item--selected': selectedKeys.includes(child.props.key),
            }),
          });
        }
        return child;
      })}
    </nav>
  );
};

/**
 * 主题化MenuItem菜单项
 * 完全基于CSS变量和样式集控制主题
 */
const ThemedMenuItem: React.FC<ThemedMenuItemProps> = ({ children, key, className, style, icon, disabled = false, onClick }) => {
  const currentTheme = useCurrentTheme();

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={classNames(
        'themed-menu-item',
        'o-slider-menu', // 保持样式集类名以应用主题
        'flex',
        'items-center',
        'px-4',
        'py-3',
        'cursor-pointer',
        'transition-all',
        'duration-200',
        'select-none',
        {
          'themed-menu-item--disabled': disabled,
          'opacity-50 cursor-not-allowed': disabled,
        },
        className
      )}
      style={style}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role='menuitem'
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      {icon && <span className='themed-menu-item__icon mr-3 flex-shrink-0'>{icon}</span>}
      <span className='themed-menu-item__text flex-1'>{children}</span>
    </div>
  );
};

// 绑定子组件
ThemedMenu.Item = ThemedMenuItem;

export default ThemedMenu;

/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

/**
 * 内部主题化Dropdown组件，替换Arco Design Dropdown
 * 完全受控于我们自己的主题系统
 */

export interface DropdownOption {
  key: string;
  label: ReactNode;
  value?: any;
  disabled?: boolean;
  divided?: boolean;
  icon?: ReactNode;
  children?: DropdownOption[];
}

export type DropdownTrigger = 'click' | 'hover' | 'contextMenu';
export type DropdownPosition = 'top' | 'bottom' | 'left' | 'right';
export type DropdownSize = 'small' | 'medium' | 'large';

export interface ThemedDropdownProps {
  className?: string;
  children: ReactNode;
  options: DropdownOption[];
  trigger?: DropdownTrigger;
  position?: DropdownPosition;
  size?: DropdownSize;
  disabled?: boolean;
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  onSelect?: (key: string, option: DropdownOption) => void;
  onClick?: (key: string, option: DropdownOption) => void;
  popupClassName?: string;
  popupStyle?: React.CSSProperties;
  getPopupContainer?: () => HTMLElement;
  destroyOnHide?: boolean;
}

export const ThemedDropdown: React.FC<ThemedDropdownProps> = ({ className, children, options, trigger = 'click', position = 'bottom', size = 'medium', disabled = false, visible, defaultVisible = false, onVisibleChange, onSelect, onClick, popupClassName, popupStyle, getPopupContainer, destroyOnHide = false }) => {
  const currentTheme = useCurrentTheme();
  const [internalVisible, setInternalVisible] = React.useState(defaultVisible);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (visible !== undefined) {
      setInternalVisible(visible);
    }
  }, [visible]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setInternalVisible(false);
        onVisibleChange?.(false);
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      if (trigger === 'contextMenu' && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setInternalVisible(false);
        onVisibleChange?.(false);
      }
    };

    if (internalVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('contextmenu', handleContextMenu);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [internalVisible, trigger, onVisibleChange]);

  const handleTrigger = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    if (trigger === 'click') {
      const newVisible = !internalVisible;
      setInternalVisible(newVisible);
      onVisibleChange?.(newVisible);
    }
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover' && !disabled) {
      setInternalVisible(true);
      onVisibleChange?.(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover' && !disabled) {
      setInternalVisible(false);
      onVisibleChange?.(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (trigger === 'contextMenu' && !disabled) {
      setInternalVisible(true);
      onVisibleChange?.(true);
    }
  };

  const handleOptionClick = (option: DropdownOption, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (option.disabled) return;

    onSelect?.(option.key, option);
    onClick?.(option.key, option);

    if (trigger !== 'hover') {
      setInternalVisible(false);
      onVisibleChange?.(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm py-1';
      case 'large':
        return 'text-base py-2';
      default:
        return 'text-sm py-1.5';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-2';
      case 'bottom':
        return 'top-full mt-2';
      case 'left':
        return 'right-full mr-2';
      case 'right':
        return 'left-full ml-2';
      default:
        return 'top-full mt-2';
    }
  };

  const renderOptions = (options: DropdownOption[], level = 0) => {
    return options.map((option, index) => {
      const isLast = index === options.length - 1;

      return (
        <React.Fragment key={option.key}>
          <div
            className={classNames('themed-dropdown-option', 'flex items-center px-3 cursor-pointer transition-all duration-200', 'hover:opacity-80', option.disabled ? 'opacity-50 cursor-not-allowed' : '', level > 0 ? 'pl-6' : '', getSizeClasses())}
            style={{
              color: option.disabled ? currentTheme.colors?.disabledText : currentTheme.colors?.text,
              backgroundColor: 'transparent',
            }}
            onClick={(e) => handleOptionClick(option, e)}
          >
            {option.icon && <span className='mr-2'>{option.icon}</span>}
            <span className='flex-1'>{option.label}</span>
            {option.children && (
              <span className='ml-2' style={{ color: currentTheme.colors?.textSecondary }}>
                ›
              </span>
            )}
          </div>
          {option.divided && !isLast && (
            <div
              className='my-1 mx-3'
              style={{
                borderTop: `1px solid ${currentTheme.colors?.border}`,
                backgroundColor: currentTheme.colors?.border,
              }}
            />
          )}
          {option.children && internalVisible && <div className='themed-dropdown-submenu'>{renderOptions(option.children, level + 1)}</div>}
        </React.Fragment>
      );
    });
  };

  const renderMenu = () => {
    if (!internalVisible) return null;

    const menuContent = (
      <div
        ref={menuRef}
        className={classNames('themed-dropdown-menu', 'absolute z-50 min-w-[200px] py-1 border rounded-lg shadow-xl', 'overflow-hidden', getPositionClasses(), popupClassName)}
        style={{
          backgroundColor: currentTheme.colors?.cardBg,
          borderColor: currentTheme.colors?.border,
          ...popupStyle,
        }}
      >
        {renderOptions(options)}
      </div>
    );

    if (getPopupContainer) {
      const container = getPopupContainer();
      if (container) {
        return React.createPortal(menuContent, container);
      }
    }

    return menuContent;
  };

  const triggerProps: React.HTMLAttributes<HTMLDivElement> = {
    ref: dropdownRef,
    className: classNames('themed-dropdown-trigger', 'inline-block', className),
  };

  if (trigger === 'click') {
    triggerProps.onClick = handleTrigger;
  } else if (trigger === 'hover') {
    triggerProps.onMouseEnter = handleMouseEnter;
    triggerProps.onMouseLeave = handleMouseLeave;
  } else if (trigger === 'contextMenu') {
    triggerProps.onContextMenu = handleContextMenu;
  }

  return (
    <div {...triggerProps}>
      {children}
      {renderMenu()}
    </div>
  );
};

// Dropdown 组件的子组件
export const DropdownButton: React.FC<Omit<ThemedDropdownProps, 'children'>> = (props) => {
  return (
    <ThemedDropdown {...props}>
      <button
        className='px-4 py-2 rounded-lg border transition-all duration-200 hover:shadow-md'
        style={{
          backgroundColor: props.currentTheme?.colors?.cardBg,
          borderColor: props.currentTheme?.colors?.border,
          color: props.currentTheme?.colors?.text,
        }}
      >
        下拉菜单
      </button>
    </ThemedDropdown>
  );
};

export const DropdownMenu: React.FC<ThemedDropdownProps> = (props) => <ThemedDropdown {...props} />;

/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

/**
 * 内部主题化Tooltip组件，替换Arco Design Tooltip
 * 完全受控于我们自己的主题系统
 */

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'click' | 'focus';
export type TooltipSize = 'small' | 'medium' | 'large';

export interface ThemedTooltipProps {
  className?: string;
  children: ReactNode;
  content: ReactNode;
  title?: ReactNode;
  position?: TooltipPosition;
  trigger?: TooltipTrigger;
  size?: TooltipSize;
  disabled?: boolean;
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  popupClassName?: string;
  popupStyle?: React.CSSProperties;
  getPopupContainer?: () => HTMLElement;
  destroyOnHide?: boolean;
  delay?: number;
  color?: string;
  backgroundColor?: string;
  maxWidth?: number;
  minWidth?: number;
}

export const ThemedTooltip: React.FC<ThemedTooltipProps> = ({ className, children, content, title, position = 'top', trigger = 'hover', size = 'medium', disabled = false, visible, defaultVisible = false, onVisibleChange, popupClassName, popupStyle, getPopupContainer, destroyOnHide = false, delay = 0, color, backgroundColor, maxWidth = 300, minWidth = 100 }) => {
  const currentTheme = useCurrentTheme();
  const [internalVisible, setInternalVisible] = React.useState(defaultVisible);
  const [isHovering, setIsHovering] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (visible !== undefined) {
      setInternalVisible(visible);
    }
  }, [visible]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node) && contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setInternalVisible(false);
        onVisibleChange?.(false);
      }
    };

    if (internalVisible && trigger === 'click') {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [internalVisible, trigger, onVisibleChange]);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setInternalVisible(true);
        onVisibleChange?.(true);
      }, delay);
    } else {
      setInternalVisible(true);
      onVisibleChange?.(true);
    }
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setInternalVisible(false);
    onVisibleChange?.(false);
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    setIsHovering(true);
    if (trigger === 'hover') {
      showTooltip();
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (trigger === 'hover') {
      hideTooltip();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();

    if (trigger === 'click') {
      const newVisible = !internalVisible;
      setInternalVisible(newVisible);
      onVisibleChange?.(newVisible);
    }
  };

  const handleFocus = () => {
    if (disabled) return;
    if (trigger === 'focus') {
      showTooltip();
    }
  };

  const handleBlur = () => {
    if (disabled) return;
    if (trigger === 'focus') {
      hideTooltip();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-xs px-2 py-1';
      case 'large':
        return 'text-base px-3 py-2';
      default:
        return 'text-sm px-2.5 py-1.5';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2';
    }
  };

  const renderTooltip = () => {
    if (!internalVisible || disabled) return null;

    const tooltipContent = (
      <div
        ref={contentRef}
        className={classNames('themed-tooltip-content', 'absolute z-50 rounded-lg shadow-xl', 'transition-all duration-200', getPositionClasses(), getSizeClasses(), popupClassName)}
        style={{
          backgroundColor: backgroundColor || currentTheme.colors?.cardBg || '#1f2937',
          color: color || currentTheme.colors?.white || '#ffffff',
          borderColor: currentTheme.colors?.border,
          maxWidth,
          minWidth,
          ...popupStyle,
        }}
        onMouseEnter={() => {
          if (trigger === 'hover') {
            setIsHovering(true);
          }
        }}
        onMouseLeave={() => {
          if (trigger === 'hover') {
            setIsHovering(false);
            hideTooltip();
          }
        }}
      >
        {/* 箭头 */}
        <div
          className={classNames('themed-tooltip-arrow', 'absolute w-0 h-0 border-4 border-transparent', getArrowClasses())}
          style={{
            borderTopColor: position === 'bottom' ? backgroundColor || currentTheme.colors?.cardBg || '#1f2937' : 'transparent',
            borderBottomColor: position === 'top' ? backgroundColor || currentTheme.colors?.cardBg || '#1f2937' : 'transparent',
            borderLeftColor: position === 'right' ? backgroundColor || currentTheme.colors?.cardBg || '#1f2937' : 'transparent',
            borderRightColor: position === 'left' ? backgroundColor || currentTheme.colors?.cardBg || '#1f2937' : 'transparent',
          }}
        />

        {/* 标题 */}
        {title && (
          <div className='font-medium mb-1 border-b pb-1' style={{ borderColor: currentTheme.colors?.border }}>
            {title}
          </div>
        )}

        {/* 内容 */}
        <div className='themed-tooltip-body'>{content}</div>
      </div>
    );

    if (getPopupContainer) {
      const container = getPopupContainer();
      if (container) {
        return React.createPortal(tooltipContent, container);
      }
    }

    return tooltipContent;
  };

  return (
    <div ref={tooltipRef} className={classNames('themed-tooltip', 'relative inline-block', className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick} onFocus={handleFocus} onBlur={handleBlur}>
      {children}
      {renderTooltip()}
    </div>
  );
};

// Tooltip 组件的子组件
export const TooltipTitle: React.FC<Omit<ThemedTooltipProps, 'title'>> = (props) => <ThemedTooltip {...props} />;

export const TooltipContent: React.FC<ThemedTooltipProps> = (props) => <ThemedTooltip {...props} />;

// 常用预设
export const InfoTooltip: React.FC<Omit<ThemedTooltipProps, 'color' | 'backgroundColor'>> = (props) => <ThemedTooltip {...props} color='#3b82f6' backgroundColor='#dbeafe' />;

export const SuccessTooltip: React.FC<Omit<ThemedTooltipProps, 'color' | 'backgroundColor'>> = (props) => <ThemedTooltip {...props} color='#10b981' backgroundColor='#d1fae5' />;

export const WarningTooltip: React.FC<Omit<ThemedTooltipProps, 'color' | 'backgroundColor'>> = (props) => <ThemedTooltip {...props} color='#f59e0b' backgroundColor='#fef3c7' />;

export const ErrorTooltip: React.FC<Omit<ThemedTooltipProps, 'color' | 'backgroundColor'>> = (props) => <ThemedTooltip {...props} color='#ef4444' backgroundColor='#fee2e2' />;

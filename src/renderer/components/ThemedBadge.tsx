/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

/**
 * 内部主题化Badge组件，替换Arco Design Badge
 * 完全受控于我们自己的主题系统
 */

export type BadgeStatus = 'default' | 'success' | 'processing' | 'error' | 'warning';

export interface ThemedBadgeProps {
  className?: string;
  count?: ReactNode;
  dot?: boolean;
  status?: BadgeStatus;
  text?: ReactNode;
  color?: string;
  offset?: [number, number];
  children?: ReactNode;
  maxCount?: number;
  showZero?: boolean;
  size?: 'small' | 'default';
}

export const ThemedBadge: React.FC<ThemedBadgeProps> = ({ className, count, dot = false, status, text, color, offset, children, maxCount, showZero = false, size = 'default' }) => {
  const currentTheme = useCurrentTheme();

  const getStatusColor = () => {
    if (color) return color;

    switch (status) {
      case 'success':
        return currentTheme.colors.success || '#34d399';
      case 'processing':
        return currentTheme.colors.primary || '#3b82f6';
      case 'error':
        return currentTheme.colors.error || '#ef4444';
      case 'warning':
        return currentTheme.colors.warning || '#fbbf24';
      default:
        return currentTheme.colors.primary || '#3b82f6';
    }
  };

  const getStatusStyles = () => {
    const statusColor = getStatusColor();

    if (dot) {
      return {
        backgroundColor: statusColor,
        width: size === 'small' ? '6px' : '8px',
        height: size === 'small' ? '6px' : '8px',
      };
    }

    return {
      backgroundColor: statusColor,
      color: '#ffffff',
      minWidth: size === 'small' ? '16px' : '20px',
      height: size === 'small' ? '16px' : '20px',
      fontSize: size === 'small' ? '10px' : '12px',
    };
  };

  const formatCount = () => {
    if (count === undefined) return null;

    const countNum = Number(count);
    if (isNaN(countNum)) return count;

    if (maxCount !== undefined && countNum > maxCount) {
      return `${maxCount}+`;
    }

    if (countNum === 0 && !showZero) {
      return null;
    }

    return countNum.toString();
  };

  const baseClasses = ['themed-badge', 'relative', 'inline-flex', 'items-center', 'justify-center'];

  const badgeClasses = ['themed-badge-count', 'absolute', 'flex', 'items-center', 'justify-center', 'rounded-full', 'font-semibold', 'text-xs', 'border-2', 'border-white', 'dark:border-gray-900', 'transform', '-translate-y-1/2', 'translate-x-1/2', 'top-0', 'right-0', 'z-10'];

  const dotClasses = ['themed-badge-dot', 'absolute', 'rounded-full', 'border-2', 'border-white', 'dark:border-gray-900', 'transform', '-translate-y-1/2', 'translate-x-1/2', 'top-0', 'right-0', 'z-10'];

  const statusClasses = ['themed-badge-status', 'inline-flex', 'items-center', 'space-x-1'];

  const statusDotClasses = ['themed-badge-status-dot', 'rounded-full', 'inline-block'];

  const getBadgeStyle = () => {
    const style = getStatusStyles();
    if (offset) {
      const [x, y] = offset;
      style.transform = `translate(${x}px, ${y}px)`;
    }
    return style;
  };

  const displayCount = formatCount();

  if (status && text) {
    return (
      <div className={classNames(statusClasses, className)}>
        <span
          className={classNames(statusDotClasses)}
          style={{
            backgroundColor: getStatusColor(),
            width: '6px',
            height: '6px',
          }}
        />
        <span style={{ color: currentTheme.colors.text || '#000000' }}>{text}</span>
      </div>
    );
  }

  if (children) {
    return (
      <div className={classNames(baseClasses, className)}>
        {children}
        {dot && <span className={classNames(dotClasses)} style={getBadgeStyle()} />}
        {!dot && displayCount !== null && (
          <span className={classNames(badgeClasses, size === 'small' ? 'text-xs' : 'text-sm')} style={getBadgeStyle()}>
            {displayCount}
          </span>
        )}
      </div>
    );
  }

  if (dot) {
    return <span className={classNames(dotClasses)} style={getBadgeStyle()} />;
  }

  if (displayCount !== null) {
    return (
      <span className={classNames(badgeClasses, size === 'small' ? 'text-xs' : 'text-sm')} style={getBadgeStyle()}>
        {displayCount}
      </span>
    );
  }

  return null;
};

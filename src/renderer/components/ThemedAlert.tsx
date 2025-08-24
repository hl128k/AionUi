/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

/**
 * 内部主题化Alert组件，替换Arco Design Alert
 * 完全受控于我们自己的主题系统
 */

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface ThemedAlertProps {
  type?: AlertType;
  title?: ReactNode;
  content?: ReactNode;
  className?: string;
  closable?: boolean;
  showIcon?: boolean;
  icon?: ReactNode;
  action?: ReactNode;
  onClose?: () => void;
}

export const ThemedAlert: React.FC<ThemedAlertProps> = ({ type = 'info', title, content, className, closable = false, showIcon = true, icon, action, onClose }) => {
  const currentTheme = useCurrentTheme();
  const [visible, setVisible] = React.useState(true);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: currentTheme.colors.successBg || 'rgba(52, 211, 153, 0.1)',
          borderColor: currentTheme.colors.success || '#34d399',
          textColor: currentTheme.colors.successText || '#065f46',
          icon: '✓',
        };
      case 'warning':
        return {
          bgColor: currentTheme.colors.warningBg || 'rgba(251, 191, 36, 0.1)',
          borderColor: currentTheme.colors.warning || '#fbbf24',
          textColor: currentTheme.colors.warningText || '#92400e',
          icon: '⚠',
        };
      case 'error':
        return {
          bgColor: currentTheme.colors.errorBg || 'rgba(239, 68, 68, 0.1)',
          borderColor: currentTheme.colors.error || '#ef4444',
          textColor: currentTheme.colors.errorText || '#991b1b',
          icon: '✕',
        };
      default:
        return {
          bgColor: currentTheme.colors.infoBg || 'rgba(59, 130, 246, 0.1)',
          borderColor: currentTheme.colors.info || '#3b82f6',
          textColor: currentTheme.colors.infoText || '#1e40af',
          icon: 'ℹ',
        };
    }
  };

  const typeStyles = getTypeStyles();

  const baseClasses = ['themed-alert', 'p-4', 'rounded-lg', 'border', 'flex', 'items-start', 'space-x-3', 'transition-all', 'duration-200', 'animate-in', 'fade-in', 'slide-in-from-top-2'];

  const style = {
    backgroundColor: typeStyles.bgColor,
    borderColor: typeStyles.borderColor,
    color: typeStyles.textColor,
  };

  return (
    <div className={classNames(baseClasses, className)} style={style}>
      {showIcon && <div className='flex-shrink-0 text-lg'>{icon || typeStyles.icon}</div>}
      <div className='flex-1 min-w-0'>
        {title && <div className='font-semibold mb-1'>{title}</div>}
        {content && <div className='text-sm opacity-90'>{content}</div>}
      </div>
      {action && <div className='flex-shrink-0 ml-2'>{action}</div>}
      {closable && (
        <button onClick={handleClose} className='flex-shrink-0 ml-2 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors' style={{ color: typeStyles.textColor }}>
          ✕
        </button>
      )}
    </div>
  );
};

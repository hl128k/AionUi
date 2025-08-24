/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

/**
 * 内部主题化Spin组件，替换Arco Design Spin
 * 完全受控于我们自己的主题系统
 */

export interface ThemedSpinProps {
  className?: string;
  spinning?: boolean;
  size?: 'small' | 'medium' | 'large';
  tip?: ReactNode;
  delay?: number;
  children?: ReactNode;
}

export const ThemedSpin: React.FC<ThemedSpinProps> = ({ className, spinning = true, size = 'medium', tip, delay = 0, children }) => {
  const currentTheme = useCurrentTheme();
  const [showSpin, setShowSpin] = React.useState(false);

  React.useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShowSpin(spinning);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setShowSpin(spinning);
    }
  }, [spinning, delay]);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return '16px';
      case 'large':
        return '32px';
      default:
        return '24px';
    }
  };

  const baseClasses = ['themed-spin', 'inline-flex', 'items-center', 'justify-center'];

  const spinnerClasses = ['themed-spin-spinner', 'animate-spin', 'rounded-full', 'border-2', 'border-t-transparent'];

  const containerClasses = ['themed-spin-container', 'relative', 'inline-block'];

  const overlayClasses = ['themed-spin-overlay', 'absolute', 'inset-0', 'flex', 'items-center', 'justify-center', 'bg-white', 'dark:bg-gray-900', 'bg-opacity-80', 'dark:bg-opacity-80', 'z-10'];

  const spinnerStyle = {
    borderTopColor: currentTheme.colors.primary || '#3b82f6',
    width: getSpinnerSize(),
    height: getSpinnerSize(),
  };

  const Spinner = (
    <div className={classNames(spinnerClasses, getSizeClasses())} style={spinnerStyle}>
      <svg className='w-full h-full' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeDasharray='31.416' strokeDashoffset='31.416' className='opacity-25' />
        <path d='M12 2C17.523 2 22 6.477 22 12' stroke='currentColor' strokeWidth='2' strokeLinecap='round' className='opacity-75' />
      </svg>
    </div>
  );

  if (children) {
    return (
      <div className={classNames(containerClasses, className)}>
        {children}
        {showSpin && (
          <div className={classNames(overlayClasses)}>
            <div className='flex flex-col items-center space-y-2'>
              {Spinner}
              {tip && (
                <div className='text-sm' style={{ color: currentTheme.colors.text || '#000000' }}>
                  {tip}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!showSpin) {
    return null;
  }

  return (
    <div className={classNames(baseClasses, className)}>
      <div className='flex flex-col items-center space-y-2'>
        {Spinner}
        {tip && (
          <div className='text-sm' style={{ color: currentTheme.colors.text || '#000000' }}>
            {tip}
          </div>
        )}
      </div>
    </div>
  );
};

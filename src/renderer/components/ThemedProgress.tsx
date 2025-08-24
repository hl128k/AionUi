/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

/**
 * 内部主题化Progress组件，替换Arco Design Progress
 * 完全受控于我们自己的主题系统
 */

export type ProgressType = 'line' | 'circle' | 'dashboard';
export type ProgressSize = 'small' | 'medium' | 'large';
export type ProgressStatus = 'normal' | 'success' | 'error' | 'warning';

export interface ThemedProgressProps {
  className?: string;
  type?: ProgressType;
  percent?: number;
  size?: ProgressSize;
  status?: ProgressStatus;
  showText?: boolean;
  formatText?: (percent: number) => ReactNode;
  strokeColor?: string;
  trailColor?: string;
  strokeWidth?: number;
  width?: number;
  style?: React.CSSProperties;
  children?: ReactNode;
}

export const ThemedProgress: React.FC<ThemedProgressProps> = ({
  className,
  type = 'line',
  percent = 0,
  size = 'medium',
  status = 'normal',
  showText = true,
  formatText,
  strokeColor,
  trailColor,
  strokeWidth,
  width = 120,
  style,
  children,
}) => {
  const currentTheme = useCurrentTheme();

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return currentTheme.colors?.success || '#10b981';
      case 'error':
        return currentTheme.colors?.error || '#ef4444';
      case 'warning':
        return currentTheme.colors?.warning || '#f59e0b';
      default:
        return strokeColor || currentTheme.colors?.primary || '#3b82f6';
    }
  };

  const getStrokeWidth = () => {
    if (strokeWidth) return strokeWidth;
    
    switch (size) {
      case 'small':
        return type === 'line' ? 6 : 8;
      case 'large':
        return type === 'line' ? 12 : 16;
      default:
        return type === 'line' ? 8 : 12;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return type === 'line' ? 'h-1' : '';
      case 'large':
        return type === 'line' ? 'h-4' : '';
      default:
        return type === 'line' ? 'h-2' : '';
    }
  };

  const formatProgressText = (value: number) => {
    if (formatText) {
      return formatText(value);
    }
    return `${value}%`;
  };

  const renderLineProgress = () => {
    const strokeWidth = getStrokeWidth();
    const color = getStatusColor();
    const trail = trailColor || currentTheme.colors?.border || '#e5e7eb';

    return (
      <div className={classNames('themed-progress-line', 'w-full', getSizeClasses(), className)}>
        <div
          className='themed-progress-outer relative overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'
          style={{ height: `${strokeWidth}px` }}
        >
          <div
            className='themed-progress-inner absolute top-0 left-0 h-full rounded-full transition-all duration-300 ease-out'
            style={{
              width: `${Math.min(Math.max(percent, 0), 100)}%`,
              backgroundColor: color,
            }}
          />
        </div>
        
        {showText && (
          <div
            className='themed-progress-text mt-1 text-sm font-medium'
            style={{ color: currentTheme.colors?.text }}
          >
            {formatProgressText(percent)}
          </div>
        )}
        
        {children && (
          <div className='themed-progress-children mt-2'>
            {children}
          </div>
        )}
      </div>
    );
  };

  const renderCircleProgress = () => {
    const strokeWidth = getStrokeWidth();
    const color = getStatusColor();
    const trail = trailColor || currentTheme.colors?.border || '#e5e7eb';
    const radius = (width - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference * (1 - Math.min(Math.max(percent, 0), 100) / 100);

    return (
      <div
        className={classNames('themed-progress-circle', 'relative inline-flex flex-col items-center justify-center', className)}
        style={{ width: `${width}px`, height: `${width}px` }}
      >
        <svg width={width} height={width} className='transform -rotate-90'>
          {/* 背景圆环 */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill='none'
            stroke={trail}
            strokeWidth={strokeWidth}
            strokeLinecap='round'
          />
          {/* 进度圆环 */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill='none'
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap='round'
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className='transition-all duration-300 ease-out'
          />
        </svg>
        
        {showText && (
          <div
            className='themed-progress-text absolute inset-0 flex items-center justify-center text-sm font-medium'
            style={{ color: currentTheme.colors?.text }}
          >
            {formatProgressText(percent)}
          </div>
        )}
        
        {children && (
          <div className='themed-progress-children mt-2'>
            {children}
          </div>
        )}
      </div>
    );
  };

  const renderDashboardProgress = () => {
    const strokeWidth = getStrokeWidth();
    const color = getStatusColor();
    const trail = trailColor || currentTheme.colors?.border || '#e5e7eb';
    const radius = (width - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference * (1 - Math.min(Math.max(percent, 0), 100) / 100);

    return (
      <div
        className={classNames('themed-progress-dashboard', 'relative inline-flex flex-col items-center justify-center', className)}
        style={{ width: `${width}px`, height: `${width / 2}px` }}
      >
        <svg width={width} height={width / 2} className='transform' viewBox={`0 0 ${width} ${width / 2}`}>
          {/* 背景圆弧 */}
          <path
            d={`M ${strokeWidth / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - strokeWidth / 2} ${width / 2}`}
            fill='none'
            stroke={trail}
            strokeWidth={strokeWidth}
            strokeLinecap='round'
          />
          {/* 进度圆弧 */}
          <path
            d={`M ${strokeWidth / 2} ${width / 2} A ${radius} ${radius} 0 0 1 ${width - strokeWidth / 2} ${width / 2}`}
            fill='none'
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap='round'
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className='transition-all duration-300 ease-out'
          />
        </svg>
        
        {showText && (
          <div
            className='themed-progress-text absolute bottom-0 left-1/2 transform -translate-x-1/2 text-sm font-medium'
            style={{ color: currentTheme.colors?.text }}
          >
            {formatProgressText(percent)}
          </div>
        )}
        
        {children && (
          <div className='themed-progress-children mt-2">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={classNames('themed-progress', 'inline-block')} style={style}>
      {type === 'line' && renderLineProgress()}
      {type === 'circle' && renderCircleProgress()}
      {type === 'dashboard' && renderDashboardProgress()}
    </div>
  );
};

// Progress 组件的子组件
export const ProgressLine: React.FC<Omit<ThemedProgressProps, 'type'>> = (props) => (
  <ThemedProgress {...props} type='line' />
);

export const ProgressCircle: React.FC<Omit<ThemedProgressProps, 'type'>> = (props) => (
  <ThemedProgress {...props} type='circle' />
);

export const ProgressDashboard: React.FC<Omit<ThemedProgressProps, 'type'>> = (props) => (
  <ThemedProgress {...props} type='dashboard' />
);

// 常用预设
export const SuccessProgress: React.FC<Omit<ThemedProgressProps, 'status'>> = (props) => (
  <ThemedProgress {...props} status='success' />
);

export const ErrorProgress: React.FC<Omit<ThemedProgressProps, 'status'>> = (props) => (
  <ThemedProgress {...props} status='error' />
);

export const WarningProgress: React.FC<Omit<ThemedProgressProps, 'status'>> = (props) => (
  <ThemedProgress {...props} status='warning' />
);

// 小型进度条
export const MiniProgress: React.FC<Omit<ThemedProgressProps, 'size' | 'showText'>> = (props) => (
  <ThemedProgress {...props} size='small' showText={false} />
);

// 大型进度条
export const LargeProgress: React.FC<Omit<ThemedProgressProps, 'size'>> = (props) => (
  <ThemedProgress {...props} size='large' />
);
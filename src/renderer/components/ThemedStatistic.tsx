/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Statistic组件，替换Arco Design Statistic
 * 完全受控于我们自己的主题系统
 */

export type StatisticSize = 'small' | 'medium' | 'large';
export type StatisticStatus = 'success' | 'error' | 'warning' | 'normal';

export interface ThemedStatisticProps {
  className?: string;
  title?: React.ReactNode;
  value?: React.ReactNode;
  valueStyle?: React.CSSProperties;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  precision?: number;
  decimalSeparator?: string;
  groupSeparator?: string;
  formatter?: (value: number) => React.ReactNode;
  status?: StatisticStatus;
  size?: StatisticSize;
  loading?: boolean;
  style?: React.CSSProperties;
}

export const ThemedStatistic: React.FC<ThemedStatisticProps> = ({ className, title, value, valueStyle, prefix, suffix, precision, decimalSeparator = '.', groupSeparator = ',', formatter, status = 'normal', size = 'medium', loading = false, style }) => {
  const currentTheme = useCurrentTheme();

  const formatValue = (val: any): React.ReactNode => {
    if (val === null || val === undefined) {
      return '-';
    }

    if (typeof val === 'number') {
      if (formatter) {
        return formatter(val);
      }

      const formattedValue = precision !== undefined ? val.toFixed(precision) : val.toString();
      const [integerPart, decimalPart] = formattedValue.split('.');

      // 添加千位分隔符
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);

      return decimalPart ? `${formattedInteger}${decimalSeparator}${decimalPart}` : formattedInteger;
    }

    return val;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return currentTheme.colors?.success || '#10b981';
      case 'error':
        return currentTheme.colors?.error || '#ef4444';
      case 'warning':
        return currentTheme.colors?.warning || '#f59e0b';
      default:
        return currentTheme.colors?.text || '#1f2937';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          title: 'text-sm',
          value: 'text-lg font-semibold',
          container: 'p-3',
        };
      case 'large':
        return {
          title: 'text-base',
          value: 'text-2xl font-bold',
          container: 'p-6',
        };
      default:
        return {
          title: 'text-sm',
          value: 'text-xl font-semibold',
          container: 'p-4',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const renderValue = () => {
    if (loading) {
      return <div className={classNames('themed-statistic-loading', 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded', sizeClasses.value.replace('font-semibold', ''))} style={{ width: '100px', height: '1.5em' }} />;
    }

    const formattedValue = formatValue(value);
    const statusColor = getStatusColor();

    return (
      <div className='themed-statistic-value-wrapper flex items-baseline'>
        {prefix && (
          <span className='themed-statistic-prefix mr-1' style={{ color: statusColor }}>
            {prefix}
          </span>
        )}
        <span
          className={classNames('themed-statistic-value', sizeClasses.value)}
          style={{
            color: statusColor,
            ...valueStyle,
          }}
        >
          {formattedValue}
        </span>
        {suffix && (
          <span className='themed-statistic-suffix ml-1' style={{ color: statusColor }}>
            {suffix}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className={classNames('themed-statistic', 'border rounded-lg transition-colors', 'hover:shadow-md', sizeClasses.container, className)}
      style={{
        borderColor: currentTheme.colors?.border,
        backgroundColor: currentTheme.colors?.cardBg,
        ...style,
      }}
    >
      {title && (
        <div className={classNames('themed-statistic-title', 'mb-2', sizeClasses.title)} style={{ color: currentTheme.colors?.textSecondary }}>
          {title}
        </div>
      )}
      {renderValue()}
    </div>
  );
};

// Statistic 组件的子组件
export const CountUp: React.FC<{
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
  separator?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ start = 0, end, duration = 2000, decimals = 0, separator = ',', prefix, suffix, className, style }) => {
  const currentTheme = useCurrentTheme();
  const [count, setCount] = React.useState(start);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentCount = start + (end - start) * progress;

      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [start, end, duration]);

  const formattedCount = count.toFixed(decimals);
  const [integerPart, decimalPart] = formattedCount.split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return (
    <span className={className} style={style}>
      {prefix}
      {decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger}
      {suffix}
    </span>
  );
};

export const StatisticCard: React.FC<{
  title: React.ReactNode;
  value: React.ReactNode;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ title, value, icon, trend, trendValue, className, style }) => {
  const currentTheme = useCurrentTheme();

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <span style={{ color: currentTheme.colors?.success }}>▲</span>;
      case 'down':
        return <span style={{ color: currentTheme.colors?.error }}>▼</span>;
      default:
        return <span style={{ color: currentTheme.colors?.textSecondary }}>➡</span>;
    }
  };

  return (
    <div
      className={classNames('themed-statistic-card', 'p-4 border rounded-lg hover:shadow-md transition-colors', className)}
      style={{
        borderColor: currentTheme.colors?.border,
        backgroundColor: currentTheme.colors?.cardBg,
        ...style,
      }}
    >
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center'>
          {icon && (
            <span className='mr-2' style={{ color: currentTheme.colors?.primary }}>
              {icon}
            </span>
          )}
          <div className='text-sm font-medium' style={{ color: currentTheme.colors?.textSecondary }}>
            {title}
          </div>
        </div>
        {(trend || trendValue) && (
          <div className='flex items-center text-xs' style={{ color: currentTheme.colors?.textSecondary }}>
            {getTrendIcon()}
            {trendValue && <span className='ml-1'>{trendValue}</span>}
          </div>
        )}
      </div>
      <div className='text-2xl font-bold' style={{ color: currentTheme.colors?.text }}>
        {value}
      </div>
    </div>
  );
};

export const SuccessStatistic: React.FC<Omit<ThemedStatisticProps, 'status'>> = (props) => <ThemedStatistic {...props} status='success' />;

export const ErrorStatistic: React.FC<Omit<ThemedStatisticProps, 'status'>> = (props) => <ThemedStatistic {...props} status='error' />;

export const WarningStatistic: React.FC<Omit<ThemedStatisticProps, 'status'>> = (props) => <ThemedStatistic {...props} status='warning' />;

export const SmallStatistic: React.FC<Omit<ThemedStatisticProps, 'size'>> = (props) => <ThemedStatistic {...props} size='small' />;

export const LargeStatistic: React.FC<Omit<ThemedStatisticProps, 'size'>> = (props) => <ThemedStatistic {...props} size='large' />;

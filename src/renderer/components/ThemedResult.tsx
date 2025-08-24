/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Result组件，替换Arco Design Result
 * 完全受控于我们自己的主题系统
 */

export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500';
export type ResultSize = 'small' | 'medium' | 'large';

export interface ThemedResultProps {
  className?: string;
  status?: ResultStatus;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  size?: ResultSize;
  style?: React.CSSProperties;
}

export const ThemedResult: React.FC<ThemedResultProps> = ({ className, status = 'info', title, subTitle, icon, extra, size = 'medium', style }) => {
  const currentTheme = useCurrentTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: icon || '✓',
          color: currentTheme.colors?.success || '#10b981',
          bgColor: currentTheme.colors?.success + '10' || '#10b98120',
          defaultTitle: '成功',
          defaultSubTitle: '操作成功完成',
        };
      case 'error':
        return {
          icon: icon || '✕',
          color: currentTheme.colors?.error || '#ef4444',
          bgColor: currentTheme.colors?.error + '10' || '#ef444420',
          defaultTitle: '错误',
          defaultSubTitle: '操作过程中发生错误',
        };
      case 'warning':
        return {
          icon: icon || '⚠',
          color: currentTheme.colors?.warning || '#f59e0b',
          bgColor: currentTheme.colors?.warning + '10' || '#f59e0b20',
          defaultTitle: '警告',
          defaultSubTitle: '请注意查看相关信息',
        };
      case '404':
        return {
          icon: icon || '404',
          color: currentTheme.colors?.error || '#ef4444',
          bgColor: currentTheme.colors?.error + '10' || '#ef444420',
          defaultTitle: '404',
          defaultSubTitle: '抱歉，您访问的页面不存在',
        };
      case '403':
        return {
          icon: icon || '403',
          color: currentTheme.colors?.warning || '#f59e0b',
          bgColor: currentTheme.colors?.warning + '10' || '#f59e0b20',
          defaultTitle: '403',
          defaultSubTitle: '抱歉，您没有权限访问此页面',
        };
      case '500':
        return {
          icon: icon || '500',
          color: currentTheme.colors?.error || '#ef4444',
          bgColor: currentTheme.colors?.error + '10' || '#ef444420',
          defaultTitle: '500',
          defaultSubTitle: '抱歉，服务器出现错误',
        };
      default:
        return {
          icon: icon || 'ℹ',
          color: currentTheme.colors?.primary || '#3b82f6',
          bgColor: currentTheme.colors?.primary + '10' || '#3b82f620',
          defaultTitle: '信息',
          defaultSubTitle: '请查看相关信息',
        };
    }
  };

  const statusConfig = getStatusConfig();

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          icon: 'w-12 h-12 text-2xl',
          title: 'text-lg',
          subTitle: 'text-sm',
          container: 'p-6',
        };
      case 'large':
        return {
          icon: 'w-20 h-20 text-4xl',
          title: 'text-xl',
          subTitle: 'text-base',
          container: 'p-12',
        };
      default:
        return {
          icon: 'w-16 h-16 text-3xl',
          title: 'text-lg',
          subTitle: 'text-sm',
          container: 'p-8',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div
      className={classNames('themed-result', 'flex flex-col items-center justify-center text-center', 'border rounded-lg', sizeClasses.container, className)}
      style={{
        borderColor: currentTheme.colors?.border,
        backgroundColor: currentTheme.colors?.cardBg,
        ...style,
      }}
    >
      {/* 图标 */}
      <div
        className={classNames('themed-result-icon', 'flex items-center justify-center rounded-full mb-4', sizeClasses.icon)}
        style={{
          backgroundColor: statusConfig.bgColor,
          color: statusConfig.color,
        }}
      >
        {statusConfig.icon}
      </div>

      {/* 标题 */}
      {title && (
        <div className={classNames('themed-result-title', 'font-semibold mb-2', sizeClasses.title)} style={{ color: currentTheme.colors?.text }}>
          {title}
        </div>
      )}

      {/* 副标题 */}
      {subTitle && (
        <div className={classNames('themed-result-subtitle', 'mb-4', sizeClasses.subTitle)} style={{ color: currentTheme.colors?.textSecondary }}>
          {subTitle}
        </div>
      )}

      {/* 额外内容 */}
      {extra && <div className='themed-result-extra mt-4'>{extra}</div>}
    </div>
  );
};

// Result 组件的子组件
export const SuccessResult: React.FC<Omit<ThemedResultProps, 'status'>> = (props) => <ThemedResult {...props} status='success' />;

export const ErrorResult: React.FC<Omit<ThemedResultProps, 'status'>> = (props) => <ThemedResult {...props} status='error' />;

export const WarningResult: React.FC<Omit<ThemedResultProps, 'status'>> = (props) => <ThemedResult {...props} status='warning' />;

export const InfoResult: React.FC<Omit<ThemedResultProps, 'status'>> = (props) => <ThemedResult {...props} status='info' />;

export const NotFoundResult: React.FC<Omit<ThemedResultProps, 'status'>> = (props) => <ThemedResult {...props} status='404' />;

export const ForbiddenResult: React.FC<Omit<ThemedResultProps, 'status'>> = (props) => <ThemedResult {...props} status='403' />;

export const ServerErrorResult: React.FC<Omit<ThemedResultProps, 'status'>> = (props) => <ThemedResult {...props} status='500' />;

export const SmallResult: React.FC<Omit<ThemedResultProps, 'size'>> = (props) => <ThemedResult {...props} size='small' />;

export const LargeResult: React.FC<Omit<ThemedResultProps, 'size'>> = (props) => <ThemedResult {...props} size='large' />;

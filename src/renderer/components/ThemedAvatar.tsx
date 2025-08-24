/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

/**
 * 内部主题化Avatar组件，替换Arco Design Avatar
 * 完全受控于我们自己的主题系统
 */

export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge' | number;
export type AvatarShape = 'circle' | 'square';
export type AvatarTriggerType = 'button' | 'mask';

export interface ThemedAvatarProps {
  className?: string;
  children?: ReactNode;
  src?: string;
  alt?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  trigger?: ReactNode;
  triggerType?: AvatarTriggerType;
  triggerIcon?: ReactNode;
  triggerStyle?: React.CSSProperties;
  onClick?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
  autoFixFontSize?: boolean;
}

export const ThemedAvatar: React.FC<ThemedAvatarProps> = ({ className, children, src, alt, size = 'medium', shape = 'circle', trigger, triggerType = 'button', triggerIcon, triggerStyle, onClick, onError, style, autoFixFontSize = true }) => {
  const currentTheme = useCurrentTheme();
  const [imgError, setImgError] = React.useState(false);
  const [imgLoaded, setImgLoaded] = React.useState(false);

  const handleImgError = () => {
    setImgError(true);
    setImgLoaded(false);
    onError?.();
  };

  const handleImgLoad = () => {
    setImgError(false);
    setImgLoaded(true);
  };

  const getSizeClasses = () => {
    if (typeof size === 'number') {
      return {
        width: `${size}px`,
        height: `${size}px`,
        fontSize: autoFixFontSize ? `${Math.max(12, size / 3)}px` : undefined,
      };
    }

    switch (size) {
      case 'small':
        return {
          width: '24px',
          height: '24px',
          fontSize: '12px',
        };
      case 'large':
        return {
          width: '48px',
          height: '48px',
          fontSize: '18px',
        };
      case 'xlarge':
        return {
          width: '64px',
          height: '64px',
          fontSize: '24px',
        };
      default:
        return {
          width: '32px',
          height: '32px',
          fontSize: '14px',
        };
    }
  };

  const getShapeClasses = () => {
    switch (shape) {
      case 'square':
        return 'rounded-lg';
      default:
        return 'rounded-full';
    }
  };

  const getTriggerClasses = () => {
    switch (triggerType) {
      case 'mask':
        return 'absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200';
      default:
        return 'absolute -bottom-1 -right-1 bg-white border-2 rounded-full flex items-center justify-center cursor-pointer hover:shadow-md transition-all duration-200';
    }
  };

  const sizeStyles = getSizeClasses();
  const shapeClasses = getShapeClasses();
  const triggerClasses = getTriggerClasses();

  const renderContent = () => {
    if (src && !imgError) {
      return <img src={src} alt={alt} className='w-full h-full object-cover' style={{ borderRadius: shape === 'circle' ? '50%' : '0.5rem' }} onError={handleImgError} onLoad={handleImgLoad} />;
    }

    if (children) {
      return (
        <div
          className='w-full h-full flex items-center justify-center font-medium select-none'
          style={{
            color: currentTheme.colors?.text,
            fontSize: sizeStyles.fontSize,
          }}
        >
          {children}
        </div>
      );
    }

    // 默认用户图标
    return (
      <div className='w-full h-full flex items-center justify-center' style={{ color: currentTheme.colors?.textSecondary }}>
        <svg className='w-1/2 h-1/2' fill='currentColor' viewBox='0 0 24 24'>
          <path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
        </svg>
      </div>
    );
  };

  return (
    <div
      className={classNames('themed-avatar', 'relative inline-flex items-center justify-center', 'bg-gray-100 dark:bg-gray-800 border', 'overflow-hidden', 'transition-all duration-200', 'hover:shadow-md', shapeClasses, className)}
      style={{
        ...sizeStyles,
        borderColor: currentTheme.colors?.border,
        backgroundColor: currentTheme.colors?.cardBg,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onClick={onClick}
    >
      {renderContent()}

      {trigger && (
        <div
          className={classNames('themed-avatar-trigger', triggerClasses)}
          style={{
            borderColor: currentTheme.colors?.border,
            backgroundColor: triggerType === 'button' ? currentTheme.colors?.cardBg : undefined,
            ...triggerStyle,
          }}
        >
          {triggerIcon || trigger}
        </div>
      )}
    </div>
  );
};

// Avatar 组件的子组件
export const AvatarGroup: React.FC<{
  className?: string;
  children: ReactNode;
  maxCount?: number;
  maxStyle?: React.CSSProperties;
  size?: AvatarSize;
  shape?: AvatarShape;
  style?: React.CSSProperties;
}> = ({ className, children, maxCount, maxStyle, size, shape, style }) => {
  const currentTheme = useCurrentTheme();
  const childrenArray = React.Children.toArray(children);

  const visibleChildren = maxCount ? childrenArray.slice(0, maxCount) : childrenArray;
  const extraCount = maxCount ? Math.max(0, childrenArray.length - maxCount) : 0;

  return (
    <div className={classNames('themed-avatar-group', 'flex items-center', className)} style={style}>
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          className={classNames('themed-avatar-group-item', index > 0 ? '-ml-2' : '', 'border-2', 'transition-all duration-200 hover:z-10 hover:scale-105')}
          style={{
            borderColor: currentTheme.colors?.cardBg,
          }}
        >
          {child}
        </div>
      ))}

      {extraCount > 0 && (
        <ThemedAvatar
          size={size}
          shape={shape}
          style={{
            ...maxStyle,
            marginLeft: '-8px',
          }}
        >
          +{extraCount}
        </ThemedAvatar>
      )}
    </div>
  );
};

// 常用预设
export const UserAvatar: React.FC<Omit<ThemedAvatarProps, 'children' | 'src'>> = (props) => (
  <ThemedAvatar {...props}>
    <svg className='w-1/2 h-1/2' fill='currentColor' viewBox='0 0 24 24'>
      <path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
    </svg>
  </ThemedAvatar>
);

export const TeamAvatar: React.FC<Omit<ThemedAvatarProps, 'children' | 'src'>> = (props) => (
  <ThemedAvatar {...props}>
    <svg className='w-1/2 h-1/2' fill='currentColor' viewBox='0 0 24 24'>
      <path d='M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' />
    </svg>
  </ThemedAvatar>
);

export const BotAvatar: React.FC<Omit<ThemedAvatarProps, 'children' | 'src'>> = (props) => (
  <ThemedAvatar {...props}>
    <svg className='w-1/2 h-1/2' fill='currentColor' viewBox='0 0 24 24'>
      <path d='M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zm6 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zM14 17H8v-2h6v2z' />
    </svg>
  </ThemedAvatar>
);

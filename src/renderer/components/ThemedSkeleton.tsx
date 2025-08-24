/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Skeleton组件，替换Arco Design Skeleton
 * 完全受控于我们自己的主题系统
 */

export type SkeletonSize = 'small' | 'medium' | 'large';
export type SkeletonAnimation = 'wave' | 'pulse' | 'none';
export type SkeletonShape = 'circle' | 'square' | 'round';

export interface ThemedSkeletonProps {
  className?: string;
  loading?: boolean;
  active?: boolean;
  round?: boolean;
  size?: SkeletonSize;
  shape?: SkeletonShape;
  animation?: SkeletonAnimation;
  paragraph?: boolean | { rows: number; width: number | string };
  title?: boolean | { width: number | string };
  avatar?: boolean | { size: number | string; shape: SkeletonShape };
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const ThemedSkeleton: React.FC<ThemedSkeletonProps> = ({ className, loading = true, active = true, round = false, size = 'medium', shape = 'square', animation = 'wave', paragraph = true, title = true, avatar = false, children, style }) => {
  const currentTheme = useCurrentTheme();

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const getAnimationClasses = () => {
    if (!active || animation === 'none') return '';

    switch (animation) {
      case 'wave':
        return 'animate-pulse';
      case 'pulse':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  const renderSkeletonItem = (width?: number | string, height?: number | string, customShape?: SkeletonShape) => {
    const finalShape = customShape || shape;

    return (
      <div
        className={classNames('themed-skeleton-item', getAnimationClasses(), finalShape === 'circle' && 'rounded-full', (finalShape === 'round' || round) && 'rounded-lg', finalShape === 'square' && 'rounded', 'bg-gray-200 dark:bg-gray-700')}
        style={{
          width: width || '100%',
          height: height || '1em',
          backgroundColor: currentTheme.colors?.border,
          borderRadius: finalShape === 'circle' ? '50%' : finalShape === 'round' || round ? '0.5rem' : '0.25rem',
        }}
      />
    );
  };

  const renderAvatar = () => {
    if (!avatar) return null;

    const avatarConfig = typeof avatar === 'boolean' ? {} : avatar;
    const avatarSize = avatarConfig.size || (size === 'small' ? 32 : size === 'large' ? 64 : 48);
    const avatarShape = avatarConfig.shape || 'circle';

    return <div className='themed-skeleton-avatar mr-4'>{renderSkeletonItem(avatarSize, avatarSize, avatarShape)}</div>;
  };

  const renderTitle = () => {
    if (!title) return null;

    const titleConfig = typeof title === 'boolean' ? {} : title;
    const titleWidth = titleConfig.width || (size === 'small' ? '60%' : size === 'large' ? '80%' : '70%');

    return <div className='themed-skeleton-title mb-2'>{renderSkeletonItem(titleWidth, '1.2em')}</div>;
  };

  const renderParagraph = () => {
    if (!paragraph) return null;

    const paragraphConfig = typeof paragraph === 'boolean' ? { rows: 3, width: '100%' } : paragraph;
    const { rows = 3, width = '100%' } = paragraphConfig;

    return (
      <div className='themed-skeleton-paragraph space-y-2'>
        {Array.from({ length: rows }).map((_, index) => {
          const isLast = index === rows - 1;
          const itemWidth = isLast && typeof width === 'number' ? `${width * 0.6}%` : width;

          return <div key={index}>{renderSkeletonItem(itemWidth, '1em')}</div>;
        })}
      </div>
    );
  };

  const renderSkeletonContent = () => (
    <div className={classNames('themed-skeleton-content', 'flex', getSizeClasses(), className)} style={style}>
      {renderAvatar()}
      <div className='flex-1'>
        {renderTitle()}
        {renderParagraph()}
      </div>
    </div>
  );

  if (!loading) {
    return <>{children}</>;
  }

  return renderSkeletonContent();
};

// Skeleton 组件的子组件
export const SkeletonAvatar: React.FC<{
  size?: number | string;
  shape?: SkeletonShape;
  className?: string;
  style?: React.CSSProperties;
}> = ({ size = 48, shape = 'circle', className, style }) => {
  const currentTheme = useCurrentTheme();

  return (
    <div
      className={classNames('themed-skeleton-avatar', 'animate-pulse bg-gray-200 dark:bg-gray-700', shape === 'circle' && 'rounded-full', shape === 'round' && 'rounded-lg', shape === 'square' && 'rounded', className)}
      style={{
        width: size,
        height: size,
        backgroundColor: currentTheme.colors?.border,
        borderRadius: shape === 'circle' ? '50%' : shape === 'round' ? '0.5rem' : '0.25rem',
        ...style,
      }}
    />
  );
};

export const SkeletonButton: React.FC<{
  size?: SkeletonSize;
  shape?: SkeletonShape;
  block?: boolean;
  className?: string;
  style?: React.CSSProperties;
}> = ({ size = 'medium', shape = 'round', block = false, className, style }) => {
  const currentTheme = useCurrentTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: '80px', height: '28px' };
      case 'large':
        return { width: '120px', height: '40px' };
      default:
        return { width: '100px', height: '32px' };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <div
      className={classNames('themed-skeleton-button', 'animate-pulse bg-gray-200 dark:bg-gray-700', shape === 'circle' && 'rounded-full', shape === 'round' && 'rounded-lg', shape === 'square' && 'rounded', block && 'w-full', className)}
      style={{
        ...sizeStyles,
        backgroundColor: currentTheme.colors?.border,
        borderRadius: shape === 'circle' ? '50%' : shape === 'round' ? '0.5rem' : '0.25rem',
        ...style,
      }}
    />
  );
};

export const SkeletonInput: React.FC<{
  size?: SkeletonSize;
  block?: boolean;
  className?: string;
  style?: React.CSSProperties;
}> = ({ size = 'medium', block = false, className, style }) => {
  const currentTheme = useCurrentTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { height: '28px' };
      case 'large':
        return { height: '40px' };
      default:
        return { height: '32px' };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <div
      className={classNames('themed-skeleton-input', 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded', block && 'w-full', className)}
      style={{
        ...sizeStyles,
        backgroundColor: currentTheme.colors?.border,
        ...style,
      }}
    />
  );
};

export const SkeletonImage: React.FC<{
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ width = '100%', height = 200, className, style }) => {
  const currentTheme = useCurrentTheme();

  return (
    <div
      className={classNames('themed-skeleton-image', 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded', className)}
      style={{
        width,
        height,
        backgroundColor: currentTheme.colors?.border,
        ...style,
      }}
    />
  );
};

// 常用预设
export const CardSkeleton: React.FC<{
  avatar?: boolean;
  title?: boolean;
  paragraph?: boolean;
  className?: string;
  style?: React.CSSProperties;
}> = ({ avatar = true, title = true, paragraph = true, className, style }) => (
  <div className='p-4 border rounded-lg' style={{ borderColor: 'currentColor' }}>
    <ThemedSkeleton avatar={avatar} title={title} paragraph={paragraph} className={className} style={style} />
  </div>
);

export const ListSkeleton: React.FC<{
  rows?: number;
  avatar?: boolean;
  className?: string;
  style?: React.CSSProperties;
}> = ({ rows = 3, avatar = true, className, style }) => (
  <div className='space-y-4' style={style}>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className='flex items-center p-2 border rounded' style={{ borderColor: 'currentColor' }}>
        <ThemedSkeleton avatar={avatar} title={{ width: '60%' }} paragraph={false} className={className} />
      </div>
    ))}
  </div>
);

export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ rows = 5, columns = 4, className, style }) => (
  <div className='space-y-2' style={style}>
    {/* 表头 */}
    <div className='flex space-x-2 pb-2 border-b' style={{ borderColor: 'currentColor' }}>
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className='flex-1'>
          <ThemedSkeleton avatar={false} title={{ width: '80%' }} paragraph={false} className={className} />
        </div>
      ))}
    </div>
    {/* 表体 */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className='flex space-x-2 py-2'>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={colIndex} className='flex-1'>
            <ThemedSkeleton avatar={false} title={{ width: colIndex === 0 ? '60%' : '80%' }} paragraph={false} className={className} />
          </div>
        ))}
      </div>
    ))}
  </div>
);

export const FormSkeleton: React.FC<{
  inputs?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ inputs = 4, className, style }) => (
  <div className='space-y-4' style={style}>
    {Array.from({ length: inputs }).map((_, index) => (
      <div key={index}>
        <div className='mb-2'>
          <ThemedSkeleton avatar={false} title={{ width: '30%' }} paragraph={false} className={className} />
        </div>
        <ThemedSkeletonInput size='medium' className={className} />
      </div>
    ))}
    <div className='flex space-x-4'>
      <ThemedSkeletonButton size='medium' className={className} />
      <ThemedSkeletonButton size='medium' className={className} />
    </div>
  </div>
);

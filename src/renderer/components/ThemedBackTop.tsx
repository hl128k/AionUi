/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化BackTop组件，替换Arco Design BackTop
 * 完全受控于我们自己的主题系统
 */

export type BackTopShape = 'circle' | 'square';
export type BackTopPosition = 'fixed' | 'absolute';
export type BackTopPlacement = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export interface ThemedBackTopProps {
  className?: string;
  target?: () => HTMLElement | Window;
  visibilityHeight?: number;
  onClick?: (e: React.MouseEvent) => void;
  duration?: number;
  shape?: BackTopShape;
  placement?: BackTopPlacement;
  position?: BackTopPosition;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const ThemedBackTop: React.FC<ThemedBackTopProps> = ({ className, target, visibilityHeight = 400, onClick, duration = 450, shape = 'circle', placement = 'bottom-right', position = 'fixed', style, children, disabled = false }) => {
  const currentTheme = useCurrentTheme();
  const [visible, setVisible] = React.useState(false);
  const [isScrolling, setIsScrolling] = React.useState(false);

  React.useEffect(() => {
    const getScrollTarget = () => target?.() || window;
    const scrollTarget = getScrollTarget();

    const handleScroll = () => {
      if (disabled) return;

      let scrollTop = 0;
      if (scrollTarget === window) {
        scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      } else {
        scrollTop = (scrollTarget as HTMLElement).scrollTop;
      }

      setVisible(scrollTop >= visibilityHeight);
    };

    scrollTarget.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
    };
  }, [target, visibilityHeight, disabled]);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();

    if (disabled) return;

    const getScrollTarget = () => target?.() || window;
    const scrollTarget = getScrollTarget();

    setIsScrolling(true);

    const startTime = performance.now();
    const startScrollTop = scrollTarget === window ? document.documentElement.scrollTop || document.body.scrollTop : (scrollTarget as HTMLElement).scrollTop;

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic 缓动函数
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const scrollTop = startScrollTop * (1 - easeProgress);

      if (scrollTarget === window) {
        window.scrollTo(0, scrollTop);
      } else {
        (scrollTarget as HTMLElement).scrollTop = scrollTop;
      }

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        setIsScrolling(false);
        if (scrollTarget === window) {
          window.scrollTo(0, 0);
        } else {
          (scrollTarget as HTMLElement).scrollTop = 0;
        }
      }
    };

    requestAnimationFrame(animateScroll);
    onClick?.(e);
  };

  const getPlacementClasses = () => {
    const baseClasses = [];

    switch (placement) {
      case 'bottom-right':
        baseClasses.push('bottom-8', 'right-8');
        break;
      case 'bottom-left':
        baseClasses.push('bottom-8', 'left-8');
        break;
      case 'top-right':
        baseClasses.push('top-8', 'right-8');
        break;
      case 'top-left':
        baseClasses.push('top-8', 'left-8');
        break;
    }

    return baseClasses;
  };

  const getShapeClasses = () => {
    const baseClasses = [];

    switch (shape) {
      case 'circle':
        baseClasses.push('rounded-full');
        break;
      case 'square':
        baseClasses.push('rounded-lg');
        break;
    }

    return baseClasses;
  };

  if (!visible) return null;

  return (
    <button
      className={classNames('themed-back-top', 'flex items-center justify-center', 'transition-all duration-300 ease-in-out', 'hover:scale-110 active:scale-95', 'shadow-lg hover:shadow-xl', 'focus:outline-none focus:ring-2 focus:ring-offset-2', position === 'fixed' ? 'fixed' : 'absolute', 'z-50', getPlacementClasses(), getShapeClasses(), disabled && 'opacity-50 cursor-not-allowed', className)}
      style={{
        width: shape === 'circle' ? '48px' : '48px',
        height: shape === 'circle' ? '48px' : '48px',
        backgroundColor: currentTheme.colors?.primary,
        color: currentTheme.colors?.white,
        borderColor: currentTheme.colors?.primary,
        boxShadow: `0 4px 12px ${currentTheme.colors?.primary}33`,
        ...style,
      }}
      onClick={scrollToTop}
      disabled={disabled || isScrolling}
      title={isScrolling ? '返回顶部中...' : '返回顶部'}
    >
      {children || (
        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' style={{ color: currentTheme.colors?.white }}>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 10l7-7m0 0l7 7m-7-7v18' />
        </svg>
      )}
    </button>
  );
};

// BackTop 子组件
export const CircleBackTop: React.FC<Omit<ThemedBackTopProps, 'shape'>> = (props) => <ThemedBackTop {...props} shape='circle' />;

export const SquareBackTop: React.FC<Omit<ThemedBackTopProps, 'shape'>> = (props) => <ThemedBackTop {...props} shape='square' />;

export const BottomRightBackTop: React.FC<Omit<ThemedBackTopProps, 'placement'>> = (props) => <ThemedBackTop {...props} placement='bottom-right' />;

export const BottomLeftBackTop: React.FC<Omit<ThemedBackTopProps, 'placement'>> = (props) => <ThemedBackTop {...props} placement='bottom-left' />;

// 预设配置
export const QuickBackTop: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className, style }) => (
  <ThemedBackTop visibilityHeight={200} duration={300} shape='circle' placement='bottom-right' className={className} style={style}>
    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 10l7-7m0 0l7 7m-7-7v18' />
    </svg>
  </ThemedBackTop>
);

export const MinimalBackTop: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className, style }) => (
  <ThemedBackTop visibilityHeight={100} duration={200} shape='square' placement='bottom-right' className={classNames('text-xs', className)} style={style}>
    TOP
  </ThemedBackTop>
);

export const CustomBackTop: React.FC<{
  icon?: React.ReactNode;
  text?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ icon, text, className, style }) => (
  <ThemedBackTop visibilityHeight={300} duration={400} shape='square' placement='bottom-right' className={classNames('flex flex-col items-center', className)} style={style}>
    {icon || (
      <svg className='w-4 h-4 mb-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 10l7-7m0 0l7 7m-7-7v18' />
      </svg>
    )}
    {text || '顶部'}
  </ThemedBackTop>
);

// BackTop 工具函数
export const useBackTop = (options?: { visibilityHeight?: number; duration?: number; target?: () => HTMLElement | Window }) => {
  const [visible, setVisible] = React.useState(false);
  const [isScrolling, setIsScrolling] = React.useState(false);

  React.useEffect(() => {
    const getScrollTarget = () => options?.target?.() || window;
    const scrollTarget = getScrollTarget();

    const handleScroll = () => {
      let scrollTop = 0;
      if (scrollTarget === window) {
        scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      } else {
        scrollTop = (scrollTarget as HTMLElement).scrollTop;
      }

      setVisible(scrollTop >= (options?.visibilityHeight || 400));
    };

    scrollTarget.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
    };
  }, [options?.visibilityHeight, options?.target]);

  const scrollToTop = () => {
    const getScrollTarget = () => options?.target?.() || window;
    const scrollTarget = getScrollTarget();

    setIsScrolling(true);

    const startTime = performance.now();
    const startScrollTop = scrollTarget === window ? document.documentElement.scrollTop || document.body.scrollTop : (scrollTarget as HTMLElement).scrollTop;

    const duration = options?.duration || 450;

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const scrollTop = startScrollTop * (1 - easeProgress);

      if (scrollTarget === window) {
        window.scrollTo(0, scrollTop);
      } else {
        (scrollTarget as HTMLElement).scrollTop = scrollTop;
      }

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        setIsScrolling(false);
        if (scrollTarget === window) {
          window.scrollTo(0, 0);
        } else {
          (scrollTarget as HTMLElement).scrollTop = 0;
        }
      }
    };

    requestAnimationFrame(animateScroll);
  };

  return {
    visible,
    isScrolling,
    scrollToTop,
  };
};

// 容器组件 - 为特定容器提供返回顶部功能
export const ContainerBackTop: React.FC<{
  containerRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
  backTopProps?: Omit<ThemedBackTopProps, 'target'>;
  className?: string;
  style?: React.CSSProperties;
}> = ({ containerRef, children, backTopProps, className, style }) => {
  const target = () => containerRef.current || window;

  return (
    <div className={classNames('relative', className)} style={style}>
      {children}
      <ThemedBackTop {...backTopProps} target={target} position='absolute' />
    </div>
  );
};

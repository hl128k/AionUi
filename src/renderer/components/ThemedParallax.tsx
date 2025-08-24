/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Parallax组件，替换Arco Design Parallax
 * 完全受控于我们自己的主题系统
 */

export type ParallaxSpeed = number;
export type ParallaxDirection = 'up' | 'down' | 'left' | 'right';
export type ParallaxOverflow = 'visible' | 'hidden' | 'scroll';

export interface ThemedParallaxProps {
  className?: string;
  children: React.ReactNode;
  speed?: ParallaxSpeed;
  direction?: ParallaxDirection;
  overflow?: ParallaxOverflow;
  style?: React.CSSProperties;
  onScroll?: (scrollProgress: number) => void;
  disabled?: boolean;
}

export const ThemedParallax: React.FC<ThemedParallaxProps> = ({ className, children, speed = 0.5, direction = 'up', overflow = 'visible', style, onScroll, disabled = false }) => {
  const currentTheme = useCurrentTheme();
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const parallaxRef = React.useRef<HTMLDivElement>(null);
  const childRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (disabled) return;

    const updateParallax = () => {
      if (!parallaxRef.current || !childRef.current) return;

      const rect = parallaxRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // 计算元素在视口中的位置
      const elementTop = rect.top;
      const elementHeight = rect.height;

      // 计算滚动进度 (0-1)
      let progress = 0;

      if (elementTop < windowHeight && elementTop + elementHeight > 0) {
        // 元素在视口中
        const visibleHeight = Math.min(elementHeight, windowHeight - elementTop);
        const totalHeight = elementHeight;
        progress = Math.max(0, Math.min(1, visibleHeight / totalHeight));
      } else if (elementTop >= windowHeight) {
        // 元素在视口下方
        progress = 0;
      } else {
        // 元素在视口上方
        progress = 1;
      }

      setScrollProgress(progress);
      onScroll?.(progress);

      // 计算视差偏移
      const maxOffset = elementHeight * speed;
      let offset = 0;

      switch (direction) {
        case 'up':
          offset = (1 - progress) * maxOffset;
          break;
        case 'down':
          offset = progress * maxOffset;
          break;
        case 'left':
          offset = (1 - progress) * maxOffset;
          break;
        case 'right':
          offset = progress * maxOffset;
          break;
      }

      // 应用变换
      if (childRef.current) {
        const transform = direction === 'up' || direction === 'down' ? `translateY(${offset}px)` : `translateX(${offset}px)`;

        childRef.current.style.transform = transform;
      }
    };

    window.addEventListener('scroll', updateParallax);
    window.addEventListener('resize', updateParallax);
    updateParallax();

    return () => {
      window.removeEventListener('scroll', updateParallax);
      window.removeEventListener('resize', updateParallax);
    };
  }, [speed, direction, disabled, onScroll]);

  return (
    <div
      ref={parallaxRef}
      className={classNames('themed-parallax', 'relative', 'overflow-hidden', className)}
      style={{
        overflow,
        ...style,
      }}
    >
      <div
        ref={childRef}
        className='themed-parallax-child w-full h-full'
        style={{
          willChange: 'transform',
          transition: disabled ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Parallax 子组件
export const UpParallax: React.FC<Omit<ThemedParallaxProps, 'direction'>> = (props) => <ThemedParallax {...props} direction='up' />;

export const DownParallax: React.FC<Omit<ThemedParallaxProps, 'direction'>> = (props) => <ThemedParallax {...props} direction='down' />;

export const LeftParallax: React.FC<Omit<ThemedParallaxProps, 'direction'>> = (props) => <ThemedParallax {...props} direction='left' />;

export const RightParallax: React.FC<Omit<ThemedParallaxProps, 'direction'>> = (props) => <ThemedParallax {...props} direction='right' />;

// 预设配置
export const HeroParallax: React.FC<{
  children: React.ReactNode;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, speed = 0.3, className, style }) => (
  <ThemedParallax
    speed={speed}
    direction='up'
    overflow='hidden'
    className={classNames('h-screen', className)}
    style={{
      backgroundColor: currentTheme.colors?.bg,
      ...style,
    }}
  >
    {children}
  </ThemedParallax>
);

export const BackgroundParallax: React.FC<{
  backgroundImage: string;
  speed?: number;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ backgroundImage, speed = 0.5, height = '100vh', className, style }) => (
  <ThemedParallax
    speed={speed}
    direction='up'
    overflow='hidden'
    className={className}
    style={{
      height,
      ...style,
    }}
  >
    <div
      className='w-full h-full bg-cover bg-center bg-no-repeat'
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    />
  </ThemedParallax>
);

export const ContentParallax: React.FC<{
  children: React.ReactNode;
  speed?: number;
  minHeight?: number | string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, speed = 0.2, minHeight = '50vh', className, style }) => (
  <ThemedParallax
    speed={speed}
    direction='up'
    overflow='visible'
    className={className}
    style={{
      minHeight,
      ...style,
    }}
  >
    {children}
  </ThemedParallax>
);

// 多层视差组件
export const MultiLayerParallax: React.FC<{
  layers: Array<{
    content: React.ReactNode;
    speed: number;
    direction?: ParallaxDirection;
    className?: string;
  }>;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ layers, height = '100vh', className, style }) => (
  <div
    className={classNames('themed-multi-parallax', 'relative', className)}
    style={{
      height,
      overflow: 'hidden',
      ...style,
    }}
  >
    {layers.map((layer, index) => (
      <ThemedParallax
        key={index}
        speed={layer.speed}
        direction={layer.direction || 'up'}
        overflow='hidden'
        className={classNames('absolute inset-0', layer.className)}
        style={{
          zIndex: index,
        }}
      >
        {layer.content}
      </ThemedParallax>
    ))}
  </div>
);

// 视差滚动容器
export const ParallaxContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className, style }) => {
  return (
    <div
      className={classNames('themed-parallax-container', 'relative', className)}
      style={{
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// 视差工具函数
export const useParallax = (options?: { speed?: number; direction?: ParallaxDirection; disabled?: boolean }) => {
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [offset, setOffset] = React.useState(0);

  React.useEffect(() => {
    if (options?.disabled) return;

    const updateParallax = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // 计算滚动进度
      const progress = scrollTop / (documentHeight - windowHeight);
      setScrollProgress(progress);

      // 计算视差偏移
      const maxOffset = windowHeight * (options?.speed || 0.5);
      let calculatedOffset = 0;

      switch (options?.direction || 'up') {
        case 'up':
          calculatedOffset = (1 - progress) * maxOffset;
          break;
        case 'down':
          calculatedOffset = progress * maxOffset;
          break;
        case 'left':
          calculatedOffset = (1 - progress) * maxOffset;
          break;
        case 'right':
          calculatedOffset = progress * maxOffset;
          break;
      }

      setOffset(calculatedOffset);
    };

    window.addEventListener('scroll', updateParallax);
    window.addEventListener('resize', updateParallax);
    updateParallax();

    return () => {
      window.removeEventListener('scroll', updateParallax);
      window.removeEventListener('resize', updateParallax);
    };
  }, [options?.speed, options?.direction, options?.disabled]);

  return {
    scrollProgress,
    offset,
    transformStyle: options?.direction === 'up' || options?.direction === 'down' ? `translateY(${offset}px)` : `translateX(${offset}px)`,
  };
};

// 视差滚动监听 Hook
export const useParallaxScroll = (
  elementRef: React.RefObject<HTMLElement>,
  options?: {
    speed?: number;
    direction?: ParallaxDirection;
    disabled?: boolean;
  }
) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [transform, setTransform] = React.useState('translateY(0px)');

  React.useEffect(() => {
    if (options?.disabled || !elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(elementRef.current);

    const updateParallax = () => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // 计算元素在视口中的进度
      const elementTop = rect.top;
      const elementHeight = rect.height;

      let currentProgress = 0;

      if (elementTop < windowHeight && elementTop + elementHeight > 0) {
        const visibleHeight = Math.min(elementHeight, windowHeight - elementTop);
        currentProgress = Math.max(0, Math.min(1, visibleHeight / elementHeight));
      }

      setProgress(currentProgress);

      // 计算变换
      const maxOffset = elementHeight * (options?.speed || 0.5);
      let offset = 0;

      switch (options?.direction || 'up') {
        case 'up':
          offset = (1 - currentProgress) * maxOffset;
          break;
        case 'down':
          offset = currentProgress * maxOffset;
          break;
        case 'left':
          offset = (1 - currentProgress) * maxOffset;
          break;
        case 'right':
          offset = currentProgress * maxOffset;
          break;
      }

      const newTransform = options?.direction === 'up' || options?.direction === 'down' ? `translateY(${offset}px)` : `translateX(${offset}px)`;

      setTransform(newTransform);
    };

    window.addEventListener('scroll', updateParallax);
    window.addEventListener('resize', updateParallax);
    updateParallax();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateParallax);
      window.removeEventListener('resize', updateParallax);
    };
  }, [options?.speed, options?.direction, options?.disabled, elementRef]);

  return {
    isVisible,
    progress,
    transform,
  };
};

// 视差性能优化 Hook
export const useParallaxPerformance = (enabled: boolean = true) => {
  const [isReducedMotion, setIsReducedMotion] = React.useState(false);

  React.useEffect(() => {
    // 检查用户是否减少了动画
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // 检查设备性能
  const [isLowPerformance, setIsLowPerformance] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) return;

    // 简单的性能检测
    const startTime = performance.now();
    let count = 0;

    const measurePerformance = () => {
      count++;
      if (count >= 1000) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        setIsLowPerformance(duration > 100); // 如果1000次操作超过100ms，认为是低性能设备
      } else {
        requestAnimationFrame(measurePerformance);
      }
    };

    requestAnimationFrame(measurePerformance);
  }, [enabled]);

  return {
    isReducedMotion,
    isLowPerformance,
    shouldDisableParallax: isReducedMotion || !enabled || isLowPerformance,
  };
};

/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Carousel组件，替换Arco Design Carousel
 * 完全受控于我们自己的主题系统
 */

export type CarouselSize = 'small' | 'medium' | 'large';
export type CarouselEffect = 'slide' | 'fade' | 'scale';
export type CarouselAutoplayDirection = 'forward' | 'backward';

export interface CarouselItem {
  key: string;
  title?: React.ReactNode;
  content: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface ThemedCarouselProps {
  className?: string;
  items?: CarouselItem[];
  current?: number;
  defaultCurrent?: number;
  autoplay?: boolean;
  autoplayInterval?: number;
  autoplayDirection?: CarouselAutoplayDirection;
  dots?: boolean;
  arrows?: boolean;
  effect?: CarouselEffect;
  size?: CarouselSize;
  loop?: boolean;
  height?: number | string;
  onChange?: (current: number) => void;
  onBeforeChange?: (from: number, to: number) => void;
  style?: React.CSSProperties;
}

export const ThemedCarousel: React.FC<ThemedCarouselProps> = ({ className, items = [], current, defaultCurrent = 0, autoplay = false, autoplayInterval = 3000, autoplayDirection = 'forward', dots = true, arrows = true, effect = 'slide', size = 'medium', loop = true, height, onChange, onBeforeChange, style }) => {
  const currentTheme = useCurrentTheme();
  const [internalCurrent, setInternalCurrent] = React.useState(current || defaultCurrent);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const autoplayRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (current !== undefined) {
      setInternalCurrent(current);
    }
  }, [current]);

  React.useEffect(() => {
    if (autoplay) {
      startAutoplay();
    } else {
      stopAutoplay();
    }

    return () => stopAutoplay();
  }, [autoplay, autoplayInterval, autoplayDirection]);

  const startAutoplay = () => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      handleNext();
    }, autoplayInterval);
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = undefined;
    }
  };

  const handlePrev = () => {
    if (isTransitioning) return;

    const nextIndex = autoplayDirection === 'forward' ? internalCurrent - 1 : internalCurrent + 1;

    goToItem(nextIndex);
  };

  const handleNext = () => {
    if (isTransitioning) return;

    const nextIndex = autoplayDirection === 'forward' ? internalCurrent + 1 : internalCurrent - 1;

    goToItem(nextIndex);
  };

  const goToItem = (index: number) => {
    if (isTransitioning) return;

    const totalItems = items.length;
    if (totalItems === 0) return;

    let nextIndex = index;
    if (loop) {
      if (nextIndex >= totalItems) nextIndex = 0;
      if (nextIndex < 0) nextIndex = totalItems - 1;
    } else {
      if (nextIndex >= totalItems) nextIndex = totalItems - 1;
      if (nextIndex < 0) nextIndex = 0;
    }

    if (nextIndex === internalCurrent) return;

    if (onBeforeChange) {
      onBeforeChange(internalCurrent, nextIndex);
    }

    setIsTransitioning(true);
    setInternalCurrent(nextIndex);

    setTimeout(() => {
      setIsTransitioning(false);
      if (onChange) {
        onChange(nextIndex);
      }
    }, 300);
  };

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

  const renderCarouselItem = (item: CarouselItem, index: number) => {
    const isActive = index === internalCurrent;
    const isPrev = index === (internalCurrent - 1 + items.length) % items.length;
    const isNext = index === (internalCurrent + 1) % items.length;

    const getItemClasses = () => {
      switch (effect) {
        case 'fade':
          return classNames('absolute inset-0 transition-opacity duration-300', isActive ? 'opacity-100' : 'opacity-0');
        case 'scale':
          return classNames('absolute inset-0 transition-all duration-300', isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95');
        default:
          return classNames('absolute inset-0 transition-all duration-300', isActive ? 'opacity-100 translate-x-0' : isPrev ? 'opacity-0 -translate-x-full' : isNext ? 'opacity-0 translate-x-full' : 'opacity-0 translate-x-full');
      }
    };

    return (
      <div
        key={item.key}
        className={classNames('themed-carousel-item', getItemClasses(), item.className)}
        style={{
          ...item.style,
          height: height || '100%',
        }}
      >
        {item.content}
      </div>
    );
  };

  const renderDots = () => {
    if (!dots || items.length <= 1) return null;

    return (
      <div className='themed-carousel-dots absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2'>
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToItem(index)}
            className={classNames('themed-carousel-dot', 'w-2 h-2 rounded-full transition-all duration-200', 'hover:opacity-80')}
            style={{
              backgroundColor: index === internalCurrent ? currentTheme.colors?.primary : currentTheme.colors?.border,
              opacity: index === internalCurrent ? 1 : 0.5,
            }}
          />
        ))}
      </div>
    );
  };

  const renderArrows = () => {
    if (!arrows || items.length <= 1) return null;

    return (
      <>
        <button
          onClick={handlePrev}
          disabled={isTransitioning || (!loop && internalCurrent === 0)}
          className={classNames('themed-carousel-arrow-prev', 'absolute left-2 top-1/2 transform -translate-y-1/2', 'w-8 h-8 rounded-full flex items-center justify-center', 'transition-all duration-200', 'hover:bg-gray-100 dark:hover:bg-gray-800', 'disabled:opacity-50 disabled:cursor-not-allowed')}
          style={{
            backgroundColor: currentTheme.colors?.cardBg,
            color: currentTheme.colors?.text,
            border: `1px solid ${currentTheme.colors?.border}`,
          }}
        >
          ◀
        </button>
        <button
          onClick={handleNext}
          disabled={isTransitioning || (!loop && internalCurrent === items.length - 1)}
          className={classNames('themed-carousel-arrow-next', 'absolute right-2 top-1/2 transform -translate-y-1/2', 'w-8 h-8 rounded-full flex items-center justify-center', 'transition-all duration-200', 'hover:bg-gray-100 dark:hover:bg-gray-800', 'disabled:opacity-50 disabled:cursor-not-allowed')}
          style={{
            backgroundColor: currentTheme.colors?.cardBg,
            color: currentTheme.colors?.text,
            border: `1px solid ${currentTheme.colors?.border}`,
          }}
        >
          ▶
        </button>
      </>
    );
  };

  return (
    <div
      className={classNames('themed-carousel', 'relative overflow-hidden rounded-lg', getSizeClasses(), className)}
      style={{
        height: height || '400px',
        backgroundColor: currentTheme.colors?.cardBg,
        ...style,
      }}
      onMouseEnter={() => autoplay && stopAutoplay()}
      onMouseLeave={() => autoplay && startAutoplay()}
    >
      {/* 轮播内容 */}
      <div className='themed-carousel-container relative w-full h-full'>{items.map((item, index) => renderCarouselItem(item, index))}</div>

      {/* 控制按钮 */}
      {renderArrows()}
      {renderDots()}

      {/* 标题和描述 */}
      {items[internalCurrent]?.title && (
        <div className='themed-carousel-title absolute top-4 left-4'>
          <div className='text-lg font-semibold' style={{ color: currentTheme.colors?.white, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {items[internalCurrent].title}
          </div>
          {items[internalCurrent].description && (
            <div className='text-sm mt-1' style={{ color: currentTheme.colors?.white, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              {items[internalCurrent].description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Carousel 组件的子组件
export const ImageCarousel: React.FC<{
  images: Array<{ src: string; alt?: string; title?: string }>;
  className?: string;
  style?: React.CSSProperties;
}> = ({ images, className, style }) => {
  const items: CarouselItem[] = images.map((image, index) => ({
    key: `image-${index}`,
    title: image.title,
    content: (
      <div className='w-full h-full flex items-center justify-center bg-black'>
        <img src={image.src} alt={image.alt || `Image ${index + 1}`} className='max-w-full max-h-full object-contain' />
      </div>
    ),
  }));

  return <ThemedCarousel items={items} autoplay={true} autoplayInterval={5000} dots={true} arrows={true} effect='slide' className={className} style={style} />;
};

export const CardCarousel: React.FC<{
  cards: Array<{ title: string; content: React.ReactNode }>;
  className?: string;
  style?: React.CSSProperties;
}> = ({ cards, className, style }) => {
  const items: CarouselItem[] = cards.map((card, index) => ({
    key: `card-${index}`,
    title: card.title,
    content: (
      <div className='w-full h-full flex items-center justify-center p-8'>
        <div className='text-center'>
          <h3 className='text-xl font-bold mb-4'>{card.title}</h3>
          <div>{card.content}</div>
        </div>
      </div>
    ),
  }));

  return <ThemedCarousel items={items} autoplay={false} dots={true} arrows={true} effect='slide' className={className} style={style} />;
};

export const FadeCarousel: React.FC<Omit<ThemedCarouselProps, 'effect'>> = (props) => <ThemedCarousel {...props} effect='fade' />;

export const ScaleCarousel: React.FC<Omit<ThemedCarouselProps, 'effect'>> = (props) => <ThemedCarousel {...props} effect='scale' />;

export const SmallCarousel: React.FC<Omit<ThemedCarouselProps, 'size'>> = (props) => <ThemedCarousel {...props} size='small' />;

export const LargeCarousel: React.FC<Omit<ThemedCarouselProps, 'size'>> = (props) => <ThemedCarousel {...props} size='large' />;

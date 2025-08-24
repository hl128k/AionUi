/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Affix组件，替换Arco Design Affix
 * 完全受控于我们自己的主题系统
 */

export interface ThemedAffixProps {
  className?: string;
  children: React.ReactNode;
  offsetTop?: number;
  offsetBottom?: number;
  target?: () => HTMLElement | Window;
  style?: React.CSSProperties;
  onChange?: (affixed: boolean) => void;
}

export const ThemedAffix: React.FC<ThemedAffixProps> = ({ className, children, offsetTop, offsetBottom, target, style, onChange }) => {
  const currentTheme = useCurrentTheme();
  const [affixed, setAffixed] = React.useState(false);
  const [placeholderStyle, setPlaceholderStyle] = React.useState<React.CSSProperties>({});
  const [affixStyle, setAffixStyle] = React.useState<React.CSSProperties>({});
  const affixRef = React.useRef<HTMLDivElement>(null);
  const placeholderRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const getTarget = () => target?.() || window;
    const scrollTarget = getTarget();

    const updateAffix = () => {
      if (!affixRef.current || !placeholderRef.current) return;

      const affixRect = affixRef.current.getBoundingClientRect();
      const targetRect = scrollTarget === window ? { top: 0, left: 0 } : scrollTarget.getBoundingClientRect();

      let isAffixed = false;
      let newAffixStyle: React.CSSProperties = {};
      let newPlaceholderStyle: React.CSSProperties = {};

      if (offsetTop !== undefined) {
        const scrollTop = scrollTarget === window ? document.documentElement.scrollTop || document.body.scrollTop : scrollTarget.scrollTop;

        const targetTop = scrollTarget === window ? 0 : targetRect.top;
        const distanceFromTop = affixRect.top - targetTop + scrollTop;

        if (distanceFromTop <= offsetTop) {
          isAffixed = true;
          newAffixStyle = {
            position: 'fixed',
            top: `${offsetTop}px`,
            left: `${affixRect.left}px`,
            width: affixRect.width,
            zIndex: 100,
          };
          newPlaceholderStyle = {
            height: affixRect.height,
            width: affixRect.width,
          };
        }
      }

      if (offsetBottom !== undefined) {
        const scrollHeight = scrollTarget === window ? document.documentElement.scrollHeight || document.body.scrollHeight : scrollTarget.scrollHeight;
        const clientHeight = scrollTarget === window ? document.documentElement.clientHeight || window.innerHeight : scrollTarget.clientHeight;
        const scrollTop = scrollTarget === window ? document.documentElement.scrollTop || document.body.scrollTop : scrollTarget.scrollTop;

        const targetBottom = scrollTarget === window ? 0 : targetRect.bottom;
        const distanceFromBottom = scrollHeight - (affixRect.bottom - targetBottom + scrollTop);

        if (distanceFromBottom <= offsetBottom) {
          isAffixed = true;
          newAffixStyle = {
            position: 'fixed',
            bottom: `${offsetBottom}px`,
            left: `${affixRect.left}px`,
            width: affixRect.width,
            zIndex: 100,
          };
          newPlaceholderStyle = {
            height: affixRect.height,
            width: affixRect.width,
          };
        }
      }

      setAffixed(isAffixed);
      setAffixStyle(newAffixStyle);
      setPlaceholderStyle(newPlaceholderStyle);

      if (onChange && isAffixed !== affixed) {
        onChange(isAffixed);
      }
    };

    scrollTarget.addEventListener('scroll', updateAffix);
    window.addEventListener('resize', updateAffix);
    updateAffix();

    return () => {
      scrollTarget.removeEventListener('scroll', updateAffix);
      window.removeEventListener('resize', updateAffix);
    };
  }, [offsetTop, offsetBottom, target, onChange, affixed]);

  return (
    <div ref={placeholderRef} style={placeholderStyle}>
      <div
        ref={affixRef}
        className={classNames('themed-affix', affixed && 'themed-affix-fixed', className)}
        style={{
          ...style,
          ...(affixed ? affixStyle : {}),
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Affix 子组件
export const TopAffix: React.FC<Omit<ThemedAffixProps, 'offsetBottom'>> = (props) => <ThemedAffix {...props} offsetTop={props.offsetTop || 0} />;

export const BottomAffix: React.FC<Omit<ThemedAffixProps, 'offsetTop'>> = (props) => <ThemedAffix {...props} offsetBottom={props.offsetBottom || 0} />;

// 预设配置
export const StickyHeader: React.FC<{
  children: React.ReactNode;
  offsetTop?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, offsetTop = 0, className, style }) => (
  <ThemedAffix
    offsetTop={offsetTop}
    className={classNames('w-full', className)}
    style={{
      backgroundColor: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      ...style,
    }}
  >
    {children}
  </ThemedAffix>
);

export const StickyFooter: React.FC<{
  children: React.ReactNode;
  offsetBottom?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, offsetBottom = 0, className, style }) => (
  <ThemedAffix
    offsetBottom={offsetBottom}
    className={classNames('w-full', className)}
    style={{
      backgroundColor: 'white',
      borderTop: '1px solid #e5e7eb',
      ...style,
    }}
  >
    {children}
  </ThemedAffix>
);

export const FloatingAction: React.FC<{
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  offset?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, position = 'bottom-right', offset = 20, className, style }) => {
  const getPositionProps = () => {
    switch (position) {
      case 'top-right':
        return { offsetTop: offset };
      case 'top-left':
        return { offsetTop: offset };
      case 'bottom-right':
        return { offsetBottom: offset };
      case 'bottom-left':
        return { offsetBottom: offset };
      default:
        return { offsetBottom: offset };
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'right-4';
      case 'top-left':
        return 'left-4';
      case 'bottom-right':
        return 'right-4';
      case 'bottom-left':
        return 'left-4';
      default:
        return 'right-4';
    }
  };

  return (
    <ThemedAffix
      {...getPositionProps()}
      className={classNames('z-50', getPositionClasses(), className)}
      style={{
        position: 'fixed',
        ...style,
      }}
    >
      {children}
    </ThemedAffix>
  );
};

// Affix 工具函数
export const useAffix = (options?: { offsetTop?: number; offsetBottom?: number; target?: () => HTMLElement | Window }) => {
  const [affixed, setAffixed] = React.useState(false);

  React.useEffect(() => {
    const getTarget = () => options?.target?.() || window;
    const scrollTarget = getTarget();

    const updateAffix = () => {
      let isAffixed = false;

      if (options?.offsetTop !== undefined) {
        const scrollTop = scrollTarget === window ? document.documentElement.scrollTop || document.body.scrollTop : scrollTarget.scrollTop;

        isAffixed = scrollTop >= options.offsetTop;
      }

      if (options?.offsetBottom !== undefined) {
        const scrollHeight = scrollTarget === window ? document.documentElement.scrollHeight || document.body.scrollHeight : scrollTarget.scrollHeight;
        const clientHeight = scrollTarget === window ? document.documentElement.clientHeight || window.innerHeight : scrollTarget.clientHeight;
        const scrollTop = scrollTarget === window ? document.documentElement.scrollTop || document.body.scrollTop : scrollTarget.scrollTop;

        const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
        isAffixed = distanceFromBottom <= options.offsetBottom;
      }

      setAffixed(isAffixed);
    };

    scrollTarget.addEventListener('scroll', updateAffix);
    window.addEventListener('resize', updateAffix);
    updateAffix();

    return () => {
      scrollTarget.removeEventListener('scroll', updateAffix);
      window.removeEventListener('resize', updateAffix);
    };
  }, [options?.offsetTop, options?.offsetBottom, options?.target]);

  return {
    affixed,
  };
};

// 滚动监听 Hook
export const useScrollPosition = (target?: () => HTMLElement | Window) => {
  const [scrollPosition, setScrollPosition] = React.useState({
    scrollTop: 0,
    scrollLeft: 0,
  });

  React.useEffect(() => {
    const getTarget = () => target?.() || window;
    const scrollTarget = getTarget();

    const updateScrollPosition = () => {
      const scrollTop = scrollTarget === window ? document.documentElement.scrollTop || document.body.scrollTop : scrollTarget.scrollTop;

      const scrollLeft = scrollTarget === window ? document.documentElement.scrollLeft || document.body.scrollLeft : scrollTarget.scrollLeft;

      setScrollPosition({ scrollTop, scrollLeft });
    };

    scrollTarget.addEventListener('scroll', updateScrollPosition);
    updateScrollPosition();

    return () => {
      scrollTarget.removeEventListener('scroll', updateScrollPosition);
    };
  }, [target]);

  return scrollPosition;
};

// 元素位置监听 Hook
export const useElementPosition = (elementRef: React.RefObject<HTMLElement>, target?: () => HTMLElement | Window) => {
  const [position, setPosition] = React.useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  React.useEffect(() => {
    if (!elementRef.current) return;

    const getTarget = () => target?.() || window;
    const scrollTarget = getTarget();

    const updatePosition = () => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const targetRect = scrollTarget === window ? { top: 0, left: 0 } : scrollTarget.getBoundingClientRect();

      setPosition({
        top: rect.top - targetRect.top,
        left: rect.left - targetRect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    scrollTarget.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    updatePosition();

    return () => {
      scrollTarget.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [elementRef, target]);

  return position;
};

/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Anchor组件，替换Arco Design Anchor
 * 完全受控于我们自己的主题系统
 */

export type AnchorAffix = boolean | { offsetBottom?: number; offsetTop?: number };
export type AnchorType = 'default' | 'underline' | 'button';
export type AnchorShape = 'round' | 'square' | 'circle';

export interface AnchorLinkItem {
  key: string;
  href: string;
  title: React.ReactNode;
  children?: AnchorLinkItem[];
  target?: string;
  disabled?: boolean;
}

export interface ThemedAnchorProps {
  className?: string;
  items: AnchorLinkItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  affix?: AnchorAffix;
  type?: AnchorType;
  shape?: AnchorShape;
  direction?: 'horizontal' | 'vertical';
  onChange?: (key: string, link: AnchorLinkItem) => void;
  onClick?: (e: React.MouseEvent, link: AnchorLinkItem) => void;
  style?: React.CSSProperties;
  lineStyle?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  activeItemStyle?: React.CSSProperties;
  container?: HTMLElement | Window;
  offsetTop?: number;
  offsetBottom?: number;
  bounds?: number;
  showInkInFixed?: boolean;
}

export const ThemedAnchor: React.FC<ThemedAnchorProps> = ({ className, items, activeKey, defaultActiveKey, affix = true, type = 'default', shape = 'square', direction = 'vertical', onChange, onClick, style, lineStyle, itemStyle, activeItemStyle, container, offsetTop = 0, offsetBottom = 0, bounds = 5, showInkInFixed = false }) => {
  const currentTheme = useCurrentTheme();
  const [internalActiveKey, setInternalActiveKey] = React.useState(activeKey || defaultActiveKey || '');
  const [scrolling, setScrolling] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (activeKey !== undefined) {
      setInternalActiveKey(activeKey);
    }
  }, [activeKey]);

  React.useEffect(() => {
    if (!container) return;

    const handleScroll = () => {
      if (scrolling) return;

      const scrollContainer = container === window ? document.documentElement : container;
      const scrollTop = scrollContainer.scrollTop || scrollContainer.scrollY || 0;
      const containerHeight = scrollContainer.clientHeight;
      const containerTop = container === window ? 0 : scrollContainer.getBoundingClientRect().top;

      let activeSection: string | null = null;

      const checkLinks = (links: AnchorLinkItem[]) => {
        for (const link of links) {
          if (link.disabled) continue;

          const element = document.querySelector(link.href);
          if (element) {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + scrollTop - containerTop;
            const elementBottom = elementTop + rect.height;

            if (scrollTop >= elementTop - bounds && scrollTop < elementBottom - bounds) {
              activeSection = link.key;
              break;
            }
          }

          if (link.children) {
            checkLinks(link.children);
          }
        }
      };

      checkLinks(items);

      if (activeSection && activeSection !== internalActiveKey) {
        setInternalActiveKey(activeSection);
        const activeLink = findLinkByKey(items, activeSection);
        if (activeLink) {
          onChange?.(activeSection, activeLink);
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [items, container, bounds, scrolling, internalActiveKey, onChange]);

  const findLinkByKey = (links: AnchorLinkItem[], key: string): AnchorLinkItem | null => {
    for (const link of links) {
      if (link.key === key) return link;
      if (link.children) {
        const found = findLinkByKey(link.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  const handleLinkClick = (e: React.MouseEvent, link: AnchorLinkItem) => {
    e.preventDefault();
    if (link.disabled) return;

    setInternalActiveKey(link.key);
    onClick?.(e, link);

    const element = document.querySelector(link.href);
    if (element) {
      setScrolling(true);

      const scrollContainer = container || window;
      const containerTop = scrollContainer === window ? 0 : scrollContainer.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect();
      const targetScrollTop = elementRect.top + (scrollContainer.scrollY || scrollContainer.scrollTop) - containerTop - offsetTop;

      const animateScroll = () => {
        const currentScrollTop = scrollContainer === window ? document.documentElement.scrollTop || document.body.scrollTop : scrollContainer.scrollTop;

        const distance = Math.abs(targetScrollTop - currentScrollTop);

        if (distance > 1) {
          const scrollStep = Math.sign(targetScrollTop - currentScrollTop) * Math.max(1, distance * 0.1);

          if (scrollContainer === window) {
            window.scrollTo(0, currentScrollTop + scrollStep);
          } else {
            (scrollContainer as HTMLElement).scrollTop = currentScrollTop + scrollStep;
          }

          requestAnimationFrame(animateScroll);
        } else {
          setScrolling(false);
        }
      };

      requestAnimationFrame(animateScroll);
    }
  };

  const renderLinks = (links: AnchorLinkItem[], level = 0) => {
    return links.map((link) => {
      const isActive = link.key === internalActiveKey;
      const hasChildren = link.children && link.children.length > 0;

      return (
        <div key={link.key} className={classNames('themed-anchor-link-wrapper', 'relative', level > 0 && 'ml-4')}>
          <a
            href={link.href}
            target={link.target}
            className={classNames('themed-anchor-link', 'flex items-center px-3 py-2 text-sm transition-all duration-200', 'no-underline hover:no-underline', direction === 'horizontal' ? 'flex-row' : 'flex-col', type === 'button' && 'px-4 py-2 rounded-lg', type === 'underline' && 'border-b-2 border-transparent', isActive && 'font-medium', isActive && type === 'underline' && 'border-b-2', isActive && type === 'button' && 'shadow-sm', !link.disabled && 'cursor-pointer hover:bg-opacity-10', link.disabled && 'opacity-50 cursor-not-allowed')}
            style={{
              color: isActive ? currentTheme.colors?.primary : currentTheme.colors?.text,
              backgroundColor: isActive && type === 'button' ? `${currentTheme.colors?.primary}10` : 'transparent',
              borderColor: isActive && type === 'underline' ? currentTheme.colors?.primary : 'transparent',
              borderRadius: shape === 'round' ? '9999px' : shape === 'circle' ? '50%' : '0.5rem',
              ...itemStyle,
              ...(isActive && activeItemStyle),
            }}
            onClick={(e) => handleLinkClick(e, link)}
          >
            <span className='themed-anchor-link-title truncate'>{link.title}</span>
          </a>

          {hasChildren && <div className='themed-anchor-links-children mt-1'>{renderLinks(link.children, level + 1)}</div>}
        </div>
      );
    });
  };

  const getAffixStyle = (): React.CSSProperties => {
    if (!affix) return {};

    const affixConfig = typeof affix === 'object' ? affix : {};
    const top = affixConfig.offsetTop ?? offsetTop;
    const bottom = affixConfig.offsetBottom ?? offsetBottom;

    if (bottom !== undefined) {
      return {
        position: 'fixed',
        bottom: `${bottom}px`,
        top: 'auto',
      };
    } else {
      return {
        position: 'fixed',
        top: `${top}px`,
        bottom: 'auto',
      };
    }
  };

  const getLineStyles = (): React.CSSProperties => {
    const activeLink = findLinkByKey(items, internalActiveKey);
    if (!activeLink) return {};

    const activeElement = anchorRef.current?.querySelector(`[href="${activeLink.href}"]`);
    if (!activeElement) return {};

    const rect = activeElement.getBoundingClientRect();
    const anchorRect = anchorRef.current?.getBoundingClientRect();

    if (!anchorRect) return {};

    return {
      position: 'absolute',
      left: direction === 'vertical' ? '0' : `${rect.left - anchorRect.left}px`,
      top: direction === 'vertical' ? `${rect.top - anchorRect.top}px` : '0',
      width: direction === 'vertical' ? '2px' : `${rect.width}px`,
      height: direction === 'vertical' ? `${rect.height}px` : '2px',
      backgroundColor: currentTheme.colors?.primary,
      transition: 'all 0.3s ease',
      ...lineStyle,
    };
  };

  return (
    <div
      ref={anchorRef}
      className={classNames('themed-anchor', 'relative', direction === 'horizontal' ? 'flex flex-row space-x-1' : 'flex flex-col space-y-1', className)}
      style={{
        ...(affix ? getAffixStyle() : {}),
        ...style,
      }}
    >
      {/* 激活指示线 */}
      {internalActiveKey && <div className='themed-anchor-ink' style={getLineStyles()} />}

      {/* 链接列表 */}
      <div className='themed-anchor-links'>{renderLinks(items)}</div>
    </div>
  );
};

// Anchor 子组件
export const VerticalAnchor: React.FC<Omit<ThemedAnchorProps, 'direction'>> = (props) => <ThemedAnchor {...props} direction='vertical' />;

export const HorizontalAnchor: React.FC<Omit<ThemedAnchorProps, 'direction'>> = (props) => <ThemedAnchor {...props} direction='horizontal' />;

export const UnderlineAnchor: React.FC<Omit<ThemedAnchorProps, 'type'>> = (props) => <ThemedAnchor {...props} type='underline' />;

export const ButtonAnchor: React.FC<Omit<ThemedAnchorProps, 'type'>> = (props) => <ThemedAnchor {...props} type='button' />;

// 预设配置
export const TableOfContents: React.FC<{
  sections: Array<{ id: string; title: string; level?: number }>;
  className?: string;
  style?: React.CSSProperties;
}> = ({ sections, className, style }) => {
  const items: AnchorLinkItem[] = sections.map((section) => ({
    key: section.id,
    href: `#${section.id}`,
    title: section.title,
  }));

  return <ThemedAnchor items={items} affix={{ offsetTop: 20 }} type='underline' direction='vertical' className={classNames('w-64', className)} style={style} />;
};

export const NavigationAnchor: React.FC<{
  items: Array<{ id: string; title: string; icon?: React.ReactNode }>;
  activeId?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ items, activeId, className, style }) => {
  const anchorItems: AnchorLinkItem[] = items.map((item) => ({
    key: item.id,
    href: `#${item.id}`,
    title: (
      <div className='flex items-center space-x-2'>
        {item.icon}
        <span>{item.title}</span>
      </div>
    ),
  }));

  return <ThemedAnchor items={anchorItems} activeKey={activeId} type='button' shape='round' direction='horizontal' className={className} style={style} />;
};

export const SidebarAnchor: React.FC<{
  categories: Array<{
    id: string;
    title: string;
    items: Array<{ id: string; title: string }>;
  }>;
  className?: string;
  style?: React.CSSProperties;
}> = ({ categories, className, style }) => {
  const items: AnchorLinkItem[] = categories.map((category) => ({
    key: category.id,
    href: `#${category.id}`,
    title: category.title,
    children: category.items.map((item) => ({
      key: item.id,
      href: `#${item.id}`,
      title: item.title,
    })),
  }));

  return <ThemedAnchor items={items} affix={{ offsetTop: 80 }} type='default' direction='vertical' className={classNames('w-48', className)} style={style} />;
};

// Anchor 工具函数
export const useAnchor = (container?: HTMLElement | Window) => {
  const [activeKey, setActiveKey] = React.useState<string>('');
  const [scrolling, setScrolling] = React.useState(false);

  const scrollToAnchor = (key: string, items: AnchorLinkItem[], offsetTop = 0) => {
    const link = findLinkByKey(items, key);
    if (!link) return;

    const element = document.querySelector(link.href);
    if (!element) return;

    setScrolling(true);

    const scrollContainer = container || window;
    const containerTop = scrollContainer === window ? 0 : scrollContainer.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect();
    const targetScrollTop = elementRect.top + (scrollContainer.scrollY || scrollContainer.scrollTop) - containerTop - offsetTop;

    const animateScroll = () => {
      const currentScrollTop = scrollContainer === window ? document.documentElement.scrollTop || document.body.scrollTop : scrollContainer.scrollTop;

      const distance = Math.abs(targetScrollTop - currentScrollTop);

      if (distance > 1) {
        const scrollStep = Math.sign(targetScrollTop - currentScrollTop) * Math.max(1, distance * 0.1);

        if (scrollContainer === window) {
          window.scrollTo(0, currentScrollTop + scrollStep);
        } else {
          (scrollContainer as HTMLElement).scrollTop = currentScrollTop + scrollStep;
        }

        requestAnimationFrame(animateScroll);
      } else {
        setScrolling(false);
        setActiveKey(key);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  return {
    activeKey,
    setActiveKey,
    scrolling,
    scrollToAnchor,
  };
};

const findLinkByKey = (links: AnchorLinkItem[], key: string): AnchorLinkItem | null => {
  for (const link of links) {
    if (link.key === key) return link;
    if (link.children) {
      const found = findLinkByKey(link.children, key);
      if (found) return found;
    }
  }
  return null;
};

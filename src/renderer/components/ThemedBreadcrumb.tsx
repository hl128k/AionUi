/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Breadcrumb组件，替换Arco Design Breadcrumb
 * 完全受控于我们自己的主题系统
 */

export type BreadcrumbSeparator = '/' | '>' | '-' | '•' | '|' | React.ReactNode;
export type BreadcrumbSize = 'small' | 'medium' | 'large';

export interface BreadcrumbItem {
  key: string;
  title: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  dropdown?: React.ReactNode;
}

export interface ThemedBreadcrumbProps {
  className?: string;
  items: BreadcrumbItem[];
  separator?: BreadcrumbSeparator;
  maxItems?: number;
  itemRender?: (item: BreadcrumbItem, params: { href?: string; title: React.ReactNode }) => React.ReactNode;
  size?: BreadcrumbSize;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  separatorStyle?: React.CSSProperties;
  onClick?: (e: React.MouseEvent, item: BreadcrumbItem) => void;
}

export const ThemedBreadcrumb: React.FC<ThemedBreadcrumbProps> = ({ className, items, separator = '/', maxItems, itemRender, size = 'medium', style, itemStyle, separatorStyle, onClick }) => {
  const currentTheme = useCurrentTheme();

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  const handleItemClick = (e: React.MouseEvent, item: BreadcrumbItem) => {
    if (item.disabled) return;

    e.preventDefault();
    onClick?.(e, item);
    item.onClick?.(e);
  };

  const renderSeparator = (index: number) => {
    const isCustomSeparator = typeof separator === 'object';

    return (
      <span
        key={`separator-${index}`}
        className={classNames('themed-breadcrumb-separator', 'mx-2 flex items-center', getSizeClasses())}
        style={{
          color: currentTheme.colors?.textSecondary,
          ...separatorStyle,
        }}
      >
        {isCustomSeparator ? separator : separator}
      </span>
    );
  };

  const renderItem = (item: BreadcrumbItem, index: number, isLast: boolean) => {
    if (itemRender) {
      return itemRender(item, { href: item.href, title: item.title });
    }

    const content = (
      <span
        className={classNames('themed-breadcrumb-item', 'flex items-center space-x-1 transition-colors duration-200', getSizeClasses(), !item.disabled && !isLast && 'hover:text-blue-500 cursor-pointer', item.disabled && 'opacity-50 cursor-not-allowed', isLast && 'font-medium text-current')}
        style={{
          color: isLast ? currentTheme.colors?.text : currentTheme.colors?.textSecondary,
          ...itemStyle,
        }}
        onClick={(e) => handleItemClick(e, item)}
      >
        {item.icon && <span className='themed-breadcrumb-icon flex-shrink-0'>{item.icon}</span>}
        <span className='themed-breadcrumb-title truncate'>{item.title}</span>
      </span>
    );

    if (item.href && !item.disabled && !isLast) {
      return (
        <a key={item.key} href={item.href} className='themed-breadcrumb-link no-underline' onClick={(e) => handleItemClick(e, item)}>
          {content}
        </a>
      );
    }

    return (
      <span key={item.key} className='themed-breadcrumb-item-wrapper'>
        {content}
      </span>
    );
  };

  const renderCollapsedItems = () => {
    if (!maxItems || items.length <= maxItems) return null;

    const showFirst = Math.floor(maxItems / 2);
    const showLast = maxItems - showFirst - 1;

    const firstItems = items.slice(0, showFirst);
    const lastItems = items.slice(-showLast);
    const collapsedItems = items.slice(showFirst, -showLast);

    return (
      <>
        {firstItems.map((item, index) => (
          <React.Fragment key={`first-${item.key}`}>
            {renderItem(item, index, false)}
            {index < firstItems.length - 1 && renderSeparator(index)}
          </React.Fragment>
        ))}

        {/* 省略号 */}
        <div
          key='collapsed'
          className={classNames('themed-breadcrumb-ellipsis', 'flex items-center px-2 py-1 rounded', getSizeClasses())}
          style={{
            backgroundColor: currentTheme.colors?.fill,
            color: currentTheme.colors?.textSecondary,
          }}
          title={collapsedItems.map((item) => item.title).join(' > ')}
        >
          <span className='themed-breadcrumb-ellipsis-text'>...</span>
        </div>

        {renderSeparator(-1)}

        {lastItems.map((item, index) => (
          <React.Fragment key={`last-${item.key}`}>
            {renderItem(item, firstItems.length + collapsedItems.length + index, index === lastItems.length - 1)}
            {index < lastItems.length - 1 && renderSeparator(firstItems.length + collapsedItems.length + index)}
          </React.Fragment>
        ))}
      </>
    );
  };

  const renderNormalItems = () => {
    return items.map((item, index) => (
      <React.Fragment key={item.key}>
        {renderItem(item, index, index === items.length - 1)}
        {index < items.length - 1 && renderSeparator(index)}
      </React.Fragment>
    ));
  };

  return (
    <nav className={classNames('themed-breadcrumb', 'flex items-center flex-wrap', 'text-gray-600 dark:text-gray-400', className)} style={style} aria-label='Breadcrumb'>
      {maxItems && items.length > maxItems ? renderCollapsedItems() : renderNormalItems()}
    </nav>
  );
};

// Breadcrumb 子组件
export const SmallBreadcrumb: React.FC<Omit<ThemedBreadcrumbProps, 'size'>> = (props) => <ThemedBreadcrumb {...props} size='small' />;

export const LargeBreadcrumb: React.FC<Omit<ThemedBreadcrumbProps, 'size'>> = (props) => <ThemedBreadcrumb {...props} size='large' />;

export const ArrowBreadcrumb: React.FC<Omit<ThemedBreadcrumbProps, 'separator'>> = (props) => <ThemedBreadcrumb {...props} separator='>' />;

export const DashBreadcrumb: React.FC<Omit<ThemedBreadcrumbProps, 'separator'>> = (props) => <ThemedBreadcrumb {...props} separator='-' />;

// 单个 Breadcrumb Item 组件
export const ThemedBreadcrumbItem: React.FC<{
  item: BreadcrumbItem;
  isLast?: boolean;
  separator?: BreadcrumbSeparator;
  size?: BreadcrumbSize;
  onClick?: (e: React.MouseEvent, item: BreadcrumbItem) => void;
  className?: string;
  style?: React.CSSProperties;
}> = ({ item, isLast = false, separator, size = 'medium', onClick, className, style }) => {
  const currentTheme = useCurrentTheme();

  const handleItemClick = (e: React.MouseEvent) => {
    if (item.disabled) return;

    e.preventDefault();
    onClick?.(e, item);
    item.onClick?.(e);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  const content = (
    <span
      className={classNames('themed-breadcrumb-item', 'flex items-center space-x-1 transition-colors duration-200', getSizeClasses(), !item.disabled && !isLast && 'hover:text-blue-500 cursor-pointer', item.disabled && 'opacity-50 cursor-not-allowed', isLast && 'font-medium text-current', className)}
      style={{
        color: isLast ? currentTheme.colors?.text : currentTheme.colors?.textSecondary,
        ...style,
      }}
      onClick={handleItemClick}
    >
      {item.icon && <span className='themed-breadcrumb-icon flex-shrink-0'>{item.icon}</span>}
      <span className='themed-breadcrumb-title truncate'>{item.title}</span>
    </span>
  );

  if (item.href && !item.disabled && !isLast) {
    return (
      <a href={item.href} className='themed-breadcrumb-link no-underline' onClick={handleItemClick}>
        {content}
      </a>
    );
  }

  return <span className='themed-breadcrumb-item-wrapper'>{content}</span>;
};

// 预设配置
export const NavigationBreadcrumb: React.FC<{
  path: Array<{ name: string; href?: string; icon?: React.ReactNode }>;
  className?: string;
  style?: React.CSSProperties;
}> = ({ path, className, style }) => {
  const items: BreadcrumbItem[] = path.map((item, index) => ({
    key: `nav-${index}`,
    title: item.name,
    href: item.href,
    icon: item.icon,
  }));

  return <ThemedBreadcrumb items={items} separator='›' size='medium' className={className} style={style} />;
};

export const FileBreadcrumb: React.FC<{
  filePath: string;
  baseUrl?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ filePath, baseUrl = '/', className, style }) => {
  const parts = filePath.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [
    {
      key: 'home',
      title: '🏠',
      href: baseUrl,
    },
    ...parts.map((part, index) => {
      const href = `${baseUrl}${parts.slice(0, index + 1).join('/')}/`;
      return {
        key: `file-${index}`,
        title: part,
        href: href,
      };
    }),
  ];

  return <ThemedBreadcrumb items={items} separator='/' size='small' maxItems={5} className={className} style={style} />;
};

export const CategoryBreadcrumb: React.FC<{
  categories: Array<{
    id: string;
    name: string;
    href?: string;
    icon?: React.ReactNode;
  }>;
  currentCategory?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ categories, currentCategory, className, style }) => {
  const items: BreadcrumbItem[] = categories.map((category, index) => ({
    key: category.id,
    title: (
      <div className='flex items-center space-x-1'>
        {category.icon}
        <span>{category.name}</span>
      </div>
    ),
    href: category.href,
    disabled: category.id === currentCategory,
  }));

  return <ThemedBreadcrumb items={items} separator='›' size='medium' className={className} style={style} />;
};

// Breadcrumb 工具函数
export const useBreadcrumb = (initialItems: BreadcrumbItem[] = []) => {
  const [items, setItems] = React.useState<BreadcrumbItem[]>(initialItems);

  const addItem = (item: BreadcrumbItem, index?: number) => {
    setItems((prev) => {
      if (index !== undefined) {
        const newItems = [...prev];
        newItems.splice(index, 0, item);
        return newItems;
      }
      return [...prev, item];
    });
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const updateItem = (key: string, updates: Partial<BreadcrumbItem>) => {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...updates } : item)));
  };

  const clearItems = () => {
    setItems([]);
  };

  const setItemsFromArray = (newItems: BreadcrumbItem[]) => {
    setItems(newItems);
  };

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    setItems: setItemsFromArray,
  };
};

// 路径生成工具函数
export const generateBreadcrumbFromPath = (
  path: string,
  baseUrl: string = '/',
  options?: {
    homeTitle?: React.ReactNode;
    homeIcon?: React.ReactNode;
    excludeHome?: boolean;
    maxDepth?: number;
  }
): BreadcrumbItem[] => {
  const { homeTitle = '首页', homeIcon, excludeHome = false, maxDepth } = options || {};

  const parts = path.split('/').filter(Boolean);

  if (maxDepth && parts.length > maxDepth) {
    const visibleParts = parts.slice(0, maxDepth - 1);
    const remainingCount = parts.length - visibleParts.length;

    const items: BreadcrumbItem[] = [];

    if (!excludeHome) {
      items.push({
        key: 'home',
        title: homeIcon ? (
          <div className='flex items-center space-x-1'>
            {homeIcon}
            <span>{homeTitle}</span>
          </div>
        ) : (
          homeTitle
        ),
        href: baseUrl,
      });
    }

    visibleParts.forEach((part, index) => {
      const href = `${baseUrl}${visibleParts.slice(0, index + 1).join('/')}/`;
      items.push({
        key: `path-${index}`,
        title: part,
        href: href,
      });
    });

    items.push({
      key: 'ellipsis',
      title: `... ${remainingCount} more`,
      disabled: true,
    });

    return items;
  }

  const items: BreadcrumbItem[] = [];

  if (!excludeHome) {
    items.push({
      key: 'home',
      title: homeIcon ? (
        <div className='flex items-center space-x-1'>
          {homeIcon}
          <span>{homeTitle}</span>
        </div>
      ) : (
        homeTitle
      ),
      href: baseUrl,
    });
  }

  parts.forEach((part, index) => {
    const href = `${baseUrl}${parts.slice(0, index + 1).join('/')}/`;
    items.push({
      key: `path-${index}`,
      title: part,
      href: href,
    });
  });

  return items;
};

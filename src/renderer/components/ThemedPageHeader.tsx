/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化PageHeader组件，替换Arco Design PageHeader
 * 完全受控于我们自己的主题系统
 */

export type PageHeaderSize = 'small' | 'medium' | 'large';
export type PageHeaderGhost = boolean | 'light' | 'dark';
export type PageHeaderBackIcon = React.ReactNode;

export interface PageHeaderBreadcrumb {
  key: string;
  title: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
}

export interface PageHeaderTab {
  key: string;
  title: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface ThemedPageHeaderProps {
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  breadcrumb?: PageHeaderBreadcrumb[];
  backIcon?: PageHeaderBackIcon;
  avatar?: React.ReactNode;
  tags?: React.ReactNode;
  extra?: React.ReactNode;
  footer?: React.ReactNode;
  tabs?: PageHeaderTab[];
  activeTabKey?: string;
  onTabChange?: (key: string) => void;
  onBack?: () => void;
  ghost?: PageHeaderGhost;
  size?: PageHeaderSize;
  style?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
  subtitleStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  children?: React.ReactNode;
}

export const ThemedPageHeader: React.FC<ThemedPageHeaderProps> = ({ className, title, subtitle, breadcrumb, backIcon, avatar, tags, extra, footer, tabs, activeTabKey, onTabChange, onBack, ghost = false, size = 'medium', style, titleStyle, subtitleStyle, contentStyle, children }) => {
  const currentTheme = useCurrentTheme();
  const [internalActiveTabKey, setInternalActiveTabKey] = React.useState(activeTabKey || tabs?.[0]?.key || '');

  React.useEffect(() => {
    if (activeTabKey !== undefined) {
      setInternalActiveTabKey(activeTabKey);
    }
  }, [activeTabKey]);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          title: 'text-lg',
          subtitle: 'text-sm',
          padding: 'p-4',
        };
      case 'large':
        return {
          title: 'text-2xl',
          subtitle: 'text-base',
          padding: 'p-6',
        };
      default:
        return {
          title: 'text-xl',
          subtitle: 'text-sm',
          padding: 'p-5',
        };
    }
  };

  const getGhostClasses = () => {
    if (!ghost) return '';

    if (ghost === 'light') {
      return 'bg-white bg-opacity-50 backdrop-blur-sm';
    } else if (ghost === 'dark') {
      return 'bg-gray-800 bg-opacity-50 backdrop-blur-sm';
    } else {
      return 'bg-white bg-opacity-80 backdrop-blur-sm';
    }
  };

  const sizeClasses = getSizeClasses();
  const ghostClasses = getGhostClasses();

  const handleBack = () => {
    onBack?.();
  };

  const handleTabClick = (key: string) => {
    setInternalActiveTabKey(key);
    onTabChange?.(key);
  };

  const renderBreadcrumb = () => {
    if (!breadcrumb || breadcrumb.length === 0) return null;

    return (
      <div className='themed-page-header-breadcrumb mb-3'>
        <div className='flex items-center space-x-2 text-sm'>
          {breadcrumb.map((item, index) => (
            <React.Fragment key={item.key}>
              {index > 0 && (
                <span className='text-gray-400' style={{ color: currentTheme.colors?.textSecondary }}>
                  /
                </span>
              )}
              {item.href ? (
                <a href={item.href} className='text-blue-500 hover:text-blue-600 transition-colors' style={{ color: currentTheme.colors?.primary }}>
                  <div className='flex items-center space-x-1'>
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                </a>
              ) : (
                <div className='flex items-center space-x-1' style={{ color: currentTheme.colors?.text }}>
                  {item.icon}
                  <span>{item.title}</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderBackIcon = () => {
    if (!backIcon) return null;

    return (
      <button
        className={classNames('themed-page-header-back', 'flex items-center justify-center', 'w-8 h-8 rounded-lg', 'hover:bg-gray-100 dark:hover:bg-gray-700', 'transition-colors duration-200', 'focus:outline-none focus:ring-2 focus:ring-blue-500')}
        onClick={handleBack}
        style={{
          backgroundColor: ghost ? `${currentTheme.colors?.fill}20` : 'transparent',
        }}
      >
        {typeof backIcon === 'string' ? (
          <span className='text-lg' style={{ color: currentTheme.colors?.textSecondary }}>
            {backIcon}
          </span>
        ) : (
          <div className='w-5 h-5' style={{ color: currentTheme.colors?.textSecondary }}>
            {backIcon}
          </div>
        )}
      </button>
    );
  };

  const renderTitleSection = () => {
    if (!title && !subtitle && !avatar) return null;

    return (
      <div className='themed-page-header-title-section flex items-center space-x-4 mb-3'>
        {avatar && <div className='themed-page-header-avatar flex-shrink-0'>{avatar}</div>}
        <div className='themed-page-header-title-content flex-1 min-w-0'>
          {title && (
            <h1
              className={classNames('themed-page-header-title', 'font-semibold truncate', sizeClasses.title)}
              style={{
                color: currentTheme.colors?.text,
                ...titleStyle,
              }}
            >
              {title}
            </h1>
          )}
          {subtitle && (
            <p
              className={classNames('themed-page-header-subtitle', 'text-gray-600 dark:text-gray-400', 'mt-1 truncate', sizeClasses.subtitle)}
              style={{
                color: currentTheme.colors?.textSecondary,
                ...subtitleStyle,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderTags = () => {
    if (!tags) return null;

    return <div className='themed-page-header-tags mb-3'>{tags}</div>;
  };

  const renderExtra = () => {
    if (!extra) return null;

    return <div className='themed-page-header-extra mb-3'>{extra}</div>;
  };

  const renderTabs = () => {
    if (!tabs || tabs.length === 0) return null;

    return (
      <div className='themed-page-header-tabs border-b border-gray-200 dark:border-gray-700 mb-4'>
        <div className='flex space-x-6'>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={classNames('themed-page-header-tab', 'pb-3 px-1', 'relative', 'transition-all duration-200', 'focus:outline-none', tab.disabled && 'opacity-50 cursor-not-allowed', !tab.disabled && 'hover:text-blue-500', internalActiveTabKey === tab.key && 'text-blue-500 font-medium')}
              style={{
                color: internalActiveTabKey === tab.key ? currentTheme.colors?.primary : currentTheme.colors?.textSecondary,
              }}
              onClick={() => !tab.disabled && handleTabClick(tab.key)}
              disabled={tab.disabled}
            >
              <div className='flex items-center space-x-2'>
                {tab.icon}
                <span>{tab.title}</span>
              </div>
              {internalActiveTabKey === tab.key && <div className='absolute bottom-0 left-0 right-0 h-0.5 rounded-t' style={{ backgroundColor: currentTheme.colors?.primary }} />}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const activeTab = tabs?.find((tab) => tab.key === internalActiveTabKey);
    const tabContent = activeTab?.content;
    const hasContent = tabContent || children;

    if (!hasContent) return null;

    return (
      <div className={classNames('themed-page-header-content', 'mb-4')} style={contentStyle}>
        {tabContent || children}
      </div>
    );
  };

  const renderFooter = () => {
    if (!footer) return null;

    return <div className='themed-page-header-footer pt-4 border-t border-gray-200 dark:border-gray-700'>{footer}</div>;
  };

  return (
    <div
      className={classNames('themed-page-header', 'w-full', ghostClasses, sizeClasses.padding, className)}
      style={{
        backgroundColor: ghost ? 'transparent' : currentTheme.colors?.bg,
        borderBottom: ghost ? 'none' : `1px solid ${currentTheme.colors?.border}`,
        ...style,
      }}
    >
      {/* 面包屑 */}
      {renderBreadcrumb()}

      {/* 主要内容区域 */}
      <div className='themed-page-header-main'>
        {/* 顶部工具栏 */}
        <div className='flex items-start justify-between mb-4'>
          {/* 左侧：返回按钮 + 标题区域 */}
          <div className='flex items-start space-x-3 flex-1 min-w-0'>
            {renderBackIcon()}
            <div className='flex-1 min-w-0'>
              {renderTitleSection()}
              {renderTags()}
            </div>
          </div>

          {/* 右侧：额外内容 */}
          <div className='flex-shrink-0 ml-4'>{renderExtra()}</div>
        </div>

        {/* 标签页 */}
        {renderTabs()}

        {/* 内容区域 */}
        {renderContent()}

        {/* 页脚 */}
        {renderFooter()}
      </div>
    </div>
  );
};

// PageHeader 子组件
export const SmallPageHeader: React.FC<Omit<ThemedPageHeaderProps, 'size'>> = (props) => <ThemedPageHeader {...props} size='small' />;

export const LargePageHeader: React.FC<Omit<ThemedPageHeaderProps, 'size'>> = (props) => <ThemedPageHeader {...props} size='large' />;

export const GhostPageHeader: React.FC<Omit<ThemedPageHeaderProps, 'ghost'>> = (props) => <ThemedPageHeader {...props} ghost={true} />;

// 预设配置
export const ListPageHeader: React.FC<{
  title: string;
  subtitle?: string;
  total?: number;
  actions?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ title, subtitle, total, actions, className, style }) => (
  <ThemedPageHeader
    title={title}
    subtitle={subtitle}
    extra={
      <div className='flex items-center space-x-4'>
        {total !== undefined && <span className='text-sm text-gray-600 dark:text-gray-400'>共 {total} 项</span>}
        {actions}
      </div>
    }
    ghost='light'
    size='medium'
    className={className}
    style={style}
  />
);

export const DetailPageHeader: React.FC<{
  title: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumb?: PageHeaderBreadcrumb[];
  className?: string;
  style?: React.CSSProperties;
}> = ({ title, subtitle, avatar, actions, breadcrumb, className, style }) => <ThemedPageHeader title={title} subtitle={subtitle} avatar={avatar} breadcrumb={breadcrumb} extra={actions} size='large' className={className} style={style} />;

export const TabbedPageHeader: React.FC<{
  title: string;
  subtitle?: string;
  tabs: PageHeaderTab[];
  defaultTab?: string;
  onTabChange?: (key: string) => void;
  extra?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ title, subtitle, tabs, defaultTab, onTabChange, extra, className, style }) => <ThemedPageHeader title={title} subtitle={subtitle} tabs={tabs} activeTabKey={defaultTab} onTabChange={onTabChange} extra={extra} ghost='light' size='medium' className={className} style={style} />;

// PageHeader 工具函数
export const usePageHeader = (initialOptions?: { title?: React.ReactNode; subtitle?: React.ReactNode; breadcrumb?: PageHeaderBreadcrumb[]; tabs?: PageHeaderTab[] }) => {
  const [title, setTitle] = React.useState(initialOptions?.title);
  const [subtitle, setSubtitle] = React.useState(initialOptions?.subtitle);
  const [breadcrumb, setBreadcrumb] = React.useState(initialOptions?.breadcrumb || []);
  const [tabs, setTabs] = React.useState(initialOptions?.tabs || []);
  const [activeTab, setActiveTab] = React.useState(initialOptions?.tabs?.[0]?.key || '');

  const updateTitle = (newTitle: React.ReactNode) => {
    setTitle(newTitle);
  };

  const updateSubtitle = (newSubtitle: React.ReactNode) => {
    setSubtitle(newSubtitle);
  };

  const updateBreadcrumb = (newBreadcrumb: PageHeaderBreadcrumb[]) => {
    setBreadcrumb(newBreadcrumb);
  };

  const updateTabs = (newTabs: PageHeaderTab[]) => {
    setTabs(newTabs);
    if (newTabs.length > 0 && !activeTab) {
      setActiveTab(newTabs[0].key);
    }
  };

  const addTab = (tab: PageHeaderTab) => {
    setTabs((prev) => [...prev, tab]);
  };

  const removeTab = (key: string) => {
    setTabs((prev) => prev.filter((tab) => tab.key !== key));
    if (activeTab === key && tabs.length > 1) {
      setActiveTab(tabs[0].key);
    }
  };

  const setActiveTabKey = (key: string) => {
    setActiveTab(key);
  };

  return {
    title,
    subtitle,
    breadcrumb,
    tabs,
    activeTab,
    setTitle: updateTitle,
    setSubtitle: updateSubtitle,
    setBreadcrumb: updateBreadcrumb,
    setTabs: updateTabs,
    addTab,
    removeTab,
    setActiveTab: setActiveTabKey,
  };
};

// 面包屑生成工具函数
export const generatePageBreadcrumb = (currentPage: string, parentPages?: Array<{ name: string; href?: string }>, homePage?: { name: string; href?: string }): PageHeaderBreadcrumb[] => {
  const breadcrumbs: PageHeaderBreadcrumb[] = [];

  if (homePage) {
    breadcrumbs.push({
      key: 'home',
      title: homePage.name,
      href: homePage.href,
    });
  }

  if (parentPages) {
    parentPages.forEach((page, index) => {
      breadcrumbs.push({
        key: `parent-${index}`,
        title: page.name,
        href: page.href,
      });
    });
  }

  breadcrumbs.push({
    key: 'current',
    title: currentPage,
  });

  return breadcrumbs;
};

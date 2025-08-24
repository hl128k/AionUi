/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Timeline组件，替换Arco Design Timeline
 * 完全受控于我们自己的主题系统
 */

export type TimelineMode = 'left' | 'right' | 'alternate' | 'center';
export type TimelineSize = 'small' | 'medium' | 'large';
export type TimelineStatus = 'success' | 'error' | 'warning' | 'normal' | 'processing';

export interface TimelineItem {
  key: string;
  content?: React.ReactNode;
  time?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  status?: TimelineStatus;
  icon?: React.ReactNode;
  color?: string;
  dot?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface ThemedTimelineProps {
  className?: string;
  items?: TimelineItem[];
  mode?: TimelineMode;
  size?: TimelineSize;
  reverse?: boolean;
  pending?: boolean | React.ReactNode;
  pendingDot?: React.ReactNode;
  style?: React.CSSProperties;
}

export const ThemedTimeline: React.FC<ThemedTimelineProps> = ({ className, items = [], mode = 'left', size = 'medium', reverse = false, pending = false, pendingDot, style }) => {
  const currentTheme = useCurrentTheme();

  const getStatusConfig = (status: TimelineStatus) => {
    switch (status) {
      case 'success':
        return {
          icon: '✓',
          color: currentTheme.colors?.success || '#10b981',
          bgColor: currentTheme.colors?.success + '10' || '#10b98120',
        };
      case 'error':
        return {
          icon: '✕',
          color: currentTheme.colors?.error || '#ef4444',
          bgColor: currentTheme.colors?.error + '10' || '#ef444420',
        };
      case 'warning':
        return {
          icon: '⚠',
          color: currentTheme.colors?.warning || '#f59e0b',
          bgColor: currentTheme.colors?.warning + '10' || '#f59e0b20',
        };
      case 'processing':
        return {
          icon: '●',
          color: currentTheme.colors?.primary || '#3b82f6',
          bgColor: currentTheme.colors?.primary + '10' || '#3b82f620',
        };
      default:
        return {
          icon: '○',
          color: currentTheme.colors?.border || '#e5e7eb',
          bgColor: currentTheme.colors?.border + '10' || '#e5e7eb20',
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          dot: 'w-3 h-3',
          icon: 'text-xs',
          content: 'text-sm',
          time: 'text-xs',
          container: 'space-y-3',
        };
      case 'large':
        return {
          dot: 'w-5 h-5',
          icon: 'text-base',
          content: 'text-base',
          time: 'text-sm',
          container: 'space-y-6',
        };
      default:
        return {
          dot: 'w-4 h-4',
          icon: 'text-sm',
          content: 'text-base',
          time: 'text-sm',
          container: 'space-y-4',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const renderTimelineItem = (item: TimelineItem, index: number, total: number) => {
    const status = item.status || 'normal';
    const statusConfig = getStatusConfig(status);
    const customColor = item.color;
    const isLast = index === total - 1;

    const getPositionClass = () => {
      if (mode === 'center') {
        return index % 2 === 0 ? 'items-start' : 'items-end';
      }
      return 'items-start';
    };

    return (
      <div key={item.key} className={classNames('themed-timeline-item', 'flex relative', getPositionClass(), !isLast && 'pb-4', item.className)} style={item.style}>
        {/* 时间线 */}
        {!isLast && (
          <div
            className='themed-timeline-tail absolute top-4 w-0.5 bg-gray-200 dark:bg-gray-700'
            style={{
              height: mode === 'center' ? '100%' : 'calc(100% - 1rem)',
              left: mode === 'center' ? '50%' : mode === 'right' ? 'auto' : '0',
              right: mode === 'right' ? '0' : 'auto',
              transform: mode === 'center' ? 'translateX(-50%)' : 'none',
              backgroundColor: currentTheme.colors?.border,
            }}
          />
        )}

        {/* 时间点 */}
        <div
          className={classNames('themed-timeline-dot', 'flex items-center justify-center rounded-full border-2 z-10 flex-shrink-0', sizeClasses.dot)}
          style={{
            backgroundColor: statusConfig.bgColor,
            borderColor: customColor || statusConfig.color,
            left: mode === 'center' ? '50%' : mode === 'right' ? 'auto' : '0',
            right: mode === 'right' ? '0' : 'auto',
            transform: mode === 'center' ? 'translateX(-50%)' : 'none',
          }}
        >
          {item.dot || (
            <span className={classNames('themed-timeline-icon', sizeClasses.icon)} style={{ color: customColor || statusConfig.color }}>
              {item.icon || statusConfig.icon}
            </span>
          )}
        </div>

        {/* 内容 */}
        <div className={classNames('themed-timeline-content', 'flex-1', mode === 'center' ? (index % 2 === 0 ? 'mr-8' : 'ml-8') : mode === 'right' ? 'mr-8' : 'ml-8')}>
          {item.time && (
            <div className={classNames('themed-timeline-time', 'mb-1 font-medium', sizeClasses.time)} style={{ color: currentTheme.colors?.textSecondary }}>
              {item.time}
            </div>
          )}
          {item.title && (
            <div className={classNames('themed-timeline-title', 'font-semibold mb-1', sizeClasses.content)} style={{ color: currentTheme.colors?.text }}>
              {item.title}
            </div>
          )}
          {item.description && (
            <div className={classNames('themed-timeline-description', 'text-sm', sizeClasses.content)} style={{ color: currentTheme.colors?.textSecondary }}>
              {item.description}
            </div>
          )}
          {item.content && (
            <div className={classNames('themed-timeline-content-extra', 'mt-2', sizeClasses.content)} style={{ color: currentTheme.colors?.text }}>
              {item.content}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPendingItem = () => {
    if (!pending) return null;

    const pendingDotNode = pendingDot || <div className={classNames('themed-timeline-pending-dot', 'w-4 h-4 rounded-full border-2 border-blue-500 border-dashed animate-pulse')} style={{ borderColor: currentTheme.colors?.primary }} />;

    return (
      <div className={classNames('themed-timeline-pending-item', 'flex items-center relative', sizeClasses.container)}>
        <div
          className='themed-timeline-pending-dot-container flex-shrink-0'
          style={{
            left: mode === 'center' ? '50%' : mode === 'right' ? 'auto' : '0',
            right: mode === 'right' ? '0' : 'auto',
            transform: mode === 'center' ? 'translateX(-50%)' : 'none',
          }}
        >
          {pendingDotNode}
        </div>
        <div className={classNames('themed-timeline-pending-content', 'flex-1', mode === 'center' ? 'ml-8' : mode === 'right' ? 'mr-8' : 'ml-8')}>
          <div className={classNames('themed-timeline-pending-text', 'text-sm', sizeClasses.content)} style={{ color: currentTheme.colors?.textSecondary }}>
            {typeof pending === 'boolean' ? '进行中...' : pending}
          </div>
        </div>
      </div>
    );
  };

  const processedItems = reverse ? [...items].reverse() : items;

  return (
    <div className={classNames('themed-timeline', sizeClasses.container, className)} style={style}>
      {processedItems.map((item, index) => renderTimelineItem(item, index, processedItems.length))}
      {renderPendingItem()}
    </div>
  );
};

// Timeline 组件的子组件
export const LeftTimeline: React.FC<Omit<ThemedTimelineProps, 'mode'>> = (props) => <ThemedTimeline {...props} mode='left' />;

export const RightTimeline: React.FC<Omit<ThemedTimelineProps, 'mode'>> = (props) => <ThemedTimeline {...props} mode='right' />;

export const AlternateTimeline: React.FC<Omit<ThemedTimelineProps, 'mode'>> = (props) => <ThemedTimeline {...props} mode='alternate' />;

export const CenterTimeline: React.FC<Omit<ThemedTimelineProps, 'mode'>> = (props) => <ThemedTimeline {...props} mode='center' />;

export const SmallTimeline: React.FC<Omit<ThemedTimelineProps, 'size'>> = (props) => <ThemedTimeline {...props} size='small' />;

export const LargeTimeline: React.FC<Omit<ThemedTimelineProps, 'size'>> = (props) => <ThemedTimeline {...props} size='large' />;

// 预设配置
export const ProcessTimeline: React.FC<{
  steps: Array<{ title: string; description?: string; time?: string }>;
  currentStep: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ steps, currentStep, className, style }) => {
  const items: TimelineItem[] = steps.map((step, index) => ({
    key: `step-${index}`,
    title: step.title,
    description: step.description,
    time: step.time,
    status: index < currentStep ? 'success' : index === currentStep ? 'processing' : 'normal',
  }));

  return <ThemedTimeline items={items} mode='left' size='medium' className={className} style={style} />;
};

export const HistoryTimeline: React.FC<{
  events: Array<{ title: string; description?: string; time: string; status?: TimelineStatus }>;
  className?: string;
  style?: React.CSSProperties;
}> = ({ events, className, style }) => {
  const items: TimelineItem[] = events.map((event, index) => ({
    key: `event-${index}`,
    title: event.title,
    description: event.description,
    time: event.time,
    status: event.status || 'normal',
  }));

  return <ThemedTimeline items={items} mode='left' size='medium' reverse={true} className={className} style={style} />;
};

export const ActivityTimeline: React.FC<{
  activities: Array<{ title: string; description?: string; time: string; icon?: React.ReactNode }>;
  className?: string;
  style?: React.CSSProperties;
}> = ({ activities, className, style }) => {
  const items: TimelineItem[] = activities.map((activity, index) => ({
    key: `activity-${index}`,
    title: activity.title,
    description: activity.description,
    time: activity.time,
    icon: activity.icon,
    status: 'normal',
  }));

  return <ThemedTimeline items={items} mode='alternate' size='medium' className={className} style={style} />;
};

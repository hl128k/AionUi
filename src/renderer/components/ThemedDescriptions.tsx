/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Descriptions组件，替换Arco Design Descriptions
 * 完全受控于我们自己的主题系统
 */

export type DescriptionsSize = 'small' | 'medium' | 'large';
export type DescriptionsLayout = 'horizontal' | 'vertical';

export interface DescriptionsItem {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
  span?: number;
  className?: string;
  style?: React.CSSProperties;
}

export interface ThemedDescriptionsProps {
  className?: string;
  title?: React.ReactNode;
  extra?: React.ReactNode;
  colon?: boolean;
  bordered?: boolean;
  size?: DescriptionsSize;
  layout?: DescriptionsLayout;
  column?: number;
  items?: DescriptionsItem[];
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
}

export const ThemedDescriptions: React.FC<ThemedDescriptionsProps> = ({ className, title, extra, colon = true, bordered = false, size = 'medium', layout = 'horizontal', column = 3, items = [], style, labelStyle, contentStyle }) => {
  const currentTheme = useCurrentTheme();

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'text-sm',
          label: 'px-2 py-1',
          content: 'px-2 py-1',
          cell: 'min-h-[2rem]',
        };
      case 'large':
        return {
          container: 'text-base',
          label: 'px-4 py-3',
          content: 'px-4 py-3',
          cell: 'min-h-[3rem]',
        };
      default:
        return {
          container: 'text-base',
          label: 'px-3 py-2',
          content: 'px-3 py-2',
          cell: 'min-h-[2.5rem]',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const renderHorizontalLayout = () => {
    const rows: DescriptionsItem[][] = [];
    let currentRow: DescriptionsItem[] = [];
    let currentSpan = 0;

    items.forEach((item) => {
      const span = item.span || 1;

      if (currentSpan + span > column) {
        if (currentRow.length > 0) {
          rows.push(currentRow);
        }
        currentRow = [item];
        currentSpan = span;
      } else {
        currentRow.push(item);
        currentSpan += span;
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return (
      <div className='themed-descriptions-horizontal space-y-0'>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className={classNames('themed-descriptions-row', 'flex border-b last:border-b-0', bordered && 'border', sizeClasses.cell)} style={{ borderColor: currentTheme.colors?.border }}>
            {row.map((item, itemIndex) => {
              const span = item.span || 1;
              const width = `${(span / column) * 100}%`;

              return (
                <React.Fragment key={item.key}>
                  {/* 标签 */}
                  <div
                    className={classNames('themed-descriptions-label', 'font-medium bg-gray-50 dark:bg-gray-800', bordered && 'border-r', sizeClasses.label)}
                    style={{
                      width,
                      borderColor: currentTheme.colors?.border,
                      backgroundColor: currentTheme.colors?.tableHeaderBg,
                      color: currentTheme.colors?.text,
                      ...labelStyle,
                    }}
                  >
                    {item.label}
                    {colon && ':'}
                  </div>
                  {/* 内容 */}
                  <div
                    className={classNames('themed-descriptions-content', bordered && 'border-r last:border-r-0', sizeClasses.content)}
                    style={{
                      width,
                      borderColor: currentTheme.colors?.border,
                      color: currentTheme.colors?.text,
                      ...contentStyle,
                    }}
                  >
                    {item.children}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderVerticalLayout = () => {
    return (
      <div className='themed-descriptions-vertical space-y-4'>
        {items.map((item) => (
          <div
            key={item.key}
            className={classNames('themed-descriptions-item', 'border rounded-lg p-4', bordered && 'border')}
            style={{
              borderColor: currentTheme.colors?.border,
              backgroundColor: currentTheme.colors?.cardBg,
            }}
          >
            <div
              className={classNames('themed-descriptions-label', 'font-medium mb-2', sizeClasses.label)}
              style={{
                color: currentTheme.colors?.textSecondary,
                ...labelStyle,
              }}
            >
              {item.label}
              {colon && ':'}
            </div>
            <div
              className={classNames('themed-descriptions-content', sizeClasses.content)}
              style={{
                color: currentTheme.colors?.text,
                ...contentStyle,
              }}
            >
              {item.children}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={classNames('themed-descriptions', sizeClasses.container, className)} style={style}>
      {/* 标题和额外内容 */}
      {(title || extra) && (
        <div className='themed-descriptions-header flex items-center justify-between mb-4'>
          {title && (
            <div className='themed-descriptions-title text-lg font-semibold' style={{ color: currentTheme.colors?.text }}>
              {title}
            </div>
          )}
          {extra && <div className='themed-descriptions-extra'>{extra}</div>}
        </div>
      )}

      {/* 描述内容 */}
      {items.length === 0 ? (
        <div className='themed-descriptions-empty text-center py-8' style={{ color: currentTheme.colors?.textSecondary }}>
          暂无数据
        </div>
      ) : layout === 'vertical' ? (
        renderVerticalLayout()
      ) : (
        renderHorizontalLayout()
      )}
    </div>
  );
};

// Descriptions 组件的子组件
export const DescriptionsItem: React.FC<DescriptionsItem> = ({ children }) => {
  return <>{children}</>;
};

export const BorderedDescriptions: React.FC<Omit<ThemedDescriptionsProps, 'bordered'>> = (props) => <ThemedDescriptions {...props} bordered={true} />;

export const VerticalDescriptions: React.FC<Omit<ThemedDescriptionsProps, 'layout'>> = (props) => <ThemedDescriptions {...props} layout='vertical' />;

export const SmallDescriptions: React.FC<Omit<ThemedDescriptionsProps, 'size'>> = (props) => <ThemedDescriptions {...props} size='small' />;

export const LargeDescriptions: React.FC<Omit<ThemedDescriptionsProps, 'size'>> = (props) => <ThemedDescriptions {...props} size='large' />;

// 预设配置
export const ProfileDescriptions: React.FC<{
  data: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
}> = ({ data, className, style }) => {
  const items: DescriptionsItem[] = [
    { key: 'name', label: '姓名', children: data.name || '-' },
    { key: 'email', label: '邮箱', children: data.email || '-' },
    { key: 'phone', label: '电话', children: data.phone || '-' },
    { key: 'department', label: '部门', children: data.department || '-' },
    { key: 'position', label: '职位', children: data.position || '-' },
    { key: 'joinDate', label: '入职日期', children: data.joinDate || '-' },
  ];

  return <ThemedDescriptions title='个人信息' items={items} bordered={true} column={2} className={className} style={style} />;
};

export const SystemInfoDescriptions: React.FC<{
  data: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
}> = ({ data, className, style }) => {
  const items: DescriptionsItem[] = [
    { key: 'os', label: '操作系统', children: data.os || '-' },
    { key: 'cpu', label: '处理器', children: data.cpu || '-' },
    { key: 'memory', label: '内存', children: data.memory || '-' },
    { key: 'disk', label: '磁盘', children: data.disk || '-' },
    { key: 'browser', label: '浏览器', children: data.browser || '-' },
    { key: 'resolution', label: '分辨率', children: data.resolution || '-' },
  ];

  return <ThemedDescriptions title='系统信息' items={items} bordered={true} column={2} className={className} style={style} />;
};

export const ProjectInfoDescriptions: React.FC<{
  data: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
}> = ({ data, className, style }) => {
  const items: DescriptionsItem[] = [
    { key: 'name', label: '项目名称', children: data.name || '-' },
    { key: 'version', label: '版本', children: data.version || '-' },
    { key: 'status', label: '状态', children: data.status || '-' },
    { key: 'owner', label: '负责人', children: data.owner || '-' },
    { key: 'startDate', label: '开始日期', children: data.startDate || '-' },
    { key: 'endDate', label: '结束日期', children: data.endDate || '-' },
    { key: 'description', label: '描述', children: data.description || '-', span: 3 },
  ];

  return <ThemedDescriptions title='项目信息' items={items} bordered={true} column={4} className={className} style={style} />;
};

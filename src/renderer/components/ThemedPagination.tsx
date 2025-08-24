/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Pagination组件，替换Arco Design Pagination
 * 完全受控于我们自己的主题系统
 */

export type PaginationSize = 'small' | 'medium' | 'large';
export type PaginationPosition = 'top' | 'bottom' | 'both';

export interface PaginationProps {
  className?: string;
  current?: number;
  defaultCurrent?: number;
  total?: number;
  pageSize?: number;
  defaultPageSize?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  pageSizeOptions?: number[];
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  showLessItems?: boolean;
  simple?: boolean;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
  style?: React.CSSProperties;
  itemRender?: (page: number, type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next', element: React.ReactNode) => React.ReactNode;
}

export const ThemedPagination: React.FC<PaginationProps> = ({ className, current, defaultCurrent = 1, total = 0, pageSize, defaultPageSize = 10, showSizeChanger = false, showQuickJumper = false, showTotal, pageSizeOptions = [10, 20, 50, 100], disabled = false, hideOnSinglePage = false, showLessItems = false, simple = false, onChange, onShowSizeChange, style, itemRender }) => {
  const currentTheme = useCurrentTheme();
  const [internalCurrent, setInternalCurrent] = React.useState(current || defaultCurrent);
  const [internalPageSize, setInternalPageSize] = React.useState(pageSize || defaultPageSize);

  React.useEffect(() => {
    if (current !== undefined) {
      setInternalCurrent(current);
    }
  }, [current]);

  React.useEffect(() => {
    if (pageSize !== undefined) {
      setInternalPageSize(pageSize);
    }
  }, [pageSize]);

  const totalPages = Math.ceil(total / internalPageSize);

  // 如果只有一页且需要隐藏
  if (hideOnSinglePage && totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => {
    if (disabled || page < 1 || page > totalPages || page === internalCurrent) {
      return;
    }

    setInternalCurrent(page);
    onChange?.(page, internalPageSize);
  };

  const handlePageSizeChange = (size: number) => {
    if (disabled) return;

    const newPage = Math.min(internalCurrent, Math.ceil(total / size));
    setInternalPageSize(size);
    setInternalCurrent(newPage);

    onShowSizeChange?.(newPage, size);
    onChange?.(newPage, size);
  };

  const getPageRange = () => {
    const start = (internalCurrent - 1) * internalPageSize + 1;
    const end = Math.min(internalCurrent * internalPageSize, total);
    return [start, end] as [number, number];
  };

  const renderPageNumbers = () => {
    if (simple) return null;

    const pageNumbers = [];
    const maxPages = showLessItems ? 5 : 7;

    if (totalPages <= maxPages) {
      // 如果总页数小于最大显示数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // 否则智能显示页码
      pageNumbers.push(1);

      if (internalCurrent <= 4) {
        for (let i = 2; i <= 5; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('jump-next');
        pageNumbers.push(totalPages);
      } else if (internalCurrent >= totalPages - 3) {
        pageNumbers.push('jump-prev');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push('jump-prev');
        for (let i = internalCurrent - 1; i <= internalCurrent + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('jump-next');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers.map((page, index) => {
      if (page === 'jump-prev' || page === 'jump-next') {
        const isJumpPrev = page === 'jump-prev';
        const jumpPage = isJumpPrev ? Math.max(1, internalCurrent - 5) : Math.min(totalPages, internalCurrent + 5);

        const element = (
          <button
            key={`jump-${index}`}
            onClick={() => handlePageChange(jumpPage)}
            disabled={disabled}
            className={classNames('themed-pagination-jump', 'px-2 py-1 border rounded text-sm transition-colors', 'hover:bg-gray-100 dark:hover:bg-gray-800', disabled && 'opacity-50 cursor-not-allowed')}
            style={{
              borderColor: currentTheme.colors?.border,
              color: currentTheme.colors?.text,
            }}
          >
            •••
          </button>
        );

        return itemRender ? itemRender(jumpPage, isJumpPrev ? 'jump-prev' : 'jump-next', element) : element;
      }

      const isActive = page === internalCurrent;
      const element = (
        <button
          key={page}
          onClick={() => handlePageChange(page as number)}
          disabled={disabled}
          className={classNames('themed-pagination-item', 'px-3 py-1 border rounded text-sm transition-colors', 'hover:bg-gray-100 dark:hover:bg-gray-800', isActive && 'text-white font-medium', disabled && 'opacity-50 cursor-not-allowed')}
          style={{
            backgroundColor: isActive ? currentTheme.colors?.primary : 'transparent',
            borderColor: currentTheme.colors?.border,
            color: isActive ? currentTheme.colors?.white : currentTheme.colors?.text,
          }}
        >
          {page}
        </button>
      );

      return itemRender ? itemRender(page as number, 'page', element) : element;
    });
  };

  const renderPrevButton = () => {
    const element = (
      <button
        onClick={() => handlePageChange(internalCurrent - 1)}
        disabled={disabled || internalCurrent <= 1}
        className={classNames('themed-pagination-prev', 'px-3 py-1 border rounded-l-lg text-sm transition-colors', 'hover:bg-gray-100 dark:hover:bg-gray-800', (disabled || internalCurrent <= 1) && 'opacity-50 cursor-not-allowed')}
        style={{
          borderColor: currentTheme.colors?.border,
          color: currentTheme.colors?.text,
        }}
      >
        上一页
      </button>
    );

    return itemRender ? itemRender(internalCurrent - 1, 'prev', element) : element;
  };

  const renderNextButton = () => {
    const element = (
      <button
        onClick={() => handlePageChange(internalCurrent + 1)}
        disabled={disabled || internalCurrent >= totalPages}
        className={classNames('themed-pagination-next', 'px-3 py-1 border rounded-r-lg text-sm transition-colors', 'hover:bg-gray-100 dark:hover:bg-gray-800', (disabled || internalCurrent >= totalPages) && 'opacity-50 cursor-not-allowed')}
        style={{
          borderColor: currentTheme.colors?.border,
          color: currentTheme.colors?.text,
        }}
      >
        下一页
      </button>
    );

    return itemRender ? itemRender(internalCurrent + 1, 'next', element) : element;
  };

  const renderSimplePagination = () => {
    const [start, end] = getPageRange();

    return (
      <div className={classNames('themed-pagination-simple', 'flex items-center space-x-2', className)} style={style}>
        <button
          onClick={() => handlePageChange(internalCurrent - 1)}
          disabled={disabled || internalCurrent <= 1}
          className={classNames('px-2 py-1 border rounded text-sm transition-colors', disabled && 'opacity-50 cursor-not-allowed')}
          style={{
            borderColor: currentTheme.colors?.border,
            color: currentTheme.colors?.text,
          }}
        >
          上一页
        </button>

        <span className='text-sm' style={{ color: currentTheme.colors?.text }}>
          {internalCurrent} / {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(internalCurrent + 1)}
          disabled={disabled || internalCurrent >= totalPages}
          className={classNames('px-2 py-1 border rounded text-sm transition-colors', disabled && 'opacity-50 cursor-not-allowed')}
          style={{
            borderColor: currentTheme.colors?.border,
            color: currentTheme.colors?.text,
          }}
        >
          下一页
        </button>
      </div>
    );
  };

  if (simple) {
    return renderSimplePagination();
  }

  const [start, end] = getPageRange();

  return (
    <div className={classNames('themed-pagination', 'flex items-center justify-between', className)} style={style}>
      {/* 左侧信息 */}
      <div className='flex items-center space-x-4'>
        {showTotal && (
          <span className='text-sm' style={{ color: currentTheme.colors?.textSecondary }}>
            {showTotal(total, [start, end])}
          </span>
        )}

        {showSizeChanger && (
          <div className='flex items-center space-x-2'>
            <span className='text-sm' style={{ color: currentTheme.colors?.textSecondary }}>
              每页显示
            </span>
            <select
              value={internalPageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              disabled={disabled}
              className={classNames('px-2 py-1 border rounded text-sm', disabled && 'opacity-50 cursor-not-allowed')}
              style={{
                borderColor: currentTheme.colors?.border,
                backgroundColor: currentTheme.colors?.inputBg,
                color: currentTheme.colors?.text,
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} 条
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 中间页码 */}
      <div className='flex items-center space-x-1'>
        {renderPrevButton()}
        {renderPageNumbers()}
        {renderNextButton()}
      </div>

      {/* 右侧快速跳转 */}
      {showQuickJumper && (
        <div className='flex items-center space-x-2'>
          <span className='text-sm' style={{ color: currentTheme.colors?.textSecondary }}>
            跳至
          </span>
          <input
            type='number'
            min={1}
            max={totalPages}
            value={internalCurrent}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                handlePageChange(page);
              }
            }}
            disabled={disabled}
            className={classNames('w-12 px-2 py-1 border rounded text-sm text-center', disabled && 'opacity-50 cursor-not-allowed')}
            style={{
              borderColor: currentTheme.colors?.border,
              backgroundColor: currentTheme.colors?.inputBg,
              color: currentTheme.colors?.text,
            }}
          />
          <span className='text-sm' style={{ color: currentTheme.colors?.textSecondary }}>
            页
          </span>
        </div>
      )}
    </div>
  );
};

// Pagination 组件的子组件
export const SimplePagination: React.FC<Omit<PaginationProps, 'simple'>> = (props) => <ThemedPagination {...props} simple={true} />;

export const SmallPagination: React.FC<Omit<PaginationProps, 'size'>> = (props) => <ThemedPagination {...props} showSizeChanger={false} showQuickJumper={false} />;

export const LargePagination: React.FC<Omit<PaginationProps, 'size'>> = (props) => <ThemedPagination {...props} showSizeChanger={true} showQuickJumper={true} />;

export const MiniPagination: React.FC<Omit<PaginationProps, 'showSizeChanger' | 'showQuickJumper' | 'showTotal'>> = (props) => <ThemedPagination {...props} showSizeChanger={false} showQuickJumper={false} showTotal={false} />;

// 分页器工具函数
export const usePagination = (
  total: number,
  options?: {
    current?: number;
    pageSize?: number;
  }
) => {
  const current = options?.current || 1;
  const pageSize = options?.pageSize || 10;
  const totalPages = Math.ceil(total / pageSize);

  return {
    current,
    pageSize,
    total,
    totalPages,
    start: (current - 1) * pageSize + 1,
    end: Math.min(current * pageSize, total),
    hasNext: current < totalPages,
    hasPrev: current > 1,
  };
};

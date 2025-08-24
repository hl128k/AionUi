/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Table组件，替换Arco Design Table
 * 完全受控于我们自己的主题系统
 */

export type TableSize = 'small' | 'medium' | 'large';
export type TableAlign = 'left' | 'center' | 'right';
export type TableSortDirection = 'ascend' | 'descend' | null;
export type TableFilterType = 'single' | 'multiple';

export interface TableColumn {
  key: string;
  title: React.ReactNode;
  dataIndex?: string;
  width?: number | string;
  align?: TableAlign;
  fixed?: 'left' | 'right';
  sorter?: boolean | ((a: any, b: any) => number);
  filters?: Array<{ text: React.ReactNode; value: string }>;
  filterType?: TableFilterType;
  render?: (text: any, record: any, index: number) => React.ReactNode;
  ellipsis?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface TablePagination {
  current?: number;
  pageSize?: number;
  total?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  pageSizeOptions?: number[];
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}

export interface ThemedTableProps {
  className?: string;
  columns?: TableColumn[];
  dataSource?: any[];
  rowKey?: string | ((record: any) => string);
  size?: TableSize;
  bordered?: boolean;
  showHeader?: boolean;
  loading?: boolean;
  pagination?: TablePagination | false;
  scroll?: { x?: number | string; y?: number | string };
  rowSelection?: {
    selectedRowKeys?: (string | number)[];
    onChange?: (selectedRowKeys: (string | number)[], selectedRows: any[]) => void;
    getCheckboxProps?: (record: any) => any;
    type?: 'checkbox' | 'radio';
  };
  expandedRowRender?: (record: any, index: number, indent: number, expanded: boolean) => React.ReactNode;
  onRow?: (record: any, index?: number) => any;
  onHeaderRow?: (columns: TableColumn[], index?: number) => any;
  onChange?: (pagination: TablePagination, filters: any, sorter: any) => void;
  style?: React.CSSProperties;
  emptyText?: React.ReactNode;
  rowClassName?: (record: any, index: number) => string;
}

export const ThemedTable: React.FC<ThemedTableProps> = ({ className, columns = [], dataSource = [], rowKey = 'key', size = 'medium', bordered = true, showHeader = true, loading = false, pagination, scroll, rowSelection, expandedRowRender, onRow, onHeaderRow, onChange, style, emptyText = '暂无数据', rowClassName }) => {
  const currentTheme = useCurrentTheme();
  const [internalPagination, setInternalPagination] = React.useState<TablePagination>({
    current: 1,
    pageSize: 10,
    total: dataSource.length,
  });
  const [sortField, setSortField] = React.useState<string>('');
  const [sortOrder, setSortOrder] = React.useState<TableSortDirection>(null);
  const [filters, setFilters] = React.useState<Record<string, string[]>>({});
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (pagination) {
      setInternalPagination({
        current: pagination.current || 1,
        pageSize: pagination.pageSize || 10,
        total: pagination.total || dataSource.length,
        showSizeChanger: pagination.showSizeChanger,
        showQuickJumper: pagination.showQuickJumper,
        showTotal: pagination.showTotal,
        pageSizeOptions: pagination.pageSizeOptions,
      });
    }
  }, [pagination, dataSource.length]);

  const getRowKey = (record: any, index: number) => {
    return typeof rowKey === 'function' ? rowKey(record) : record[rowKey] || index;
  };

  const handleSort = (column: TableColumn) => {
    if (!column.sorter) return;

    const newOrder = sortField === column.key && sortOrder === 'ascend' ? 'descend' : 'ascend';
    const newSortField = newOrder ? column.key : '';

    setSortField(newSortField);
    setSortOrder(newOrder);

    if (onChange) {
      onChange({ ...internalPagination }, filters, newOrder ? { field: column.key, order: newOrder } : {});
    }
  };

  const handleFilter = (columnKey: string, value: string[]) => {
    const newFilters = { ...filters, [columnKey]: value };
    setFilters(newFilters);

    if (onChange) {
      onChange({ ...internalPagination }, newFilters, { field: sortField, order: sortOrder });
    }
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    const newPagination = { ...internalPagination, current: page, pageSize: pageSize || internalPagination.pageSize };
    setInternalPagination(newPagination);

    if (pagination?.onChange) {
      pagination.onChange(page, pageSize || internalPagination.pageSize);
    }
    if (onChange) {
      onChange(newPagination, filters, { field: sortField, order: sortOrder });
    }
  };

  const handleRowSelect = (selected: boolean, record: any) => {
    if (!rowSelection) return;

    const recordKey = getRowKey(record, dataSource.indexOf(record));
    const newSelectedKeys = selected ? [...(rowSelection.selectedRowKeys || []), recordKey] : (rowSelection.selectedRowKeys || []).filter((key) => key !== recordKey);

    rowSelection.onChange?.(
      newSelectedKeys,
      dataSource.filter((_, index) => newSelectedKeys.includes(getRowKey(dataSource[index], index)))
    );
  };

  const handleExpand = (record: any) => {
    if (!expandedRowRender) return;

    const recordKey = getRowKey(record, dataSource.indexOf(record));
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(recordKey)) {
      newExpandedRows.delete(recordKey);
    } else {
      newExpandedRows.add(recordKey);
    }
    setExpandedRows(newExpandedRows);
  };

  const getSortedAndFilteredData = () => {
    let result = [...dataSource];

    // 应用过滤器
    Object.entries(filters).forEach(([columnKey, values]) => {
      if (values.length > 0) {
        result = result.filter((item) => values.includes(item[columnKey]));
      }
    });

    // 应用排序
    if (sortField && sortOrder) {
      const column = columns.find((col) => col.key === sortField);
      if (column && typeof column.sorter === 'function') {
        result.sort((a, b) => {
          const result = column.sorter!(a, b);
          return sortOrder === 'ascend' ? result : -result;
        });
      }
    }

    return result;
  };

  const getPaginatedData = () => {
    if (!pagination) return getSortedAndFilteredData();

    const { current = 1, pageSize = 10 } = internalPagination;
    const data = getSortedAndFilteredData();
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm px-2 py-1';
      case 'large':
        return 'text-lg px-4 py-3';
      default:
        return 'text-base px-3 py-2';
    }
  };

  const renderSortIcon = (column: TableColumn) => {
    if (!column.sorter) return null;

    const isActive = sortField === column.key;
    const direction = isActive ? sortOrder : null;

    return (
      <span className='ml-1 inline-flex flex-col'>
        <span className={classNames('text-xs cursor-pointer transition-colors', direction === 'ascend' ? 'text-blue-500' : 'text-gray-400')} style={{ color: direction === 'ascend' ? currentTheme.colors?.primary : currentTheme.colors?.textSecondary }}>
          ▲
        </span>
        <span className={classNames('text-xs cursor-pointer transition-colors', direction === 'descend' ? 'text-blue-500' : 'text-gray-400')} style={{ color: direction === 'descend' ? currentTheme.colors?.primary : currentTheme.colors?.textSecondary }}>
          ▼
        </span>
      </span>
    );
  };

  const renderFilterDropdown = (column: TableColumn) => {
    if (!column.filters || column.filters.length === 0) return null;

    const activeFilters = filters[column.key] || [];

    return (
      <div
        className='absolute top-full left-0 mt-1 p-2 border rounded-lg shadow-xl z-10 bg-white dark:bg-gray-800'
        style={{
          borderColor: currentTheme.colors?.border,
          backgroundColor: currentTheme.colors?.cardBg,
        }}
      >
        {column.filters.map((filter) => (
          <label key={filter.value} className='flex items-center mb-1 last:mb-0 cursor-pointer'>
            <input
              type={column.filterType === 'single' ? 'radio' : 'checkbox'}
              name={`filter-${column.key}`}
              value={filter.value}
              checked={activeFilters.includes(filter.value)}
              onChange={(e) => {
                const checked = e.target.checked;
                if (column.filterType === 'single') {
                  handleFilter(column.key, checked ? [filter.value] : []);
                } else {
                  const newFilters = checked ? [...activeFilters, filter.value] : activeFilters.filter((v) => v !== filter.value);
                  handleFilter(column.key, newFilters);
                }
              }}
              className='mr-2'
              style={{ accentColor: currentTheme.colors?.primary }}
            />
            <span className='text-sm' style={{ color: currentTheme.colors?.text }}>
              {filter.text}
            </span>
          </label>
        ))}
      </div>
    );
  };

  const renderTable = () => {
    const data = getPaginatedData();
    const hasSelection = rowSelection && rowSelection.type === 'checkbox';
    const hasExpansion = expandedRowRender;

    return (
      <div className='themed-table-wrapper overflow-auto' style={scroll}>
        <table
          className={classNames('themed-table', 'w-full border-collapse', bordered && 'border', className)}
          style={{
            borderColor: currentTheme.colors?.border,
            ...style,
          }}
        >
          {/* 表头 */}
          {showHeader && (
            <thead>
              <tr style={{ backgroundColor: currentTheme.colors?.tableHeaderBg }}>
                {hasSelection && (
                  <th className={classNames('themed-table-selection', 'border-b px-4 py-2 text-left', getSizeClasses())} style={{ borderColor: currentTheme.colors?.border }}>
                    <input
                      type='checkbox'
                      onChange={(e) => {
                        const allSelected = e.target.checked;
                        data.forEach((record) => handleRowSelect(allSelected, record));
                      }}
                      style={{ accentColor: currentTheme.colors?.primary }}
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={classNames('themed-table-th', 'border-b px-4 py-2 font-medium relative', getSizeClasses(), column.align === 'center' && 'text-center', column.align === 'right' && 'text-right', column.sorter && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800')}
                    style={{
                      borderColor: currentTheme.colors?.border,
                      color: currentTheme.colors?.text,
                      width: column.width,
                      textAlign: column.align,
                      ...column.style,
                    }}
                    onClick={() => column.sorter && handleSort(column)}
                  >
                    <div className='flex items-center justify-between'>
                      <span>{column.title}</span>
                      <div className='flex items-center'>
                        {renderSortIcon(column)}
                        {column.filters && column.filters.length > 0 && (
                          <span className='ml-1 text-gray-400' style={{ color: currentTheme.colors?.textSecondary }}>
                            ▼
                          </span>
                        )}
                      </div>
                    </div>
                    {column.filters && column.filters.length > 0 && renderFilterDropdown(column)}
                  </th>
                ))}
                {hasExpansion && <th className={classNames('themed-table-expand', 'border-b px-4 py-2', getSizeClasses())} style={{ borderColor: currentTheme.colors?.border }} />}
              </tr>
            </thead>
          )}

          {/* 表体 */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hasSelection ? 1 : 0) + (hasExpansion ? 1 : 0)} className='px-4 py-8 text-center' style={{ color: currentTheme.colors?.textSecondary }}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((record, index) => {
                const recordKey = getRowKey(record, index);
                const isExpanded = expandedRows.has(recordKey);
                const isSelected = rowSelection?.selectedRowKeys?.includes(recordKey);

                return (
                  <React.Fragment key={recordKey}>
                    <tr
                      className={classNames('themed-table-tr', 'border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors', rowClassName?.(record, index), isSelected && 'bg-blue-50 dark:bg-blue-900')}
                      style={{
                        borderColor: currentTheme.colors?.border,
                        backgroundColor: isSelected ? currentTheme.colors?.primary + '10' : 'transparent',
                      }}
                      {...onRow?.(record, index)}
                    >
                      {hasSelection && (
                        <td className={classNames('themed-table-selection', 'border-b px-4 py-2', getSizeClasses())} style={{ borderColor: currentTheme.colors?.border }}>
                          <input type={rowSelection?.type || 'checkbox'} checked={isSelected} onChange={(e) => handleRowSelect(e.target.checked, record)} {...rowSelection?.getCheckboxProps?.(record)} style={{ accentColor: currentTheme.colors?.primary }} />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={classNames('themed-table-td', 'border-b px-4 py-2', getSizeClasses(), column.align === 'center' && 'text-center', column.align === 'right' && 'text-right', column.ellipsis && 'truncate')}
                          style={{
                            borderColor: currentTheme.colors?.border,
                            color: currentTheme.colors?.text,
                            textAlign: column.align,
                            ...column.style,
                          }}
                        >
                          {column.render ? column.render(record[column.dataKey || column.key], record, index) : record[column.dataKey || column.key]}
                        </td>
                      ))}
                      {hasExpansion && (
                        <td className={classNames('themed-table-expand', 'border-b px-4 py-2', getSizeClasses())} style={{ borderColor: currentTheme.colors?.border }}>
                          <button onClick={() => handleExpand(record)} className='transform transition-transform' style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', color: currentTheme.colors?.textSecondary }}>
                            ›
                          </button>
                        </td>
                      )}
                    </tr>
                    {hasExpansion && isExpanded && (
                      <tr>
                        <td colSpan={columns.length + (hasSelection ? 1 : 0) + (hasExpansion ? 1 : 0)} className='px-4 py-2 bg-gray-50 dark:bg-gray-800' style={{ backgroundColor: currentTheme.colors?.tableBg }}>
                          {expandedRowRender(record, index, 0, true)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const { current = 1, pageSize = 10, total = dataSource.length, showSizeChanger, showQuickJumper, showTotal } = internalPagination;
    const totalPages = Math.ceil(total / pageSize);
    const startItem = (current - 1) * pageSize + 1;
    const endItem = Math.min(current * pageSize, total);

    return (
      <div className='themed-table-pagination flex items-center justify-between mt-4 px-4 py-2 border rounded-lg'>
        <div className='flex items-center space-x-2'>
          {showTotal && (
            <span className='text-sm' style={{ color: currentTheme.colors?.textSecondary }}>
              {showTotal(total, [startItem, endItem])}
            </span>
          )}
        </div>

        <div className='flex items-center space-x-2'>
          {/* 上一页 */}
          <button
            onClick={() => handlePageChange(current - 1)}
            disabled={current <= 1}
            className={classNames('px-2 py-1 rounded text-sm', current <= 1 && 'opacity-50 cursor-not-allowed')}
            style={{
              backgroundColor: current > 1 ? currentTheme.colors?.primary : currentTheme.colors?.border,
              color: current > 1 ? currentTheme.colors?.white : currentTheme.colors?.text,
            }}
          >
            上一页
          </button>

          {/* 快速跳转 */}
          {showQuickJumper && (
            <div className='flex items-center space-x-1'>
              <span className='text-sm' style={{ color: currentTheme.colors?.textSecondary }}>
                跳至
              </span>
              <input
                type='number'
                min={1}
                max={totalPages}
                value={current}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                  }
                }}
                className='w-12 px-2 py-1 border rounded text-sm text-center'
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

          {/* 下一页 */}
          <button
            onClick={() => handlePageChange(current + 1)}
            disabled={current >= totalPages}
            className={classNames('px-2 py-1 rounded text-sm', current >= totalPages && 'opacity-50 cursor-not-allowed')}
            style={{
              backgroundColor: current < totalPages ? currentTheme.colors?.primary : currentTheme.colors?.border,
              color: current < totalPages ? currentTheme.colors?.white : currentTheme.colors?.text,
            }}
          >
            下一页
          </button>

          {/* 页面大小选择 */}
          {showSizeChanger && (
            <select
              value={pageSize}
              onChange={(e) => handlePageChange(1, parseInt(e.target.value))}
              className='px-2 py-1 border rounded text-sm'
              style={{
                borderColor: currentTheme.colors?.border,
                backgroundColor: currentTheme.colors?.inputBg,
                color: currentTheme.colors?.text,
              }}
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} 条/页
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='themed-table-container'>
      {loading ? (
        <div className='flex items-center justify-center py-8'>
          <div className='flex items-center' style={{ color: currentTheme.colors?.textSecondary }}>
            <span className='mr-2'>加载中...</span>
          </div>
        </div>
      ) : (
        <>
          {renderTable()}
          {renderPagination()}
        </>
      )}
    </div>
  );
};

// Table 组件的子组件
export const SimpleTable: React.FC<Omit<ThemedTableProps, 'pagination' | 'bordered'>> = (props) => <ThemedTable {...props} pagination={false} bordered={false} />;

export const BorderedTable: React.FC<ThemedTableProps> = (props) => <ThemedTable {...props} bordered={true} />;

export const SmallTable: React.FC<Omit<ThemedTableProps, 'size'>> = (props) => <ThemedTable {...props} size='small' />;

export const LargeTable: React.FC<Omit<ThemedTableProps, 'size'>> = (props) => <ThemedTable {...props} size='large' />;

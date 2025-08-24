/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Transfer组件，替换Arco Design Transfer
 * 完全受控于我们自己的主题系统
 */

export type TransferSize = 'small' | 'medium' | 'large';
export type TransferDirection = 'left' | 'right';
export type TransferRender = (item: any) => React.ReactNode;

export interface TransferItem {
  key: string | number;
  title: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  chosen?: boolean;
  [key: string]: any;
}

export interface ThemedTransferProps {
  className?: string;
  dataSource?: TransferItem[];
  targetKeys?: (string | number)[];
  selectedKeys?: (string | number)[];
  defaultTargetKeys?: (string | number)[];
  defaultSelectedKeys?: (string | number)[];
  titles?: [React.ReactNode, React.ReactNode];
  operations?: [React.ReactNode, React.ReactNode];
  showSearch?: boolean;
  filterOption?: (inputValue: string, item: TransferItem) => boolean;
  render?: TransferRender;
  footer?: (props: { direction: TransferDirection; selectedKeys: (string | number)[] }) => React.ReactNode;
  style?: React.CSSProperties;
  listStyle?: React.CSSProperties;
  operationStyle?: React.CSSProperties;
  disabled?: boolean;
  oneWay?: boolean;
  pagination?: boolean;
  onChange?: (targetKeys: (string | number)[], direction: TransferDirection, moveKeys: (string | number)[]) => void;
  onSelectChange?: (sourceSelectedKeys: (string | number)[], targetSelectedKeys: (string | number)[]) => void;
  onSearch?: (direction: TransferDirection, value: string) => void;
  scroll?: { x?: number; y?: number };
}

export const ThemedTransfer: React.FC<ThemedTransferProps> = ({ className, dataSource = [], targetKeys = [], selectedKeys = [], defaultTargetKeys, defaultSelectedKeys, titles = ['源列表', '目标列表'], operations = ['>', '<'], showSearch = false, filterOption, render, footer, style, listStyle, operationStyle, disabled = false, oneWay = false, pagination = false, onChange, onSelectChange, onSearch, scroll }) => {
  const currentTheme = useCurrentTheme();
  const [internalTargetKeys, setInternalTargetKeys] = React.useState<(string | number)[]>(targetKeys || defaultTargetKeys || []);
  const [internalSelectedKeys, setInternalSelectedKeys] = React.useState<{ left: (string | number)[]; right: (string | number)[] }>({
    left: selectedKeys?.filter((key) => !internalTargetKeys.includes(key)) || defaultSelectedKeys?.filter((key) => !internalTargetKeys.includes(key)) || [],
    right: selectedKeys?.filter((key) => internalTargetKeys.includes(key)) || defaultSelectedKeys?.filter((key) => internalTargetKeys.includes(key)) || [],
  });
  const [searchValues, setSearchValues] = React.useState<{ left: string; right: string }>({ left: '', right: '' });

  React.useEffect(() => {
    if (targetKeys !== undefined) {
      setInternalTargetKeys(targetKeys);
    }
  }, [targetKeys]);

  React.useEffect(() => {
    if (selectedKeys !== undefined) {
      const leftKeys = selectedKeys.filter((key) => !internalTargetKeys.includes(key));
      const rightKeys = selectedKeys.filter((key) => internalTargetKeys.includes(key));
      setInternalSelectedKeys({ left: leftKeys, right: rightKeys });
    }
  }, [selectedKeys, internalTargetKeys]);

  const getFilteredDataSource = (direction: TransferDirection) => {
    const searchValue = searchValues[direction];
    const isTarget = direction === 'right';

    return dataSource.filter((item) => {
      const inTarget = internalTargetKeys.includes(item.key);
      if (inTarget !== isTarget) return false;

      if (searchValue && filterOption) {
        return filterOption(searchValue, item);
      }
      if (searchValue) {
        const searchText = searchValue.toLowerCase();
        const title = String(item.title || '').toLowerCase();
        const description = String(item.description || '').toLowerCase();
        return title.includes(searchText) || description.includes(searchText);
      }
      return true;
    });
  };

  const handleSelectChange = (direction: TransferDirection, keys: (string | number)[]) => {
    const newSelectedKeys = { ...internalSelectedKeys, [direction]: keys };
    setInternalSelectedKeys(newSelectedKeys);
    onSelectChange?.(newSelectedKeys.left, newSelectedKeys.right);
  };

  const handleMove = (direction: TransferDirection) => {
    const fromDirection = direction === 'right' ? 'left' : 'right';
    const moveKeys = internalSelectedKeys[fromDirection];

    if (moveKeys.length === 0) return;

    const newTargetKeys = direction === 'right' ? [...internalTargetKeys, ...moveKeys] : internalTargetKeys.filter((key) => !moveKeys.includes(key));

    setInternalTargetKeys(newTargetKeys);
    onChange?.(newTargetKeys, direction, moveKeys);

    // 清空选择
    const newSelectedKeys = { ...internalSelectedKeys, [fromDirection]: [] };
    setInternalSelectedKeys(newSelectedKeys);
    onSelectChange?.(newSelectedKeys.left, newSelectedKeys.right);
  };

  const handleSearch = (direction: TransferDirection, value: string) => {
    setSearchValues({ ...searchValues, [direction]: value });
    onSearch?.(direction, value);
  };

  const renderTransferList = (direction: TransferDirection) => {
    const filteredData = getFilteredDataSource(direction);
    const selectedKeys = internalSelectedKeys[direction];
    const isTarget = direction === 'right';

    return (
      <div
        className={classNames('themed-transfer-list', 'border rounded-lg overflow-hidden', 'flex flex-col')}
        style={{
          borderColor: currentTheme.colors?.border,
          backgroundColor: currentTheme.colors?.cardBg,
          ...listStyle,
        }}
      >
        {/* 列表头部 */}
        <div className='themed-transfer-list-header px-3 py-2 border-b font-medium' style={{ borderColor: currentTheme.colors?.border, color: currentTheme.colors?.text }}>
          <div className='flex items-center justify-between'>
            <span>{titles[isTarget ? 1 : 0]}</span>
            <span className='text-sm' style={{ color: currentTheme.colors?.textSecondary }}>
              {filteredData.length} 项
            </span>
          </div>
        </div>

        {/* 搜索框 */}
        {showSearch && (
          <div className='p-2 border-b' style={{ borderColor: currentTheme.colors?.border }}>
            <input
              type='text'
              value={searchValues[direction]}
              onChange={(e) => handleSearch(direction, e.target.value)}
              placeholder='搜索...'
              className='w-full px-2 py-1 border rounded text-sm outline-none'
              style={{
                borderColor: currentTheme.colors?.border,
                backgroundColor: currentTheme.colors?.inputBg,
                color: currentTheme.colors?.text,
              }}
            />
          </div>
        )}

        {/* 列表内容 */}
        <div className='flex-1 overflow-auto' style={scroll}>
          {filteredData.length === 0 ? (
            <div className='flex items-center justify-center py-8 text-sm' style={{ color: currentTheme.colors?.textSecondary }}>
              暂无数据
            </div>
          ) : (
            <div className='divide-y' style={{ borderColor: currentTheme.colors?.border }}>
              {filteredData.map((item) => (
                <div
                  key={item.key}
                  className={classNames('themed-transfer-item', 'px-3 py-2 cursor-pointer transition-colors', 'hover:bg-gray-100 dark:hover:bg-gray-800', item.disabled && 'opacity-50 cursor-not-allowed', selectedKeys.includes(item.key) && 'bg-blue-50 dark:bg-blue-900')}
                  style={{
                    backgroundColor: selectedKeys.includes(item.key) ? currentTheme.colors?.primary + '10' : 'transparent',
                  }}
                  onClick={() => {
                    if (item.disabled) return;
                    const newSelectedKeys = selectedKeys.includes(item.key) ? selectedKeys.filter((key) => key !== item.key) : [...selectedKeys, item.key];
                    handleSelectChange(direction, newSelectedKeys);
                  }}
                >
                  <div className='flex items-center'>
                    <input type='checkbox' checked={selectedKeys.includes(item.key)} disabled={item.disabled} onChange={() => {}} className='mr-2' style={{ accentColor: currentTheme.colors?.primary }} />
                    <div className='flex-1'>
                      <div className='font-medium' style={{ color: currentTheme.colors?.text }}>
                        {render ? render(item) : item.title}
                      </div>
                      {item.description && (
                        <div className='text-sm mt-1' style={{ color: currentTheme.colors?.textSecondary }}>
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 列表底部 */}
        {footer && (
          <div className='themed-transfer-list-footer px-3 py-2 border-t' style={{ borderColor: currentTheme.colors?.border }}>
            {footer({ direction, selectedKeys })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={classNames('themed-transfer', 'flex items-center space-x-4', className)} style={style}>
      {/* 左侧列表 */}
      {renderTransferList('left')}

      {/* 操作按钮 */}
      <div className='flex flex-col space-y-2'>
        <button
          onClick={() => handleMove('right')}
          disabled={disabled || internalSelectedKeys.left.length === 0}
          className={classNames('themed-transfer-move-right', 'px-3 py-2 rounded transition-colors', 'disabled:opacity-50 disabled:cursor-not-allowed')}
          style={{
            backgroundColor: internalSelectedKeys.left.length > 0 && !disabled ? currentTheme.colors?.primary : currentTheme.colors?.border,
            color: internalSelectedKeys.left.length > 0 && !disabled ? currentTheme.colors?.white : currentTheme.colors?.text,
            ...operationStyle,
          }}
        >
          {operations[0]}
        </button>

        {!oneWay && (
          <button
            onClick={() => handleMove('left')}
            disabled={disabled || internalSelectedKeys.right.length === 0}
            className={classNames('themed-transfer-move-left', 'px-3 py-2 rounded transition-colors', 'disabled:opacity-50 disabled:cursor-not-allowed')}
            style={{
              backgroundColor: internalSelectedKeys.right.length > 0 && !disabled ? currentTheme.colors?.primary : currentTheme.colors?.border,
              color: internalSelectedKeys.right.length > 0 && !disabled ? currentTheme.colors?.white : currentTheme.colors?.text,
              ...operationStyle,
            }}
          >
            {operations[1]}
          </button>
        )}
      </div>

      {/* 右侧列表 */}
      {renderTransferList('right')}
    </div>
  );
};

// Transfer 组件的子组件
export const TransferList: React.FC<Omit<ThemedTransferProps, 'oneWay' | 'operations'>> = (props) => <ThemedTransfer {...props} oneWay={true} operations={['>', '']} />;

export const SearchableTransfer: React.FC<Omit<ThemedTransferProps, 'showSearch'>> = (props) => <ThemedTransfer {...props} showSearch={true} />;

export const OneWayTransfer: React.FC<ThemedTransferProps> = (props) => <ThemedTransfer {...props} oneWay={true} />;

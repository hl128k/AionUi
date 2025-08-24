/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Cascader组件，替换Arco Design Cascader
 * 完全受控于我们自己的主题系统
 */

export type CascaderSize = 'small' | 'medium' | 'large';
export type CascaderExpandTrigger = 'click' | 'hover';
export type CascaderFieldNames = {
  label?: string;
  value?: string;
  children?: string;
  disabled?: string;
  isLeaf?: string;
};
export type CascaderShowSearchType = boolean | { filter?: (inputValue: string, path: any[]) => boolean };

export interface CascaderOption {
  label: React.ReactNode;
  value: string | number;
  children?: CascaderOption[];
  disabled?: boolean;
  isLeaf?: boolean;
  [key: string]: any;
}

export interface ThemedCascaderProps {
  className?: string;
  value?: (string | number)[];
  defaultValue?: (string | number)[];
  options?: CascaderOption[];
  disabled?: boolean;
  size?: CascaderSize;
  placeholder?: string;
  allowClear?: boolean;
  bordered?: boolean;
  expandTrigger?: CascaderExpandTrigger;
  showSearch?: CascaderShowSearchType;
  fieldNames?: CascaderFieldNames;
  changeOnSelect?: boolean;
  multiple?: boolean;
  maxTagCount?: number;
  notFoundContent?: React.ReactNode;
  dropdownStyle?: React.CSSProperties;
  dropdownMenuStyle?: React.CSSProperties;
  getPopupContainer?: () => HTMLElement;
  loading?: boolean;
  loadData?: (selectedOptions: CascaderOption[]) => void;
  onChange?: (value: (string | number)[], selectedOptions: CascaderOption[]) => void;
  onSearch?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onDropdownVisibleChange?: (visible: boolean) => void;
  style?: React.CSSProperties;
}

export const ThemedCascader: React.FC<ThemedCascaderProps> = ({ className, value, defaultValue, options = [], disabled = false, size = 'medium', placeholder = '请选择', allowClear = true, bordered = true, expandTrigger = 'click', showSearch = false, fieldNames, changeOnSelect = false, multiple = false, maxTagCount, notFoundContent, dropdownStyle, dropdownMenuStyle, getPopupContainer, loading = false, loadData, onChange, onSearch, onFocus, onBlur, onDropdownVisibleChange, style }) => {
  const currentTheme = useCurrentTheme();
  const [internalValue, setInternalValue] = React.useState<(string | number)[]>(value || defaultValue || []);
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [expandedKeys, setExpandedKeys] = React.useState<string[]>([]);
  const [selectedPath, setSelectedPath] = React.useState<CascaderOption[]>([]);
  const cascaderRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value || []);
    }
  }, [value]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cascaderRef.current && !cascaderRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchValue('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getFieldNames = () => ({
    label: fieldNames?.label || 'label',
    value: fieldNames?.value || 'value',
    children: fieldNames?.children || 'children',
    disabled: fieldNames?.disabled || 'disabled',
    isLeaf: fieldNames?.isLeaf || 'isLeaf',
  });

  const findOptionByPath = (path: (string | number)[]): CascaderOption[] => {
    const { value: valueField, children: childrenField } = getFieldNames();
    const result: CascaderOption[] = [];

    let currentOptions = options;
    for (const val of path) {
      const option = currentOptions.find((opt) => opt[valueField] === val);
      if (option) {
        result.push(option);
        currentOptions = option[childrenField] || [];
      } else {
        break;
      }
    }

    return result;
  };

  const handleOptionClick = (option: CascaderOption, level: number, path: CascaderOption[]) => {
    const { value: valueField, children: childrenField, disabled: disabledField } = getFieldNames();

    if (option[disabledField]) {
      return;
    }

    const newPath = [...path, option];
    const newPathValues = newPath.map((opt) => opt[valueField]);

    if (changeOnSelect || !option[childrenField] || option.isLeaf) {
      setInternalValue(newPathValues);
      setSelectedPath(newPath);
      onChange?.(newPathValues, newPath);

      if (!multiple) {
        setIsOpen(false);
        setSearchValue('');
      }
    }

    if (option[childrenField] && !option.isLeaf) {
      const optionKey = `${level}-${option[valueField]}`;
      if (expandedKeys.includes(optionKey)) {
        setExpandedKeys(expandedKeys.filter((key) => key !== optionKey));
      } else {
        setExpandedKeys([...expandedKeys, optionKey]);
      }
    }

    if (loadData && option.isLeaf === false && !option[childrenField]) {
      loadData(newPath);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalValue([]);
    setSelectedPath([]);
    onChange?.([], []);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  const filterOptions = (searchText: string): CascaderOption[] => {
    const { label: labelField, value: valueField, children: childrenField } = getFieldNames();

    const searchInOptions = (opts: CascaderOption[], parentPath: CascaderOption[] = []): CascaderOption[] => {
      const result: CascaderOption[] = [];

      for (const option of opts) {
        const currentPath = [...parentPath, option];
        const label = String(option[labelField] || '');
        const value = String(option[valueField] || '');

        if (label.toLowerCase().includes(searchText.toLowerCase()) || value.toLowerCase().includes(searchText.toLowerCase())) {
          result.push(option);
        }

        if (option[childrenField]) {
          const childResults = searchInOptions(option[childrenField], currentPath);
          result.push(...childResults);
        }
      }

      return result;
    };

    return searchInOptions(options);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm px-2 py-1';
      case 'large':
        return 'text-lg px-4 py-2';
      default:
        return 'text-base px-3 py-1.5';
    }
  };

  const renderSelectedTags = () => {
    if (internalValue.length === 0) {
      return (
        <span className='text-gray-400' style={{ color: currentTheme.colors?.textSecondary }}>
          {placeholder}
        </span>
      );
    }

    const selectedOptions = findOptionByPath(internalValue);

    if (multiple) {
      const displayTags = maxTagCount ? selectedOptions.slice(0, maxTagCount) : selectedOptions;
      const remainingCount = selectedOptions.length - displayTags.length;

      return (
        <div className='flex flex-wrap gap-1'>
          {displayTags.map((option, index) => (
            <span
              key={index}
              className='px-2 py-1 text-xs rounded-full'
              style={{
                backgroundColor: currentTheme.colors?.primary + '20',
                color: currentTheme.colors?.primary,
              }}
            >
              {option.label}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className='px-2 py-1 text-xs rounded-full' style={{ color: currentTheme.colors?.textSecondary }}>
              +{remainingCount}
            </span>
          )}
        </div>
      );
    }

    return <span style={{ color: currentTheme.colors?.text }}>{selectedOptions.map((opt) => opt.label).join(' / ')}</span>;
  };

  const renderOption = (option: CascaderOption, level: number = 0, path: CascaderOption[] = []) => {
    const { label: labelField, value: valueField, children: childrenField, disabled: disabledField } = getFieldNames();
    const optionKey = `${level}-${option[valueField]}`;
    const isExpanded = expandedKeys.includes(optionKey);
    const hasChildren = option[childrenField] && option[childrenField].length > 0;
    const isDisabled = option[disabledField];

    const currentPath = [...path, option];
    const isSelected = internalValue.length > level && internalValue[level] === option[valueField];

    return (
      <div key={optionKey}>
        <div
          className={classNames('themed-cascader-option', 'flex items-center justify-between px-3 py-2 cursor-pointer transition-colors', 'hover:bg-gray-100 dark:hover:bg-gray-800', isDisabled && 'opacity-50 cursor-not-allowed', isSelected && 'font-medium')}
          style={{
            backgroundColor: isSelected ? currentTheme.colors?.primary + '10' : 'transparent',
            color: isSelected ? currentTheme.colors?.primary : currentTheme.colors?.text,
          }}
          onClick={() => !isDisabled && handleOptionClick(option, level, path)}
        >
          <div className='flex items-center'>
            {level > 0 && (
              <span className='mr-2' style={{ color: currentTheme.colors?.textSecondary }}>
                {'  '.repeat(level)}
              </span>
            )}
            <span>{option[labelField]}</span>
          </div>
          {hasChildren && (
            <span className='transform transition-transform' style={{ transform: isExpanded ? 'rotate(90deg)' : 'none' }}>
              ›
            </span>
          )}
        </div>

        {hasChildren && isExpanded && <div>{option[childrenField]?.map((childOption: CascaderOption) => renderOption(childOption, level + 1, currentPath))}</div>}
      </div>
    );
  };

  const renderDropdown = () => {
    if (!isOpen) return null;

    const filteredOptions = searchValue ? filterOptions(searchValue) : options;

    return (
      <div
        className='themed-cascader-dropdown absolute z-50 mt-2 border rounded-lg shadow-xl w-80 max-h-96 overflow-hidden'
        style={{
          backgroundColor: currentTheme.colors?.cardBg,
          borderColor: currentTheme.colors?.border,
          ...dropdownStyle,
        }}
      >
        {/* 搜索框 */}
        {showSearch && (
          <div className='p-2 border-b' style={{ borderColor: currentTheme.colors?.border }}>
            <input
              type='text'
              value={searchValue}
              onChange={handleSearch}
              placeholder='搜索...'
              className='w-full px-3 py-1 border rounded text-sm outline-none'
              style={{
                borderColor: currentTheme.colors?.border,
                backgroundColor: currentTheme.colors?.inputBg,
                color: currentTheme.colors?.text,
              }}
            />
          </div>
        )}

        {/* 选项列表 */}
        <div className='max-h-80 overflow-y-auto' style={dropdownMenuStyle}>
          {loading ? (
            <div className='flex items-center justify-center py-8' style={{ color: currentTheme.colors?.textSecondary }}>
              <span className='mr-2'>加载中...</span>
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className='flex items-center justify-center py-8' style={{ color: currentTheme.colors?.textSecondary }}>
              {notFoundContent || '暂无数据'}
            </div>
          ) : (
            filteredOptions.map((option) => renderOption(option))
          )}
        </div>
      </div>
    );
  };

  return (
    <div ref={cascaderRef} className={classNames('themed-cascader', 'relative', className)}>
      <div
        className={classNames('themed-cascader-input', 'flex items-center border rounded-lg transition-all duration-200', 'hover:shadow-md', disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer', bordered ? 'border' : 'border-0', getSizeClasses())}
        style={{
          borderColor: currentTheme.colors?.border,
          backgroundColor: currentTheme.colors?.inputBg,
          ...style,
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className='flex-1 min-h-6'>{renderSelectedTags()}</div>

        {allowClear && internalValue.length > 0 && !disabled && (
          <button onClick={handleClear} className='p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors' style={{ color: currentTheme.colors?.textSecondary }}>
            ✕
          </button>
        )}

        <span className='ml-2' style={{ color: currentTheme.colors?.textSecondary }}>
          {loading ? '⏳' : '▼'}
        </span>
      </div>

      {renderDropdown()}
    </div>
  );
};

// Cascader 组件的子组件
export const CascaderPanel: React.FC<Omit<ThemedCascaderProps, 'multiple' | 'maxTagCount'>> = (props) => <ThemedCascader {...props} multiple={false} />;

export const MultipleCascader: React.FC<ThemedCascaderProps> = (props) => <ThemedCascader {...props} multiple={true} />;

export const SearchableCascader: React.FC<Omit<ThemedCascaderProps, 'showSearch'>> = (props) => <ThemedCascader {...props} showSearch={true} />;

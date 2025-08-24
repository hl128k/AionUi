/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化DatePicker组件，替换Arco Design DatePicker
 * 完全受控于我们自己的主题系统
 */

export type DatePickerSize = 'small' | 'medium' | 'large';
export type DatePickerMode = 'date' | 'week' | 'month' | 'quarter' | 'year';
export type PickerPosition = 'top' | 'bottom' | 'left' | 'right';

export interface DateValue {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
}

export interface ThemedDatePickerProps {
  className?: string;
  value?: Date | string;
  defaultValue?: Date | string;
  disabled?: boolean;
  size?: DatePickerSize;
  mode?: DatePickerMode;
  placeholder?: string;
  format?: string;
  showTime?: boolean;
  disabledDate?: (date: Date) => boolean;
  onChange?: (date: Date | null, dateString: string) => void;
  onPanelChange?: (date: Date, mode: DatePickerMode) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: React.CSSProperties;
  popupStyle?: React.CSSProperties;
  getPopupContainer?: () => HTMLElement;
  allowClear?: boolean;
  inputReadOnly?: boolean;
  bordered?: boolean;
}

export const ThemedDatePicker: React.FC<ThemedDatePickerProps> = ({ className, value, defaultValue, disabled = false, size = 'medium', mode = 'date', placeholder = '选择日期', format = 'YYYY-MM-DD', showTime = false, disabledDate, onChange, onPanelChange, onFocus, onBlur, style, popupStyle, getPopupContainer, allowClear = true, inputReadOnly = false, bordered = true }) => {
  const currentTheme = useCurrentTheme();
  const [internalValue, setInternalValue] = React.useState<Date | null>(value ? new Date(value) : defaultValue ? new Date(defaultValue) : null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMode, setCurrentMode] = React.useState<DatePickerMode>(mode);
  const [currentDate, setCurrentDate] = React.useState<Date>(internalValue || new Date());
  const pickerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value ? new Date(value) : null);
    }
  }, [value]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');

    return format.replace('YYYY', String(year)).replace('MM', month).replace('DD', day).replace('HH', hour).replace('mm', minute).replace('ss', second);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (!inputValue) {
      setInternalValue(null);
      onChange?.(null, '');
      return;
    }

    // 简单的日期解析
    const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = inputValue.match(dateRegex);

    if (match) {
      const [, year, month, day] = match;
      const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      if (!isNaN(newDate.getTime())) {
        setInternalValue(newDate);
        onChange?.(newDate, inputValue);
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    setInternalValue(date);
    onChange?.(date, formatDate(date));

    if (!showTime) {
      setIsOpen(false);
    }
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

  const renderCalendar = () => {
    if (!isOpen) return null;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    const isCurrentMonth = (date: Date) => date.getMonth() === month;
    const isToday = (date: Date) => {
      const today = new Date();
      return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };
    const isSelected = (date: Date) => {
      return internalValue && date.getDate() === internalValue.getDate() && date.getMonth() === internalValue.getMonth() && date.getFullYear() === internalValue.getFullYear();
    };
    const isDisabled = (date: Date) => disabledDate?.(date) || false;

    return (
      <div
        className='themed-datepicker-calendar absolute z-50 mt-2 p-4 border rounded-lg shadow-xl w-80'
        style={{
          backgroundColor: currentTheme.colors?.cardBg,
          borderColor: currentTheme.colors?.border,
          ...popupStyle,
        }}
      >
        {/* 月份导航 */}
        <div className='flex items-center justify-between mb-4'>
          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setCurrentDate(newDate);
            }}
            className='p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
            style={{ color: currentTheme.colors?.text }}
          >
            ‹
          </button>

          <div className='font-medium' style={{ color: currentTheme.colors?.text }}>
            {year}年{month + 1}月
          </div>

          <button
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setCurrentDate(newDate);
            }}
            className='p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
            style={{ color: currentTheme.colors?.text }}
          >
            ›
          </button>
        </div>

        {/* 星期标题 */}
        <div className='grid grid-cols-7 gap-1 mb-2'>
          {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
            <div key={index} className='text-center text-sm font-medium py-1' style={{ color: currentTheme.colors?.textSecondary }}>
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className='grid grid-cols-7 gap-1'>
          {days.map((date, index) => {
            const currentMonth = isCurrentMonth(date);
            const today = isToday(date);
            const selected = isSelected(date);
            const disabled = isDisabled(date);

            return (
              <button
                key={index}
                onClick={() => !disabled && handleDateSelect(date)}
                disabled={disabled}
                className={classNames('themed-datepicker-day', 'w-8 h-8 rounded text-sm transition-all duration-200', 'flex items-center justify-center', !currentMonth && 'opacity-30', disabled && 'opacity-50 cursor-not-allowed', !disabled && !selected && 'hover:bg-gray-100 dark:hover:bg-gray-800', selected && 'text-white font-medium', today && !selected && 'border-2')}
                style={{
                  backgroundColor: selected ? currentTheme.colors?.primary : 'transparent',
                  color: selected ? currentTheme.colors?.white : currentMonth ? currentTheme.colors?.text : currentTheme.colors?.textSecondary,
                  borderColor: today ? currentTheme.colors?.primary : 'transparent',
                }}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {/* 时间选择器 */}
        {showTime && (
          <div className='mt-4 pt-4 border-t' style={{ borderColor: currentTheme.colors?.border }}>
            <div className='flex items-center space-x-2'>
              <input
                type='number'
                min='0'
                max='23'
                value={internalValue?.getHours() || 0}
                onChange={(e) => {
                  if (internalValue) {
                    const newDate = new Date(internalValue);
                    newDate.setHours(parseInt(e.target.value) || 0);
                    setInternalValue(newDate);
                  }
                }}
                className='w-12 px-2 py-1 border rounded text-sm'
                style={{
                  borderColor: currentTheme.colors?.border,
                  backgroundColor: currentTheme.colors?.inputBg,
                  color: currentTheme.colors?.text,
                }}
              />
              <span style={{ color: currentTheme.colors?.text }}>:</span>
              <input
                type='number'
                min='0'
                max='59'
                value={internalValue?.getMinutes() || 0}
                onChange={(e) => {
                  if (internalValue) {
                    const newDate = new Date(internalValue);
                    newDate.setMinutes(parseInt(e.target.value) || 0);
                    setInternalValue(newDate);
                  }
                }}
                className='w-12 px-2 py-1 border rounded text-sm'
                style={{
                  borderColor: currentTheme.colors?.border,
                  backgroundColor: currentTheme.colors?.inputBg,
                  color: currentTheme.colors?.text,
                }}
              />
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className='flex justify-end mt-4 space-x-2'>
          <button
            onClick={() => setIsOpen(false)}
            className='px-3 py-1 text-sm rounded transition-colors'
            style={{
              color: currentTheme.colors?.text,
              backgroundColor: currentTheme.colors?.border,
            }}
          >
            取消
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              if (internalValue) {
                onChange?.(internalValue, formatDate(internalValue));
              }
            }}
            className='px-3 py-1 text-sm rounded transition-colors'
            style={{
              color: currentTheme.colors?.white,
              backgroundColor: currentTheme.colors?.primary,
            }}
          >
            确定
          </button>
        </div>
      </div>
    );
  };

  return (
    <div ref={pickerRef} className={classNames('themed-datepicker', 'relative', className)}>
      <div
        className={classNames('themed-datepicker-input', 'flex items-center border rounded-lg transition-all duration-200', 'hover:shadow-md', disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer', bordered ? 'border' : 'border-0', getSizeClasses())}
        style={{
          borderColor: currentTheme.colors?.border,
          backgroundColor: currentTheme.colors?.inputBg,
          ...style,
        }}
        onClick={() => !disabled && !inputReadOnly && setIsOpen(!isOpen)}
      >
        <input ref={inputRef} type='text' value={internalValue ? formatDate(internalValue) : ''} onChange={handleInputChange} placeholder={placeholder} disabled={disabled} readOnly={inputReadOnly} onFocus={onFocus} onBlur={onBlur} className='flex-1 bg-transparent outline-none' style={{ color: currentTheme.colors?.text }} />

        {allowClear && internalValue && !disabled && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setInternalValue(null);
              onChange?.(null, '');
            }}
            className='p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
            style={{ color: currentTheme.colors?.textSecondary }}
          >
            ✕
          </button>
        )}

        <span className='ml-2' style={{ color: currentTheme.colors?.textSecondary }}>
          📅
        </span>
      </div>

      {renderCalendar()}
    </div>
  );
};

// DatePicker 组件的子组件
export const DateRangePicker: React.FC<Omit<ThemedDatePickerProps, 'mode'>> = (props) => <ThemedDatePicker {...props} mode='date' />;

export const MonthPicker: React.FC<Omit<ThemedDatePickerProps, 'mode'>> = (props) => <ThemedDatePicker {...props} mode='month' format='YYYY-MM' />;

export const YearPicker: React.FC<Omit<ThemedDatePickerProps, 'mode'>> = (props) => <ThemedDatePicker {...props} mode='year' format='YYYY' />;

export const WeekPicker: React.FC<Omit<ThemedDatePickerProps, 'mode'>> = (props) => <ThemedDatePicker {...props} mode='week' />;

export const QuarterPicker: React.FC<Omit<ThemedDatePickerProps, 'mode'>> = (props) => <ThemedDatePicker {...props} mode='quarter' />;

export const TimePicker: React.FC<Omit<ThemedDatePickerProps, 'showTime' | 'mode'>> = (props) => <ThemedDatePicker {...props} showTime={true} format='HH:mm:ss' />;

export const DateTimePicker: React.FC<Omit<ThemedDatePickerProps, 'showTime'>> = (props) => <ThemedDatePicker {...props} showTime={true} format='YYYY-MM-DD HH:mm:ss' />;

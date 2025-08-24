/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化TimePicker组件，替换Arco Design TimePicker
 * 完全受控于我们自己的主题系统
 */

export type TimePickerSize = 'small' | 'medium' | 'large';
export type TimePickerFormat = '12' | '24';
export type TimePickerMode = 'hour' | 'minute' | 'second';

export interface TimeValue {
  hour: number;
  minute: number;
  second?: number;
}

export interface ThemedTimePickerProps {
  className?: string;
  value?: TimeValue | string;
  defaultValue?: TimeValue | string;
  disabled?: boolean;
  size?: TimePickerSize;
  format?: TimePickerFormat;
  placeholder?: string;
  showSecond?: boolean;
  use12Hours?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
  onChange?: (time: TimeValue, timeString: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: React.CSSProperties;
  popupStyle?: React.CSSProperties;
  getPopupContainer?: () => HTMLElement;
  allowClear?: boolean;
  inputReadOnly?: boolean;
  bordered?: boolean;
}

export const ThemedTimePicker: React.FC<ThemedTimePickerProps> = ({ className, value, defaultValue, disabled = false, size = 'medium', format = '24', placeholder = '选择时间', showSecond = false, use12Hours = false, hourStep = 1, minuteStep = 1, secondStep = 1, disabledHours, disabledMinutes, disabledSeconds, onChange, onFocus, onBlur, style, popupStyle, getPopupContainer, allowClear = true, inputReadOnly = false, bordered = true }) => {
  const currentTheme = useCurrentTheme();
  const [internalValue, setInternalValue] = React.useState<TimeValue>(() => {
    if (value) {
      return typeof value === 'string' ? parseTimeString(value) : value;
    }
    if (defaultValue) {
      return typeof defaultValue === 'string' ? parseTimeString(defaultValue) : defaultValue;
    }
    return { hour: 0, minute: 0, second: 0 };
  });
  const [isOpen, setIsOpen] = React.useState(false);
  const pickerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(typeof value === 'string' ? parseTimeString(value) : value);
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

  const parseTimeString = (timeString: string): TimeValue => {
    const timeRegex = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\s*([AP]M))?$/i;
    const match = timeString.match(timeRegex);

    if (match) {
      let hour = parseInt(match[1]);
      const minute = parseInt(match[2]);
      const second = match[3] ? parseInt(match[3]) : 0;
      const ampm = match[4];

      if (use12Hours && ampm) {
        if (ampm.toUpperCase() === 'PM' && hour !== 12) {
          hour += 12;
        } else if (ampm.toUpperCase() === 'AM' && hour === 12) {
          hour = 0;
        }
      }

      return { hour, minute, second };
    }

    return { hour: 0, minute: 0, second: 0 };
  };

  const formatTime = (time: TimeValue): string => {
    let hour = time.hour;
    const minute = time.minute;
    const second = time.second || 0;
    let ampm = '';

    if (use12Hours) {
      ampm = hour >= 12 ? ' PM' : ' AM';
      hour = hour % 12 || 12;
    }

    const hourStr = String(hour).padStart(2, '0');
    const minuteStr = String(minute).padStart(2, '0');
    const secondStr = String(second).padStart(2, '0');

    return `${hourStr}:${minuteStr}${showSecond ? ':' + secondStr : ''}${ampm}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (!inputValue) {
      setInternalValue({ hour: 0, minute: 0, second: 0 });
      onChange?.({ hour: 0, minute: 0, second: 0 }, '');
      return;
    }

    const parsedTime = parseTimeString(inputValue);
    setInternalValue(parsedTime);
    onChange?.(parsedTime, inputValue);
  };

  const handleTimeChange = (type: TimePickerMode, value: number) => {
    const newTime = { ...internalValue, [type]: value };
    setInternalValue(newTime);
    onChange?.(newTime, formatTime(newTime));
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

  const isHourDisabled = (hour: number): boolean => {
    return disabledHours?.().includes(hour) || false;
  };

  const isMinuteDisabled = (hour: number, minute: number): boolean => {
    return disabledMinutes?.(hour).includes(minute) || false;
  };

  const isSecondDisabled = (hour: number, minute: number, second: number): boolean => {
    return disabledSeconds?.(hour, minute).includes(second) || false;
  };

  const renderTimePanel = () => {
    if (!isOpen) return null;

    const hours = Array.from({ length: use12Hours ? 12 : 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);
    const seconds = Array.from({ length: 60 }, (_, i) => i);

    return (
      <div
        className='themed-timepicker-panel absolute z-50 mt-2 p-4 border rounded-lg shadow-xl w-64'
        style={{
          backgroundColor: currentTheme.colors?.cardBg,
          borderColor: currentTheme.colors?.border,
          ...popupStyle,
        }}
      >
        <div className='flex space-x-2'>
          {/* 小时选择器 */}
          <div className='flex-1'>
            <div className='text-sm font-medium mb-2' style={{ color: currentTheme.colors?.textSecondary }}>
              时
            </div>
            <div className='grid grid-cols-4 gap-1 max-h-32 overflow-y-auto'>
              {hours.map((hour) => {
                const disabled = isHourDisabled(hour);
                const selected = internalValue.hour === hour;
                const displayHour = use12Hours ? hour % 12 || 12 : hour;

                return (
                  <button
                    key={hour}
                    onClick={() => !disabled && handleTimeChange('hour', hour)}
                    disabled={disabled}
                    className={classNames('themed-timepicker-hour', 'p-1 text-xs rounded transition-colors', disabled && 'opacity-50 cursor-not-allowed', !disabled && !selected && 'hover:bg-gray-100 dark:hover:bg-gray-800', selected && 'text-white font-medium')}
                    style={{
                      backgroundColor: selected ? currentTheme.colors?.primary : 'transparent',
                      color: selected ? currentTheme.colors?.white : currentTheme.colors?.text,
                    }}
                  >
                    {String(displayHour).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 分钟选择器 */}
          <div className='flex-1'>
            <div className='text-sm font-medium mb-2' style={{ color: currentTheme.colors?.textSecondary }}>
              分
            </div>
            <div className='grid grid-cols-4 gap-1 max-h-32 overflow-y-auto'>
              {minutes.map((minute) => {
                const disabled = isMinuteDisabled(internalValue.hour, minute);
                const selected = internalValue.minute === minute;

                return (
                  <button
                    key={minute}
                    onClick={() => !disabled && handleTimeChange('minute', minute)}
                    disabled={disabled}
                    className={classNames('themed-timepicker-minute', 'p-1 text-xs rounded transition-colors', disabled && 'opacity-50 cursor-not-allowed', !disabled && !selected && 'hover:bg-gray-100 dark:hover:bg-gray-800', selected && 'text-white font-medium')}
                    style={{
                      backgroundColor: selected ? currentTheme.colors?.primary : 'transparent',
                      color: selected ? currentTheme.colors?.white : currentTheme.colors?.text,
                    }}
                  >
                    {String(minute).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 秒选择器 */}
          {showSecond && (
            <div className='flex-1'>
              <div className='text-sm font-medium mb-2' style={{ color: currentTheme.colors?.textSecondary }}>
                秒
              </div>
              <div className='grid grid-cols-4 gap-1 max-h-32 overflow-y-auto'>
                {seconds.map((second) => {
                  const disabled = isSecondDisabled(internalValue.hour, internalValue.minute, second);
                  const selected = internalValue.second === second;

                  return (
                    <button
                      key={second}
                      onClick={() => !disabled && handleTimeChange('second', second)}
                      disabled={disabled}
                      className={classNames('themed-timepicker-second', 'p-1 text-xs rounded transition-colors', disabled && 'opacity-50 cursor-not-allowed', !disabled && !selected && 'hover:bg-gray-100 dark:hover:bg-gray-800', selected && 'text-white font-medium')}
                      style={{
                        backgroundColor: selected ? currentTheme.colors?.primary : 'transparent',
                        color: selected ? currentTheme.colors?.white : currentTheme.colors?.text,
                      }}
                    >
                      {String(second).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* AM/PM 选择器 */}
        {use12Hours && (
          <div className='mt-4 pt-4 border-t' style={{ borderColor: currentTheme.colors?.border }}>
            <div className='flex space-x-2'>
              <button
                onClick={() => handleTimeChange('hour', internalValue.hour % 12)}
                className={classNames('themed-timepicker-am', 'flex-1 py-1 px-2 text-sm rounded transition-colors', internalValue.hour < 12 ? 'text-white font-medium' : '')}
                style={{
                  backgroundColor: internalValue.hour < 12 ? currentTheme.colors?.primary : currentTheme.colors?.border,
                  color: internalValue.hour < 12 ? currentTheme.colors?.white : currentTheme.colors?.text,
                }}
              >
                AM
              </button>
              <button
                onClick={() => handleTimeChange('hour', (internalValue.hour % 12) + 12)}
                className={classNames('themed-timepicker-pm', 'flex-1 py-1 px-2 text-sm rounded transition-colors', internalValue.hour >= 12 ? 'text-white font-medium' : '')}
                style={{
                  backgroundColor: internalValue.hour >= 12 ? currentTheme.colors?.primary : currentTheme.colors?.border,
                  color: internalValue.hour >= 12 ? currentTheme.colors?.white : currentTheme.colors?.text,
                }}
              >
                PM
              </button>
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
              onChange?.(internalValue, formatTime(internalValue));
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
    <div ref={pickerRef} className={classNames('themed-timepicker', 'relative', className)}>
      <div
        className={classNames('themed-timepicker-input', 'flex items-center border rounded-lg transition-all duration-200', 'hover:shadow-md', disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer', bordered ? 'border' : 'border-0', getSizeClasses())}
        style={{
          borderColor: currentTheme.colors?.border,
          backgroundColor: currentTheme.colors?.inputBg,
          ...style,
        }}
        onClick={() => !disabled && !inputReadOnly && setIsOpen(!isOpen)}
      >
        <input ref={inputRef} type='text' value={formatTime(internalValue)} onChange={handleInputChange} placeholder={placeholder} disabled={disabled} readOnly={inputReadOnly} onFocus={onFocus} onBlur={onBlur} className='flex-1 bg-transparent outline-none' style={{ color: currentTheme.colors?.text }} />

        {allowClear && !disabled && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setInternalValue({ hour: 0, minute: 0, second: 0 });
              onChange?.({ hour: 0, minute: 0, second: 0 }, '');
            }}
            className='p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
            style={{ color: currentTheme.colors?.textSecondary }}
          >
            ✕
          </button>
        )}

        <span className='ml-2' style={{ color: currentTheme.colors?.textSecondary }}>
          🕐
        </span>
      </div>

      {renderTimePanel()}
    </div>
  );
};

// TimePicker 组件的子组件
export const TimeRangePicker: React.FC<Omit<ThemedTimePickerProps, 'use12Hours'>> = (props) => (
  <div className='flex space-x-2'>
    <ThemedTimePicker {...props} placeholder='开始时间' />
    <span style={{ color: 'currentColor' }}>至</span>
    <ThemedTimePicker {...props} placeholder='结束时间' />
  </div>
);

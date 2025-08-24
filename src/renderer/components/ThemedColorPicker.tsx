/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

/**
 * 内部主题化ColorPicker组件，替换Arco Design ColorPicker
 * 完全受控于我们自己的主题系统
 */

export type ColorPickerSize = 'small' | 'medium' | 'large';
export type ColorPickerFormat = 'hex' | 'rgb' | 'hsl';

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface ThemedColorPickerProps {
  className?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  size?: ColorPickerSize;
  format?: ColorPickerFormat;
  showText?: boolean;
  showHistory?: boolean;
  showPreset?: boolean;
  presetColors?: string[];
  allowClear?: boolean;
  onChange?: (color: string) => void;
  onChangeComplete?: (color: string) => void;
  onClear?: () => void;
  placeholder?: string;
  trigger?: 'click' | 'hover';
  children?: ReactNode;
}

export const ThemedColorPicker: React.FC<ThemedColorPickerProps> = ({ className, value, defaultValue = '#3b82f6', disabled = false, size = 'medium', format = 'hex', showText = true, showHistory = true, showPreset = true, presetColors = ['#3b82f6', '#ef4444', '#34d399', '#fbbf24', '#a855f7', '#22d3ee', '#ec4899', '#a3e635', '#f97316', '#6b7280'], allowClear = false, onChange, onChangeComplete, onClear, placeholder = '选择颜色', trigger = 'click', children }) => {
  const currentTheme = useCurrentTheme();
  const [internalValue, setInternalValue] = React.useState(value || defaultValue);
  const [isOpen, setIsOpen] = React.useState(false);
  const [historyColors, setHistoryColors] = React.useState<string[]>([]);
  const pickerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hexToRgb = (hex: string): Color => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
          a: 1,
        }
      : { r: 0, g: 0, b: 0, a: 1 };
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const formatColor = (color: string): string => {
    const rgb = hexToRgb(color);
    switch (format) {
      case 'rgb':
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      case 'hsl':
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
      default:
        return color;
    }
  };

  const handleColorChange = (color: string) => {
    setInternalValue(color);
    onChange?.(color);

    // 添加到历史记录
    if (!historyColors.includes(color)) {
      const newHistory = [color, ...historyColors].slice(0, 10);
      setHistoryColors(newHistory);
    }
  };

  const handleColorComplete = (color: string) => {
    onChangeComplete?.(color);
  };

  const handleClear = () => {
    setInternalValue(defaultValue);
    onClear?.();
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8 text-sm';
      case 'large':
        return 'w-12 h-12 text-lg';
      default:
        return 'w-10 h-10 text-base';
    }
  };

  const renderColorInput = () => {
    return (
      <div
        className={classNames('themed-color-picker-input', 'flex items-center border rounded-lg cursor-pointer', 'transition-all duration-200 hover:shadow-md', disabled ? 'opacity-50 cursor-not-allowed' : '', getSizeClasses())}
        style={{
          borderColor: currentTheme.colors?.border,
          backgroundColor: currentTheme.colors?.cardBg,
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div
          className='w-6 h-6 rounded-md border mr-2'
          style={{
            backgroundColor: internalValue,
            borderColor: currentTheme.colors?.border,
          }}
        />
        {showText && (
          <span className='flex-1 text-sm font-mono' style={{ color: currentTheme.colors?.text }}>
            {formatColor(internalValue)}
          </span>
        )}
        <span className='ml-2' style={{ color: currentTheme.colors?.textSecondary }}>
          🎨
        </span>
      </div>
    );
  };

  const renderColorPanel = () => {
    if (!isOpen) return null;

    return (
      <div
        className='themed-color-picker-panel absolute z-50 mt-2 p-4 border rounded-lg shadow-xl'
        style={{
          backgroundColor: currentTheme.colors?.cardBg,
          borderColor: currentTheme.colors?.border,
        }}
      >
        {/* 颜色选择器 */}
        <div className='mb-4'>
          <div className='text-sm font-medium mb-2' style={{ color: currentTheme.colors?.text }}>
            选择颜色
          </div>
          <div className='grid grid-cols-8 gap-2'>
            {presetColors.map((color, index) => (
              <div
                key={index}
                className='w-8 h-8 rounded-md cursor-pointer border transition-all duration-200 hover:scale-110'
                style={{
                  backgroundColor: color,
                  borderColor: currentTheme.colors?.border,
                }}
                onClick={() => {
                  handleColorChange(color);
                  handleColorComplete(color);
                }}
              />
            ))}
          </div>
        </div>

        {/* 历史颜色 */}
        {showHistory && historyColors.length > 0 && (
          <div className='mb-4'>
            <div className='text-sm font-medium mb-2' style={{ color: currentTheme.colors?.text }}>
              最近使用
            </div>
            <div className='flex flex-wrap gap-2'>
              {historyColors.map((color, index) => (
                <div
                  key={index}
                  className='w-8 h-8 rounded-md cursor-pointer border transition-all duration-200 hover:scale-110'
                  style={{
                    backgroundColor: color,
                    borderColor: currentTheme.colors?.border,
                  }}
                  onClick={() => {
                    handleColorChange(color);
                    handleColorComplete(color);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 自定义输入 */}
        <div className='mb-4'>
          <div className='text-sm font-medium mb-2' style={{ color: currentTheme.colors?.text }}>
            自定义颜色
          </div>
          <input
            type='color'
            value={internalValue}
            onChange={(e) => {
              handleColorChange(e.target.value);
              handleColorComplete(e.target.value);
            }}
            className='w-full h-10 rounded cursor-pointer'
            disabled={disabled}
          />
        </div>

        {/* 格式化显示 */}
        <div className='mb-4'>
          <div className='text-sm font-medium mb-2' style={{ color: currentTheme.colors?.text }}>
            颜色值
          </div>
          <div className='space-y-2'>
            <div className='flex items-center space-x-2'>
              <span className='text-sm' style={{ color: currentTheme.colors?.textSecondary }}>
                HEX:
              </span>
              <input
                type='text'
                value={internalValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^#[0-9A-F]{6}$/i.test(value)) {
                    handleColorChange(value);
                  }
                }}
                className='flex-1 px-2 py-1 border rounded text-sm font-mono'
                style={{
                  borderColor: currentTheme.colors?.border,
                  backgroundColor: currentTheme.colors?.inputBg,
                  color: currentTheme.colors?.text,
                }}
                disabled={disabled}
              />
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className='flex justify-between items-center'>
          {allowClear && (
            <button
              onClick={handleClear}
              className='px-3 py-1 text-sm rounded transition-colors'
              style={{
                color: currentTheme.colors?.error,
                backgroundColor: `${currentTheme.colors?.error}10`,
              }}
            >
              清除
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
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
    <div ref={pickerRef} className={classNames('themed-color-picker', 'relative', className)}>
      {children || renderColorInput()}
      {renderColorPanel()}
    </div>
  );
};

// ColorPicker 组件的子组件
export const ColorPickerTrigger: React.FC<ThemedColorPickerProps> = (props) => <ThemedColorPicker {...props} />;

export const ColorPickerBlock: React.FC<ThemedColorPickerProps> = (props) => <ThemedColorPicker {...props} />;

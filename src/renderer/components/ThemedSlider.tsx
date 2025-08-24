/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Slider组件，替换Arco Design Slider
 * 完全受控于我们自己的主题系统
 */

export type SliderSize = 'small' | 'medium' | 'large';
export type SliderDirection = 'horizontal' | 'vertical';
export type SliderMark = { value: number; label: React.ReactNode };

export interface ThemedSliderProps {
  className?: string;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  range?: boolean;
  reverse?: boolean;
  vertical?: boolean;
  included?: boolean;
  marks?: Record<number, React.ReactNode> | SliderMark[];
  dots?: boolean;
  tooltip?: boolean | { formatter?: (value: number) => React.ReactNode };
  onChange?: (value: number) => void;
  onAfterChange?: (value: number) => void;
  style?: React.CSSProperties;
  trackStyle?: React.CSSProperties;
  railStyle?: React.CSSProperties;
  handleStyle?: React.CSSProperties;
  dotStyle?: React.CSSProperties;
  activeDotStyle?: React.CSSProperties;
}

export const ThemedSlider: React.FC<ThemedSliderProps> = ({ className, value, defaultValue = 0, min = 0, max = 100, step = 1, disabled = false, range = false, reverse = false, vertical = false, included = true, marks, dots = false, tooltip = true, onChange, onAfterChange, style, trackStyle, railStyle, handleStyle, dotStyle, activeDotStyle }) => {
  const currentTheme = useCurrentTheme();
  const [internalValue, setInternalValue] = React.useState(value || defaultValue);
  const [isDragging, setIsDragging] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const sliderRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const clamp = (val: number) => Math.max(min, Math.min(max, val));

  const getValueFromPosition = (clientX: number, clientY: number) => {
    if (!sliderRef.current) return internalValue;

    const rect = sliderRef.current.getBoundingClientRect();
    let percentage: number;

    if (vertical) {
      percentage = reverse ? (clientY - rect.top) / rect.height : (rect.bottom - clientY) / rect.height;
    } else {
      percentage = reverse ? (rect.right - clientX) / rect.width : (clientX - rect.left) / rect.width;
    }

    percentage = Math.max(0, Math.min(1, percentage));
    const newValue = min + percentage * (max - min);

    return step ? Math.round(newValue / step) * step : newValue;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;

    e.preventDefault();
    setIsDragging(true);
    setShowTooltip(true);

    const newValue = getValueFromPosition(e.clientX, e.clientY);
    const clampedValue = clamp(newValue);

    setInternalValue(clampedValue);
    onChange?.(clampedValue);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || disabled) return;

    const newValue = getValueFromPosition(e.clientX, e.clientY);
    const clampedValue = clamp(newValue);

    setInternalValue(clampedValue);
    onChange?.(clampedValue);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);
    setShowTooltip(false);
    onAfterChange?.(internalValue);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-1 w-1';
      case 'large':
        return 'h-3 w-3';
      default:
        return 'h-2 w-2';
    }
  };

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

  const renderMarks = () => {
    if (!marks) return null;

    const marksArray = Array.isArray(marks) ? marks : Object.entries(marks).map(([value, label]) => ({ value: Number(value), label }));

    return (
      <div className={`themed-slider-marks absolute ${vertical ? 'left-0 right-0' : 'top-0 bottom-0'}`}>
        {marksArray.map((mark) => {
          const percentage = getPercentage(mark.value);
          const isActive = included && mark.value <= internalValue;

          return (
            <div
              key={mark.value}
              className={classNames('themed-slider-mark', 'absolute flex flex-col items-center', vertical ? 'flex-row' : 'flex-col')}
              style={{
                [vertical ? 'bottom' : 'left']: `${percentage}%`,
                transform: vertical ? 'translateY(50%)' : 'translateX(-50%)',
              }}
            >
              <div
                className={classNames('themed-slider-mark-dot', 'w-1 h-1 rounded-full', isActive ? 'bg-blue-500' : 'bg-gray-300')}
                style={{
                  backgroundColor: isActive ? currentTheme.colors?.primary : currentTheme.colors?.border,
                }}
              />
              <div className='themed-slider-mark-label text-xs mt-1' style={{ color: currentTheme.colors?.textSecondary }}>
                {mark.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDots = () => {
    if (!dots) return null;

    const dotCount = Math.floor((max - min) / step);
    const dotsArray = Array.from({ length: dotCount + 1 }, (_, i) => min + i * step);

    return (
      <div className={`themed-slider-dots absolute ${vertical ? 'left-0 right-0' : 'top-0 bottom-0'}`}>
        {dotsArray.map((dotValue) => {
          const percentage = getPercentage(dotValue);
          const isActive = included && dotValue <= internalValue;

          return (
            <div
              key={dotValue}
              className={classNames('themed-slider-dot', 'absolute w-1 h-1 rounded-full', isActive ? 'bg-blue-500' : 'bg-gray-300')}
              style={{
                [vertical ? 'bottom' : 'left']: `${percentage}%`,
                transform: vertical ? 'translateY(50%)' : 'translateX(-50%)',
                backgroundColor: isActive ? currentTheme.colors?.primary : currentTheme.colors?.border,
                ...dotStyle,
                ...(isActive && activeDotStyle),
              }}
            />
          );
        })}
      </div>
    );
  };

  const renderTooltip = () => {
    if (!tooltip) return null;

    const tooltipContent = typeof tooltip === 'object' && tooltip.formatter ? tooltip.formatter(internalValue) : internalValue;

    return (
      <div
        className={classNames('themed-slider-tooltip', 'absolute px-2 py-1 text-xs rounded whitespace-nowrap', 'bg-gray-800 text-white', 'pointer-events-none transition-opacity duration-200', showTooltip ? 'opacity-100' : 'opacity-0')}
        style={{
          [vertical ? 'left' : 'top']: vertical ? '50%' : '-30px',
          transform: vertical ? 'translateX(-50%)' : 'translateX(-50%)',
          zIndex: 1000,
        }}
      >
        {tooltipContent}
        <div
          className='absolute w-2 h-2 bg-gray-800 transform rotate-45'
          style={{
            [vertical ? 'top' : 'bottom']: vertical ? '100%' : '-4px',
            [vertical ? 'left' : 'right']: vertical ? '50%' : '50%',
            transform: vertical ? 'translateX(-50%) translateY(-50%) rotate(45deg)' : 'translateX(-50%)',
          }}
        />
      </div>
    );
  };

  const percentage = getPercentage(internalValue);

  return (
    <div ref={sliderRef} className={classNames('themed-slider', 'relative', vertical ? 'w-6 h-64' : 'w-64 h-6', disabled && 'opacity-50 cursor-not-allowed', className)} style={style} onMouseDown={handleMouseDown}>
      {/* 轨道 */}
      <div
        className={classNames('themed-slider-rail', 'absolute rounded-full', vertical ? 'w-1 h-full left-1/2 transform -translate-x-1/2' : 'h-1 w-full top-1/2 transform -translate-y-1/2')}
        style={{
          backgroundColor: currentTheme.colors?.border,
          ...railStyle,
        }}
      />

      {/* 已选择的轨道 */}
      {included && (
        <div
          className={classNames('themed-slider-track', 'absolute rounded-full', vertical ? 'w-1 left-1/2 transform -translate-x-1/2' : 'h-1 top-1/2 transform -translate-y-1/2')}
          style={{
            [vertical ? 'bottom' : 'left']: '0',
            [vertical ? 'height' : 'width']: `${percentage}%`,
            backgroundColor: currentTheme.colors?.primary,
            ...trackStyle,
          }}
        />
      )}

      {/* 刻度 */}
      {renderMarks()}

      {/* 点 */}
      {renderDots()}

      {/* 滑块 */}
      <div
        className={classNames('themed-slider-handle', 'absolute rounded-full cursor-grab transition-transform duration-200', 'hover:scale-110 active:scale-95', disabled && 'cursor-not-allowed', getSizeClasses())}
        style={{
          [vertical ? 'left' : 'top']: vertical ? '50%' : '50%',
          [vertical ? 'bottom' : 'left']: vertical ? `${percentage}%` : `${percentage}%`,
          transform: vertical ? 'translate(-50%, 50%)' : 'translate(-50%, -50%)',
          backgroundColor: currentTheme.colors?.primary,
          border: `2px solid ${currentTheme.colors?.white}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          ...handleStyle,
        }}
        onMouseEnter={() => !disabled && setShowTooltip(true)}
        onMouseLeave={() => !disabled && !isDragging && setShowTooltip(false)}
      >
        {renderTooltip()}
      </div>
    </div>
  );
};

// Slider 组件的子组件
export const VerticalSlider: React.FC<Omit<ThemedSliderProps, 'vertical'>> = (props) => <ThemedSlider {...props} vertical={true} />;

export const RangeSlider: React.FC<Omit<ThemedSliderProps, 'range'>> = (props) => <ThemedSlider {...props} range={true} />;

export const SmallSlider: React.FC<Omit<ThemedSliderProps, 'size'>> = (props) => <ThemedSlider {...props} size='small' />;

export const LargeSlider: React.FC<Omit<ThemedSliderProps, 'size'>> = (props) => <ThemedSlider {...props} size='large' />;

export const DiscreteSlider: React.FC<Omit<ThemedSliderProps, 'dots' | 'marks'>> = (props) => <ThemedSlider {...props} dots={true} />;

export const MarkedSlider: React.FC<Omit<ThemedSliderProps, 'marks'>> = (props) => <ThemedSlider {...props} marks={props.marks} />;

// 预设配置
export const VolumeSlider: React.FC<{
  value: number;
  onChange?: (value: number) => void;
  className?: string;
  style?: React.CSSProperties;
}> = ({ value, onChange, className, style }) => {
  return (
    <div className='flex items-center space-x-3' style={style}>
      <span className='text-sm' style={{ color: 'currentColor' }}>
        🔇
      </span>
      <ThemedSlider value={value} min={0} max={100} step={1} onChange={onChange} size='small' className={className} />
      <span className='text-sm' style={{ color: 'currentColor' }}>
        🔊
      </span>
    </div>
  );
};

export const BrightnessSlider: React.FC<{
  value: number;
  onChange?: (value: number) => void;
  className?: string;
  style?: React.CSSProperties;
}> = ({ value, onChange, className, style }) => {
  return (
    <div className='flex items-center space-x-3' style={style}>
      <span className='text-sm' style={{ color: 'currentColor' }}>
        🌙
      </span>
      <ThemedSlider value={value} min={0} max={100} step={1} onChange={onChange} size='small' className={className} />
      <span className='text-sm' style={{ color: 'currentColor' }}>
        ☀️
      </span>
    </div>
  );
};

export const TemperatureSlider: React.FC<{
  value: number;
  onChange?: (value: number) => void;
  className?: string;
  style?: React.CSSProperties;
}> = ({ value, onChange, className, style }) => {
  const marks = {
    0: '0°C',
    25: '25°C',
    50: '50°C',
    75: '75°C',
    100: '100°C',
  };

  return (
    <div className='flex flex-col space-y-2' style={style}>
      <div className='flex items-center space-x-3'>
        <span className='text-sm' style={{ color: 'currentColor' }}>
          ❄️
        </span>
        <ThemedSlider value={value} min={0} max={100} step={1} marks={marks} onChange={onChange} className={className} />
        <span className='text-sm' style={{ color: 'currentColor' }}>
          🔥
        </span>
      </div>
      <div className='text-center text-sm' style={{ color: 'currentColor' }}>
        当前温度: {value}°C
      </div>
    </div>
  );
};

// Slider 工具函数
export const useSlider = (initialValue: number = 0, options?: { min?: number; max?: number; step?: number }) => {
  const [value, setValue] = React.useState(initialValue);
  const min = options?.min || 0;
  const max = options?.max || 100;
  const step = options?.step || 1;

  return {
    value,
    setValue,
    increment: () => setValue((prev) => Math.min(max, prev + step)),
    decrement: () => setValue((prev) => Math.max(min, prev - step)),
    reset: () => setValue(initialValue),
    clamp: (val: number) => Math.max(min, Math.min(max, val)),
  };
};

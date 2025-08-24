/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Rate组件，替换Arco Design Rate
 * 完全受控于我们自己的主题系统
 */

export type RateSize = 'small' | 'medium' | 'large';
export type RateCharacter = 'star' | 'heart' | 'thumb' | 'smile' | 'custom';
export type RateStatus = 'normal' | 'hover' | 'active';

export interface ThemedRateProps {
  className?: string;
  value?: number;
  defaultValue?: number;
  count?: number;
  character?: RateCharacter | React.ReactNode;
  allowHalf?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  size?: RateSize;
  onChange?: (value: number) => void;
  onHoverChange?: (value: number) => void;
  style?: React.CSSProperties;
  characterStyle?: React.CSSProperties;
  activeCharacterStyle?: React.CSSProperties;
}

export const ThemedRate: React.FC<ThemedRateProps> = ({ className, value, defaultValue = 0, count = 5, character = 'star', allowHalf = false, allowClear = true, disabled = false, readonly = false, size = 'medium', onChange, onHoverChange, style, characterStyle, activeCharacterStyle }) => {
  const currentTheme = useCurrentTheme();
  const [internalValue, setInternalValue] = React.useState(value || defaultValue);
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  const rateRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-lg';
      case 'large':
        return 'text-3xl';
      default:
        return 'text-2xl';
    }
  };

  const getCharacterIcon = (char: RateCharacter | React.ReactNode, isActive: boolean, isHalf: boolean = false) => {
    if (typeof char === 'object') {
      return char;
    }

    const getIcon = () => {
      switch (char) {
        case 'heart':
          return '❤️';
        case 'thumb':
          return '👍';
        case 'smile':
          return '😊';
        default:
          return '★';
      }
    };

    const getEmptyIcon = () => {
      switch (char) {
        case 'heart':
          return '🤍';
        case 'thumb':
          return '👎';
        case 'smile':
          return '😐';
        default:
          return '☆';
      }
    };

    if (isHalf) {
      return (
        <span className='relative inline-block'>
          <span className='absolute inset-0 overflow-hidden' style={{ width: '50%' }}>
            <span className={getSizeClasses()}>{getIcon()}</span>
          </span>
          <span className='opacity-30'>
            <span className={getSizeClasses()}>{getEmptyIcon()}</span>
          </span>
        </span>
      );
    }

    return <span className={getSizeClasses()}>{isActive ? getIcon() : getEmptyIcon()}</span>;
  };

  const handleMouseMove = (e: React.MouseEvent, index: number) => {
    if (disabled || readonly) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    let newValue = index + 1;
    if (allowHalf && x < width / 2) {
      newValue = index + 0.5;
    }

    if (hoverValue !== newValue) {
      setHoverValue(newValue);
      onHoverChange?.(newValue);
    }
  };

  const handleMouseLeave = () => {
    if (disabled || readonly) return;
    setHoverValue(null);
    onHoverChange?.(0);
  };

  const handleClick = (e: React.MouseEvent, index: number) => {
    if (disabled || readonly) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    let newValue = index + 1;
    if (allowHalf && x < width / 2) {
      newValue = index + 0.5;
    }

    // 处理清除功能
    if (allowClear && internalValue === newValue) {
      newValue = 0;
    }

    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const getValueForDisplay = (index: number) => {
    const currentValue = hoverValue !== null ? hoverValue : internalValue;
    return currentValue > index ? currentValue : index;
  };

  const getCharacterStatus = (index: number): RateStatus => {
    const currentValue = hoverValue !== null ? hoverValue : internalValue;

    if (hoverValue !== null) {
      return currentValue > index ? 'hover' : 'normal';
    }

    return currentValue > index ? 'active' : 'normal';
  };

  const getCharacterStyle = (index: number) => {
    const status = getCharacterStatus(index);
    const isActive = status === 'active' || status === 'hover';
    const isHalf = allowHalf && internalValue === index + 0.5;

    const baseStyle = {
      color: isActive ? currentTheme.colors?.warning || '#f59e0b' : currentTheme.colors?.border || '#e5e7eb',
      cursor: disabled || readonly ? 'default' : 'pointer',
      transition: 'all 0.2s ease',
      ...characterStyle,
    };

    if (isActive && activeCharacterStyle) {
      return { ...baseStyle, ...activeCharacterStyle };
    }

    return baseStyle;
  };

  return (
    <div ref={rateRef} className={classNames('themed-rate', 'flex items-center space-x-1', disabled && 'opacity-50', className)} style={style}>
      {Array.from({ length: count }).map((_, index) => {
        const characterStatus = getCharacterStatus(index);
        const isActive = characterStatus === 'active' || characterStatus === 'hover';
        const isHalf = allowHalf && internalValue === index + 0.5;

        return (
          <div key={index} className={classNames('themed-rate-character', 'inline-block transition-transform duration-200', !disabled && !readonly && 'hover:scale-110', isActive && 'scale-105')} style={getCharacterStyle(index)} onMouseMove={(e) => handleMouseMove(e, index)} onMouseLeave={handleMouseLeave} onClick={(e) => handleClick(e, index)}>
            {getCharacterIcon(character, isActive, isHalf)}
          </div>
        );
      })}
    </div>
  );
};

// Rate 组件的子组件
export const StarRate: React.FC<Omit<ThemedRateProps, 'character'>> = (props) => <ThemedRate {...props} character='star' />;

export const HeartRate: React.FC<Omit<ThemedRateProps, 'character'>> = (props) => <ThemedRate {...props} character='heart' />;

export const ThumbRate: React.FC<Omit<ThemedRateProps, 'character'>> = (props) => <ThemedRate {...props} character='thumb' />;

export const SmileRate: React.FC<Omit<ThemedRateProps, 'character'>> = (props) => <ThemedRate {...props} character='smile' />;

export const HalfStarRate: React.FC<Omit<ThemedRateProps, 'allowHalf'>> = (props) => <ThemedRate {...props} allowHalf={true} />;

export const SmallRate: React.FC<Omit<ThemedRateProps, 'size'>> = (props) => <ThemedRate {...props} size='small' />;

export const LargeRate: React.FC<Omit<ThemedRateProps, 'size'>> = (props) => <ThemedRate {...props} size='large' />;

// 预设配置
export const ProductRating: React.FC<{
  value: number;
  count?: number;
  showValue?: boolean;
  className?: string;
  style?: React.CSSProperties;
}> = ({ value, count = 5, showValue = true, className, style }) => {
  return (
    <div className='flex items-center space-x-2' style={style}>
      <ThemedRate value={value} count={count} allowHalf={true} readonly={true} size='small' className={className} />
      {showValue && (
        <span className='text-sm' style={{ color: 'currentColor' }}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export const ServiceRating: React.FC<{
  value: number;
  onRate?: (value: number) => void;
  className?: string;
  style?: React.CSSProperties;
}> = ({ value, onRate, className, style }) => {
  return (
    <div className='flex flex-col items-center space-y-2' style={style}>
      <ThemedRate value={value} count={5} allowHalf={false} character='smile' size='large' onChange={onRate} className={className} />
      <span className='text-sm text-gray-500'>请为我们的服务评分</span>
    </div>
  );
};

export const SkillRating: React.FC<{
  skills: Array<{ name: string; level: number }>;
  className?: string;
  style?: React.CSSProperties;
}> = ({ skills, className, style }) => {
  return (
    <div className='space-y-3' style={style}>
      {skills.map((skill, index) => (
        <div key={index} className='flex items-center justify-between'>
          <span className='text-sm font-medium' style={{ color: 'currentColor' }}>
            {skill.name}
          </span>
          <ThemedRate value={skill.level} count={5} allowHalf={true} readonly={true} size='small' className={className} />
        </div>
      ))}
    </div>
  );
};

// Rate 工具函数
export const useRate = (initialValue: number = 0) => {
  const [value, setValue] = React.useState(initialValue);

  return {
    value,
    setValue,
    reset: () => setValue(initialValue),
  };
};

/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { useState } from 'react';

/**
 * 内部主题化Switch组件，替换Arco Design Switch
 * 完全受控于我们自己的主题系统
 */

export interface ThemedSwitchProps {
  className?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  onChange?: (checked: boolean) => void;
  onClick?: (e: React.MouseEvent) => void;
  checkedChildren?: React.ReactNode;
  unCheckedChildren?: React.ReactNode;
}

export const ThemedSwitch: React.FC<ThemedSwitchProps> = ({ className, checked: controlledChecked, defaultChecked = false, disabled = false, loading = false, size = 'medium', onChange, onClick, checkedChildren, unCheckedChildren }) => {
  const currentTheme = useCurrentTheme();
  const [internalChecked, setInternalChecked] = useState(defaultChecked);

  const checked = controlledChecked ?? internalChecked;

  const handleChange = () => {
    if (disabled || loading) return;

    const newChecked = !checked;
    if (!controlledChecked) {
      setInternalChecked(newChecked);
    }
    onChange?.(newChecked);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-5';
      case 'large':
        return 'w-14 h-7';
      default:
        return 'w-11 h-6';
    }
  };

  const getKnobClasses = () => {
    switch (size) {
      case 'small':
        return 'w-3 h-3';
      case 'large':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  const getKnobPosition = () => {
    switch (size) {
      case 'small':
        return checked ? 'translate-x-3' : 'translate-x-0';
      case 'large':
        return checked ? 'translate-x-7' : 'translate-x-0';
      default:
        return checked ? 'translate-x-5' : 'translate-x-0';
    }
  };

  const baseClasses = ['themed-switch', 'relative', 'inline-flex', 'items-center', 'rounded-full', 'transition-all', 'duration-200', 'cursor-pointer', 'select-none', getSizeClasses()];

  const knobClasses = ['themed-switch-knob', 'absolute', 'rounded-full', 'bg-white', 'transition-all', 'duration-200', 'shadow-sm', getKnobClasses(), getKnobPosition()];

  const getSwitchStyle = () => {
    if (disabled) {
      return {
        backgroundColor: currentTheme.disabledBg || 'rgba(0, 0, 0, 0.1)',
        cursor: 'not-allowed',
      };
    }

    if (loading) {
      return {
        backgroundColor: currentTheme.primary || '#3b82f6',
        opacity: 0.7,
      };
    }

    return {
      backgroundColor: checked ? currentTheme.primary || '#3b82f6' : currentTheme.border || '#e5e7eb',
    };
  };

  const getKnobStyle = () => {
    if (disabled) {
      return {
        backgroundColor: currentTheme.disabledText || 'rgba(0, 0, 0, 0.45)',
      };
    }

    return {
      backgroundColor: '#ffffff',
    };
  };

  return (
    <div className={classNames(baseClasses, disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80', loading ? 'opacity-70' : '', className)} style={getSwitchStyle()} onClick={handleClick}>
      {/* Loading Spinner */}
      {loading && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-white'></div>
        </div>
      )}

      {/* Knob */}
      <div className={classNames(knobClasses)} style={getKnobStyle()} />

      {/* Children */}
      <div className='absolute inset-0 flex items-center justify-between px-1 text-xs'>
        <span className={checked ? 'opacity-0' : 'opacity-100'}>{unCheckedChildren}</span>
        <span className={checked ? 'opacity-100' : 'opacity-0'}>{checkedChildren}</span>
      </div>

      {/* Hidden input for accessibility */}
      <input type='checkbox' checked={checked} disabled={disabled} onChange={handleChange} className='sr-only' onClick={(e) => e.stopPropagation()} />
    </div>
  );
};

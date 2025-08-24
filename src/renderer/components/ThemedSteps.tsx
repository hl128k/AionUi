/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Steps组件，替换Arco Design Steps
 * 完全受控于我们自己的主题系统
 */

export type StepsSize = 'small' | 'medium' | 'large';
export type StepsDirection = 'horizontal' | 'vertical';
export type StepsStatus = 'wait' | 'process' | 'finish' | 'error';

export interface Step {
  key: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  status?: StepsStatus;
  disabled?: boolean;
  subTitle?: React.ReactNode;
}

export interface ThemedStepsProps {
  className?: string;
  current?: number;
  defaultCurrent?: number;
  direction?: StepsDirection;
  size?: StepsSize;
  status?: StepsStatus;
  progressDot?: boolean | ((index: number, status: StepsStatus, title: React.ReactNode, description: React.ReactNode) => React.ReactNode);
  initial?: number;
  items?: Step[];
  onChange?: (current: number) => void;
  style?: React.CSSProperties;
}

export const ThemedSteps: React.FC<ThemedStepsProps> = ({ className, current, defaultCurrent = 0, direction = 'horizontal', size = 'medium', status, progressDot = false, initial = 0, items = [], onChange, style }) => {
  const currentTheme = useCurrentTheme();
  const [internalCurrent, setInternalCurrent] = React.useState(current || defaultCurrent);

  React.useEffect(() => {
    if (current !== undefined) {
      setInternalCurrent(current);
    }
  }, [current]);

  const handleStepClick = (index: number) => {
    if (onChange) {
      onChange(index);
    } else {
      setInternalCurrent(index);
    }
  };

  const getStepStatus = (index: number): StepsStatus => {
    if (index === internalCurrent) {
      return status || 'process';
    }
    if (index < internalCurrent) {
      return 'finish';
    }
    return 'wait';
  };

  const getStatusColor = (stepStatus: StepsStatus) => {
    switch (stepStatus) {
      case 'finish':
        return currentTheme.colors?.success || '#10b981';
      case 'process':
        return currentTheme.colors?.primary || '#3b82f6';
      case 'error':
        return currentTheme.colors?.error || '#ef4444';
      default:
        return currentTheme.colors?.border || '#e5e7eb';
    }
  };

  const renderProgressDot = (index: number, stepStatus: StepsStatus, title: React.ReactNode, description: React.ReactNode) => {
    if (typeof progressDot === 'function') {
      return progressDot(index, stepStatus, title, description);
    }

    return (
      <div
        className={classNames('themed-steps-progress-dot', 'w-2 h-2 rounded-full transition-colors', stepStatus === 'finish' && 'bg-green-500', stepStatus === 'process' && 'bg-blue-500', stepStatus === 'error' && 'bg-red-500', stepStatus === 'wait' && 'bg-gray-300')}
        style={{
          backgroundColor: getStatusColor(stepStatus),
        }}
      />
    );
  };

  const renderStepIcon = (step: Step, index: number, stepStatus: StepsStatus) => {
    if (progressDot) {
      return renderProgressDot(index, stepStatus, step.title, step.description);
    }

    if (step.icon) {
      return (
        <div
          className={classNames('themed-steps-icon', 'flex items-center justify-center w-8 h-8 rounded-full text-white transition-colors', stepStatus === 'finish' && 'bg-green-500', stepStatus === 'process' && 'bg-blue-500', stepStatus === 'error' && 'bg-red-500', stepStatus === 'wait' && 'bg-gray-300')}
          style={{
            backgroundColor: getStatusColor(stepStatus),
          }}
        >
          {step.icon}
        </div>
      );
    }

    if (stepStatus === 'finish') {
      return (
        <div className='themed-steps-icon flex items-center justify-center w-8 h-8 rounded-full text-white transition-colors' style={{ backgroundColor: getStatusColor(stepStatus) }}>
          ✓
        </div>
      );
    }

    if (stepStatus === 'error') {
      return (
        <div className='themed-steps-icon flex items-center justify-center w-8 h-8 rounded-full text-white transition-colors' style={{ backgroundColor: getStatusColor(stepStatus) }}>
          ✕
        </div>
      );
    }

    return (
      <div
        className={classNames('themed-steps-icon', 'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors', stepStatus === 'process' ? 'text-white' : 'text-gray-600')}
        style={{
          backgroundColor: stepStatus === 'process' ? getStatusColor(stepStatus) : 'transparent',
          borderColor: getStatusColor(stepStatus),
          color: stepStatus === 'process' ? currentTheme.colors?.white : currentTheme.colors?.text,
        }}
      >
        {index + 1}
      </div>
    );
  };

  const renderHorizontalSteps = () => (
    <div className={classNames('themed-steps-horizontal', 'flex items-center justify-between', className)} style={style}>
      {items.map((step, index) => {
        const stepStatus = step.status || getStepStatus(index);
        const isActive = index === internalCurrent;
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={step.key}>
            <div className={classNames('themed-steps-item', 'flex-1 flex flex-col items-center cursor-pointer transition-all', step.disabled && 'opacity-50 cursor-not-allowed', isActive && 'scale-105')} onClick={() => !step.disabled && handleStepClick(index)}>
              {renderStepIcon(step, index, stepStatus)}
              <div className='mt-2 text-center'>
                <div className={classNames('font-medium', stepStatus === 'process' && 'text-blue-600', stepStatus === 'error' && 'text-red-600')} style={{ color: getStatusColor(stepStatus) }}>
                  {step.title}
                </div>
                {step.subTitle && (
                  <div className='text-sm mt-1' style={{ color: currentTheme.colors?.textSecondary }}>
                    {step.subTitle}
                  </div>
                )}
                {step.description && (
                  <div className='text-xs mt-1' style={{ color: currentTheme.colors?.textTertiary }}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            {!isLast && (
              <div
                className='themed-steps-tail flex-1 h-0.5 mx-2'
                style={{
                  backgroundColor: index < internalCurrent ? getStatusColor('finish') : currentTheme.colors?.border,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderVerticalSteps = () => (
    <div className={classNames('themed-steps-vertical', 'space-y-4', className)} style={style}>
      {items.map((step, index) => {
        const stepStatus = step.status || getStepStatus(index);
        const isActive = index === internalCurrent;

        return (
          <div key={step.key} className={classNames('themed-steps-item', 'flex items-start cursor-pointer transition-all', step.disabled && 'opacity-50 cursor-not-allowed', isActive && 'scale-105')} onClick={() => !step.disabled && handleStepClick(index)}>
            <div className='flex flex-col items-center mr-4'>
              {renderStepIcon(step, index, stepStatus)}
              {index < items.length - 1 && (
                <div
                  className='themed-steps-tail w-0.5 flex-1 mt-2'
                  style={{
                    backgroundColor: index < internalCurrent ? getStatusColor('finish') : currentTheme.colors?.border,
                  }}
                />
              )}
            </div>
            <div className='flex-1 pb-4'>
              <div className={classNames('font-medium', stepStatus === 'process' && 'text-blue-600', stepStatus === 'error' && 'text-red-600')} style={{ color: getStatusColor(stepStatus) }}>
                {step.title}
              </div>
              {step.subTitle && (
                <div className='text-sm mt-1' style={{ color: currentTheme.colors?.textSecondary }}>
                  {step.subTitle}
                </div>
              )}
              {step.description && (
                <div className='text-sm mt-1' style={{ color: currentTheme.colors?.textTertiary }}>
                  {step.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return direction === 'vertical' ? renderVerticalSteps() : renderHorizontalSteps();
};

// Steps 组件的子组件
export const HorizontalSteps: React.FC<Omit<ThemedStepsProps, 'direction'>> = (props) => <ThemedSteps {...props} direction='horizontal' />;

export const VerticalSteps: React.FC<Omit<ThemedStepsProps, 'direction'>> = (props) => <ThemedSteps {...props} direction='vertical' />;

export const SmallSteps: React.FC<Omit<ThemedStepsProps, 'size'>> = (props) => <ThemedSteps {...props} size='small' />;

export const LargeSteps: React.FC<Omit<ThemedStepsProps, 'size'>> = (props) => <ThemedSteps {...props} size='large' />;

export const ProgressDotSteps: React.FC<Omit<ThemedStepsProps, 'progressDot'>> = (props) => <ThemedSteps {...props} progressDot={true} />;

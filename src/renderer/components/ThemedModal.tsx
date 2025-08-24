/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * 内部主题化Modal组件，替换Arco Design Modal
 * 完全受控于我们自己的主题系统
 */

export interface ThemedModalProps {
  open?: boolean;
  title?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  onClose?: () => void;
  onOk?: () => void;
  onCancel?: () => void;
  className?: string;
  width?: number | string;
  centered?: boolean;
  mask?: boolean;
  maskClosable?: boolean;
  okText?: string;
  cancelText?: string;
  okButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  cancelButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

export const ThemedModal: React.FC<ThemedModalProps> = ({ open = false, title, footer, children, onClose, onOk, onCancel, className, width = 520, centered = false, mask = true, maskClosable = true, okText = '确定', cancelText = '取消', okButtonProps, cancelButtonProps }) => {
  const currentTheme = useCurrentTheme();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose?.();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleMaskClick = () => {
    if (maskClosable) {
      onClose?.();
    }
  };

  const modalContent = (
    <>
      {mask && <div className='fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-200 z-40' onClick={handleMaskClick} />}

      <div
        className={classNames(
          'fixed',
          'bg-white',
          'dark:bg-gray-800',
          'rounded-lg',
          'shadow-xl',
          'z-50',
          'transform',
          'transition-all',
          'duration-200',
          'max-h-[90vh]',
          'flex',
          'flex-col',
          {
            'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2': centered,
            'top-20 left-1/2 -translate-x-1/2': !centered,
          },
          className
        )}
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between'>
            {title && <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>{title}</h3>}
            {onClose && (
              <button type='button' className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200' onClick={onClose} aria-label='Close'>
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className='flex-1 overflow-auto px-6 py-4'>{children}</div>

        {/* Footer */}
        {footer !== null && (
          <div className='px-6 py-4 border-t border-gray-200 dark:border-gray-700'>
            {footer || (
              <div className='flex justify-end space-x-3'>
                <button type='button' className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' onClick={onCancel || onClose} {...cancelButtonProps}>
                  {cancelText}
                </button>
                <button type='button' className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' onClick={onOk} {...okButtonProps}>
                  {okText}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  if (!open) return null;

  return createPortal(modalContent, document.body);
};

export default ThemedModal;

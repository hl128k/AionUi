/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Drawer组件，替换Arco Design Drawer
 * 完全受控于我们自己的主题系统
 */

export type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left';
export type DrawerSize = 'small' | 'medium' | 'large' | number;
export type DrawerMask = boolean | { closable?: boolean; color?: string };
export type DrawerKeyboard = boolean;
export type DrawerLevel = number;

export interface ThemedDrawerProps {
  className?: string;
  children?: React.ReactNode;
  visible?: boolean;
  defaultVisible?: boolean;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  closable?: boolean;
  mask?: DrawerMask;
  keyboard?: DrawerKeyboard;
  maskClosable?: boolean;
  destroyOnClose?: boolean;
  getContainer?: () => HTMLElement;
  zIndex?: number;
  width?: number | string;
  height?: number | string;
  level?: DrawerLevel;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  footerStyle?: React.CSSProperties;
  onClose?: () => void;
  afterOpenChange?: (visible: boolean) => void;
}

export const ThemedDrawer: React.FC<ThemedDrawerProps> = ({ className, children, visible, defaultVisible = false, placement = 'right', size = 'medium', title, footer, closable = true, mask = true, keyboard = true, maskClosable = true, destroyOnClose = false, getContainer, zIndex = 1000, width, height, level = 1, style, bodyStyle, headerStyle, footerStyle, onClose, afterOpenChange }) => {
  const currentTheme = useCurrentTheme();
  const [internalVisible, setInternalVisible] = React.useState(visible ?? defaultVisible);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const drawerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (visible !== undefined) {
      setInternalVisible(visible);
    }
  }, [visible]);

  React.useEffect(() => {
    if (internalVisible) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';

      // 处理键盘事件
      const handleKeyDown = (e: KeyboardEvent) => {
        if (keyboard && e.key === 'Escape') {
          handleClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [internalVisible, keyboard]);

  const handleClose = () => {
    if (!isAnimating) return;

    setIsAnimating(false);
    setTimeout(() => {
      setInternalVisible(false);
      onClose?.();
      afterOpenChange?.(false);
    }, 300);
  };

  const handleMaskClick = () => {
    if (maskClosable && mask) {
      handleClose();
    }
  };

  const getSizeStyles = (): { width?: number | string; height?: number | string } => {
    if (typeof size === 'number') {
      return placement === 'top' || placement === 'bottom' ? { height: size } : { width: size };
    }

    switch (size) {
      case 'small':
        return placement === 'top' || placement === 'bottom' ? { height: '200px' } : { width: '300px' };
      case 'large':
        return placement === 'top' || placement === 'bottom' ? { height: '80vh' } : { width: '80vw' };
      default:
        return placement === 'top' || placement === 'bottom' ? { height: '50vh' } : { width: '50vw' };
    }
  };

  const getPlacementClasses = () => {
    const baseClasses = ['fixed', 'bg-white', 'shadow-2xl', 'transition-all duration-300 ease-in-out', 'z-50'];

    switch (placement) {
      case 'top':
        return [...baseClasses, 'top-0 left-0 right-0', 'transform -translate-y-full'];
      case 'right':
        return [...baseClasses, 'top-0 right-0 bottom-0', 'transform translate-x-full'];
      case 'bottom':
        return [...baseClasses, 'bottom-0 left-0 right-0', 'transform translate-y-full'];
      case 'left':
        return [...baseClasses, 'top-0 left-0 bottom-0', 'transform -translate-x-full'];
      default:
        return baseClasses;
    }
  };

  const getVisibleClasses = () => {
    if (!internalVisible) return '';

    switch (placement) {
      case 'top':
        return 'transform translate-y-0';
      case 'right':
        return 'transform translate-x-0';
      case 'bottom':
        return 'transform translate-y-0';
      case 'left':
        return 'transform translate-x-0';
      default:
        return '';
    }
  };

  const renderMask = () => {
    if (!mask) return null;

    const maskColor = typeof mask === 'object' ? mask.color : 'rgba(0, 0, 0, 0.5)';
    const maskClosableValue = typeof mask === 'object' ? mask.closable !== false : maskClosable;

    return (
      <div
        className={classNames('themed-drawer-mask', 'fixed inset-0', 'transition-opacity duration-300', internalVisible ? 'opacity-100' : 'opacity-0 pointer-events-none')}
        style={{
          backgroundColor: maskColor,
          zIndex: zIndex - 1,
        }}
        onClick={maskClosableValue ? handleMaskClick : undefined}
      />
    );
  };

  const renderCloseButton = () => {
    if (!closable) return null;

    return (
      <button className={classNames('themed-drawer-close', 'absolute top-4 right-4', 'w-8 h-8 rounded-lg', 'flex items-center justify-center', 'hover:bg-gray-100 dark:hover:bg-gray-700', 'transition-colors duration-200', 'focus:outline-none focus:ring-2 focus:ring-blue-500')} onClick={handleClose} style={{ zIndex: zIndex + 1 }}>
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' style={{ color: currentTheme.colors?.textSecondary }}>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
        </svg>
      </button>
    );
  };

  const renderHeader = () => {
    if (!title) return null;

    return (
      <div
        className={classNames('themed-drawer-header', 'border-b border-gray-200 dark:border-gray-700', 'px-6 py-4')}
        style={{
          backgroundColor: currentTheme.colors?.bg,
          borderColor: currentTheme.colors?.border,
          ...headerStyle,
        }}
      >
        <h2 className='themed-drawer-title text-lg font-semibold' style={{ color: currentTheme.colors?.text }}>
          {title}
        </h2>
      </div>
    );
  };

  const renderBody = () => {
    return (
      <div
        className={classNames('themed-drawer-body', 'flex-1 overflow-y-auto', 'px-6 py-4')}
        style={{
          backgroundColor: currentTheme.colors?.bg,
          color: currentTheme.colors?.text,
          ...bodyStyle,
        }}
      >
        {children}
      </div>
    );
  };

  const renderFooter = () => {
    if (!footer) return null;

    return (
      <div
        className={classNames('themed-drawer-footer', 'border-t border-gray-200 dark:border-gray-700', 'px-6 py-4')}
        style={{
          backgroundColor: currentTheme.colors?.bg,
          borderColor: currentTheme.colors?.border,
          ...footerStyle,
        }}
      >
        {footer}
      </div>
    );
  };

  const sizeStyles = getSizeStyles();
  const placementClasses = getPlacementClasses();
  const visibleClasses = getVisibleClasses();

  const drawerContent = (
    <>
      {renderMask()}
      <div
        ref={drawerRef}
        className={classNames('themed-drawer', placementClasses, visibleClasses, internalVisible ? 'opacity-100' : 'opacity-0 pointer-events-none', className)}
        style={{
          width: width || sizeStyles.width,
          height: height || sizeStyles.height,
          backgroundColor: currentTheme.colors?.bg,
          zIndex,
          ...style,
        }}
      >
        {renderCloseButton()}
        {renderHeader()}
        {renderBody()}
        {renderFooter()}
      </div>
    </>
  );

  if (!internalVisible && !isAnimating && destroyOnClose) {
    return null;
  }

  if (getContainer) {
    const container = getContainer();
    if (container && container !== document.body) {
      return React.createPortal(drawerContent, container);
    }
  }

  return React.createPortal(drawerContent, document.body);
};

// Drawer 子组件
export const TopDrawer: React.FC<Omit<ThemedDrawerProps, 'placement'>> = (props) => <ThemedDrawer {...props} placement='top' />;

export const RightDrawer: React.FC<Omit<ThemedDrawerProps, 'placement'>> = (props) => <ThemedDrawer {...props} placement='right' />;

export const BottomDrawer: React.FC<Omit<ThemedDrawerProps, 'placement'>> = (props) => <ThemedDrawer {...props} placement='bottom' />;

export const LeftDrawer: React.FC<Omit<ThemedDrawerProps, 'placement'>> = (props) => <ThemedDrawer {...props} placement='left' />;

export const SmallDrawer: React.FC<Omit<ThemedDrawerProps, 'size'>> = (props) => <ThemedDrawer {...props} size='small' />;

export const LargeDrawer: React.FC<Omit<ThemedDrawerProps, 'size'>> = (props) => <ThemedDrawer {...props} size='large' />;

// 预设配置
export const FormDrawer: React.FC<{
  title: string;
  children: React.ReactNode;
  visible?: boolean;
  onClose?: () => void;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ title, children, visible, onClose, onSubmit, submitText = '提交', cancelText = '取消', className, style }) => (
  <ThemedDrawer
    title={title}
    visible={visible}
    placement='right'
    size='medium'
    footer={
      <div className='flex justify-end space-x-3'>
        <button className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50' onClick={onClose}>
          {cancelText}
        </button>
        <button className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600' onClick={onSubmit}>
          {submitText}
        </button>
      </div>
    }
    className={className}
    style={style}
  >
    {children}
  </ThemedDrawer>
);

export const DetailDrawer: React.FC<{
  title: string;
  children: React.ReactNode;
  visible?: boolean;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}> = ({ title, children, visible, onClose, className, style }) => (
  <ThemedDrawer title={title} visible={visible} placement='right' size='large' onClose={onClose} className={className} style={style}>
    {children}
  </ThemedDrawer>
);

export const QuickDrawer: React.FC<{
  children: React.ReactNode;
  visible?: boolean;
  onClose?: () => void;
  placement?: DrawerPlacement;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, visible, onClose, placement = 'right', className, style }) => (
  <ThemedDrawer visible={visible} placement={placement} size='small' closable={true} maskClosable={true} onClose={onClose} className={className} style={style}>
    {children}
  </ThemedDrawer>
);

// Drawer 工具函数
export const useDrawer = (options?: { defaultVisible?: boolean; placement?: DrawerPlacement; size?: DrawerSize }) => {
  const [visible, setVisible] = React.useState(options?.defaultVisible || false);

  const showDrawer = () => {
    setVisible(true);
  };

  const hideDrawer = () => {
    setVisible(false);
  };

  const toggleDrawer = () => {
    setVisible((prev) => !prev);
  };

  return {
    visible,
    showDrawer,
    hideDrawer,
    toggleDrawer,
    setVisible,
  };
};

// Drawer 容器组件
export const DrawerProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [drawers, setDrawers] = React.useState<
    Array<{
      id: string;
      component: React.ReactNode;
    }>
  >([]);

  const showDrawer = (id: string, component: React.ReactNode) => {
    setDrawers((prev) => [...prev.filter((d) => d.id !== id), { id, component }]);
  };

  const hideDrawer = (id: string) => {
    setDrawers((prev) => prev.filter((d) => d.id !== id));
  };

  const contextValue = React.useMemo(
    () => ({
      showDrawer,
      hideDrawer,
    }),
    []
  );

  return (
    <DrawerContext.Provider value={contextValue}>
      {children}
      {drawers.map((drawer) => (
        <React.Fragment key={drawer.id}>{drawer.component}</React.Fragment>
      ))}
    </DrawerContext.Provider>
  );
};

export const DrawerContext = React.createContext<{
  showDrawer: (id: string, component: React.ReactNode) => void;
  hideDrawer: (id: string) => void;
}>({
  showDrawer: () => {},
  hideDrawer: () => {},
});

// 便捷 Hook
export const useDrawerContext = () => {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawerContext must be used within a DrawerProvider');
  }
  return context;
};

/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Notification组件，替换Arco Design Notification
 * 完全受控于我们自己的主题系统
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPlacement = 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
export type NotificationDuration = number | null;

export interface NotificationAction {
  key: string;
  text: React.ReactNode;
  onClick?: () => void;
  type?: 'primary' | 'default' | 'danger';
}

export interface NotificationProps {
  key?: string;
  type?: NotificationType;
  title?: React.ReactNode;
  description?: React.ReactNode;
  content?: React.ReactNode;
  icon?: React.ReactNode;
  duration?: NotificationDuration;
  closable?: boolean;
  closeIcon?: React.ReactNode;
  actions?: NotificationAction[];
  style?: React.CSSProperties;
  className?: string;
  onClose?: () => void;
  onClick?: () => void;
}

export interface ThemedNotificationProps extends Omit<NotificationProps, 'key'> {
  visible?: boolean;
  placement?: NotificationPlacement;
  getContainer?: () => HTMLElement;
  maxCount?: number;
}

// 通知管理器
class NotificationManager {
  private notifications: NotificationProps[] = [];
  private container: HTMLElement | null = null;
  private maxCount: number = 10;

  setContainer(container: HTMLElement) {
    this.container = container;
  }

  setMaxCount(maxCount: number) {
    this.maxCount = maxCount;
  }

  add(notification: NotificationProps) {
    const key = notification.key || `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification = { ...notification, key };

    this.notifications.push(newNotification);

    if (this.notifications.length > this.maxCount) {
      this.notifications = this.notifications.slice(-this.maxCount);
    }

    this.render();

    // 自动关闭
    if (notification.duration !== null && notification.duration !== 0) {
      setTimeout(() => {
        this.remove(key);
      }, notification.duration || 4500);
    }

    return key;
  }

  remove(key: string) {
    const index = this.notifications.findIndex((n) => n.key === key);
    if (index > -1) {
      const notification = this.notifications[index];
      this.notifications.splice(index, 1);
      notification.onClose?.();
      this.render();
    }
  }

  clear() {
    this.notifications = [];
    this.render();
  }

  render() {
    if (!this.container) return;

    const container = this.container;
    container.innerHTML = '';

    this.notifications.forEach((notification) => {
      const element = this.createNotificationElement(notification);
      if (element) {
        container.appendChild(element);
      }
    });
  }

  private createNotificationElement(notification: NotificationProps): HTMLElement | null {
    const currentTheme = this.getCurrentTheme();
    if (!currentTheme) return null;

    const element = document.createElement('div');
    element.className = classNames('themed-notification', 'relative', 'mb-3 p-4 rounded-lg shadow-lg', 'transition-all duration-300 transform', 'hover:shadow-xl');

    // 根据类型设置样式
    const typeStyles = this.getTypeStyles(notification.type || 'info', currentTheme);
    Object.assign(element.style, typeStyles);

    // 创建内容
    element.innerHTML = this.renderNotificationContent(notification, currentTheme);

    // 添加事件监听
    if (notification.closable !== false) {
      const closeBtn = element.querySelector('.themed-notification-close');
      closeBtn?.addEventListener('click', () => {
        if (notification.key) {
          this.remove(notification.key);
        }
      });
    }

    if (notification.onClick) {
      element.addEventListener('click', notification.onClick);
    }

    // 添加动作按钮事件
    const actionButtons = element.querySelectorAll('.themed-notification-action');
    actionButtons.forEach((btn, index) => {
      const action = notification.actions?.[index];
      if (action) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          action.onClick?.();
          if (notification.key) {
            this.remove(notification.key);
          }
        });
      }
    });

    return element;
  }

  private renderNotificationContent(notification: NotificationProps, currentTheme: any): string {
    const typeConfig = this.getTypeConfig(notification.type || 'info', currentTheme);

    return `
      <div class="themed-notification-content flex items-start">
        ${
          notification.icon
            ? `
          <div class="themed-notification-icon flex-shrink-0 mr-3 mt-0.5">
            ${this.renderIcon(notification.icon)}
          </div>
        `
            : typeConfig.icon
              ? `
          <div class="themed-notification-icon flex-shrink-0 mr-3 mt-0.5">
            ${typeConfig.icon}
          </div>
        `
              : ''
        }
        
        <div class="themed-notification-body flex-1 min-w-0">
          ${
            notification.title
              ? `
            <div class="themed-notification-title font-medium mb-1" style="color: ${currentTheme.colors?.text}">
              ${this.renderContent(notification.title)}
            </div>
          `
              : ''
          }
          
          ${
            notification.description
              ? `
            <div class="themed-notification-description text-sm mb-2" style="color: ${currentTheme.colors?.textSecondary}">
              ${this.renderContent(notification.description)}
            </div>
          `
              : ''
          }
          
          ${
            notification.content
              ? `
            <div class="themed-notification-content-extra">
              ${this.renderContent(notification.content)}
            </div>
          `
              : ''
          }
          
          ${
            notification.actions && notification.actions.length > 0
              ? `
            <div class="themed-notification-actions mt-3 flex space-x-2">
              ${notification.actions
                .map(
                  (action) => `
                <button class="themed-notification-action px-3 py-1 text-sm rounded transition-colors duration-200 ${action.type === 'primary' ? 'bg-blue-500 text-white hover:bg-blue-600' : action.type === 'danger' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}" style="color: ${action.type === 'primary' ? currentTheme.colors?.white : currentTheme.colors?.text}">
                  ${this.renderContent(action.text)}
                </button>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }
        </div>
        
        ${
          notification.closable !== false
            ? `
          <button class="themed-notification-close absolute top-2 right-2 w-6 h-6 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors duration-200 flex items-center justify-center">
            ${
              notification.closeIcon
                ? this.renderIcon(notification.closeIcon)
                : `
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: ${currentTheme.colors?.textSecondary}">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            `
            }
          </button>
        `
            : ''
        }
      </div>
    `;
  }

  private renderIcon(icon: React.ReactNode): string {
    if (typeof icon === 'string') {
      return icon;
    }
    // 对于复杂的 React 节点，这里简化处理
    return '';
  }

  private renderContent(content: React.ReactNode): string {
    if (typeof content === 'string') {
      return content;
    }
    // 对于复杂的 React 节点，这里简化处理
    return '';
  }

  private getTypeStyles(type: NotificationType, currentTheme: any): React.CSSProperties {
    const typeConfig = this.getTypeConfig(type, currentTheme);
    return {
      backgroundColor: typeConfig.bgColor,
      border: `1px solid ${typeConfig.borderColor}`,
      color: typeConfig.textColor,
    };
  }

  private getTypeConfig(type: NotificationType, currentTheme: any) {
    const configs = {
      success: {
        bgColor: `${currentTheme.colors?.success}10`,
        borderColor: currentTheme.colors?.success,
        textColor: currentTheme.colors?.successText || currentTheme.colors?.success,
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: ${currentTheme.colors?.success}">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>`,
      },
      error: {
        bgColor: `${currentTheme.colors?.danger}10`,
        borderColor: currentTheme.colors?.danger,
        textColor: currentTheme.colors?.dangerText || currentTheme.colors?.danger,
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: ${currentTheme.colors?.danger}">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>`,
      },
      warning: {
        bgColor: `${currentTheme.colors?.warning}10`,
        borderColor: currentTheme.colors?.warning,
        textColor: currentTheme.colors?.warningText || currentTheme.colors?.warning,
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: ${currentTheme.colors?.warning}">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>`,
      },
      info: {
        bgColor: `${currentTheme.colors?.info}10`,
        borderColor: currentTheme.colors?.info,
        textColor: currentTheme.colors?.infoText || currentTheme.colors?.info,
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: ${currentTheme.colors?.info}">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`,
      },
    };
    return configs[type];
  }

  private getCurrentTheme(): any {
    // 这里应该从主题提供者获取当前主题
    // 简化处理，返回默认主题
    return {
      colors: {
        primary: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#06b6d4',
        text: '#374151',
        textSecondary: '#6b7280',
        white: '#ffffff',
      },
    };
  }
}

// 全局通知管理器实例
const notificationManager = new NotificationManager();

// 通知容器组件
export const NotificationContainer: React.FC<{
  placement?: NotificationPlacement;
  maxCount?: number;
  getContainer?: () => HTMLElement;
}> = ({ placement = 'topRight', maxCount = 10, getContainer }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      notificationManager.setContainer(containerRef.current);
      notificationManager.setMaxCount(maxCount);
    }
  }, [maxCount]);

  const getPlacementClasses = () => {
    switch (placement) {
      case 'topRight':
        return 'fixed top-4 right-4 z-50';
      case 'topLeft':
        return 'fixed top-4 left-4 z-50';
      case 'bottomRight':
        return 'fixed bottom-4 right-4 z-50';
      case 'bottomLeft':
        return 'fixed bottom-4 left-4 z-50';
      default:
        return 'fixed top-4 right-4 z-50';
    }
  };

  return <div ref={containerRef} className={classNames('themed-notification-container', 'flex flex-col items-end max-w-sm', getPlacementClasses())} style={{ pointerEvents: 'none' }} />;
};

// 通知 API
export const notification = {
  success: (config: Omit<NotificationProps, 'type'>) => {
    return notificationManager.add({ ...config, type: 'success' });
  },
  error: (config: Omit<NotificationProps, 'type'>) => {
    return notificationManager.add({ ...config, type: 'error' });
  },
  warning: (config: Omit<NotificationProps, 'type'>) => {
    return notificationManager.add({ ...config, type: 'warning' });
  },
  info: (config: Omit<NotificationProps, 'type'>) => {
    return notificationManager.add({ ...config, type: 'info' });
  },
  open: (config: NotificationProps) => {
    return notificationManager.add(config);
  },
  close: (key: string) => {
    notificationManager.remove(key);
  },
  destroy: () => {
    notificationManager.clear();
  },
};

// 预设配置
export const useNotification = () => {
  return {
    success: notification.success,
    error: notification.error,
    warning: notification.warning,
    info: notification.info,
    open: notification.open,
    close: notification.close,
    destroy: notification.destroy,
  };
};

// 快捷通知组件
export const SuccessNotification: React.FC<{
  title: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  onClose?: () => void;
}> = ({ title, description, duration, onClose }) => {
  React.useEffect(() => {
    const key = notification.success({ title, description, duration, onClose });
    return () => {
      if (key) notification.close(key);
    };
  }, [title, description, duration, onClose]);

  return null;
};

export const ErrorNotification: React.FC<{
  title: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  onClose?: () => void;
}> = ({ title, description, duration, onClose }) => {
  React.useEffect(() => {
    const key = notification.error({ title, description, duration, onClose });
    return () => {
      if (key) notification.close(key);
    };
  }, [title, description, duration, onClose]);

  return null;
};

export const WarningNotification: React.FC<{
  title: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  onClose?: () => void;
}> = ({ title, description, duration, onClose }) => {
  React.useEffect(() => {
    const key = notification.warning({ title, description, duration, onClose });
    return () => {
      if (key) notification.close(key);
    };
  }, [title, description, duration, onClose]);

  return null;
};

export const InfoNotification: React.FC<{
  title: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  onClose?: () => void;
}> = ({ title, description, duration, onClose }) => {
  React.useEffect(() => {
    const key = notification.info({ title, description, duration, onClose });
    return () => {
      if (key) notification.close(key);
    };
  }, [title, description, duration, onClose]);

  return null;
};

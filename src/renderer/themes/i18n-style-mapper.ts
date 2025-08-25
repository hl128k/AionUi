/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * i18n样式映射器
 * 根据i18n的key来配置对应UI元素的样式
 */

import i18n from '@/renderer/i18n';

/**
 * i18n key对应的样式配置
 */
export interface I18nKeyStyleConfig {
  /** i18n key */
  key: string;
  /** 对应的CSS选择器或类名 */
  selector: string;
  /** 样式属性映射 */
  styles: Partial<CSSStyleDeclaration> | Record<string, string>;
  /** 条件：当文本长度超过此值时应用样式 */
  textLengthThreshold?: number;
  /** 条件：当文本包含特定字符时应用样式 */
  containsChars?: string[];
}

/**
 * 基于i18n key的样式映射配置
 */
export interface I18nBasedStyleMapping {
  /** 配置名称 */
  name: string;
  /** 配置描述 */
  description?: string;
  /** i18n key样式配置列表 */
  keyConfigs: I18nKeyStyleConfig[];
}

/**
 * i18n样式映射器类
 */
class I18nStyleMapper {
  private static instance: I18nStyleMapper;
  private styleElement: HTMLStyleElement | null = null;
  private currentMappings: I18nBasedStyleMapping[] = [];

  static getInstance(): I18nStyleMapper {
    if (!I18nStyleMapper.instance) {
      I18nStyleMapper.instance = new I18nStyleMapper();
    }
    return I18nStyleMapper.instance;
  }

  /**
   * 初始化样式映射器
   */
  initialize(): void {
    // 创建专用的style标签
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'aion-i18n-styles';
    document.head.appendChild(this.styleElement);

    // 监听语言变化
    i18n.on('languageChanged', this.handleLanguageChange.bind(this));

    console.log('🗺️ I18n Style Mapper initialized');
  }

  /**
   * 添加i18n样式映射配置
   */
  addStyleMapping(mapping: I18nBasedStyleMapping): void {
    this.currentMappings.push(mapping);
    this.applyCurrentMappings();
  }

  /**
   * 移除i18n样式映射配置
   */
  removeStyleMapping(name: string): void {
    this.currentMappings = this.currentMappings.filter((m) => m.name !== name);
    this.applyCurrentMappings();
  }

  /**
   * 清空所有映射配置
   */
  clearAllMappings(): void {
    this.currentMappings = [];
    if (this.styleElement) {
      this.styleElement.textContent = '';
    }
  }

  /**
   * 应用当前所有映射配置
   */
  private applyCurrentMappings(): void {
    if (!this.styleElement) return;

    let cssRules = '';

    this.currentMappings.forEach((mapping) => {
      mapping.keyConfigs.forEach((config) => {
        const translatedText = i18n.t(config.key);

        // 检查是否满足应用条件
        if (!this.shouldApplyConfig(config, translatedText)) {
          return;
        }

        // 生成CSS规则
        const cssRule = this.generateCSSRule(config, translatedText);
        if (cssRule) {
          cssRules += cssRule + '\n';
        }
      });
    });

    this.styleElement.textContent = cssRules;
  }

  /**
   * 检查是否应该应用配置
   */
  private shouldApplyConfig(config: I18nKeyStyleConfig, text: string): boolean {
    // 检查文本长度阈值
    if (config.textLengthThreshold && text.length <= config.textLengthThreshold) {
      return false;
    }

    // 检查是否包含特定字符
    if (config.containsChars && config.containsChars.length > 0) {
      const hasRequiredChars = config.containsChars.some((char) => text.includes(char));
      if (!hasRequiredChars) {
        return false;
      }
    }

    return true;
  }

  /**
   * 生成CSS规则
   */
  private generateCSSRule(config: I18nKeyStyleConfig, text: string): string {
    const selector = config.selector;
    const styles = config.styles;

    if (!selector || !styles) return '';

    const styleProps = Object.entries(styles)
      .map(([prop, value]) => {
        // 转换驼峰命名为连字符命名
        const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `  ${cssProp}: ${value};`;
      })
      .join('\n');

    return `/* i18n key: ${config.key} (text: "${text}") */\n${selector} {\n${styleProps}\n}`;
  }

  /**
   * 处理语言变化事件
   */
  private handleLanguageChange(): void {
    // 语言变化时重新应用所有映射
    this.applyCurrentMappings();
    console.log('🗺️ I18n styles updated for language change');
  }

  /**
   * 获取当前映射配置
   */
  getCurrentMappings(): I18nBasedStyleMapping[] {
    return [...this.currentMappings];
  }
}

// 导出单例实例
export const i18nStyleMapper = I18nStyleMapper.getInstance();

/**
 * 创建预定义的i18n样式映射配置
 */
export function createPredefinedMappings(): I18nBasedStyleMapping[] {
  return [
    {
      name: 'settings-adaptive',
      description: '设置页面自适应样式',
      keyConfigs: [
        {
          key: 'settings.theme',
          selector: '[data-i18n-key="settings.theme"]',
          styles: {
            fontWeight: 'bold',
          },
        },
        {
          key: 'settings.language',
          selector: '[data-i18n-key="settings.language"]',
          styles: {
            color: 'var(--color-primary-6)',
          },
        },
        {
          key: 'settings.themeSettings',
          selector: '[data-i18n-key="settings.themeSettings"]',
          styles: {
            fontSize: '16px',
            lineHeight: '1.5',
          },
          textLengthThreshold: 8, // 当文本长度超过8个字符时应用
        },
      ],
    },
    {
      name: 'conversation-adaptive',
      description: '对话页面自适应样式',
      keyConfigs: [
        {
          key: 'conversation.welcome.title',
          selector: '[data-i18n-key="conversation.welcome.title"]',
          styles: {
            fontSize: '18px',
            fontWeight: '600',
            lineHeight: '1.4',
          },
        },
        {
          key: 'conversation.welcome.placeholder',
          selector: '[data-i18n-key="conversation.welcome.placeholder"]',
          styles: {
            opacity: '0.7',
          },
          textLengthThreshold: 20, // 长文本时降低透明度
        },
      ],
    },
    {
      name: 'common-adaptive',
      description: '通用元素自适应样式',
      keyConfigs: [
        {
          key: 'common.send',
          selector: '[data-i18n-key="common.send"]',
          styles: {
            minWidth: '60px',
            textAlign: 'center',
          },
        },
        {
          key: 'common.cancel',
          selector: '[data-i18n-key="common.cancel"]',
          styles: {
            minWidth: '60px',
            textAlign: 'center',
          },
        },
      ],
    },
    {
      name: 'cjk-text-adaptive',
      description: '中日韩文本自适应样式',
      keyConfigs: [
        {
          key: 'settings.theme',
          selector: '[data-i18n-key="settings.theme"]',
          styles: {
            letterSpacing: '0.05em', // 中文文本增加字间距
          },
          containsChars: ['主题', 'テーマ', '主題'], // 包含中日韩文字时应用
        },
      ],
    },
  ];
}

/**
 * Hook: 使用i18n样式映射器
 */
export function useI18nStyleMapper() {
  return {
    mapper: i18nStyleMapper,
    addStyleMapping: i18nStyleMapper.addStyleMapping.bind(i18nStyleMapper),
    removeStyleMapping: i18nStyleMapper.removeStyleMapping.bind(i18nStyleMapper),
    clearAllMappings: i18nStyleMapper.clearAllMappings.bind(i18nStyleMapper),
    getCurrentMappings: i18nStyleMapper.getCurrentMappings.bind(i18nStyleMapper),
  };
}

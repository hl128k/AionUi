/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Watermark组件，替换Arco Design Watermark
 * 完全受控于我们自己的主题系统
 */

export type WatermarkFont = {
  color?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic' | 'oblique';
};

export type WatermarkGap = [number, number];
export type WatermarkOffset = [number, number] | 'center';

export interface ThemedWatermarkProps {
  className?: string;
  children?: React.ReactNode;
  content?: string | string[];
  image?: string;
  width?: number;
  height?: number;
  rotate?: number;
  zIndex?: number;
  gap?: WatermarkGap;
  offset?: WatermarkOffset;
  font?: WatermarkFont;
  style?: React.CSSProperties;
  opacity?: number;
  fullscreen?: boolean;
  disabled?: boolean;
}

export const ThemedWatermark: React.FC<ThemedWatermarkProps> = ({ className, children, content, image, width = 120, height = 64, rotate = -22, zIndex = 9, gap = [100, 100], offset = 'center', font, style, opacity = 0.15, fullscreen = false, disabled = false }) => {
  const currentTheme = useCurrentTheme();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // 合并字体配置
  const mergedFont: WatermarkFont = {
    color: currentTheme.colors?.text || '#000000',
    fontSize: 16,
    fontWeight: 'normal',
    fontFamily: 'sans-serif',
    fontStyle: 'normal',
    ...font,
  };

  // 创建水印
  React.useEffect(() => {
    if (disabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = width;
    canvas.height = height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 设置字体
    ctx.font = `${mergedFont.fontStyle} ${mergedFont.fontWeight} ${mergedFont.fontSize}px ${mergedFont.fontFamily}`;
    ctx.fillStyle = mergedFont.color || '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 保存当前状态
    ctx.save();

    // 移动到画布中心
    ctx.translate(width / 2, height / 2);

    // 旋转
    ctx.rotate((rotate * Math.PI) / 180);

    // 绘制文本
    if (content) {
      const texts = Array.isArray(content) ? content : [content];
      const lineHeight = mergedFont.fontSize! * 1.2;
      const totalHeight = texts.length * lineHeight;
      const startY = -(totalHeight / 2) + lineHeight / 2;

      texts.forEach((text, index) => {
        ctx.fillText(text, 0, startY + index * lineHeight);
      });
    }

    // 恢复状态
    ctx.restore();

    // 绘制图片
    if (image) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate((rotate * Math.PI) / 180);

        const imgWidth = Math.min(width, img.width);
        const imgHeight = Math.min(height, img.height);
        ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

        ctx.restore();
      };
      img.src = image;
    }
  }, [content, image, width, height, rotate, mergedFont, disabled]);

  // 应用水印到容器
  React.useEffect(() => {
    if (disabled || !containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // 创建背景图片
    const dataURL = canvas.toDataURL();

    // 应用背景
    container.style.backgroundImage = `url(${dataURL})`;
    container.style.backgroundRepeat = 'repeat';
    container.style.backgroundSize = `${gap[0] + width}px ${gap[1] + height}px`;

    // 设置透明度
    if (opacity !== 1) {
      container.style.opacity = opacity.toString();
    }

    // 计算偏移
    let backgroundPosition = '0 0';
    if (offset === 'center') {
      backgroundPosition = 'center';
    } else {
      backgroundPosition = `${offset[0]}px ${offset[1]}px`;
    }
    container.style.backgroundPosition = backgroundPosition;
  }, [width, height, gap, offset, opacity, disabled]);

  return (
    <>
      {/* 隐藏的画布用于生成水印 */}
      <canvas ref={canvasRef} className='hidden' />

      {/* 水印容器 */}
      <div
        ref={containerRef}
        className={classNames(
          'themed-watermark',
          'relative',
          'pointer-events-none',
          {
            'fixed inset-0': fullscreen,
            'absolute inset-0': !fullscreen && children,
          },
          className
        )}
        style={{
          zIndex,
          ...style,
        }}
      />

      {/* 子内容 */}
      {children && <div className='relative z-10'>{children}</div>}
    </>
  );
};

// 全屏水印组件
export const ThemedFullscreenWatermark: React.FC<Omit<ThemedWatermarkProps, 'fullscreen'>> = (props) => <ThemedWatermark {...props} fullscreen />;

// 文本水印组件
export const ThemedTextWatermark: React.FC<{
  text: string | string[];
  className?: string;
  style?: React.CSSProperties;
  font?: WatermarkFont;
  opacity?: number;
}> = ({ text, className, style, font, opacity }) => <ThemedWatermark content={text} className={className} style={style} font={font} opacity={opacity} />;

// 图片水印组件
export const ThemedImageWatermark: React.FC<{
  image: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  opacity?: number;
}> = ({ image, className, style, width, height, opacity }) => <ThemedWatermark image={image} width={width} height={height} className={className} style={style} opacity={opacity} />;

// 预设配置
export const ConfidentialWatermark: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className, style }) => (
  <ThemedWatermark
    content={['机密', 'Confidential']}
    className={className}
    style={style}
    rotate={-45}
    opacity={0.1}
    font={{
      color: '#ff0000',
      fontSize: 20,
      fontWeight: 'bold',
    }}
  />
);

export const DraftWatermark: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className, style }) => (
  <ThemedWatermark
    content={['草稿', 'Draft']}
    className={className}
    style={style}
    rotate={-30}
    opacity={0.08}
    font={{
      color: '#666666',
      fontSize: 18,
      fontWeight: 'normal',
    }}
  />
);

export const SampleWatermark: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className, style }) => (
  <ThemedWatermark
    content={['样本', 'Sample']}
    className={className}
    style={style}
    rotate={-22}
    opacity={0.12}
    font={{
      color: '#999999',
      fontSize: 16,
      fontWeight: 'normal',
    }}
  />
);

// 日期水印组件
export const ThemedDateWatermark: React.FC<{
  className?: string;
  style?: React.CSSProperties;
  format?: string;
  font?: WatermarkFont;
}> = ({ className, style, format = 'yyyy-MM-dd', font }) => {
  const formatDate = (date: Date, fmt: string) => {
    const o: { [key: string]: number } = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'h+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds(),
      'q+': Math.floor((date.getMonth() + 3) / 3),
      S: date.getMilliseconds(),
    };

    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }

    for (const k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] + '' : ('00' + o[k]).substr(('' + o[k]).length));
      }
    }
    return fmt;
  };

  const dateText = formatDate(new Date(), format);

  return <ThemedWatermark content={dateText} className={className} style={style} font={font} opacity={0.1} />;
};

// 用户信息水印组件
export const ThemedUserWatermark: React.FC<{
  username: string;
  className?: string;
  style?: React.CSSProperties;
  showIP?: boolean;
  showTime?: boolean;
}> = ({ username, className, style, showIP = false, showTime = true }) => {
  const [userIP, setUserIP] = React.useState('127.0.0.1');

  React.useEffect(() => {
    // 简化的IP获取（实际应用中应该从后端获取）
    const getIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setUserIP(data.ip);
      } catch {
        // 使用默认IP
      }
    };

    if (showIP) {
      getIP();
    }
  }, [showIP]);

  const content = [username];
  if (showIP) content.push(userIP);
  if (showTime) content.push(new Date().toLocaleString());

  return (
    <ThemedWatermark
      content={content}
      className={className}
      style={style}
      rotate={-22}
      opacity={0.08}
      font={{
        fontSize: 14,
        fontWeight: 'normal',
      }}
    />
  );
};

// 水印工具函数
export const useWatermark = (options: { content?: string | string[]; image?: string; enabled?: boolean; opacity?: number }) => {
  const [enabled, setEnabled] = React.useState(options.enabled ?? true);

  const toggleWatermark = () => {
    setEnabled(!enabled);
  };

  const WatermarkComponent = enabled ? <ThemedFullscreenWatermark content={options.content} image={options.image} opacity={options.opacity} /> : null;

  return {
    enabled,
    toggleWatermark,
    WatermarkComponent,
  };
};

// 水印配置组件
export const ThemedWatermarkConfig: React.FC<{
  config: ThemedWatermarkProps;
  onChange: (config: ThemedWatermarkProps) => void;
  className?: string;
}> = ({ config, onChange, className }) => {
  const currentTheme = useCurrentTheme();

  const updateConfig = (updates: Partial<ThemedWatermarkProps>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className={classNames('themed-watermark-config', 'space-y-4', className)}>
      <div>
        <label className='block text-sm font-medium mb-2'>水印内容</label>
        <input
          type='text'
          value={Array.isArray(config.content) ? config.content.join(', ') : config.content || ''}
          onChange={(e) =>
            updateConfig({
              content: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          className='w-full p-2 border rounded'
          style={{
            backgroundColor: currentTheme.colors?.bg,
            borderColor: currentTheme.colors?.border,
            color: currentTheme.colors?.text,
          }}
        />
      </div>

      <div>
        <label className='block text-sm font-medium mb-2'>透明度: {config.opacity}</label>
        <input type='range' min='0' max='1' step='0.01' value={config.opacity} onChange={(e) => updateConfig({ opacity: parseFloat(e.target.value) })} className='w-full' />
      </div>

      <div>
        <label className='block text-sm font-medium mb-2'>旋转角度: {config.rotate}°</label>
        <input type='range' min='-180' max='180' value={config.rotate} onChange={(e) => updateConfig({ rotate: parseInt(e.target.value) })} className='w-full' />
      </div>

      <div className='flex items-center gap-2'>
        <input type='checkbox' checked={config.disabled} onChange={(e) => updateConfig({ disabled: e.target.checked })} className='rounded' />
        <label className='text-sm'>禁用水印</label>
      </div>
    </div>
  );
};

/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化QRCode组件，替换Arco Design QRCode
 * 完全受控于我们自己的主题系统
 */

export type QRCodeErrorLevel = 'L' | 'M' | 'Q' | 'H';
export type QRCodeType = 'canvas' | 'svg' | 'img';

export interface ThemedQRCodeProps {
  className?: string;
  value: string;
  size?: number;
  color?: string;
  bgColor?: string;
  bordered?: boolean;
  errorLevel?: QRCodeErrorLevel;
  type?: QRCodeType;
  icon?: string;
  iconSize?: number;
  style?: React.CSSProperties;
  onRefresh?: () => void;
  refreshable?: boolean;
  disabled?: boolean;
}

// 简单的QR码生成实现（实际项目中应该使用专门的QR码库）
export const ThemedQRCode: React.FC<ThemedQRCodeProps> = ({ className, value, size = 128, color, bgColor, bordered = true, errorLevel = 'M', type = 'canvas', icon, iconSize = 32, style, onRefresh, refreshable = false, disabled = false }) => {
  const currentTheme = useCurrentTheme();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const mergedColor = color || currentTheme.colors?.text || '#000000';
  const mergedBgColor = bgColor || currentTheme.colors?.bg || '#ffffff';

  // 生成QR码
  React.useEffect(() => {
    if (type !== 'canvas' || !canvasRef.current || disabled) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = size;
    canvas.height = size;

    // 清空画布
    ctx.fillStyle = mergedBgColor;
    ctx.fillRect(0, 0, size, size);

    // 简化的QR码生成（实际应该使用QR码库）
    ctx.fillStyle = mergedColor;

    // 生成模拟的QR码图案
    const moduleSize = size / 25;
    const modules = 25;

    // 基于内容生成伪随机图案
    const getModule = (x: number, y: number) => {
      const hash = (x * 7 + y * 13) % 31;
      const charCode = value.charCodeAt(hash % value.length);
      return (charCode + x + y) % 2 === 0;
    };

    // 绘制定位点
    const drawFinder = (x: number, y: number) => {
      // 外框
      ctx.fillStyle = mergedColor;
      ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize);
      ctx.fillStyle = mergedBgColor;
      ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);
      ctx.fillStyle = mergedColor;
      ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
    };

    // 绘制定位点
    drawFinder(0, 0);
    drawFinder(0, modules - 7);
    drawFinder(modules - 7, 0);

    // 绘制数据区域
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        // 跳过定位点区域
        if ((x < 9 && y < 9) || (x < 9 && y >= modules - 8) || (x >= modules - 8 && y < 9)) {
          continue;
        }

        if (getModule(x, y)) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // 绘制图标
    if (icon) {
      const img = new Image();
      img.onload = () => {
        const iconX = (size - iconSize) / 2;
        const iconY = (size - iconSize) / 2;

        // 清空图标区域
        ctx.fillStyle = mergedBgColor;
        ctx.fillRect(iconX - 2, iconY - 2, iconSize + 4, iconSize + 4);

        // 绘制图标
        ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
      };
      img.src = icon;
    }
  }, [value, size, mergedColor, mergedBgColor, type, icon, iconSize, refreshKey, disabled]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    onRefresh?.();
  };

  if (type === 'canvas') {
    return (
      <div
        className={classNames(
          'themed-qrcode',
          'relative',
          'inline-block',
          {
            'border-2 border-gray-300 dark:border-gray-600': bordered,
            'rounded-lg': bordered,
          },
          className
        )}
        style={style}
      >
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className={classNames({
            'opacity-50': disabled,
          })}
        />
        {refreshable && (
          <button
            onClick={handleRefresh}
            disabled={disabled}
            className={classNames('absolute', 'top-1', 'right-1', 'w-6', 'h-6', 'rounded-full', 'bg-white', 'bg-opacity-80', 'hover:bg-opacity-100', 'flex', 'items-center', 'justify-center', 'text-xs', 'transition-all', 'disabled:opacity-50', 'disabled:cursor-not-allowed')}
            style={{
              color: mergedColor,
            }}
          >
            ↻
          </button>
        )}
      </div>
    );
  }

  // SVG版本（简化实现）
  if (type === 'svg') {
    return (
      <div
        className={classNames(
          'themed-qrcode',
          'relative',
          'inline-block',
          {
            'border-2 border-gray-300 dark:border-gray-600': bordered,
            'rounded-lg': bordered,
          },
          className
        )}
        style={style}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={classNames({
            'opacity-50': disabled,
          })}
        >
          <rect width={size} height={size} fill={mergedBgColor} />
          <text x={size / 2} y={size / 2} textAnchor='middle' dominantBaseline='middle' fontSize={size / 8} fill={mergedColor} fontFamily='monospace'>
            QR Code
          </text>
          <text x={size / 2} y={size / 2 + size / 6} textAnchor='middle' dominantBaseline='middle' fontSize={size / 12} fill={mergedColor} fontFamily='monospace'>
            {value.substring(0, 20)}
          </text>
        </svg>
        {refreshable && (
          <button
            onClick={handleRefresh}
            disabled={disabled}
            className={classNames('absolute', 'top-1', 'right-1', 'w-6', 'h-6', 'rounded-full', 'bg-white', 'bg-opacity-80', 'hover:bg-opacity-100', 'flex', 'items-center', 'justify-center', 'text-xs', 'transition-all', 'disabled:opacity-50', 'disabled:cursor-not-allowed')}
            style={{
              color: mergedColor,
            }}
          >
            ↻
          </button>
        )}
      </div>
    );
  }

  // 图片版本（简化实现）
  return (
    <div
      className={classNames(
        'themed-qrcode',
        'relative',
        'inline-block',
        {
          'border-2 border-gray-300 dark:border-gray-600': bordered,
          'rounded-lg': bordered,
        },
        className
      )}
      style={style}
    >
      <div
        className={classNames('flex', 'items-center', 'justify-center', 'bg-white', {
          'opacity-50': disabled,
        })}
        style={{
          width: size,
          height: size,
          backgroundColor: mergedBgColor,
          color: mergedColor,
        }}
      >
        <div className='text-center'>
          <div className='text-xs font-mono'>QR Code</div>
          <div className='text-xs font-mono mt-1'>
            {value.substring(0, 15)}
            {value.length > 15 && '...'}
          </div>
        </div>
      </div>
      {refreshable && (
        <button
          onClick={handleRefresh}
          disabled={disabled}
          className={classNames('absolute', 'top-1', 'right-1', 'w-6', 'h-6', 'rounded-full', 'bg-white', 'bg-opacity-80', 'hover:bg-opacity-100', 'flex', 'items-center', 'justify-center', 'text-xs', 'transition-all', 'disabled:opacity-50', 'disabled:cursor-not-allowed')}
          style={{
            color: mergedColor,
          }}
        >
          ↻
        </button>
      )}
    </div>
  );
};

// 扫码组件
export interface ThemedQRScannerProps {
  className?: string;
  onScan?: (result: string) => void;
  onError?: (error: Error) => void;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  disabled?: boolean;
}

export const ThemedQRScanner: React.FC<ThemedQRScannerProps> = ({ className, onScan, onError, style, width = 300, height = 300, disabled = false }) => {
  const currentTheme = useCurrentTheme();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const startScanning = async () => {
    if (disabled || !videoRef.current) return;

    try {
      setScanning(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // 简化的扫码逻辑（实际应该使用扫码库）
      const scanInterval = setInterval(() => {
        if (!scanning) {
          clearInterval(scanInterval);
          return;
        }

        // 模拟扫码结果
        const mockResult = `https://example.com/scan/${Date.now()}`;
        onScan?.(mockResult);
        setScanning(false);
      }, 2000);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
      setScanning(false);
    }
  };

  const stopScanning = () => {
    setScanning(false);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  React.useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div
      className={classNames('themed-qr-scanner', 'relative', 'inline-block', className)}
      style={{
        width,
        height,
        ...style,
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={classNames('w-full', 'h-full', 'object-cover', 'rounded-lg', {
          'opacity-50': disabled,
        })}
        style={{
          backgroundColor: currentTheme.colors?.bg,
        }}
      />

      {!scanning && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='text-center p-4 rounded-lg bg-black bg-opacity-50 text-white'>
            <div className='text-lg mb-2'>📷</div>
            <div className='text-sm'>点击开始扫码</div>
          </div>
        </div>
      )}

      {error && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='text-center p-4 rounded-lg bg-red-500 bg-opacity-80 text-white'>
            <div className='text-sm'>❌ {error}</div>
          </div>
        </div>
      )}

      <div className='absolute bottom-4 left-0 right-0 flex justify-center'>
        <button
          onClick={scanning ? stopScanning : startScanning}
          disabled={disabled}
          className={classNames('px-4', 'py-2', 'rounded-full', 'text-white', 'font-medium', 'transition-all', 'disabled:opacity-50', 'disabled:cursor-not-allowed')}
          style={{
            backgroundColor: scanning ? currentTheme.colors?.danger : currentTheme.colors?.primary,
          }}
        >
          {scanning ? '停止扫码' : '开始扫码'}
        </button>
      </div>
    </div>
  );
};

// 预设配置
export const URLQRCode: React.FC<{
  url: string;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}> = ({ url, className, style, size = 128 }) => <ThemedQRCode value={url} className={className} style={style} size={size} refreshable={true} />;

export const WiFiQRCode: React.FC<{
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}> = ({ ssid, password, security, className, style, size = 128 }) => {
  const wifiString = `WIFI:T:${security};S:${ssid};P:${password};;`;

  return <ThemedQRCode value={wifiString} className={className} style={style} size={size} icon='📶' />;
};

export const ContactQRCode: React.FC<{
  name: string;
  phone?: string;
  email?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}> = ({ name, phone, email, className, style, size = 128 }) => {
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
${phone ? `TEL:${phone}` : ''}
${email ? `EMAIL:${email}` : ''}
END:VCARD`;

  return <ThemedQRCode value={vcard} className={className} style={style} size={size} icon='👤' />;
};

// QR码工具函数
export const useQRCode = (
  value: string,
  options?: {
    size?: number;
    color?: string;
    bgColor?: string;
  }
) => {
  const [qrCodeData, setQRCodeData] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const generateQRCode = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 简化的QR码生成（实际应该使用QR码库）
      const canvas = document.createElement('canvas');
      canvas.width = options?.size || 128;
      canvas.height = options?.size || 128;

      const dataURL = canvas.toDataURL();
      setQRCodeData(dataURL);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setLoading(false);
    }
  }, [value, options?.size]);

  React.useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  return {
    qrCodeData,
    loading,
    error,
    regenerate: generateQRCode,
  };
};

// QR码下载功能
export const useQRCodeDownload = () => {
  const downloadQRCode = (canvas: HTMLCanvasElement, filename: string = 'qrcode.png') => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL();
    link.click();
  };

  return { downloadQRCode };
};

// QR码配置组件
export const ThemedQRCodeConfig: React.FC<{
  config: ThemedQRCodeProps;
  onChange: (config: ThemedQRCodeProps) => void;
  className?: string;
}> = ({ config, onChange, className }) => {
  const currentTheme = useCurrentTheme();

  const updateConfig = (updates: Partial<ThemedQRCodeProps>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className={classNames('themed-qrcode-config', 'space-y-4', className)}>
      <div>
        <label className='block text-sm font-medium mb-2'>QR码内容</label>
        <textarea
          value={config.value}
          onChange={(e) => updateConfig({ value: e.target.value })}
          className='w-full p-2 border rounded'
          rows={3}
          style={{
            backgroundColor: currentTheme.colors?.bg,
            borderColor: currentTheme.colors?.border,
            color: currentTheme.colors?.text,
          }}
        />
      </div>

      <div>
        <label className='block text-sm font-medium mb-2'>尺寸: {config.size}px</label>
        <input type='range' min='64' max='512' step='32' value={config.size} onChange={(e) => updateConfig({ size: parseInt(e.target.value) })} className='w-full' />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium mb-2'>前景色</label>
          <input type='color' value={config.color || '#000000'} onChange={(e) => updateConfig({ color: e.target.value })} className='w-full h-10 border rounded' />
        </div>
        <div>
          <label className='block text-sm font-medium mb-2'>背景色</label>
          <input type='color' value={config.bgColor || '#ffffff'} onChange={(e) => updateConfig({ bgColor: e.target.value })} className='w-full h-10 border rounded' />
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <input type='checkbox' checked={config.bordered} onChange={(e) => updateConfig({ bordered: e.target.checked })} className='rounded' />
        <label className='text-sm'>显示边框</label>
      </div>

      <div className='flex items-center gap-2'>
        <input type='checkbox' checked={config.refreshable} onChange={(e) => updateConfig({ refreshable: e.target.checked })} className='rounded' />
        <label className='text-sm'>可刷新</label>
      </div>
    </div>
  );
};

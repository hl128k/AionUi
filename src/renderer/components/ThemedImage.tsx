/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Image组件，替换Arco Design Image
 * 完全受控于我们自己的主题系统
 */

export type ImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
export type ImagePosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type ImagePreviewPlacement = 'top' | 'right' | 'bottom' | 'left';

export interface ThemedImageProps {
  className?: string;
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  fit?: ImageFit;
  position?: ImagePosition;
  loading?: 'eager' | 'lazy';
  preview?: boolean;
  previewPlacement?: ImagePreviewPlacement;
  disabled?: boolean;
  error?: React.ReactNode;
  fallback?: string;
  placeholder?: React.ReactNode;
  title?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export const ThemedImage: React.FC<ThemedImageProps> = ({ className, src, alt = '', width, height, fit = 'cover', position = 'center', loading = 'lazy', preview = true, previewPlacement = 'top', disabled = false, error, fallback, placeholder, title, style, onClick, onLoad, onError }) => {
  const currentTheme = useCurrentTheme();
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(e);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (preview && !disabled && !hasError) {
      setIsPreviewVisible(true);
    }
    onClick?.(e);
  };

  const getImageStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      objectFit: fit,
      objectPosition: position,
      width: width || '100%',
      height: height || 'auto',
      ...style,
    };

    return baseStyle;
  };

  const renderImage = () => {
    if (hasError && fallback) {
      return (
        <div
          className={classNames('themed-image-fallback', 'flex items-center justify-center', 'bg-gray-100 border border-gray-300 rounded', className)}
          style={{
            width: width || '100%',
            height: height || '200px',
            ...style,
          }}
        >
          {typeof fallback === 'string' ? <img src={fallback} alt={alt} className='max-w-full max-h-full object-contain' style={getImageStyle()} /> : <div className='text-gray-500 text-sm'>{fallback}</div>}
        </div>
      );
    }

    if (hasError && error) {
      return (
        <div
          className={classNames('themed-image-error', 'flex items-center justify-center', 'bg-gray-100 border border-gray-300 rounded', className)}
          style={{
            width: width || '100%',
            height: height || '200px',
            ...style,
          }}
        >
          {typeof error === 'string' ? <div className='text-gray-500 text-sm'>{error}</div> : error}
        </div>
      );
    }

    return <img ref={imgRef} src={src} alt={alt} title={title} loading={loading} className={classNames('themed-image', 'transition-opacity duration-300', isLoading ? 'opacity-0' : 'opacity-100', preview && !disabled && !hasError ? 'cursor-pointer hover:opacity-80' : '', className)} style={getImageStyle()} onLoad={handleLoad} onError={handleError} onClick={handleImageClick} />;
  };

  const renderPlaceholder = () => {
    if (!isLoading || !placeholder) return null;

    return (
      <div
        className={classNames('themed-image-placeholder', 'absolute inset-0 flex items-center justify-center', 'bg-gray-100 rounded')}
        style={{
          width: width || '100%',
          height: height || 'auto',
        }}
      >
        {typeof placeholder === 'string' ? <div className='text-gray-400 text-sm'>{placeholder}</div> : placeholder}
      </div>
    );
  };

  const renderPreview = () => {
    if (!isPreviewVisible || !src || hasError) return null;

    return (
      <div className={classNames('themed-image-preview', 'fixed inset-0 z-50 flex items-center justify-center', 'bg-black bg-opacity-75 backdrop-blur-sm')} onClick={() => setIsPreviewVisible(false)}>
        <div className={classNames('themed-image-preview-content', 'relative max-w-[90vw] max-h-[90vh]', 'bg-white rounded-lg shadow-2xl overflow-hidden')} onClick={(e) => e.stopPropagation()}>
          {/* 预览图片 */}
          <img src={src} alt={alt} className='max-w-full max-h-full object-contain' />

          {/* 预览控制栏 */}
          <div className={classNames('themed-image-preview-controls', 'absolute bottom-0 left-0 right-0', 'bg-black bg-opacity-50 text-white p-4', 'flex items-center justify-between')}>
            <div className='text-sm truncate max-w-xs'>{alt || title || 'Image Preview'}</div>
            <div className='flex space-x-2'>
              <button
                className='px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors'
                onClick={() => {
                  if (imgRef.current?.requestFullscreen) {
                    imgRef.current.requestFullscreen();
                  }
                }}
              >
                全屏
              </button>
              <button className='px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors' onClick={() => setIsPreviewVisible(false)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={classNames('themed-image-wrapper', 'relative inline-block')}>
      {renderImage()}
      {renderPlaceholder()}
      {renderPreview()}
    </div>
  );
};

// Image 子组件
export const AvatarImage: React.FC<Omit<ThemedImageProps, 'fit' | 'preview'>> = (props) => <ThemedImage {...props} fit='cover' preview={false} className={classNames('rounded-full', props.className)} />;

export const CoverImage: React.FC<Omit<ThemedImageProps, 'fit'>> = (props) => <ThemedImage {...props} fit='cover' />;

export const ContainImage: React.FC<Omit<ThemedImageProps, 'fit'>> = (props) => <ThemedImage {...props} fit='contain' />;

export const ThumbnailImage: React.FC<Omit<ThemedImageProps, 'width' | 'height' | 'preview'>> = (props) => <ThemedImage {...props} width={80} height={80} preview={true} />;

export const BannerImage: React.FC<Omit<ThemedImageProps, 'height'>> = (props) => <ThemedImage {...props} height={200} />;

// 预设配置
export const ProductImage: React.FC<{
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ src, alt, className, style }) => <ThemedImage src={src} alt={alt} width={300} height={300} fit='contain' preview={true} placeholder='Loading product image...' error='Product image not available' className={classNames('border border-gray-200 rounded-lg', className)} style={style} />;

export const ProfileImage: React.FC<{
  src: string;
  alt?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ src, alt, size = 120, className, style }) => <ThemedImage src={src} alt={alt} width={size} height={size} fit='cover' preview={true} className={classNames('rounded-full border-2 border-white shadow-lg', className)} style={style} />;

export const GalleryImage: React.FC<{
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ src, alt, className, style }) => <ThemedImage src={src} alt={alt} width={400} height={300} fit='cover' preview={true} placeholder='📷 Loading image...' error='🚫 Image failed to load' className={classNames('rounded-lg shadow-md hover:shadow-lg transition-shadow', className)} style={style} />;

// Image 工具函数
export const useImageLoader = (src?: string) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [imageData, setImageData] = React.useState<{
    naturalWidth: number;
    naturalHeight: number;
    aspectRatio: number;
  } | null>(null);

  const loadImage = React.useCallback(async (imageSrc: string) => {
    setIsLoading(true);
    setHasError(false);

    try {
      const img = new Image();
      img.onload = () => {
        setImageData({
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight,
        });
        setIsLoading(false);
      };
      img.onerror = () => {
        setHasError(true);
        setIsLoading(false);
      };
      img.src = imageSrc;
    } catch (error) {
      setHasError(true);
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (src) {
      loadImage(src);
    }
  }, [src, loadImage]);

  return {
    isLoading,
    hasError,
    imageData,
    loadImage,
  };
};

export const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
};

export const optimizeImageUrl = (
  src: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  }
): string => {
  if (!src) return src;

  const url = new URL(src, window.location.origin);

  if (options?.width) {
    url.searchParams.set('w', options.width.toString());
  }
  if (options?.height) {
    url.searchParams.set('h', options.height.toString());
  }
  if (options?.quality) {
    url.searchParams.set('q', options.quality.toString());
  }
  if (options?.format) {
    url.searchParams.set('format', options.format);
  }

  return url.toString();
};

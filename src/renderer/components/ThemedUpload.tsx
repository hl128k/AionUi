/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';

/**
 * 内部主题化Upload组件，替换Arco Design Upload
 * 完全受控于我们自己的主题系统
 */

export interface UploadFile {
  uid: string;
  name: string;
  size?: number;
  type?: string;
  status: 'init' | 'uploading' | 'done' | 'error';
  url?: string;
  percent?: number;
  response?: any;
  error?: any;
}

export type UploadType = 'select' | 'drag' | 'drag-image';
export type UploadListType = 'text' | 'picture' | 'picture-card';
export type UploadShape = 'square' | 'round';
export type UploadSize = 'small' | 'medium' | 'large';

export interface ThemedUploadProps {
  className?: string;
  accept?: string;
  action?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  data?: Record<string, any> | ((file: UploadFile) => Record<string, any>);
  name?: string;
  multiple?: boolean;
  disabled?: boolean;
  type?: UploadType;
  listType?: UploadListType;
  shape?: UploadShape;
  size?: UploadSize;
  showUploadList?: boolean;
  showFileList?: boolean;
  showRetry?: boolean;
  showRemove?: boolean;
  showPreview?: boolean;
  autoUpload?: boolean;
  limit?: number;
  customRequest?: (options: UploadRequestOptions) => void;
  onBeforeUpload?: (file: File) => boolean | Promise<boolean>;
  onChange?: (file: UploadFile, fileList: UploadFile[]) => void;
  onProgress?: (file: UploadFile, fileList: UploadFile[]) => void;
  onSuccess?: (response: any, file: UploadFile, fileList: UploadFile[]) => void;
  onError?: (error: any, file: UploadFile, fileList: UploadFile[]) => void;
  onRemove?: (file: UploadFile) => boolean | Promise<boolean>;
  onPreview?: (file: UploadFile) => void;
  children?: ReactNode;
  defaultFileList?: UploadFile[];
}

export interface UploadRequestOptions {
  file: UploadFile;
  filename: string;
  data: Record<string, any>;
  headers: Record<string, string>;
  method: string;
  action: string;
  onProgress: (percent: number) => void;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
}

export const ThemedUpload: React.FC<ThemedUploadProps> = ({ className, accept, action = '/upload', method = 'POST', headers = {}, data = {}, name = 'file', multiple = false, disabled = false, type = 'select', listType = 'text', shape = 'square', size = 'medium', showUploadList = true, showFileList = true, showRetry = true, showRemove = true, showPreview = true, autoUpload = true, limit, customRequest, onBeforeUpload, onChange, onProgress, onSuccess, onError, onRemove, onPreview, children, defaultFileList = [] }) => {
  const currentTheme = useCurrentTheme();
  const [fileList, setFileList] = React.useState<UploadFile[]>(defaultFileList);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const generateUid = () => `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const getFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const uploadFile = (file: UploadFile) => {
    const formData = new FormData();
    formData.append(name, file as any);

    const uploadData = typeof data === 'function' ? data(file) : data;
    Object.entries(uploadData).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    const xhr = new XMLHttpRequest();
    xhr.open(method, action, true);

    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        updateFile(file.uid, { percent, status: 'uploading' });
        onProgress?.(file, fileList);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        updateFile(file.uid, { status: 'done', response });
        onSuccess?.(response, file, fileList);
      } else {
        const error = new Error(xhr.statusText);
        updateFile(file.uid, { status: 'error', error });
        onError?.(error, file, fileList);
      }
    };

    xhr.onerror = () => {
      const error = new Error('Network error');
      updateFile(file.uid, { status: 'error', error });
      onError?.(error, file, fileList);
    };

    xhr.send(formData);
  };

  const updateFile = (uid: string, updates: Partial<UploadFile>) => {
    setFileList((prev) => prev.map((file) => (file.uid === uid ? { ...file, ...updates } : file)));
  };

  const handleFileSelect = (files: FileList) => {
    const newFiles: UploadFile[] = Array.from(files).map((file) => ({
      uid: generateUid(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'init',
    }));

    if (limit && fileList.length + newFiles.length > limit) {
      console.warn(`Cannot upload more than ${limit} files`);
      return;
    }

    setFileList((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      if (autoUpload) {
        if (customRequest) {
          customRequest({
            file,
            filename: file.name,
            data: typeof data === 'function' ? data(file) : data,
            headers,
            method,
            action,
            onProgress: (percent) => {
              updateFile(file.uid, { percent, status: 'uploading' });
              onProgress?.(file, fileList);
            },
            onSuccess: (response) => {
              updateFile(file.uid, { status: 'done', response });
              onSuccess?.(response, file, fileList);
            },
            onError: (error) => {
              updateFile(file.uid, { status: 'error', error });
              onError?.(error, file, fileList);
            },
          });
        } else {
          uploadFile(file);
        }
      }
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const getShapeClasses = () => {
    switch (shape) {
      case 'round':
        return 'rounded-full';
      default:
        return 'rounded-lg';
    }
  };

  const renderUploadArea = () => {
    if (type === 'drag' || type === 'drag-image') {
      return (
        <div
          className={classNames('themed-upload-drag', 'border-2 border-dashed', 'flex flex-col items-center justify-center', 'p-8 cursor-pointer transition-all duration-200', 'hover:border-opacity-80 hover:shadow-md', disabled ? 'opacity-50 cursor-not-allowed' : '', isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : '', getShapeClasses(), getSizeClasses())}
          style={{
            borderColor: isDragging ? currentTheme.colors?.primary : currentTheme.colors?.border,
            backgroundColor: isDragging ? `${currentTheme.colors?.primary}10` : 'transparent',
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={disabled ? undefined : handleClick}
        >
          <div className='text-center'>
            <div className='mb-4'>
              <svg className='w-12 h-12 mx-auto' style={{ color: currentTheme.colors?.textSecondary }} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' />
              </svg>
            </div>
            <p className='mb-2' style={{ color: currentTheme.colors?.text }}>
              {type === 'drag-image' ? '拖拽图片到此处上传' : '拖拽文件到此处上传'}
            </p>
            <p className='text-sm' style={{ color: currentTheme.colors?.textSecondary }}>
              或 <span style={{ color: currentTheme.colors?.primary }}>点击选择文件</span>
            </p>
            {accept && (
              <p className='text-xs mt-2' style={{ color: currentTheme.colors?.textSecondary }}>
                支持格式: {accept}
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        className={classNames('themed-upload-select', 'inline-flex items-center justify-center', 'px-4 py-2 cursor-pointer transition-all duration-200', 'border hover:shadow-md', disabled ? 'opacity-50 cursor-not-allowed' : '', getShapeClasses(), getSizeClasses())}
        style={{
          backgroundColor: currentTheme.colors?.primary,
          color: currentTheme.colors?.white,
          borderColor: currentTheme.colors?.primary,
        }}
        onClick={disabled ? undefined : handleClick}
      >
        <span>{children || '选择文件'}</span>
      </div>
    );
  };

  const renderFileList = () => {
    if (!showUploadList || !showFileList) return null;

    return (
      <div className='themed-upload-list mt-4 space-y-2'>
        {fileList.map((file) => (
          <div
            key={file.uid}
            className={classNames('themed-upload-item', 'flex items-center justify-between', 'p-3 border rounded-lg', 'transition-all duration-200', file.status === 'error' ? 'border-red-500' : '')}
            style={{
              borderColor: file.status === 'error' ? currentTheme.colors?.error : currentTheme.colors?.border,
              backgroundColor: currentTheme.colors?.cardBg,
            }}
          >
            <div className='flex items-center space-x-3 flex-1'>
              {listType === 'picture' || listType === 'picture-card' ? (
                <div className='w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center'>
                  {file.url ? (
                    <img src={file.url} alt={file.name} className='w-full h-full object-cover' />
                  ) : (
                    <svg className='w-6 h-6' style={{ color: currentTheme.colors?.textSecondary }} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                    </svg>
                  )}
                </div>
              ) : (
                <svg className='w-6 h-6' style={{ color: currentTheme.colors?.textSecondary }} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
              )}

              <div className='flex-1 min-w-0'>
                <div className='flex items-center space-x-2'>
                  <span className='font-medium truncate' style={{ color: currentTheme.colors?.text }}>
                    {file.name}
                  </span>
                  {file.size && (
                    <span className='text-sm' style={{ color: currentTheme.colors?.textSecondary }}>
                      ({getFileSize(file.size)})
                    </span>
                  )}
                </div>

                {file.status === 'uploading' && file.percent !== undefined && (
                  <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2'>
                    <div className='bg-blue-500 h-2 rounded-full transition-all duration-200' style={{ width: `${file.percent}%` }} />
                  </div>
                )}

                {file.status === 'error' && (
                  <span className='text-sm' style={{ color: currentTheme.colors?.error }}>
                    上传失败
                  </span>
                )}
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              {showPreview && file.url && (
                <button onClick={() => onPreview?.(file)} className='p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors' style={{ color: currentTheme.colors?.textSecondary }}>
                  👁️
                </button>
              )}

              {file.status === 'error' && showRetry && (
                <button onClick={() => uploadFile(file)} className='p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors' style={{ color: currentTheme.colors?.warning }}>
                  🔄
                </button>
              )}

              {showRemove && (
                <button
                  onClick={() => {
                    if (onRemove?.(file) !== false) {
                      setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
                    }
                  }}
                  className='p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                  style={{ color: currentTheme.colors?.error }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={classNames('themed-upload', className)}>
      <input ref={fileInputRef} type='file' accept={accept} multiple={multiple} disabled={disabled} onChange={handleFileInput} className='hidden' />

      {renderUploadArea()}
      {renderFileList()}
    </div>
  );
};

// Upload 组件的子组件
export const UploadDragger: React.FC<Omit<ThemedUploadProps, 'type'>> = (props) => <ThemedUpload {...props} type='drag' />;

export const UploadPicture: React.FC<Omit<ThemedUploadProps, 'listType'>> = (props) => <ThemedUpload {...props} listType='picture' />;

export const UploadPictureCard: React.FC<Omit<ThemedUploadProps, 'listType'>> = (props) => <ThemedUpload {...props} listType='picture-card' />;

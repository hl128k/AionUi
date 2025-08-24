/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCurrentTheme } from '@/renderer/themes/provider';
import classNames from 'classnames';
import React from 'react';

/**
 * 内部主题化Comment组件，替换Arco Design Comment
 * 完全受控于我们自己的主题系统
 */

export interface CommentAction {
  key: string;
  text: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  danger?: boolean;
}

export interface ThemedCommentProps {
  className?: string;
  content: React.ReactNode;
  author?: React.ReactNode;
  avatar?: React.ReactNode;
  datetime?: React.ReactNode;
  actions?: CommentAction[];
  children?: React.ReactNode;
  style?: React.CSSProperties;
  align?: 'left' | 'right';
  nested?: boolean;
}

export const ThemedComment: React.FC<ThemedCommentProps> = ({ className, content, author, avatar, datetime, actions, children, style, align = 'left', nested = false }) => {
  const currentTheme = useCurrentTheme();

  return (
    <div
      className={classNames(
        'themed-comment',
        'relative',
        'w-full',
        {
          'pl-8': nested,
          'border-l-2 border-gray-200 dark:border-gray-700': nested,
          'text-right': align === 'right',
        },
        className
      )}
      style={{
        backgroundColor: currentTheme.colors?.bg,
        color: currentTheme.colors?.text,
        ...style,
      }}
    >
      <div className={classNames('flex', 'gap-3', { 'flex-row-reverse': align === 'right' })}>
        {/* 头像 */}
        {avatar && <div className='flex-shrink-0'>{avatar}</div>}

        {/* 评论内容 */}
        <div className='flex-1 min-w-0'>
          {/* 作者信息和时间 */}
          {(author || datetime) && (
            <div
              className={classNames('flex', 'items-center', 'gap-2', 'mb-1', {
                'justify-end': align === 'right',
              })}
            >
              {author && (
                <span className='font-medium text-sm' style={{ color: currentTheme.colors?.primary }}>
                  {author}
                </span>
              )}
              {datetime && <span className='text-xs opacity-60'>{datetime}</span>}
            </div>
          )}

          {/* 评论内容 */}
          <div className='mb-2'>{content}</div>

          {/* 操作按钮 */}
          {actions && actions.length > 0 && (
            <div
              className={classNames('flex', 'gap-3', 'text-sm', {
                'justify-end': align === 'right',
              })}
            >
              {actions.map((action) => (
                <button
                  key={action.key}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={classNames('opacity-70', 'hover:opacity-100', 'transition-opacity', 'disabled:opacity-40', 'disabled:cursor-not-allowed', {
                    'text-red-500 hover:text-red-600': action.danger,
                    'hover:underline': !action.danger,
                  })}
                  style={{
                    color: action.danger ? currentTheme.colors?.danger : currentTheme.colors?.primary,
                  }}
                >
                  {action.text}
                </button>
              ))}
            </div>
          )}

          {/* 嵌套评论 */}
          {children && <div className='mt-3'>{children}</div>}
        </div>
      </div>
    </div>
  );
};

// 评论列表组件
export interface ThemedCommentListProps {
  className?: string;
  comments: Array<ThemedCommentProps & { key?: string | number }>;
  style?: React.CSSProperties;
  showReplies?: boolean;
  maxDepth?: number;
}

export const ThemedCommentList: React.FC<ThemedCommentListProps> = ({ className, comments, style, showReplies = true, maxDepth = 3 }) => {
  const renderComment = (comment: ThemedCommentProps & { key?: string | number }, depth: number = 0) => {
    if (depth >= maxDepth) return null;

    return (
      <ThemedComment
        key={comment.key}
        {...comment}
        nested={depth > 0}
        className={classNames(comment.className, {
          'mt-4': depth > 0,
        })}
      >
        {showReplies && comment.children && (
          <div className='mt-3'>
            {React.Children.map(comment.children, (child, index) => {
              if (React.isValidElement(child) && child.type === ThemedComment) {
                return renderComment(
                  {
                    ...child.props,
                    key: child.key || `reply-${index}`,
                  },
                  depth + 1
                );
              }
              return child;
            })}
          </div>
        )}
      </ThemedComment>
    );
  };

  return (
    <div className={classNames('themed-comment-list', 'space-y-4', className)} style={style}>
      {comments.map((comment) => renderComment(comment))}
    </div>
  );
};

// 评论编辑器组件
export interface ThemedCommentEditorProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  maxLength?: number;
  showActions?: boolean;
  submitText?: string;
  cancelText?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const ThemedCommentEditor: React.FC<ThemedCommentEditorProps> = ({ className, value = '', onChange, onSubmit, onCancel, placeholder = '写下你的评论...', maxLength, showActions = true, submitText = '发表', cancelText = '取消', disabled = false, style }) => {
  const currentTheme = useCurrentTheme();
  const [internalValue, setInternalValue] = React.useState(value);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleSubmit = () => {
    if (internalValue.trim()) {
      onSubmit?.(internalValue);
      setInternalValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 自动调整高度
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [internalValue]);

  return (
    <div className={classNames('themed-comment-editor', 'relative', 'w-full', className)} style={style}>
      <textarea
        ref={textareaRef}
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={classNames('w-full', 'p-3', 'border', 'rounded-lg', 'resize-none', 'min-h-[80px]', 'max-h-[200px]', 'transition-all', 'focus:outline-none', 'focus:ring-2', {
          'opacity-60 cursor-not-allowed': disabled,
        })}
        style={{
          backgroundColor: currentTheme.colors?.bg,
          borderColor: currentTheme.colors?.border,
          color: currentTheme.colors?.text,
          focusRingColor: currentTheme.colors?.primary,
        }}
      />

      {maxLength && (
        <div className='text-xs opacity-60 mt-1 text-right'>
          {internalValue.length}/{maxLength}
        </div>
      )}

      {showActions && (
        <div className='flex justify-end gap-2 mt-2'>
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={disabled}
              className={classNames('px-4', 'py-2', 'rounded-lg', 'text-sm', 'transition-all', 'disabled:opacity-40', 'disabled:cursor-not-allowed')}
              style={{
                backgroundColor: currentTheme.colors?.bg,
                borderColor: currentTheme.colors?.border,
                color: currentTheme.colors?.text,
              }}
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={disabled || !internalValue.trim()}
            className={classNames('px-4', 'py-2', 'rounded-lg', 'text-sm', 'text-white', 'transition-all', 'disabled:opacity-40', 'disabled:cursor-not-allowed')}
            style={{
              backgroundColor: currentTheme.colors?.primary,
            }}
          >
            {submitText}
          </button>
        </div>
      )}
    </div>
  );
};

// 评论统计组件
export interface ThemedCommentStatsProps {
  className?: string;
  totalComments: number;
  totalReplies?: number;
  latestComment?: string;
  style?: React.CSSProperties;
}

export const ThemedCommentStats: React.FC<ThemedCommentStatsProps> = ({ className, totalComments, totalReplies = 0, latestComment, style }) => {
  const currentTheme = useCurrentTheme();

  return (
    <div className={classNames('themed-comment-stats', 'flex', 'items-center', 'gap-4', 'text-sm', className)} style={style}>
      <div className='flex items-center gap-2'>
        <span className='font-medium' style={{ color: currentTheme.colors?.primary }}>
          {totalComments}
        </span>
        <span className='opacity-70'>{totalComments === 1 ? '条评论' : '条评论'}</span>
      </div>

      {totalReplies > 0 && (
        <div className='flex items-center gap-2'>
          <span className='font-medium' style={{ color: currentTheme.colors?.primary }}>
            {totalReplies}
          </span>
          <span className='opacity-70'>{totalReplies === 1 ? '条回复' : '条回复'}</span>
        </div>
      )}

      {latestComment && <div className='opacity-60'>最新评论: {latestComment}</div>}
    </div>
  );
};

// 预设配置
export const UserComment: React.FC<Omit<ThemedCommentProps, 'avatar' | 'author' | 'datetime'>> = (props) => {
  const currentTheme = useCurrentTheme();

  return (
    <ThemedComment
      {...props}
      avatar={
        <div className='w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium' style={{ backgroundColor: currentTheme.colors?.primary }}>
          U
        </div>
      }
      author='用户'
      datetime={new Date().toLocaleString()}
    />
  );
};

export const AdminComment: React.FC<Omit<ThemedCommentProps, 'avatar' | 'author' | 'datetime'>> = (props) => {
  const currentTheme = useCurrentTheme();

  return (
    <ThemedComment
      {...props}
      avatar={
        <div className='w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium' style={{ backgroundColor: currentTheme.colors?.success }}>
          A
        </div>
      }
      author='管理员'
      datetime={new Date().toLocaleString()}
    />
  );
};

// 评论工具函数
export const useCommentCount = (comments: ThemedCommentProps[]) => {
  const count = React.useMemo(() => {
    let total = 0;

    const countRecursive = (comment: ThemedCommentProps) => {
      total++;
      if (comment.children) {
        React.Children.forEach(comment.children, (child) => {
          if (React.isValidElement(child) && child.type === ThemedComment) {
            countRecursive(child.props);
          }
        });
      }
    };

    comments.forEach(countRecursive);
    return total;
  }, [comments]);

  return count;
};

export const useCommentSearch = (comments: ThemedCommentProps[], searchTerm: string) => {
  return React.useMemo(() => {
    if (!searchTerm.trim()) return comments;

    const searchRecursive = (comment: ThemedCommentProps): boolean => {
      // 搜索评论内容
      const content = typeof comment.content === 'string' ? comment.content : React.Children.toArray(comment.content).join('');

      const author = typeof comment.author === 'string' ? comment.author : '';

      if (content.toLowerCase().includes(searchTerm.toLowerCase()) || author.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }

      // 搜索子评论
      if (comment.children) {
        return React.Children.toArray(comment.children).some((child) => {
          if (React.isValidElement(child) && child.type === ThemedComment) {
            return searchRecursive(child.props);
          }
          return false;
        });
      }

      return false;
    };

    return comments.filter(searchRecursive);
  }, [comments, searchTerm]);
};

export const useCommentSort = (comments: ThemedCommentProps[], sortBy: 'newest' | 'oldest' | 'popular') => {
  return React.useMemo(() => {
    const sorted = [...comments];

    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => {
          // 这里应该根据实际的时间戳进行排序
          return 0; // 简化实现
        });
      case 'oldest':
        return sorted.sort((a, b) => {
          return 0; // 简化实现
        });
      case 'popular':
        return sorted.sort((a, b) => {
          // 根据回复数量排序
          const aReplies = a.children ? React.Children.count(a.children) : 0;
          const bReplies = b.children ? React.Children.count(b.children) : 0;
          return bReplies - aReplies;
        });
      default:
        return sorted;
    }
  }, [comments, sortBy]);
};

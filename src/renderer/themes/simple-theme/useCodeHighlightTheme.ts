/**
 * 代码高亮主题配置
 */

import type { CSSProperties } from 'react';
import { useTheme } from './index';

interface CodeHighlightTheme {
  codeHighlight: {
    headerColor: string;
    iconColor: string;
  };
  syntaxHighlighterStyle: { [key: string]: CSSProperties };
  inlineCodeStyle: CSSProperties;
  codeBlockHeaderStyle: CSSProperties;
}

export const useCodeHighlightTheme = (): CodeHighlightTheme => {
  const { theme } = useTheme();

  const lightTheme: CodeHighlightTheme = {
    codeHighlight: {
      headerColor: '#666',
      iconColor: '#666',
    },
    syntaxHighlighterStyle: {
      hljs: {
        display: 'block',
        overflowX: 'auto' as const,
        padding: '0.5em',
        background: '#f6f8fa',
        color: '#24292e',
      },
      'hljs-keyword': {
        color: '#d73a49',
      },
      'hljs-string': {
        color: '#032f62',
      },
      'hljs-comment': {
        color: '#6a737d',
      },
      'hljs-function': {
        color: '#6f42c1',
      },
      'hljs-variable': {
        color: '#005cc5',
      },
      'hljs-number': {
        color: '#005cc5',
      },
    },
    inlineCodeStyle: {
      backgroundColor: 'rgba(175, 184, 193, 0.2)',
      padding: '0.2em 0.4em',
      borderRadius: '3px',
      fontSize: '85%',
      fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
    },
    codeBlockHeaderStyle: {
      backgroundColor: '#f6f8fa',
      borderTopLeftRadius: '0.3rem',
      borderTopRightRadius: '0.3rem',
      padding: '0.5rem 0',
    },
  };

  const darkTheme: CodeHighlightTheme = {
    codeHighlight: {
      headerColor: '#aaa',
      iconColor: '#aaa',
    },
    syntaxHighlighterStyle: {
      hljs: {
        display: 'block',
        overflowX: 'auto' as const,
        padding: '0.5em',
        background: '#1e1e1e',
        color: '#d4d4d4',
      },
      'hljs-keyword': {
        color: '#569cd6',
      },
      'hljs-string': {
        color: '#ce9178',
      },
      'hljs-comment': {
        color: '#6a9955',
      },
      'hljs-function': {
        color: '#dcdcaa',
      },
      'hljs-variable': {
        color: '#9cdcfe',
      },
      'hljs-number': {
        color: '#b5cea8',
      },
    },
    inlineCodeStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: '0.2em 0.4em',
      borderRadius: '3px',
      fontSize: '85%',
      fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
    },
    codeBlockHeaderStyle: {
      backgroundColor: '#2d2d2d',
      borderTopLeftRadius: '0.3rem',
      borderTopRightRadius: '0.3rem',
      padding: '0.5rem 0',
    },
  };

  return theme === 'dark' ? darkTheme : lightTheme;
};

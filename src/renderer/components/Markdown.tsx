/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import ReactMarkdown from 'react-markdown';

import SyntaxHighlighter from 'react-syntax-highlighter';
import rehypeKatex from 'rehype-katex';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
// import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";

import { ipcBridge } from '@/common';
import { Down, Up } from '@icon-park/react';
import { theme } from '@office-ai/platform';
import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useTheme as useThemeCtx } from '@/renderer/themes/provider';

const formatCode = (code: string) => {
  const content = String(code).replace(/\n$/, '');
  try {
    //@todo 可以再美化
    return JSON.stringify(
      JSON.parse(content),
      (key, value) => {
        return value;
      },
      2
    );
  } catch (error) {
    return content;
  }
};

const logicRender = <T, F>(condition: boolean, trueComponent: T, falseComponent?: F): T | F => {
  return condition ? trueComponent : falseComponent;
};

interface CodeBlockProps {
  children: string;
  className?: string;
  [key: string]: unknown;
}

import { themeManager } from '@/renderer/themes/manager';

function CodeBlock(props: CodeBlockProps) {
  const [fold, setFlow] = useState(false);
  // 订阅主题上下文，确保主题变更时代码高亮重新渲染
  const { themeId, mode } = useThemeCtx();
  return useMemo(() => {
    const { children, className, ...rest } = props;
    const match = /language-(\w+)/.exec(className || '');
    const language = match?.[1] || 'text';
    // load theme code highlight tokens
    const { pack } = themeManager.getCurrent();
    const codeTokens = (mode === 'dark' ? pack.dark : pack.light).codeHighlight || {};
    if (!String(children).includes('\n')) {
      return (
        <code
          {...rest}
          className={className}
          style={{
            backgroundColor: codeTokens.inlineCodeBackground || 'var(--color-fill-1)',
            padding: '2px 4px',
            margin: '0 4px',
            borderRadius: '4px',
            border: '1px solid',
            borderColor: codeTokens.inlineCodeBorder || 'var(--color-border-1)',
          }}
        >
          {children}
        </code>
      );
    }
    return (
      <div style={props.codeStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            alignItems: 'center',
            backgroundColor: codeTokens.headerBackground || 'var(--color-border-1)',
            borderTopLeftRadius: '0.3rem',
            borderTopRightRadius: '0.3rem',
            borderBottomLeftRadius: '0',
            borderBottomRightRadius: '0',
          }}
        >
          <span
            style={{
              textDecoration: 'none',
              color: codeTokens.headerColor || 'gray',
              padding: '2px',
              margin: '2px 10px 0 10px',
            }}
          >
            {'<' + language.toLocaleLowerCase() + '>'}
          </span>
          <div style={{ marginRight: 10, paddingTop: 2 }}>{logicRender(!fold, <Up theme='outline' size='24' style={{ cursor: 'pointer' }} fill='gray' onClick={() => setFlow(true)} />, <Down theme='outline' size='24' style={{ cursor: 'pointer' }} fill='gray' onClick={() => setFlow(false)} />)}</div>
        </div>
        {logicRender(
          !fold,
          <SyntaxHighlighter
            children={formatCode(children)}
            language={language}
            // style={coy}
            PreTag='div'
            customStyle={{
              marginTop: '0',
              margin: '0',
              borderTopLeftRadius: '0',
              borderTopRightRadius: '0',
              borderBottomLeftRadius: '0.3rem',
              borderBottomRightRadius: '0.3rem',
              border: 'none',
              background: codeTokens.background,
              color: codeTokens.color,
            }}
          />
        )}
      </div>
    );
  }, [props, themeId, mode]);
}

const createInitStyle = () => {
  const style = document.createElement('style');
  style.innerHTML = `
  * {
    line-height:26px;
    font-size:14px;
  }
  .markdown-shadow-body>p:first-child
  {
    margin-top:0px;
  }
  h1,h2,h3,h4,h5,h6,p,pre{
    margin-block-start:0px;
    margin-block-end:0px;
  }
  a{
    color:${theme.Color.PrimaryColor};
     text-decoration: none;
     cursor: pointer;
  }
  h1{
    font-size: 24px;
    line-height: 32px;
    font-weight: bold;
  }
  h2,h3,h4,h5,h6{
    font-size: 16px;
    line-height: 24px;
    font-weight: bold;
    margin-top: 8px;
    margin-bottom: 8px;
  }
 
  .markdown-shadow-body>p:last-child{
    margin-bottom:0px;
  }
  ol {
    padding-inline-start:20px;
  }
  img {
    max-width: 100%;
  }
   /* 给整个表格添加边框 */
  table {
    border-collapse: collapse;  /* 表格边框合并为单一边框 */
    th{
      padding: 8px;
      border: 1px solid var(--color-border-1);
      background-color: #f5f5f5;
      font-weight: bold;
    }
    td{
        padding: 8px;
        border: 1px solid var(--color-border-1);
        min-width: 120px;
    }
  }`;
  return style;
};

const ShadowView = ({ children }: { children: React.ReactNode }) => {
  const [root, setRoot] = useState(null);
  return (
    <div
      ref={(el: HTMLDivElement | null) => {
        if (!el || el.__init__shadow) return;
        el.__init__shadow = true;
        const shadowRoot = el.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(createInitStyle());
        setRoot(shadowRoot);
      }}
      className='markdown-shadow'
      style={{ width: '100%' }}
    >
      {root && ReactDOM.createPortal(children, root)}
    </div>
  );
};

const MarkdownView: React.FC<{
  children: string;
  hiddenCodeCopyButton?: boolean;
  codeStyle?: React.CSSProperties;
  className?: string;
  onRef?: (el?: HTMLDivElement | null) => void;
}> = ({ hiddenCodeCopyButton, codeStyle, ...props }) => {
  const { t } = useTranslation();
  return (
    <ShadowView>
      <div ref={props.onRef} className='markdown-shadow-body'>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
          rehypePlugins={[rehypeKatex]}
          components={{
            code: (props: CodeBlockProps) => CodeBlock({ ...props, codeStyle, hiddenCodeCopyButton }),
            a: ({ ...props }) => (
              <a
                {...props}
                target='_blank'
                rel='noreferrer'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!props.href) return;
                  try {
                    ipcBridge.shell.openExternal.invoke(props.href);
                  } catch (error) {
                    console.error(t('messages.openLinkFailed'), error);
                  }
                }}
              />
            ),
            table: ({ ...props }) => (
              <div style={{ overflowX: 'auto', maxWidth: 'calc(100vw - 32px)' }}>
                <table
                  {...props}
                  style={{
                    ...props.style,
                    borderCollapse: 'collapse',
                    border: '1px solid #ddd',
                    minWidth: '100%',
                  }}
                />
              </div>
            ),
            td: ({ ...props }) => (
              <td
                {...props}
                style={{
                  ...props.style,
                  padding: '8px',
                  border: '1px solid #ddd',
                  minWidth: '120px',
                }}
              />
            ),
          }}
        >
          {props.children}
        </ReactMarkdown>
      </div>
    </ShadowView>
  );
};

export default MarkdownView;

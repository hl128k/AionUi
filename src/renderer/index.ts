/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PropsWithChildren } from 'react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../adapter/browser';
import Main from './main';

import { ConfigProvider } from '@arco-design/web-react';
import '@arco-design/web-react/dist/css/arco.css';
import enUS from '@arco-design/web-react/es/locale/en-US'; // 英文
import jaJP from '@arco-design/web-react/es/locale/ja-JP'; // 日文
import zhCN from '@arco-design/web-react/es/locale/zh-CN'; // 中文（简体）
import zhTW from '@arco-design/web-react/es/locale/zh-TW'; // 中文（繁体）
import { useTranslation } from 'react-i18next';
import 'uno.css';
import './i18n';
import './index.css';
import { ThemeProvider } from './themes';
import HOC from './utils/HOC';
const root = createRoot(document.getElementById('root'));

const Config: React.FC<PropsWithChildren> = (props) => {
  const {
    i18n: { language },
  } = useTranslation();
  return React.createElement(
    ConfigProvider,
    {
      theme: {
        primaryColor: '#4E5969',
      },
      locale: language === 'zh-CN' ? zhCN : language === 'zh-TW' ? zhTW : language === 'ja-JP' ? jaJP : enUS,
    },
    props.children
  );
};

// 包装 ThemeProvider 的组件
const AppWithTheme: React.FC<PropsWithChildren> = ({ children }) => {
  return React.createElement(ThemeProvider, { children });
};

root.render(React.createElement(HOC(AppWithTheme)(HOC(Config)(Main))));

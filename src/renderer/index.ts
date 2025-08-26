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
import './themes/simple-theme.css'; // 导入简化主题样式
import HOC from './utils/HOC';

const root = createRoot(document.getElementById('root'));

const Config: React.FC<PropsWithChildren> = (props) => {
  const {
    i18n: { language },
  } = useTranslation();
  return React.createElement(
    ConfigProvider,
    {
      locale: language === 'zh-CN' ? zhCN : language === 'zh-TW' ? zhTW : language === 'ja-JP' ? jaJP : enUS,
    },
    props.children
  );
};

// 简化版渲染，移除复杂的主题包装
root.render(React.createElement(HOC(Config)(Main)));

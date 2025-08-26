/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SimpleThemeProvider } from '@/renderer/themes/simple-provider';
import Layout from './layout';
import Router from './router';
import Sider from './sider';

const Main = () => {
  return (
    <SimpleThemeProvider
      defaultTheme='auto'
      onThemeChange={(theme) => {
        console.log('Theme changed:', theme.name);
      }}
    >
      <Router layout={<Layout sider={<Sider></Sider>}></Layout>}></Router>
    </SimpleThemeProvider>
  );
};

export default Main;
